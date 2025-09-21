import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import EmployeeDashboard from './pages/EmployeeDashboard';
import HRDashboard from './pages/HRDashboard';
import LeaveApplication from './pages/LeaveApplication';
import Regularization from './pages/Regularization';

// Route protection component
const ProtectedRoute: React.FC<{ 
  children: React.ReactNode; 
  adminOnly?: boolean;
}> = ({ children, adminOnly = false }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

// Dashboard route component that redirects based on role
const DashboardRoute: React.FC = () => {
  const { isAdmin } = useAuth();
  return isAdmin ? <HRDashboard /> : <EmployeeDashboard />;
};

function AppContent() {
  const { isAuthenticated } = useAuth();

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Login route */}
          <Route 
            path="/login" 
            element={
              isAuthenticated ? 
              <Navigate to="/dashboard" replace /> : 
              <Login />
            } 
          />

          {/* Protected routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <DashboardRoute />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/leave-application" 
            element={
              <ProtectedRoute>
                <LeaveApplication />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/regularization" 
            element={
              <ProtectedRoute>
                <Regularization />
              </ProtectedRoute>
            } 
          />

          {/* Admin only routes */}
          <Route 
            path="/employees" 
            element={
              <ProtectedRoute adminOnly>
                <div className="min-h-screen flex items-center justify-center">
                  <p className="text-lg text-gray-600">Employee management page - Coming Soon</p>
                </div>
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/approvals" 
            element={
              <ProtectedRoute adminOnly>
                <HRDashboard />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/attendance-view" 
            element={
              <ProtectedRoute adminOnly>
                <div className="min-h-screen flex items-center justify-center">
                  <p className="text-lg text-gray-600">Attendance view page - Coming Soon</p>
                </div>
              </ProtectedRoute>
            } 
          />

          {/* Default redirect */}
          <Route 
            path="/" 
            element={
              <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />
            } 
          />

          {/* Catch all route */}
          <Route 
            path="*" 
            element={
              <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;