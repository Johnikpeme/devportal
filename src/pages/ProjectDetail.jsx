import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { 
  ChevronLeft, Edit, Save, Upload, Calendar, Users, DollarSign, 
  FileText, Image, Code, Gamepad2, Globe, BarChart, Flag, 
  Package, Bug, Star, Clock, Target, Layers, Music, Video,
  ShoppingCart, TrendingUp, Shield, Cloud, Cpu, Palette,
  Smartphone, Monitor, Tv, Download, ExternalLink, Award,
  Trash2, Plus, X, Check, AlertCircle, BookOpen, Loader,
  Paperclip, AlertOctagon
} from 'lucide-react';
import Breadcrumb from '../components/layout/Breadcrumb';
import { projectService } from '../services/projectService';

const ProjectDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingSection, setEditingSection] = useState(null);
  const [tempData, setTempData] = useState({});
  const [newItem, setNewItem] = useState({});
  const [saveStates, setSaveStates] = useState({}); // Track save states for each section
  const [teamCount, setTeamCount] = useState(0); // Add team count state
  
  // New states for document upload functionality
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [attachmentStatus, setAttachmentStatus] = useState({ show: false, type: '', message: '' });
  const [showDeleteModal, setShowDeleteModal] = useState({ show: false, documentId: null, storagePath: null, name: '' });
  
  // Update the useEffect for loading:
  useEffect(() => {
    const loadProject = async () => {
      try {
        setLoading(true);
        const data = await projectService.getProject(id);
        
        // Fetch team count separately
        const teamCountData = await fetchTeamCount();
        setTeamCount(teamCountData);
        
        // Transform database fields to match your component
        const transformedProject = {
          ...data,
          codeName: data.code_name || '',
          startDate: data.start_date || null,
          targetRelease: data.target_release || null,
          artStyle: data.art_style || {},
          postLaunch: data.post_launch || {},
          // Ensure arrays exist even if null
          genre: data.genre || [],
          platform: data.platform || [],
          milestones: data.milestones || [],
          documents: data.documents || [],
          builds: data.builds || [],
          risks: data.risks || [],
          awards: data.awards || [],
          // Ensure objects exist with default values
          team: data.team || { total: teamCountData, breakdown: {} },
          lead: data.lead || {},
          bugs: data.bugs || { critical: 0, high: 0, medium: 0, low: 0 },
          gameplay: data.gameplay || {
            features: [],
            perspective: '',
            gameplayStyle: '',
            difficultyModes: [],
            estimatedPlaytime: { mainStory: '', completionist: '' }
          },
          technical: data.technical || {
            api: '',
            dlss: false,
            engine: '',
            renderer: '',
            languages: [],
            rayTracing: false,
            resolution: '',
            storageRequired: ''
          },
          audio: data.audio || {
            composer: '',
            languages: 0,
            soundtrack: '',
            voiceActors: 0,
            estimatedMusicTracks: 0
          },
          budget: data.budget || {
            spent: 0,
            total: 0,
            allocated: {},
            remaining: 0,
            pricePoints: { deluxe: 0, standard: 0, collector: 0 },
            projectedRevenue: 0
          }
        };
        
        setProject(transformedProject);
      } catch (err) {
        console.error('Error loading project:', err);
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      loadProject();
    }
  }, [id]);

  // Fetch team count function
  const fetchTeamCount = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('team_members')
        .eq('id', id)
        .single();
      
      if (!error && data?.team_members) {
        return data.team_members.length;
      }
      return 0;
    } catch (err) {
      console.error('Error fetching team count:', err);
      return 0;
    }
  };

  // Refresh team count
  const refreshTeamCount = async () => {
    const count = await fetchTeamCount();
    setTeamCount(count);
    // Also update project state
    setProject(prev => ({
      ...prev,
      team: { ...prev.team, total: count }
    }));
  };

  // Auto-hide attachment status messages
  useEffect(() => {
    if (attachmentStatus.show) {
      const timer = setTimeout(() => {
        setAttachmentStatus({ show: false, type: '', message: '' });
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [attachmentStatus.show]);

  const showAttachmentStatus = (type, message) => {
    setAttachmentStatus({ show: true, type, message });
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-600" />
          <p className="text-gray-600">Loading project...</p>
        </div>
      </div>
    );
  }

  // Show error state if no project
  if (!project) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Project Not Found</h3>
          <p className="text-gray-600 mb-6">The project you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/devportal/projects')}
            className="flex items-center gap-2 text-primary hover:text-primary-600"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Projects
          </button>
        </div>
      </div>
    );
  }
  
  const startEdit = (section, data) => {
    setEditingSection(section);
    setTempData(JSON.parse(JSON.stringify(data || {})));
    setSaveStates(prev => ({ ...prev, [section]: null })); // Reset save state
  };
  
  // Update saveEdit function to show button states instead of alerts
  const saveEdit = async (section) => {
    try {
      // Set saving state
      setSaveStates(prev => ({ ...prev, [section]: 'saving' }));
      
      // Transform data back to database format
      const updates = {};
      if (section === 'description' || section === 'lore' || section === 'awards') {
        updates[section] = tempData;
      } else if (section === 'genre') {
        updates.genre = tempData.genre; 
      } else {
        // Map to database field names
        const fieldMap = {
          'gameplay': 'gameplay',
          'milestones': 'milestones',
          'budget': 'budget',
          'team': 'team',
          'technical': 'technical',
          'platform': 'platform',
          'lead': 'lead',
          'artStyle': 'art_style',
          'audio': 'audio',
          'documents': 'documents',
          'builds': 'builds',
          'postLaunch': 'post_launch',
          'risks': 'risks'
        };
        
        const dbField = fieldMap[section];
        if (dbField) {
          updates[dbField] = tempData;
        }
      }
      
      // Add updated_at timestamp
      updates.updated_at = new Date().toISOString();
      
      await projectService.updateProject(id, updates);
      
      // Update local state
      setProject(prev => ({
        ...prev,
        [section]: tempData
      }));
      
      // Show saved state
      setSaveStates(prev => ({ ...prev, [section]: 'saved' }));
      
      // Clear editing after successful save
      setTimeout(() => {
        setEditingSection(null);
        setTempData({});
        // Reset save state after 2 seconds
        setTimeout(() => {
          setSaveStates(prev => ({ ...prev, [section]: null }));
        }, 2000);
      }, 500);
      
    } catch (err) {
      console.error('Error saving project:', err);
      setSaveStates(prev => ({ ...prev, [section]: 'error' }));
      
      // Reset error state after 3 seconds
      setTimeout(() => {
        setSaveStates(prev => ({ ...prev, [section]: null }));
      }, 3000);
    }
  };
  
  const cancelEdit = () => {
    setEditingSection(null);
    setTempData({});
    setSaveStates(prev => {
      const newStates = { ...prev };
      // Reset all save states when canceling
      Object.keys(newStates).forEach(key => {
        newStates[key] = null;
      });
      return newStates;
    });
  };
  
  const handleInputChange = (field, value, path = '') => {
    if (path) {
      const paths = path.split('.');
      setTempData(prev => {
        const newData = { ...prev };
        let current = newData;
        for (let i = 0; i < paths.length - 1; i++) {
          if (!current[paths[i]]) {
            current[paths[i]] = {};
          }
          current = current[paths[i]];
        }
        current[paths[paths.length - 1]] = value;
        return newData;
      });
    } else {
      setTempData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };
  
  const handleArrayChange = (field, value, index = null) => {
    setTempData(prev => {
      const newArray = Array.isArray(prev[field]) ? [...prev[field]] : [];
      if (index !== null && index >= 0) {
        newArray[index] = value;
      } else {
        newArray.push(value);
      }
      return {
        ...prev,
        [field]: newArray
      };
    });
  };
  
  const removeArrayItem = (field, index) => {
    setTempData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  // Document upload and delete functions
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file || !id) return;

    // Reset the file input
    event.target.value = '';

    try {
      setUploading(true);
      
      // Upload file using projectService
      const updatedProject = await projectService.uploadDocument(id, file);
      
      // Update local project state
      setProject(updatedProject);
      setUploading(false);
      showAttachmentStatus('success', 'Document uploaded successfully');
      
    } catch (err) {
      console.error('Error uploading file:', err);
      setUploading(false);
      
      let errorMessage = 'Failed to upload file. ';
      
      if (err.message.includes('bucket')) {
        errorMessage += 'The storage bucket "project-documents" might not exist.';
      } else if (err.message.includes('policy')) {
        errorMessage += 'Storage policies might not be set correctly.';
      } else if (err.message.includes('size')) {
        errorMessage += 'File is too large (max 50MB).';
      } else {
        errorMessage += 'Please try again.';
      }
      
      showAttachmentStatus('error', errorMessage);
    }
  };

  const handleDeleteDocument = async () => {
    const { documentId, storagePath } = showDeleteModal;
    
    try {
      setDeleting('document');
      
      // Delete document using projectService
      const updatedProject = await projectService.deleteDocument(id, documentId, storagePath);
      
      // Update local project state
      setProject(updatedProject);
      
      setShowDeleteModal({ show: false, documentId: null, storagePath: null, name: '' });
      showAttachmentStatus('success', 'Document deleted successfully');
      
    } catch (err) {
      console.error('Error deleting document:', err);
      showAttachmentStatus('error', 'Failed to delete document');
    } finally {
      setDeleting(null);
    }
  };

  const confirmDeleteDocument = (documentId, storagePath, name) => {
    setShowDeleteModal({ show: true, documentId, storagePath, name });
  };

  const getFileIcon = (fileName) => {
    if (!fileName) return <FileText className="w-4 h-4" />;
    const extension = fileName.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg'].includes(extension)) {
      return <Image className="w-4 h-4" />;
    } else if (['mp4', 'avi', 'mov', 'wmv'].includes(extension)) {
      return <Video className="w-4 h-4" />;
    } else if (['js', 'jsx', 'ts', 'tsx', 'py', 'java', 'cpp', 'c'].includes(extension)) {
      return <Code className="w-4 h-4" />;
    } else if (['pdf'].includes(extension)) {
      return <FileText className="w-4 h-4" />;
    } else {
      return <FileText className="w-4 h-4" />;
    }
  };
  
  const SectionHeader = ({ icon: Icon, title, editable = true, sectionKey }) => {
    const saveState = saveStates[sectionKey];
    let saveButtonText = "Save";
    let saveButtonIcon = <Check className="w-4 h-4" />;
    let saveButtonClass = "flex items-center gap-1.5 text-sm text-white bg-black hover:bg-gray-800 px-4 py-2 rounded-lg transition font-medium shadow-sm";
    
    if (saveState === 'saving') {
      saveButtonText = "Saving...";
      saveButtonIcon = <Loader className="w-4 h-4 animate-spin" />;
      saveButtonClass = "flex items-center gap-1.5 text-sm text-white bg-gray-600 px-4 py-2 rounded-lg font-medium shadow-sm cursor-not-allowed";
    } else if (saveState === 'saved') {
      saveButtonText = "Saved";
      saveButtonIcon = <Check className="w-4 h-4" />;
      saveButtonClass = "flex items-center gap-1.5 text-sm text-white bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg transition font-medium shadow-sm";
    } else if (saveState === 'error') {
      saveButtonText = "Error";
      saveButtonIcon = <AlertCircle className="w-4 h-4" />;
      saveButtonClass = "flex items-center gap-1.5 text-sm text-white bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition font-medium shadow-sm";
    }
    
    return (
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Icon className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
        {editable && !editingSection && (
          <button
            onClick={() => startEdit(sectionKey, project[sectionKey])}
            className="flex items-center gap-1 text-sm text-gray-600 hover:text-primary transition bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg"
          >
            <Edit className="w-4 h-4" />
            Edit
          </button>
        )}
        {editable && editingSection === sectionKey && (
          <div className="flex gap-2">
            <button 
              onClick={() => saveEdit(sectionKey)}
              disabled={saveState === 'saving'}
              className={saveButtonClass}
            >
              {saveButtonIcon}
              {saveButtonText}
            </button>
            <button 
              onClick={cancelEdit}
              disabled={saveState === 'saving'}
              className="flex items-center gap-1 text-sm text-gray-700 bg-gray-200 hover:bg-gray-300 px-3 py-1.5 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
          </div>
        )}
      </div>
    );
  };
  
  const Tag = ({ children, color = "blue", removable = false, onRemove, className = "" }) => {
    const colorClasses = {
      blue: "bg-blue-100 text-blue-800",
      purple: "bg-purple-100 text-purple-800",
      green: "bg-green-100 text-green-800",
      red: "bg-red-100 text-red-800",
      yellow: "bg-yellow-100 text-yellow-800",
      indigo: "bg-indigo-100 text-indigo-800",
      gray: "bg-gray-100 text-gray-800"
    };
    
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${colorClasses[color]} ${className}`}>
        {children}
        {removable && (
          <button 
            onClick={onRemove}
            className="ml-1 hover:opacity-75"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </span>
    );
  };
  
  const StatCard = ({ icon: Icon, label, value, color = "blue" }) => {
    const colorClasses = {
      green: "bg-green-100 text-green-600",
      emerald: "bg-emerald-100 text-emerald-600",
      orange: "bg-orange-100 text-orange-600",
      red: "bg-red-100 text-red-600",
      blue: "bg-blue-100 text-blue-600"
    };
    
    return (
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
            <Icon className={`w-4 h-4`} />
          </div>
          <span className="text-sm text-gray-600">{label}</span>
        </div>
        <p className="text-xl font-bold text-gray-900">{value}</p>
      </div>
    );
  };
  
  const renderEditableField = (label, value, fieldName, path = '', type = 'text') => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {type === 'textarea' ? (
        <textarea
          value={value || ''}
          onChange={(e) => handleInputChange(fieldName, e.target.value, path)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          rows="3"
        />
      ) : type === 'number' ? (
        <input
          type="number"
          value={value || 0}
          onChange={(e) => handleInputChange(fieldName, e.target.value, path)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      ) : (
        <input
          type={type}
          value={value || ''}
          onChange={(e) => handleInputChange(fieldName, e.target.value, path)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      )}
    </div>
  );
  
  const renderEditableTags = (label, tags, fieldName) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="flex flex-wrap gap-2 mb-3">
        {Array.isArray(tags) && tags.map((tag, index) => (
          <Tag key={index} color="blue" removable onRemove={() => removeArrayItem(fieldName, index)}>
            {tag}
          </Tag>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={newItem[fieldName] || ''}
          onChange={(e) => setNewItem({...newItem, [fieldName]: e.target.value})}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
          placeholder="Add new tag..."
        />
        <button
          onClick={() => {
            if (newItem[fieldName]) {
              handleArrayChange(fieldName, newItem[fieldName]);
              setNewItem({ ...newItem, [fieldName]: '' });
            }
          }}
          className="bg-black text-white px-3 py-2 rounded-lg hover:bg-primary-600 transition flex items-center gap-1"
        >
          <Plus className="w-4 h-4" />
          Add
        </button>
      </div>
    </div>
  );
  
  const getPlatformIcon = (platform) => {
    if (!platform) return <Globe className="w-5 h-5 text-gray-500" />;
    
    if (platform.includes('PC') || platform === 'pc') {
      return <Monitor className="w-5 h-5 text-blue-600" />;
    } else if (platform.includes('PlayStation') || platform.includes('ps5')) {
      return <Tv className="w-5 h-5 text-blue-400" />;
    } else if (platform.includes('Xbox') || platform.includes('xbox')) {
      return <Tv className="w-5 h-5 text-green-500" />;
    } else if (platform.includes('Switch') || platform.includes('Nintendo')) {
      return <Smartphone className="w-5 h-5 text-red-500" />;
    } else if (platform.includes('Android') || platform.includes('iOS') || platform.includes('mobile')) {
      return <Smartphone className="w-5 h-5 text-green-500" />;
    } else if (platform.includes('VR') || platform.includes('vr')) {
      return <Video className="w-5 h-5 text-purple-500" />;
    } else if (platform.includes('Cloud') || platform.includes('cloud')) {
      return <Cloud className="w-5 h-5 text-indigo-500" />;
    }
    return <Globe className="w-5 h-5 text-gray-500" />;
  };
  
  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '$0';
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(1)}K`;
    }
    return `$${amount}`;
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Invalid date';
    }
  };
  
  const getDaysToLaunch = () => {
    if (!project?.targetRelease) return 0;
    try {
      const targetDate = new Date(project.targetRelease);
      const today = new Date();
      const diffTime = targetDate - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 0 ? diffDays : 0;
    } catch {
      return 0;
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/devportal/projects')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
        >
          <ChevronLeft className="w-5 h-5" />
          Back to Projects
        </button>
        <button className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition flex items-center gap-2">
          <Upload className="w-4 h-4" />
          Upload Build
        </button>
      </div>
      
      <Breadcrumb 
        items={[
          { label: 'Projects', href: '/devportal/projects' },
          { label: project.name }
        ]}
      />
      
      {/* Project Header */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-800 to-blue-900 rounded-xl p-6 text-black">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-black">{project.name}</h1>
              {project.codeName && (
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm text-black">
                  {project.codeName}
                </span>
              )}
            </div>
            {editingSection === 'description' ? (
              <div className="space-y-4">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={tempData || ''}
                    onChange={(e) => setTempData(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    rows="3"
                  />
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => saveEdit('description')}
                    disabled={saveStates.description === 'saving'}
                    className={`flex items-center gap-2 text-white px-4 py-2 rounded-lg transition-colors ${
                      saveStates.description === 'saving' 
                        ? 'bg-gray-600 cursor-not-allowed' 
                        : saveStates.description === 'saved' 
                        ? 'bg-green-600 hover:bg-green-700' 
                        : saveStates.description === 'error'
                        ? 'bg-red-600 hover:bg-red-700'
                        : 'bg-black hover:bg-gray-800'
                    }`}
                  >
                    {saveStates.description === 'saving' ? (
                      <Loader className="w-4 h-4 animate-spin" />
                    ) : saveStates.description === 'saved' || saveStates.description === null ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <AlertCircle className="w-4 h-4" />
                    )}
                    {saveStates.description === 'saving' 
                      ? 'Saving...' 
                      : saveStates.description === 'saved' 
                      ? 'Saved' 
                      : saveStates.description === 'error'
                      ? 'Error'
                      : 'Save'}
                  </button>
                  <button 
                    onClick={cancelEdit}
                    disabled={saveStates.description === 'saving'}
                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : editingSection === 'genre' ? (
              <div className="space-y-4">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Genres</label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {Array.isArray(tempData) && tempData.map((tag, index) => (
                      <Tag key={index} color="purple" removable onRemove={() => removeArrayItem('genre', index)}>
                        {tag}
                      </Tag>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newItem['genre'] || ''}
                      onChange={(e) => setNewItem({...newItem, ['genre']: e.target.value})}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                      placeholder="Add new genre..."
                    />
                    <button
                      onClick={() => {
                        if (newItem['genre']) {
                          handleArrayChange('genre', newItem['genre']);
                          setNewItem({ ...newItem, ['genre']: '' });
                        }
                      }}
                      className="bg-black text-white px-3 py-2 rounded-lg hover:bg-gray-800 transition flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" />
                      Add
                    </button>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => saveEdit('genre')}
                    disabled={saveStates.genre === 'saving'}
                    className={`flex items-center gap-2 text-white px-4 py-2 rounded-lg transition-colors ${
                      saveStates.genre === 'saving' 
                        ? 'bg-gray-600 cursor-not-allowed' 
                        : saveStates.genre === 'saved' 
                        ? 'bg-green-600 hover:bg-green-700' 
                        : saveStates.genre === 'error'
                        ? 'bg-red-600 hover:bg-red-700'
                        : 'bg-black hover:bg-gray-800'
                    }`}
                  >
                    {saveStates.genre === 'saving' ? (
                      <Loader className="w-4 h-4 animate-spin" />
                    ) : saveStates.genre === 'saved' || saveStates.genre === null ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <AlertCircle className="w-4 h-4" />
                    )}
                    {saveStates.genre === 'saving' 
                      ? 'Saving...' 
                      : saveStates.genre === 'saved' 
                      ? 'Saved' 
                      : saveStates.genre === 'error'
                      ? 'Error'
                      : 'Save'}
                  </button>
                  <button 
                    onClick={cancelEdit}
                    disabled={saveStates.genre === 'saving'}
                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <p className="text-gray-200 mb-4">{project.description || 'No description provided.'}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {Array.isArray(project.genre) && project.genre.map((g, idx) => (
                    <Tag key={idx} color="purple">
                      {g}
                    </Tag>
                  ))}
                  <button
                    onClick={() => startEdit('genre', project.genre)}
                    className="text-xs text-gray-300 hover:text-black flex items-center gap-1"
                  >
                    <Edit className="w-3 h-3" />
                    Edit
                  </button>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-4 mt-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-300" />
                      <span className="text-sm text-gray-300">
                        Target: {project.targetRelease ? formatDate(project.targetRelease) : 'Not set'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-300" />
                      <span className="text-sm text-gray-300">{teamCount} Team Members</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Gamepad2 className="w-4 h-4 text-gray-300" />
                      <span className="text-sm text-gray-300">{project.maturity_rating || 'Not rated'}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => startEdit('description', project.description)}
                    className="text-gray-300 hover:text-black flex items-center gap-1"
                  >
                    <Edit className="w-4 h-4" />
                    Edit Description
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <TeamSizeStatCard projectId={id} />
        <StatCard 
          icon={DollarSign} 
          label="Budget Spent" 
          value={formatCurrency(project.budget?.spent)} 
          color="emerald"
        />
        <StatCard 
          icon={Calendar} 
          label="Days to Launch" 
          value={getDaysToLaunch()} 
          color="orange"
        />
        <StatCard 
          icon={Bug} 
          label="Critical Bugs" 
          value={project.bugs?.critical || 0} 
          color="red"
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Game Details */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <SectionHeader icon={Gamepad2} title="Game Details" sectionKey="gameplay" />
            {editingSection === 'gameplay' ? (
              <div className="space-y-4">
                {renderEditableField('Perspective', tempData.perspective, 'perspective')}
                {renderEditableField('Gameplay Style', tempData.gameplayStyle, 'gameplayStyle')}
                {renderEditableField('Main Story Playtime', tempData.estimatedPlaytime?.mainStory, 'mainStory', 'estimatedPlaytime.mainStory')}
                {renderEditableField('Completionist Playtime', tempData.estimatedPlaytime?.completionist, 'completionist', 'estimatedPlaytime.completionist')}
                {renderEditableTags('Difficulty Modes', tempData.difficultyModes || [], 'difficultyModes')}
                {renderEditableTags('Features', tempData.features || [], 'features')}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Perspective</p>
                    <p className="font-medium text-gray-900">{project.gameplay?.perspective || 'Not set'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Gameplay Style</p>
                    <p className="font-medium text-gray-900">{project.gameplay?.gameplayStyle || 'Not set'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Playtime (Main Story)</p>
                    <p className="font-medium text-gray-900">{project.gameplay?.estimatedPlaytime?.mainStory || 'Not set'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Playtime (100%)</p>
                    <p className="font-medium text-gray-900">{project.gameplay?.estimatedPlaytime?.completionist || 'Not set'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Maturity Rating</p>
                    <p className="font-medium text-gray-900">{project.maturity_rating || 'Not set'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Difficulty Modes</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {Array.isArray(project.gameplay?.difficultyModes) && project.gameplay.difficultyModes.map((mode, idx) => (
                        <Tag key={idx} color="blue">
                          {mode}
                        </Tag>
                      ))}
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Key Features</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {Array.isArray(project.gameplay?.features) && project.gameplay.features.map((feature, idx) => (
                      <Tag key={idx} color="green">
                        {feature}
                      </Tag>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Development Timeline */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <SectionHeader icon={Flag} title="Development Timeline" sectionKey="milestones" />
            {editingSection === 'milestones' ? (
              <div className="space-y-4">
                {Array.isArray(tempData) && tempData.map((milestone, idx) => (
                  <div key={milestone.id} className="p-4 bg-gray-50 rounded-lg space-y-3">
                    <div className="flex justify-between">
                      <input
                        value={milestone.name}
                        onChange={(e) => {
                          const newMilestones = [...tempData];
                          newMilestones[idx] = { ...milestone, name: e.target.value };
                          setTempData(newMilestones);
                        }}
                        className="flex-1 px-3 py-1 border border-gray-300 rounded mr-2"
                        placeholder="Milestone name"
                      />
                      <select
                        value={milestone.status}
                        onChange={(e) => {
                          const newMilestones = [...tempData];
                          newMilestones[idx] = { ...milestone, status: e.target.value };
                          setTempData(newMilestones);
                        }}
                        className="px-3 py-1 border border-gray-300 rounded"
                      >
                        <option value="completed">Completed</option>
                        <option value="in-progress">In Progress</option>
                        <option value="upcoming">Upcoming</option>
                      </select>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="date"
                        value={milestone.date}
                        onChange={(e) => {
                          const newMilestones = [...tempData];
                          newMilestones[idx] = { ...milestone, date: e.target.value };
                          setTempData(newMilestones);
                        }}
                        className="px-3 py-1 border border-gray-300 rounded"
                      />
                      <input
                        value={milestone.notes}
                        onChange={(e) => {
                          const newMilestones = [...tempData];
                          newMilestones[idx] = { ...milestone, notes: e.target.value };
                          setTempData(newMilestones);
                        }}
                        className="flex-1 px-3 py-1 border border-gray-300 rounded"
                        placeholder="Notes"
                      />
                      <button
                        onClick={() => {
                          setTempData(tempData.filter((_, i) => i !== idx));
                        }}
                        className="text-red-600 hover:text-red-800 p-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  onClick={() => {
                    const newId = Math.max(...(tempData.map(m => m.id) || [0])) + 1;
                    setTempData([...(tempData || []), { 
                      id: newId, 
                      name: '', 
                      status: 'upcoming', 
                      date: '', 
                      notes: '' 
                    }]);
                  }}
                  className="flex items-center gap-2 text-primary hover:text-primary-600"
                >
                  <Plus className="w-4 h-4" />
                  Add Milestone
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {Array.isArray(project.milestones) && project.milestones.map((milestone) => (
                  <div key={milestone.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className={`w-3 h-3 rounded-full ${
                      milestone.status === 'completed' ? 'bg-green-500' :
                      milestone.status === 'in-progress' ? 'bg-yellow-500' : 'bg-gray-300'
                    }`} />
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <h4 className="font-medium text-gray-900">{milestone.name}</h4>
                        <span className="text-sm text-gray-600">{milestone.date}</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{milestone.notes}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Budget & Financials */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <SectionHeader icon={DollarSign} title="Budget & Financials" sectionKey="budget" />
            {editingSection === 'budget' ? (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  {renderEditableField('Total Budget ($)', tempData.total, 'total', '', 'number')}
                  {renderEditableField('Spent ($)', tempData.spent, 'spent', '', 'number')}
                  {renderEditableField('Remaining ($)', tempData.remaining, 'remaining', '', 'number')}
                  {renderEditableField('Projected Revenue ($)', tempData.projectedRevenue, 'projectedRevenue', '', 'number')}
                </div>
                <div>
                  <h4 className="font-medium mb-3 text-gray-900">Price Points</h4>
                  <div className="grid grid-cols-3 gap-4">
                    {renderEditableField('Standard', tempData.pricePoints?.standard, 'standard', 'pricePoints.standard', 'number')}
                    {renderEditableField('Deluxe', tempData.pricePoints?.deluxe, 'deluxe', 'pricePoints.deluxe', 'number')}
                    {renderEditableField('Collector', tempData.pricePoints?.collector, 'collector', 'pricePoints.collector', 'number')}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-3 text-gray-900">Allocation</h4>
                  {Object.entries(tempData.allocated || {}).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-4 mb-3">
                      <span className="w-32 text-gray-700 capitalize">{key}</span>
                      <input
                        type="number"
                        value={value}
                        onChange={(e) => {
                          const newAllocated = { ...tempData.allocated };
                          newAllocated[key] = parseFloat(e.target.value) || 0;
                          setTempData({ ...tempData, allocated: newAllocated });
                        }}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Budget</p>
                    <p className="text-2xl font-bold text-emerald-600">{formatCurrency(project.budget?.total)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Spent / Remaining</p>
                    <p className="text-xl font-bold text-gray-900">
                      {formatCurrency(project.budget?.spent)} / {formatCurrency(project.budget?.remaining)}
                    </p>
                  </div>
                </div>
                <div className="space-y-3 mb-6">
                  {Object.entries(project.budget?.allocated || {}).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-gray-700 capitalize">{key}</span>
                      <span className="font-medium text-gray-900">{formatCurrency(value)}</span>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {Object.entries(project.budget?.pricePoints || {}).map(([key, value]) => (
                    <div key={key} className="text-center p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1 capitalize">{key}</p>
                      <p className="text-xl font-bold text-gray-900">${value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Right Column */}
        <div className="space-y-6">
          {/* Team Breakdown */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <SectionHeader icon={Users} title="Team Breakdown" sectionKey="team" />
            {editingSection === 'team' ? (
              <div className="space-y-4">
                {/* Team Member Selector */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Team Members
                  </label>
                  <TeamMemberSelector projectId={id} onTeamUpdate={refreshTeamCount} />
                </div>
                
                <div>
                  <h4 className="font-medium mb-3 text-gray-900">Department Breakdown</h4>
                  {Object.entries(tempData.breakdown || {}).map(([dept, count]) => (
                    <div key={dept} className="flex items-center justify-between mb-3">
                      <span className="text-gray-700 capitalize">{dept}</span>
                      <input
                        type="number"
                        value={count}
                        onChange={(e) => {
                          const newBreakdown = { ...tempData.breakdown };
                          newBreakdown[dept] = parseInt(e.target.value) || 0;
                          setTempData({ ...tempData, breakdown: newBreakdown });
                        }}
                        className="w-20 px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <TeamMemberDisplay projectId={id} />
                {Object.entries(project.team?.breakdown || {}).map(([dept, count]) => (
                  <div key={dept} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      <span className="text-gray-700 capitalize">{dept}</span>
                    </div>
                    <span className="font-medium text-gray-900">{count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Technical Specifications */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <SectionHeader icon={Cpu} title="Technical Specs" sectionKey="technical" />
            {editingSection === 'technical' ? (
              <div className="space-y-4">
                {renderEditableField('Engine', tempData.engine, 'engine')}
                {renderEditableField('API', tempData.api, 'api')}
                {renderEditableField('Renderer', tempData.renderer, 'renderer')}
                {renderEditableField('Resolution', tempData.resolution, 'resolution')}
                {renderEditableField('Storage Required', tempData.storageRequired, 'storageRequired')}
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={tempData.rayTracing || false}
                      onChange={(e) => handleInputChange('rayTracing', e.target.checked)}
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <span className="text-sm text-gray-700">Ray Tracing</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={tempData.dlss || false}
                      onChange={(e) => handleInputChange('dlss', e.target.checked)}
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <span className="text-sm text-gray-700">DLSS</span>
                  </label>
                </div>
                {renderEditableTags('Languages', tempData.languages || [], 'languages')}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Engine</span>
                  <span className="font-medium text-gray-900">{project.technical?.engine || 'Not set'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Storage Required</span>
                  <span className="font-medium text-gray-900">{project.technical?.storageRequired || 'Not set'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Ray Tracing</span>
                  <span className={`font-medium ${project.technical?.rayTracing ? 'text-green-600' : 'text-red-600'}`}>
                    {project.technical?.rayTracing ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="pt-2">
                  <p className="text-sm text-gray-600 mb-1">Supported Languages</p>
                  <div className="flex flex-wrap gap-1">
                    {Array.isArray(project.technical?.languages) && project.technical.languages.map((lang, idx) => (
                      <Tag key={idx} color="blue">
                        {lang}
                      </Tag>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Platforms */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <SectionHeader icon={Globe} title="Platforms" sectionKey="platform" />
            {editingSection === 'platform' ? (
              <div className="space-y-3">
                {renderEditableTags('Platforms', tempData, 'platform')}
              </div>
            ) : (
              <div className="space-y-3">
                {Array.isArray(project.platform) && project.platform.map((platform, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    {getPlatformIcon(platform)}
                    <span className="font-medium text-gray-900">{platform}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Key Leaders */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <SectionHeader icon={Award} title="Key Leadership" sectionKey="lead" />
            {editingSection === 'lead' ? (
              <div className="space-y-4">
                {Object.entries(tempData).map(([role, name]) => (
                  <div key={role} className="flex items-center gap-3">
                    <span className="w-32 text-sm text-gray-600 capitalize">{role.replace(/([A-Z])/g, ' $1').trim()}</span>
                    <input
                      value={name}
                      onChange={(e) => handleInputChange(role, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {Object.entries(project.lead || {}).map(([role, name]) => (
                  <div key={role} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition">
                    <div>
                      <p className="text-sm text-gray-600 capitalize">{role.replace(/([A-Z])/g, ' $1').trim()}</p>
                      <p className="font-medium text-gray-900">{name}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Additional Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Art Style */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <SectionHeader icon={Palette} title="Art Style & Assets" sectionKey="artStyle" />
          {editingSection === 'artStyle' ? (
            <div className="space-y-4">
              {renderEditableField('Theme', tempData.theme, 'theme')}
              {renderEditableField('Color Palette', tempData.colorPalette, 'colorPalette')}
              {renderEditableField('Inspiration', tempData.inspiration, 'inspiration')}
              {renderEditableField('Main Character Polygons', tempData.polygonCount?.mainCharacter, 'mainCharacter', 'polygonCount.mainCharacter')}
              {renderEditableField('Environment Polygons', tempData.polygonCount?.environment, 'environment', 'polygonCount.environment')}
              {renderEditableField('Texture Resolution', tempData.textureResolution, 'textureResolution')}
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600 mb-1">Theme</p>
                <p className="font-medium text-gray-900">{project.artStyle?.theme || 'Not set'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Inspiration</p>
                <p className="font-medium text-gray-900">{project.artStyle?.inspiration || 'Not set'}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Main Character Polygons</p>
                  <p className="font-medium text-gray-900">{project.artStyle?.polygonCount?.mainCharacter || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Texture Resolution</p>
                  <p className="font-medium text-gray-900">{project.artStyle?.textureResolution || 'Not set'}</p>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Audio */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <SectionHeader icon={Music} title="Audio & Soundtrack" sectionKey="audio" />
          {editingSection === 'audio' ? (
            <div className="space-y-4">
              {renderEditableField('Composer', tempData.composer, 'composer')}
              {renderEditableField('Soundtrack Style', tempData.soundtrack, 'soundtrack')}
              {renderEditableField('Voice Actors', tempData.voiceActors, 'voiceActors', '', 'number')}
              {renderEditableField('Languages Supported', tempData.languages, 'languages', '', 'number')}
              {renderEditableField('Music Tracks', tempData.estimatedMusicTracks, 'estimatedMusicTracks', '', 'number')}
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600 mb-1">Composer</p>
                <p className="font-medium text-gray-900">{project.audio?.composer || 'Not set'}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Voice Actors</p>
                  <p className="font-medium text-gray-900">{project.audio?.voiceActors || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Music Tracks</p>
                  <p className="font-medium text-gray-900">{project.audio?.estimatedMusicTracks || 0}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Soundtrack Style</p>
                <p className="font-medium text-gray-900">{project.audio?.soundtrack || 'Not set'}</p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Documents & Builds */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Documents Section with Upload Functionality */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-gray-900">Documents</h3>
              <span className="bg-gray-200 text-gray-700 text-xs font-medium px-2 py-1 rounded-full">
                {project.documents?.length || 0} files
              </span>
            </div>
            <div className="relative">
              <input
                type="file"
                id="file-upload"
                className="hidden"
                onChange={handleFileUpload}
                disabled={uploading}
              />
              <label
                htmlFor="file-upload"
                className={`flex items-center gap-2 text-sm text-gray-600 hover:text-primary transition bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg cursor-pointer ${uploading ? 'opacity-75' : ''}`}
              >
                {uploading ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4" />
                )}
                {uploading ? 'Uploading...' : 'Upload Document'}
              </label>
            </div>
          </div>

          {/* Attachment Status Message */}
          {attachmentStatus.show && (
            <div className="mb-4 animate-fade-in">
              <div className={`flex items-center gap-2 px-3 py-2 rounded-md ${
                attachmentStatus.type === 'success' 
                  ? 'bg-green-50 border border-green-200 text-green-700' 
                  : 'bg-red-50 border border-red-200 text-red-700'
              }`}>
                {attachmentStatus.type === 'success' ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <AlertCircle className="w-4 h-4" />
                )}
                <span className="text-sm font-medium">{attachmentStatus.message}</span>
                <button 
                  onClick={() => setAttachmentStatus({ show: false, type: '', message: '' })}
                  className="ml-auto text-gray-400 hover:text-gray-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}

          {/* List of Documents */}
          <div className="space-y-3">
            {project.documents && project.documents.length > 0 ? (
              project.documents.map((doc) => (
                <div 
                  key={doc.id}
                  className="group flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all"
                >
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600">
                    {getFileIcon(doc.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{doc.name}</p>
                    <p className="text-xs text-gray-500">
                      v{doc.version} • {doc.lastUpdated} • {doc.size}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {doc.url && (
                      <a 
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    )}
                    <button
                      onClick={() => confirmDeleteDocument(doc.id, doc.storagePath, doc.name)}
                      className="text-gray-400 hover:text-red-600 transition-colors p-1"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 border-2 border-dashed border-gray-200 rounded-lg">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">No documents yet</p>
                <p className="text-sm text-gray-400 mt-1">Upload project documents, design files, or reports</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Builds */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <SectionHeader icon={Package} title="Latest Builds" sectionKey="builds" />
          {editingSection === 'builds' ? (
            <div className="space-y-4">
              {Array.isArray(tempData) && tempData.map((build, idx) => (
                <div key={build.id} className="p-4 bg-gray-50 rounded-lg space-y-3">
                  <div className="flex gap-2">
                    <input
                      value={build.version}
                      onChange={(e) => {
                        const newBuilds = [...tempData];
                        newBuilds[idx] = { ...build, version: e.target.value };
                        setTempData(newBuilds);
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded"
                      placeholder="Version"
                    />
                    <input
                      value={build.platform}
                      onChange={(e) => {
                        const newBuilds = [...tempData];
                        newBuilds[idx] = { ...build, platform: e.target.value };
                        setTempData(newBuilds);
                      }}
                      className="w-32 px-3 py-2 border border-gray-300 rounded"
                      placeholder="Platform"
                    />
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={build.date}
                      onChange={(e) => {
                        const newBuilds = [...tempData];
                        newBuilds[idx] = { ...build, date: e.target.value };
                        setTempData(newBuilds);
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded"
                    />
                    <input
                      value={build.size}
                      onChange={(e) => {
                        const newBuilds = [...tempData];
                        newBuilds[idx] = { ...build, size: e.target.value };
                        setTempData(newBuilds);
                      }}
                      className="w-24 px-3 py-2 border border-gray-300 rounded"
                      placeholder="Size"
                    />
                    <button
                      onClick={() => {
                        setTempData(tempData.filter((_, i) => i !== idx));
                      }}
                      className="text-red-600 hover:text-red-800 p-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <input
                    value={build.notes}
                    onChange={(e) => {
                      const newBuilds = [...tempData];
                      newBuilds[idx] = { ...build, notes: e.target.value };
                      setTempData(newBuilds);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded"
                    placeholder="Notes"
                  />
                </div>
              ))}
              <button
                onClick={() => {
                  const newId = Math.max(...(tempData.map(b => b.id) || [0])) + 1;
                  setTempData([...(tempData || []), { 
                    id: newId, 
                    version: '', 
                    date: '', 
                    size: '', 
                    platform: '', 
                    notes: '' 
                  }]);
                }}
                className="flex items-center gap-2 text-primary hover:text-primary-600"
              >
                <Plus className="w-4 h-4" />
                Add Build
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {Array.isArray(project.builds) && project.builds.map((build) => (
                <div key={build.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Code className="w-4 h-4 text-gray-500" />
                      <span className="font-medium text-gray-900">v{build.version}</span>
                    </div>
                    <span className="text-sm text-gray-600">{build.date}</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{build.notes}</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{build.platform}</span>
                    <span className="font-medium text-gray-900">{build.size}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Post-Launch & DLC */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100 p-6">
        <SectionHeader icon={TrendingUp} title="Post-Launch & DLC Plans" sectionKey="postLaunch" />
        {editingSection === 'postLaunch' ? (
          <div className="space-y-4">
            <div className="flex items-center gap-4 mb-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={tempData.seasonPass || false}
                  onChange={(e) => handleInputChange('seasonPass', e.target.checked)}
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="text-sm text-gray-700">Season Pass</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={tempData.liveService || false}
                  onChange={(e) => handleInputChange('liveService', e.target.checked)}
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="text-sm text-gray-700">Live Service</span>
              </label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700">Planned DLC:</span>
                <input
                  type="number"
                  value={tempData.plannedDLC || 0}
                  onChange={(e) => handleInputChange('plannedDLC', parseInt(e.target.value) || 0)}
                  className="w-16 px-2 py-1 border border-gray-300 rounded"
                />
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-3 text-gray-900">Roadmap</h4>
              {Array.isArray(tempData.roadmap) && tempData.roadmap.map((item, idx) => (
                <div key={item.id} className="p-4 bg-white rounded-lg border border-indigo-100 mb-3 space-y-3">
                  <div className="flex gap-2">
                    <input
                      value={item.name}
                      onChange={(e) => {
                        const newRoadmap = [...tempData.roadmap];
                        newRoadmap[idx] = { ...item, name: e.target.value };
                        setTempData({ ...tempData, roadmap: newRoadmap });
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded"
                      placeholder="Item name"
                    />
                    <input
                      type="date"
                      value={item.date}
                      onChange={(e) => {
                        const newRoadmap = [...tempData.roadmap];
                        newRoadmap[idx] = { ...item, date: e.target.value };
                        setTempData({ ...tempData, roadmap: newRoadmap });
                      }}
                      className="px-3 py-2 border border-gray-300 rounded"
                    />
                    {item.price && (
                      <input
                        type="number"
                        value={item.price}
                        onChange={(e) => {
                          const newRoadmap = [...tempData.roadmap];
                          newRoadmap[idx] = { ...item, price: parseFloat(e.target.value) || 0 };
                          setTempData({ ...tempData, roadmap: newRoadmap });
                        }}
                        className="w-24 px-3 py-2 border border-gray-300 rounded"
                        placeholder="Price"
                      />
                    )}
                    <button
                      onClick={() => {
                        const newRoadmap = tempData.roadmap.filter((_, i) => i !== idx);
                        setTempData({ ...tempData, roadmap: newRoadmap });
                      }}
                      className="text-red-600 hover:text-red-800 p-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <input
                    value={item.content}
                    onChange={(e) => {
                      const newRoadmap = [...tempData.roadmap];
                      newRoadmap[idx] = { ...item, content: e.target.value };
                      setTempData({ ...tempData, roadmap: newRoadmap });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded"
                    placeholder="Content description"
                  />
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={!!item.price}
                        onChange={(e) => {
                          const newRoadmap = [...tempData.roadmap];
                          newRoadmap[idx] = { 
                            ...item, 
                            price: e.target.checked ? 0 : undefined 
                          };
                          setTempData({ ...tempData, roadmap: newRoadmap });
                        }}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <span className="text-sm text-gray-700">Has Price (DLC)</span>
                    </label>
                  </div>
                </div>
              ))}
              <button
                onClick={() => {
                  const newId = Math.max(...((tempData.roadmap || []).map(r => r.id) || [0])) + 1;
                  const newRoadmap = [...(tempData.roadmap || []), { 
                    id: newId, 
                    name: '', 
                    date: '', 
                    content: '' 
                  }];
                  setTempData({ ...tempData, roadmap: newRoadmap });
                }}
                className="flex items-center gap-2 text-primary hover:text-primary-600"
              >
                <Plus className="w-4 h-4" />
                Add Roadmap Item
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-2">
                <div className={`p-1 rounded ${project.postLaunch?.seasonPass ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                  <Check className="w-3 h-3" />
                </div>
                <span className="text-sm text-gray-700">Season Pass</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`p-1 rounded ${project.postLaunch?.liveService ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                  <Check className="w-3 h-3" />
                </div>
                <span className="text-sm text-gray-700">Live Service</span>
              </div>
              <div className="text-sm text-gray-600">
                {project.postLaunch?.plannedDLC || 0} Planned DLCs
              </div>
            </div>
            {Array.isArray(project.postLaunch?.roadmap) && project.postLaunch.roadmap.map((item) => (
              <div key={item.id} className="flex items-center gap-4 p-4 bg-white rounded-lg border border-indigo-100">
                <div className={`p-2 rounded-lg ${item.price ? 'bg-purple-100' : 'bg-indigo-100'}`}>
                  {item.price ? <ShoppingCart className="w-5 h-5 text-purple-600" /> : <Upload className="w-5 h-5 text-indigo-600" />}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <h4 className="font-medium text-gray-900">{item.name}</h4>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">{item.date}</span>
                      {item.price && <span className="font-bold text-purple-600">${item.price}</span>}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{item.content}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Risks & Issues */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <SectionHeader icon={Shield} title="Risks & Issues" sectionKey="risks" />
        {editingSection === 'risks' ? (
          <div className="space-y-4">
            {Array.isArray(tempData) && tempData.map((risk, idx) => (
              <div key={risk.id} className="p-4 rounded-lg border border-gray-200 space-y-3">
                <div className="flex gap-2">
                  <select
                    value={risk.level}
                    onChange={(e) => {
                      const newRisks = [...tempData];
                      newRisks[idx] = { ...risk, level: e.target.value };
                      setTempData(newRisks);
                    }}
                    className="px-3 py-2 border border-gray-300 rounded"
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                  <input
                    value={risk.description}
                    onChange={(e) => {
                      const newRisks = [...tempData];
                      newRisks[idx] = { ...risk, description: e.target.value };
                      setTempData(newRisks);
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded"
                    placeholder="Risk description"
                  />
                  <button
                    onClick={() => {
                      setTempData(tempData.filter((_, i) => i !== idx));
                    }}
                    className="text-red-600 hover:text-red-800 p-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <input
                  value={risk.assigned}
                  onChange={(e) => {
                    const newRisks = [...tempData];
                    newRisks[idx] = { ...risk, assigned: e.target.value };
                    setTempData(newRisks);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                  placeholder="Assigned to"
                />
              </div>
            ))}
            <button
              onClick={() => {
                const newId = Math.max(...(tempData.map(r => r.id) || [0])) + 1;
                setTempData([...(tempData || []), { 
                  id: newId, 
                  level: 'medium', 
                  description: '', 
                  assigned: '' 
                }]);
              }}
              className="flex items-center gap-2 text-primary hover:text-primary-600"
            >
              <Plus className="w-4 h-4" />
              Add Risk
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {Array.isArray(project.risks) && project.risks.map((risk) => (
              <div key={risk.id} className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-red-200 transition">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    risk.level === 'high' ? 'bg-red-500' :
                    risk.level === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                  }`} />
                  <div>
                    <p className="font-medium text-gray-900">{risk.description}</p>
                    <p className="text-sm text-gray-600">Assigned to: {risk.assigned}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Lore Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-gray-900">Game Lore</h3>
          </div>
          <div className="flex gap-2">
            {editingSection === 'lore' ? (
              <>
                <button 
                  onClick={() => saveEdit('lore')}
                  disabled={saveStates.lore === 'saving'}
                  className={`flex items-center gap-1.5 text-sm text-white px-4 py-2 rounded-lg transition font-medium shadow-sm ${
                    saveStates.lore === 'saving' 
                      ? 'bg-gray-600 cursor-not-allowed' 
                      : saveStates.lore === 'saved' 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : saveStates.lore === 'error'
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-black hover:bg-gray-800'
                  }`}
                >
                  {saveStates.lore === 'saving' ? (
                    <Loader className="w-4 h-4 animate-spin" />
                  ) : saveStates.lore === 'saved' || saveStates.lore === null ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <AlertCircle className="w-4 h-4" />
                  )}
                  {saveStates.lore === 'saving' 
                    ? 'Saving...' 
                    : saveStates.lore === 'saved' 
                    ? 'Saved' 
                    : saveStates.lore === 'error'
                    ? 'Error'
                    : 'Save'}
                </button>
                <button 
                  onClick={cancelEdit}
                  disabled={saveStates.lore === 'saving'}
                  className="flex items-center gap-1 text-sm text-gray-700 bg-gray-200 hover:bg-gray-300 px-3 py-1.5 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => startEdit('lore', typeof project.lore === 'string' ? project.lore : (project.lore || ''))}
                className="flex items-center gap-1 text-sm text-gray-600 hover:text-primary transition bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg"
              >
                <Edit className="w-4 h-4" />
                Edit Lore
              </button>
            )}
          </div>
        </div>
        {editingSection === 'lore' ? (
          <div className="space-y-4">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Game Lore</label>
              <textarea
                value={typeof tempData === 'string' ? tempData : (tempData || '')}
                onChange={(e) => setTempData(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                rows="6"
              />
            </div>
          </div>
        ) : (
          <p className="text-gray-700 leading-relaxed whitespace-pre-line">{project.lore || 'No lore available for this game.'}</p>
        )}
      </div>
      
      {/* Awards Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-500" />
            <h3 className="text-lg font-semibold text-gray-900">Awards & Recognition</h3>
          </div>
          <div className="flex gap-2">
            {editingSection === 'awards' ? (
              <>
                <button 
                  onClick={() => saveEdit('awards')}
                  disabled={saveStates.awards === 'saving'}
                  className={`flex items-center gap-1.5 text-sm text-white px-4 py-2 rounded-lg transition font-medium shadow-sm ${
                    saveStates.awards === 'saving' 
                      ? 'bg-gray-600 cursor-not-allowed' 
                      : saveStates.awards === 'saved' 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : saveStates.awards === 'error'
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-black hover:bg-gray-800'
                  }`}
                >
                  {saveStates.awards === 'saving' ? (
                    <Loader className="w-4 h-4 animate-spin" />
                  ) : saveStates.awards === 'saved' || saveStates.awards === null ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <AlertCircle className="w-4 h-4" />
                  )}
                  {saveStates.awards === 'saving' 
                    ? 'Saving...' 
                    : saveStates.awards === 'saved' 
                    ? 'Saved' 
                    : saveStates.awards === 'error'
                    ? 'Error'
                    : 'Save'}
                </button>
                <button 
                  onClick={cancelEdit}
                  disabled={saveStates.awards === 'saving'}
                  className="flex items-center gap-1 text-sm text-gray-700 bg-gray-200 hover:bg-gray-300 px-3 py-1.5 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => startEdit('awards', project.awards)}
                className="flex items-center gap-1 text-sm text-gray-600 hover:text-primary transition bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg"
              >
                <Edit className="w-4 h-4" />
                Edit Awards
              </button>
            )}
          </div>
        </div>
        {editingSection === 'awards' ? (
          <div className="space-y-4">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Awards</label>
              <div className="flex flex-wrap gap-2 mb-3">
                {Array.isArray(tempData) && tempData.map((award, index) => (
                  <Tag key={index} color="yellow" removable onRemove={() => removeArrayItem('awards', index)}>
                    <Star className="w-3 h-3 inline mr-1" />
                    {award}
                  </Tag>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newItem['awards'] || ''}
                  onChange={(e) => setNewItem({...newItem, 'awards': e.target.value})}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Add new award..."
                />
                <button
                  onClick={() => {
                    if (newItem['awards']) {
                      setTempData(prev => [...(prev || []), newItem['awards']]);
                      setNewItem({ ...newItem, 'awards': '' });
                    }
                  }}
                  className="bg-black text-white px-3 py-2 rounded-lg hover:bg-gray-800 transition flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Add
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {Array.isArray(project.awards) && project.awards.map((award, idx) => (
              <Tag key={idx} color="yellow">
                <Star className="w-3 h-3 inline mr-1" />
                {award}
              </Tag>
            ))}
          </div>
        )}
      </div>

      {/* Delete Document Modal */}
      {showDeleteModal.show && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative transform overflow-hidden rounded-lg bg-white shadow-xl transition-all w-full max-w-md">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <AlertOctagon className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Delete Document
                    </h3>
                    <p className="text-sm text-gray-500">
                      Are you sure you want to delete "{showDeleteModal.name}"? This action cannot be undone.
                    </p>
                  </div>
                </div>
                
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={() => setShowDeleteModal({ show: false, documentId: null, storagePath: null, name: '' })}
                    className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteDocument}
                    disabled={deleting}
                    className="px-4 py-2 bg-red-600 !text-white hover:bg-red-700 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {deleting ? (
                      <Loader className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                    {deleting ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Team Member Selector Component
const TeamMemberSelector = ({ projectId, onTeamUpdate }) => {
  const [allProfiles, setAllProfiles] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    fetchProfiles();
    loadExistingTeam();
  }, [projectId]);

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
          team: { total: memberIds.length, breakdown: {} }
        })
        .eq('id', projectId);
      
      if (error) throw error;
      
      // Call the callback to update parent component
      if (onTeamUpdate) {
        onTeamUpdate();
      }
      
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

  const isMemberSelected = (profileId) => {
    return selectedMembers.some(m => m.id === profileId);
  };

  return (
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
      
      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-gray-600 mb-1">Total Team Size</p>
        <p className="text-3xl font-bold text-gray-900">{selectedMembers.length}</p>
      </div>
    </div>
  );
};

// Team Member Display Component
const TeamMemberDisplay = ({ projectId }) => {
  const [teamMembers, setTeamMembers] = useState([]);

  useEffect(() => {
    fetchTeamMembers();
  }, [projectId]);

  const fetchTeamMembers = async () => {
    const { data, error } = await supabase
      .from('projects')
      .select('team_members')
      .eq('id', projectId)
      .single();
    
    if (!error && data?.team_members && data.team_members.length > 0) {
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', data.team_members);
      
      if (!profileError && profiles) {
        setTeamMembers(profiles);
      }
    }
  };

  return (
    <>
      <div className="p-4 bg-blue-50 rounded-lg mb-4">
        <p className="text-sm text-gray-600 mb-1">Total Team Size</p>
        <p className="text-3xl font-bold text-gray-900">{teamMembers.length}</p>
      </div>
      
      {/* List of team members */}
      {teamMembers.length > 0 && (
        <div className="space-y-2 mb-4">
          {teamMembers.map((member) => (
            <div key={member.id} className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-900">{member.name}</p>
              <p className="text-xs text-gray-500">{member.role || 'Team Member'}</p>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

// Team Size Stat Card Component
const TeamSizeStatCard = ({ projectId }) => {
  const [teamCount, setTeamCount] = useState(0);

  useEffect(() => {
    fetchTeamCount();
  }, [projectId]);

  const fetchTeamCount = async () => {
    const { data, error } = await supabase
      .from('projects')
      .select('team_members')
      .eq('id', projectId)
      .single();
    
    if (!error && data?.team_members) {
      setTeamCount(data.team_members.length);
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <div className="p-2 rounded-lg bg-green-100 text-green-600">
          <Users className="w-4 h-4" />
        </div>
        <span className="text-sm text-gray-600">Team Size</span>
      </div>
      <p className="text-xl font-bold text-gray-900">{teamCount}</p>
    </div>
  );
};

export default ProjectDetailPage;