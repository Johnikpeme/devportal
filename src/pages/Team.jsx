import React, { useState, useEffect } from 'react';
import { 
  Users, Mail, MoreVertical, UserPlus, Search, X, 
  Loader, Check, AlertCircle, Send 
} from 'lucide-react';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Dropdown from '../components/common/Dropdown';
import { supabase } from '@/services/supabaseClient';

// Import avatar images
import avatar1 from '../assets/avatars/avatar1.png';
import avatar2 from '../assets/avatars/avatar2.png';
import avatar3 from '../assets/avatars/avatar3.png';
import avatar4 from '../assets/avatars/avatar4.png';
import avatar5 from '../assets/avatars/avatar5.png';
import avatar6 from '../assets/avatars/avatar6.png';
import avatar7 from '../assets/avatars/avatar7.png';
import avatar8 from '../assets/avatars/avatar8.png';
import avatar9 from '../assets/avatars/avatar9.png';
import avatar10 from '../assets/avatars/avatar10.png';
import avatar11 from '../assets/avatars/avatar11.png';
import avatar12 from '../assets/avatars/avatar12.png';
import avatar13 from '../assets/avatars/avatar13.png';
import avatar14 from '../assets/avatars/avatar14.png';
import avatar15 from '../assets/avatars/avatar15.png';
import avatar16 from '../assets/avatars/avatar16.png';
import avatar17 from '../assets/avatars/avatar17.png';
import avatar18 from '../assets/avatars/avatar18.png';
import avatar19 from '../assets/avatars/avatar19.png';
import avatar20 from '../assets/avatars/avatar20.png';

const Team = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Invite modal states
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [sendingInvite, setSendingInvite] = useState(false);
  const [inviteStatus, setInviteStatus] = useState({ show: false, type: '', message: '' });
  const [inviteEmail, setInviteEmail] = useState('');
  
  // Create a mapping of avatar names to imported images
  const avatarMap = {
    avatar1,
    avatar2,
    avatar3,
    avatar4,
    avatar5,
    avatar6,
    avatar7,
    avatar8,
    avatar9,
    avatar10,
    avatar11,
    avatar12,
    avatar13,
    avatar14,
    avatar15,
    avatar16,
    avatar17,
    avatar18,
    avatar19,
    avatar20,
  };
  
  // Fetch team members from Supabase
  useEffect(() => {
    fetchTeamMembers();
  }, []);
  
  // Handle modal animation
  useEffect(() => {
    if (isInviteModalOpen) {
      document.body.style.overflow = 'hidden';
      setTimeout(() => setModalVisible(true), 10);
    } else {
      document.body.style.overflow = 'unset';
      setModalVisible(false);
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isInviteModalOpen]);
  
  // Auto-hide status messages
  useEffect(() => {
    if (inviteStatus.show) {
      const timer = setTimeout(() => {
        setInviteStatus({ show: false, type: '', message: '' });
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [inviteStatus.show]);
  
  const fetchTeamMembers = async () => {
    try {
      setLoading(true);
      
      // First, get all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (profilesError) throw profilesError;
      
      // Then, get all projects to see which members are assigned where
      const { data: projects, error: projectsError } = await supabase
        .from('projects')
        .select('id, name, team_members, code_name');
      
      if (projectsError) throw projectsError;
      
      // Create a map of profile IDs to their assigned project names
      const profileProjectsMap = {};
      projects.forEach(project => {
        if (project.team_members && Array.isArray(project.team_members)) {
          project.team_members.forEach(profileId => {
            if (!profileProjectsMap[profileId]) {
              profileProjectsMap[profileId] = [];
            }
            profileProjectsMap[profileId].push({
              name: project.name,
              codeName: project.code_name,
              projectId: project.id
            });
          });
        }
      });
      
      // Transform to match original design
      const transformedMembers = profiles.map(profile => ({
        id: profile.id,
        name: profile.name || 'Team Member',
        email: profile.email || 'No email',
        role: profile.role || 'developer',
        title: getTitleFromRole(profile.role),
        // Get projects from the map we created
        projects: profileProjectsMap[profile.id] || [],
        status: 'Active',
        joinedAt: new Date(profile.created_at).toLocaleDateString('en-US'),
        avatarUrl: profile.avatar_url
      }));
      
      setTeamMembers(transformedMembers);
    } catch (err) {
      console.error('Error fetching team:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const getTitleFromRole = (role) => {
    const titles = {
      superuser: 'Lead Developer',
      developer: 'Game Developer',
      designer: 'Art Director',
      qa: 'QA Lead'
    };
    return titles[role] || 'Team Member';
  };
  
  // Function to get avatar image based on avatar_url
  const getAvatarImage = (avatarUrl) => {
    if (avatarUrl && avatarMap[avatarUrl]) {
      return avatarMap[avatarUrl];
    }
    return null;
  };
  
  const filteredMembers = teamMembers.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.title.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const getRoleBadgeColor = (role) => {
    const colors = {
      superuser: 'error',
      developer: 'primary',
      designer: 'info',
      qa: 'success',
    };
    return colors[role] || 'default';
  };
  
  // Function to handle sending email
  const handleSendEmail = (email) => {
    if (email && email !== 'No email') {
      window.location.href = `mailto:${email}`;
    } else {
      alert('No email address available for this member');
    }
  };
  
  // Open invite modal
  const openInviteModal = () => {
    setIsInviteModalOpen(true);
    setInviteEmail('');
    setInviteStatus({ show: false, type: '', message: '' });
  };
  
  // Close invite modal
  const closeInviteModal = () => {
    setIsInviteModalOpen(false);
  };
  
  // Send invitation
  const sendInvitation = async () => {
    // Basic email validation
    if (!inviteEmail) {
      setInviteStatus({
        show: true,
        type: 'error',
        message: 'Please enter an email address'
      });
      return;
    }
    
    // Check if email ends with @dashstudios.tech
    if (!inviteEmail.endsWith('@dashstudios.tech')) {
      setInviteStatus({
        show: true,
        type: 'error',
        message: 'Only @dashstudios.tech emails are allowed'
      });
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inviteEmail)) {
      setInviteStatus({
        show: true,
        type: 'error',
        message: 'Please enter a valid email address'
      });
      return;
    }
    
    try {
      setSendingInvite(true);
      
      // Check if email already exists in profiles
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', inviteEmail)
        .single();
      
      if (existingUser) {
        setInviteStatus({
          show: true,
          type: 'error',
          message: 'This email is already registered'
        });
        return;
      }
      
      // Create sign-up link - they'll go to login page
      const signupLink = `${window.location.origin}/login`;
      
      // Generate a random password for the invitation (they can change it later)
      const tempPassword = Math.random().toString(36).slice(-8);
      
      // Create user in auth table (if you have Supabase Auth setup)
      // Note: You need to have Supabase Auth enabled for this
      try {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: inviteEmail,
          password: tempPassword,
          options: {
            data: {
              role: 'developer', // Default role
              name: 'New User',
              invited: true
            },
            emailRedirectTo: `${window.location.origin}/login`
          }
        });
        
        if (authError) {
          console.error('Auth error:', authError);
          // If auth fails, at least create a profile record
          const { error: profileError } = await supabase
            .from('profiles')
            .insert([
              {
                email: inviteEmail,
                name: 'Invited User',
                role: 'developer',
                status: 'pending',
                avatar_url: null
              }
            ]);
          
          if (profileError) {
            throw profileError;
          }
        }
      } catch (authErr) {
        console.log('Auth might not be set up, creating profile only:', authErr);
      }
      
      // For now, just show success with manual instructions
      setInviteStatus({
        show: true,
        type: 'success',
        message: `Invitation created for ${inviteEmail}. `
      });
      
      // Clear email field
      setInviteEmail('');
      
    } catch (err) {
      console.error('Error sending invitation:', err);
      setInviteStatus({
        show: true,
        type: 'error',
        message: 'Failed to create invitation. Please try again.'
      });
    } finally {
      setSendingInvite(false);
    }
  };
  
  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
  <div>
    <h1 className="text-3xl font-bold text-gray-900 mb-2">Team</h1>
    <p className="text-gray-600">Manage team members and permissions</p>
  </div>
  <Button 
    variant="primary" 
    icon={UserPlus}
    onClick={openInviteModal}
    className="w-full sm:w-auto"
  >
    Invite Member
  </Button>
</div>
        
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Search team members..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={Search}
            fullWidth
          />
        </div>
        
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader className="w-8 h-8 animate-spin text-gray-600 mr-2" />
            <p>Loading team members...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMembers.map((member) => {
              const avatarImage = getAvatarImage(member.avatarUrl);
              
              return (
                <Card key={member.id}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                      {avatarImage ? (
                        <img 
                          src={avatarImage} 
                          alt={member.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-primary text-white flex items-center justify-center font-bold text-2xl">
                          {member.name[0]}
                        </div>
                      )}
                    </div>
                    <Dropdown
                      trigger={
                        <button className="text-gray-400 hover:text-gray-600">
                          <MoreVertical className="w-5 h-5" />
                        </button>
                      }
                      items={[
                        { 
                          label: 'View Profile', 
                          icon: Users, 
                          onClick: () => {} 
                        },
                        { 
                          label: 'Send Message', 
                          icon: Mail, 
                          onClick: () => handleSendEmail(member.email) 
                        },
                        { 
                          label: 'Edit Permissions', 
                          onClick: () => {} 
                        },
                      ]}
                      align="right"
                    />
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{member.name}</h3>
                  <p className="text-sm text-gray-600 mb-3">{member.title}</p>
                  
                  <div className="flex items-center gap-2 mb-4">
                    <Badge variant={getRoleBadgeColor(member.role)} size="sm">
                      {member.role}
                    </Badge>
                    <Badge variant="success" size="sm">
                      {member.status}
                    </Badge>
                    <Badge variant="info" size="sm">
                      {member.projects.length} project{member.projects.length !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail className="w-4 h-4" />
                      <span 
                        className="truncate cursor-pointer hover:text-primary hover:underline"
                        onClick={() => handleSendEmail(member.email)}
                        title="Click to send email"
                      >
                        {member.email}
                      </span>
                    </div>
                    <div>
                      <p className="text-gray-600 mb-1">Projects:</p>
                      <div className="flex flex-wrap gap-1">
                        {member.projects.length > 0 ? (
                          member.projects.map((project, idx) => (
                            <span 
                              key={idx} 
                              className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs cursor-pointer hover:bg-blue-50 hover:text-blue-700 transition"
                              onClick={() => window.location.href = `/projects/${project.projectId}`}
                              title={`Go to ${project.name}`}
                            >
                              {project.codeName || project.name}
                            </span>
                          ))
                        ) : (
                          <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded text-xs italic">
                            No projects assigned
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
      
      {/* Simple Invite Modal */}
      {isInviteModalOpen && (
        <div 
          className={`
            fixed inset-0 z-[9999] flex items-center justify-center p-4
            transition-opacity duration-300 ease-in-out
            ${modalVisible ? 'opacity-100' : 'opacity-0'}
          `}
          onClick={closeInviteModal}
        >
          {/* Darkened backdrop with blur */}
          <div 
            className="absolute inset-0 bg-black/75 backdrop-blur-sm"
            style={{ backdropFilter: 'blur(8px)' }}
          />
          
          {/* Modal Content */}
          <div 
            className={`
              relative bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden
              transform transition-all duration-300 ease-in-out
              ${modalVisible ? 'translate-y-0 scale-100' : 'translate-y-4 scale-95'}
            `}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Invite Team Member</h2>
                <button
                  onClick={closeInviteModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {/* Status Message */}
              {inviteStatus.show && (
                <div className={`mb-4 p-3 rounded-lg ${
                  inviteStatus.type === 'success' 
                    ? 'bg-green-50 text-green-700 border border-green-200' 
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  <div className="flex items-center gap-2">
                    {inviteStatus.type === 'success' ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <AlertCircle className="w-4 h-4" />
                    )}
                    <span className="text-sm">{inviteStatus.message}</span>
                  </div>
                </div>
              )}
              
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Enter an @dashstudios.tech email to invite someone to the dev portal
                </p>
                
                <div>
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="username@dashstudios.tech"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    disabled={sendingInvite}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Only @dashstudios.tech emails are allowed
                  </p>
                </div>
                
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    onClick={closeInviteModal}
                    disabled={sendingInvite}
                    className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={sendInvitation}
                    disabled={sendingInvite || !inviteEmail}
                    className="px-4 py-2 bg-black text-white text-sm rounded-lg hover:bg-gray-800 disabled:opacity-50 flex items-center gap-2"
                  >
                    {sendingInvite ? (
                      <>
                        <Loader className="w-4 h-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Create Invite
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Team;