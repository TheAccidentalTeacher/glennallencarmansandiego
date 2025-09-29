import { query } from './database';
import { ClueRevealService, type RevealedClue } from './clueRevealService';
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
  clueRelevance: ClueRelevanceScore[];
  overallMatch: number; // 0-1 score
  educationalFeedback: string[];
}

export interface ClueRelevanceScore {
  clueId: string;
  clueType: string;
  relevanceScore: number; // 0-1
  reasoning: string;
}

/**
 * Service to connect clue information to map-based location selection
 * This enhances the interactive map experience by providing contextual hints
 * and analyzing how well student selections align with revealed clues
 */
export class ClueLocationService {
  
  /**
   * Get the current clue context for a game session
   * Includes revealed clues and the target location for educational feedback
   */
  static async getClueLocationContext(
    sessionId: string, 
    roundNumber: number
  ): Promise<ClueLocationContext> {
    // Get session and case information
    const sessionResult = await query(
      `SELECT gs.*, c.target_location_id 
       FROM game_sessions gs
       JOIN cases c ON gs.case_id = c.id
       WHERE gs.id = $1`,
      [sessionId]
    );

    if (!sessionResult.rows[0]) {
      throw new Error(`Session ${sessionId} not found`);
    }

    const session = sessionResult.rows[0];
    const targetLocationId = session.target_location_id;

    // Get target location details
    const locationResult = await query(
      `SELECT * FROM locations WHERE id = $1`,
      [targetLocationId]
    );

    if (!locationResult.rows[0]) {
      throw new Error(`Target location ${targetLocationId} not found`);
    }

    const targetLocation: Location = {
      id: locationResult.rows[0].id,
      name: locationResult.rows[0].name,
      country: locationResult.rows[0].country,
      region: locationResult.rows[0].region,
      latitude: locationResult.rows[0].latitude,
      longitude: locationResult.rows[0].longitude,
      description: locationResult.rows[0].description,
      culturalInfo: locationResult.rows[0].cultural_info,
      historicalSignificance: locationResult.rows[0].historical_info,
      isActive: locationResult.rows[0].is_active
    };

    // Get revealed clues for this session and round
    const revealedClues = await ClueRevealService.getAvailableClues(sessionId, roundNumber);
    
    // Get total clues count for progress tracking
    const clueState = await ClueRevealService.getClueRevealState(sessionId, roundNumber);

    // Generate contextual hints based on revealed clues
    const clueHints = this.generateClueHints(revealedClues, targetLocation);

    return {
      sessionId,
      roundNumber,
      targetLocation,
      revealedClues,
      totalCluesAvailable: clueState.totalClues,
      clueHints
    };
  }

  /**
   * Analyze how well a selected location matches the revealed clues
   * Provides educational feedback for learning purposes
   */
  static async analyzeLocationClueMatch(
    sessionId: string,
    roundNumber: number,
    selectedLocationId: string
  ): Promise<LocationClueAnalysis> {
    const context = await this.getClueLocationContext(sessionId, roundNumber);
    
    // Get selected location details
    const locationResult = await query(
      `SELECT * FROM locations WHERE id = $1`,
      [selectedLocationId]
    );

    if (!locationResult.rows[0]) {
      throw new Error(`Location ${selectedLocationId} not found`);
    }

    const selectedLocation: Location = {
      id: locationResult.rows[0].id,
      name: locationResult.rows[0].name,
      country: locationResult.rows[0].country,
      region: locationResult.rows[0].region,
      latitude: locationResult.rows[0].latitude,
      longitude: locationResult.rows[0].longitude,
      description: locationResult.rows[0].description,
      culturalInfo: locationResult.rows[0].cultural_info,
      historicalSignificance: locationResult.rows[0].historical_info,
      isActive: locationResult.rows[0].is_active
    };

    // Analyze each revealed clue against the selected location
    const clueRelevance: ClueRelevanceScore[] = context.revealedClues.map(clue => 
      this.analyzeClueRelevance(clue, selectedLocation, context.targetLocation)
    );

    // Calculate overall match score
    const overallMatch = clueRelevance.length > 0 
      ? clueRelevance.reduce((sum, score) => sum + score.relevanceScore, 0) / clueRelevance.length
      : 0;

    // Generate educational feedback
    const educationalFeedback = this.generateEducationalFeedback(
      selectedLocation,
      context.targetLocation,
      clueRelevance,
      overallMatch
    );

    return {
      locationId: selectedLocationId,
      clueRelevance,
      overallMatch,
      educationalFeedback
    };
  }

  /**
   * Generate contextual hints based on revealed clues to guide map interaction
   */
  private static generateClueHints(
    revealedClues: RevealedClue[], 
    targetLocation: Location
  ): ClueHint[] {
    const hints: ClueHint[] = [];

    // Group clues by type
    const cluesByType = revealedClues.reduce((acc, clue) => {
      if (!acc[clue.type]) acc[clue.type] = [];
      acc[clue.type].push(clue);
      return acc;
    }, {} as Record<string, RevealedClue[]>);

    // Generate hints for each clue type
    Object.entries(cluesByType).forEach(([type, clues]) => {
      const hint = this.generateTypeSpecificHint(
        type as RevealedClue['type'], 
        clues, 
        targetLocation
      );
      if (hint) hints.push(hint);
    });

    return hints;
  }

  /**
   * Generate type-specific hints for map navigation
   */
  private static generateTypeSpecificHint(
    type: RevealedClue['type'],
    clues: RevealedClue[],
    targetLocation: Location
  ): ClueHint | null {
    const clueIds = clues.map(c => c.id);
    
    switch (type) {
      case 'geography':
        return {
          type,
          hint: `Look for locations in ${targetLocation.region} with geographical features mentioned in the clues.`,
          specificity: clues.length > 2 ? 'specific' : 'general',
          relatedClueIds: clueIds
        };

      case 'culture':
        return {
          type,
          hint: `Consider regions where the cultural practices and languages from the clues would be common.`,
          specificity: clues.length > 2 ? 'specific' : 'general',
          relatedClueIds: clueIds
        };

      case 'historical':
        return {
          type,
          hint: `Think about locations with the historical background and events mentioned in the clues.`,
          specificity: clues.length > 1 ? 'specific' : 'general',
          relatedClueIds: clueIds
        };

      case 'economic':
        return {
          type,
          hint: `Focus on regions known for the economic activities and industries mentioned in the clues.`,
          specificity: clues.length > 1 ? 'specific' : 'general',
          relatedClueIds: clueIds
        };

      case 'visual':
        return {
          type,
          hint: `Look for locations that match the visual elements and landmarks shown in the images.`,
          specificity: 'precise',
          relatedClueIds: clueIds
        };

      default:
        return null;
    }
  }

  /**
   * Analyze how relevant a specific clue is to the selected location
   */
  private static analyzeClueRelevance(
    clue: RevealedClue,
    selectedLocation: Location,
    targetLocation: Location
  ): ClueRelevanceScore {
    const isCorrectLocation = selectedLocation.id === targetLocation.id;
    let relevanceScore = 0;
    let reasoning = '';

    // Base relevance on whether this is the correct location
    if (isCorrectLocation) {
      relevanceScore = 0.9; // High relevance for correct location
      reasoning = `This ${clue.type} clue directly supports the correct location: ${selectedLocation.name}.`;
    } else {
      // Analyze partial matches for educational feedback
      const partialMatches = this.findPartialMatches(clue, selectedLocation, targetLocation);
      relevanceScore = partialMatches.score;
      reasoning = partialMatches.reasoning;
    }

    return {
      clueId: clue.id,
      clueType: clue.type,
      relevanceScore,
      reasoning
    };
  }

  /**
   * Find partial matches between clue and incorrect location for educational value
   */
  private static findPartialMatches(
    clue: RevealedClue,
    selectedLocation: Location,
    targetLocation: Location
  ): { score: number; reasoning: string } {
    let score = 0;
    const reasons: string[] = [];

    // Regional similarity
    if (selectedLocation.region === targetLocation.region) {
      score += 0.3;
      reasons.push(`correct region (${selectedLocation.region})`);
    }

    // Country similarity for cultural/historical clues
    if (clue.type === 'culture' || clue.type === 'historical') {
      if (selectedLocation.country === targetLocation.country) {
        score += 0.4;
        reasons.push(`correct country for ${clue.type} context`);
      }
    }

    // Geographic proximity for geography clues
    if (clue.type === 'geography') {
      const distance = this.calculateDistance(
        selectedLocation.latitude, selectedLocation.longitude,
        targetLocation.latitude, targetLocation.longitude
      );
      
      if (distance < 1000) { // Within 1000km
        const proximityScore = Math.max(0, (1000 - distance) / 1000) * 0.5;
        score += proximityScore;
        reasons.push(`relatively close geographically (${Math.round(distance)}km away)`);
      }
    }

    const reasoning = reasons.length > 0 
      ? `This location has some relevance: ${reasons.join(', ')}.`
      : `This location doesn't match the ${clue.type} clues well. Consider the specific details mentioned.`;

    return { score: Math.min(score, 0.7), reasoning }; // Cap at 0.7 for incorrect locations
  }

  /**
   * Calculate distance between two points using Haversine formula
   */
  private static calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  /**
   * Generate educational feedback based on location analysis
   */
  private static generateEducationalFeedback(
    selectedLocation: Location,
    targetLocation: Location,
    clueRelevance: ClueRelevanceScore[],
    overallMatch: number
  ): string[] {
    const feedback: string[] = [];

    if (selectedLocation.id === targetLocation.id) {
      feedback.push(`🎉 Excellent! You correctly identified ${targetLocation.name}, ${targetLocation.country}.`);
      
      const strongClues = clueRelevance.filter(cr => cr.relevanceScore > 0.8);
      if (strongClues.length > 0) {
        feedback.push(`The ${strongClues.map(sc => sc.clueType).join(' and ')} clues were particularly helpful in identifying this location.`);
      }
    } else {
      feedback.push(`The correct location is ${targetLocation.name}, ${targetLocation.country}, not ${selectedLocation.name}.`);
      
      if (overallMatch > 0.5) {
        feedback.push(`Your guess shows good geographic reasoning - there are some similarities with the target location.`);
      } else if (overallMatch > 0.2) {
        feedback.push(`This location has some connection to the clues, but review the specific geographic and cultural details.`);
      } else {
        feedback.push(`Consider re-reading the clues more carefully, paying attention to specific geographic and cultural indicators.`);
      }

      // Provide specific feedback from clue analysis
      const goodMatches = clueRelevance.filter(cr => cr.relevanceScore > 0.3);
      goodMatches.forEach(match => {
        if (match.reasoning) {
          feedback.push(match.reasoning);
        }
      });
    }

    return feedback;
  }

  /**
   * Get map interaction suggestions based on revealed clues
   */
  static async getMapInteractionSuggestions(
    sessionId: string,
    roundNumber: number
  ): Promise<{
    suggestedRegions: string[];
    zoomLevel: number;
    focusCoordinates?: [number, number];
    interactionTips: string[];
  }> {
    const context = await this.getClueLocationContext(sessionId, roundNumber);
    const target = context.targetLocation;

    // Determine zoom level based on number of clues revealed
    let zoomLevel = 2; // Start with world view
    if (context.revealedClues.length >= 2) zoomLevel = 4; // Regional view
    if (context.revealedClues.length >= 3) zoomLevel = 6; // Country/area view

    // Generate region suggestions without giving away the answer
    const suggestedRegions = [target.region];
    
    // Add neighboring regions for broader search
    const regionMap: Record<string, string[]> = {
      'Western Europe': ['Northern Europe', 'Southern Europe', 'Central Europe'],
      'Eastern Europe': ['Central Europe', 'Northern Europe'],
      'Asia': ['Middle East', 'Central Asia', 'Southeast Asia'],
      'North America': ['Central America'],
      'South America': ['Central America'],
      'Africa': ['Middle East', 'North Africa'],
      // Add more regional relationships as needed
    };

    if (regionMap[target.region]) {
      suggestedRegions.push(...regionMap[target.region]);
    }

    // Generate interaction tips
    const interactionTips = [
      'Click on the map to select a location',
      'Consider all revealed clues when making your selection',
      'Look for locations that match multiple clue types',
      'Use the zoom controls to explore regions more closely'
    ];

    if (context.revealedClues.length >= 2) {
      interactionTips.push('You have multiple clues now - look for locations where they all make sense together');
    }

    return {
      suggestedRegions: [...new Set(suggestedRegions)], // Remove duplicates
      zoomLevel,
      focusCoordinates: context.revealedClues.length >= 2 ? [target.latitude, target.longitude] : undefined,
      interactionTips
    };
  }
}