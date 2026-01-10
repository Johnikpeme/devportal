import { supabase } from './supabaseClient';

export const ideaService = {
  // Get all ideas
  async getIdeas() {
    const { data, error } = await supabase
      .from('ideas')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // Ensure voters is always an array and calculate vote count dynamically
    return data.map(idea => ({
      ...idea,
      voters: idea.voters || [], 
      votes: (idea.voters || []).length // Calculate count based on array length
    }));
  },

  // Get single idea details
  async getIdeaById(id) {
    const { data, error } = await supabase
      .from('ideas')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    return {
      ...data,
      voters: data.voters || [],
      votes: (data.voters || []).length
    };
  },

  // Create a new idea
  async createIdea(ideaData) {
    // Initialize with empty voters array
    const payload = { ...ideaData, voters: [] };
    
    const { data, error } = await supabase
      .from('ideas')
      .insert([payload])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Toggle vote (Upvote/Remove vote) using JSON column
  async toggleVote(ideaId, user) {
    // 1. Get current idea to see voters
    const { data: idea, error: fetchError } = await supabase
      .from('ideas')
      .select('voters')
      .eq('id', ideaId)
      .single();

    if (fetchError) throw fetchError;

    let currentVoters = idea.voters || [];
    const hasVoted = currentVoters.some(v => v.id === user.id);
    let newVoters;

    if (hasVoted) {
      // Remove user from voters
      newVoters = currentVoters.filter(v => v.id !== user.id);
    } else {
      // Add user to voters
      newVoters = [
        ...currentVoters, 
        { 
          id: user.id, 
          name: user.user_metadata?.name || user.email?.split('@')[0], 
          avatar_url: user.user_metadata?.avatar_url || 'avatar1' // Fallback or current avatar
        }
      ];
    }

    // 2. Update the database
    const { error: updateError } = await supabase
      .from('ideas')
      .update({ 
        voters: newVoters,
        votes: newVoters.length // Update the integer count too just in case you use it elsewhere
      })
      .eq('id', ideaId);

    if (updateError) throw updateError;
    return hasVoted ? 'removed' : 'added';
  },

  // Comments
  async getComments(ideaId) {
  const { data, error } = await supabase
    .from('idea_comments')
    .select(`
      id,
      text,
      created_at,
      user_name,
      user_avatar
    `)
    .eq('idea_id', ideaId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  
  // Map to the structure your UI expects
  return data.map(c => ({
    id: c.id,
    text: c.text,
    created_at: c.created_at,
    profiles: {
      name: c.user_name,
      avatar_url: c.user_avatar
    }
  }));
},

  async addComment(ideaId, user, text) {
  const userName = user.user_metadata?.name || user.email?.split('@')[0] || 'Anonymous';

  // Get the avatar string from user_metadata (or fallback to a default)
  // Since profiles.avatar_url contains "avatarX", and auth metadata usually mirrors it
  const userAvatar = user.user_metadata?.avatar_url || 'avatar1';  // or null if you prefer

  const { data, error } = await supabase
    .from('idea_comments')
    .insert([{ 
      idea_id: ideaId,
      user_id: user.id,
      user_name: userName,
      user_avatar: userAvatar,   // ← will be "avatar7", "avatar9", etc. for real users
      text: text.trim()
    }])
    .select()
    .single();
    
  if (error) throw error;
  
  return {
    ...data,
    profiles: {
      name: data.user_name,
      avatar_url: data.user_avatar
    }
  };
}
};