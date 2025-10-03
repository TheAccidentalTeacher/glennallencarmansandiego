import React, { useState, useEffect } from 'react';
import { MapPin, Trophy, Clock, Eye, Globe } from 'lucide-react';

interface GameSession {
  id: string;
  caseData: any;
  currentRound: number;
  maxRounds: number;
  revealedClues: any[];
  guesses: any[];
  score: number;
  status: string;
  startedAt: string;
}

const ProjectorDisplay: React.FC = () => {
  const [session, setSession] = useState<GameSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Poll for the latest session (in a real app, we'd use WebSockets)
  useEffect(() => {
    const pollInterval = setInterval(() => {
      // For now, just show a demo screen
      // In the real implementation, this would poll the latest active session
    }, 2000);

    return () => clearInterval(pollInterval);
  }, []);

  if (isLoading && !session) {
    return (
      <div className="h-screen bg-gradient-to-br from-red-900 via-red-800 to-red-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="text-6xl mb-6">🎭</div>
          <h1 className="text-4xl font-bold mb-4">Sourdough Pete's Geography Challenge</h1>
          <p className="text-xl text-red-200">Waiting for teacher to start game...</p>
          <div className="mt-8">
            <div className="animate-pulse text-red-300">
              Ready for classroom adventure!
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen bg-red-900 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-3xl font-bold mb-4">Connection Error</h1>
          <p className="text-red-200">{error}</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 flex items-center justify-center">
        <div className="text-center text-white max-w-4xl mx-auto">
          <div className="text-8xl mb-8">🕵️‍♀️</div>
          <h1 className="text-6xl font-bold mb-6">Where in the World is</h1>
          <h2 className="text-7xl font-bold text-yellow-400 mb-8">Where is Sourdough Pete?</h2>
          <p className="text-2xl text-blue-200 mb-12">
            Get ready for a geography adventure around the globe!
          </p>
          
          <div className="grid grid-cols-3 gap-8 text-xl">
            <div className="bg-blue-800 bg-opacity-50 p-6 rounded-lg">
              <Globe className="mx-auto mb-4" size={48} />
              <h3 className="font-semibold mb-2">Explore</h3>
              <p className="text-blue-200">Discover amazing places</p>
            </div>
            <div className="bg-blue-800 bg-opacity-50 p-6 rounded-lg">
              <Eye className="mx-auto mb-4" size={48} />
              <h3 className="font-semibold mb-2">Investigate</h3>
              <p className="text-blue-200">Follow the clues</p>
            </div>
            <div className="bg-blue-800 bg-opacity-50 p-6 rounded-lg">
              <Trophy className="mx-auto mb-4" size={48} />
              <h3 className="font-semibold mb-2">Solve</h3>
              <p className="text-blue-200">Catch the villain</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentRound = session.caseData.rounds[session.currentRound];
  const hasRevealedClue = session.revealedClues.some(clue => clue.roundIndex === session.currentRound);
  const latestGuess = session.guesses[session.guesses.length - 1];

  return (
    <div className="h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
      {/* Header */}
      <header className="bg-black bg-opacity-30 p-6">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <div>
            <h1 className="text-3xl font-bold">{session.caseData.title}</h1>
            <p className="text-slate-300">Round {session.currentRound + 1} of {session.maxRounds}</p>
          </div>
          <div className="flex items-center space-x-8 text-right">
            <div>
              <div className="text-2xl font-bold text-yellow-400">{session.score}</div>
              <div className="text-sm text-slate-300">Total Score</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-400">{session.guesses.length}</div>
              <div className="text-sm text-slate-300">Rounds Complete</div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="p-8 max-w-7xl mx-auto h-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
          {/* Left Column - Clue Area */}
          <div className="space-y-6">
            <div className="bg-slate-800 bg-opacity-70 backdrop-blur-sm rounded-lg p-6 min-h-[400px]">
              <h2 className="text-2xl font-bold mb-6 flex items-center">
                <Eye className="mr-3 text-blue-400" size={28} />
                Investigation Clues
              </h2>
              
              {hasRevealedClue ? (
                <div className="space-y-4">
                  <div className="bg-slate-700 bg-opacity-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-3 text-yellow-400">
                      Round {session.currentRound + 1}: {currentRound.focus?.[0]?.replace('-', ' ').toUpperCase()}
                    </h3>
                    <div 
                      className="text-slate-100 leading-relaxed text-lg"
                      dangerouslySetInnerHTML={{ __html: currentRound.clueHtml }}
                    />
                  </div>
                  
                  {currentRound.researchPrompts && (
                    <div className="bg-blue-900 bg-opacity-30 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2 text-blue-300">Research Suggestions:</h4>
                      <ul className="list-disc list-inside space-y-1 text-slate-300">
                        {currentRound.researchPrompts.slice(0, 3).map((prompt: string, idx: number) => (
                          <li key={idx}>{prompt}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center h-64 text-slate-400">
                  <div className="text-center">
                    <Clock className="mx-auto mb-4" size={64} />
                    <p className="text-xl">Waiting for teacher to reveal clue...</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Map/Results Area */}
          <div className="space-y-6">
            <div className="bg-slate-800 bg-opacity-70 backdrop-blur-sm rounded-lg p-6 min-h-[400px]">
              <h2 className="text-2xl font-bold mb-6 flex items-center">
                <MapPin className="mr-3 text-green-400" size={28} />
                Investigation Results
              </h2>
              
              {latestGuess ? (
                <div className="space-y-4">
                  <div className="bg-green-900 bg-opacity-30 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-2 text-green-300">Latest Guess</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-slate-400">Location:</span>
                        <div className="font-semibold">{latestGuess.guess.label}</div>
                      </div>
                      <div>
                        <span className="text-slate-400">Distance:</span>
                        <div className="font-semibold">{latestGuess.distance.toLocaleString()} km</div>
                      </div>
                      <div>
                        <span className="text-slate-400">Round Score:</span>
                        <div className="font-semibold text-yellow-400">+{latestGuess.score} points</div>
                      </div>
                      <div>
                        <span className="text-slate-400">Correct Answer:</span>
                        <div className="font-semibold text-green-400">{latestGuess.correct.name}</div>
                      </div>
                    </div>
                  </div>
                  
                  {currentRound.explainHtml && (
                    <div className="bg-blue-900 bg-opacity-30 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2 text-blue-300">Explanation:</h4>
                      <div 
                        className="text-slate-300"
                        dangerouslySetInnerHTML={{ __html: currentRound.explainHtml }}
                      />
                    </div>
                  )}
                </div>
              ) : hasRevealedClue ? (
                <div className="flex items-center justify-center h-64 text-slate-400">
                  <div className="text-center">
                    <Globe className="mx-auto mb-4" size={64} />
                    <p className="text-xl">Waiting for class guess...</p>
                    <p className="text-sm mt-2">Discuss the clues and make your best guess!</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-64 text-slate-400">
                  <div className="text-center">
                    <MapPin className="mx-auto mb-4 opacity-50" size={64} />
                    <p className="text-lg">Investigation map will appear here</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Progress Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-black bg-opacity-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between text-sm text-slate-300 mb-2">
            <span>Investigation Progress</span>
            <span>{session.guesses.length} / {session.maxRounds} rounds completed</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-yellow-400 to-green-400 h-3 rounded-full transition-all duration-500"
              style={{ width: `${(session.guesses.length / session.maxRounds) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectorDisplay;