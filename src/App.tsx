import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { LoginForm, RegisterForm, ProtectedRoute } from './components/auth';
import { GameLayout } from './components/game';
import { TeacherPortal } from './components/content';
import Navigation from './components/common/Navigation';
import DevelopmentBanner from './components/common/DevelopmentBanner';
import Dashboard from './pages/Dashboard';
import LiveCase from './pages/LiveCase';
import Editor from './pages/Editor';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App min-h-screen">
          <DevelopmentBanner />
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginForm />} />
            <Route path="/register" element={<RegisterForm />} />
            
            {/* Protected routes with navigation */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Navigation />
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/live-case" 
              element={
                <ProtectedRoute>
                  <Navigation />
                  <LiveCase />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/game" 
              element={
                <ProtectedRoute>
                  <Navigation />
                  <GameLayout />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/editor" 
              element={
                <ProtectedRoute requireRole="teacher">
                  <Navigation />
                  <Editor />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/content" 
              element={
                <ProtectedRoute requireRole="teacher">
                  <TeacherPortal />
                </ProtectedRoute>
              } 
            />
            
            {/* Redirect root to content management for auto-logged teacher */}
            <Route path="/" element={<Navigate to="/content" replace />} />
            
            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/content" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;