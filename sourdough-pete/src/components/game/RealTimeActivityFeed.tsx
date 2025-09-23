import React, { useState, useEffect } from 'react';
import { useGame } from '../../contexts/GameContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { Clock, Eye, Trophy, Users, AlertCircle } from 'lucide-react';

interface ActivityEvent {
  id: string;
  type: 'clue_revealed' | 'warrant_submitted' | 'round_advance' | 'team_joined' | 'game_started' | 'game_completed';
  message: string;
  timestamp: number;
  teamName?: string;
  points?: number;
}

interface RealTimeActivityFeedProps {
  className?: string;
  maxEvents?: number;
}

const RealTimeActivityFeed: React.FC<RealTimeActivityFeedProps> = ({ 
  className = '', 
  maxEvents = 10 
}) => {
  const { gameState, sessionId } = useGame();
  const { addNotification } = useNotifications();
  const [activityEvents, setActivityEvents] = useState<ActivityEvent[]>([]);

  // Mock real-time events - in production this would come from WebSocket
  useEffect(() => {
    if (!gameState || !sessionId) return;

    const addActivityEvent = (event: Omit<ActivityEvent, 'id'>) => {
      const newEvent: ActivityEvent = {
        ...event,
        id: Math.random().toString(36).substr(2, 9)
      };

      setActivityEvents(prev => [newEvent, ...prev.slice(0, maxEvents - 1)]);

      // Show notification for important events
      if (event.type === 'clue_revealed' || event.type === 'round_advance') {
        addNotification({
          type: 'info',
          title: 'Game Update',
          message: event.message,
          duration: 3000
        });
      }
    };

    // Simulate activity based on game state changes
    const currentTime = Date.now();

    if (gameState.roundState === 'revealing') {
      addActivityEvent({
        type: 'clue_revealed',
        message: `New clue revealed for Round ${gameState.currentRound}`,
        timestamp: currentTime
      });
    }

    // Add mock team activities periodically in active game
    if (gameState.roundState === 'guessing') {
      const interval = setInterval(() => {
        const teamNames = ['Detectives United', 'Mystery Solvers', 'Carmen Hunters', 'World Trackers'];
        const randomTeam = teamNames[Math.floor(Math.random() * teamNames.length)];
        
        addActivityEvent({
          type: 'warrant_submitted',
          message: `${randomTeam} submitted an arrest warrant`,
          timestamp: Date.now(),
          teamName: randomTeam
        });
      }, 15000); // Every 15 seconds

      return () => clearInterval(interval);
    }

  }, [gameState?.roundState, gameState?.currentRound, sessionId, addNotification, maxEvents]);

  const getEventIcon = (type: ActivityEvent['type']) => {
    switch (type) {
      case 'clue_revealed':
        return <Eye className="text-blue-500" size={16} />;
      case 'warrant_submitted':
        return <AlertCircle className="text-orange-500" size={16} />;
      case 'round_advance':
        return <Clock className="text-purple-500" size={16} />;
      case 'team_joined':
        return <Users className="text-green-500" size={16} />;
      case 'game_started':
        return <Trophy className="text-yellow-500" size={16} />;
      case 'game_completed':
        return <Trophy className="text-gold-500" size={16} />;
      default:
        return <Clock className="text-gray-500" size={16} />;
    }
  };

  const getEventColor = (type: ActivityEvent['type']) => {
    switch (type) {
      case 'clue_revealed':
        return 'border-l-blue-500 bg-blue-50';
      case 'warrant_submitted':
        return 'border-l-orange-500 bg-orange-50';
      case 'round_advance':
        return 'border-l-purple-500 bg-purple-50';
      case 'team_joined':
        return 'border-l-green-500 bg-green-50';
      case 'game_started':
      case 'game_completed':
        return 'border-l-yellow-500 bg-yellow-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    
    if (diff < 60000) { // Less than 1 minute
      return 'Just now';
    } else if (diff < 3600000) { // Less than 1 hour
      const minutes = Math.floor(diff / 60000);
      return `${minutes}m ago`;
    } else {
      return new Date(timestamp).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
  };

  if (!gameState) {
    return (
      <div className={`bg-white rounded-lg shadow border p-6 ${className}`}>
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Clock className="mr-2" size={20} />
          Activity Feed
        </h3>
        <div className="text-center text-gray-500 py-8">
          <Clock className="mx-auto mb-2 text-gray-400" size={32} />
          <p>Join a game session to see live activity</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow border ${className}`}>
      <div className="p-4 border-b">
        <h3 className="text-lg font-semibold flex items-center">
          <Clock className="mr-2" size={20} />
          Live Activity Feed
        </h3>
        <p className="text-sm text-gray-600">
          Session: <span className="font-mono text-blue-600">{sessionId}</span>
        </p>
      </div>

      <div className="max-h-80 overflow-y-auto">
        {activityEvents.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <AlertCircle className="mx-auto mb-2 text-gray-400" size={24} />
            <p>No recent activity</p>
          </div>
        ) : (
          <div className="space-y-1">
            {activityEvents.map((event) => (
              <div
                key={event.id}
                className={`p-3 border-l-4 ${getEventColor(event.type)} transition-colors hover:bg-opacity-80`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-2">
                    <div className="mt-0.5">
                      {getEventIcon(event.type)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-800">{event.message}</p>
                      {event.teamName && (
                        <p className="text-xs text-gray-600 mt-1">
                          Team: <span className="font-medium">{event.teamName}</span>
                        </p>
                      )}
                      {event.points && (
                        <p className="text-xs text-green-600 mt-1">
                          +{event.points} points
                        </p>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                    {formatTimestamp(event.timestamp)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Connection Status */}
      <div className="p-3 border-t bg-gray-50">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-600">Real-time updates</span>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-green-600">Live</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealTimeActivityFeed;