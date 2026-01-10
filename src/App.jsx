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
import Incubator from './pages/Incubator';
import IncubatorDetail from './pages/IncubatorDetail';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* 1. Public Route: Suitable for subdomain root */}
          <Route path="/login" element={<Login />} />
          
          {/* 2. Protected Routes: Suitable for subdomain root */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            {/* The logic below remains exactly as you had it */}
            <Route index element={<Dashboard />} />
            <Route path="projects" element={<ProjectsList />} />
            <Route path="projects/new" element={<CreateProject />} /> 
            <Route path="projects/:id" element={<ProjectDetail />} />
            <Route path="incubator" element={<Incubator />} />
            <Route path="incubator/:id" element={<IncubatorDetail />} /> 
            <Route path="qa" element={<QATracker />} />
            <Route path="qa/:id" element={<BugDetail />} />
            <Route path="docs" element={<Documentation />} />
            <Route path="team" element={<Team />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          
          {/* 3. Global Redirect: Ensures any 404s or old paths hit your dashboard */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;