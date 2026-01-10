// services/notificationService.js
import { supabase } from './supabaseClient';
import { slackService } from './slackService';

class NotificationService {
  constructor() {
    // 🧠 Memory to store recent notifications for deduplication
    this.recentNotifications = new Map();
  }

  /**
   * Check if a notification is a duplicate (sent within last 5 seconds)
   * @param {string} userId - Slack User ID
   * @param {string|number} bugId - The Bug ID
   * @param {string} type - Notification type (e.g., 'reassigned')
   * @returns {boolean} True if duplicate
   */
  isDuplicate(userId, bugId, type) {
    const key = `${userId}-${bugId}-${type}`;
    const now = Date.now();
    const COOLDOWN_MS = 5000; // 5 seconds block

    // Check if we have a recent record
    const lastTime = this.recentNotifications.get(key);
    
    // If sent recently, block it
    if (lastTime && (now - lastTime < COOLDOWN_MS)) {
      console.warn(`⚠️ Blocked duplicate notification: ${key}`);
      return true;
    }

    // Otherwise, allow it and record the time
    this.recentNotifications.set(key, now);
    
    // Cleanup memory: If map gets too big, clear it
    if (this.recentNotifications.size > 100) {
      this.recentNotifications.clear();
    }
    
    return false;
  }

  /**
   * Get or create Slack user ID mapping for a profile
   */
  async getSlackUserId(email, profileId) {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('slack_user_id')
        .eq('id', profileId)
        .single();

      if (profile?.slack_user_id) return profile.slack_user_id;

      const slackUser = await slackService.lookupUserByEmail(email);
      if (slackUser?.id) {
        await supabase
          .from('profiles')
          .update({ slack_user_id: slackUser.id })
          .eq('id', profileId);
        return slackUser.id;
      }
      return null;
    } catch (error) {
      console.error('Error getting Slack user ID:', error);
      return null;
    }
  }

  /**
   * Get Slack user ID from a name
   */
  async getSlackUserIdByName(name) {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, email, slack_user_id')
        .eq('name', name)
        .maybeSingle();

      if (!profile) return null;
      if (profile.slack_user_id) return profile.slack_user_id;

      return await this.getSlackUserId(profile.email, profile.id);
    } catch (error) {
      console.error('Error getting Slack user ID by name:', error);
      return null;
    }
  }

  /**
   * Get all team members involved in a project
   */
  async getProjectTeamMembers(projectName) {
    try {
      const { data: project } = await supabase
        .from('projects')
        .select('team_members')
        .eq('name', projectName)
        .single();

      if (!project?.team_members?.length) return [];

      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, name, email, slack_user_id')
        .in('id', project.team_members);

      return profiles || [];
    } catch (error) {
      console.error('Error getting project team members:', error);
      return [];
    }
  }

  /**
   * Notify when a new bug is created
   */
  async notifyNewBug(bug, currentUserName) {
    try {
      const notifications = [];
      const notifiedUserIds = new Set();

      // 1. Notify Assignee
      if (bug.assignedTo && bug.assignedTo !== 'Unassigned' && bug.assignedTo !== currentUserName) {
        const slackId = await this.getSlackUserIdByName(bug.assignedTo);
        if (slackId && !this.isDuplicate(slackId, bug.id, 'new_bug')) {
          notifications.push({ userId: slackId, type: 'assigned' });
          notifiedUserIds.add(slackId);
        }
      }

      // 2. Notify Team
      const teamMembers = await this.getProjectTeamMembers(bug.project);
      for (const member of teamMembers) {
        const slackId = member.slack_user_id || await this.getSlackUserId(member.email, member.id);
        
        if (slackId && !notifiedUserIds.has(slackId)) {
          if (!this.isDuplicate(slackId, bug.id, 'new_bug')) {
            notifications.push({ userId: slackId, type: 'new_bug' });
            notifiedUserIds.add(slackId);
          }
        }
      }

      if (notifications.length === 0) return 0;

      const results = await Promise.allSettled(
        notifications.map(({ userId, type }) =>
          slackService.sendBugNotification(userId, bug, type)
        )
      );

      return results.filter(r => r.status === 'fulfilled' && r.value).length;
    } catch (error) {
      console.error('Error notifying new bug:', error);
      return 0;
    }
  }

  /**
   * Notify when a bug is reassigned
   * 🛡️ UPDATED: Includes Duplicate Check
   */
  async notifyReassignment(bug, previousAssignee, newAssignee) {
    try {
      if (!newAssignee || newAssignee === 'Unassigned') return false;

      const newAssigneeSlackId = await this.getSlackUserIdByName(newAssignee);
      
      if (newAssigneeSlackId) {
        // 🔒 DUPLICATE CHECK
        if (this.isDuplicate(newAssigneeSlackId, bug.id, 'reassigned')) {
           return false; // Silently skip
        }

        await slackService.sendBugNotification(newAssigneeSlackId, bug, 'reassigned');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error notifying reassignment:', error);
      return false;
    }
  }

  /**
   * Notify when bug status changes
   */
  async notifyStatusChange(bug, previousStatus) {
    try {
      const notifications = new Set();
      
      const checkAndAdd = async (name) => {
        if (name && name !== 'Unassigned') {
          const id = await this.getSlackUserIdByName(name);
          // 🔒 DUPLICATE CHECK
          if (id && !this.isDuplicate(id, bug.id, 'status_changed')) {
            notifications.add(id);
          }
        }
      };

      await checkAndAdd(bug.assignedTo);
      if (bug.reportedBy !== bug.assignedTo) {
        await checkAndAdd(bug.reportedBy);
      }

      await Promise.all(
        Array.from(notifications).map(userId =>
          slackService.sendBugNotification(userId, bug, 'status_changed')
        )
      );
      return true;
    } catch (error) {
      console.error('Error notifying status change:', error);
      return false;
    }
  }

  /**
   * Notify when a comment is added
   */
  async notifyComment(bug, commenterName) {
    try {
      const notifications = new Set();
      
      const checkAndAdd = async (name) => {
        if (name && name !== 'Unassigned' && name !== commenterName) {
          const id = await this.getSlackUserIdByName(name);
          // 🔒 DUPLICATE CHECK (Using comment type)
          if (id && !this.isDuplicate(id, bug.id, 'comment_added')) {
            notifications.add(id);
          }
        }
      };

      await checkAndAdd(bug.assignedTo);
      if (bug.reportedBy !== bug.assignedTo) {
        await checkAndAdd(bug.reportedBy);
      }

      await Promise.all(
        Array.from(notifications).map(userId =>
          slackService.sendBugNotification(userId, bug, 'comment_added')
        )
      );
      return true;
    } catch (error) {
      console.error('Error notifying comment:', error);
      return false;
    }
  }

  /**
   * Notify when bug is updated
   */
  async notifyUpdate(bug) {
    try {
      if (bug.assignedTo && bug.assignedTo !== 'Unassigned') {
        const slackId = await this.getSlackUserIdByName(bug.assignedTo);
        // 🔒 DUPLICATE CHECK
        if (slackId && !this.isDuplicate(slackId, bug.id, 'updated')) {
          await slackService.sendBugNotification(slackId, bug, 'updated');
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Error notifying update:', error);
      return false;
    }
  }
}

export const notificationService = new NotificationService();