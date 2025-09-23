import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { GameProvider } from '../../contexts/GameContext';
import { NotificationProvider } from '../../contexts/NotificationContext';
import NotificationToast from '../common/NotificationToast';
import TeacherDashboard from './TeacherDashboard';
import StudentInterface from './StudentInterface';
import RealTimeActivityFeed from './RealTimeActivityFeed';
import LiveTeamStatus from './LiveTeamStatus';

interface GameLayoutProps {
  className?: string;
}

const GameLayout: React.FC<GameLayoutProps> = ({ className = '' }) => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className={`flex items-center justify-center min-h-96 ${className}`}>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-700 mb-4">Authentication Required</h2>
          <p className="text-gray-600">Please log in to access the game.</p>
        </div>
      </div>
    );
  }

  const isTeacher = user.role === 'teacher' || user.role === 'admin';

  return (
    <NotificationProvider>
      <GameProvider>
        <div className={`min-h-screen bg-gray-50 ${className}`}>
          <NotificationToast />
          
          <div className="container mx-auto px-4 py-8">
            {isTeacher ? (
              <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                {/* Main Dashboard */}
                <div className="xl:col-span-3">
                  <TeacherDashboard />
                </div>
                
                {/* Real-time Sidebar */}
                <div className="xl:col-span-1 space-y-6">
                  <RealTimeActivityFeed className="h-fit" />
                  <LiveTeamStatus className="h-fit" />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Main Student Interface */}
                <div className="xl:col-span-2">
                  <StudentInterface />
                </div>
                
                {/* Real-time Sidebar */}
                <div className="xl:col-span-1 space-y-6">
                  <LiveTeamStatus className="h-fit" />
                  <RealTimeActivityFeed className="h-fit" />
                </div>
              </div>
            )}
          </div>
        </div>
      </GameProvider>
    </NotificationProvider>
  );
};

export default GameLayout;