import React, { useState, useEffect } from 'react';
import { useGame } from '../../contexts/GameContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { ContentService } from '../../api';
import { ClientClueLocationService } from '../../services/clientClueLocationService';
import type { Location, WarrantSubmission, WarrantResult } from '../../api';
import type { LocationClueAnalysis } from '../../services/clientClueLocationService';
import GameTimer from './GameTimer';
import StudentGameMap from './StudentGameMap';
import EnhancedWarrantResult from './EnhancedWarrantResult';
import { 
  Clock, 
  MapPin, 
  Send, 
  Eye, 
  Users, 
  Trophy, 
  AlertCircle
} from 'lucide-react';

interface StudentInterfaceProps {
  className?: string;
}

const StudentInterface: React.FC<StudentInterfaceProps> = ({ className = '' }) => {
  const {
    gameState,
    isLoading,
    error,
    sessionId,
    isConnected,
    joinSession,
    submitWarrant,
    leaveSession
  } = useGame();
  const { addNotification } = useNotifications();

  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [reasoning, setReasoning] = useState<string>('');
  const [joinSessionId, setJoinSessionId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastWarrantResult, setLastWarrantResult] = useState<WarrantResult | null>(null);
  const [clueAnalysis, setClueAnalysis] = useState<LocationClueAnalysis | null>(null);

  // Load available locations
  useEffect(() => {
    const loadLocations = async () => {
      try {
        const response = await ContentService.getLocations();
        if (response.success && response.data) {
          setLocations(response.data.locations);
        }
      } catch (error) {
        console.error('Failed to load locations:', error);
      }
    };

    loadLocations();
  }, []);

  const handleJoinSession = async () => {
    if (!joinSessionId.trim()) return;
    
    const success = await joinSession(joinSessionId.trim());
    if (success) {
      setJoinSessionId('');
    }
  };

  const handleSubmitWarrant = async () => {
    if (!selectedLocation || !sessionId) return;

    setIsSubmitting(true);
    try {
      const warrant: WarrantSubmission = {
        locationId: selectedLocation.id,
        reasoning: reasoning.trim() || undefined
      };

      // Get clue analysis for enhanced feedback using the new API endpoint
      let analysis: LocationClueAnalysis | null = null;
      if (sessionId && gameState?.currentRound && gameState?.clueState?.revealedClues?.length > 0) {
        try {
          // Use dummy target location data for the API call - the service will fetch the real data
          const dummyLocation: Location = {
            id: 'temp',
            name: 'temp',
            country: 'temp',
            latitude: 0,
            longitude: 0,
            region: 'temp',
            description: 'temp',
            culturalInfo: 'temp',
            historicalSignificance: 'temp',
            isActive: true
          };
          
          analysis = await ClientClueLocationService.analyzeCluesForLocation(
            sessionId,
            gameState.currentRound,
            dummyLocation,
            gameState.clueState.revealedClues
          );
        } catch (error) {
          console.warn('Failed to get clue analysis:', error);
        }
      }

      const result = await submitWarrant(warrant);
      setLastWarrantResult(result);
      setClueAnalysis(analysis);
      
      if (result?.correct) {
        setSelectedLocation(null);
        setReasoning('');
        
        addNotification({
          type: 'success',
          title: 'Arrest Successful! 🎉',
          message: `Great detective work! You earned ${result.pointsAwarded} points!`,
          duration: 5000
        });
      } else {
        addNotification({
          type: 'error',
          title: 'Wrong Location 🕵️',
          message: 'Keep investigating! The criminal is still on the loose.',
          duration: 4000
        });
      }
    } catch (error) {
      console.error('Failed to submit warrant:', error);
      addNotification({
        type: 'error',
        title: 'Submission Failed',
        message: 'There was a problem submitting your warrant. Please try again.',
        duration: 4000
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTimeWarning = (remainingSeconds: number) => {
    addNotification({
      type: 'warning',
      title: 'Time Running Out! ⏰',
      message: `Only ${remainingSeconds} seconds left to submit your warrant!`,
      duration: 3000
    });
  };

  const handleTimeUp = () => {
    addNotification({
      type: 'error',
      title: 'Time\'s Up! ⏰',
      message: 'The round has ended. Wait for the next clue!',
      duration: 4000
    });
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

  const canSubmitWarrant = gameState?.roundState === 'guessing' && selectedLocation && !isSubmitting;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-800 to-blue-900 text-white p-6 rounded-lg shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Detective Station</h1>
            <p className="text-blue-200">Track down Carmen Sandiego and her gang!</p>
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

      {/* Join Session */}
      {!gameState && (
        <div className="bg-white p-6 rounded-lg shadow border">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Users className="mr-2" size={20} />
            Join Game Session
          </h2>
          
          <div className="flex space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Session ID
              </label>
              <input
                type="text"
                value={joinSessionId}
                onChange={(e) => setJoinSessionId(e.target.value)}
                placeholder="Enter session ID (e.g., ROOM-123)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleJoinSession}
                disabled={!joinSessionId.trim() || isLoading}
                className="bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
              >
                {isLoading ? 'Joining...' : 'Join Game'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active Game Interface */}
      {gameState && (
        <>
          {/* Game Status */}
          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Mission Status</h2>
              <button
                onClick={leaveSession}
                className="text-red-600 hover:text-red-800 text-sm font-medium"
              >
                Leave Session
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
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
                <div className="text-2xl font-bold text-orange-600 flex items-center justify-center">
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

            {/* Real-time Timer Widget */}
            {gameState.roundState === 'guessing' && (
              <div className="mt-4">
                <GameTimer
                  initialTime={gameState.timeRemaining}
                  isRunning={gameState.roundState === 'guessing'}
                  onTimeWarning={handleTimeWarning}
                  onTimeUp={handleTimeUp}
                  warningThreshold={30}
                  className="max-w-sm mx-auto"
                />
              </div>
            )}
          </div>

          {/* Current Mission Instructions */}
          <div className="bg-white p-6 rounded-lg shadow border">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Eye className="mr-2" size={20} />
              Mission Brief
            </h2>
            
            {gameState.roundState === 'waiting' && (
              <div className="text-center py-8">
                <AlertCircle className="mx-auto mb-4 text-yellow-500" size={48} />
                <h3 className="text-lg font-semibold text-gray-700">Waiting for the next clue...</h3>
                <p className="text-gray-600">Your teacher will reveal the next piece of evidence soon.</p>
              </div>
            )}

            {gameState.roundState === 'revealing' && (
              <div className="text-center py-8">
                <Eye className="mx-auto mb-4 text-blue-500" size={48} />
                <h3 className="text-lg font-semibold text-gray-700">Evidence is being revealed...</h3>
                <p className="text-gray-600">Pay attention to the clues being presented!</p>
              </div>
            )}

            {gameState.roundState === 'guessing' && (
              <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-green-800 mb-2">Time to make your arrest!</h3>
                <p className="text-green-700">Based on the clues you've gathered, where do you think the criminal is hiding?</p>
              </div>
            )}

            {gameState.roundState === 'scoring' && (
              <div className="text-center py-8">
                <Trophy className="mx-auto mb-4 text-purple-500" size={48} />
                <h3 className="text-lg font-semibold text-gray-700">Round complete!</h3>
                <p className="text-gray-600">Calculating scores and preparing for the next round...</p>
              </div>
            )}

            {gameState.roundState === 'complete' && (
              <div className="text-center py-8">
                <Trophy className="mx-auto mb-4 text-gold-500" size={48} />
                <h3 className="text-lg font-semibold text-gray-700">Mission Complete!</h3>
                <p className="text-gray-600">Great detective work! Check the final scores below.</p>
              </div>
            )}
          </div>

          {/* Warrant Submission Form */}
          {gameState.roundState === 'guessing' && (
            <div className="bg-white p-6 rounded-lg shadow border">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <MapPin className="mr-2" size={20} />
                Submit Arrest Warrant
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Where is the criminal hiding?
                  </label>
                  <p className="text-sm text-gray-600 mb-3">
                    Click on the world map to select the location where you think the criminal is hiding. 
                    Use the clues you've gathered to make your best detective guess!
                  </p>
                  <StudentGameMap
                    locations={locations}
                    selectedLocation={selectedLocation}
                    onLocationSelect={setSelectedLocation}
                    sessionId={sessionId || undefined}
                    roundNumber={gameState?.currentRound || 1}
                    showAllLocations={true}
                    disabled={isSubmitting}
                    className="mb-4"
                  />
                  {selectedLocation && (
                    <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center">
                        <MapPin className="text-green-600 mr-2" size={16} />
                        <span className="font-medium text-green-800">
                          Selected: {selectedLocation.name}, {selectedLocation.country}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reasoning (Optional)
                  </label>
                  <textarea
                    value={reasoning}
                    onChange={(e) => setReasoning(e.target.value)}
                    placeholder="Explain your detective reasoning..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <button
                  onClick={handleSubmitWarrant}
                  disabled={!canSubmitWarrant}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <>Submitting...</>
                  ) : (
                    <>
                      <Send className="mr-2" size={20} />
                      Submit Arrest Warrant
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Last Warrant Result */}
          {lastWarrantResult && (
            <EnhancedWarrantResult
              result={lastWarrantResult}
              clueAnalysis={clueAnalysis || undefined}
              showDetailedFeedback={true}
              onClose={() => {
                setLastWarrantResult(null);
                setClueAnalysis(null);
              }}
              className="mb-6"
            />
          )}

          {/* Team Scores */}
          {gameState.teamScores && gameState.teamScores.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow border">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Trophy className="mr-2" size={20} />
                Detective Leaderboard
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
                            {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`} Detective
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-blue-600">
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

export default StudentInterface;