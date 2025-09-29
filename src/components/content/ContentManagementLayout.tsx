import React, { useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import CaseManager from './CaseManager';
import ClueManager from './ClueManager';
import ContentDashboard from './ContentDashboard';
import VillainManagement from './VillainManagement';
import LocationManagement from './LocationManagement';
import { 
  BookOpen, 
  FileText, 
  Users, 
  Globe,
  ArrowLeft,
  Home
} from 'lucide-react';

interface ContentManagementLayoutProps {
  className?: string;
}

type ViewMode = 'dashboard' | 'cases' | 'clues' | 'locations' | 'villains';

interface ClueViewState {
  caseId: string;
  caseName: string;
}

const ContentManagementLayout: React.FC<ContentManagementLayoutProps> = ({ className = '' }) => {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState<ViewMode>('dashboard');
  const [clueViewState, setClueViewState] = useState<ClueViewState | null>(null);

  if (!user) {
    return (
      <div className={`flex items-center justify-center min-h-96 ${className}`}>
        <div className="text-center bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl">
          <h2 className="text-2xl font-bold text-gray-700 mb-4">Authentication Required</h2>
          <p className="text-gray-600">Please log in to access content management.</p>
        </div>
      </div>
    );
  }

  const isTeacher = user.role === 'teacher' || user.role === 'admin';

  if (!isTeacher) {
    return (
      <div className={`flex items-center justify-center min-h-96 ${className}`}>
        <div className="text-center bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl">
          <h2 className="text-2xl font-bold text-gray-700 mb-4">Access Restricted</h2>
          <p className="text-gray-600">Content management is only available to teachers and administrators.</p>
        </div>
      </div>
    );
  }

  const handleViewClues = (caseId: string, caseName: string) => {
    setClueViewState({ caseId, caseName });
    setCurrentView('clues');
  };

  const handleBackToCases = () => {
    setClueViewState(null);
    setCurrentView('cases');
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <ContentDashboard />;
        
      case 'cases':
        return <CaseManager onViewClues={handleViewClues} />;
      
      case 'clues':
        return clueViewState ? (
          <ClueManager
            caseId={clueViewState.caseId}
            caseName={clueViewState.caseName}
            onClose={handleBackToCases}
          />
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl shadow-xl">
            <FileText className="mx-auto text-gray-400 mb-4" size={64} />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Case Selected</h3>
            <p className="text-gray-600">Select a case to manage its clues.</p>
          </div>
        );
      
      case 'locations':
        return <LocationManagement />;
      
      case 'villains':
        return <VillainManagement />;
      
      default:
        return <ContentDashboard />;
    }
  };

  interface TabButtonProps {
    icon: LucideIcon;
    label: string;
    badge?: number | string | null;
    isActive: boolean;
    onClick: () => void;
    isDisabled?: boolean;
  }

  const TabButton = ({ icon: Icon, label, badge, isActive, onClick, isDisabled }: TabButtonProps) => (
    <button
      onClick={onClick}
      disabled={isDisabled}
      className={`
        relative flex items-center px-6 py-4 text-sm font-medium transition-all duration-200
        ${isActive 
          ? 'text-white bg-gradient-to-r from-red-500 to-amber-500 shadow-lg' 
          : isDisabled
            ? 'text-gray-400 cursor-not-allowed'
            : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
        }
        ${!isDisabled && !isActive ? 'hover:shadow-md' : ''}
        rounded-xl border-2 ${isActive ? 'border-transparent' : 'border-gray-200 hover:border-gray-300'}
      `}
    >
      <Icon className="mr-3" size={18} />
      <span>{label}</span>
      {badge && (
        <span className={`ml-3 px-2 py-1 text-xs rounded-full ${
          isActive ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'
        }`}>
          {badge}
        </span>
      )}
      {isActive && (
        <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-amber-400 rounded-xl opacity-20 animate-pulse"></div>
      )}
    </button>
  );

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Navigation Tabs - Redesigned */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-50 to-white px-8 py-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Content Management</h1>
              <p className="text-gray-600 mt-1">Create, organize, and manage your educational content</p>
            </div>
            
            {/* Back Button for Clue View */}
            {currentView === 'clues' && clueViewState && (
              <button
                onClick={handleBackToCases}
                className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 border border-gray-200"
              >
                <ArrowLeft className="mr-2" size={18} />
                <span className="font-medium">Back to Cases</span>
              </button>
            )}
          </div>
        </div>
        
        {/* Tab Navigation */}
        <div className="p-6">
          <div className="flex flex-wrap gap-3">
            <TabButton
              icon={Home}
              label="Dashboard"
              isActive={currentView === 'dashboard'}
              onClick={() => setCurrentView('dashboard')}
            />
            
            <TabButton
              icon={BookOpen}
              label="Cases"
              isActive={currentView === 'cases'}
              onClick={() => setCurrentView('cases')}
            />
            
            <TabButton
              icon={FileText}
              label="Clues"
              badge={clueViewState ? clueViewState.caseName : null}
              isActive={currentView === 'clues'}
              onClick={() => setCurrentView('clues')}
              isDisabled={!clueViewState}
            />
            
            <TabButton
              icon={Globe}
              label="Locations"
              isActive={currentView === 'locations'}
              onClick={() => setCurrentView('locations')}
            />
            
            <TabButton
              icon={Users}
              label="Villains"
              isActive={currentView === 'villains'}
              onClick={() => setCurrentView('villains')}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="min-h-[600px]">
        {renderCurrentView()}
      </div>
    </div>
  );
};

export default ContentManagementLayout;