import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Monitor, Edit3, User, LogOut, ChevronDown, Gamepad2, Users, Settings } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Navigation: React.FC = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: Home },
    { path: '/present', label: 'Present Game', icon: Gamepad2, requireTeacher: true },
    { path: '/control', label: 'Teacher Control', icon: Settings, requireTeacher: true },
    { path: '/projector', label: 'Projector', icon: Users, requireTeacher: true },
    { path: '/game', label: 'Game', icon: Gamepad2 },
    { path: '/live-case', label: 'Live Case', icon: Monitor },
    { path: '/editor', label: 'Editor', icon: Edit3, requireTeacher: true },
  ];

  const handleLogout = async () => {
    await logout();
    setIsUserMenuOpen(false);
  };

  const filteredNavItems = navItems.filter(item => {
    if (item.requireTeacher) {
      return user?.role === 'teacher' || user?.role === 'admin';
    }
    return true;
  });

  return (
    <nav className="bg-dark-slate-gray bg-opacity-80 backdrop-blur-sm border-b border-camel border-opacity-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/dashboard" className="text-goldenrod text-xl font-bold">
              🕵️ Sourdough Pete
            </Link>
          </div>
          
          <div className="flex items-center space-x-8">
            {/* Navigation Items */}
            {filteredNavItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === path
                    ? 'text-goldenrod bg-goldenrod bg-opacity-20'
                    : 'text-bone hover:text-goldenrod hover:bg-bone hover:bg-opacity-10'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {label}
              </Link>
            ))}

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-bone hover:text-goldenrod hover:bg-bone hover:bg-opacity-10 transition-colors"
              >
                <User className="w-4 h-4 mr-2" />
                <span className="hidden sm:block">{user?.displayName}</span>
                <ChevronDown className="w-4 h-4 ml-1" />
              </button>

              {/* Dropdown Menu */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                  <div className="py-1">
                    <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
                      <div className="font-medium">{user?.displayName}</div>
                      <div className="text-xs text-gray-500">{user?.email}</div>
                      <div className="text-xs text-amber-600 capitalize">{user?.role}</div>
                    </div>
                    
                    <Link
                      to="/profile"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <User className="w-4 h-4 mr-2" />
                      Profile Settings
                    </Link>
                    
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center px-4 py-2 text-sm text-red-700 hover:bg-red-50 transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Click outside to close dropdown */}
      {isUserMenuOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsUserMenuOpen(false)}
        />
      )}
    </nav>
  );
};

export default Navigation;