import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth'; 
import { Loader } from 'lucide-react';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  console.log('🛡️ ProtectedRoute:', { hasUser: !!user, loading });

  // CRITICAL FIX: Only show loading if NO user exists AND we're still loading
  // This prevents showing "Verifying session" when we already have a user
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

  // If we have a user (even if loading is true), show the content
  if (user) {
    return children;
  }

  // No user and not loading = redirect to login
  console.log('🔒 ProtectedRoute: No user session, redirecting to login');
  return <Navigate to="/login" replace />;
};

export default ProtectedRoute;