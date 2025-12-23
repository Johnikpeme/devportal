import React, { useState, useEffect } from 'react';
import { User, X, Loader2 } from 'lucide-react';
import Button from '../common/Button';
import { supabase } from '@/services/supabaseClient';

const ReassignBug = ({ bug, onReassign, onCancel }) => {
  const [assignee, setAssignee] = useState(bug.assignedTo);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        setLoading(true);
        // Changed 'full_name' to 'name' to match your working ProjectDetailPage
        const { data, error } = await supabase
          .from('profiles')
          .select('id, name, role') 
          .order('name', { ascending: true });

        if (error) throw error;
        
        if (data) {
          setTeamMembers(data);
        }
      } catch (error) {
        console.error('Error fetching team members:', error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTeamMembers();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    onReassign(bug.id, assignee);
  };
  
  return (
    <div 
      className="relative bg-white rounded-lg shadow-2xl w-full max-w-md border border-gray-200"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 flex justify-between items-center px-6 py-4">
        <h2 className="text-xl font-bold text-gray-900">Reassign Bug</h2>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600 text-2xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      
      <div className="p-6">
        <div className="mb-6">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Bug Title</p>
          <h3 className="font-medium text-gray-900 mb-2">{bug.title}</h3>
          <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-2 rounded-md">
            <User className="w-4 h-4 text-gray-400" />
            <span>Current:</span>
            <span className="font-semibold text-gray-800">{bug.assignedTo}</span>
          </div>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Assignee
            </label>
            <div className="relative">
              <select
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none appearance-none disabled:bg-gray-50"
                required
                disabled={loading}
              >
                {loading ? (
                  <option>Loading members...</option>
                ) : (
                  <>
                    <option value="">Select a team member</option>
                    {teamMembers.map((member) => (
                      <option key={member.id} value={member.name}>
                        {member.name} {member.role ? `(${member.role})` : ''}
                      </option>
                    ))}
                  </>
                )}
              </select>
              {loading && (
                <div className="absolute right-3 top-2.5">
                  <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                </div>
              )}
            </div>
          </div>
          
          <div className="flex gap-3 justify-end">
            <Button 
              type="button"
              variant="outline" 
              onClick={onCancel}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              variant="primary"
              disabled={loading}
            >
              Reassign
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReassignBug;