import React, { createContext, useState, useEffect, useRef } from 'react';
import { supabase } from "@/services/supabaseClient";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  
  // Single function to handle session
  const handleSession = async (session) => {
    if (session?.user) {
      console.log('✅ Auth: Session found for', session.user.email);
      setUser(session.user);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        if (!error && data) {
          setProfile(data);
        } else {
          setProfile({ id: session.user.id, role: 'developer', name: 'User' });
        }
      } catch (err) {
        setProfile({ id: session.user.id, role: 'developer', name: 'User' });
      }
    } else {
      setUser(null);
      setProfile(null);
    }
    setLoading(false);
  };

  // Simplified initialization
  useEffect(() => {
    console.log('🔄 Auth: Initializing...');
    
    // Check current session first
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleSession(session);
    }).catch(() => {
      setLoading(false);
    });

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log(`🔄 Auth Event: ${event}`);
        handleSession(session);
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Auth methods
  const login = async (email, password) => {
    setAuthError(null);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setAuthError(error.message);
      return { success: false, error: error.message };
    }
    return { success: true, user: data.user };
  };

  const signUp = async (email, password, name) => {
    if (!email.endsWith('@dashstudios.tech')) {
      return { success: false, error: 'Only @dashstudios.tech emails allowed' };
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, role: 'developer' } }
    });
    if (error) return { success: false, error: error.message };
    return { success: true };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    window.location.href = '/devportal/login';
  };

  const value = {
    user,
    profile,
    loading,
    authError,
    login,
    signUp,
    logout,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};