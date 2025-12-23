import { createClient } from '@supabase/supabase-js';

// Get environment variables (adapt based on your setup)
const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL || 
                   process.env.REACT_APP_SUPABASE_URL ||
                   'https://your-project-id.supabase.co';

const supabaseAnonKey = import.meta.env?.VITE_SUPABASE_ANON_KEY || 
                       process.env.REACT_APP_SUPABASE_ANON_KEY ||
                       'your-anon-key-here';

// Debug logging
console.log('🔧 Supabase URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
console.log('🔧 Supabase Key:', supabaseAnonKey ? '✅ Set' : '❌ Missing');

// Create singleton client
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
    storageKey: 'supabase.auth.token'
  }
});

export { supabase };