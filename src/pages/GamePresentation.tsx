import React, { useState, useEffect } from 'react';
import { Play, Settings, Users, Clock, Trophy, Globe } from 'lucide-react';
import WorldMap from '../components/WorldMap';
import ImageModal from '../components/ImageModal';

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
  description: string;
  difficultyLevel: number;
  villainName: string;
  locationCountry: string;
  estimatedDurationMinutes: number;
}

const GamePresentation: React.FC = () => {
  const [cases, setCases] = useState<Case[]>([]);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [gameMode, setGameMode] = useState<3 | 5>(5);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentSession, setCurrentSession] = useState<GameSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [revealedAnswers, setRevealedAnswers] = useState<Set<number>>(new Set());
  const [revealedHints, setRevealedHints] = useState<Map<number, number>>(new Map()); // roundNumber -> number of hints revealed (0-3)
  const [showMapSection, setShowMapSection] = useState(false);
  
  // Image modal state
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [modalImageSrc, setModalImageSrc] = useState('');
  const [modalImageAlt, setModalImageAlt] = useState('');
  const [modalClueNumber, setModalClueNumber] = useState<number | undefined>(undefined);

  console.log('GamePresentation component rendered'); // Debug log

  // Load available cases
  useEffect(() => {
    console.log('Loading cases...'); // Debug log
    const loadCases = async () => {
      try {
        const response = await fetch('/api/content/cases');
        console.log('Cases response:', response.status); // Debug log
        if (response.ok) {
          const casesData = await response.json();
          console.log('Cases raw data:', casesData); // Debug log
          
          // Handle different possible response formats
          let processedCases = [];
          if (Array.isArray(casesData)) {
            processedCases = casesData;
          } else if (casesData && casesData.data && Array.isArray(casesData.data.cases)) {
            // API returns {success: true, data: {cases: [...]}}
            processedCases = casesData.data.cases;
          } else if (casesData && Array.isArray(casesData.cases)) {
            processedCases = casesData.cases;
          } else if (casesData && typeof casesData === 'object') {
            // If it's an object with case IDs as keys, convert to array
            processedCases = Object.values(casesData);
          }
          
          console.log('Cases loaded:', processedCases.length); // Debug log
          setCases(processedCases);
          if (processedCases.length > 0) {
            setSelectedCase(processedCases[0]);
          }
        }
      } catch (error) {
        console.error('Failed to load cases:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCases();
  }, []);

  const startPresentation = async () => {
    if (!selectedCase) {
      console.error('No case selected');
      return;
    }

    console.log('Starting presentation for case:', selectedCase.id);

    try {
      // Create a new game session
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          caseId: selectedCase.id,
          maxRounds: gameMode 
        }),
      });

      console.log('Session creation response status:', response.status);

      if (response.ok) {
        const sessionResponse = await response.json();
        console.log('Session response:', sessionResponse);
        
        let session;
        if (sessionResponse.success && sessionResponse.data) {
          session = sessionResponse.data;
        } else if (sessionResponse.session) {
          session = sessionResponse.session;
        } else {
          session = sessionResponse;
        }
        
        console.log('Setting current session:', session);
        setCurrentSession(session);
        
        // Enter fullscreen mode
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
          setIsFullscreen(true);
        }
      }
    } catch (error) {
      console.error('Failed to start presentation:', error);
    }
  };

  const exitPresentation = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
    setIsFullscreen(false);
    setCurrentSession(null);
  };

  const handleLocationGuess = async (latitude: number, longitude: number, locationName: string) => {
    if (!currentSession) return;

    try {
      const response = await fetch(`/api/sessions/${currentSession.id}/guess`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          latitude, 
          longitude,
          locationName 
        }),
      });

      if (response.ok) {
        const updatedSession = await response.json();
        let sessionData;
        if (updatedSession.success && updatedSession.data) {
          sessionData = updatedSession.data.session || updatedSession.data;
        } else if (updatedSession.session) {
          sessionData = updatedSession.session;
        } else {
          sessionData = updatedSession;
        }
        setCurrentSession(sessionData);
        
        // You could add a toast notification here about the guess result
        console.log(`Guessed ${locationName} - Distance: ${sessionData.lastGuess?.distance}km, Points: ${sessionData.lastGuess?.points}`);
      }
    } catch (error) {
      console.error('Failed to submit guess:', error);
    }
  };

  const revealNextClue = async () => {
    if (!currentSession) {
      console.error('No current session for clue reveal');
      return;
    }

    console.log('Revealing clue for session:', currentSession.id);
    console.log('Current session state:', currentSession);

    try {
      // First, reveal the clue for the current round
      const response = await fetch(`/api/sessions/${currentSession.id}/reveal`, {
        method: 'POST',
      });

      console.log('Reveal response status:', response.status);
      
      if (response.ok) {
        const updatedSession = await response.json();
        console.log('Updated session received:', updatedSession);
        
        let sessionData;
        if (updatedSession.success && updatedSession.data) {
          sessionData = updatedSession.data;
        } else if (updatedSession.session) {
          sessionData = updatedSession.session;
        } else {
          sessionData = updatedSession;
        }
        
        // Now advance to the next round (if not the last round)
        if (sessionData.currentRound < sessionData.maxRounds) {
          console.log('Advancing to next round...');
          const advanceResponse = await fetch(`/api/sessions/${currentSession.id}/advance`, {
            method: 'POST',
          });
          
          if (advanceResponse.ok) {
            const advancedSession = await advanceResponse.json();
            console.log('Advanced session received:', advancedSession);
            if (advancedSession.success && advancedSession.data) {
              sessionData = advancedSession.data;
            } else if (advancedSession.session) {
              sessionData = advancedSession.session;
            } else {
              sessionData = advancedSession;
            }
          } else {
            console.error('Failed to advance round, status:', advanceResponse.status);
          }
        }
        
        console.log('Setting session with:', sessionData);
        setCurrentSession(sessionData);
      } else {
        console.error('Failed to reveal clue, status:', response.status);
        const errorText = await response.text();
        console.error('Error response:', errorText);
      }
    } catch (error) {
      console.error('Failed to reveal clue:', error);
    }
  };

  const revealAnswer = (roundNumber: number) => {
    setRevealedAnswers(prev => new Set(prev).add(roundNumber));
  };

  const revealNextHint = (roundNumber: number) => {
    setRevealedHints(prev => {
      const newMap = new Map(prev);
      const currentHints = newMap.get(roundNumber) || 0;
      if (currentHints < 3) {
        newMap.set(roundNumber, currentHints + 1);
      }
      return newMap;
    });
  };

  const getRevealedHintsForRound = (roundNumber: number) => {
    return revealedHints.get(roundNumber) || 0;
  };

  const openImageModal = (imageSrc: string, imageAlt: string, clueNumber?: number) => {
    setModalImageSrc(imageSrc);
    setModalImageAlt(imageAlt);
    setModalClueNumber(clueNumber);
    setIsImageModalOpen(true);
  };

  const closeImageModal = () => {
    setIsImageModalOpen(false);
    setModalImageSrc('');
    setModalImageAlt('');
    setModalClueNumber(undefined);
  };

  // Helper function to extract image src from HTML
  const extractImageSrc = (html: string): string | null => {
    const imgMatch = html.match(/<img[^>]*src=['"]([^'"]+)['"][^>]*>/i);
    return imgMatch ? imgMatch[1] : null;
  };

  // Helper function to extract image alt from HTML
  const extractImageAlt = (html: string): string => {
    const altMatch = html.match(/<img[^>]*alt=['"]([^'"]+)['"][^>]*>/i);
    return altMatch ? altMatch[1] : 'Clue Evidence';
  };

  // Helper function to strip img tags from HTML (they'll be rendered separately)
  const stripImageTags = (html: string): string => {
    return html.replace(/<img[^>]*>/gi, '');
  };

  const advanceToNextRound = async () => {
    if (!currentSession) return;

    try {
      const response = await fetch(`/api/sessions/${currentSession.id}/advance`, {
        method: 'POST',
      });

      if (response.ok) {
        const updatedSession = await response.json();
        let sessionData;
        if (updatedSession.success && updatedSession.data) {
          sessionData = updatedSession.data;
        } else if (updatedSession.session) {
          sessionData = updatedSession.session;
        } else {
          sessionData = updatedSession;
        }
        setCurrentSession(sessionData);
      }
    } catch (error) {
      console.error('Failed to advance round:', error);
    }
  };

  // Setup Screen (when not presenting)
  if (!isFullscreen || !currentSession) {
    console.log('Rendering setup screen'); // Debug log
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-8">
        <div className="max-w-6xl mx-auto">
          {/* Debug info */}
          <div className="text-white text-center mb-4">
            <p>Debug: isLoading={isLoading.toString()}, cases={cases.length}, selectedCase={selectedCase?.title || 'none'}</p>
          </div>
          
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-6xl font-bold text-white mb-4 flex items-center justify-center">
              🕵️ Where in the World is Sourdough Pete?
            </h1>
            <p className="text-2xl text-blue-200">
              Geography Detective Game - Teacher Presentation Mode
            </p>
          </div>

          {/* Game Setup */}
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Case Selection */}
              <div>
                <h2 className="text-3xl font-bold text-white mb-6 flex items-center">
                  <Globe className="mr-3" size={32} />
                  Select Case
                </h2>
                
                {isLoading ? (
                  <div className="text-white text-center py-8">Loading cases...</div>
                ) : cases && cases.length > 0 ? (
                  <div className="space-y-4">
                    {cases.map((caseItem, index) => (
                      <div
                        key={`case-${caseItem.id || index}`}
                        onClick={() => setSelectedCase(caseItem)}
                        className={`p-6 rounded-xl cursor-pointer transition-all duration-200 border-2 relative ${
                          selectedCase?.id === caseItem.id
                            ? 'bg-green-600 border-green-400 text-white shadow-lg'
                            : 'bg-gray-800 hover:bg-gray-700 border-gray-600 hover:border-gray-500 text-white'
                        }`}
                      >
                        {/* Present Game Button - Only show on selected card */}
                        {selectedCase?.id === caseItem.id && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent card click when clicking button
                              startPresentation();
                            }}
                            className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-lg transition-all duration-200 transform hover:scale-105 flex items-center space-x-2 z-10"
                          >
                            <Play size={16} />
                            <span>PRESENT</span>
                          </button>
                        )}
                        
                        <h3 className="text-xl font-bold mb-2 pr-24">{caseItem.title || 'Unknown Case'}</h3>
                        <p className="text-gray-200 mb-2 text-sm leading-relaxed">
                          {caseItem.description ? caseItem.description.substring(0, 120) + '...' : 'No description available'}
                        </p>
                        <div className="flex justify-between text-sm">
                          <span className="text-yellow-300 font-semibold">
                            Difficulty: {caseItem.difficultyLevel || 'Unknown'}/5
                          </span>
                          <span className="text-green-300 font-semibold">
                            Location: {caseItem.locationCountry || 'Unknown'}
                          </span>
                        </div>
                        <div className="mt-2 text-xs text-blue-300">
                          <span>👤 {caseItem.villainName || 'Unknown Villain'} • ⏱️ {caseItem.estimatedDurationMinutes || 30} min</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-red-900/30 rounded-xl border border-red-500">
                    <p className="text-red-200 mb-4 text-lg font-bold">⚠️ No cases found!</p>
                    <p className="text-red-300 text-sm">Debug: API responded but cases array is empty or invalid.</p>
                    <p className="text-red-300 text-sm mt-2">Check the API endpoint: /api/content/cases</p>
                    <p className="text-red-300 text-sm mt-1">Cases length: {cases?.length || 0}</p>
                  </div>
                )}
              </div>

              {/* Game Settings */}
              <div>
                <h2 className="text-3xl font-bold text-white mb-6 flex items-center">
                  <Settings className="mr-3" size={32} />
                  Game Settings
                </h2>
                
                <div className="space-y-6">
                  {/* Round Selection */}
                  <div>
                    <label className="block text-xl font-semibold text-white mb-4">
                      Number of Rounds
                    </label>
                    <div className="flex gap-4">
                      <button
                        onClick={() => setGameMode(3)}
                        className={`flex-1 p-4 rounded-xl font-bold text-lg transition-all duration-200 border-2 ${
                          gameMode === 3
                            ? 'bg-green-600 border-green-400 text-white'
                            : 'bg-gray-800 border-gray-600 text-white hover:bg-gray-700 hover:border-gray-500'
                        }`}
                      >
                        3 Rounds (Quick)
                      </button>
                      <button
                        onClick={() => setGameMode(5)}
                        className={`flex-1 p-4 rounded-xl font-bold text-lg transition-all duration-200 border-2 ${
                          gameMode === 5
                            ? 'bg-green-600 border-green-400 text-white'
                            : 'bg-gray-800 border-gray-600 text-white hover:bg-gray-700 hover:border-gray-500'
                        }`}
                      >
                        5 Rounds (Full)
                      </button>
                    </div>
                  </div>

                  {/* Game Info */}
                  <div className="bg-gray-800 border border-gray-600 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                      <Users className="mr-2" />
                      How It Works
                    </h3>
                    <ul className="text-gray-200 space-y-2">
                      <li>• Teacher presents clues one by one</li>
                      <li>• Students collaborate to guess the location</li>
                      <li>• Click anywhere on the map to make guesses</li>
                      <li>• Closer guesses earn more points</li>
                      <li>• Perfect for HDMI projection</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Selected Case Summary */}
            {selectedCase && (
              <div className="mt-8 p-6 bg-white/5 rounded-xl border border-white/20">
                <h3 className="text-2xl font-bold text-white mb-3 flex items-center">
                  🎯 Selected Case: {selectedCase.title}
                </h3>
                <p className="text-blue-200 text-lg">
                  Ready to present! The "PRESENT" button is in the top-right corner of the selected case above.
                </p>
                <p className="text-yellow-200 mt-2 text-sm">
                  💡 Tip: This will enter fullscreen mode for classroom presentation
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Presentation Mode (fullscreen game)
  if (!currentSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Loading Game Session...</h2>
          <p className="text-xl">Please wait while we prepare your game.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative">
      {/* Exit button */}
      <button
        onClick={exitPresentation}
        className="absolute top-4 right-4 z-50 bg-red-500/80 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
      >
        Exit Presentation
      </button>

      {/* Game Content */}
      <div className="min-h-screen flex flex-col">
        {/* Header */}
        <div className="bg-black/30 backdrop-blur-sm p-6 text-center">
          <h1 className="text-5xl font-bold text-white mb-2">
            {currentSession.caseData?.title}
          </h1>
          <div className="flex justify-center items-center space-x-8 text-2xl text-white">
            <div className="flex items-center space-x-2">
              <Clock size={24} />
              <span>Round {currentSession.currentRound} of {currentSession.maxRounds}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Trophy size={24} />
              <span>Score: {currentSession.score}</span>
            </div>
          </div>
        </div>

        {/* Main Game Area */}
        <div className="flex-1 p-8">
          <div className="max-w-6xl mx-auto">
            {/* Mission Briefing */}
            {currentSession && currentSession.caseData?.briefing?.narrativeHtml && (
              <div className="bg-blue-900/20 backdrop-blur-lg rounded-3xl p-8 mb-8 border border-blue-300/30">
                <div 
                  className="text-white text-lg leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: currentSession.caseData.briefing.narrativeHtml }}
                />
              </div>
            )}

            {/* Current Clue Display */}
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 mb-8 border border-white/20">
              <h2 className="text-3xl font-bold text-white mb-6 text-center">
                🔍 Investigation Progress
              </h2>
              
              {currentSession && currentSession.revealedClues && currentSession.revealedClues.length > 0 ? (
                <div className="space-y-8">
                  {currentSession.revealedClues.map((revealedClue: any) => {
                    const roundNumber = revealedClue.round; // Use the round number directly from the API
                    const roundData = currentSession.caseData?.rounds?.[roundNumber - 1]; // Convert to 0-based index for array access
                    const isAnswerRevealed = revealedAnswers.has(roundNumber);
                    
                    return (
                      <div key={`clue-${roundNumber}`} className="border border-white/20 rounded-xl p-6 bg-white/5">
                        <div className="text-center">
                          <div className="text-2xl text-yellow-300 mb-4 font-semibold">
                            Clue #{roundNumber}
                          </div>
                          
                          {/* Clue Image - Extract from clueHtml */}
                          {(() => {
                            const clueHtml = revealedClue.clue || revealedClue.clueHtml || '';
                            const imageSrc = revealedClue.image || extractImageSrc(clueHtml);
                            const imageAlt = extractImageAlt(clueHtml) || `Clue ${roundNumber} Evidence`;
                            
                            if (imageSrc) {
                              return (
                                <div className="mb-6 flex justify-center">
                                  <div className="relative group w-full max-w-3xl">
                                    <img 
                                      src={imageSrc}
                                      alt={imageAlt}
                                      data-test-id="clue-image-standardized"
                                      className="w-full h-auto rounded-lg shadow-lg border-4 border-yellow-400 cursor-pointer hover:shadow-2xl hover:scale-[1.02] transition-all duration-300"
                                      onClick={() => openImageModal(imageSrc, imageAlt, roundNumber)}
                                      onError={(e) => {
                                        console.error('Image failed to load:', e.currentTarget.src);
                                        e.currentTarget.src = '/images/placeholder-villain.png';
                                      }}
                                    />
                                    {/* Hover tooltip */}
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                                      <div className="bg-black/70 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg">
                                        🔍 Click to enlarge
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          })()}
                          
                          {/* Clue Text */}
                          <div className="text-lg text-white leading-relaxed max-w-4xl mx-auto mb-4">
                            <div dangerouslySetInnerHTML={{ 
                              __html: stripImageTags(revealedClue.clue || revealedClue.clueHtml || '')
                            }} />
                          </div>
                          
                          {/* Progressive Hints and Answer Section */}
                          <div className="space-y-4">
                            {/* Research Hints */}
                            {roundData?.researchPrompts && (() => {
                              const revealedHintsCount = getRevealedHintsForRound(roundNumber);
                              const maxHints = Math.min(3, roundData.researchPrompts.length);
                              
                              return (
                                <div className="space-y-3">
                                  {/* Show revealed hints */}
                                  {Array.from({ length: revealedHintsCount }, (_, i) => (
                                    <div key={i} className="bg-blue-900/30 border border-blue-400 rounded-lg p-4">
                                      <div className="text-blue-300 font-semibold mb-2">
                                        🔍 Research Hint #{i + 1}:
                                      </div>
                                      <div className="text-blue-100">
                                        {roundData.researchPrompts[i]}
                                      </div>
                                    </div>
                                  ))}
                                  
                                  {/* Show next hint button if more hints available */}
                                  {revealedHintsCount < maxHints && !isAnswerRevealed && (
                                    <button
                                      onClick={() => revealNextHint(roundNumber)}
                                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold text-lg transition-colors shadow-lg border-2 border-blue-400"
                                    >
                                      💡 Reveal Hint #{revealedHintsCount + 1}
                                    </button>
                                  )}
                                </div>
                              );
                            })()}
                            
                            {/* Answer Reveal Button */}
                            {!isAnswerRevealed ? (
                              <button
                                onClick={() => revealAnswer(roundNumber)}
                                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-bold text-lg transition-colors shadow-lg border-2 border-green-400"
                              >
                                🎯 Reveal Answer #{roundNumber}
                              </button>
                            ) : (
                              <div className="bg-green-900/30 border border-green-400 rounded-lg p-6 mt-4">
                                <div className="text-2xl text-green-300 font-bold mb-4">
                                  ✅ Answer: {roundData?.answer?.name}
                                </div>
                                <div className="text-green-100 leading-relaxed max-w-4xl mx-auto">
                                  <div dangerouslySetInnerHTML={{ 
                                    __html: roundData?.explainHtml || ''
                                  }} />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center text-2xl text-blue-200">
                  Ready to reveal the first clue!
                </div>
              )}
            </div>

            {/* Interactive World Map - Collapsible */}
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold text-white">
                  🌍 Make Your Guess
                </h2>
                <button
                  onClick={() => setShowMapSection(!showMapSection)}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  {showMapSection ? '▼ Hide Map' : '▶ Show Map'}
                </button>
              </div>
              
              {showMapSection && (
                <div>
                  <p className="text-gray-300 text-center mb-4">
                    🗺️ Use the clues to guide your investigation on the interactive map below!
                  </p>
                  <WorldMap
                    onLocationGuess={handleLocationGuess}
                    disabled={!currentSession || currentSession.revealedClues?.length === 0}
                    caseHints={{
                      // Get target location from the current round's answer
                      targetLocation: currentSession?.caseData?.rounds?.[currentSession.currentRound - 1]?.answer ? {
                        lat: currentSession.caseData.rounds[currentSession.currentRound - 1].answer.lat,
                        lng: currentSession.caseData.rounds[currentSession.currentRound - 1].answer.lng,
                        name: currentSession.caseData.rounds[currentSession.currentRound - 1].answer.name
                      } : undefined,
                      
                      // Focus the map based on case focus areas
                      focusRegion: (() => {
                        const currentRound = currentSession?.caseData?.rounds?.[currentSession.currentRound - 1];
                        if (currentRound?.focus?.includes('mountain')) {
                          return { bounds: [[-60, -180], [70, 180]] as [[number, number], [number, number]] }; // Mountain regions
                        }
                        if (currentRound?.focus?.includes('marine') || currentRound?.focus?.includes('coastal')) {
                          return { bounds: [[-40, -180], [60, 180]] as [[number, number], [number, number]] }; // Coastal regions
                        }
                        if (currentRound?.focus?.includes('desert')) {
                          return { bounds: [[-30, -180], [45, 180]] as [[number, number], [number, number]] }; // Desert regions
                        }
                        return { bounds: [[-60, -180], [70, 180]] as [[number, number], [number, number]] }; // World view
                      })(),
                      
                      // Provide context from the current clue
                      clueContext: currentSession?.revealedClues?.length > 0 ? 
                        currentSession.revealedClues[currentSession.revealedClues.length - 1]?.clueHtml?.replace(/<[^>]*>/g, '').substring(0, 200) + '...' : 
                        undefined,
                      
                      round: currentSession?.currentRound || 1
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Game Controls */}
        <div className="bg-black/30 backdrop-blur-sm p-6">
          <div className="max-w-6xl mx-auto flex justify-center space-x-8">
            <button 
              onClick={revealNextClue}
              disabled={!currentSession || (currentSession.revealedClues?.length >= currentSession.maxRounds)}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-8 py-4 rounded-xl font-bold text-xl transition-colors shadow-lg border-2 border-blue-400"
              style={{ color: 'white', backgroundColor: currentSession && currentSession.revealedClues?.length < currentSession.maxRounds ? '#2563eb' : '#6b7280' }}
            >
              {currentSession?.revealedClues?.length === 0 ? 'Reveal First Clue' : 'Reveal Next Clue'}
            </button>
            <button 
              onClick={() => {
                // This will be triggered by the WorldMap component
                // Just show some feedback
                alert('Click on the world map above to submit your guess!');
              }}
              disabled={!currentSession || currentSession.revealedClues?.length === 0}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-8 py-4 rounded-xl font-bold text-xl transition-colors shadow-lg border-2 border-green-400"
              style={{ color: 'white', backgroundColor: currentSession && currentSession.revealedClues?.length > 0 ? '#16a34a' : '#6b7280' }}
            >
              Make Guess on Map
            </button>
            <button 
              onClick={advanceToNextRound}
              disabled={!currentSession || currentSession.guesses?.length === 0 || currentSession.currentRound >= currentSession.maxRounds}
              className="bg-purple-500 hover:bg-purple-600 disabled:bg-gray-500 disabled:cursor-not-allowed text-white px-8 py-4 rounded-xl font-bold text-xl transition-colors"
            >
              Next Round
            </button>
          </div>
          
          {/* Game Status Display */}
          {currentSession && (
            <div className="text-center mt-4 text-white/80">
              <p className="text-sm">
                Round {currentSession.currentRound} of {currentSession.maxRounds} • 
                Clues Revealed: {currentSession.revealedClues?.length || 0}/3 • 
                Guesses Made: {currentSession.guesses?.length || 0}
              </p>
              {currentSession.guesses?.length > 0 && (
                <p className="text-sm mt-1">
                  Last Guess: {currentSession.guesses[currentSession.guesses.length - 1]?.distance}km away, 
                  {currentSession.guesses[currentSession.guesses.length - 1]?.points} points
                </p>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Image Modal */}
      <ImageModal
        isOpen={isImageModalOpen}
        onClose={closeImageModal}
        imageSrc={modalImageSrc}
        imageAlt={modalImageAlt}
        clueNumber={modalClueNumber}
      />
    </div>
  );
};

export default GamePresentation;