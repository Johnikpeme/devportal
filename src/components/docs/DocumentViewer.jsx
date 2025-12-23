import React, { useState, useEffect } from 'react';
import { 
  FileText, Download, ExternalLink, Eye, Calendar, Tag, 
  User, Globe, Loader, AlertCircle, Image, 
  File, FileSpreadsheet, Presentation, Film, Music, 
  Code, Book, Archive, X, Maximize2, Minimize2
} from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';

const DocumentViewer = ({ document }) => {
  const [fileContent, setFileContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [viewerUrl, setViewerUrl] = useState('');

  // Determine file type and set up preview
  useEffect(() => {
    const setupPreview = async () => {
      if (!document?.url) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const extension = document.name.split('.').pop().toLowerCase();
        
        // Check if we can preview this file type
        const previewableTypes = [
          'pdf', 'jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'txt', 
          'md', 'json', 'js', 'jsx', 'ts', 'tsx', 'css', 'html', 'xml'
        ];
        
        const isPreviewable = previewableTypes.includes(extension);
        
        if (isPreviewable) {
          // For text-based files, fetch content
          const textExtensions = ['txt', 'md', 'json', 'js', 'jsx', 'ts', 'tsx', 'css', 'html', 'xml'];
          if (textExtensions.includes(extension)) {
            try {
              const response = await fetch(document.url);
              if (response.ok) {
                const content = await response.text();
                setFileContent(content);
              } else {
                throw new Error(`Failed to fetch file: ${response.status}`);
              }
            } catch (err) {
              console.error('Error fetching text file:', err);
              setFileContent(`Error loading file content: ${err.message}`);
            }
          }
          // For images and PDFs, we'll use direct URL
        } else {
          // For Office files, use Google Docs viewer
          const officeExtensions = ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'];
          if (officeExtensions.includes(extension)) {
            // Encode the URL for Google Docs viewer
            const encodedUrl = encodeURIComponent(document.url);
            setViewerUrl(`https://docs.google.com/viewer?url=${encodedUrl}&embedded=true`);
          }
        }
        
        setError(null);
      } catch (err) {
        console.error('Error setting up preview:', err);
        setError('Could not load file preview. The file might be corrupted or inaccessible.');
      } finally {
        setLoading(false);
      }
    };

    setupPreview();
  }, [document]);

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
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

  // Get file type display name and icon
  const getFileInfo = (fileName) => {
    if (!fileName) return { name: 'Unknown', icon: <File className="w-6 h-6" /> };
    
    const extension = fileName.split('.').pop().toLowerCase();
    
    const fileTypes = {
      pdf: { name: 'PDF Document', icon: <FileText className="w-6 h-6 text-red-500" /> },
      doc: { name: 'Word Document', icon: <FileText className="w-6 h-6 text-blue-500" /> },
      docx: { name: 'Word Document', icon: <FileText className="w-6 h-6 text-blue-500" /> },
      txt: { name: 'Text File', icon: <FileText className="w-6 h-6 text-gray-500" /> },
      md: { name: 'Markdown', icon: <Book className="w-6 h-6 text-gray-700" /> },
      json: { name: 'JSON File', icon: <Code className="w-6 h-6 text-yellow-500" /> },
      js: { name: 'JavaScript', icon: <Code className="w-6 h-6 text-yellow-500" /> },
      jsx: { name: 'React Component', icon: <Code className="w-6 h-6 text-blue-400" /> },
      ts: { name: 'TypeScript', icon: <Code className="w-6 h-6 text-blue-600" /> },
      tsx: { name: 'TypeScript React', icon: <Code className="w-6 h-6 text-blue-600" /> },
      css: { name: 'Stylesheet', icon: <Code className="w-6 h-6 text-purple-500" /> },
      html: { name: 'Web Page', icon: <Code className="w-6 h-6 text-orange-500" /> },
      xml: { name: 'XML File', icon: <Code className="w-6 h-6 text-green-600" /> },
      jpg: { name: 'Image', icon: <Image className="w-6 h-6 text-green-500" /> },
      jpeg: { name: 'Image', icon: <Image className="w-6 h-6 text-green-500" /> },
      png: { name: 'Image', icon: <Image className="w-6 h-6 text-blue-500" /> },
      gif: { name: 'Image', icon: <Image className="w-6 h-6 text-purple-500" /> },
      bmp: { name: 'Image', icon: <Image className="w-6 h-6 text-gray-600" /> },
      svg: { name: 'Vector Image', icon: <Image className="w-6 h-6 text-orange-500" /> },
      xls: { name: 'Excel Spreadsheet', icon: <FileSpreadsheet className="w-6 h-6 text-green-600" /> },
      xlsx: { name: 'Excel Spreadsheet', icon: <FileSpreadsheet className="w-6 h-6 text-green-600" /> },
      ppt: { name: 'PowerPoint', icon: <Presentation className="w-6 h-6 text-orange-600" /> },
      pptx: { name: 'PowerPoint', icon: <Presentation className="w-6 h-6 text-orange-600" /> },
      zip: { name: 'Archive', icon: <Archive className="w-6 h-6 text-yellow-600" /> },
      rar: { name: 'Archive', icon: <Archive className="w-6 h-6 text-red-500" /> },
      mp4: { name: 'Video', icon: <Film className="w-6 h-6 text-purple-500" /> },
      mp3: { name: 'Audio', icon: <Music className="w-6 h-6 text-blue-500" /> },
      wav: { name: 'Audio', icon: <Music className="w-6 h-6 text-blue-500" /> },
    };
    
    return fileTypes[extension] || { 
      name: `${extension.toUpperCase()} File`, 
      icon: <File className="w-6 h-6 text-gray-500" /> 
    };
  };

  // Handle download
  const handleDownload = () => {
    if (document.url) {
      const link = document.createElement('a');
      link.href = document.url;
      link.download = document.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Handle share
  const handleShare = async () => {
    if (navigator.share && document.url) {
      try {
        await navigator.share({
          title: document.name,
          text: `Check out this document: ${document.name}`,
          url: document.url,
        });
      } catch (err) {
        console.error('Error sharing:', err);
        // Fallback to clipboard
        navigator.clipboard.writeText(document.url);
        alert('Link copied to clipboard!');
      }
    } else if (document.url) {
      // Fallback to clipboard
      navigator.clipboard.writeText(document.url);
      alert('Link copied to clipboard!');
    }
  };

  // Render content based on file type
  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader className="w-12 h-12 animate-spin text-gray-600 mb-4" />
          <p className="text-gray-600">Loading preview...</p>
          <p className="text-sm text-gray-500 mt-1">This may take a moment</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center py-12">
          <AlertCircle className="w-12 h-12 text-red-500 mr-3" />
          <div>
            <p className="text-red-600 font-medium">{error}</p>
            <p className="text-gray-600 text-sm mt-1">
              You can still download the file to view it locally.
            </p>
          </div>
        </div>
      );
    }

    const extension = document.name.split('.').pop().toLowerCase();
    const fileInfo = getFileInfo(document.name);
    
    switch (extension) {
      case 'pdf':
        return (
          <div className="w-full h-full">
            <iframe
              src={document.url}
              className="w-full h-full border-0"
              title={document.name}
              loading="lazy"
            />
          </div>
        );
        
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'bmp':
      case 'svg':
        return (
          <div className="flex flex-col items-center">
            <img
              src={document.url}
              alt={document.name}
              className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg"
              loading="lazy"
              onError={(e) => {
                e.target.src = `https://via.placeholder.com/800x600/cccccc/666666?text=Image+Not+Available`;
              }}
            />
            <div className="mt-4 text-sm text-gray-600">
              Click and drag to zoom • Right click to save
            </div>
          </div>
        );
        
      case 'doc':
      case 'docx':
      case 'xls':
      case 'xlsx':
      case 'ppt':
      case 'pptx':
        return (
          <div className="w-full h-full">
            <iframe
              src={viewerUrl}
              className="w-full h-full border-0"
              title={document.name}
              loading="lazy"
              onError={() => {
                setError('Could not load Office document preview. Please download the file to view it.');
              }}
            />
          </div>
        );
        
      case 'txt':
      case 'md':
      case 'json':
      case 'js':
      case 'jsx':
      case 'ts':
      case 'tsx':
      case 'css':
      case 'html':
      case 'xml':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-gray-50 px-4 py-2 rounded-t-lg">
              <span className="text-sm font-mono text-gray-600">{document.name}</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(fileContent);
                  alert('Content copied to clipboard!');
                }}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                Copy
              </button>
            </div>
            <pre className="whitespace-pre-wrap font-mono text-sm bg-gray-900 text-gray-100 p-4 rounded-b-lg overflow-auto max-h-[1200px]">
              {fileContent}
            </pre>
          </div>
        );
        
      case 'mp4':
      case 'webm':
      case 'ogg':
        return (
          <div className="flex flex-col items-center">
            <video
              controls
              className="w-full max-w-2xl rounded-lg shadow-lg"
              src={document.url}
              title={document.name}
            >
              Your browser does not support the video tag.
            </video>
            <div className="mt-4 text-sm text-gray-600">
              Video playback controls • Right click to save
            </div>
          </div>
        );
        
      case 'mp3':
      case 'wav':
        return (
          <div className="flex flex-col items-center p-8">
            <div className="w-full max-w-md bg-gray-100 rounded-xl p-6">
              <Music className="w-16 h-16 text-blue-500 mx-auto mb-4" />
              <audio
                controls
                className="w-full"
                src={document.url}
                title={document.name}
              >
                Your browser does not support the audio element.
              </audio>
            </div>
          </div>
        );
        
      default:
        return (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
              {fileInfo.icon}
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">
              Preview Not Available
            </h4>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              This file type cannot be previewed in the browser.
              Download the file to view it using appropriate software.
            </p>
            <Button
              variant="primary"
              icon={Download}
              onClick={handleDownload}
              className="!bg-black !text-white hover:!bg-gray-800"
            >
              Download File
            </Button>
          </div>
        );
    }
  };

  return (
    <div className={`space-y-6 ${fullscreen ? 'fixed inset-0 z-50 bg-white p-4 overflow-auto' : ''}`}>
      {/* Header */}
      <Card className={fullscreen ? 'shadow-none border-none' : ''}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {getFileInfo(document.name).icon}
              <h1 className="text-2xl font-bold text-gray-900">{document.name}</h1>
            </div>
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
              <span className="flex items-center gap-1">
                <Tag className="w-4 h-4" />
                Type: <span className="font-medium text-gray-900 ml-1">
                  {getFileInfo(document.name).name}
                </span>
              </span>
              <span className="text-gray-400">•</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Updated: <span className="font-medium text-gray-900 ml-1">
                  {formatDate(document.lastUpdated || document.uploadedAt)}
                </span>
              </span>
              <span className="text-gray-400">•</span>
              <span className="flex items-center gap-1">
                <Tag className="w-4 h-4" />
                Size: <span className="font-medium text-gray-900 ml-1">
                  {formatFileSize(document.size)}
                </span>
              </span>
            </div>
            
            {document.projectDisplay && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-600">Project:</span>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded font-medium">
                  {document.projectDisplay}
                </span>
                {document.projectCode && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded">
                    {document.projectCode}
                  </span>
                )}
              </div>
            )}
          </div>
          
          <div className="flex gap-2 flex-shrink-0">
            <Button 
              variant="ghost" 
              icon={fullscreen ? Minimize2 : Maximize2}
              size="sm"
              onClick={() => setFullscreen(!fullscreen)}
              className="hover:!bg-gray-100 !text-gray-700"
              title={fullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            />
            <Button 
              variant="ghost" 
              icon={Download} 
              size="sm"
              onClick={handleDownload}
              className="hover:!bg-gray-100 !text-gray-700"
            >
              Download
            </Button>
            <Button 
              variant="ghost" 
              icon={ExternalLink} 
              size="sm"
              onClick={handleShare}
              className="hover:!bg-gray-100 !text-gray-700"
            >
              Share
            </Button>
          </div>
        </div>
      </Card>
      
      {/* Content */}
      <Card 
        padding="none"
        className={`${fullscreen ? 'shadow-none border-none h-[calc(100vh-200px)]' : '!h-[900px]'}`} 
        style={!fullscreen ? { height: '900px' } : {}}
      >
        <div className={`${fullscreen ? 'h-full flex flex-col p-6' : 'h-full flex flex-col p-6'}`} style={{ height: '100%' }}>
          <div className="mb-4 flex items-center justify-between flex-shrink-0">
            <h3 className="text-lg font-semibold text-gray-900">Document Preview</h3>
            <span className="text-sm text-gray-500">
              {getFileInfo(document.name).name}
            </span>
          </div>
          
          <div className="border border-gray-200 rounded-lg overflow-hidden flex-1">
            <div className="h-full overflow-auto" style={{ height: '100%' }}>
              {renderContent()}
            </div>
          </div>
          
          {!fullscreen && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <div className="flex items-center gap-4">
                  <span>Document ID: <code className="bg-gray-100 px-2 py-1 rounded">{document.id || 'N/A'}</code></span>
                  {document.version && (
                    <span>Version: <span className="font-medium">{document.version}</span></span>
                  )}
                </div>
                <a 
                  href={document.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-black hover:text-gray-700"
                >
                  <Globe className="w-4 h-4" />
                  Direct Link
                </a>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Exit fullscreen button (floating) */}
      {fullscreen && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button
            variant="primary"
            icon={Minimize2}
            onClick={() => setFullscreen(false)}
            className="!bg-black !text-white shadow-lg"
          >
            Exit Fullscreen
          </Button>
        </div>
      )}
    </div>
  );
};

export default DocumentViewer;