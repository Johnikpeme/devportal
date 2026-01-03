import React, { createContext, useState, useEffect } from 'react';
import { supabase } from "@/services/supabaseClient";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  
  // Inactivity timeout - 30 minutes in milliseconds
  const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes
  const inactivityTimerRef = React.useRef(null);
  const lastActivityRef = React.useRef(Date.now());
  
  // Single function to handle session
  const handleSession = async (session) => {
    if (session?.user) {
      console.log('✅ Auth: Session found for', session.user.email);
      console.log('📧 Email confirmed at:', session.user.email_confirmed_at);
      console.log('🔧 Provider:', session.user.app_metadata?.provider);
      
      // STRICT CHECK: Only proceed if email is verified OR it's OAuth
      const isEmailVerified = session.user.email_confirmed_at !== null && session.user.email_confirmed_at !== undefined;
      const isOAuthProvider = session.user.app_metadata?.provider && session.user.app_metadata.provider !== 'email';
      
      console.log('🔍 Verification check:', { isEmailVerified, isOAuthProvider });
      
      // Block unverified email users completely
      if (!isEmailVerified && !isOAuthProvider) {
        console.log('❌ Auth: Email not verified, blocking access and signing out');
        await supabase.auth.signOut();
        setUser(null);
        setProfile(null);
        setAuthError('Please verify your email before signing in. Check your inbox for the verification link.');
        setLoading(false);
        return;
      }
      
      // User is verified, proceed
      setUser(session.user);
      
      try {
        // Try to get existing profile
        const { data: existingProfile, error: fetchError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle();
        
        if (existingProfile && !fetchError) {
          console.log('✅ Auth: Found existing profile');
          setProfile(existingProfile);
        } else {
          // Create profile ONLY for verified users
          console.log('📝 Auth: Creating new profile for verified user');
          
          const newProfile = {
            id: session.user.id,
            email: session.user.email,
            name: session.user.user_metadata?.full_name || 
                  session.user.user_metadata?.name || 
                  session.user.email?.split('@')[0] || 
                  'User',
            role: 'developer',
            avatar_url: session.user.user_metadata?.avatar_url || null,
            created_at: new Date().toISOString()
          };
          
          const { data: createdProfile, error: createError } = await supabase
            .from('profiles')
            .insert([newProfile])
            .select()
            .single();
          
          if (createdProfile && !createError) {
            console.log('✅ Auth: Profile created successfully');
            setProfile(createdProfile);
          } else {
            console.error('❌ Auth: Failed to create profile:', createError);
            // Fallback to basic profile
            setProfile({
              id: session.user.id,
              role: 'developer',
              name: newProfile.name,
              email: session.user.email
            });
          }
        }
      } catch (err) {
        console.error('❌ Auth: Error handling profile:', err);
        setProfile({
          id: session.user.id,
          role: 'developer',
          name: 'User',
          email: session.user.email
        });
      }
    } else {
      console.log('❌ Auth: No session found');
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
      async (event, session) => {
        console.log(`🔄 Auth Event: ${event}`);
        console.log('📊 Session data:', session);
        console.log('👤 User metadata:', session?.user?.user_metadata);
        console.log('🔧 App metadata:', session?.user?.app_metadata);
        
        // Handle Slack OAuth callback
        if (event === 'SIGNED_IN' && session?.user?.app_metadata?.provider === 'slack_oidc') {
          console.log('✅ Auth: Slack OIDC sign-in detected');
          
          // Verify user is from Dash Studios workspace
          const slackTeamId = session.user.user_metadata?.['https://slack.com/team_id'];
          const slackTeamDomain = session.user.user_metadata?.['https://slack.com/team_domain'];
          
          console.log('🔍 Slack Team Info:', { slackTeamId, slackTeamDomain });
          
          // You can verify the team_domain matches 'dashstudiosinc'
          if (slackTeamDomain && slackTeamDomain !== 'dashstudiosinc') {
            console.error('❌ Auth: User not from Dash Studios workspace');
            await supabase.auth.signOut();
            setAuthError('Access denied. Only Dash Studios team members can sign in.');
            setLoading(false);
            return;
          }
        }
        
        handleSession(session);
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Inactivity timer - sign out user after 30 minutes of no activity
  useEffect(() => {
    if (!user) {
      // Clear timer if no user
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
      return;
    }

    // Reset the inactivity timer
    const resetTimer = () => {
      lastActivityRef.current = Date.now();
      
      // Clear existing timer
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }

      // Set new timer
      inactivityTimerRef.current = setTimeout(() => {
        console.log('⏰ Auth: Inactivity timeout - signing out');
        logout();
      }, INACTIVITY_TIMEOUT);
    };

    // Activity events to track
    const activityEvents = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click'
    ];

    // Throttled reset function (only reset once per minute max)
    let lastReset = Date.now();
    const throttledReset = () => {
      const now = Date.now();
      if (now - lastReset > 60000) { // Only reset once per minute
        lastReset = now;
        resetTimer();
      }
    };

    // Add event listeners
    activityEvents.forEach(event => {
      window.addEventListener(event, throttledReset);
    });

    // Start the timer
    resetTimer();

    // Cleanup
    return () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
      activityEvents.forEach(event => {
        window.removeEventListener(event, throttledReset);
      });
    };
  }, [user]);

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

  const loginWithSlack = async () => {
    setAuthError(null);
    
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'slack_oidc',
        options: {
          redirectTo: `${window.location.origin}/login`
        }
      });
      
      if (error) {
        console.error('❌ Auth: Slack OAuth error:', error);
        setAuthError(error.message);
        return { success: false, error: error.message };
      }
      
      console.log('✅ Auth: Slack OAuth initiated');
      return { success: true };
    } catch (err) {
      console.error('❌ Auth: Slack OAuth exception:', err);
      setAuthError('Failed to initiate Slack sign-in');
      return { success: false, error: 'Failed to initiate Slack sign-in' };
    }
  };

  const signUp = async (email, password, name) => {
    if (!email.endsWith('@dashstudios.tech')) {
      return { success: false, error: 'Only @dashstudios.tech emails allowed' };
    }

    try {
      // First check if user already exists in profiles table
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('email')
        .eq('email', email.toLowerCase())
        .maybeSingle();

      if (existingProfile) {
        console.log('❌ Signup: User already exists in profiles');
        return { 
          success: false, 
          error: 'User already registered' 
        };
      }

      // If no existing profile, proceed with signup
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name, role: 'developer' } }
      });

      console.log('📊 Signup result:', { data, error });

      if (error) {
        console.error('❌ Signup error from Supabase:', error);
        return { success: false, error: error.message };
      }
      
      // Check if user already exists (Supabase returns success but with a session if email confirmation is disabled)
      if (data?.user && !data?.session) {
        console.log('✅ Signup: Confirmation email sent');
        return { success: true };
      }
      
      return { success: true };
    } catch (err) {
      console.error('❌ Signup exception:', err);
      return { success: false, error: 'An error occurred during signup' };
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    window.location.href = '/login';
  };

  const value = {
    user,
    profile,
    loading,
    authError,
    login,
    loginWithSlack,
    signUp,
    logout,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};