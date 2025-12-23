import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BugList from '../components/qa/BugList';
import CreateBug from '../components/qa/CreateBug';
import { bugService } from '../services/bugService';

const QATracker = () => {
  const navigate = useNavigate();
  const [bugs, setBugs] = useState([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterProject, setFilterProject] = useState('all');
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [bugStats, setBugStats] = useState({
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0,
    closed: 0,
    critical: 0,
    high: 0,
  });
  
  // Load bugs from Supabase
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Load bugs
        const bugsData = await bugService.getBugs();
        setBugs(bugsData);
        
        // Load projects
        const projectsData = await bugService.getProjects();
        setProjects(projectsData);
        
        // Load stats
        const statsData = await bugService.getBugStats();
        setBugStats(statsData);
      } catch (err) {
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);
  
  // Handle modal animation and body scroll
  useEffect(() => {
    if (isCreateModalOpen) {
      document.body.style.overflow = 'hidden';
      setTimeout(() => setModalVisible(true), 10);
    } else {
      document.body.style.overflow = 'unset';
      setModalVisible(false);
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isCreateModalOpen]);
  
  const handleBugClick = (bug) => {
    navigate(`/devportal/qa/${bug.id}`);
  };
  
  const handleCreateBug = () => {
    setIsCreateModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsCreateModalOpen(false);
  };
  
  // FIXED: Don't create the bug here - just handle the created bug
  const handleSubmitBug = async (createdBug) => {
    try {
      // The bug is already created by CreateBug component
      // Just add it to our local state
      setBugs(prev => [createdBug, ...prev]);
      
      // Update stats
      const newStats = {
        ...bugStats,
        total: bugStats.total + 1,
        // Update status count
        ...(createdBug.status === 'open' && { open: bugStats.open + 1 }),
        ...(createdBug.status === 'in-progress' && { inProgress: bugStats.inProgress + 1 }),
        ...(createdBug.status === 'resolved' && { resolved: bugStats.resolved + 1 }),
        ...(createdBug.status === 'closed' && { closed: bugStats.closed + 1 }),
        // Update priority count
        ...(createdBug.priority === 'critical' && { critical: bugStats.critical + 1 }),
        ...(createdBug.priority === 'high' && { high: bugStats.high + 1 }),
      };
      
      setBugStats(newStats);
      
      // Add project to projects list if it's new
      if (createdBug.project && !projects.includes(createdBug.project)) {
        setProjects(prev => [...prev, createdBug.project]);
      }
      
      // Close modal
      setIsCreateModalOpen(false);
      
    } catch (err) {
      console.error('Error handling created bug:', err);
      alert('Failed to add bug to list.');
    }
  };
  
  // Sort bugs: critical and open at top, closed at bottom
  const sortBugs = (bugsArray) => {
    return [...bugsArray].sort((a, b) => {
      // First sort by status: open/in-progress first, then resolved, then closed
      const statusOrder = {
        'open': 1,
        'in-progress': 2,
        'resolved': 3,
        'closed': 4
      };
      
      const statusDiff = statusOrder[a.status] - statusOrder[b.status];
      
      if (statusDiff !== 0) return statusDiff;
      
      // Then sort by priority: critical first
      const priorityOrder = {
        'critical': 1,
        'high': 2,
        'medium': 3,
        'low': 4
      };
      
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  };
  
  // Filter bugs based on search and filters
  const filteredBugs = bugs.filter(bug => {
    const matchesSearch = bug.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bug.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (bug.tags && bug.tags.some(tag => 
                           tag.toLowerCase().includes(searchTerm.toLowerCase())
                         ));
    
    const matchesPriority = filterPriority === 'all' || bug.priority === filterPriority;
    const matchesStatus = filterStatus === 'all' || bug.status === filterStatus;
    const matchesProject = filterProject === 'all' || bug.project === filterProject;
    
    return matchesSearch && matchesPriority && matchesStatus && matchesProject;
  });
  
  // Sort the filtered bugs
  const sortedFilteredBugs = sortBugs(filteredBugs);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Loading bugs...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header with Create Button */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">QA Tracker</h1>
            <p className="text-gray-600">Track and manage bugs across all projects</p>
          </div>
          
          {/* Create Bug Button */}
          <button
            onClick={handleCreateBug}
            className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Report Bug
          </button>
        </div>
        
        {/* Bug Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="text-sm text-gray-600 mb-1">Total Bugs</div>
            <div className="text-2xl font-bold text-gray-900">{bugStats.total}</div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <div className="text-sm text-red-600 mb-1">Open</div>
            <div className="text-2xl font-bold text-red-700">{bugStats.open}</div>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="text-sm text-blue-600 mb-1">In Progress</div>
            <div className="text-2xl font-bold text-blue-700">{bugStats.inProgress}</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="text-sm text-green-600 mb-1">Resolved</div>
            <div className="text-2xl font-bold text-green-700">{bugStats.resolved}</div>
          </div>
          <div className="bg-gray-100 p-4 rounded-lg border border-gray-200">
            <div className="text-sm text-gray-600 mb-1">Closed</div>
            <div className="text-2xl font-bold text-gray-700">{bugStats.closed}</div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <div className="text-sm text-red-600 mb-1">Critical</div>
            <div className="text-2xl font-bold text-red-700">{bugStats.critical}</div>
          </div>
        </div>
        
        {/* Filters and Search */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <input
                type="text"
                placeholder="Search bugs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              >
                <option value="all">All Priorities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              >
                <option value="all">All Status</option>
                <option value="open">Open</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
              <select
                value={filterProject}
                onChange={(e) => setFilterProject(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              >
                <option value="all">All Projects</option>
                {projects.map(project => (
                  <option key={project} value={project}>{project}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        
        {/* Bug List */}
        <BugList 
          bugs={sortedFilteredBugs}
          onBugClick={handleBugClick}
        />
      </div>
      
      {/* Create Bug Modal */}
      {isCreateModalOpen && (
        <div 
          className={`
            fixed inset-0 z-[9999] flex items-center justify-center p-4
            transition-opacity duration-300 ease-in-out
            ${modalVisible ? 'opacity-100' : 'opacity-0'}
          `}
          onClick={handleCloseModal}
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
              ${modalVisible ? 'translate-y-0 scale-100' : 'translate-y-4 scale-95'}
            `}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 z-10 bg-white border-b border-gray-200 flex justify-between items-center px-6 py-4">
                <h2 className="text-2xl font-bold text-gray-900">Report a Bug</h2>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600 text-2xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                >
                  ×
                </button>
              </div>
              
              <div className="p-6">
                <CreateBug
                  onSubmit={handleSubmitBug}  // This now receives the ALREADY CREATED bug
                  onCancel={handleCloseModal}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default QATracker;