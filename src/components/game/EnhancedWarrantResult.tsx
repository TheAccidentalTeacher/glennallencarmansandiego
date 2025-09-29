import React from 'react';
import { CheckCircle, XCircle, MapPin, Eye, TrendingUp, Award, Target, Book } from 'lucide-react';
import type { LocationClueAnalysis } from '../../services/clientClueLocationService';

// Enhanced version of WarrantResult with additional properties
interface EnhancedWarrantResult {
  correct: boolean;
  pointsAwarded: number;
  feedback: string;
  correctLocation?: {
    id: string;
    name: string;
    country: string;
  };
  // Enhanced properties
  distanceFromTarget?: number;
  bonusPoints?: number;
  detailedFeedback?: string[];
}

interface EnhancedWarrantResultProps {
  result: EnhancedWarrantResult;
  clueAnalysis?: LocationClueAnalysis;
  showDetailedFeedback?: boolean;
  onClose?: () => void;
  className?: string;
}

const EnhancedWarrantResult: React.FC<EnhancedWarrantResultProps> = ({
  result,
  clueAnalysis,
  showDetailedFeedback = true,
  onClose,
  className = ''
}) => {
  const getResultIcon = () => {
    return result.correct ? (
      <CheckCircle className="text-green-500" size={32} />
    ) : (
      <XCircle className="text-red-500" size={32} />
    );
  };

  const getResultColor = () => {
    return result.correct 
      ? 'border-green-200 bg-green-50'
      : 'border-red-200 bg-red-50';
  };

  const getPointsColor = () => {
    if (result.pointsAwarded >= 400) return 'text-green-600';
    if (result.pointsAwarded >= 300) return 'text-blue-600';
    if (result.pointsAwarded >= 200) return 'text-yellow-600';
    if (result.pointsAwarded > 0) return 'text-orange-600';
    return 'text-gray-600';
  };

  const getDistanceColor = (distance?: number) => {
    if (!distance) return 'text-gray-600';
    if (distance <= 100) return 'text-green-600';
    if (distance <= 500) return 'text-blue-600';
    if (distance <= 1000) return 'text-yellow-600';
    if (distance <= 2000) return 'text-orange-600';
    return 'text-red-600';
  };

  const getDistanceFeedback = (distance?: number) => {
    if (!distance) return 'Distance calculation unavailable';
    if (distance <= 10) return 'Pinpoint accuracy!';
    if (distance <= 100) return 'Excellent precision!';
    if (distance <= 500) return 'Very close!';
    if (distance <= 1000) return 'Getting warmer...';
    if (distance <= 2000) return 'In the right region';
    return 'Keep investigating...';
  };

  return (
    <div className={`border rounded-lg p-6 ${getResultColor()} ${className}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          {getResultIcon()}
          <div className="ml-3">
            <h3 className="text-xl font-bold">
              {result.correct ? 'Case Closed! 🎉' : 'Investigation Continues...'}
            </h3>
            <p className="text-gray-600 mt-1">
              {result.correct 
                ? 'Outstanding detective work!'
                : 'Every great detective learns from each clue.'}
            </p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            title="Close"
          >
            ✕
          </button>
        )}
      </div>

      {/* Points and Distance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="bg-white rounded-lg p-4 border">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Award className="text-yellow-500 mr-2" size={20} />
              <span className="font-medium">Points Earned</span>
            </div>
            <span className={`text-2xl font-bold ${getPointsColor()}`}>
              {result.pointsAwarded}
            </span>
          </div>
          {result.bonusPoints && result.bonusPoints > 0 && (
            <div className="mt-2 text-sm text-green-600">
              +{result.bonusPoints} bonus points
            </div>
          )}
        </div>

        {result.distanceFromTarget !== undefined && (
          <div className="bg-white rounded-lg p-4 border">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center">
                <Target className="text-blue-500 mr-2" size={20} />
                <span className="font-medium">Distance</span>
              </div>
              <span className={`text-xl font-bold ${getDistanceColor(result.distanceFromTarget)}`}>
                {Math.round(result.distanceFromTarget)} km
              </span>
            </div>
            <div className={`text-sm ${getDistanceColor(result.distanceFromTarget)}`}>
              {getDistanceFeedback(result.distanceFromTarget)}
            </div>
          </div>
        )}
      </div>

      {/* Basic Feedback */}
      {result.feedback && (
        <div className="bg-white rounded-lg p-4 border mb-4">
          <div className="flex items-start">
            <Book className="text-blue-500 mr-2 mt-0.5 flex-shrink-0" size={16} />
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Detective Notes</h4>
              <p className="text-gray-700">{result.feedback}</p>
            </div>
          </div>
        </div>
      )}

      {/* Detailed Clue Analysis */}
      {showDetailedFeedback && clueAnalysis && (
        <div className="space-y-4">
          {/* Educational Feedback */}
          {clueAnalysis.educationalFeedback.length > 0 && (
            <div className="bg-white rounded-lg p-4 border">
              <div className="flex items-start mb-3">
                <Eye className="text-purple-500 mr-2 mt-0.5 flex-shrink-0" size={16} />
                <h4 className="font-medium text-gray-800">Learning Insights</h4>
              </div>
              <div className="space-y-2">
                {clueAnalysis.educationalFeedback.map((feedback, index) => (
                  <div
                    key={index}
                    className="flex items-start text-gray-700 text-sm"
                  >
                    <div className="w-2 h-2 bg-purple-400 rounded-full mr-3 mt-2 flex-shrink-0" />
                    <span>{feedback}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Clue Relevance Breakdown */}
          {clueAnalysis.clueRelevance.length > 0 && (
            <div className="bg-white rounded-lg p-4 border">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <TrendingUp className="text-blue-500 mr-2" size={16} />
                  <h4 className="font-medium text-gray-800">Clue Analysis</h4>
                </div>
                <div className="text-sm text-gray-600">
                  Overall Match: {Math.round(clueAnalysis.overallMatch * 100)}%
                </div>
              </div>

              <div className="space-y-3">
                {clueAnalysis.clueRelevance.map((analysis, index) => (
                  <div key={index} className="border-l-4 border-gray-200 pl-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700 capitalize">
                        {analysis.clueType} Clue
                      </span>
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${Math.round(analysis.relevanceScore * 100)}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-600 w-8">
                          {Math.round(analysis.relevanceScore * 100)}%
                        </span>
                      </div>
                    </div>
                    {analysis.reasoning && (
                      <p className="text-xs text-gray-600 mt-1">
                        {analysis.reasoning}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Investigation Tips */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <MapPin className="text-blue-500 mr-2 mt-0.5 flex-shrink-0" size={16} />
              <div>
                <h4 className="font-medium text-blue-800 mb-2">Detective Tips</h4>
                <div className="text-sm text-blue-700 space-y-1">
                  {result.correct ? (
                    <>
                      <div>• Excellent use of geographic and cultural clues!</div>
                      <div>• Your reasoning skills helped you crack the case.</div>
                      <div>• Ready for the next challenge?</div>
                    </>
                  ) : (
                    <>
                      <div>• Review all clue types: geographic, cultural, and historical</div>
                      <div>• Look for connections between different clues</div>
                      <div>• Consider both physical and cultural geography</div>
                      <div>• Each clue builds on the previous ones</div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-center mt-6 space-x-4">
        {result.correct ? (
          <div className="text-center">
            <div className="text-green-600 font-medium mb-2">
              🎯 Case Solved Successfully!
            </div>
            <div className="text-sm text-gray-600">
              Ready for the next criminal to track down?
            </div>
          </div>
        ) : (
          <div className="text-center">
            <div className="text-blue-600 font-medium mb-2">
              🕵️ Keep investigating!
            </div>
            <div className="text-sm text-gray-600">
              Use the clues to narrow down the search area
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedWarrantResult;