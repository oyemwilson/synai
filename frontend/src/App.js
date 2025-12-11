import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { PortfolioProvider } from './contexts/PortfolioContext';
import { WebSocketProvider } from './contexts/WebSocketContext';
import  LandingPage  from './screens/landingpage/LandingPage';
import { Login } from './screens/auth/Login';
import { Signup } from './screens/auth/Signup';
import { Dashboard } from './screens/dashboard/dashboard';
import { LoadingSpinner } from './screens/common/LoadingSpinner';
import { Portfolio } from './screens/portfolio/Portfolio';
import './styles/globals.css';

// Protected Route Component - MUST be inside AuthProvider
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" text="Loading..." />
      </div>
    );
  }
  
  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Public Route Component - MUST be inside AuthProvider
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" text="Loading..." />
      </div>
    );
  }
  
  return !isAuthenticated ? children : <Navigate to="/dashboard" />;
};

// Main App Content with Routing - This will be wrapped by AuthProvider
const AppContent = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } 
          />
          <Route 
            path="/signup" 
            element={
              <PublicRoute>
                <Signup />
              </PublicRoute>
            } 
          />
          
          {/* Protected Routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/portfolio" 
            element={
              <ProtectedRoute>
                <Portfolio />
              </ProtectedRoute>
            } 
          />
          
          {/* Default redirect */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
};

// Main App Component - Wraps everything with providers
function App() {
  return (
    <AuthProvider>
      <PortfolioProvider>
        <WebSocketProvider>
          <AppContent />
        </WebSocketProvider>
      </PortfolioProvider>
    </AuthProvider>
  );
}

export default App;