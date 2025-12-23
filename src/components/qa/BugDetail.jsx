import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Bug, Calendar, User, Tag, MessageSquare, 
  Edit, Trash2, CheckCircle, XCircle, AlertTriangle,
  Clock, Monitor, Flag, Upload, Download, Copy,
  GitPullRequest, FileText, Wrench, AlertCircle, ExternalLink,
  Paperclip, Image as ImageIcon, File, Video, FileCode, UserCircle,
  ArrowLeft, Loader, X, Check, AlertOctagon
} from 'lucide-react';
import Card from '../common/Card';
import Badge from '../common/Badge';
import Button from '../common/Button';
import Modal from '../common/Modal';
import { bugService } from '../../services/bugService';
import { supabase } from '../../services/supabaseClient';
import ReassignBug from './ReassignBug';
import ChangeStatus from './ChangeStatus';

const BugDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [bug, setBug] = useState(null);
  const [comment, setComment] = useState('');
  const [currentUserProfile, setCurrentUserProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedBug, setEditedBug] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState({ show: false, type: '', id: null, name: '' });
  const [loading, setLoading] = useState(true);
  const [assigneeOptions, setAssigneeOptions] = useState([]);
  const [projects, setProjects] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [attachmentStatus, setAttachmentStatus] = useState({ show: false, type: '', message: '' });
  
  // Fetch current user profile to identify who is signed in
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('name, avatar_url')
            .eq('id', user.id)
            .single();
          
          setCurrentUserProfile(profile || { name: user.email.split('@')[0] });
        }
      } catch (err) {
        console.error('Error fetching user for comment:', err);
      }
    };
    fetchCurrentUser();
  }, []);

  // Fetch bug data from Supabase
  useEffect(() => {
    const fetchBug = async () => {
      try {
        setLoading(true);
        const bugId = parseInt(id);
        
        if (isNaN(bugId)) {
          console.error('Invalid bug ID:', id);
          navigate('/devportal/qa');
          return;
        }
        
        const foundBug = await bugService.getBug(bugId);
        
        if (foundBug) {
          setBug(foundBug);
          setEditedBug(foundBug);
          
          // Fetch assignee options and projects
          const bugsData = await bugService.getBugs();
          const uniqueAssignees = [...new Set(bugsData.map(b => b.assignedTo).filter(Boolean))];
          setAssigneeOptions(uniqueAssignees);
          
          const uniqueProjects = [...new Set(bugsData.map(b => b.project).filter(Boolean))];
          setProjects(uniqueProjects);
        } else {
          navigate('/devportal/qa');
        }
      } catch (err) {
        console.error('Error fetching bug:', err);
        navigate('/devportal/qa');
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchBug();
    } else {
      navigate('/devportal/qa');
    }
  }, [id, navigate]);
  
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
  
  const handleClose = () => {
    navigate('/devportal/qa');
  };
  
  const handleAddComment = async () => {
    if (comment.trim() && bug) {
      try {
        const newComment = {
          author: currentUserProfile?.name || 'Unknown User',
          text: comment,
          createdAt: new Date().toISOString()
        };
        
        const updatedComments = await bugService.addComment(bug.id, newComment);
        
        const updatedBug = {
          ...bug,
          comments: updatedComments,
          updatedAt: new Date().toISOString()
        };
        
        setBug(updatedBug);
        setEditedBug(updatedBug);
        setComment('');
      } catch (err) {
        console.error('Error adding comment:', err);
      }
    }
  };
  
  const handleSaveEdit = async () => {
    try {
      const updates = {};
      
      Object.keys(editedBug).forEach(key => {
        if (key !== 'id' && key !== 'createdAt' && key !== 'updatedAt' && key !== 'resolvedAt') {
          if (editedBug[key] !== bug[key]) {
            updates[key] = editedBug[key];
          }
        }
      });
      
      if (Object.keys(updates).length > 0) {
        const updatedBug = await bugService.updateBug(bug.id, updates);
        setBug(updatedBug);
        setEditedBug(updatedBug);
      }
      
      setIsEditing(false);
    } catch (err) {
      console.error('Error saving bug:', err);
    }
  };
  
  const handleCancelEdit = () => {
    setEditedBug(bug);
    setIsEditing(false);
  };
  
  const handleStatusChange = async (bugId, status, resolution) => {
    try {
      const updates = {
        status: status
      };
      
      if (resolution) {
        updates.resolution = resolution;
      }
      
      const updatedBug = await bugService.updateBug(bugId, updates);
      
      setBug(updatedBug);
      setEditedBug(updatedBug);
      setShowStatusModal(false);
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };
  
  const handleReassign = async (bugId, assignee) => {
    try {
      const updatedBug = await bugService.updateBug(bugId, {
        assignedTo: assignee
      });
      
      setBug(updatedBug);
      setEditedBug(updatedBug);
      setShowReassignModal(false);
    } catch (err) {
      console.error('Error reassigning bug:', err);
    }
  };
  
  const handleDeleteBug = async () => {
    try {
      setDeleting('bug');
      await bugService.deleteBug(bug.id);
      setShowDeleteModal({ show: false, type: '', id: null, name: '' });
      navigate('/devportal/qa');
    } catch (err) {
      console.error('Error deleting bug:', err);
    } finally {
      setDeleting(null);
    }
  };
  
  const handleDeleteAttachment = async () => {
    const { id: attachmentId } = showDeleteModal;
    
    try {
      setDeleting('attachment');
      await bugService.deleteAttachment(bug.id, attachmentId);
      
      // Refresh bug data
      const updatedBug = await bugService.getBug(bug.id);
      setBug(updatedBug);
      setEditedBug(updatedBug);
      
      setShowDeleteModal({ show: false, type: '', id: null, name: '' });
      showAttachmentStatus('success', 'Attachment deleted successfully');
    } catch (err) {
      console.error('Error deleting attachment:', err);
      showAttachmentStatus('error', 'Failed to delete attachment');
    } finally {
      setDeleting(null);
    }
  };
  
  const confirmDelete = (type, id = null, name = '') => {
    setShowDeleteModal({ show: true, type, id, name });
  };
  
  const getPriorityColor = (priority) => {
    const colors = {
      critical: 'error',
      high: 'warning',
      medium: 'info',
      low: 'default',
    };
    return colors[priority] || 'default';
  };
  
  const getStatusColor = (status) => {
    const colors = {
      open: 'error',
      'in-progress': 'info',
      resolved: 'success',
      closed: 'default',
    };
    return colors[status] || 'default';
  };
  
  const getSeverityColor = (severity) => {
    const colors = {
      'game-breaking': 'error',
      'major': 'warning',
      'moderate': 'info',
      'minor': 'default',
    };
    return colors[severity] || 'default';
  };
  
  const copyBugId = () => {
    navigator.clipboard.writeText(`BUG-${bug.id.toString().padStart(4, '0')}`);
  };
  
  const capitalizeFirstLetter = (text) => {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1);
  };
  
  const formatTagLabel = (label) => {
    if (!label) return '';
    return capitalizeFirstLetter(label.replace('-', ' '));
  };
  
  const getFileIcon = (fileName) => {
    if (!fileName) return <File className="w-4 h-4" />;
    const extension = fileName.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg'].includes(extension)) {
      return <ImageIcon className="w-4 h-4" />;
    } else if (['mp4', 'avi', 'mov', 'wmv'].includes(extension)) {
      return <Video className="w-4 h-4" />;
    } else if (['js', 'jsx', 'ts', 'tsx', 'py', 'java', 'cpp', 'c'].includes(extension)) {
      return <FileCode className="w-4 h-4" />;
    } else {
      return <File className="w-4 h-4" />;
    }
  };
  
  const getUserAvatar = (userName) => {
    const colors = [
      'bg-blue-100 text-blue-800',
      'bg-green-100 text-green-800',
      'bg-purple-100 text-purple-800',
      'bg-yellow-100 text-yellow-800',
      'bg-pink-100 text-pink-800',
      'bg-indigo-100 text-indigo-800',
    ];
    
    const colorIndex = userName?.length % colors.length || 0;
    const initials = userName?.split(' ').map(n => n[0]).join('').toUpperCase() || '?';
    
    return (
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${colors[colorIndex]}`}>
        {initials}
      </div>
    );
  };
  
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file || !bug) return;
    
    // Reset the file input
    event.target.value = '';
    
    try {
      setUploading(true);
      
      // Upload file to Supabase storage
      const attachment = await bugService.uploadAttachment(bug.id, file);
      
      // Update bug with new attachment - fetch the latest bug data
      const updatedBug = await bugService.getBug(bug.id);
      
      setBug(updatedBug);
      setEditedBug(updatedBug);
      setUploading(false);
      showAttachmentStatus('success', 'File uploaded successfully');
      
    } catch (err) {
      console.error('Error uploading file:', err);
      setUploading(false);
      
      let errorMessage = 'Failed to upload file. ';
      
      if (err.message.includes('bucket')) {
        errorMessage += 'The storage bucket "bug-attachments" might not exist.';
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
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Loading bug details...</p>
        </div>
      </div>
    );
  }

  if (!bug) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Bug Not Found</h3>
          <p className="text-gray-600 mb-6">The bug you're looking for doesn't exist.</p>
          <Button 
            variant="ghost" 
            icon={ArrowLeft}
            onClick={() => navigate('/devportal/qa')}
          >
            Back to QA Tracker
          </Button>
        </div>
      </div>
    );
  }

  const attachments = bug?.attachments || [];
  const comments = bug?.comments || [];
  const tags = bug?.tags || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center w-full sm:w-auto">
  <Button 
    variant="ghost" 
    icon={ArrowLeft}
    onClick={handleClose}
    className="hover:!bg-gray-100 w-full sm:w-auto"
  >
    Back to QA
  </Button>
  <div className="flex items-center gap-2 justify-between sm:justify-start">
            <Bug className="w-5 h-5 text-gray-700" />
            <h1 className="text-2xl font-bold text-gray-900">
              BUG-{bug?.id?.toString()?.padStart(4, '0') || '0000'}
            </h1>
            <button
              onClick={copyBugId}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              title="Copy bug ID"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <div className="flex gap-2 w-full sm:w-auto">
          {!isEditing ? (
            <>
              <Button 
  variant="outline" 
  icon={Edit} 
  size="sm"
  onClick={() => setIsEditing(true)}
  className="!text-black hover:!bg-black hover:!text-white border-black transition-all flex-1 sm:flex-initial"
>
  Edit Bug
</Button>
<Button 
  variant="ghost" 
  icon={Trash2} 
  size="sm"
  onClick={() => confirmDelete('bug')}
  className="hover:!bg-red-50 hover:!text-red-600 flex-1 sm:flex-initial"
>
  Delete
</Button>
            </>
          ) : (
            <>
              <Button 
                size="sm"
                onClick={handleSaveEdit}
                className="!bg-black !text-white hover:!bg-gray-800"
              >
                Save Changes
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleCancelEdit}
                className="!text-black border-black hover:!bg-black hover:!text-white"
              >
                Cancel
              </Button>
            </>
          )}
        </div>
      </div>
      
      {/* Main Bug Card */}
      <Card>
        <div className="space-y-6">
          {/* Title and Status Row */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex-1">
              {isEditing ? (
                <input
                  type="text"
                  value={editedBug?.title || ''}
                  onChange={(e) => setEditedBug({...editedBug, title: e.target.value})}
                  className="w-full text-2xl font-bold text-gray-900 border-b border-gray-300 focus:border-primary outline-none transition-colors"
                />
              ) : (
                <h2 className="text-2xl font-bold text-gray-900">{bug?.title || 'No Title'}</h2>
              )}
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Badge variant={getPriorityColor(bug?.priority)}>
                <AlertTriangle className="w-3 h-3 mr-1" />
                {formatTagLabel(bug?.priority)}
              </Badge>
              <Badge variant={getStatusColor(bug?.status)}>
                {formatTagLabel(bug?.status?.replace('-', ' '))}
              </Badge>
              {bug?.severity && (
                <Badge variant={getSeverityColor(bug?.severity)}>
                  {formatTagLabel(bug?.severity)}
                </Badge>
              )}
            </div>
          </div>
          
          {/* Description */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Description</h3>
            {isEditing ? (
              <textarea
                value={editedBug?.description || ''}
                onChange={(e) => setEditedBug({...editedBug, description: e.target.value})}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
              />
            ) : (
              <p className="text-gray-700 whitespace-pre-line">{bug?.description || 'No description provided.'}</p>
            )}
          </div>
          
          {/* Problem Analysis Section */}
          <div className="space-y-4 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-gray-700" />
              <h3 className="text-lg font-semibold text-gray-900">Problem Analysis</h3>
            </div>
            
            {/* Problem */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Root Problem
              </h4>
              {isEditing ? (
                <textarea
                  value={editedBug?.problem || ''}
                  onChange={(e) => setEditedBug({...editedBug, problem: e.target.value})}
                  placeholder="Describe the root cause of the bug..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                />
              ) : (
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700 whitespace-pre-line">
                    {bug?.problem || 'No problem analysis provided yet.'}
                  </p>
                </div>
              )}
            </div>
            
            {/* Solution */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Wrench className="w-4 h-4" />
                Solution
              </h4>
              {isEditing ? (
                <textarea
                  value={editedBug?.solution || ''}
                  onChange={(e) => setEditedBug({...editedBug, solution: e.target.value})}
                  placeholder="Describe how this bug was/will be fixed..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                />
              ) : (
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700 whitespace-pre-line">
                    {bug?.solution || 'No solution provided yet.'}
                  </p>
                </div>
              )}
            </div>
            
            {/* Remedy */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Preventive Remedy
              </h4>
              {isEditing ? (
                <textarea
                  value={editedBug?.remedy || ''}
                  onChange={(e) => setEditedBug({...editedBug, remedy: e.target.value})}
                  placeholder="Describe preventive measures to stop this from happening again..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                />
              ) : (
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700 whitespace-pre-line">
                    {bug?.remedy || 'No preventive remedy provided yet.'}
                  </p>
                </div>
              )}
            </div>
            
            {/* GitHub Pull Request Link */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <GitPullRequest className="w-4 h-4" />
                GitHub Pull Request
              </h4>
              {isEditing ? (
                <div className="space-y-2">
                  <input
                    type="url"
                    value={editedBug?.pullRequest || ''}
                    onChange={(e) => setEditedBug({...editedBug, pullRequest: e.target.value})}
                    placeholder="https://github.com/your-org/repo/pull/123"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  />
                  <div className="text-sm text-gray-500">
                    Link to the PR that fixes this bug
                  </div>
                </div>
              ) : bug?.pullRequest ? (
                <div className="flex items-center gap-2">
                  <a 
                    href={bug.pullRequest}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-black transition-colors"
                  >
                    <GitPullRequest className="w-4 h-4" />
                    View Pull Request
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              ) : (
                <div className="text-gray-500 text-sm italic">
                  No pull request linked yet
                </div>
              )}
            </div>
          </div>
          
          {/* Attachments Section */}
          <div className="pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Paperclip className="w-5 h-5 text-gray-700" />
                <h3 className="text-lg font-semibold text-gray-900">Attachments</h3>
                <span className="bg-gray-200 text-gray-700 text-xs font-medium px-2 py-1 rounded-full">
                  {attachments.length} files
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
                <Button 
                  variant="outline" 
                  size="sm"
                  icon={uploading ? Loader : Upload}
                  onClick={() => document.getElementById('file-upload').click()}
                  disabled={uploading}
                  className={`!text-black border-black hover:!bg-black hover:!text-white ${uploading ? 'opacity-75' : ''}`}
                >
                  {uploading ? 'Uploading...' : 'Upload File'}
                </Button>
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
                    <AlertOctagon className="w-4 h-4" />
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
            
            {attachments.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {attachments.map((attachment, index) => (
                  <div 
                    key={index}
                    className="group flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all"
                  >
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600">
                      {getFileIcon(attachment?.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{attachment?.name || 'Unnamed file'}</p>
                      <p className="text-xs text-gray-500">
                        {attachment?.size ? `${(attachment.size / 1024).toFixed(2)} KB` : 'Size unknown'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {attachment?.url && (
                        <a 
                          href={attachment.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                          title="Download"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      )}
                      <button
                        onClick={() => confirmDelete('attachment', attachment.id, attachment.name)}
                        className="text-gray-400 hover:text-red-600 transition-colors p-1"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 border-2 border-dashed border-gray-200 rounded-lg">
                <Paperclip className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">No attachments yet</p>
                <p className="text-sm text-gray-400 mt-1">Upload screenshots, logs, or videos</p>
              </div>
            )}
          </div>
          
          {/* Metadata Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-4 border-t border-gray-200">
            <div>
              <p className="text-sm text-gray-600 mb-1 flex items-center gap-2">
                <User className="w-4 h-4" />
                Reported By
              </p>
              <p className="font-medium text-gray-900">{bug?.reportedBy || 'N/A'}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-600 mb-1 flex items-center gap-2">
                <User className="w-4 h-4" />
                Assigned To
              </p>
              {isEditing ? (
                <select
                  value={editedBug?.assignedTo || ''}
                  onChange={(e) => setEditedBug({...editedBug, assignedTo: e.target.value})}
                  className="w-full px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                >
                  <option value="">Unassigned</option>
                  {assigneeOptions.map(person => (
                    <option key={person} value={person}>{person}</option>
                  ))}
                </select>
              ) : (
                <p className="font-medium text-gray-900">{bug?.assignedTo || 'Unassigned'}</p>
              )}
            </div>
            
            <div>
              <p className="text-sm text-gray-600 mb-1 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Created
              </p>
              <p className="font-medium text-gray-900">
                {bug?.createdAt ? new Date(bug.createdAt).toLocaleDateString() : 'N/A'}
              </p>
            </div>
            
            <div>
              <p className="text-sm text-gray-600 mb-1 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Updated
              </p>
              <p className="font-medium text-gray-900">
                {bug?.updatedAt || bug?.createdAt ? new Date(bug.updatedAt || bug.createdAt).toLocaleDateString() : 'N/A'}
              </p>
            </div>
            
            <div>
              <p className="text-sm text-gray-600 mb-1 flex items-center gap-2">
                <Flag className="w-4 h-4" />
                Project
              </p>
              {isEditing ? (
                <select
                  value={editedBug?.project || ''}
                  onChange={(e) => setEditedBug({...editedBug, project: e.target.value})}
                  className="w-full px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                >
                  <option value="">Select Project</option>
                  {projects.map(project => (
                    <option key={project} value={project}>{project}</option>
                  ))}
                </select>
              ) : (
                <p className="font-medium text-gray-900">{bug?.project || 'N/A'}</p>
              )}
            </div>
            
            <div>
              <p className="text-sm text-gray-600 mb-1 flex items-center gap-2">
                <Monitor className="w-4 h-4" />
                Platform
              </p>
              {isEditing ? (
                <select
                  value={editedBug?.platform || ''}
                  onChange={(e) => setEditedBug({...editedBug, platform: e.target.value})}
                  className="w-full px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                >
                  <option value="">Select Platform</option>
                  {['PC', 'PlayStation 5', 'Xbox Series X', 'Xbox Series S', 'Nintendo Switch', 'Cross-platform'].map(platform => (
                    <option key={platform} value={platform}>{platform}</option>
                  ))}
                </select>
              ) : (
                <p className="font-medium text-gray-900">{bug?.platform || 'N/A'}</p>
              )}
            </div>
            
            <div>
              <p className="text-sm text-gray-600 mb-1 flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Version
              </p>
              {isEditing ? (
                <input
                  type="text"
                  value={editedBug?.version || ''}
                  onChange={(e) => setEditedBug({...editedBug, version: e.target.value})}
                  className="w-full px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                />
              ) : (
                <p className="font-medium text-gray-900">v{bug?.version || 'N/A'}</p>
              )}
            </div>
            
            <div>
              <p className="text-sm text-gray-600 mb-1 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Environment
              </p>
              {isEditing ? (
                <input
                  type="text"
                  value={editedBug?.environment || ''}
                  onChange={(e) => setEditedBug({...editedBug, environment: e.target.value})}
                  className="w-full px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                />
              ) : (
                <p className="font-medium text-gray-900">{bug?.environment || 'N/A'}</p>
              )}
            </div>
          </div>
          
          {/* Tags */}
          {tags.length > 0 && (
            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm font-medium text-gray-700 mb-2">Tags</p>
              <div className="flex flex-wrap gap-2">
                {isEditing ? (
                  <input
                    type="text"
                    value={editedBug?.tags?.join(', ') || ''}
                    onChange={(e) => setEditedBug({...editedBug, tags: e.target.value.split(', ').filter(t => t)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                    placeholder="Add tags separated by commas"
                  />
                ) : (
                  tags.map((tag, index) => (
                    <span 
                      key={index}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium transition-colors hover:bg-gray-200 border border-gray-200"
                    >
                      {capitalizeFirstLetter(tag)}
                    </span>
                  ))
                )}
              </div>
            </div>
          )}
          
          {/* Reproduction Steps */}
          {bug?.reproductionSteps && (
            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Reproduction Steps</h3>
              {isEditing ? (
                <textarea
                  value={editedBug?.reproductionSteps || ''}
                  onChange={(e) => setEditedBug({...editedBug, reproductionSteps: e.target.value})}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all font-sans"
                />
              ) : (
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700 whitespace-pre-line font-sans">{bug?.reproductionSteps}</p>
                </div>
              )}
            </div>
          )}
          
          {/* Resolution (if resolved/closed) */}
          {bug?.resolution && (
            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Resolution</h3>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800 whitespace-pre-line">{bug?.resolution}</p>
              </div>
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
            <Button 
              icon={CheckCircle}
              onClick={() => setShowStatusModal(true)}
              className="!bg-black !text-white hover:!bg-gray-800"
            >
              Change Status
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setShowReassignModal(true)}
              className="!text-black border-black hover:!bg-black hover:!text-white"
            >
              Reassign Bug
            </Button>
          </div>
        </div>
      </Card>
      
      {/* Comments */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Comments ({comments.length})
        </h3>
        
        {/* Add Comment */}
        <div className="mb-6">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={currentUserProfile ? `Add a comment as ${currentUserProfile.name}...` : "Add a comment..."}
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none transition-all"
          />
          <div className="flex justify-between items-center mt-2">
            <div className="text-sm text-gray-500">
              You can use markdown in comments
            </div>
            <Button 
              size="sm"
              onClick={handleAddComment}
              disabled={!comment.trim()}
              className="!bg-black !text-white hover:!bg-gray-800"
            >
              Add Comment
            </Button>
          </div>
        </div>
        
        {/* Comment List */}
        <div className="space-y-4">
          {comments.length > 0 ? (
            comments.map((comment, index) => (
              <div key={comment?.id || index} className="flex gap-3">
                <div className="flex-shrink-0">
                  {getUserAvatar(comment?.author)}
                </div>
                <div className="flex-1">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900">{comment?.author || 'Unknown'}</span>
                        {currentUserProfile && comment?.author === currentUserProfile.name && (
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
                            You
                          </span>
                        )}
                      </div>
                      <span className="text-sm text-gray-500">
                        {comment?.createdAt ? new Date(comment.createdAt).toLocaleDateString() : 'Unknown date'}
                      </span>
                    </div>
                    <p className="text-gray-700">{comment?.text || ''}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <MessageSquare className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No comments yet. Be the first to comment!</p>
            </div>
          )}
        </div>
      </Card>
      
      {/* Delete Confirmation Modal */}
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
                      {showDeleteModal.type === 'bug' ? 'Delete Bug' : 'Delete Attachment'}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {showDeleteModal.type === 'bug' 
                        ? `Are you sure you want to delete bug "${bug?.title}"? This action cannot be undone.`
                        : `Are you sure you want to delete "${showDeleteModal.name}"? This action cannot be undone.`
                      }
                    </p>
                  </div>
                </div>
                
                <div className="flex justify-end gap-3 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => setShowDeleteModal({ show: false, type: '', id: null, name: '' })}
                    className="!text-black border-gray-300"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="error"
                    icon={Trash2}
                    onClick={showDeleteModal.type === 'bug' ? handleDeleteBug : handleDeleteAttachment}
                    disabled={deleting}
                    className="!bg-red-600 !text-white hover:!bg-red-700"
                  >
                    {deleting ? 'Deleting...' : 'Delete'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Change Status Modal with Blur Background */}
      {showStatusModal && bug && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowStatusModal(false)} />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative transform overflow-hidden rounded-lg bg-white shadow-xl transition-all w-full max-w-md">
              <ChangeStatus
                bug={bug}
                onChangeStatus={handleStatusChange}
                onCancel={() => setShowStatusModal(false)}
              />
            </div>
          </div>
        </div>
      )}
      
      {/* Reassign Modal with Blur Background */}
      {showReassignModal && bug && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowReassignModal(false)} />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative transform overflow-hidden rounded-lg bg-white shadow-xl transition-all w-full max-w-md">
              <ReassignBug
                bug={bug}
                onReassign={handleReassign}
                onCancel={() => setShowReassignModal(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BugDetail;