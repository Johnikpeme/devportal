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
  
  const navigate = useNavigate();
  const { login, user, profile, loading: authLoading } = useAuth();
  
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
        disabled={loading}
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
      />
      
      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 text-red-800 rounded-lg border border-red-200">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}
      
      <Button
        type="submit"
        variant="primary"
        fullWidth
        loading={loading}
        disabled={loading}
      >
        Sign In
      </Button>
      
      <div className="pt-6 border-t border-gray-200">
        
      </div>
    </form>
  );
};

export default LoginForm;