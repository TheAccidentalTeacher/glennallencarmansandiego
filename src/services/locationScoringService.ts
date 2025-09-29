import { query } from './database';

interface LocationCoordinates {
  latitude: number;
  longitude: number;
  name: string;
  country: string;
}

interface DistanceScoring {
  distance: number; // in kilometers
  scoreMultiplier: number;
  feedback: string;
  category: 'perfect' | 'excellent' | 'good' | 'fair' | 'poor';
}

/**
 * Enhanced Location Scoring Service
 * 
 * Extends the existing game scoring system with geographic distance-based scoring
 * for the new interactive map interface. Provides more nuanced feedback based on
 * how close students get to the correct location on the world map.
 */
export class LocationScoringService {
  
  /**
   * Calculate the distance between two points on Earth using the Haversine formula
   */
  private static calculateDistance(
    lat1: number, lon1: number, 
    lat2: number, lon2: number
  ): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    
    return distance;
  }
  
  private static toRadians(degrees: number): number {
    return degrees * (Math.PI/180);
  }
  
  /**
   * Get distance-based scoring for a location guess
   */
  static calculateDistanceScoring(distance: number): DistanceScoring {
    if (distance === 0) {
      return {
        distance,
        scoreMultiplier: 1.0,
        feedback: "🎯 Perfect! You found the exact location!",
        category: 'perfect'
      };
    } else if (distance <= 100) {
      return {
        distance,
        scoreMultiplier: 0.9,
        feedback: `🎉 Excellent detective work! Only ${Math.round(distance)} km away!`,
        category: 'excellent'
      };
    } else if (distance <= 500) {
      return {
        distance,
        scoreMultiplier: 0.75,
        feedback: `👍 Good work! You were ${Math.round(distance)} km from the target.`,
        category: 'good'
      };
    } else if (distance <= 1500) {
      return {
        distance,
        scoreMultiplier: 0.5,
        feedback: `🔍 Getting warmer! ${Math.round(distance)} km away - keep investigating!`,
        category: 'fair'
      };
    } else {
      return {
        distance,
        scoreMultiplier: 0.25,
        feedback: `🌍 Keep exploring! The criminal is ${Math.round(distance)} km from your guess.`,
        category: 'poor'
      };
    }
  }
  
  /**
   * Get location coordinates from database
   */
  private static async getLocationCoordinates(locationId: string): Promise<LocationCoordinates | null> {
    const result = await query(
      'SELECT latitude, longitude, name, country FROM locations WHERE id = $1',
      [locationId]
    );
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const row = result.rows[0];
    return {
      latitude: row.latitude,
      longitude: row.longitude,
      name: row.name,
      country: row.country
    };
  }
  
  /**
   * Enhanced warrant validation with distance-based scoring
   */
  static async validateLocationWithDistance(
    guessedLocationId: string,
    correctLocationId: string,
    baseScore: number = 1000
  ): Promise<{
    isExact: boolean;
    distance: number;
    adjustedScore: number;
    distanceScoring: DistanceScoring;
    guessedLocation: LocationCoordinates | null;
    correctLocation: LocationCoordinates | null;
    feedback: string[];
  }> {
    
    // Handle exact match immediately
    if (guessedLocationId === correctLocationId) {
      const location = await this.getLocationCoordinates(correctLocationId);
      const perfectScoring = this.calculateDistanceScoring(0);
      
      return {
        isExact: true,
        distance: 0,
        adjustedScore: baseScore,
        distanceScoring: perfectScoring,
        guessedLocation: location,
        correctLocation: location,
        feedback: [perfectScoring.feedback, "You get full points for the perfect match!"]
      };
    }
    
    // Get coordinates for both locations
    const [guessedLocation, correctLocation] = await Promise.all([
      this.getLocationCoordinates(guessedLocationId),
      this.getLocationCoordinates(correctLocationId)
    ]);
    
    if (!guessedLocation || !correctLocation) {
      return {
        isExact: false,
        distance: -1,
        adjustedScore: 0,
        distanceScoring: {
          distance: -1,
          scoreMultiplier: 0,
          feedback: "Unable to calculate distance - invalid location data.",
          category: 'poor'
        },
        guessedLocation,
        correctLocation,
        feedback: ["Error: Could not validate location coordinates."]
      };
    }
    
    // Calculate distance between locations
    const distance = this.calculateDistance(
      guessedLocation.latitude, guessedLocation.longitude,
      correctLocation.latitude, correctLocation.longitude
    );
    
    // Get distance-based scoring
    const distanceScoring = this.calculateDistanceScoring(distance);
    const adjustedScore = Math.round(baseScore * distanceScoring.scoreMultiplier);
    
    // Generate educational feedback
    const feedback: string[] = [
      distanceScoring.feedback,
      `Your guess: ${guessedLocation.name}, ${guessedLocation.country}`,
      `Correct answer: ${correctLocation.name}, ${correctLocation.country}`,
    ];
    
    if (adjustedScore > 0) {
      feedback.push(`You earned ${adjustedScore} points (${Math.round(distanceScoring.scoreMultiplier * 100)}% of base score).`);
    }
    
    // Add educational context
    if (guessedLocation.country === correctLocation.country) {
      feedback.push("🎓 Good regional knowledge - you were in the right country!");
    } else if (distance <= 2000) {
      feedback.push("🌍 Your geographical instincts are developing - keep studying the clues!");
    }
    
    return {
      isExact: false,
      distance,
      adjustedScore,
      distanceScoring,
      guessedLocation,
      correctLocation,
      feedback
    };
  }
  
  /**
   * Get scoring statistics for educational insights
   */
  static async getDistanceScoringStats(_sessionId: string): Promise<{
    averageDistance: number;
    perfectGuesses: number;
    excellentGuesses: number;
    totalGuesses: number;
    improvementTrend: 'improving' | 'declining' | 'stable';
  }> {
    // This would query the database for warrant submissions with distance data
    // For now, return mock data structure
    return {
      averageDistance: 0,
      perfectGuesses: 0,
      excellentGuesses: 0,
      totalGuesses: 0,
      improvementTrend: 'stable'
    };
  }
  
  /**
   * Generate map-specific educational feedback
   */
  static generateMapFeedback(
    distanceScoring: DistanceScoring,
    guessedLocation: LocationCoordinates,
    correctLocation: LocationCoordinates
  ): string[] {
    const feedback: string[] = [];
    
    // Basic distance feedback
    feedback.push(distanceScoring.feedback);
    
    // Geographic insights based on distance category
    switch (distanceScoring.category) {
      case 'perfect':
        feedback.push("🏆 Master Detective! Perfect geographical accuracy!");
        break;
        
      case 'excellent':
        feedback.push("🔍 Sharp detective skills! Your geographical reasoning is excellent!");
        break;
        
      case 'good':
        feedback.push("📍 Good detective work! You're getting better at reading geographical clues.");
        break;
        
      case 'fair':
        feedback.push("🗺️ Keep practicing your geographical analysis. Look for more location clues!");
        break;
        
      case 'poor':
        feedback.push("🌍 This is a learning opportunity! Study the clues more carefully for geographic hints.");
        break;
    }
    
    // Country-specific feedback
    if (guessedLocation.country === correctLocation.country) {
      feedback.push("✅ Great job identifying the correct country!");
    } else {
      feedback.push(`💡 Tip: The correct answer was in ${correctLocation.country}, not ${guessedLocation.country}.`);
    }
    
    return feedback;
  }
}

export type { DistanceScoring, LocationCoordinates };