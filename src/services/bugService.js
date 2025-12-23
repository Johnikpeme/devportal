import { supabase } from './supabaseClient';

// Import activity service for logging
import { activityService } from './activityService';

export const bugService = {
  // Get all bugs
  async getBugs() {
    try {
      const { data, error } = await supabase
        .from('bugs')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Transform data to match your component's expected format
      return data.map(bug => ({
        id: bug.id,
        title: bug.title,
        description: bug.description,
        priority: bug.priority,
        status: bug.status,
        severity: bug.severity,
        project: bug.project,
        reportedBy: bug.reported_by,
        assignedTo: bug.assigned_to,
        version: bug.version,
        environment: bug.environment,
        platform: bug.platform,
        tags: bug.tags || [],
        reproductionSteps: bug.reproduction_steps,
        expectedBehavior: bug.expected_behavior,
        actualBehavior: bug.actual_behavior,
        attachments: bug.attachments || [],
        problem: bug.problem,
        solution: bug.solution,
        remedy: bug.remedy,
        pullRequest: bug.pull_request,
        resolution: bug.resolution,
        comments: bug.comments || [],
        createdAt: bug.created_at,
        updatedAt: bug.updated_at,
        resolvedAt: bug.resolved_at
      }));
    } catch (error) {
      console.error('Error fetching bugs:', error);
      throw error;
    }
  },

  // Get single bug by ID
  async getBug(id) {
    try {
      const { data, error } = await supabase
        .from('bugs')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      if (!data) return null;
      
      // Transform data
      return {
        id: data.id,
        title: data.title,
        description: data.description,
        priority: data.priority,
        status: data.status,
        severity: data.severity,
        project: data.project,
        reportedBy: data.reported_by,
        assignedTo: data.assigned_to,
        version: data.version,
        environment: data.environment,
        platform: data.platform,
        tags: data.tags || [],
        reproductionSteps: data.reproduction_steps,
        expectedBehavior: data.expected_behavior,
        actualBehavior: data.actual_behavior,
        attachments: data.attachments || [],
        problem: data.problem,
        solution: data.solution,
        remedy: data.remedy,
        pullRequest: data.pull_request,
        resolution: data.resolution,
        comments: data.comments || [],
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        resolvedAt: data.resolved_at
      };
    } catch (error) {
      console.error('Error fetching bug:', error);
      throw error;
    }
  },

  // Create new bug
  async createBug(bugData, user = null) {
    try {
      console.log('Creating bug with data:', bugData);
      
      // Transform data to match database schema
      const dbBugData = {
        title: bugData.title,
        description: bugData.description,
        priority: bugData.priority,
        status: 'open', // Default status
        severity: bugData.severity || 'moderate',
        project: bugData.project,
        reported_by: bugData.reportedBy || 'Current User',
        assigned_to: bugData.assignedTo || 'Unassigned',
        version: bugData.version || '1.0.0',
        environment: bugData.environment || '',
        platform: bugData.platform || '',
        tags: Array.isArray(bugData.tags) ? bugData.tags : (bugData.tags || '').split(',').map(t => t.trim()).filter(t => t),
        reproduction_steps: bugData.reproductionSteps || bugData.steps || '',
        expected_behavior: bugData.expectedBehavior || '',
        actual_behavior: bugData.actualBehavior || '',
        attachments: bugData.attachments || [],
        problem: bugData.problem || '',
        solution: bugData.solution || '',
        remedy: bugData.remedy || '',
        pull_request: bugData.pullRequest || '',
        resolution: bugData.resolution || '',
        comments: bugData.comments || []
      };

      console.log('Transformed bug data for DB:', dbBugData);

      const { data, error } = await supabase
        .from('bugs')
        .insert([dbBugData])
        .select()
        .single();
      
      if (error) {
        console.error('Supabase insert error:', error);
        console.error('Error details:', error.message, error.details, error.hint);
        throw error;
      }
      
      console.log('Bug created successfully:', data);
      
      // Transform response back
      const transformedBug = {
        id: data.id,
        title: data.title,
        description: data.description,
        priority: data.priority,
        status: data.status,
        severity: data.severity,
        project: data.project,
        reportedBy: data.reported_by,
        assignedTo: data.assigned_to,
        version: data.version,
        environment: data.environment,
        platform: data.platform,
        tags: data.tags || [],
        reproductionSteps: data.reproduction_steps,
        expectedBehavior: data.expected_behavior,
        actualBehavior: data.actual_behavior,
        attachments: data.attachments || [],
        problem: data.problem,
        solution: data.solution,
        remedy: data.remedy,
        pullRequest: data.pull_request,
        resolution: data.resolution,
        comments: data.comments || [],
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        resolvedAt: data.resolved_at
      };

      // Log activity if user is provided
      if (user) {
        await activityService.logBugActivity(user, transformedBug, 'created', {
          bug_title: data.title,
          bug_id: data.id,
          priority: data.priority,
          project: data.project
        });
      }

      return transformedBug;
    } catch (error) {
      console.error('Error in createBug function:', error);
      throw error;
    }
  },

  // Update bug
  async updateBug(id, updates, user = null) {
    try {
      // Get current bug info before updating for logging
      let currentBug = null;
      if (user) {
        try {
          const { data } = await supabase
            .from('bugs')
            .select('*')
            .eq('id', id)
            .single();
          currentBug = data;
        } catch (error) {
          console.error('Error fetching bug for logging:', error);
        }
      }
      
      // Transform updates to match database schema
      const dbUpdates = {};
      
      // Map fields to database column names
      const fieldMap = {
        title: 'title',
        description: 'description',
        priority: 'priority',
        status: 'status',
        severity: 'severity',
        project: 'project',
        reportedBy: 'reported_by',
        assignedTo: 'assigned_to',
        version: 'version',
        environment: 'environment',
        platform: 'platform',
        tags: 'tags',
        reproductionSteps: 'reproduction_steps',
        expectedBehavior: 'expected_behavior',
        actualBehavior: 'actual_behavior',
        attachments: 'attachments',
        problem: 'problem',
        solution: 'solution',
        remedy: 'remedy',
        pullRequest: 'pull_request',
        resolution: 'resolution',
        comments: 'comments'
      };

      Object.keys(updates).forEach(key => {
        const dbField = fieldMap[key] || key;
        dbUpdates[dbField] = updates[key];
        
        // Special handling for resolved_at
        if (key === 'status' && (updates[key] === 'resolved' || updates[key] === 'closed')) {
          dbUpdates.resolved_at = new Date().toISOString();
        }
      });

      // Always update the updated_at timestamp
      dbUpdates.updated_at = new Date().toISOString();

      const { data, error } = await supabase
        .from('bugs')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      // Transform response back
      const transformedBug = {
        id: data.id,
        title: data.title,
        description: data.description,
        priority: data.priority,
        status: data.status,
        severity: data.severity,
        project: data.project,
        reportedBy: data.reported_by,
        assignedTo: data.assigned_to,
        version: data.version,
        environment: data.environment,
        platform: data.platform,
        tags: data.tags || [],
        reproductionSteps: data.reproduction_steps,
        expectedBehavior: data.expected_behavior,
        actualBehavior: data.actual_behavior,
        attachments: data.attachments || [],
        problem: data.problem,
        solution: data.solution,
        remedy: data.remedy,
        pullRequest: data.pull_request,
        resolution: data.resolution,
        comments: data.comments || [],
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        resolvedAt: data.resolved_at
      };

      // Log activity if user is provided
      if (user && currentBug) {
        // Check what changed for better logging
        const changes = Object.keys(updates);
        let action = 'updated';
        let metadata = {
          bug_title: data.title,
          bug_id: data.id,
          changes: changes
        };

        // Special handling for status changes
        if (updates.status) {
          action = updates.status === 'resolved' ? 'resolved' : 
                   updates.status === 'closed' ? 'closed' : 
                   updates.status === 'in-progress' ? 'started_progress' : 'updated_status';
          
          metadata.old_status = currentBug.status;
          metadata.new_status = updates.status;
        }

        // Special handling for assignment changes
        if (updates.assignedTo) {
          metadata.old_assigned = currentBug.assigned_to;
          metadata.new_assigned = updates.assignedTo;
        }

        await activityService.logBugActivity(user, transformedBug, action, metadata);
      }

      return transformedBug;
    } catch (error) {
      console.error('Error updating bug:', error);
      throw error;
    }
  },

  // Delete bug
  async deleteBug(id, user = null) {
    try {
      // Get bug info before deleting for logging
      let bugInfo = null;
      if (user) {
        try {
          const { data } = await supabase
            .from('bugs')
            .select('title')
            .eq('id', id)
            .single();
          bugInfo = data;
        } catch (error) {
          console.error('Error fetching bug for logging:', error);
        }
      }

      const { error } = await supabase
        .from('bugs')
        .delete()
        .eq('id', id);
      
      if (error) throw error;

      // Log activity if user is provided
      if (user && bugInfo) {
        await activityService.logBugActivity(user, { id, title: bugInfo.title }, 'deleted', {
          bug_title: bugInfo.title,
          bug_id: id
        });
      }

      return true;
    } catch (error) {
      console.error('Error deleting bug:', error);
      throw error;
    }
  },

  // Add comment to bug
  async addComment(bugId, comment, user = null) {
    try {
      // First get current bug
      const { data: bugData, error: fetchError } = await supabase
        .from('bugs')
        .select('comments, title')
        .eq('id', bugId)
        .single();
      
      if (fetchError) throw fetchError;
      
      const currentComments = bugData.comments || [];
      const newComment = {
        id: Date.now(),
        author: comment.author || 'Current User',
        text: comment.text,
        createdAt: new Date().toISOString()
      };
      
      const updatedComments = [...currentComments, newComment];
      
      const { data, error } = await supabase
        .from('bugs')
        .update({ 
          comments: updatedComments,
          updated_at: new Date().toISOString()
        })
        .eq('id', bugId)
        .select()
        .single();
      
      if (error) throw error;

      // Log activity if user is provided
      if (user) {
        await activityService.logActivity({
          user_email: user.email || 'system',
          user_name: user.name || 'System',
          action: 'commented',
          table_name: 'comments',
          record_id: bugId,
          description: `added comment to bug "${bugData.title}"`,
          metadata: {
            bug_title: bugData.title,
            bug_id: bugId,
            comment_preview: comment.text.substring(0, 100) + (comment.text.length > 100 ? '...' : '')
          }
        });
      }

      return data.comments;
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  },

  // Get bug statistics
  async getBugStats() {
    try {
      const { data: bugs, error } = await supabase
        .from('bugs')
        .select('status, priority');
      
      if (error) throw error;
      
      const stats = {
        total: bugs.length,
        open: bugs.filter(b => b.status === 'open').length,
        inProgress: bugs.filter(b => b.status === 'in-progress').length,
        resolved: bugs.filter(b => b.status === 'resolved').length,
        closed: bugs.filter(b => b.status === 'closed').length,
        critical: bugs.filter(b => b.priority === 'critical').length,
        high: bugs.filter(b => b.priority === 'high').length,
      };
      
      return stats;
    } catch (error) {
      console.error('Error fetching bug stats:', error);
      throw error;
    }
  },

  // Get unique projects
  async getProjects() {
    try {
      const { data, error } = await supabase
        .from('bugs')
        .select('project')
        .not('project', 'is', null);
      
      if (error) throw error;
      
      const uniqueProjects = [...new Set(data.map(item => item.project))];
      return uniqueProjects;
    } catch (error) {
      console.error('Error fetching projects:', error);
      throw error;
    }
  },

  // Upload attachment to bug - FIXED VERSION
  async uploadAttachment(bugId, file, user = null) {
    try {
      console.log('Starting upload for bug ID:', bugId);
      console.log('File details:', {
        name: file.name,
        size: file.size,
        type: file.type
      });
      
      // Get bug info for logging
      let bugInfo = null;
      if (user) {
        try {
          const { data } = await supabase
            .from('bugs')
            .select('title')
            .eq('id', bugId)
            .single();
          bugInfo = data;
        } catch (error) {
          console.error('Error fetching bug for logging:', error);
        }
      }
      
      // Check if file is too large (Supabase has 50MB limit for free tier)
      const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB in bytes
      if (file.size > MAX_FILE_SIZE) {
        throw new Error(`File size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds 50MB limit`);
      }
      
      // Create a unique file name
      const fileExt = file.name.split('.').pop();
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const fileName = `${timestamp}_${randomString}.${fileExt}`;
      const filePath = `bug_${bugId}/${fileName}`;
      
      console.log('Attempting to upload to path:', filePath);
      
      // Upload file to Supabase storage
      console.log('Uploading file...');
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('bug-attachments')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (uploadError) {
        console.error('Upload error details:', {
          message: uploadError.message,
          name: uploadError.name,
          stack: uploadError.stack
        });
        
        // Check if it's a bucket policy error
        if (uploadError.message.includes('policy') || uploadError.message.includes('not found')) {
          throw new Error('Storage bucket "bug-attachments" does not exist or you don\'t have permission. Please create the bucket in Supabase Dashboard and set up proper policies.');
        }
        
        throw uploadError;
      }
      
      console.log('File uploaded successfully:', uploadData);
      
      // Get public URL for the uploaded file
      const { data: { publicUrl } } = supabase.storage
        .from('bug-attachments')
        .getPublicUrl(filePath);
      
      console.log('Generated public URL:', publicUrl);
      
      // Create attachment object
      const attachment = {
        id: timestamp,
        name: file.name,
        size: file.size,
        url: publicUrl,
        path: filePath,
        uploadedAt: new Date().toISOString(),
        type: file.type,
        extension: fileExt
      };
      
      // Get current bug to update attachments array
      console.log('Fetching current bug data...');
      const { data: bugData, error: fetchError } = await supabase
        .from('bugs')
        .select('attachments')
        .eq('id', bugId)
        .single();
      
      if (fetchError) {
        console.error('Error fetching bug:', fetchError);
        throw fetchError;
      }
      
      const currentAttachments = bugData.attachments || [];
      console.log('Current attachments count:', currentAttachments.length);
      
      const updatedAttachments = [...currentAttachments, attachment];
      
      // Update bug with new attachment
      console.log('Updating bug record...');
      const { data: updatedBug, error: updateError } = await supabase
        .from('bugs')
        .update({ 
          attachments: updatedAttachments,
          updated_at: new Date().toISOString()
        })
        .eq('id', bugId)
        .select()
        .single();
      
      if (updateError) {
        console.error('Error updating bug:', updateError);
        
        // If updating bug fails, try to delete the uploaded file
        try {
          await supabase.storage
            .from('bug-attachments')
            .remove([filePath]);
        } catch (cleanupError) {
          console.error('Failed to clean up uploaded file:', cleanupError);
        }
        
        throw updateError;
      }
      
      console.log('Bug updated successfully');

      // Log activity if user is provided
      if (user && bugInfo) {
        await activityService.logActivity({
          user_email: user.email || 'system',
          user_name: user.name || 'System',
          action: 'uploaded',
          table_name: 'attachments',
          record_id: bugId,
          description: `uploaded attachment "${file.name}" to bug "${bugInfo.title}"`,
          metadata: {
            bug_title: bugInfo.title,
            bug_id: bugId,
            attachment_name: file.name,
            attachment_size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
            attachment_type: file.type
          }
        });
      }

      return attachment;
      
    } catch (error) {
      console.error('Detailed upload error:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
        code: error.code,
        details: error.details
      });
      throw error;
    }
  },

  // Delete attachment from bug
  async deleteAttachment(bugId, attachmentId, user = null) {
    try {
      // Get current bug to find the attachment
      const { data: bugData, error: fetchError } = await supabase
        .from('bugs')
        .select('attachments, title')
        .eq('id', bugId)
        .single();
      
      if (fetchError) throw fetchError;
      
      const currentAttachments = bugData.attachments || [];
      
      // Find attachment to delete
      const attachmentToDelete = currentAttachments.find(att => att.id === attachmentId);
      if (!attachmentToDelete) {
        throw new Error('Attachment not found');
      }
      
      // Remove attachment from storage
      const { error: storageError } = await supabase.storage
        .from('bug-attachments')
        .remove([attachmentToDelete.path]);
      
      if (storageError) {
        console.error('Error deleting file from storage:', storageError);
        throw storageError;
      }
      
      // Remove attachment from array
      const updatedAttachments = currentAttachments.filter(att => att.id !== attachmentId);
      
      // Update bug with removed attachment
      const { error: updateError } = await supabase
        .from('bugs')
        .update({ 
          attachments: updatedAttachments,
          updated_at: new Date().toISOString()
        })
        .eq('id', bugId);
      
      if (updateError) throw updateError;

      // Log activity if user is provided
      if (user) {
        await activityService.logActivity({
          user_email: user.email || 'system',
          user_name: user.name || 'System',
          action: 'deleted',
          table_name: 'attachments',
          record_id: bugId,
          description: `deleted attachment "${attachmentToDelete.name}" from bug "${bugData.title}"`,
          metadata: {
            bug_title: bugData.title,
            bug_id: bugId,
            attachment_name: attachmentToDelete.name,
            attachment_id: attachmentId
          }
        });
      }

      return true;
    } catch (error) {
      console.error('Error deleting attachment:', error);
      throw error;
    }
  },

  // Download attachment
  async downloadAttachment(filePath, user = null) {
    try {
      const { data, error } = await supabase.storage
        .from('bug-attachments')
        .download(filePath);
      
      if (error) throw error;

      // Extract attachment name from filePath for logging
      const attachmentName = filePath.split('/').pop() || 'unknown';
      
      // Log activity if user is provided (for downloading attachments)
      if (user) {
        await activityService.logActivity({
          user_email: user.email || 'system',
          user_name: user.name || 'System',
          action: 'downloaded',
          table_name: 'attachments',
          record_id: filePath,
          description: `downloaded attachment "${attachmentName}"`,
          metadata: {
            attachment_name: attachmentName,
            file_path: filePath
          }
        });
      }

      return data;
    } catch (error) {
      console.error('Error downloading attachment:', error);
      throw error;
    }
  }
};