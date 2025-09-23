import React, { useState, useEffect } from 'react';
import { useGame } from '../../contexts/GameContext';
import { Users, Trophy, Clock, Target, Zap } from 'lucide-react';

interface TeamStatus {
  teamId: string;
  teamName: string;
  totalScore: number;
  isOnline: boolean;
  lastActivity: number;
  currentStreak: number;
  warrantSubmitted: boolean;
}

interface LiveTeamStatusProps {
  className?: string;
}

const LiveTeamStatus: React.FC<LiveTeamStatusProps> = ({ className = '' }) => {
  const { gameState } = useGame();
  const [teamStatuses, setTeamStatuses] = useState<TeamStatus[]>([]);

  // Update team statuses based on game state
  useEffect(() => {
    if (!gameState || !gameState.teamScores) {
      setTeamStatuses([]);
      return;
    }

    const updatedStatuses: TeamStatus[] = gameState.teamScores.map((team) => ({
      teamId: team.teamId,
      teamName: team.teamName,
      totalScore: team.totalScore,
      isOnline: Math.random() > 0.1, // Mock 90% online rate
      lastActivity: Date.now() - Math.random() * 300000, // Random activity within 5 minutes
      currentStreak: Math.floor(Math.random() * 5), // Mock streak
      warrantSubmitted: gameState.roundState === 'scoring' ? Math.random() > 0.3 : false // Mock submission status
    }));

    setTeamStatuses(updatedStatuses);
  }, [gameState]);

  // Mock real-time updates
  useEffect(() => {
    if (gameState?.roundState !== 'guessing') return;

    const interval = setInterval(() => {
      setTeamStatuses(prev => prev.map(team => ({
        ...team,
        warrantSubmitted: team.warrantSubmitted || Math.random() > 0.9, // Gradually submit warrants
        lastActivity: team.warrantSubmitted ? Date.now() : team.lastActivity
      })));
    }, 2000); // Update every 2 seconds

    return () => clearInterval(interval);
  }, [gameState?.roundState]);

  const getActivityStatus = (lastActivity: number) => {
    const timeDiff = Date.now() - lastActivity;
    if (timeDiff < 30000) return { status: 'active', color: 'text-green-500', label: 'Active' };
    if (timeDiff < 120000) return { status: 'idle', color: 'text-yellow-500', label: 'Idle' };
    return { status: 'away', color: 'text-gray-500', label: 'Away' };
  };

  const formatLastActivity = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    if (diff < 60000) return 'Just now';
    const minutes = Math.floor(diff / 60000);
    return `${minutes}m ago`;
  };

  if (!gameState) {
    return (
      <div className={`bg-white rounded-lg shadow border p-6 ${className}`}>
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Users className="mr-2" size={20} />
          Team Status
        </h3>
        <div className="text-center text-gray-500 py-8">
          <Users className="mx-auto mb-2 text-gray-400" size={32} />
          <p>No active game session</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow border ${className}`}>
      <div className="p-4 border-b">
        <h3 className="text-lg font-semibold flex items-center">
          <Users className="mr-2" size={20} />
          Live Team Status
        </h3>
        <div className="text-sm text-gray-600 mt-1">
          Round {gameState.currentRound} • {teamStatuses.filter(t => t.isOnline).length} teams online
        </div>
      </div>

      <div className="divide-y divide-gray-100">
        {teamStatuses.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <Users className="mx-auto mb-2 text-gray-400" size={24} />
            <p>No teams joined yet</p>
          </div>
        ) : (
          teamStatuses
            .sort((a, b) => b.totalScore - a.totalScore)
            .map((team, index) => {
              const activity = getActivityStatus(team.lastActivity);
              const rank = index + 1;

              return (
                <div key={team.teamId} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {/* Team Rank */}
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        rank === 1 ? 'bg-yellow-100 text-yellow-800' :
                        rank === 2 ? 'bg-gray-100 text-gray-800' :
                        rank === 3 ? 'bg-orange-100 text-orange-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {rank}
                      </div>

                      {/* Team Info */}
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium text-gray-900">{team.teamName}</h4>
                          
                          {/* Online Status */}
                          <div className={`w-2 h-2 rounded-full ${
                            team.isOnline ? 'bg-green-500' : 'bg-gray-400'
                          }`} />
                          
                          {/* Warrant Status */}
                          {gameState.roundState === 'guessing' && (
                            <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                              team.warrantSubmitted 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {team.warrantSubmitted ? 'Submitted' : 'Working...'}
                            </div>
                          )}
                        </div>

                        {/* Stats Row */}
                        <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <Trophy size={14} />
                            <span>{team.totalScore} pts</span>
                          </div>
                          
                          {team.currentStreak > 0 && (
                            <div className="flex items-center space-x-1">
                              <Zap className="text-orange-500" size={14} />
                              <span className="text-orange-600">{team.currentStreak}x streak</span>
                            </div>
                          )}

                          <div className={`flex items-center space-x-1 ${activity.color}`}>
                            <div className="w-1.5 h-1.5 rounded-full bg-current" />
                            <span>{activity.label}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Last Activity */}
                    <div className="text-right text-xs text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Clock size={12} />
                        <span>{formatLastActivity(team.lastActivity)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar for Current Round */}
                  {gameState.roundState === 'guessing' && (
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                        <span>Investigation Progress</span>
                        <span>{team.warrantSubmitted ? '100%' : '70%'}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div 
                          className={`h-1.5 rounded-full transition-all duration-1000 ${
                            team.warrantSubmitted ? 'bg-green-500' : 'bg-blue-500'
                          }`}
                          style={{ width: team.warrantSubmitted ? '100%' : '70%' }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })
        )}
      </div>

      {/* Game State Footer */}
      <div className="p-3 border-t bg-gray-50">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center space-x-4">
            <span className="text-gray-600">
              {gameState.roundState === 'guessing' ? 'Teams investigating...' :
               gameState.roundState === 'revealing' ? 'Revealing clues...' :
               gameState.roundState === 'scoring' ? 'Calculating scores...' :
               'Waiting for next round...'}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            {gameState.roundState === 'guessing' && (
              <div className="flex items-center space-x-1 text-orange-600">
                <Target size={12} />
                <span>{teamStatuses.filter(t => t.warrantSubmitted).length}/{teamStatuses.length} submitted</span>
              </div>
            )}
            
            <div className="flex items-center space-x-1 text-green-600">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              <span>Live</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveTeamStatus;