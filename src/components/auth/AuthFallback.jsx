import React from 'react';
import { Loader, AlertCircle } from 'lucide-react';

const AuthFallback = ({ error }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="text-center max-w-md">
        {error ? (
          <>
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Authentication Error</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-black text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
            >
              Refresh Page
            </button>
            <p className="text-sm text-gray-500 mt-4">
              If the issue persists, clear your browser cookies and try again.
            </p>
          </>
        ) : (
          <>
            <div className="inline-block p-4 bg-gray-100 rounded-full mb-4">
              <Loader className="w-8 h-8 animate-spin text-gray-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Loading Dashboard</h1>
            <p className="text-gray-600">Setting up your session...</p>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthFallback;