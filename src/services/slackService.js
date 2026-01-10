// services/slackService.js
import { supabase } from './supabaseClient';

class SlackService {
  /**
   * Send a direct message via Supabase Edge Function
   */
  async sendDirectMessage(userId, message) {
    try {
      const { data, error } = await supabase.functions.invoke('slack-notification', {
        body: {
          userId: userId,
          message: message,
          type: 'dm'
        }
      });

      if (error) {
        console.error('❌ Edge Function Error:', error);
        return false;
      }
      return true;
    } catch (error) {
      console.error('❌ Critical Error sending Slack message:', error);
      return false;
    }
  }

  /**
   * Create formatted notification with COLORS
   */
  createBugNotificationPayload(bug, notificationType) {
    const bugUrl = `${window.location.origin}/qa/${bug.id}`;
    const bugId = `BUG-${bug.id.toString().padStart(4, '0')}`;
    const priorityEmojis = { critical: '🔴', high: '🟠', medium: '🟡', low: '🟢' };
    
    // 🎨 Define styles for each notification type
    const styles = {
      'new_bug': {
        color: '#E01E5A', // Red
        title: '🐛 New Bug Reported',
        text: `A new bug has been reported in *${bug.project}*.`
      },
      'assigned': {
        color: '#2EB67D', // Green
        title: '👉 Bug Assigned to You',
        text: `You have been assigned to a bug in *${bug.project}*.`
      },
      'reassigned': {
        color: '#36C5F0', // Blue
        title: '🔄 Bug Reassigned to You',
        text: `A bug has been reassigned to you.`
      },
      'status_changed': {
        color: '#ECB22E', // Orange
        title: '📊 Status Changed',
        text: `Status updated to *${bug.status?.toUpperCase()}*.`
      },
      'comment_added': {
        color: '#4A154B', // Purple
        title: '💬 New Comment',
        text: `New comment added to bug.`
      },
      'updated': {
        color: '#808080', // Grey
        title: '✏️ Bug Updated',
        text: `Bug details have been updated.`
      }
    };

    const style = styles[notificationType] || styles['updated'];

    // We use "attachments" to get the color bar on the left
    return {
      text: `${style.title}: ${bug.title}`, // Fallback notification text
      attachments: [
        {
          color: style.color,
          blocks: [
            {
              type: 'header',
              text: { type: 'plain_text', text: style.title, emoji: true }
            },
            {
              type: 'section',
              text: { 
                type: 'mrkdwn', 
                text: `${style.text}\n*<${bugUrl}|${bugId}: ${bug.title}>*\n` +
                      `${priorityEmojis[bug.priority] || '⚪'} Priority: *${bug.priority?.toUpperCase()}* |  Status: *${bug.status?.toUpperCase()}*` 
              }
            },
            {
              type: 'actions',
              elements: [{ type: 'button', text: { type: 'plain_text', text: 'View Details' }, url: bugUrl, style: 'primary' }]
            }
          ]
        }
      ]
    };
  }

  async sendBugNotification(userId, bug, notificationType) {
    // Generate the colored payload
    const payload = this.createBugNotificationPayload(bug, notificationType);
    
    // Send it
    return await this.sendDirectMessage(userId, {
      text: payload.text,     // Main text
      attachments: payload.attachments // Colored attachment
    });
  }
}

export const slackService = new SlackService();