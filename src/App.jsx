import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './components/auth/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ProjectsList from './pages/ProjectsList';
import ProjectDetail from './pages/ProjectDetail';
import QATracker from './pages/QATracker';
import BugDetail from './components/qa/BugDetail';
import Documentation from './pages/Documentation';
import Team from './pages/Team';
import Settings from './pages/Settings';
import CreateProject from './components/projects/CreateProject';

function App() {
  return (
    /* No basename needed for subdomain deployment */
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Route */}
          <Route path="/login" element={<Login />} />
          
          {/* Protected Routes - Rooted at / */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            {/* Dashboard is the home page of the subdomain */}
            <Route index element={<Dashboard />} />
            
            {/* Project Routes */}
            <Route path="projects" element={<ProjectsList />} />
            <Route path="projects/new" element={<CreateProject />} /> 
            <Route path="projects/:id" element={<ProjectDetail />} />
            
            {/* QA and Bug Tracking */}
            <Route path="qa" element={<QATracker />} />
            <Route path="qa/:id" element={<BugDetail />} />
            
            {/* Other Pages */}
            <Route path="docs" element={<Documentation />} />
            <Route path="team" element={<Team />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          
          {/* Global Redirect: If a user hits a weird URL, send them to Dashboard */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;