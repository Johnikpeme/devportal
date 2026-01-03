import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, AlertCircle } from 'lucide-react';
import Button from '../common/Button';
import Input from '../common/Input';
import { useAuth } from '@/hooks/useAuth';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [slackLoading, setSlackLoading] = useState(false);
  
  const navigate = useNavigate();
  const { login, loginWithSlack, user, profile, loading: authLoading, authError } = useAuth();
  
  // Redirect when user AND profile are loaded
  useEffect(() => {
    console.log('🔍 LoginForm - Checking auth state:', { 
      authLoading, 
      hasUser: !!user, 
      hasProfile: !!profile 
    });
    
    if (!authLoading && user && profile) {
      console.log('✅ User logged in with profile, redirecting to dashboard...');
      navigate('/dashboard', { replace: true });
    }
  }, [user, profile, authLoading, navigate]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    console.log('🔐 LoginForm - Submitting login...');
    
    try {
      const result = await login(email, password);
      
      console.log('📊 LoginForm - Login result:', result);
      
      if (result.success) {
        console.log('✅ LoginForm - Login successful, waiting for profile...');
        // Don't set loading to false - keep showing loading state
        // The useEffect will handle redirect when profile loads
      } else {
        console.error('❌ LoginForm - Login failed:', result.error);
        setError(result.error);
        setLoading(false);
      }
    } catch (err) {
      console.error('❌ LoginForm - Exception:', err);
      setError('An unexpected error occurred');
      setLoading(false);
    }
  };

  const handleSlackLogin = async () => {
    setError('');
    setSlackLoading(true);
    
    try {
      console.log('🔐 LoginForm - Starting Slack OAuth...');
      const result = await loginWithSlack();
      
      if (!result.success) {
        setError(result.error || 'Failed to sign in with Slack');
        setSlackLoading(false);
      }
      // If successful, Supabase will handle the redirect
    } catch (err) {
      console.error('❌ LoginForm - Slack login exception:', err);
      setError('An unexpected error occurred with Slack login');
      setSlackLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@dashstudios.tech"
        icon={Mail}
        fullWidth
        required
        disabled={loading || slackLoading}
      />
      
      <Input
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="••••••••"
        icon={Lock}
        fullWidth
        required
        disabled={loading || slackLoading}
      />
      
      {(error || authError) && (
        <div className="flex items-center gap-2 p-4 bg-red-50 text-red-800 rounded-lg border border-red-200">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">{error || authError}</p>
        </div>
      )}
      
      <Button
        type="submit"
        variant="primary"
        fullWidth
        loading={loading}
        disabled={loading || slackLoading}
      >
        Sign In
      </Button>
      
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Or continue with</span>
        </div>
      </div>

      <button
        type="button"
        onClick={handleSlackLogin}
        disabled={loading || slackLoading}
        className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {slackLoading ? (
          <>
            <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
            <span>Connecting to Slack...</span>
          </>
        ) : (
          <>
            <svg className="w-5 h-5" viewBox="0 0 54 54" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M11.3 33.6c0 3.1-2.5 5.6-5.6 5.6S0 36.7 0 33.6s2.5-5.6 5.6-5.6h5.6v5.6zm2.8 0c0-3.1 2.5-5.6 5.6-5.6s5.6 2.5 5.6 5.6v14c0 3.1-2.5 5.6-5.6 5.6s-5.6-2.5-5.6-5.6v-14z" fill="#E01E5A"/>
              <path d="M19.8 11.3c-3.1 0-5.6-2.5-5.6-5.6S16.7 0 19.8 0s5.6 2.5 5.6 5.6v5.6h-5.6zm0 2.9c3.1 0 5.6 2.5 5.6 5.6s-2.5 5.6-5.6 5.6h-14c-3.1 0-5.6-2.5-5.6-5.6s2.5-5.6 5.6-5.6h14z" fill="#36C5F0"/>
              <path d="M42.6 19.8c0-3.1 2.5-5.6 5.6-5.6s5.6 2.5 5.6 5.6-2.5 5.6-5.6 5.6h-5.6v-5.6zm-2.8 0c0 3.1-2.5 5.6-5.6 5.6s-5.6-2.5-5.6-5.6v-14c0-3.1 2.5-5.6 5.6-5.6s5.6 2.5 5.6 5.6v14z" fill="#2EB67D"/>
              <path d="M34.2 42.6c3.1 0 5.6 2.5 5.6 5.6s-2.5 5.6-5.6 5.6-5.6-2.5-5.6-5.6v-5.6h5.6zm0-2.8c-3.1 0-5.6-2.5-5.6-5.6s2.5-5.6 5.6-5.6h14c3.1 0 5.6 2.5 5.6 5.6s-2.5 5.6-5.6 5.6h-14z" fill="#ECB22E"/>
            </svg>
            <span>Sign in with Slack</span>
          </>
        )}
      </button>
      
      <div className="pt-2">
        <p className="text-xs text-gray-500 text-center">
          Slack sign-in is only available to Dash Studios team members
        </p>
      </div>
    </form>
  );
};

export default LoginForm;