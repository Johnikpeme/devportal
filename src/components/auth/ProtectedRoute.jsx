import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth'; 
import { Loader } from 'lucide-react';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  console.log('🛡️ ProtectedRoute:', { hasUser: !!user, loading });

  if (loading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-3">
          <Loader className="w-10 h-10 animate-spin text-black" />
          <p className="text-sm font-medium text-gray-500">Verifying session...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return children;
  }

  // FIXED: Changed /devportal/login to /login
  // Added state so user can be sent back to their intended page after login
  console.log('🔒 ProtectedRoute: No user session, redirecting to login');
  return <Navigate to="/login" state={{ from: location }} replace />;
};

export default ProtectedRoute;