import React, { useState, useEffect } from 'react';
import { User, Bell, Shield, Palette, Globe, Save, Loader, X } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Tabs from '../components/common/Tabs';
import { supabase } from '@/services/supabaseClient';
import { useAuth } from '@/hooks/useAuth';

// Import all 20 avatar images from assets folder
import avatar1 from '@/assets/avatars/avatar1.png';
import avatar2 from '@/assets/avatars/avatar2.png';
import avatar3 from '@/assets/avatars/avatar3.png';
import avatar4 from '@/assets/avatars/avatar4.png';
import avatar5 from '@/assets/avatars/avatar5.png';
import avatar6 from '@/assets/avatars/avatar6.png';
import avatar7 from '@/assets/avatars/avatar7.png';
import avatar8 from '@/assets/avatars/avatar8.png';
import avatar9 from '@/assets/avatars/avatar9.png';
import avatar10 from '@/assets/avatars/avatar10.png';
import avatar11 from '@/assets/avatars/avatar11.png';
import avatar12 from '@/assets/avatars/avatar12.png';
import avatar13 from '@/assets/avatars/avatar13.png';
import avatar14 from '@/assets/avatars/avatar14.png';
import avatar15 from '@/assets/avatars/avatar15.png';
import avatar16 from '@/assets/avatars/avatar16.png';
import avatar17 from '@/assets/avatars/avatar17.png';
import avatar18 from '@/assets/avatars/avatar18.png';
import avatar19 from '@/assets/avatars/avatar19.png';
import avatar20 from '@/assets/avatars/avatar20.png';

const AVATAR_OPTIONS = [
  { id: 1, key: 'avatar1', image: avatar1 },
  { id: 2, key: 'avatar2', image: avatar2 },
  { id: 3, key: 'avatar3', image: avatar3 },
  { id: 4, key: 'avatar4', image: avatar4 },
  { id: 5, key: 'avatar5', image: avatar5 },
  { id: 6, key: 'avatar6', image: avatar6 },
  { id: 7, key: 'avatar7', image: avatar7 },
  { id: 8, key: 'avatar8', image: avatar8 },
  { id: 9, key: 'avatar9', image: avatar9 },
  { id: 10, key: 'avatar10', image: avatar10 },
  { id: 11, key: 'avatar11', image: avatar11 },
  { id: 12, key: 'avatar12', image: avatar12 },
  { id: 13, key: 'avatar13', image: avatar13 },
  { id: 14, key: 'avatar14', image: avatar14 },
  { id: 15, key: 'avatar15', image: avatar15 },
  { id: 16, key: 'avatar16', image: avatar16 },
  { id: 17, key: 'avatar17', image: avatar17 },
  { id: 18, key: 'avatar18', image: avatar18 },
  { id: 19, key: 'avatar19', image: avatar19 },
  { id: 20, key: 'avatar20', image: avatar20 },
];

// Create a mapping object for quick lookup
const avatarMap = AVATAR_OPTIONS.reduce((map, option) => {
  map[option.key] = option.image;
  return map;
}, {});

const Settings = () => {
  const { user, profile } = useAuth();
  const [settingsProfile, setSettingsProfile] = useState({
    name: '',
    email: '',
    role: '',
    avatar_url: '',
  });
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState({ state: '', message: '' });
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  
  useEffect(() => {
    if (profile && user) {
      setSettingsProfile({
        name: profile.name || user.user_metadata?.name || '',
        email: user.email || '',
        role: profile.role || '',
        avatar_url: profile.avatar_url || '',
      });
    }
  }, [profile, user]);
  
  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      setSaveStatus({ state: '', message: '' });
      
      if (!user?.id) {
        throw new Error('User not authenticated');
      }
      
      console.log('Updating profile with:', {
        name: settingsProfile.name,
        role: settingsProfile.role,
        avatar_url: settingsProfile.avatar_url,
      });
      
      const { data, error } = await supabase
        .from('profiles')
        .update({
          name: settingsProfile.name,
          role: settingsProfile.role,
          avatar_url: settingsProfile.avatar_url,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)
        .select();
      
      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      console.log('Profile update successful:', data);
      setSaveStatus({ 
        state: 'success', 
        message: 'Profile saved successfully' 
      });
      setTimeout(() => setSaveStatus({ state: '', message: '' }), 3000);
    } catch (err) {
      console.error('Error saving profile:', err);
      setSaveStatus({ 
        state: 'error', 
        message: `Failed to save profile: ${err.message}` 
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleAvatarSelect = (avatarKey) => {
    setSettingsProfile({ ...settingsProfile, avatar_url: avatarKey });
    setShowAvatarModal(false);
  };
  
  const tabs = [
    {
      label: 'Profile',
      content: (
        <ProfileSettings 
          profile={settingsProfile} 
          setProfile={setSettingsProfile}
          onSave={handleSaveProfile}
          loading={loading}
          saveStatus={saveStatus}
          onAvatarClick={() => setShowAvatarModal(true)}
        />
      ),
    },
    {
      label: 'Notifications',
      content: <NotificationSettings />,
    },
    {
      label: 'Security',
      content: <SecuritySettings />,
    },
    {
      label: 'Preferences',
      content: <PreferencesSettings />,
    },
  ];
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600">Manage your account and preferences</p>
      </div>
      
      <Card>
        <Tabs tabs={tabs} />
      </Card>
      
      {showAvatarModal && (
        <AvatarModal 
          currentAvatar={settingsProfile.avatar_url}
          onSelect={handleAvatarSelect}
          onClose={() => setShowAvatarModal(false)}
        />
      )}
    </div>
  );
};

const AvatarModal = ({ currentAvatar, onSelect, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 backdrop-blur-md" 
        onClick={onClose}
      />
      
      <div 
        className="relative bg-white shadow-2xl w-full max-w-xs sm:max-w-md mx-auto"
        style={{ 
          borderRadius: '24px',
          padding: '1.5rem sm:2rem',
          border: '4px solid #1f2937'
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.5rem sm:0.75rem' }}>
          {AVATAR_OPTIONS.map((avatar) => (
            <button
              key={avatar.id}
              onClick={() => onSelect(avatar.key)}
              className={`w-full aspect-square rounded-full overflow-hidden transition-all duration-200 hover:scale-110 ${
                currentAvatar === avatar.key 
                  ? 'border-3 border-blue-500 ring-4 ring-blue-500/30 shadow-lg scale-105' 
                  : 'border-3 border-gray-200 hover:border-blue-400 hover:shadow-md'
              }`}
            >
              <img 
                src={avatar.image} 
                alt={`Avatar ${avatar.id}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const ProfileSettings = ({ profile, setProfile, onSave, loading, saveStatus, onAvatarClick }) => {
  const getAvatarImage = () => {
    if (profile.avatar_url && avatarMap[profile.avatar_url]) {
      return avatarMap[profile.avatar_url];
    }
    return null;
  };
  
  const avatarImage = getAvatarImage();
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-6">
        <div className="relative">
          {avatarImage ? (
            <>
              <div className="w-24 h-24 rounded-full overflow-hidden border-3 border-gray-200 shadow-sm">
                <img 
                  src={avatarImage} 
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              </div>
              <button
                onClick={onAvatarClick}
                className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors shadow-lg"
                title="Change avatar"
              >
                <User className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <div className="w-24 h-24 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-3xl">
                {profile.name[0] || 'U'}
              </div>
              <button
                onClick={onAvatarClick}
                className="absolute -bottom-2 -right-2 bg-gray-700 text-white p-2 rounded-full hover:bg-gray-800 transition-colors shadow-lg"
                title="Select avatar"
              >
                <User className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
        <div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={onAvatarClick}
          >
            {avatarImage ? 'Change Avatar' : 'Select Avatar'}
          </Button>
          <p className="text-sm text-gray-500 mt-2">
            
          </p>
          {avatarImage && (
            <p className="text-xs text-gray-400 mt-1">
              
            </p>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Full Name"
          value={profile.name}
          onChange={(e) => setProfile({ ...profile, name: e.target.value })}
          fullWidth
          placeholder="Enter your full name"
        />
        <Input
          label="Email"
          type="email"
          value={profile.email}
          disabled
          fullWidth
          helperText="Email cannot be changed"
        />
        <Input
          label="Job Title / Role"
          value={profile.role}
          onChange={(e) => setProfile({ ...profile, role: e.target.value })}
          fullWidth
          placeholder="e.g., Lead Developer"
        />
      </div>
      
      <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
        {saveStatus.state === 'success' && (
          <span className="text-green-600 text-sm flex items-center gap-1">
            <Save className="w-4 h-4" /> {saveStatus.message}
          </span>
        )}
        {saveStatus.state === 'error' && (
          <span className="text-red-600 text-sm">{saveStatus.message}</span>
        )}
        <Button 
          variant="ghost" 
          onClick={() => window.location.reload()}
        >
          Cancel
        </Button>
        <Button 
          variant="primary" 
          onClick={onSave}
          disabled={loading || !profile.name.trim()}
        >
          {loading ? (
            <>
              <Loader className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </Button>
      </div>
    </div>
  );
};

const NotificationSettings = () => {
  const [notifications, setNotifications] = useState({
    projectUpdates: true,
    bugReports: true,
    teamMentions: true,
    milestoneCompletions: true,
    documentUpdates: false,
  });

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <NotificationToggle
          label="Project Updates"
          description="Get notified when projects are updated"
          enabled={notifications.projectUpdates}
          onChange={() => setNotifications(prev => ({ ...prev, projectUpdates: !prev.projectUpdates }))}
        />
        <NotificationToggle
          label="Bug Reports"
          description="Receive alerts for new bugs in your projects"
          enabled={notifications.bugReports}
          onChange={() => setNotifications(prev => ({ ...prev, bugReports: !prev.bugReports }))}
        />
        <NotificationToggle
          label="Team Mentions"
          description="Get notified when someone mentions you"
          enabled={notifications.teamMentions}
          onChange={() => setNotifications(prev => ({ ...prev, teamMentions: !prev.teamMentions }))}
        />
        <NotificationToggle
          label="Milestone Completions"
          description="Alerts when milestones are completed"
          enabled={notifications.milestoneCompletions}
          onChange={() => setNotifications(prev => ({ ...prev, milestoneCompletions: !prev.milestoneCompletions }))}
        />
        <NotificationToggle
          label="Document Updates"
          description="Get notified when documents are modified"
          enabled={notifications.documentUpdates}
          onChange={() => setNotifications(prev => ({ ...prev, documentUpdates: !prev.documentUpdates }))}
        />
      </div>
      
      <div className="pt-6 border-t border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Email Preferences</h3>
        <div className="space-y-3">
          <label className="flex items-center gap-3">
            <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />
            <span className="text-sm text-gray-700">Daily summary emails</span>
          </label>
          <label className="flex items-center gap-3">
            <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />
            <span className="text-sm text-gray-700">Weekly reports</span>
          </label>
          <label className="flex items-center gap-3">
            <input type="checkbox" className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />
            <span className="text-sm text-gray-700">Marketing emails</span>
          </label>
        </div>
      </div>
    </div>
  );
};

const NotificationToggle = ({ label, description, enabled, onChange }) => {
  return (
    <div className="flex items-start justify-between p-4 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition-colors">
      <div className="flex-1 pr-4">
        <p className="font-medium text-gray-900">{label}</p>
        <p className="text-sm text-gray-600 mt-1">{description}</p>
      </div>
      <div className="flex items-center">
        <button
          onClick={onChange}
          className={`
            relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full
            transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 
            focus:ring-blue-500 focus:ring-offset-2 border-2 border-transparent
            ${enabled 
              ? 'bg-blue-600' 
              : 'bg-gray-300'
            }
          `}
          role="switch"
          aria-checked={enabled}
        >
          <span
            aria-hidden="true"
            className={`
              pointer-events-none inline-block h-5 w-5 transform rounded-full
              bg-white shadow-lg ring-0 transition duration-200 ease-in-out
              ${enabled ? 'translate-x-5' : 'translate-x-0'}
            `}
          />
        </button>
      </div>
    </div>
  );
};

const SecuritySettings = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const { user } = useAuth();

  const handlePasswordChange = async () => {
    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      setMessage({ type: 'error', text: 'Please fill in all fields' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    if (newPassword.length < 8) {
      setMessage({ type: 'error', text: 'Password must be at least 8 characters' });
      return;
    }

    try {
      setLoading(true);
      setMessage({ type: '', text: '' });

      // First, verify the current password by signing in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword
      });

      if (signInError) {
        if (signInError.message.includes('Invalid login credentials')) {
          setMessage({ type: 'error', text: 'Current password is incorrect' });
        } else {
          setMessage({ type: 'error', text: signInError.message });
        }
        return;
      }

      // If current password is correct, update to new password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) {
        setMessage({ type: 'error', text: updateError.message });
        return;
      }

      // Success - clear fields and show success message
      setMessage({ 
        type: 'success', 
        text: 'Password updated successfully!' 
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      // Clear success message after 3 seconds
      setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 3000);

    } catch (err) {
      console.error('Error updating password:', err);
      setMessage({ type: 'error', text: 'An unexpected error occurred' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h3>
        <p className="text-sm text-gray-600 mb-4">
          Update your password to keep your account secure
        </p>
        
        <div className="space-y-4">
          <Input
            label="Current Password"
            type="password"
            placeholder="Enter your current password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            fullWidth
          />
          <Input
            label="New Password"
            type="password"
            placeholder="Enter your new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            helperText="Must be at least 8 characters"
            fullWidth
          />
          <Input
            label="Confirm New Password"
            type="password"
            placeholder="Confirm your new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            fullWidth
          />
        </div>

        {message.text && (
          <div 
            className={`mt-4 p-3 rounded-lg text-sm ${
              message.type === 'success' 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="flex justify-end mt-6">
          <Button 
            variant="primary" 
            onClick={handlePasswordChange}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader className="w-4 h-4 mr-2 animate-spin" />
                Updating...
              </>
            ) : (
              'Update Password'
            )}
          </Button>
        </div>
      </div>

      {/* Session Management Section (Optional - you can keep or remove) */}
      <div className="pt-6 border-t border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Sessions</h3>
        <p className="text-sm text-gray-600 mb-4">
          Manage your active login sessions
        </p>
        <Button 
          variant="outline" 
          onClick={async () => {
            await supabase.auth.signOut();
            window.location.href = '/login';
          }}
        >
          Sign Out All Sessions
        </Button>
      </div>
    </div>
  );
};

const PreferencesSettings = () => {
  const [theme, setTheme] = useState('Light');
  const [language, setLanguage] = useState('English');
  const [timezone, setTimezone] = useState('UTC-8 (Pacific Time)');
  const [displayPrefs, setDisplayPrefs] = useState({
    showProgress: true,
    showActivity: true,
    compactView: false,
  });

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Theme
        </label>
        <select 
          className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          value={theme}
          onChange={(e) => setTheme(e.target.value)}
        >
          <option>Light</option>
          <option>Dark</option>
          <option>System</option>
        </select>
        <p className="text-sm text-gray-500 mt-2">Choose how Dash Studios looks to you</p>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Language
        </label>
        <select 
          className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
        >
          <option>English</option>
          <option>Spanish</option>
          <option>French</option>
          <option>German</option>
          <option>Japanese</option>
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Timezone
        </label>
        <select 
          className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          value={timezone}
          onChange={(e) => setTimezone(e.target.value)}
        >
          <option>UTC-8 (Pacific Time)</option>
          <option>UTC-5 (Eastern Time)</option>
          <option>UTC+0 (London)</option>
          <option>UTC+1 (Central Europe)</option>
          <option>UTC+8 (Singapore)</option>
        </select>
      </div>
      
      <div className="pt-6 border-t border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Display Preferences</h3>
        <div className="space-y-3">
          <label className="flex items-center gap-3">
            <input 
              type="checkbox" 
              checked={displayPrefs.showProgress}
              onChange={(e) => setDisplayPrefs(prev => ({ ...prev, showProgress: e.target.checked }))}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" 
            />
            <span className="text-sm text-gray-700">Show project progress on dashboard</span>
          </label>
          <label className="flex items-center gap-3">
            <input 
              type="checkbox" 
              checked={displayPrefs.showActivity}
              onChange={(e) => setDisplayPrefs(prev => ({ ...prev, showActivity: e.target.checked }))}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" 
            />
            <span className="text-sm text-gray-700">Display recent activity feed</span>
          </label>
          <label className="flex items-center gap-3">
            <input 
              type="checkbox" 
              checked={displayPrefs.compactView}
              onChange={(e) => setDisplayPrefs(prev => ({ ...prev, compactView: e.target.checked }))}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" 
            />
            <span className="text-sm text-gray-700">Compact view mode</span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default Settings;