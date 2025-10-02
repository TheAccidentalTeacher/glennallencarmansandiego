import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Eye, 
  MapPin, 
  ArrowRight, 
  RotateCcw,
  Trophy,
  Clock,
  Users,
  Globe,
  CheckCircle
} from 'lucide-react';

interface GameSession {
  id: string;
  caseId: string;
  caseData: any;
  currentRound: number;
  maxRounds: number;
  revealedClues: any[];
  guesses: any[];
  score: number;
  status: string;
  startedAt: string;
  updatedAt: string;
}

interface Case {
  id: string;
  title: string;
  difficulty: string;
  durationMinutes: number;
  villainId: string;
}

const TeacherControl: React.FC = () => {
  const [cases, setCases] = useState<Case[]>([]);
  const [selectedCase, setSelectedCase] = useState<string>('');
  const [currentSession, setCurrentSession] = useState<GameSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load available cases
  useEffect(() => {
    loadCases();
  }, []);

  const loadCases = async () => {
    try {
      const response = await fetch('/api/content/cases');
      const data = await response.json();
      if (data.success) {
        setCases(data.data.cases);
      }
    } catch (err) {
      setError('Failed to load cases');
      console.error('Error loading cases:', err);
    }
  };

  const startGame = async () => {
    if (!selectedCase) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caseId: selectedCase })
      });
      
      const data = await response.json();
      if (data.success) {
        setCurrentSession(data.session);
        console.log('🎮 Game started:', data.session.id);
      } else {
        setError(data.error || 'Failed to start game');
      }
    } catch (err) {
      setError('Failed to start game');
      console.error('Error starting game:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const revealClue = async () => {
    if (!currentSession) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/sessions/${currentSession.id}/reveal`, {
        method: 'POST'
      });
      
      const data = await response.json();
      if (data.success) {
        setCurrentSession(data.session);
        console.log('🔍 Clue revealed for round', data.session.currentRound + 1);
      } else {
        setError(data.error || 'Failed to reveal clue');
      }
    } catch (err) {
      setError('Failed to reveal clue');
      console.error('Error revealing clue:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const submitGuess = async (lat: number, lng: number, label: string = 'Class Guess') => {
    if (!currentSession) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/sessions/${currentSession.id}/guess`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lat, lng, label })
      });
      
      const data = await response.json();
      if (data.success) {
        setCurrentSession(data.session);
        console.log('📍 Guess submitted:', data.guess);
      } else {
        setError(data.error || 'Failed to submit guess');
      }
    } catch (err) {
      setError('Failed to submit guess');
      console.error('Error submitting guess:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const advanceRound = async () => {
    if (!currentSession) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/sessions/${currentSession.id}/advance`, {
        method: 'POST'
      });
      
      const data = await response.json();
      if (data.success) {
        setCurrentSession(data.session);
        if (data.completed) {
          console.log('🏁 Game completed!');
        } else {
          console.log('➡️ Advanced to round', data.session.currentRound + 1);
        }
      } else {
        setError(data.error || 'Failed to advance round');
      }
    } catch (err) {
      setError('Failed to advance round');
      console.error('Error advancing round:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const resetGame = () => {
    setCurrentSession(null);
    setSelectedCase('');
    setError(null);
  };

  if (!currentSession) {
    // Case Selection Screen
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-red-800 to-red-900 p-6">
        <div className="max-w-4xl mx-auto">
          <header className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">
              🎭 Teacher Control Center
            </h1>
            <p className="text-red-200 text-lg">Select a case to start your classroom adventure</p>
          </header>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-2xl font-semibold mb-4 flex items-center">
              <Globe className="mr-3 text-red-600" />
              Choose Your Case
            </h2>
            
            <div className="grid gap-4">
              {cases.map((caseItem) => (
                <div 
                  key={caseItem.id}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedCase === caseItem.id 
                      ? 'border-red-500 bg-red-50' 
                      : 'border-gray-200 hover:border-red-300'
                  }`}
                  onClick={() => setSelectedCase(caseItem.id)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{caseItem.title}</h3>
                      <p className="text-gray-600">Villain: {caseItem.villainId}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm text-gray-500">
                        {caseItem.durationMinutes} minutes
                      </span>
                      <div className="text-xs text-gray-400 mt-1">
                        {caseItem.difficulty}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={startGame}
              disabled={!selectedCase || isLoading}
              className="bg-red-600 text-white px-8 py-4 rounded-lg text-xl font-semibold hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center mx-auto"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                  Starting Game...
                </>
              ) : (
                <>
                  <Play className="mr-3" size={24} />
                  Start Game
                </>
              )}
            </button>
          </div>

          <div className="mt-8 text-center">
            <p className="text-red-200 text-sm">
              📺 Open <strong>localhost:5173/projector</strong> on your classroom display
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Game Control Screen
  const currentRound = currentSession.caseData.rounds[currentSession.currentRound];
  const hasRevealedClue = currentSession.revealedClues.some(clue => clue.roundIndex === currentSession.currentRound);
  const hasGuessForRound = currentSession.guesses.some(guess => guess.roundIndex === currentSession.currentRound);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 p-6">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">
            🎮 {currentSession.caseData.title}
          </h1>
          <div className="flex justify-center items-center space-x-6 text-blue-200">
            <span>Round {currentSession.currentRound + 1} of {currentSession.maxRounds}</span>
            <span>Score: {currentSession.score}</span>
            <span>Session: {currentSession.id.split('_')[1]}</span>
          </div>
        </header>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Control Panel */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">Round {currentSession.currentRound + 1} Controls</h2>
            
            {currentRound && (
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Round Focus:</h3>
                  <p className="text-gray-700">{currentRound.focus?.join(', ')}</p>
                </div>

                {hasRevealedClue && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2">Current Clue:</h3>
                    <div 
                      className="text-gray-700" 
                      dangerouslySetInnerHTML={{ __html: currentRound.clueHtml }}
                    />
                  </div>
                )}

                <div className="flex flex-wrap gap-3">
                  {!hasRevealedClue && (
                    <button
                      onClick={revealClue}
                      disabled={isLoading}
                      className="bg-yellow-600 text-white px-6 py-3 rounded-lg hover:bg-yellow-700 disabled:bg-gray-400 flex items-center"
                    >
                      <Eye className="mr-2" size={20} />
                      Reveal Clue
                    </button>
                  )}

                  {hasRevealedClue && !hasGuessForRound && (
                    <button
                      onClick={() => {
                        // For demo, submit a random guess
                        // In real implementation, this would open a map interface
                        const randomLat = -10 + Math.random() * 80;
                        const randomLng = -180 + Math.random() * 360;
                        submitGuess(randomLat, randomLng, 'Demo Guess');
                      }}
                      disabled={isLoading}
                      className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-400 flex items-center"
                    >
                      <MapPin className="mr-2" size={20} />
                      Submit Guess (Demo)
                    </button>
                  )}

                  {hasGuessForRound && (
                    <button
                      onClick={advanceRound}
                      disabled={isLoading}
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center"
                    >
                      <ArrowRight className="mr-2" size={20} />
                      {currentSession.currentRound >= currentSession.maxRounds - 1 ? 'Complete Game' : 'Next Round'}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Status Panel */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Game Status</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Status:</span>
                <span className={`px-2 py-1 rounded text-sm ${
                  currentSession.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {currentSession.status}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-600">Rounds:</span>
                <span>{currentSession.guesses.length} / {currentSession.maxRounds}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-600">Score:</span>
                <span className="font-semibold">{currentSession.score} pts</span>
              </div>

              {currentSession.guesses.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Recent Guesses:</h4>
                  <div className="space-y-2">
                    {currentSession.guesses.slice(-3).map((guess, idx) => (
                      <div key={idx} className="text-sm bg-gray-50 p-2 rounded">
                        <div>Round {guess.roundIndex + 1}: {guess.distance}km away</div>
                        <div className="text-green-600 font-semibold">+{guess.score} points</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 pt-6 border-t">
              <button
                onClick={resetGame}
                className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center justify-center"
              >
                <RotateCcw className="mr-2" size={16} />
                Reset Game
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherControl;