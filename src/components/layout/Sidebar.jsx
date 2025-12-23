import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, FolderKanban, Bug, FileText, 
  Users, Settings, LogOut, X 
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { classNames } from '@/utils/helpers';
import { supabase } from '@/services/supabaseClient';

// Import avatar images
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

// Import the logo
import Logo from '@/assets/logo.png';

const Sidebar = ({ isMobileOpen, setIsMobileOpen }) => {
  const { user, logout } = useAuth();
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const avatarMap = {
    avatar1, avatar2, avatar3, avatar4, avatar5, avatar6, avatar7, avatar8, avatar9, avatar10,
    avatar11, avatar12, avatar13, avatar14, avatar15, avatar16, avatar17, avatar18, avatar19, avatar20,
  };
  
  // FIXED: Removed /devportal prefix from all paths
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { id: 'projects', label: 'Projects', icon: FolderKanban, path: '/projects' },
    { id: 'qa', label: 'QA Tracker', icon: Bug, path: '/qa' },
    { id: 'docs', label: 'Documentation', icon: FileText, path: '/docs' },
    { id: 'team', label: 'Team', icon: Users, path: '/team' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
  ];
  
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        if (user?.email) {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('email', user.email)
            .single();
          
          if (error) console.error('Error fetching user profile:', error);
          else if (data) setUserProfile(data);
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    };
    
    if (user) fetchUserProfile();
  }, [user]);
  
  const getAvatarImage = (avatarUrl) => (avatarUrl && avatarMap[avatarUrl]) ? avatarMap[avatarUrl] : null;
  
  const getDisplayName = () => userProfile?.name || user?.name || user?.email?.split('@')[0] || 'User';
  
  const getDisplayRole = () => userProfile?.role || user?.role || 'developer';
  
  const getAvatarElement = () => {
    if (userProfile?.avatar_url) {
      const avatarImage = getAvatarImage(userProfile.avatar_url);
      if (avatarImage) {
        return <img src={avatarImage} alt={getDisplayName()} className="w-full h-full object-cover" />;
      }
    }
    const initial = getDisplayName()[0].toUpperCase();
    return <div className="w-full h-full flex items-center justify-center font-semibold text-white">{initial}</div>;
  };

  return (
    <>
      {isMobileOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={() => setIsMobileOpen(false)} />
      )}
      
      <aside className={classNames(
        'fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 lg:transform-none',
        isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )}>
        <div className="h-full flex flex-col">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-16 h-12 bg-primary rounded-lg flex items-center justify-center overflow-hidden">
                <img src={Logo} alt="Dash Studios Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <h2 className="font-bold text-gray-900 text-sm">Dash Studios</h2>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider">Dev Portal</p>
              </div>
            </div>
            <button onClick={() => setIsMobileOpen(false)} className="lg:hidden text-gray-500 hover:text-gray-700">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {menuItems.map(item => (
              <NavLink
                key={item.id}
                to={item.path}
                // Use 'end' for the root path so Dashboard isn't always highlighted
                end={item.path === '/'}
                onClick={() => setIsMobileOpen(false)}
                className={({ isActive }) => classNames(
                  'flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition text-left w-full',
                  isActive ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-50'
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </NavLink>
            ))}
          </nav>
          
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-black text-white overflow-hidden flex items-center justify-center font-semibold border border-gray-100">
                {loading ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> : getAvatarElement()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 text-sm truncate">{loading ? 'Loading...' : getDisplayName()}</p>
                <p className="text-xs text-gray-500 capitalize truncate">{loading ? '...' : getDisplayRole()}</p>
              </div>
            </div>
            <button onClick={logout} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition font-medium border border-gray-100">
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;