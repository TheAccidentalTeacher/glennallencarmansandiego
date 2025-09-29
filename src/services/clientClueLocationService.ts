import type { Location } from '../api/content';

export interface ClueLocationContext {
  sessionId: string;
  roundNumber: number;
  targetLocation: Location;
  revealedClues: RevealedClue[];
  totalCluesAvailable: number;
  clueHints: ClueHint[];
}

export interface ClueHint {
  type: 'geography' | 'culture' | 'historical' | 'economic' | 'visual';
  hint: string;
  specificity: 'general' | 'specific' | 'precise';
  relatedClueIds: string[];
}

export interface LocationClueAnalysis {
  locationId: string;
  targetLocation: Location;
  revealedClues: RevealedClue[];
  clueHints: ClueHint[];
  contextualHints: string[];
  suggestedRegions: string[];
  clueRelevance: Array<{
    clueId: string;
    relevanceScore: number;
    explanation: string;
  }>;
  overallMatch: number;
  educationalFeedback: Array<{
    type: 'geography' | 'culture' | 'historical' | 'economic';
    title: string;
    content: string;
  }>;
}

export interface RevealedClue {
  id: string;
  text: string;
  type: 'geography' | 'culture' | 'historical' | 'economic' | 'visual';
  round: number;
  timestamp: Date;
}

/**
 * Client-side service for clue location analysis using API calls
 * This replaces the server-side clueLocationService for browser use
 */
export class ClientClueLocationService {
  /**
   * Analyze clues and provide location context via API
   */
  static async analyzeCluesForLocation(
    sessionId: string,
    roundNumber: number,
    targetLocation: Location,
    revealedClues: RevealedClue[]
  ): Promise<LocationClueAnalysis> {
    try {
      // First try to get fresh data from the server
      const response = await fetch(`/api/game/sessions/${sessionId}/clue-analysis`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to get clue analysis data: ${response.statusText}`);
      }

      const data = await response.json();
      return this.generateBasicClueAnalysis(
        data.data.targetLocation, 
        data.data.revealedClues
      );
    } catch (error) {
      console.error('Error getting clue analysis data:', error);
      
      // Fallback: Generate basic hints client-side with provided data
      return this.generateBasicClueAnalysis(targetLocation, revealedClues);
    }
  }

  /**
   * Generate contextual map hints based on clues
   */
  static generateMapHints(
    targetLocation: Location,
    revealedClues: RevealedClue[]
  ): ClueHint[] {
    const hints: ClueHint[] = [];

    // Geography hints
    const geographyClues = revealedClues.filter(clue => clue.type === 'geography');
    if (geographyClues.length > 0) {
      hints.push({
        type: 'geography',
        hint: this.generateGeographyHint(targetLocation, geographyClues),
        specificity: 'general',
        relatedClueIds: geographyClues.map(c => c.id)
      });
    }

    // Culture hints
    const cultureClues = revealedClues.filter(clue => clue.type === 'culture');
    if (cultureClues.length > 0) {
      hints.push({
        type: 'culture',
        hint: this.generateCultureHint(targetLocation, cultureClues),
        specificity: 'specific',
        relatedClueIds: cultureClues.map(c => c.id)
      });
    }

    // Economic hints
    const economicClues = revealedClues.filter(clue => clue.type === 'economic');
    if (economicClues.length > 0) {
      hints.push({
        type: 'economic',
        hint: this.generateEconomicHint(targetLocation, economicClues),
        specificity: 'general',
        relatedClueIds: economicClues.map(c => c.id)
      });
    }

    return hints;
  }

  /**
   * Fallback method to generate basic clue analysis client-side
   */
  private static generateBasicClueAnalysis(
    targetLocation: Location,
    revealedClues: RevealedClue[]
  ): LocationClueAnalysis {
    const clueHints = this.generateMapHints(targetLocation, revealedClues);
    
    return {
      locationId: targetLocation.id,
      targetLocation,
      revealedClues,
      clueHints,
      contextualHints: clueHints.map(h => h.hint),
      suggestedRegions: this.generateSuggestedRegions(targetLocation),
      clueRelevance: revealedClues.map(clue => ({
        clueId: clue.id,
        relevanceScore: 0.7, // Default relevance score
        explanation: `This ${clue.type} clue may provide hints about the target location.`
      })),
      overallMatch: 0.6, // Default match score
      educationalFeedback: [
        {
          type: 'geography',
          title: 'Geographic Context',
          content: `This location is situated at coordinates ${targetLocation.latitude}, ${targetLocation.longitude}.`
        }
      ]
    };
  }

  private static generateGeographyHint(
    location: Location,
    clues: RevealedClue[]
  ): string {
    // Simple geography hint based on location coordinates
    const { latitude, longitude } = location;
    
    if (latitude > 60) return "Look in the far northern regions";
    if (latitude < -60) return "Search in the southern polar regions";
    if (latitude > 23.5) return "Focus on northern temperate zones";
    if (latitude < -23.5) return "Check the southern hemisphere";
    return "Search near the equatorial regions";
  }

  private static generateCultureHint(
    location: Location,
    _clues: RevealedClue[]
  ): string {
    // Basic cultural hints based on region
    const regionHints = {
      'North America': "Look for North American cultural influences",
      'South America': "Search in South American regions",
      'Europe': "Focus on European cultural areas",
      'Africa': "Check African nations and territories",
      'Asia': "Search across the Asian continent",
      'Oceania': "Look in Oceania and surrounding regions",
      'Antarctica': "Check the southern polar continent"
    };

    return regionHints[location.region as keyof typeof regionHints] || 
           "Look for cultural clues in the target region";
  }

  private static generateEconomicHint(
    location: Location,
    clues: RevealedClue[]
  ): string {
    // Basic economic hints
    return "Consider the economic characteristics mentioned in the clues";
  }

  private static generateSuggestedRegions(location: Location): string[] {
    const regions = [location.region];
    
    // Add nearby regions based on coordinates
    const { latitude } = location;
    
    if (Math.abs(latitude) < 30) regions.push("Tropical regions");
    if (latitude > 30) regions.push("Northern regions");
    if (latitude < -30) regions.push("Southern regions");
    
    return regions;
  }
}