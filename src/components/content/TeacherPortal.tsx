import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import ContentManagementLayout from './ContentManagementLayout';
import { GraduationCap, ChevronRight, MapPin, Users, BookOpen, Star } from 'lucide-react';

interface TeacherPortalProps {
  className?: string;
}

const TeacherPortal: React.FC<TeacherPortalProps> = ({ className = '' }) => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className={`min-h-screen bg-gradient-to-br from-amber-50 via-red-50 to-orange-100 flex items-center justify-center ${className}`}>
        <div className="text-center bg-white/80 backdrop-blur-sm rounded-2xl p-12 shadow-2xl border border-amber-200">
          <GraduationCap className="mx-auto text-amber-600 mb-6" size={80} />
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Teacher Portal</h2>
          <p className="text-gray-600 mb-8 text-lg">Please log in to access your teaching tools.</p>
          <div className="flex items-center justify-center space-x-2 text-sm text-amber-700">
            <MapPin size={16} />
            <span>Where in the World is Sourdough Pete?</span>
          </div>
        </div>
      </div>
    );
  }

  const isTeacher = user.role === 'teacher' || user.role === 'admin';

  if (!isTeacher) {
    return (
      <div className={`min-h-screen bg-gradient-to-br from-amber-50 via-red-50 to-orange-100 flex items-center justify-center ${className}`}>
        <div className="text-center bg-white/80 backdrop-blur-sm rounded-2xl p-12 shadow-2xl border border-red-200 max-w-md">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <GraduationCap className="text-red-600" size={40} />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Access Restricted</h2>
          <p className="text-gray-600 mb-8">
            The Teacher Portal is only available to educators and administrators.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <div className="flex items-center justify-center space-x-2 text-blue-800 mb-2">
              <Users size={20} />
              <span className="font-semibold">Need Teacher Access?</span>
            </div>
            <p className="text-blue-700 text-sm">
              Contact your administrator to upgrade your account and start creating Carmen Sandiego adventures.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-amber-50 via-red-50 to-orange-100 ${className}`}>
      {/* Hero Header */}
      <header className="relative bg-gradient-to-r from-red-600 via-red-700 to-amber-600 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-0 opacity-10">
          <div className="w-full h-full" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '60px 60px'
          }} />
        </div>
        
        <div className="relative container mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <GraduationCap className="text-white" size={32} />
              </div>
              <div>
                <h1 className="text-4xl font-bold tracking-tight">Teacher Portal</h1>
                <div className="flex items-center space-x-3 mt-2">
                  <span className="text-xl">Welcome back, {user.displayName}</span>
                  <ChevronRight className="text-white/70" size={20} />
                  <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium capitalize">
                    {user.role}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="text-right hidden md:block">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                <div className="flex items-center space-x-2 text-white/90 mb-1">
                  <MapPin size={18} />
                  <span className="font-semibold">Carmen Sandiego Educational Platform</span>
                </div>
                <p className="text-white/70 text-sm">Content Management System</p>
                <div className="flex items-center justify-end space-x-4 mt-3 text-xs text-white/60">
                  <div className="flex items-center space-x-1">
                    <BookOpen size={14} />
                    <span>Create Cases</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star size={14} />
                    <span>Manage Content</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative bottom wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1200 120" fill="none" className="w-full h-8">
            <path 
              d="M0,120 Q300,60 600,80 T1200,100 L1200,120 Z" 
              fill="currentColor" 
              className="text-amber-50"
            />
          </svg>
        </div>
      </header>

      {/* Main Content with better spacing */}
      <main className="container mx-auto px-6 py-12">
        <ContentManagementLayout />
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-gray-800 via-gray-900 to-black text-white mt-16">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <MapPin className="text-amber-400" size={20} />
                <span className="font-semibold">Where in the World is Sourdough Pete?</span>
              </div>
              <div className="hidden md:flex items-center space-x-6 text-sm text-gray-400">
                <button className="hover:text-white transition-colors">Help & Support</button>
                <button className="hover:text-white transition-colors">Educational Resources</button>
                <button className="hover:text-white transition-colors">Content Guidelines</button>
              </div>
            </div>
            <div className="text-right text-sm text-gray-400">
              <div className="mb-1">© 2024 Carmen Sandiego Educational Platform</div>
              <div className="text-xs">Version 1.0.0 • Phase 6 UI Polish</div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default TeacherPortal;