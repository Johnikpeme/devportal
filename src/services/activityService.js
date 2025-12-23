import { supabase } from '@/services/supabaseClient';

export const activityService = {
  // Log an activity
  logActivity: async (activityData) => {
    try {
      const { error } = await supabase
        .from('activity_log')
        .insert([activityData]);
      
      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Error logging activity:', err);
      return false;
    }
  },

  // Get recent activities (last 8)
  getRecentActivities: async (limit = 8) => {
    try {
      const { data, error } = await supabase
        .from('activity_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error fetching activities:', err);
      return [];
    }
  },

  // Log project activity
  logProjectActivity: async (user, project, action, metadata = {}) => {
    return activityService.logActivity({
      user_email: user?.email || 'system',
      user_name: user?.name || 'System',
      action,
      table_name: 'projects',
      record_id: project?.id,
      description: `${action} project "${project?.name || 'Unknown'}"`,
      metadata: {
        project_name: project?.name,
        project_id: project?.id,
        ...metadata
      }
    });
  },

  // Log bug activity
  logBugActivity: async (user, bug, action, metadata = {}) => {
    return activityService.logActivity({
      user_email: user?.email || 'system',
      user_name: user?.name || 'System',
      action,
      table_name: 'bugs',
      record_id: bug?.id,
      description: `${action} bug "${bug?.title || 'Unknown'}"`,
      metadata: {
        bug_title: bug?.title,
        bug_id: bug?.id,
        ...metadata
      }
    });
  },

  // Log user activity
  logUserActivity: async (user, targetUser, action, metadata = {}) => {
    return activityService.logActivity({
      user_email: user?.email || 'system',
      user_name: user?.name || 'System',
      action,
      table_name: 'profiles',
      record_id: targetUser?.id,
      description: `${action} user "${targetUser?.name || targetUser?.email || 'Unknown'}"`,
      metadata: {
        target_user_email: targetUser?.email,
        target_user_name: targetUser?.name,
        ...metadata
      }
    });
  }
};