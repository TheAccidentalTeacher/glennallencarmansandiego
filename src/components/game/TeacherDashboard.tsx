import React, { useState, useEffect } from 'react';
import { useGame } from '../../contexts/GameContext';
import { ContentService } from '../../api';
import type { Case, GameSettings } from '../../api';
import { Clock, Play, Pause, SkipForward, Eye, Users, Trophy, Settings } from 'lucide-react';

interface TeacherDashboardProps {
  className?: string;
}

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ className = '' }) => {
  const {
    gameState,
    isLoading,
    error,
    sessionId,
    isConnected,
    startSession,
    pauseGame,
    resumeGame,
    advanceRound,
    revealNextClue,
    completeGame
  } = useGame();

  const [cases, setCases] = useState<Case[]>([]);
  const [selectedCase, setSelectedCase] = useState<string>('');
  const [gameSettings, setGameSettings] = useState<GameSettings>({
    maxRounds: 3,
    cluesPerRound: 5,
    roundDurationMinutes: 5,
    timeBetweenRounds: 60,
    autoAdvanceRounds: false,
    allowLateJoins: true,
    timeLimit: 300,
    maxTeams: 6,
    difficultyLevel: 'medium' as const
  });
  const [showSettings, setShowSettings] = useState(false);
  const [newSessionId, setNewSessionId] = useState('');

  // Load available cases
  useEffect(() => {
    const loadCases = async () => {
      try {
        const response = await ContentService.getCases();
        if (response.success && response.data) {
          setCases(response.data.cases);
          if (response.data.cases.length > 0) {
            setSelectedCase(response.data.cases[0].id);
          }
        }
      } catch (error) {
        console.error('Failed to load cases:', error);
      }
    };

    loadCases();
  }, []);

  const handleStartSession = async () => {
    if (!newSessionId.trim() || !selectedCase) {
      return;
    }

    const success = await startSession(newSessionId.trim(), {
      ...gameSettings
    });

    if (success) {
      setNewSessionId('');
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'waiting':
        return 'text-yellow-600 bg-yellow-100';
      case 'revealing':
        return 'text-blue-600 bg-blue-100';
      case 'guessing':
        return 'text-green-600 bg-green-100';
      case 'scoring':
        return 'text-purple-600 bg-purple-100';
      case 'complete':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const canRevealClue = gameState?.roundState === 'waiting' || gameState?.roundState === 'revealing';
  const canAdvanceRound = gameState?.canAdvanceRound && gameState?.roundState === 'scoring';
  const canPause = gameState?.roundState === 'revealing' || gameState?.roundState === 'guessing';
  const canResume = gameState?.roundState === 'waiting' && sessionId;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-red-800 to-red-900 text-white p-6 rounded-lg shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Teacher Command Center</h1>
            <p className="text-red-200">Control your Sourdough Pete geography investigation</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              isConnected ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
            }`}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </div>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <span className="font-medium">Error: </span>
          {error}
        </div>
      )}

      {/* Session Setup */}
      {!gameState && (
        <div className="bg-white p-6 rounded-lg shadow border">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Settings className="mr-2" size={20} />
            Start New Game Session
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Session ID
              </label>
              <input
                type="text"
                value={newSessionId}
                onChange={(e) => setNewSessionId(e.target.value)}
                placeholder="Enter session ID (e.g., ROOM-123)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Case
              </label>
              <select
                value={selectedCase}
                onChange={(e) => setSelectedCase(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="">Choose a case...</option>
                {cases.map(caseData => (
                  <option key={caseData.id} value={caseData.id}>
                    {caseData.title} - Level {caseData.difficultyLevel}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Game Settings Toggle */}
          <div className="mt-4">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="text-red-600 hover:text-red-800 font-medium"
            >
              {showSettings ? 'Hide' : 'Show'} Game Settings
            </button>
          </div>

          {/* Game Settings Panel */}
          {showSettings && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Round Duration (minutes)
                  </label>
                  <input
                    type="number"
                    value={gameSettings.roundDurationMinutes}
                    onChange={(e) => setGameSettings(prev => ({ 
                      ...prev, 
                      roundDurationMinutes: parseInt(e.target.value) || 5 
                    }))}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Teams
                  </label>
                  <input
                    type="number"
                    value={gameSettings.maxTeams}
                    onChange={(e) => setGameSettings(prev => ({ 
                      ...prev, 
                      maxTeams: parseInt(e.target.value) || 6 
                    }))}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Rounds
                  </label>
                  <input
                    type="number"
                    value={gameSettings.maxRounds}
                    onChange={(e) => setGameSettings(prev => ({ 
                      ...prev, 
                      maxRounds: parseInt(e.target.value) || 3 
                    }))}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="allowLateJoins"
                    checked={gameSettings.allowLateJoins}
                    onChange={(e) => setGameSettings(prev => ({ 
                      ...prev, 
                      allowLateJoins: e.target.checked 
                    }))}
                    className="mr-2"
                  />
                  <label htmlFor="allowLateJoins" className="text-sm font-medium text-gray-700">
                    Allow Late Joins
                  </label>
                </div>
              </div>
            </div>
          )}

          <div className="mt-6">
            <button
              onClick={handleStartSession}
              disabled={!newSessionId.trim() || !selectedCase || isLoading}
              className="w-full bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium flex items-center justify-center"
            >
              {isLoading ? (
                <>Loading...</>
              ) : (
                <>
                  <Play className="mr-2" size={20} />
                  Start Game Session
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Active Game Controls */}
      {gameState && (
        <>
          {/* Game Status */}
          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Game Status</h2>
              <div className="text-lg font-mono">
                Session: <span className="font-bold text-red-600">{sessionId}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {gameState.currentRound}
                </div>
                <div className="text-sm text-gray-600">Round</div>
              </div>
              <div className="text-center">
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(gameState.roundState)}`}>
                  {gameState.roundState}
                </div>
                <div className="text-sm text-gray-600 mt-1">Status</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 flex items-center justify-center">
                  <Clock className="mr-1" size={20} />
                  {formatTime(gameState.timeRemaining)}
                </div>
                <div className="text-sm text-gray-600">Time Left</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 flex items-center justify-center">
                  <Users className="mr-1" size={20} />
                  {gameState.teamScores?.length || 0}
                </div>
                <div className="text-sm text-gray-600">Teams</div>
              </div>
            </div>
          </div>

          {/* Game Controls */}
          <div className="bg-white p-6 rounded-lg shadow border">
            <h2 className="text-xl font-semibold mb-4">Game Controls</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button
                onClick={revealNextClue}
                disabled={!canRevealClue || isLoading}
                className="bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium flex items-center justify-center"
              >
                <Eye className="mr-2" size={16} />
                Reveal Clue
              </button>

              {canPause ? (
                <button
                  onClick={pauseGame}
                  disabled={isLoading}
                  className="bg-yellow-600 text-white py-3 px-4 rounded-lg hover:bg-yellow-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium flex items-center justify-center"
                >
                  <Pause className="mr-2" size={16} />
                  Pause Game
                </button>
              ) : (
                <button
                  onClick={resumeGame}
                  disabled={!canResume || isLoading}
                  className="bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium flex items-center justify-center"
                >
                  <Play className="mr-2" size={16} />
                  Resume Game
                </button>
              )}

              <button
                onClick={advanceRound}
                disabled={!canAdvanceRound || isLoading}
                className="bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium flex items-center justify-center"
              >
                <SkipForward className="mr-2" size={16} />
                Next Round
              </button>

              <button
                onClick={completeGame}
                disabled={isLoading}
                className="bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium flex items-center justify-center"
              >
                <Trophy className="mr-2" size={16} />
                End Game
              </button>
            </div>
          </div>

          {/* Team Scores */}
          {gameState.teamScores && gameState.teamScores.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow border">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Trophy className="mr-2" size={20} />
                Team Scores
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {gameState.teamScores
                  .sort((a, b) => b.totalScore - a.totalScore)
                  .map((team, index) => (
                    <div key={team.teamId} className={`p-4 rounded-lg border-2 ${
                      index === 0 ? 'border-yellow-400 bg-yellow-50' : 
                      index === 1 ? 'border-gray-400 bg-gray-50' :
                      index === 2 ? 'border-orange-400 bg-orange-50' :
                      'border-gray-200 bg-white'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-lg">{team.teamName}</div>
                          <div className="text-sm text-gray-600">
                            Rank #{index + 1}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-red-600">
                            {team.totalScore}
                          </div>
                          <div className="text-sm text-gray-600">points</div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TeacherDashboard;