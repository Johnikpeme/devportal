import React, { useState, useEffect } from 'react';
import { Mail, MoreVertical } from 'lucide-react';
import Card from '../common/Card';
import Badge from '../common/Badge';
import Dropdown from '../common/Dropdown';
import { supabase } from '@/services/supabaseClient';

const TeamMembers = ({ projectId }) => {
  const [allProfiles, setAllProfiles] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    fetchProfiles();
    loadExistingTeam();
  }, []);

  const fetchProfiles = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*');
    
    if (!error && data) {
      setAllProfiles(data);
    }
  };

  const loadExistingTeam = async () => {
    const { data, error } = await supabase
      .from('projects')
      .select('team_members')
      .eq('id', projectId)
      .single();
    
    if (!error && data?.team_members) {
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', data.team_members);
      
      if (!profileError && profiles) {
        setSelectedMembers(profiles);
      }
    }
  };

  const saveTeamMembers = async (members) => {
    try {
      const memberIds = members.map(m => m.id);
      
      const { error } = await supabase
        .from('projects')
        .update({ 
          team_members: memberIds,
          team: memberIds.length
        })
        .eq('id', projectId);
      
      if (error) throw error;
    } catch (err) {
      console.error('Error saving team:', err);
    }
  };

  const toggleMember = (profile) => {
    setSelectedMembers(prev => {
      const exists = prev.find(m => m.id === profile.id);
      let newMembers;
      if (exists) {
        newMembers = prev.filter(m => m.id !== profile.id);
      } else {
        newMembers = [...prev, profile];
      }
      saveTeamMembers(newMembers);
      return newMembers;
    });
  };

  const removeMember = (memberId) => {
    setSelectedMembers(prev => {
      const newMembers = prev.filter(m => m.id !== memberId);
      saveTeamMembers(newMembers);
      return newMembers;
    });
  };

  const isMemberSelected = (profileId) => {
    return selectedMembers.some(m => m.id === profileId);
  };

  return (
    <div className="space-y-6">
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Breakdown</h3>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Team Members
          </label>
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="w-full px-4 py-2 text-left border border-gray-300 rounded-lg hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {selectedMembers.length > 0 
                ? `${selectedMembers.length} member${selectedMembers.length > 1 ? 's' : ''} selected`
                : 'Choose team members...'}
            </button>
            
            {showDropdown && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {allProfiles.map(profile => (
                  <label 
                    key={profile.id} 
                    className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={isMemberSelected(profile.id)}
                      onChange={() => toggleMember(profile)}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold text-sm">
                      {profile.name?.[0] || 'U'}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{profile.name}</p>
                      <p className="text-xs text-gray-500">{profile.role || 'Team Member'}</p>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Total Team</p>
            <p className="text-3xl font-bold text-gray-900">{selectedMembers.length}</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Department Breakdown</p>
            <p className="text-3xl font-bold text-gray-900">{selectedMembers.length}</p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {selectedMembers.map((member) => (
          <Card key={member.id} padding="md">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-semibold text-lg flex-shrink-0">
                {member.name?.[0] || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-1">
                  <h4 className="font-semibold text-gray-900">{member.name}</h4>
                  <Dropdown
                    trigger={
                      <button className="text-gray-400 hover:text-gray-600">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    }
                    items={[
                      { label: 'View Profile', onClick: () => {} },
                      { label: 'Send Message', onClick: () => {} },
                      { 
                        label: 'Remove from Project', 
                        onClick: () => removeMember(member.id)
                      },
                    ]}
                    align="right"
                  />
                </div>
                <p className="text-sm text-gray-600 mb-2">{member.role || 'Team Member'}</p>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Mail className="w-4 h-4" />
                  <span className="truncate">{member.email || 'No email'}</span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TeamMembers;