import React, { useState, useEffect } from 'react';
import { FolderKanban, Users, AlertCircle, TrendingUp, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import StatsWidget from '../components/dashboard/StatsWidget';
import ProjectCard from '../components/dashboard/ProjectCard';
import ActivityFeed from '../components/dashboard/ActivityFeed';
import QuickActions from '../components/dashboard/QuickActions';
import CreateBug from '../components/qa/CreateBug';
import CreateProject from '../components/projects/CreateProject';
import { projectService } from '../services/projectService';
import { bugService } from '../services/bugService';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/services/supabaseClient';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bugStats, setBugStats] = useState({
    total: 0,
    open: 0,
    critical: 0
  });
  const [userProfile, setUserProfile] = useState(null);
  
  // Modal states
  const [isCreateBugModalOpen, setIsCreateBugModalOpen] = useState(false);
  const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] = useState(false);
  const [isUploadDocModalOpen, setIsUploadDocModalOpen] = useState(false);
  const [modalVisible, setModalVisible] = useState({
    bug: false,
    project: false,
    doc: false
  });

  // Fetch user profile from Supabase
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setProfileLoading(true);
        
        if (user?.email) {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('email', user.email)
            .single();
          
          if (error) {
            console.error('Error fetching user profile:', error);
          } else if (data) {
            setUserProfile(data);
          }
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
      } finally {
        setProfileLoading(false);
      }
    };
    
    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  // Load real data from Supabase
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        
        // Load projects
        const projectsData = await projectService.getProjects();
        const transformedProjects = projectsData.map(project => ({
          id: project.id,
          name: project.name,
          status: project.status,
          platform: project.platform,
          genre: project.genre,
          progress: project.progress,
          team: project.team?.total || 0,
          startDate: project.start_date,
          targetRelease: project.target_release,
          lead: project.lead?.director || project.lead?.producer || Object.values(project.lead || {})[0] || '',
          bugs: project.bugs || { critical: 0, high: 0, medium: 0 },
          description: project.description
        }));

        // Sort projects by progress (highest first) and take top 3
        const sortedProjects = transformedProjects
          .sort((a, b) => b.progress - a.progress)
          .slice(0, 3);

        setProjects(sortedProjects);

        // Load bug stats
        const bugsData = await bugService.getBugs();
        const criticalBugs = bugsData.filter(bug => bug.priority === 'critical');
        const openBugs = bugsData.filter(bug => bug.status === 'open');
        
        setBugStats({
          total: bugsData.length,
          open: openBugs.length,
          critical: criticalBugs.length
        });

        // Calculate average progress
        const avgProgress = transformedProjects.length > 0 
          ? Math.round(transformedProjects.reduce((sum, project) => sum + (project.progress || 0), 0) / transformedProjects.length)
          : 0;

        // Calculate real stats
        const realStats = [
          { 
            label: 'Active Projects', 
            value: transformedProjects.length.toString(), 
            icon: FolderKanban, 
            color: 'blue',
            trend: 'up',
            trendValue: '+0'
          },
          { 
            label: 'Open Bugs', 
            value: openBugs.length.toString(), 
            icon: AlertCircle, 
            color: 'red',
            trend: openBugs.length > 0 ? 'up' : 'down',
            trendValue: openBugs.length > 0 ? `+${openBugs.length}` : '-0'
          },
          { 
            label: 'Critical Bugs', 
            value: criticalBugs.length.toString(), 
            icon: AlertCircle, 
            color: 'red',
            trend: criticalBugs.length > 0 ? 'up' : 'down',
            trendValue: criticalBugs.length > 0 ? `+${criticalBugs.length}` : '-0'
          },
          { 
            label: 'Avg. Progress', 
            value: `${avgProgress}%`, 
            icon: TrendingUp, 
            color: 'purple',
            trend: 'up',
            trendValue: '+0%'
          },
        ];

        setStats(realStats);
        setError(null);
      } catch (err) {
        console.error('Error loading dashboard data:', err);
        setError('Failed to load dashboard data. Please try again.');
        
        // Fallback to empty state
        setStats([
          { 
            label: 'Active Projects', 
            value: '0', 
            icon: FolderKanban, 
            color: 'blue',
            trend: 'neutral',
            trendValue: '0'
          },
          { 
            label: 'Open Bugs', 
            value: '0', 
            icon: AlertCircle, 
            color: 'red',
            trend: 'neutral',
            trendValue: '0'
          },
          { 
            label: 'Critical Bugs', 
            value: '0', 
            icon: AlertCircle, 
            color: 'red',
            trend: 'neutral',
            trendValue: '0'
          },
          { 
            label: 'Avg. Progress', 
            value: '0%', 
            icon: TrendingUp, 
            color: 'purple',
            trend: 'neutral',
            trendValue: '0%'
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  // Handle modal animation and body scroll for bug modal
  useEffect(() => {
    if (isCreateBugModalOpen) {
      document.body.style.overflow = 'hidden';
      setTimeout(() => setModalVisible(prev => ({ ...prev, bug: true })), 10);
    } else {
      document.body.style.overflow = 'unset';
      setModalVisible(prev => ({ ...prev, bug: false }));
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isCreateBugModalOpen]);

  // Handle modal animation and body scroll for project modal
  useEffect(() => {
    if (isCreateProjectModalOpen) {
      document.body.style.overflow = 'hidden';
      setTimeout(() => setModalVisible(prev => ({ ...prev, project: true })), 10);
    } else {
      document.body.style.overflow = 'unset';
      setModalVisible(prev => ({ ...prev, project: false }));
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isCreateProjectModalOpen]);

  // Handle modal animation and body scroll for doc modal
  useEffect(() => {
    if (isUploadDocModalOpen) {
      document.body.style.overflow = 'hidden';
      setTimeout(() => setModalVisible(prev => ({ ...prev, doc: true })), 10);
    } else {
      document.body.style.overflow = 'unset';
      setModalVisible(prev => ({ ...prev, doc: false }));
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isUploadDocModalOpen]);

  // Function to get user's first name
  const getUserFirstName = () => {
    if (userProfile?.name) {
      const firstName = userProfile.name.split(' ')[0];
      return firstName;
    }
    if (user?.name) {
      const firstName = user.name.split(' ')[0];
      return firstName;
    }
    if (user?.email) {
      const firstName = user.email.split('@')[0];
      return firstName;
    }
    return 'there';
  };

  const handleQuickAction = (actionId) => {
    switch (actionId) {
      case 'project':
        setIsCreateProjectModalOpen(true);
        break;
      case 'bug':
        setIsCreateBugModalOpen(true);
        break;
      case 'document':
        setIsUploadDocModalOpen(true);
        break;
      case 'member':
        navigate('/devportal/team?action=invite');
        break;
      default:
        break;
    }
  };

  const handleCloseBugModal = () => {
    setIsCreateBugModalOpen(false);
  };

  const handleCloseProjectModal = () => {
    setIsCreateProjectModalOpen(false);
  };

  const handleCloseDocModal = () => {
    setIsUploadDocModalOpen(false);
  };

  const handleBugCreated = (createdBug) => {
    // Update bug stats
    setBugStats(prev => ({
      ...prev,
      total: prev.total + 1,
      open: createdBug.status === 'open' ? prev.open + 1 : prev.open,
      critical: createdBug.priority === 'critical' ? prev.critical + 1 : prev.critical
    }));
    
    // Update stats display
    setStats(prev => prev.map(stat => {
      if (stat.label === 'Open Bugs' && createdBug.status === 'open') {
        return {
          ...stat,
          value: (parseInt(stat.value) + 1).toString(),
          trend: 'up',
          trendValue: `+${parseInt(stat.trendValue.replace('+', '')) + 1}`
        };
      }
      if (stat.label === 'Critical Bugs' && createdBug.priority === 'critical') {
        return {
          ...stat,
          value: (parseInt(stat.value) + 1).toString(),
          trend: 'up',
          trendValue: `+${parseInt(stat.trendValue.replace('+', '')) + 1}`
        };
      }
      return stat;
    }));
    
    handleCloseBugModal();
  };

  const handleProjectCreated = (createdProject) => {
    // Add to projects list
    const projectToAdd = {
      id: createdProject.id,
      name: createdProject.name,
      status: createdProject.status,
      platform: createdProject.platform,
      genre: createdProject.genre,
      progress: createdProject.progress,
      team: createdProject.team?.total || 0,
      startDate: createdProject.start_date,
      targetRelease: createdProject.target_release,
      lead: createdProject.lead?.director || createdProject.lead?.producer || Object.values(createdProject.lead || {})[0] || '',
      bugs: createdProject.bugs || { critical: 0, high: 0, medium: 0 },
      description: createdProject.description
    };
    
    setProjects(prev => [projectToAdd, ...prev].slice(0, 3));
    
    // Update stats
    setStats(prev => prev.map(stat => {
      if (stat.label === 'Active Projects') {
        return {
          ...stat,
          value: (parseInt(stat.value) + 1).toString(),
          trend: 'up',
          trendValue: `+${parseInt(stat.trendValue.replace('+', '')) + 1}`
        };
      }
      if (stat.label === 'Avg. Progress') {
        const newAvg = Math.round((prev.find(s => s.label === 'Avg. Progress').value.replace('%', '') * 
          (projects.length) + createdProject.progress) / (projects.length + 1));
        return {
          ...stat,
          value: `${newAvg}%`,
          trendValue: `+${newAvg - parseInt(stat.value.replace('%', ''))}%`
        };
      }
      return stat;
    }));
    
    handleCloseProjectModal();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-600" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">
          {profileLoading ? (
            'Welcome back! Here\'s what\'s happening with your projects.'
          ) : (
            `Welcome back, ${getUserFirstName()}! Here's what's happening with your projects.`
          )}
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <StatsWidget key={idx} {...stat} />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Projects - Takes 2 columns */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Top Projects by Progress</h2>
            <button 
              onClick={() => navigate('/devportal/projects')}
              className="text-primary hover:text-primary-600 font-medium text-sm"
            >
              View All →
            </button>
          </div>

          {projects.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <FolderKanban className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No projects yet</h3>
              <p className="text-gray-600 mb-4">Create your first project to get started</p>
              <button
                onClick={() => setIsCreateProjectModalOpen(true)}
                className="inline-flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors font-medium"
              >
                Create Project
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <QuickActions onAction={handleQuickAction} />
          <ActivityFeed />
        </div>
      </div>

      {/* Create Bug Modal */}
      {isCreateBugModalOpen && (
        <div 
          className={`
            fixed inset-0 z-[9999] flex items-center justify-center p-4
            transition-opacity duration-300 ease-in-out
            ${modalVisible.bug ? 'opacity-100' : 'opacity-0'}
          `}
          onClick={handleCloseBugModal}
        >
          {/* Darkened backdrop with blur */}
          <div 
            className="absolute inset-0 bg-black/75 backdrop-blur-sm"
            style={{ backdropFilter: 'blur(8px)' }}
          />
          
          {/* Modal Content */}
          <div 
            className={`
              relative bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden
              transform transition-all duration-300 ease-in-out
              ${modalVisible.bug ? 'translate-y-0 scale-100' : 'translate-y-4 scale-95'}
            `}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 z-10 bg-white border-b border-gray-200 flex justify-between items-center px-6 py-4">
                <h2 className="text-2xl font-bold text-gray-900">Report a Bug</h2>
                <button
                  onClick={handleCloseBugModal}
                  className="text-gray-400 hover:text-gray-600 text-2xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                >
                  ×
                </button>
              </div>
              
              <div className="p-6">
                <CreateBug
                  onSubmit={handleBugCreated}
                  onCancel={handleCloseBugModal}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Project Modal */}
      {isCreateProjectModalOpen && (
        <div 
          className={`
            fixed inset-0 z-[9999] flex items-center justify-center p-4
            transition-opacity duration-300 ease-in-out
            ${modalVisible.project ? 'opacity-100' : 'opacity-0'}
          `}
          onClick={handleCloseProjectModal}
        >
          <div 
            className="absolute inset-0 bg-gray-900/95 backdrop-blur-sm"
            style={{ backdropFilter: 'blur(8px)' }}
          />
          
          <div 
            className={`
              relative bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-gray-200
              transform transition-all duration-300 ease-in-out
              ${modalVisible.project ? 'translate-y-0 scale-100' : 'translate-y-4 scale-95'}
            `}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 z-10 bg-white border-b border-gray-200 flex justify-between items-center px-6 py-4">
                <h2 className="text-2xl font-bold text-gray-900">Create New Project</h2>
                <button
                  onClick={handleCloseProjectModal}
                  className="text-gray-400 hover:text-gray-600 text-2xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                >
                  ×
                </button>
              </div>
              
              <div className="p-6">
                <CreateProject 
                  onClose={handleCloseProjectModal}
                  onProjectCreated={handleProjectCreated}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Document Modal */}
      {isUploadDocModalOpen && (
        <div 
          className={`
            fixed inset-0 z-[9999] flex items-center justify-center p-4
            transition-opacity duration-300 ease-in-out
            ${modalVisible.doc ? 'opacity-100' : 'opacity-0'}
          `}
          onClick={handleCloseDocModal}
        >
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleCloseDocModal}
          />
          
          <div 
            className={`
              relative transform overflow-hidden rounded-lg bg-white shadow-xl transition-all w-full max-w-md
              transform transition-all duration-300 ease-in-out
              ${modalVisible.doc ? 'translate-y-0 scale-100' : 'translate-y-4 scale-95'}
            `}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Upload Document</h3>
                <button
                  onClick={handleCloseDocModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              <p className="text-sm text-gray-600 mb-6">
                This feature is available in the Documentation page. Please navigate to the Documentation section to upload documents.
              </p>

              <div className="flex justify-end gap-3">
                <button
                  onClick={handleCloseDocModal}
                  className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    handleCloseDocModal();
                    navigate('/devportal/docs');
                  }}
                  className="px-4 py-2 bg-black text-white text-sm rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Go to Documentation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;