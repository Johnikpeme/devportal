import React, { useState, useEffect } from 'react';
import { 
  FileText, Folder, Upload, Search, Download, ExternalLink, 
  Calendar, User, Tag, Loader, AlertCircle, X, 
  ChevronDown, Plus, Check, Monitor, Smartphone, Tv
} from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import DocumentViewer from '../components/docs/DocumentViewer';
import { projectService } from '../services/projectService';
import { documentService } from '../services/documentService';

const Documentation = () => {
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [filteredDocs, setFilteredDocs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Modal states
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState({ show: false, type: '', message: '' });
  
  // Upload form states
  const [selectedProject, setSelectedProject] = useState(null);
  const [projects, setProjects] = useState([]);
  const [uploadFile, setUploadFile] = useState(null);
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);

  // Fetch all documents and projects
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get all projects first
        const projectNames = await projectService.getProjectNames();
        setProjects(projectNames);
        
        // Get all documents from all projects
        const allDocuments = await projectService.getAllDocuments();
        
        // Sort by updated date (most recent first)
        const sortedDocs = allDocuments.sort((a, b) => {
          const dateA = new Date(a.uploadedAt || a.lastUpdated || a.createdAt);
          const dateB = new Date(b.uploadedAt || b.lastUpdated || b.createdAt);
          return dateB - dateA;
        });
        
        setDocuments(sortedDocs);
        setFilteredDocs(sortedDocs);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load documents. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Filter documents based on search
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredDocs(documents);
      return;
    }
    
    const filtered = documents.filter(doc =>
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.projectDisplay?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.projectName && doc.projectName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (doc.projectCode && doc.projectCode.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    
    setFilteredDocs(filtered);
  }, [searchTerm, documents]);

  // Open upload modal
  const openUploadModal = () => {
    setIsUploadModalOpen(true);
    setSelectedProject(null);
    setUploadFile(null);
  };

  // Close upload modal
  const closeUploadModal = () => {
    setIsUploadModalOpen(false);
    setSelectedProject(null);
    setUploadFile(null);
    setShowProjectDropdown(false);
  };

  // Handle file selection
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setUploadFile(file);
    }
  };

  // Handle project selection
  const handleProjectSelect = (project) => {
    setSelectedProject(project);
    setShowProjectDropdown(false);
  };

  // Handle file upload
  const handleFileUpload = async () => {
    if (!selectedProject) {
      setUploadStatus({
        show: true,
        type: 'error',
        message: 'Please select a project first.'
      });
      setTimeout(() => setUploadStatus({ show: false, type: '', message: '' }), 3000);
      return;
    }

    if (!uploadFile) {
      setUploadStatus({
        show: true,
        type: 'error',
        message: 'Please select a file to upload.'
      });
      setTimeout(() => setUploadStatus({ show: false, type: '', message: '' }), 3000);
      return;
    }

    try {
      setUploading(true);
      
      // Upload file using projectService
      const updatedProject = await projectService.uploadDocument(selectedProject.id, uploadFile);
      
      // Refresh documents list
      const allDocuments = await projectService.getAllDocuments();
      const sortedDocs = allDocuments.sort((a, b) => {
        const dateA = new Date(a.uploadedAt || a.lastUpdated || a.createdAt);
        const dateB = new Date(b.uploadedAt || b.lastUpdated || b.createdAt);
        return dateB - dateA;
      });
      
      setDocuments(sortedDocs);
      setFilteredDocs(sortedDocs);
      
      // Show success message
      setUploadStatus({
        show: true,
        type: 'success',
        message: `Document uploaded to ${selectedProject.displayName} successfully!`
      });
      
      // Close modal after successful upload
      setTimeout(() => {
        closeUploadModal();
        setUploadStatus({ show: false, type: '', message: '' });
      }, 2000);
      
    } catch (err) {
      console.error('Error uploading file:', err);
      setUploadStatus({
        show: true,
        type: 'error',
        message: 'Failed to upload document. Please try again.'
      });
    } finally {
      setUploading(false);
    }
  };

  // Handle document click
  const handleDocumentClick = async (doc) => {
    try {
      setSelectedDoc(doc);
    } catch (err) {
      console.error('Error selecting document:', err);
      setUploadStatus({
        show: true,
        type: 'error',
        message: 'Could not open document. The file might not be accessible.'
      });
      
      setTimeout(() => {
        setUploadStatus({ show: false, type: '', message: '' });
      }, 3000);
    }
  };

  // Get file icon based on extension
  const getFileIcon = (fileName) => {
    if (!fileName) return <FileText className="w-5 h-5 text-blue-600" />;
    const extension = fileName.split('.').pop().toLowerCase();
    
    const iconClasses = {
      pdf: 'text-red-500',
      doc: 'text-blue-500',
      docx: 'text-blue-500',
      txt: 'text-gray-500',
      md: 'text-gray-700',
      jpg: 'text-green-500',
      jpeg: 'text-green-500',
      png: 'text-green-500',
      gif: 'text-green-500',
      zip: 'text-yellow-500',
      rar: 'text-yellow-500',
    };
    
    const color = iconClasses[extension] || 'text-blue-600';
    
    return <FileText className={`w-5 h-5 ${color}`} />;
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Invalid date';
    }
  };

  // Format file size
  const formatFileSize = (sizeString) => {
    if (!sizeString) return 'Size unknown';
    return sizeString;
  };

  // Get platform icon
  const getPlatformIcon = (platform) => {
    if (!platform) return <Smartphone className="w-3 h-3 text-gray-500" />;
    
    if (platform.includes('PC') || platform === 'pc') {
      return <Monitor className="w-3 h-3 text-blue-600" />;
    } else if (platform.includes('PlayStation') || platform.includes('ps5')) {
      return <Tv className="w-3 h-3 text-blue-400" />;
    } else if (platform.includes('Xbox') || platform.includes('xbox')) {
      return <Tv className="w-3 h-3 text-green-500" />;
    } else if (platform.includes('Switch') || platform.includes('Nintendo')) {
      return <Smartphone className="w-3 h-3 text-red-500" />;
    } else if (platform.includes('Android') || platform.includes('iOS') || platform.includes('mobile')) {
      return <Smartphone className="w-3 h-3 text-green-500" />;
    } else if (platform.includes('VR') || platform.includes('vr')) {
      return <Tv className="w-3 h-3 text-purple-500" />;
    } else if (platform.includes('Cloud') || platform.includes('cloud')) {
      return <Smartphone className="w-3 h-3 text-indigo-500" />;
    }
    return <Smartphone className="w-3 h-3 text-gray-500" />;
  };

  if (selectedDoc) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => setSelectedDoc(null)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition mb-4"
        >
          ← Back to All Documents
        </button>
        <DocumentViewer document={selectedDoc} />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-600" />
          <p className="text-gray-600">Loading documents...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Documents</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button 
            variant="primary"
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
  <div>
    <h1 className="text-3xl font-bold text-gray-900 mb-2">Documentation</h1>
  </div>
  <Button 
    variant="primary" 
    icon={Upload}
    onClick={openUploadModal}
    className="w-full sm:w-auto"
  >
    Upload Document
  </Button>
</div>

      {/* Upload Status Message */}
      {uploadStatus.show && (
        <div className="animate-fade-in">
          <div className={`flex items-center gap-2 px-4 py-3 rounded-lg ${
            uploadStatus.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-700' 
              : uploadStatus.type === 'error'
              ? 'bg-red-50 border border-red-200 text-red-700'
              : 'bg-blue-50 border border-blue-200 text-blue-700'
          }`}>
            {uploadStatus.type === 'success' ? (
              <Check className="w-4 h-4" />
            ) : uploadStatus.type === 'error' ? (
              <AlertCircle className="w-4 h-4" />
            ) : (
              <FileText className="w-4 h-4" />
            )}
            <span className="text-sm font-medium">{uploadStatus.message}</span>
            <button 
              onClick={() => setUploadStatus({ show: false, type: '', message: '' })}
              className="ml-auto text-gray-400 hover:text-gray-600"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="flex gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search documents by name or project..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={Search}
            fullWidth
          />
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-600" />
            <span className="text-sm text-gray-600">Total Files</span>
          </div>
          <p className="text-xl font-bold text-gray-900 mt-1">{documents.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2">
            <Folder className="w-4 h-4 text-green-600" />
            <span className="text-sm text-gray-600">Projects</span>
          </div>
          <p className="text-xl font-bold text-gray-900 mt-1">
            {new Set(documents.map(doc => doc.projectId)).size}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-purple-600" />
            <span className="text-sm text-gray-600">Last Updated</span>
          </div>
          <p className="text-sm font-medium text-gray-900 mt-1">
            {documents.length > 0 
              ? formatDate(documents[0].lastUpdated || documents[0].uploadedAt)
              : 'No documents'
            }
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-orange-600" />
            <span className="text-sm text-gray-600">Search Results</span>
          </div>
          <p className="text-xl font-bold text-gray-900 mt-1">
            {filteredDocs.length}
          </p>
        </div>
      </div>

      {/* Documents Grid */}
      {filteredDocs.length === 0 ? (
        <Card className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {searchTerm ? 'No documents found' : 'No documents yet'}
          </h3>
          <p className="text-gray-600">
            {searchTerm 
              ? 'Try a different search term'
              : 'Upload documents from project pages to see them here'
            }
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocs.map((doc) => (
            <Card 
              key={`${doc.projectId}-${doc.id}`}
              hover
              onClick={() => handleDocumentClick(doc)}
              className="cursor-pointer transition-all duration-200 hover:shadow-lg"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-gray-100 rounded-lg flex-shrink-0">
                  {getFileIcon(doc.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{doc.name}</h3>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                      {doc.projectDisplay || doc.projectName || 'Unknown Project'}
                    </span>
                    <span className="text-xs text-gray-500">•</span>
                    <span className="text-xs text-gray-500">
                      v{doc.version || '1.0'}
                    </span>
                  </div>
                  
                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(doc.lastUpdated || doc.uploadedAt)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      <span>{formatFileSize(doc.size)}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-3">
                    {doc.url && (
                      <a
                        href={doc.url}
                        onClick={(e) => e.stopPropagation()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 transition"
                      >
                        <Download className="w-3 h-3" />
                        Download
                      </a>
                    )}
                    <span className="text-gray-300">|</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDocumentClick(doc);
                      }}
                      className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 transition"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Open
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* No search results message */}
      {searchTerm && filteredDocs.length === 0 && (
        <div className="text-center py-8">
          <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">No documents found for "{searchTerm}"</p>
          <button
            onClick={() => setSearchTerm('')}
            className="text-black hover:text-gray-700 mt-2 text-sm"
          >
            Clear search
          </button>
        </div>
      )}

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={closeUploadModal} />
          <div className="flex min-h-full items-center justify-center p-4">
            <div 
              className="relative transform overflow-hidden rounded-lg bg-white shadow-xl transition-all w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Upload Document</h3>
                  <button
                    onClick={closeUploadModal}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Project Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Project
                  </label>
                  <div className="relative">
                    <button
                      onClick={() => setShowProjectDropdown(!showProjectDropdown)}
                      className={`w-full px-3 py-2 text-left border rounded-lg flex items-center justify-between ${
                        selectedProject 
                          ? 'border-black text-gray-900' 
                          : 'border-gray-300 text-gray-500'
                      }`}
                    >
                      <span>
                        {selectedProject 
                          ? selectedProject.displayName 
                          : 'Choose a project...'
                        }
                      </span>
                      <ChevronDown className={`w-4 h-4 transition-transform ${
                        showProjectDropdown ? 'rotate-180' : ''
                      }`} />
                    </button>
                    
                    {showProjectDropdown && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
                        {projects.map((project) => (
                          <button
                            key={project.id}
                            onClick={() => handleProjectSelect(project)}
                            className={`w-full px-3 py-2 text-left hover:bg-gray-100 flex items-center justify-between ${
                              selectedProject?.id === project.id ? 'bg-gray-100' : ''
                            }`}
                          >
                            <span>{project.displayName}</span>
                            {selectedProject?.id === project.id && (
                              <Check className="w-4 h-4 text-black" />
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* File Upload */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select File
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    {uploadFile ? (
                      <div className="space-y-2">
                        <FileText className="w-8 h-8 text-blue-500 mx-auto" />
                        <p className="text-sm font-medium text-gray-900">{uploadFile.name}</p>
                        <p className="text-xs text-gray-500">
                          {(uploadFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                        <button
                          onClick={() => setUploadFile(null)}
                          className="text-sm text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600 mb-1">Drag & drop or click to select</p>
                        <p className="text-xs text-gray-500 mb-3">Max file size: 50MB</p>
                        <input
                          type="file"
                          id="file-upload-input"
                          className="hidden"
                          onChange={handleFileSelect}
                        />
                        <label
                          htmlFor="file-upload-input"
                          className="inline-block px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 cursor-pointer text-sm"
                        >
                          Browse Files
                        </label>
                      </>
                    )}
                  </div>
                </div>

                {/* Upload Button */}
                <div className="flex justify-end gap-3">
                  <Button
                    variant="ghost"
                    onClick={closeUploadModal}
                    disabled={uploading}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleFileUpload}
                    disabled={!selectedProject || !uploadFile || uploading}
                    className="!bg-black !text-white hover:!bg-gray-800"
                  >
                    {uploading ? (
                      <>
                        <Loader className="w-4 h-4 animate-spin mr-2" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Document
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Documentation;