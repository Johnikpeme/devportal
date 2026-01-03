import React, { useState } from 'react';
import { Mail, Lock, User, AlertCircle, CheckCircle, Slack } from 'lucide-react';
import Button from '../common/Button';
import Input from '../common/Input';
import { useAuth } from '@/hooks/useAuth';

const SignUpForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [userExists, setUserExists] = useState(false);
  
  const { signUp, loginWithSlack } = useAuth();
  
  const validateEmailDomain = (email) => {
    return email.toLowerCase().endsWith('@dashstudios.tech');
  };
  
  const validatePassword = (password) => {
    if (password.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!/(?=.*[0-9])/.test(password)) {
      return 'Password must contain at least one number';
    }
    return null;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setUserExists(false);
    
    // Validation
    if (!validateEmailDomain(email)) {
      setError('Only @dashstudios.tech email addresses are allowed');
      return;
    }
    
    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (!name.trim()) {
      setError('Please enter your full name');
      return;
    }
    
    setLoading(true);
    
    try {
      // Call the real signUp function from auth context
      const result = await signUp(email, password, name);
      
      if (result.success) {
        setSuccess(result.message || 'Account created! Please check your email for verification.');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setName('');
      } else {
        // Check if error is about user already existing
        const errorMsg = result.error || 'Failed to create account. Please try again.';
        
        if (errorMsg.toLowerCase().includes('already registered') || 
            errorMsg.toLowerCase().includes('already exists') ||
            errorMsg.toLowerCase().includes('user already registered')) {
          setUserExists(true);
          setError('This email is already registered.');
        } else {
          setError(errorMsg);
        }
      }
      
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Signup error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSlackLogin = async () => {
    try {
      setLoading(true);
      await loginWithSlack();
    } catch (err) {
      setError('Failed to connect to Slack');
      setLoading(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Input
              label="Full Name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              icon={User}
              fullWidth
              required
              disabled={loading}
            />
          </div>
          
          <div className="col-span-2">
            <Input
              label="Company Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john.doe@dashstudios.tech"
              icon={Mail}
              fullWidth
              required
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-1">
              Must end with @dashstudios.tech
            </p>
          </div>
          
          <div>
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
          </div>
          
          <div>
            <Input
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              icon={Lock}
              fullWidth
              required
              disabled={loading}
            />
          </div>
        </div>
        
        {/* Password Requirements */}
        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
          <p className="text-xs font-medium text-gray-700 mb-2">Password Requirements:</p>
          <ul className="text-xs text-gray-600 space-y-1">
            <li className={`flex items-center gap-1 ${password.length >= 8 ? 'text-green-600' : ''}`}>
              {password.length >= 8 ? '✓' : '○'} At least 8 characters
            </li>
            <li className={`flex items-center gap-1 ${/(?=.*[A-Z])/.test(password) ? 'text-green-600' : ''}`}>
              {/(?=.*[A-Z])/.test(password) ? '✓' : '○'} One uppercase letter
            </li>
            <li className={`flex items-center gap-1 ${/(?=.*[0-9])/.test(password) ? 'text-green-600' : ''}`}>
              {/(?=.*[0-9])/.test(password) ? '✓' : '○'} One number
            </li>
          </ul>
        </div>
        
        {error && (
          <div className="flex flex-col gap-2 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm font-medium">{error}</p>
            </div>
            {userExists && (
              <p className="text-xs mt-1 pl-7">
                Already have an account? Switch to the <span className="font-semibold">Sign In</span> tab above.
              </p>
            )}
          </div>
        )}
        
        {success && (
          <div className="flex items-center gap-2 p-4 bg-green-50 text-green-700 rounded-lg border border-green-200">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium">{success}</p>
              <p className="text-xs mt-1">Check your inbox for the verification link. Contact admin@dashstudios.tech if you need immediate access.</p>
            </div>
          </div>
        )}
        
        <Button
          type="submit"
          variant="primary"
          fullWidth
          loading={loading}
          disabled={loading}
          className="mt-2"
        >
          Create Account
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Or join with</span>
        </div>
      </div>

      <button
        onClick={handleSlackLogin}
        disabled={loading}
        className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-white text-gray-700 hover:bg-gray-50 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Slack className="w-5 h-5 text-[#4A154B]" />
        Sign up with Slack
      </button>
    </div>
  );
};

export default SignUpForm;