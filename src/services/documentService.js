import { supabase } from '../lib/supabase';

// Import activity service for logging
import { activityService } from './activityService';

export const documentService = {
  // Get all documents from storage
  async getAllDocuments() {
    try {
      // Get all files from the project-documents bucket
      const { data: files, error } = await supabase.storage
        .from('project-documents')
        .list();
      
      if (error) throw error;
      
      // Filter out empty folders and get file URLs
      const documentsWithUrls = await Promise.all(
        files
          .filter(file => file.name) // Filter out empty entries
          .map(async (file) => {
            const { data: urlData } = supabase.storage
              .from('project-documents')
              .getPublicUrl(file.name);
            
            return {
              id: file.id,
              name: file.name,
              size: `${(file.metadata?.size / 1024 / 1024).toFixed(2)} MB`,
              url: urlData.publicUrl,
              createdAt: file.created_at,
              updatedAt: file.updated_at,
              // Extract project ID from folder structure if available
              projectId: file.name.includes('/') ? file.name.split('/')[0] : null
            };
          })
      );
      
      return documentsWithUrls;
    } catch (error) {
      console.error('Error fetching all documents:', error);
      throw error;
    }
  },

  // Search documents by name
  async searchDocuments(query) {
    try {
      const allDocuments = await this.getAllDocuments();
      return allDocuments.filter(doc => 
        doc.name.toLowerCase().includes(query.toLowerCase())
      );
    } catch (error) {
      console.error('Error searching documents:', error);
      throw error;
    }
  },

  // Get documents by project ID
  async getDocumentsByProject(projectId) {
    try {
      // List files in the project folder
      const { data: files, error } = await supabase.storage
        .from('project-documents')
        .list(projectId);
      
      if (error) {
        // If folder doesn't exist, return empty array
        if (error.message.includes('not found')) {
          return [];
        }
        throw error;
      }
      
      const documentsWithUrls = await Promise.all(
        files
          .filter(file => file.name)
          .map(async (file) => {
            const filePath = `${projectId}/${file.name}`;
            const { data: urlData } = supabase.storage
              .from('project-documents')
              .getPublicUrl(filePath);
            
            return {
              id: file.id,
              name: file.name,
              size: `${(file.metadata?.size / 1024 / 1024).toFixed(2)} MB`,
              url: urlData.publicUrl,
              path: filePath,
              createdAt: file.created_at,
              updatedAt: file.updated_at,
              projectId: projectId
            };
          })
      );
      
      return documentsWithUrls;
    } catch (error) {
      console.error('Error fetching project documents:', error);
      throw error;
    }
  },

  // Delete a document from storage
  async deleteDocument(filePath, user = null) {
    try {
      // Get project ID and document name from filePath for logging
      const projectId = filePath.split('/')[0];
      const documentName = filePath.split('/')[1] || filePath;
      
      const { error } = await supabase.storage
        .from('project-documents')
        .remove([filePath]);
      
      if (error) throw error;

      // Log activity if user is provided
      if (user) {
        await activityService.logActivity({
          user_email: user.email || 'system',
          user_name: user.name || 'System',
          action: 'deleted',
          table_name: 'documents',
          record_id: filePath,
          description: `deleted document "${documentName}" from storage`,
          metadata: {
            file_path: filePath,
            document_name: documentName,
            project_id: projectId
          }
        });
      }

      return true;
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  },

  // Get file content for text files (like .md, .txt)
  async getFileContent(url, user = null) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Extract document name from URL for logging
      const documentName = url.split('/').pop() || 'unknown';
      
      // Log activity if user is provided (for viewing documents)
      if (user) {
        await activityService.logActivity({
          user_email: user.email || 'system',
          user_name: user.name || 'System',
          action: 'viewed',
          table_name: 'documents',
          record_id: url,
          description: `viewed document "${documentName}"`,
          metadata: {
            document_name: documentName,
            url: url
          }
        });
      }

      return await response.text();
    } catch (error) {
      console.error('Error fetching file content:', error);
      throw error;
    }
  },

  // NEW: Upload document directly to storage (without project association)
  async uploadDocument(file, folder = 'general', user = null) {
    try {
      // Generate a unique file name to avoid collisions
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = folder ? `${folder}/${fileName}` : fileName;
      
      // Upload file to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('project-documents')
        .upload(filePath, file);
      
      if (uploadError) throw uploadError;
      
      // Get the public URL for the uploaded file
      const { data: urlData } = supabase.storage
        .from('project-documents')
        .getPublicUrl(filePath);
      
      // Log activity if user is provided
      if (user) {
        await activityService.logActivity({
          user_email: user.email || 'system',
          user_name: user.name || 'System',
          action: 'uploaded',
          table_name: 'documents',
          record_id: filePath,
          description: `uploaded document "${file.name}" to storage`,
          metadata: {
            document_name: file.name,
            file_path: filePath,
            file_size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
            folder: folder
          }
        });
      }

      return {
        id: uploadData.id,
        name: file.name,
        path: filePath,
        url: urlData.publicUrl,
        size: file.size,
        uploadedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error uploading document:', error);
      throw error;
    }
  },

  // NEW: Get document info by file path
  async getDocumentInfo(filePath) {
    try {
      const { data: urlData } = supabase.storage
        .from('project-documents')
        .getPublicUrl(filePath);
      
      // Try to get metadata from storage
      const { data: fileData, error } = await supabase.storage
        .from('project-documents')
        .list(filePath.split('/').slice(0, -1).join('/'));
      
      if (error) {
        console.error('Error getting file metadata:', error);
      }
      
      const fileName = filePath.split('/').pop();
      const fileInfo = fileData?.find(file => file.name === fileName);
      
      return {
        name: fileName,
        url: urlData.publicUrl,
        path: filePath,
        size: fileInfo?.metadata?.size 
          ? `${(fileInfo.metadata.size / 1024 / 1024).toFixed(2)} MB`
          : 'Unknown',
        createdAt: fileInfo?.created_at,
        updatedAt: fileInfo?.updated_at
      };
    } catch (error) {
      console.error('Error getting document info:', error);
      throw error;
    }
  }
};