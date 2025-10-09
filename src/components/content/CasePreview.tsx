import React, { useState, useEffect } from 'react';
import { X, MapPin, Clock, Users, Star, Globe, BookOpen, AlertCircle } from 'lucide-react';
import VillainImageService from '../../services/villainImageService';

interface Suspect {
  name: string;
  tags?: string[];
  description: string;
  image?: string;
}

interface Round {
  id: string;
  location: string;
  focus: string[];
  difficulty: string;
  clueHtml: string;
  image?: string; // Round-specific investigation image
  researchPrompts: string[];
  expectedProcess?: string[];
  reveal?: {
    trait: string;
    note: string;
  };
  answer: {
    name: string;
    lat: number;
    lng: number;
  };
  explainHtml: string;
  scoring: {
    base: number;
    bonus?: number;
    distanceKmFull?: number;
  };
}

interface CaseData {
  id: string;
  title: string;
  difficulty: string;
  durationMinutes: number;
  villainId: string;
  briefing: {
    headline: string;
    narrativeHtml: string;
    assets?: {
      image?: string;
    };
  };
  suspects: Suspect[];
  rounds: Round[];
}

interface CasePreviewProps {
  caseId: string;
  onClose: () => void;
  onStartGame?: (caseId: string) => void;
}

const CasePreview: React.FC<CasePreviewProps> = ({ caseId, onClose, onStartGame }) => {
  const [caseData, setCaseData] = useState<CaseData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCaseData();
  }, [caseId]);

  const loadCaseData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Load the raw case JSON file
      const response = await fetch(`/api/content/cases/${caseId}.json`);
      if (!response.ok) {
        throw new Error(`Failed to load case: ${response.status}`);
      }
      
      const data = await response.json();
      setCaseData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load case data');
      console.error('Error loading case data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    const colors: { [key: string]: string } = {
      'beginner': 'bg-green-100 text-green-800',
      'intermediate': 'bg-yellow-100 text-yellow-800', 
      'advanced': 'bg-orange-100 text-orange-800',
      'expert': 'bg-red-100 text-red-800'
    };
    return colors[difficulty] || 'bg-gray-100 text-gray-800';
  };

  const stripHtml = (html: string): string => {
    return html.replace(/<[^>]*>/g, '').trim();
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-8 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
            <span>Loading case details...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-8 rounded-lg max-w-md">
          <div className="flex items-center space-x-3 text-red-600 mb-4">
            <AlertCircle size={24} />
            <h3 className="text-lg font-semibold">Error Loading Case</h3>
          </div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={onClose}
            className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  if (!caseData) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">{caseData.title}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Case Info Bar */}
          <div className="flex flex-wrap items-center gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <Star className="text-orange-500" size={20} />
              <span className={`px-2 py-1 rounded-full text-sm font-medium ${getDifficultyColor(caseData.difficulty)}`}>
                {caseData.difficulty.charAt(0).toUpperCase() + caseData.difficulty.slice(1)}
              </span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600">
              <Clock size={20} />
              <span>~{caseData.durationMinutes} minutes</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600">
              <BookOpen size={20} />
              <span>{caseData.rounds?.length || 0} rounds</span>
            </div>
          </div>

          {/* Briefing */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4 text-red-700">Mission Briefing</h3>
            {caseData.briefing.assets?.image && (
              <img 
                src={VillainImageService.encodeImageUrl(caseData.briefing.assets.image)}
                alt="Case briefing"
                className="w-full max-w-md mx-auto rounded-lg shadow-md mb-4"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            )}
            <div 
              className="prose max-w-none text-gray-700 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: caseData.briefing.narrativeHtml }}
            />
          </div>

          {/* Suspect Information */}
          {caseData.suspects.length > 0 && (
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4 text-red-700">Primary Suspect</h3>
              {caseData.suspects.map((suspect, index) => (
                <div key={index} className="border rounded-lg p-4 bg-red-50">
                  <div className="flex flex-col md:flex-row gap-4">
                    {suspect.image && (
                      <div className="md:w-32 md:h-32 w-24 h-24 mx-auto md:mx-0 flex-shrink-0">
                        <img 
                          src={VillainImageService.encodeImageUrl(suspect.image)}
                          alt={suspect.name}
                          className="w-full h-full object-cover rounded-lg shadow-sm border"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/images/placeholder-villain.png';
                          }}
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg text-gray-900 mb-2">{suspect.name}</h4>
                      <p className="text-gray-700 mb-3">{suspect.description}</p>
                      {suspect.tags && (
                        <div className="flex flex-wrap gap-2">
                          {suspect.tags.map((tag, tagIndex) => (
                            <span 
                              key={tagIndex}
                              className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Investigation Rounds Preview */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4 text-red-700">Investigation Rounds</h3>
            <div className="grid gap-4">
              {caseData.rounds.map((round, index) => (
                <div key={index} className="border rounded-lg p-4 bg-blue-50">
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="font-semibold text-lg text-gray-900">
                      Round {index + 1}: {round.answer?.name || round.location || `Location ${index + 1}`}
                    </h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(round.difficulty || 'intermediate')}`}>
                      {round.difficulty || 'intermediate'}
                    </span>
                  </div>
                  
                  {/* Clue Content */}
                  {round.clueHtml && (
                    <div className="mb-4 p-3 bg-amber-50 border-l-4 border-amber-400 rounded-r">
                      <p className="text-sm font-semibold text-amber-800 mb-2">🕵️ Clue:</p>
                      <div 
                        className="prose prose-sm max-w-none text-amber-900"
                        dangerouslySetInnerHTML={{ __html: round.clueHtml }}
                      />
                      {/* Round-specific image if available */}
                      {round.image && (
                        <div className="mt-3 text-center">
                          {(() => {
                            // Map round index to specific villain image with correct folder prefix
                            const getVillainImageForRound = (villainId: string, roundIndex: number) => {
                              // Use VillainImageService to get the properly encoded URL for round images
                              return VillainImageService.getEncodedRoundImageUrl(villainId, roundIndex);
                            };
                            
                            return (
                              <img 
                                src={getVillainImageForRound(caseData.villainId, index)}
                                alt={`Investigation evidence for ${round.answer?.name || round.location}`}
                                className="w-48 h-36 object-cover rounded-lg shadow-md mx-auto border"
                                onError={(e) => {
                                  // Fallback to first villain image with proper URL encoding
                                  const fallbackUrl = VillainImageService.encodeImageUrl(`/images/villains/01-dr-altiplano-isabella-santos/generated-image-2025-09-25 (15).png`);
                                  (e.target as HTMLImageElement).src = fallbackUrl;
                                }}
                              />
                            );
                          })()}
                          <p className="text-xs text-amber-700 mt-1 italic">
                            Investigation Photo: {round.answer?.name || round.location}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="grid md:grid-cols-2 gap-4 text-sm mb-4">
                    <div>
                      <p className="font-medium text-gray-700 mb-1">Focus Areas:</p>
                      <div className="flex flex-wrap gap-1">
                        {round.focus?.map((focus, focusIndex) => (
                          <span 
                            key={focusIndex} 
                            className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded"
                          >
                            {focus}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700 mb-1">Points:</p>
                      <span className="text-blue-600 font-semibold">{round.scoring?.base || 100} base points</span>
                      {round.scoring?.bonus && (
                        <span className="text-green-600 ml-2">+{round.scoring.bonus} bonus</span>
                      )}
                    </div>
                  </div>
                  
                  {/* Research Prompts */}
                  {round.researchPrompts && round.researchPrompts.length > 0 && (
                    <div className="mb-4 p-3 bg-green-50 border-l-4 border-green-400 rounded-r">
                      <p className="text-sm font-semibold text-green-800 mb-2">📚 Research Challenges:</p>
                      <ul className="space-y-1">
                        {round.researchPrompts.map((prompt, promptIndex) => (
                          <li key={promptIndex} className="text-green-900 text-sm">
                            • {prompt}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {/* Expected Answer */}
                  {round.answer?.name && (
                    <div className="p-3 bg-purple-50 border-l-4 border-purple-400 rounded-r">
                      <p className="text-sm font-semibold text-purple-800 mb-1">🎯 Target Location:</p>
                      <p className="text-purple-900 font-medium">{round.answer.name}</p>
                      <p className="text-purple-700 text-xs">
                        Coordinates: {round.answer.lat}°, {round.answer.lng}°
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
            <button
              onClick={() => onStartGame && onStartGame(caseData.id)}
              className="flex-1 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center justify-center"
            >
              <Globe className="mr-2" size={20} />
              Start Investigation
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Close Preview
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CasePreview;