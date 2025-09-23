import React from 'react';
import { X, Code, User } from 'lucide-react';

interface DevelopmentBannerProps {
  onDismiss?: () => void;
}

const DevelopmentBanner: React.FC<DevelopmentBannerProps> = ({ onDismiss }) => {
  const isDevelopment = import.meta.env.DEV;
  
  if (!isDevelopment) return null;

  return (
    <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white border-b border-orange-400 shadow-lg">
      <div className="flex items-center justify-between max-w-7xl mx-auto px-6 py-3">
        <div className="flex items-center space-x-4">
          <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
            <Code size={16} className="text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-sm">Development Mode</span>
              <span className="bg-white/20 px-2 py-1 rounded-full text-xs">Auto-Login</span>
            </div>
            <div className="flex items-center space-x-2 text-orange-100 text-xs">
              <User size={12} />
              <span>Logged in as teacher@school.edu (Ms. Johnson)</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="hidden md:block text-xs text-orange-100">
            <span>Remove auto-login in production</span>
          </div>
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="text-white/80 hover:text-white transition-colors p-1 rounded"
              title="Dismiss banner"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DevelopmentBanner;