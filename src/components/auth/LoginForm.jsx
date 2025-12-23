import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, AlertCircle } from 'lucide-react';
import Button from '../common/Button';
import Input from '../common/Input';
import { useAuth } from '@/hooks/useAuth';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation(); // Added to capture redirect state
  const { login, user, profile, loading: authLoading } = useAuth();
  
  // FIXED: Redirect when user AND profile are loaded
  useEffect(() => {
    console.log('🔍 LoginForm - Checking auth state:', { 
      authLoading, 
      hasUser: !!user, 
      hasProfile: !!profile 
    });
    
    if (!authLoading && user && profile) {
      console.log('✅ User logged in with profile, redirecting...');
      
      // Look for the "from" location we saved in ProtectedRoute
      // Otherwise default to the root dashboard "/"
      const origin = location.state?.from?.pathname || "/";
      
      // FIXED: Changed '/devportal/dashboard' to origin (or '/')
      navigate(origin, { replace: true });
    }
  }, [user, profile, authLoading, navigate, location]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    console.log('🔐 LoginForm - Submitting login...');
    
    try {
      const result = await login(email, password);
      
      if (result.success) {
        console.log('✅ LoginForm - Login successful, waiting for profile...');
        // We keep loading=true here because the useEffect above 
        // will handle the actual navigation once the profile is ready
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
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        label="Email Address"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="name@dashstudios.tech"
        icon={Mail}
        fullWidth
        required
        disabled={loading}
        className="focus:ring-black"
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
        disabled={loading}
        className="focus:ring-black"
      />
      
      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 text-red-800 rounded-xl border border-red-100 animate-in fade-in slide-in-from-top-1">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}
      
      <Button
        type="submit"
        variant="primary"
        fullWidth
        loading={loading}
        disabled={loading}
        className="!bg-black !text-white hover:!bg-gray-800 h-12 rounded-xl transition-all shadow-md active:scale-[0.98]"
      >
        Sign In to Portal
      </Button>
    </form>
  );
};

export default LoginForm;