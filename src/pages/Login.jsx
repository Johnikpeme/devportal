import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, LogIn, UserPlus } from 'lucide-react';
import LoginForm from '../components/auth/LoginForm';
import SignUpForm from '../components/auth/SignUpForm';
import { useAuth } from '@/hooks/useAuth';

const Login = () => {
  const [activeTab, setActiveTab] = useState('login');
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, loading } = useAuth();
  
  // FIXED: Redirect if already logged in
  useEffect(() => {
    if (!loading && user && profile) {
      console.log('✅ Already logged in, redirecting...');
      
      // Look for the "from" location we saved in ProtectedRoute
      // If it exists, send them back there; otherwise, send them to the root "/"
      const origin = location.state?.from?.pathname || "/";
      
      // FIXED: Removed "/devportal/dashboard" and used clean path
      navigate(origin, { replace: true });
    }
  }, [user, profile, loading, navigate, location]);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-block p-3 bg-black rounded-xl mb-4 shadow-lg">
            <LayoutDashboard className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2 font-display">Dash Studios</h1>
          <p className="text-gray-600 tracking-wide uppercase text-xs font-semibold">Developer Portal</p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Tab Navigation */}
          <div className="flex border-b border-gray-100">
            <button
              className={`flex-1 py-5 text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                activeTab === 'login'
                  ? 'text-black border-b-2 border-black bg-white'
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
              }`}
              onClick={() => setActiveTab('login')}
            >
              <LogIn className="w-4 h-4" />
              Sign In
            </button>
            <button
              className={`flex-1 py-5 text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                activeTab === 'signup'
                  ? 'text-black border-b-2 border-black bg-white'
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
              }`}
              onClick={() => setActiveTab('signup')}
            >
              <UserPlus className="w-4 h-4" />
              Create Account
            </button>
          </div>
          
          {/* Tab Content */}
          <div className="p-10">
            {activeTab === 'login' ? <LoginForm /> : <SignUpForm />}
          </div>
          
          {/* Domain Notice - Stylized for the Gaming Industry */}
          <div className="px-10 pb-8">
            <div className="text-[10px] text-gray-400 text-center p-3 bg-gray-50 rounded-lg border border-gray-100 leading-relaxed">
              <span className="font-bold text-gray-600 uppercase mr-1">Access Restricted:</span> 
              This portal is exclusive for authorized Dash Studios personnel. Unauthorized access attempts are logged.
            </div>
          </div>
        </div>
        
        <p className="text-center text-xs text-gray-400 mt-8 font-medium">
          © 2025 DASH STUDIOS. ENGINEERED FOR EXCELLENCE.
        </p>
      </div>
    </div>
  );
};

export default Login;