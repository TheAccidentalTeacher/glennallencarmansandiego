import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { LoginForm, RegisterForm, ProtectedRoute } from './components/auth';
import { GameLayout } from './components/game';
import { TeacherPortal } from './components/content';
import TeacherControl from './components/game/TeacherControl';
import ProjectorDisplay from './components/game/ProjectorDisplay';
import Navigation from './components/common/Navigation';
import DevelopmentBanner from './components/common/DevelopmentBanner';
import Dashboard from './pages/Dashboard';
import LiveCase from './pages/LiveCase';
import Editor from './pages/Editor';
import GamePresentation from './pages/GamePresentation';

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
                <ProtectedRoute>
                  <Navigation />
                  <Editor />
                </ProtectedRoute>
              } 
            />
            
            {/* Game routes - MUST be before catch-all redirect */}
            <Route 
              path="/present" 
              element={
                <ProtectedRoute requireRole="teacher">
                  <GamePresentation />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/control" 
              element={<TeacherControl />} 
            />
            <Route 
              path="/projector" 
              element={<ProjectorDisplay />} 
            />
            
            {/* Content management */}
            <Route 
              path="/content" 
              element={
                <ProtectedRoute requireRole="teacher">
                  <TeacherPortal />
                </ProtectedRoute>
              } 
            />
            
            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;