import React, { useState, useEffect, useRef } from 'react';
import { Upload, X, Loader, Paperclip, File, Image as ImageIcon, FileCode, Video, Check, AlertOctagon } from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';
import Input from '../common/Input';
import { projectService } from '../../services/projectService';
import { bugService } from '../../services/bugService';

const CreateBug = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    severity: 'moderate',
    project: '',
    steps: '',
    expectedBehavior: '',
    actualBehavior: '',
    tags: '',
    version: '1.0.0',
    environment: '',
    platform: '',
    reportedBy: 'Current User',
    assignedTo: 'Unassigned',
    status: 'open'
  });
  
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [attachments, setAttachments] = useState([]);
  const [uploadingFiles, setUploadingFiles] = useState([]);
  const [uploadStatus, setUploadStatus] = useState({ show: false, type: '', message: '' });
  
  const fileInputRef = useRef(null);
  const isSubmitting = useRef(false);
  
  // Auto-hide status messages
  useEffect(() => {
    if (uploadStatus.show) {
      const timer = setTimeout(() => {
        setUploadStatus({ show: false, type: '', message: '' });
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [uploadStatus.show]);
  
  // Load actual projects from database
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoadingProjects(true);
        const allProjects = await projectService.getAllProjects();
        const projectNames = allProjects.map(project => project.name);
        setProjects(projectNames);
      } catch (err) {
        console.error('Error loading projects:', err);
        setProjects(['Neon Pursuit', 'Shadow Valley', 'Cosmic Racers']);
      } finally {
        setLoadingProjects(false);
      }
    };
    
    fetchProjects();
  }, []);
  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
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
  
  const handleChooseFilesClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    
    if (!files.length) return;
    
    // Reset the file input
    e.target.value = '';
    
    // Check total file size (max 50MB total)
    const totalSize = files.reduce((total, file) => total + file.size, 0);
    const existingSize = attachments.reduce((total, att) => total + (att.size || 0), 0);
    
    if ((totalSize + existingSize) > 50 * 1024 * 1024) {
      setUploadStatus({
        show: true,
        type: 'error',
        message: 'Total attachment size exceeds 50MB limit'
      });
      return;
    }
    
    // Add files to uploading state
    const newUploadingFiles = files.map(file => ({
      file,
      id: Date.now() + Math.random(),
      name: file.name
    }));
    
    setUploadingFiles(prev => [...prev, ...newUploadingFiles]);
    
    // Process each file
    const processedAttachments = [];
    
    for (const file of files) {
      try {
        const attachment = {
          id: Date.now() + Math.random(),
          name: file.name,
          size: file.size,
          type: file.type,
          file: file,
          status: 'pending'
        };
        
        processedAttachments.push(attachment);
      } catch (err) {
        console.error('Error processing file:', err);
      }
    }
    
    // Add processed attachments
    setAttachments(prev => [...prev, ...processedAttachments]);
    
    // Remove from uploading files after a short delay
    setTimeout(() => {
      setUploadingFiles(prev => prev.filter(uploadingFile => 
        !newUploadingFiles.some(newFile => newFile.id === uploadingFile.id)
      ));
    }, 500);
  };
  
  const removeAttachment = (index) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Prevent double submission
    if (isSubmitting.current || loading) {
      return;
    }
    
    // Basic validation
    if (!formData.title.trim() || !formData.description.trim() || !formData.project) {
      setUploadStatus({
        show: true,
        type: 'error',
        message: 'Please fill in all required fields'
      });
      return;
    }
    
    isSubmitting.current = true;
    setLoading(true);
    
    try {
      // Step 1: Create the bug in Supabase FIRST
      const bugData = {
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        severity: formData.severity,
        project: formData.project,
        reproductionSteps: formData.steps,
        expectedBehavior: formData.expectedBehavior,
        actualBehavior: formData.actualBehavior,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        version: formData.version,
        environment: formData.environment,
        platform: formData.platform,
        reportedBy: formData.reportedBy,
        assignedTo: formData.assignedTo,
        status: formData.status,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        attachments: [] // Initialize with empty array
      };
      
      // Create the bug in database
      const createdBug = await bugService.createBug(bugData);
      
      // Step 2: Upload attachments if any
      let uploadedAttachments = [];
      
      if (attachments.length > 0) {
        setUploadStatus({
          show: true,
          type: 'info',
          message: `Uploading ${attachments.length} attachment(s)...`
        });
        
        for (const attachment of attachments) {
          try {
            // Update attachment status to uploading
            setAttachments(prev => prev.map(att => 
              att.id === attachment.id 
                ? { ...att, status: 'uploading' }
                : att
            ));
            
            // Upload each file to Supabase storage
            const uploadedAttachment = await bugService.uploadAttachment(createdBug.id, attachment.file);
            
            uploadedAttachments.push({
              ...uploadedAttachment,
              name: attachment.name,
              size: attachment.size,
              type: attachment.type
            });
            
            // Update attachment status to success
            setAttachments(prev => prev.map(att => 
              att.id === attachment.id 
                ? { ...att, status: 'success', url: uploadedAttachment.url }
                : att
            ));
            
          } catch (err) {
            console.error(`Error uploading ${attachment.name}:`, err);
            
            // Update attachment status to failed
            setAttachments(prev => prev.map(att => 
              att.id === attachment.id 
                ? { ...att, status: 'error', error: err.message }
                : att
            ));
          }
        }
        
        // Step 3: Update bug with attachment references
        if (uploadedAttachments.length > 0) {
          await bugService.updateBug(createdBug.id, {
            attachments: uploadedAttachments
          });
        }
      }
      
      // Step 4: Get the complete bug data
      const fullBugData = await bugService.getBug(createdBug.id);
      
      // Step 5: Show success message
      const successMessage = attachments.length > 0
        ? `Bug created successfully with ${uploadedAttachments.length} attachment(s)`
        : 'Bug created successfully';
      
      setUploadStatus({
        show: true,
        type: 'success',
        message: successMessage
      });
      
      // Step 6: Only call parent's onSubmit AFTER everything is done
      // This should NOT create another bug - it should just handle what to do next
      if (onSubmit) {
        // Pass the created bug data to parent
        await onSubmit(fullBugData);
      }
      
      // Step 7: If no parent handler, clear form after a delay
      if (!onSubmit) {
        setTimeout(() => {
          resetForm();
        }, 2000);
      }
      
    } catch (err) {
      console.error('Error submitting bug:', err);
      setUploadStatus({
        show: true,
        type: 'error',
        message: err.message || 'Failed to create bug. Please try again.'
      });
    } finally {
      isSubmitting.current = false;
      setLoading(false);
    }
  };
  
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      priority: 'medium',
      severity: 'moderate',
      project: '',
      steps: '',
      expectedBehavior: '',
      actualBehavior: '',
      tags: '',
      version: '1.0.0',
      environment: '',
      platform: '',
      reportedBy: 'Current User',
      assignedTo: 'Unassigned',
      status: 'open'
    });
    setAttachments([]);
    setUploadStatus({ show: false, type: '', message: '' });
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Report a Bug</h2>
        
        {/* Upload Status Message */}
        {uploadStatus.show && (
          <div className="mb-6 animate-fade-in">
            <div className={`flex items-center gap-2 px-4 py-3 rounded-lg ${
              uploadStatus.type === 'success' 
                ? 'bg-green-50 border border-green-200 text-green-700' 
                : uploadStatus.type === 'error'
                ? 'bg-red-50 border border-red-200 text-red-700'
                : uploadStatus.type === 'warning'
                ? 'bg-yellow-50 border border-yellow-200 text-yellow-700'
                : 'bg-blue-50 border border-blue-200 text-blue-700'
            }`}>
              {uploadStatus.type === 'success' ? (
                <Check className="w-5 h-5" />
              ) : uploadStatus.type === 'error' ? (
                <AlertOctagon className="w-5 h-5" />
              ) : (
                <Loader className="w-5 h-5 animate-spin" />
              )}
              <span className="text-sm font-medium">{uploadStatus.message}</span>
              <button 
                type="button"
                onClick={() => setUploadStatus({ show: false, type: '', message: '' })}
                className="ml-auto text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
        
        <div className="space-y-6">
          {/* Title */}
          <Input
            label="Bug Title *"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Brief description of the bug"
            required
            fullWidth
          />
          
          {/* Project & Priority & Severity */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project *
              </label>
              {loadingProjects ? (
                <div className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50">
                  <Loader className="w-4 h-4 animate-spin text-gray-400" />
                  <span className="text-sm text-gray-500">Loading projects...</span>
                </div>
              ) : (
                <select
                  name="project"
                  value={formData.project}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                >
                  <option value="">Select Project *</option>
                  {projects.map(project => (
                    <option key={project} value={project}>{project}</option>
                  ))}
                </select>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Severity
              </label>
              <select
                name="severity"
                value={formData.severity}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              >
                <option value="minor">Minor</option>
                <option value="moderate">Moderate</option>
                <option value="major">Major</option>
                <option value="game-breaking">Game Breaking</option>
              </select>
            </div>
          </div>
          
          {/* Version, Environment, Platform */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Version
              </label>
              <input
                type="text"
                name="version"
                value={formData.version}
                onChange={handleChange}
                placeholder="1.0.0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Environment
              </label>
              <select
                name="environment"
                value={formData.environment}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              >
                <option value="">Select Environment</option>
                <option value="Development">Development</option>
                <option value="Staging">Staging</option>
                <option value="Production">Production</option>
                <option value="Testing">Testing</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Platform
              </label>
              <select
                name="platform"
                value={formData.platform}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              >
                <option value="">Select Platform</option>
                <option value="PC">PC</option>
                <option value="PlayStation 5">PlayStation 5</option>
                <option value="Xbox Series X">Xbox Series X</option>
                <option value="Xbox Series S">Xbox Series S</option>
                <option value="Nintendo Switch">Nintendo Switch</option>
                <option value="Cross-platform">Cross-platform</option>
              </select>
            </div>
          </div>
          
          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              required
              placeholder="Detailed description of the bug"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none"
            />
          </div>
          
          {/* Steps to Reproduce */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Steps to Reproduce
            </label>
            <textarea
              name="steps"
              value={formData.steps}
              onChange={handleChange}
              rows={3}
              placeholder="1. Go to...&#10;2. Click on...&#10;3. See error"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none"
            />
          </div>
          
          {/* Expected vs Actual */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expected Behavior
              </label>
              <textarea
                name="expectedBehavior"
                value={formData.expectedBehavior}
                onChange={handleChange}
                rows={3}
                placeholder="What should happen"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Actual Behavior
              </label>
              <textarea
                name="actualBehavior"
                value={formData.actualBehavior}
                onChange={handleChange}
                rows={3}
                placeholder="What actually happens"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none"
              />
            </div>
          </div>
          
          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="gameplay, ui, audio (comma-separated)"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            />
            <p className="text-sm text-gray-500 mt-1">Add relevant tags separated by commas</p>
          </div>
          
          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Attachments
            </label>
            
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileUpload}
              className="hidden"
              accept="image/*,video/*,.pdf,.doc,.docx,.txt,.log,.zip,.rar,.js,.jsx,.ts,.tsx,.py,.java,.cpp,.c"
            />
            
            {/* Upload area */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-2">
                Drag files here or click to upload
              </p>
              <p className="text-xs text-gray-500 mb-4">Max file size: 50MB per file</p>
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={handleChooseFilesClick}
                disabled={loading}
                className="!text-black border-black hover:!bg-black hover:!text-white"
              >
                {uploadingFiles.length > 0 ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  'Choose Files'
                )}
              </Button>
            </div>
            
            {/* Uploading Files */}
            {uploadingFiles.length > 0 && (
              <div className="mt-3 space-y-2">
                <p className="text-sm text-gray-600 font-medium mb-2">Processing files:</p>
                {uploadingFiles.map((uploadingFile) => (
                  <div 
                    key={uploadingFile.id}
                    className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-100"
                  >
                    <div className="flex items-center gap-3">
                      {getFileIcon(uploadingFile.name)}
                      <span className="text-sm text-gray-700">{uploadingFile.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Loader className="w-4 h-4 animate-spin text-blue-500" />
                      <span className="text-xs text-blue-600">Processing...</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Attachment List */}
            {attachments.length > 0 && (
              <div className="mt-3 space-y-2">
                <p className="text-sm text-gray-600 font-medium mb-2">
                  Selected files ({attachments.length}):
                </p>
                {attachments.map((attachment, index) => (
                  <div 
                    key={attachment.id}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      attachment.status === 'error' 
                        ? 'bg-red-50 border border-red-100'
                        : attachment.status === 'success'
                        ? 'bg-green-50 border border-green-100'
                        : attachment.status === 'uploading'
                        ? 'bg-blue-50 border border-blue-100'
                        : 'bg-gray-50 border border-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {getFileIcon(attachment.name)}
                      <div className="min-w-0">
                        <p className="text-sm text-gray-700 truncate">{attachment.name}</p>
                        <p className="text-xs text-gray-500">
                          {(attachment.size / 1024 / 1024).toFixed(2)} MB
                          {attachment.status === 'uploading' && ' • Uploading...'}
                          {attachment.status === 'success' && ' • Ready'}
                          {attachment.status === 'error' && ' • Failed'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {attachment.status === 'error' && (
                        <span className="text-xs text-red-600 font-medium">Failed</span>
                      )}
                      <button
                        type="button"
                        onClick={() => removeAttachment(index)}
                        className="text-gray-400 hover:text-red-600 transition-colors p-1"
                        disabled={attachment.status === 'uploading'}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {attachments.length > 0 && (
              <div className="mt-2 text-xs text-gray-500">
                Total: {attachments.length} file(s), 
                {((attachments.reduce((total, att) => total + (att.size || 0), 0)) / 1024 / 1024).toFixed(2)} MB
              </div>
            )}
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
          <Button 
            type="button" 
            variant="ghost" 
            onClick={onCancel}
            disabled={loading}
            className="!text-black hover:!bg-gray-100"
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="primary"
            disabled={loading || loadingProjects}
            className="!bg-black !text-white hover:!bg-gray-800"
          >
            {loading ? (
              <>
                <Loader className="w-4 h-4 animate-spin mr-2" />
                Creating Bug...
              </>
            ) : 'Submit Bug Report'}
          </Button>
        </div>
      </Card>
    </form>
  );
};

export default CreateBug;