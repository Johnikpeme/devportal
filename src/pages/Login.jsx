import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, LogIn, UserPlus } from 'lucide-react';
import LoginForm from '../components/auth/LoginForm';
import SignUpForm from '../components/auth/SignUpForm';
import { useAuth } from '@/hooks/useAuth';

const Login = () => {
  const [activeTab, setActiveTab] = useState('login');
  const navigate = useNavigate();
  const { user, profile, loading } = useAuth();
  
  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user && profile) {
      console.log('✅ Already logged in, redirecting...');
      navigate('/dashboard', { replace: true });
    }
  }, [user, profile, loading, navigate]);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-block p-3 bg-black rounded-xl mb-4 shadow-lg">
            <LayoutDashboard className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dash Studios</h1>
          <p className="text-gray-600">Developer Portal</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200">
            <button
              className={`flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                activeTab === 'login'
                  ? 'text-black border-b-2 border-black bg-gray-50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => setActiveTab('login')}
            >
              <LogIn className="w-4 h-4" />
              Sign In
            </button>
            <button
              className={`flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                activeTab === 'signup'
                  ? 'text-black border-b-2 border-black bg-gray-50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => setActiveTab('signup')}
            >
              <UserPlus className="w-4 h-4" />
              Create Account
            </button>
          </div>
          
          {/* Tab Content */}
          <div className="p-8">
            {activeTab === 'login' ? <LoginForm /> : <SignUpForm />}
          </div>
          
          {/* Domain Notice */}
          <div className="px-8 pb-6">
            <div className="text-xs text-gray-500 text-center p-3 bg-blue-50 rounded-lg border border-blue-100">
              <span className="font-semibold">Note:</span> Exclusive for the Dash Studios Team.
            </div>
          </div>
        </div>
        
        <p className="text-center text-sm text-gray-500 mt-6">
          © 2026 Dash Studios. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Login;