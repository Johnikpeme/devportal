import React, { useState, useEffect } from 'react';
import { Plus, Search, Loader } from 'lucide-react';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import ProjectCard from '../components/dashboard/ProjectCard';
import CreateProject from '../components/projects/CreateProject';
import { projectService } from '../services/projectService';

const ProjectsList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Load projects from Supabase
  useEffect(() => {
    loadProjects();
  }, []);
  
  const loadProjects = async () => {
    try {
      setLoading(true);
      const data = await projectService.getProjects();
      
      // Transform data to match ProjectCard expectations
      const transformedProjects = data.map(project => ({
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
      
      setProjects(transformedProjects);
      setError(null);
    } catch (err) {
      console.error('Error loading projects:', err);
      setError('Failed to load projects. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle search with debouncing
  useEffect(() => {
    const searchProjects = async () => {
      if (searchTerm.trim() === '') {
        loadProjects();
        return;
      }
      
      try {
        setLoading(true);
        const data = await projectService.searchProjects(searchTerm);
        const transformedProjects = data.map(project => ({
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
        
        setProjects(transformedProjects);
      } catch (err) {
        console.error('Error searching projects:', err);
      } finally {
        setLoading(false);
      }
    };
    
    const debounceTimer = setTimeout(searchProjects, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);
  
  // Handle modal animation
  useEffect(() => {
    if (showCreateModal) {
      document.body.style.overflow = 'hidden';
      setTimeout(() => setModalVisible(true), 10);
    } else {
      document.body.style.overflow = 'unset';
      setModalVisible(false);
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showCreateModal]);
  
  const handleCloseModal = () => {
    setShowCreateModal(false);
  };
  
  // Fixed: No longer creates project twice, just adds to local state
  const handleProjectCreated = (createdProject) => {
    try {
      // Transform the created project to match our state structure
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
      
      // Add to local state (at the beginning of the array)
      setProjects(prev => [projectToAdd, ...prev]);
      
      // Close modal - no notification needed
      handleCloseModal();
      
    } catch (err) {
      console.error('Error handling created project:', err);
      // Optional: You could show an error in the modal instead
    }
  };
  
  const filteredProjects = projects.filter(project => {
    if (!project) return false;
    const searchLower = searchTerm.toLowerCase();
    return (
      project.name?.toLowerCase().includes(searchLower) ||
      project.description?.toLowerCase().includes(searchLower) ||
      (Array.isArray(project.genre) ? 
        project.genre.some(g => g?.toLowerCase().includes(searchLower)) :
        project.genre?.toLowerCase().includes(searchLower))
    );
  });
  
  if (loading && projects.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-600" />
          <p className="text-gray-600">Loading projects...</p>
        </div>
      </div>
    );
  }
  
  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Projects</h1>
            <p className="text-gray-600">Manage all game development projects</p>
          </div>
          <Button 
            variant="primary" 
            icon={Plus}
            onClick={() => setShowCreateModal(true)}
          >
            New Project
          </Button>
        </div>
        
        {/* Search */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={Search}
              fullWidth
            />
          </div>
        </div>
        
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
        
        {/* Projects Grid */}
        {loading ? (
          <div className="text-center py-12">
            <Loader className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-600" />
            <p className="text-gray-600">Loading...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
        
        {!loading && filteredProjects.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">No projects found.</p>
            <Button 
              variant="outline" 
              onClick={() => setShowCreateModal(true)}
              className="mt-4"
            >
              Create Your First Project
            </Button>
          </div>
        )}
      </div>
      
      {/* Create Project Modal */}
      {showCreateModal && (
        <div 
          className={`
            fixed inset-0 z-[9999] flex items-center justify-center p-4
            transition-opacity duration-300 ease-in-out
            ${modalVisible ? 'opacity-100' : 'opacity-0'}
          `}
          onClick={handleCloseModal}
        >
          <div 
            className="absolute inset-0 bg-gray-900/95 backdrop-blur-sm"
            style={{ backdropFilter: 'blur(8px)' }}
          />
          
          <div 
            className={`
              relative bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-gray-200
              transform transition-all duration-300 ease-in-out
              ${modalVisible ? 'translate-y-0 scale-100' : 'translate-y-4 scale-95'}
            `}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 z-10 bg-white border-b border-gray-200 flex justify-between items-center px-6 py-4">
                <h2 className="text-2xl font-bold text-gray-900">Create New Project</h2>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600 text-2xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                >
                  ×
                </button>
              </div>
              
              <div className="p-6">
                <CreateProject 
                  onClose={handleCloseModal}
                  onProjectCreated={handleProjectCreated}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProjectsList;