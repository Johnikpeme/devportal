import { supabase } from '../lib/supabase';

// Import activity service for logging
import { activityService } from './activityService';

export const projectService = {
  // Create project (without authentication)
  async createProject(projectData, user = null) {
    try {
      // Transform data to match database schema
      const project = {
        name: projectData.name,
        code_name: projectData.codeName || '',
        description: projectData.description || '',
        status: projectData.status || 'active',
        progress: projectData.progress || 0,
        platform: Array.isArray(projectData.platform) ? projectData.platform : [projectData.platform],
        genre: Array.isArray(projectData.genre) ? projectData.genre : [projectData.genre],
        // Note: created_by is left as null since we don't have authentication
        maturity_rating: projectData.maturityRating || '',
        start_date: projectData.startDate || null,
        target_release: projectData.targetRelease || null,
        team: projectData.team || { total: 0, breakdown: {} },
        lead: projectData.lead || {},
        bugs: projectData.bugs || { critical: 0, high: 0, medium: 0, low: 0 },
        gameplay: projectData.gameplay || {
          features: [],
          perspective: '',
          gameplayStyle: '',
          difficultyModes: [],
          estimatedPlaytime: { mainStory: '', completionist: '' }
        },
        technical: projectData.technical || {
          api: '',
          dlss: false,
          engine: '',
          renderer: '',
          languages: [],
          rayTracing: false,
          resolution: '',
          storageRequired: ''
        },
        art_style: projectData.artStyle || {
          theme: '',
          inspiration: '',
          colorPalette: '',
          polygonCount: { environment: 0, mainCharacter: 0 },
          textureResolution: ''
        },
        audio: projectData.audio || {
          composer: '',
          languages: 0,
          soundtrack: '',
          voiceActors: 0,
          estimatedMusicTracks: 0
        },
        budget: projectData.budget || {
          spent: 0,
          total: 0,
          allocated: {},
          remaining: 0,
          pricePoints: { deluxe: 0, standard: 0, collector: 0 },
          projectedRevenue: 0
        },
        milestones: projectData.milestones || [],
        documents: projectData.documents || [],
        builds: projectData.builds || [],
        risks: projectData.risks || [],
        post_launch: projectData.postLaunch || {
          roadmap: [],
          plannedDLC: 0,
          seasonPass: false,
          liveService: false
        },
        lore: projectData.lore || '',
        awards: projectData.awards || [],
        is_archived: projectData.isArchived || false
      };

      const { data, error } = await supabase
        .from('projects')
        .insert([project])
        .select()
        .single();
      
      if (error) throw error;

      // Log activity if user is provided
      if (user) {
        await activityService.logProjectActivity(user, data, 'created', {
          project_name: data.name,
          project_id: data.id
        });
      }

      return data;
    } catch (error) {
      console.error('Error in createProject:', error);
      throw error;
    }
  },

  // Get all projects
  async getProjects() {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Get all project names for dropdowns (simplified version)
  async getAllProjects() {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('id, name')
        .order('name', { ascending: true });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching projects:', error);
      throw error;
    }
  },

  // Get active projects only (for dropdowns)
  async getActiveProjects() {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('id, name')
        .eq('is_archived', false)
        .order('name', { ascending: true });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching active projects:', error);
      throw error;
    }
  },

  // Get single project
  async getProject(id) {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Update project
  async updateProject(id, updates, user = null) {
    const { data, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;

    // Log activity if user is provided
    if (user) {
      await activityService.logProjectActivity(user, data, 'updated', {
        project_name: data.name,
        project_id: data.id,
        changes: Object.keys(updates)
      });
    }

    return data;
  },

  // Delete project
  async deleteProject(id, user = null) {
    // Get project info before deleting for logging
    let projectInfo = null;
    if (user) {
      try {
        const { data } = await supabase
          .from('projects')
          .select('name')
          .eq('id', id)
          .single();
        projectInfo = data;
      } catch (error) {
        console.error('Error fetching project for logging:', error);
      }
    }

    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);
    
    if (error) throw error;

    // Log activity if user is provided
    if (user && projectInfo) {
      await activityService.logProjectActivity(user, { id, name: projectInfo.name }, 'deleted', {
        project_name: projectInfo.name,
        project_id: id
      });
    }

    return true;
  },

  // Search projects
  async searchProjects(query) {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Get project names with IDs for dropdowns
  async getProjectNames() {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('id, name, code_name')
        .eq('is_archived', false)
        .order('name', { ascending: true });
      
      if (error) throw error;
      
      // Format for dropdown: "Project Name (Code)" or just "Project Name"
      return data.map(project => ({
        id: project.id,
        name: project.name,
        displayName: project.code_name 
          ? `${project.name} (${project.code_name})`
          : project.name
      }));
    } catch (error) {
      console.error('Error fetching project names:', error);
      throw error;
    }
  },

  // NEW: Upload document to project
  async uploadDocument(projectId, file, user = null) {
    try {
      // Generate a unique file name to avoid collisions
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${projectId}/${fileName}`;
      
      // Upload file to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('project-documents')
        .upload(filePath, file);
      
      if (uploadError) throw uploadError;
      
      // Get the public URL for the uploaded file
      const { data: urlData } = supabase.storage
        .from('project-documents')
        .getPublicUrl(filePath);
      
      // Create document object
      const document = {
        id: Date.now().toString() + Math.random().toString(36).substring(2),
        name: file.name,
        version: '1.0', // Default version
        lastUpdated: new Date().toISOString().split('T')[0],
        size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
        url: urlData.publicUrl,
        storagePath: filePath,
        uploadedAt: new Date().toISOString()
      };
      
      // Get current project to update documents array
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('documents, name')
        .eq('id', projectId)
        .single();
      
      if (projectError) throw projectError;
      
      // Add new document to the array
      const updatedDocuments = [...(project.documents || []), document];
      
      // Update project with new document
      const { data: updatedProject, error: updateError } = await supabase
        .from('projects')
        .update({ 
          documents: updatedDocuments,
          updated_at: new Date().toISOString()
        })
        .eq('id', projectId)
        .select()
        .single();
      
      if (updateError) throw updateError;

      // Log activity if user is provided
      if (user) {
        await activityService.logActivity({
          user_email: user.email || 'system',
          user_name: user.name || 'System',
          action: 'uploaded',
          table_name: 'documents',
          record_id: projectId,
          description: `uploaded document "${file.name}" to project "${project.name}"`,
          metadata: {
            project_name: project.name,
            project_id: projectId,
            document_name: file.name,
            document_size: `${(file.size / 1024 / 1024).toFixed(2)} MB`
          }
        });
      }

      return updatedProject;
    } catch (error) {
      console.error('Error uploading document:', error);
      throw error;
    }
  },

  // NEW: Delete document from project
  async deleteDocument(projectId, documentId, storagePath, user = null) {
    try {
      // Get project info before deleting for logging
      let projectInfo = null;
      let documentInfo = null;
      if (user) {
        try {
          const { data: project } = await supabase
            .from('projects')
            .select('name, documents')
            .eq('id', projectId)
            .single();
          projectInfo = project;
          
          // Find the document being deleted
          if (projectInfo.documents) {
            documentInfo = projectInfo.documents.find(doc => doc.id === documentId);
          }
        } catch (error) {
          console.error('Error fetching project for logging:', error);
        }
      }
      
      // First, delete the file from storage
      if (storagePath) {
        const { error: storageError } = await supabase.storage
          .from('project-documents')
          .remove([storagePath]);
        
        if (storageError) {
          console.error('Error deleting file from storage:', storageError);
          // Continue anyway to delete from database
        }
      }
      
      // Get current project to update documents array
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('documents')
        .eq('id', projectId)
        .single();
      
      if (projectError) throw projectError;
      
      // Remove document from the array
      const updatedDocuments = (project.documents || []).filter(
        doc => doc.id !== documentId
      );
      
      // Update project with removed document
      const { data: updatedProject, error: updateError } = await supabase
        .from('projects')
        .update({ 
          documents: updatedDocuments,
          updated_at: new Date().toISOString()
        })
        .eq('id', projectId)
        .select()
        .single();
      
      if (updateError) throw updateError;

      // Log activity if user is provided
      if (user && projectInfo && documentInfo) {
        await activityService.logActivity({
          user_email: user.email || 'system',
          user_name: user.name || 'System',
          action: 'deleted',
          table_name: 'documents',
          record_id: projectId,
          description: `deleted document "${documentInfo.name}" from project "${projectInfo.name}"`,
          metadata: {
            project_name: projectInfo.name,
            project_id: projectId,
            document_name: documentInfo.name,
            document_id: documentId
          }
        });
      }

      return updatedProject;
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  },

  // NEW: Get all documents from all projects
  async getAllDocuments() {
    try {
      // First, get all projects with their documents
      const { data: projects, error: projectsError } = await supabase
        .from('projects')
        .select('id, name, code_name, documents')
        .order('name', { ascending: true });
      
      if (projectsError) throw projectsError;
      
      // Flatten all documents from all projects and add project information
      const allDocuments = projects.flatMap(project => {
        // Skip projects with no documents
        if (!project.documents || !Array.isArray(project.documents)) {
          return [];
        }
        
        return project.documents.map(doc => ({
          ...doc,
          projectId: project.id,
          projectName: project.name,
          projectCode: project.code_name,
          projectDisplay: project.code_name 
            ? `${project.name} (${project.code_name})`
            : project.name
        }));
      });
      
      // Sort by upload date (most recent first)
      allDocuments.sort((a, b) => {
        const dateA = new Date(a.uploadedAt || a.lastUpdated || 0);
        const dateB = new Date(b.uploadedAt || b.lastUpdated || 0);
        return dateB - dateA;
      });
      
      return allDocuments;
    } catch (error) {
      console.error('Error fetching all documents:', error);
      throw error;
    }
  },

  // NEW: Get documents by project ID
  async getDocumentsByProject(projectId) {
    try {
      // Get the specific project with its documents
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('documents')
        .eq('id', projectId)
        .single();
      
      if (projectError) throw projectError;
      
      // Return documents array or empty array if none
      return project.documents || [];
    } catch (error) {
      console.error('Error fetching project documents:', error);
      throw error;
    }
  }
};