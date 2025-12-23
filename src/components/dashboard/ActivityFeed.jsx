import React, { useState, useEffect } from 'react';
import { 
  FolderKanban, Bug, User, FileText, 
  Edit, Plus, Trash2, CheckCircle, 
  AlertCircle, Calendar, MessageSquare,
  GitPullRequest, Upload, Users, Clock,
  Loader, AlertCircle as AlertCircleIcon
} from 'lucide-react';
import { supabase } from '@/services/supabaseClient';

const ActivityFeed = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch recent activities
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get recent activities from Supabase
        const { data, error: fetchError } = await supabase
          .from('activity_log')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(8);
        
        if (fetchError) {
          // Check if table doesn't exist
          if (fetchError.code === '42P01') { // Table doesn't exist
            setError('Activity log table not found. Please run the SQL setup in Supabase.');
          } else {
            setError(`Error: ${fetchError.message}`);
          }
          setActivities([]);
          return;
        }
        
        setActivities(data || []);
      } catch (err) {
        console.error('Error fetching activities:', err);
        setError('Failed to load activities. Please try again.');
        setActivities([]);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();

    // Set up real-time subscription if table exists
    let subscription;
    if (!error) {
      subscription = supabase
        .channel('activity_log_channel')
        .on('postgres_changes', 
          { event: 'INSERT', schema: 'public', table: 'activity_log' }, 
          (payload) => {
            // Add new activity to the top, keep only 8
            setActivities(prev => [payload.new, ...prev.slice(0, 7)]);
          }
        )
        .subscribe();
    }

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [error]);

  // Get icon based on action and table
  const getActivityIcon = (activity) => {
    const { action, table_name } = activity;
    
    if (table_name === 'projects') {
      if (action === 'created') return <Plus className="w-4 h-4 text-green-600" />;
      if (action === 'updated') return <Edit className="w-4 h-4 text-blue-600" />;
      if (action === 'deleted') return <Trash2 className="w-4 h-4 text-red-600" />;
      return <FolderKanban className="w-4 h-4 text-purple-600" />;
    }
    
    if (table_name === 'bugs') {
      if (action === 'created') return <Bug className="w-4 h-4 text-red-600" />;
      if (action === 'resolved') return <CheckCircle className="w-4 h-4 text-green-600" />;
      if (action === 'updated') return <Edit className="w-4 h-4 text-blue-600" />;
      return <AlertCircle className="w-4 h-4 text-yellow-600" />;
    }
    
    if (table_name === 'profiles') {
      if (action === 'created') return <User className="w-4 h-4 text-green-600" />;
      if (action === 'invited') return <Users className="w-4 h-4 text-blue-600" />;
      return <User className="w-4 h-4 text-gray-600" />;
    }
    
    if (table_name === 'comments') {
      return <MessageSquare className="w-4 h-4 text-blue-600" />;
    }
    
    if (table_name === 'documents') {
      return <FileText className="w-4 h-4 text-green-600" />;
    }
    
    return <Clock className="w-4 h-4 text-gray-600" />;
  };

  // Format timestamp
  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return 'Just now';
    
    const now = new Date();
    const past = new Date(timestamp);
    const diffMs = now - past;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return past.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Get user initials for avatar
  const getUserInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Get user color for avatar
  const getUserColor = (email) => {
    const colors = [
      'bg-blue-100 text-blue-800',
      'bg-green-100 text-green-800',
      'bg-purple-100 text-purple-800',
      'bg-yellow-100 text-yellow-800',
      'bg-pink-100 text-pink-800',
      'bg-indigo-100 text-indigo-800',
    ];
    
    if (!email) return colors[0];
    const hash = email.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4" />
              <div className="h-2 bg-gray-200 rounded animate-pulse w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertCircleIcon className="w-5 h-5 text-yellow-600" />
            <div>
              <p className="text-sm font-medium text-yellow-800">Activity Log Not Set Up</p>
              <p className="text-xs text-yellow-700 mt-1">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-2 text-xs text-yellow-800 hover:text-yellow-900 underline"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
        <div className="text-center py-8">
          <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">No recent activity</p>
          <p className="text-xs text-gray-400 mt-1">Activities will appear here as users make changes</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
      
      <div className="space-y-3">
        {activities.map((activity) => (
          <div 
            key={activity.id} 
            className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
          >
            {/* User Avatar */}
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${getUserColor(activity.user_email)}`}>
              {getUserInitials(activity.user_name)}
            </div>
            
            {/* Activity Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">
                      {activity.user_name}
                    </span>
                    {' '}
                    <span className="text-gray-700">
                      {activity.description}
                    </span>
                  </p>
                </div>
                <div className="ml-2 flex-shrink-0">
                  {getActivityIcon(activity)}
                </div>
              </div>
              
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-gray-500">
                  {formatTimeAgo(activity.created_at)}
                </span>
                {activity.table_name && (
                  <>
                    <span className="text-gray-300">•</span>
                    <span className="text-xs text-gray-500 capitalize">
                      {activity.table_name.replace('_', ' ')}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <button
        onClick={() => window.location.reload()}
        className="w-full text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 py-2 rounded-lg transition-colors"
      >
        Refresh activity
      </button>
    </div>
  );
};

export default ActivityFeed;