import React, { useState, useEffect } from 'react';
import { Clock, Play, Pause, AlertTriangle } from 'lucide-react';

interface GameTimerProps {
  initialTime: number; // seconds
  isRunning: boolean;
  onTimeUp?: () => void;
  onTimeWarning?: (remainingSeconds: number) => void;
  warningThreshold?: number; // seconds
  className?: string;
}

const GameTimer: React.FC<GameTimerProps> = ({
  initialTime,
  isRunning,
  onTimeUp,
  onTimeWarning,
  warningThreshold = 30,
  className = ''
}) => {
  const [timeRemaining, setTimeRemaining] = useState(initialTime);
  const [hasWarned, setHasWarned] = useState(false);

  // Reset timer when initialTime changes
  useEffect(() => {
    setTimeRemaining(initialTime);
    setHasWarned(false);
  }, [initialTime]);

  // Timer countdown logic
  useEffect(() => {
    if (!isRunning || timeRemaining <= 0) return;

    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        const newTime = prev - 1;
        
        // Warning threshold
        if (newTime <= warningThreshold && !hasWarned && onTimeWarning) {
          onTimeWarning(newTime);
          setHasWarned(true);
        }
        
        // Time up
        if (newTime <= 0) {
          onTimeUp?.();
          return 0;
        }
        
        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, timeRemaining, warningThreshold, hasWarned, onTimeWarning, onTimeUp]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimeColor = () => {
    if (timeRemaining <= 10) return 'text-red-600';
    if (timeRemaining <= warningThreshold) return 'text-orange-600';
    return 'text-blue-600';
  };

  const getProgressPercentage = () => {
    return (timeRemaining / initialTime) * 100;
  };

  const isWarning = timeRemaining <= warningThreshold;
  const isCritical = timeRemaining <= 10;

  return (
    <div className={`bg-white rounded-lg shadow border p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-700 flex items-center">
          <Clock className="mr-2" size={16} />
          Round Timer
        </h3>
        
        <div className="flex items-center space-x-2">
          {isRunning ? (
            <Play className="text-green-500" size={14} />
          ) : (
            <Pause className="text-gray-500" size={14} />
          )}
          
          {isWarning && (
            <AlertTriangle className={`${isCritical ? 'text-red-500' : 'text-orange-500'} animate-pulse`} size={14} />
          )}
        </div>
      </div>

      {/* Time Display */}
      <div className={`text-center mb-4 ${getTimeColor()}`}>
        <div className={`text-3xl font-bold font-mono ${isCritical ? 'animate-pulse' : ''}`}>
          {formatTime(timeRemaining)}
        </div>
        <div className="text-xs text-gray-500 mt-1">
          {isRunning ? 'Counting down...' : 'Paused'}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-gray-600">
          <span>Progress</span>
          <span>{Math.round(getProgressPercentage())}%</span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-1000 ${
              isCritical ? 'bg-red-500' :
              isWarning ? 'bg-orange-500' :
              'bg-blue-500'
            }`}
            style={{ width: `${getProgressPercentage()}%` }}
          />
        </div>
      </div>

      {/* Status Message */}
      <div className="mt-3 text-center">
        {timeRemaining === 0 ? (
          <div className="text-red-600 text-sm font-medium">
            ⏰ Time's Up!
          </div>
        ) : isCritical ? (
          <div className="text-red-600 text-sm font-medium animate-pulse">
            🚨 Critical - Submit Now!
          </div>
        ) : isWarning ? (
          <div className="text-orange-600 text-sm font-medium">
            ⚠️ Warning - Time Running Out
          </div>
        ) : (
          <div className="text-gray-600 text-sm">
            🕵️ Investigation in Progress
          </div>
        )}
      </div>
    </div>
  );
};

export default GameTimer;