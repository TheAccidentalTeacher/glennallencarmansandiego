export interface VillainLocation {
  id: string;
  name: string;
  codename: string;
  coordinates: [number, number]; // [latitude, longitude]
  region: string;
  difficulty: number;
  specialty: string;
  description: string;
  clueThemes: string[];
  active?: boolean;
}

export interface LocationsResponse {
  success: boolean;
  locations: VillainLocation[];
  count: number;
  totalCount?: number;
}

export interface LocationResponse {
  success: boolean;
  location: VillainLocation;
}

export interface LocationsByDifficultyResponse {
  success: boolean;
  locations: VillainLocation[];
  count: number;
  difficulty: number;
}

export interface LocationsByRegionResponse {
  success: boolean;
  locations: VillainLocation[];
  count: number;
  searchTerm: string;
}

export class LocationService {
  private static readonly BASE_URL = '/api/locations';

  /**
   * Get all active locations
   */
  static async getAllLocations(): Promise<LocationsResponse> {
    try {
      const response = await fetch(this.BASE_URL);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching all locations:', error);
      throw new Error('Failed to fetch locations');
    }
  }

  /**
   * Get location by ID
   */
  static async getLocationById(locationId: string): Promise<LocationResponse> {
    try {
      const response = await fetch(`${this.BASE_URL}/${locationId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error fetching location ${locationId}:`, error);
      throw new Error('Failed to fetch location details');
    }
  }

  /**
   * Get locations by difficulty level (1-5)
   */
  static async getLocationsByDifficulty(difficulty: number): Promise<LocationsByDifficultyResponse> {
    try {
      if (!Number.isInteger(difficulty) || difficulty < 1 || difficulty > 5) {
        throw new Error('Difficulty must be between 1 and 5');
      }

      const response = await fetch(`${this.BASE_URL}/difficulty/${difficulty}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error fetching locations by difficulty ${difficulty}:`, error);
      throw new Error('Failed to fetch locations by difficulty');
    }
  }

  /**
   * Search locations by region type
   */
  static async getLocationsByRegion(regionType: string): Promise<LocationsByRegionResponse> {
    try {
      if (!regionType.trim()) {
        throw new Error('Region type cannot be empty');
      }

      const response = await fetch(`${this.BASE_URL}/region/${encodeURIComponent(regionType)}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error fetching locations by region ${regionType}:`, error);
      throw new Error('Failed to fetch locations by region');
    }
  }

  /**
   * Get locations for specific game difficulty levels
   */
  static async getLocationsForGame(difficultyLevels: number[]): Promise<VillainLocation[]> {
    try {
      const locationPromises = difficultyLevels.map(level => 
        this.getLocationsByDifficulty(level)
      );
      
      const responses = await Promise.all(locationPromises);
      
      const locations = responses.flatMap(response => response.locations);
      
      // Remove duplicates if any
      const uniqueLocations = locations.filter((location, index, array) => 
        array.findIndex(l => l.id === location.id) === index
      );
      
      return uniqueLocations;
    } catch (error) {
      console.error('Error fetching game locations:', error);
      throw new Error('Failed to fetch game locations');
    }
  }

  /**
   * Validate coordinates
   */
  static validateCoordinates(coordinates: [number, number]): boolean {
    const [latitude, longitude] = coordinates;
    return latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180;
  }

  /**
   * Calculate distance between two coordinates (approximate, in km)
   */
  static calculateDistance(
    coord1: [number, number], 
    coord2: [number, number]
  ): number {
    const [lat1, lon1] = coord1;
    const [lat2, lon2] = coord2;
    
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  /**
   * Get nearby locations within specified radius (km)
   */
  static async getNearbyLocations(
    centerCoordinates: [number, number], 
    radiusKm: number = 1000
  ): Promise<VillainLocation[]> {
    try {
      const allLocationsResponse = await this.getAllLocations();
      
      const nearbyLocations = allLocationsResponse.locations.filter(location => {
        const distance = this.calculateDistance(centerCoordinates, location.coordinates);
        return distance <= radiusKm;
      });
      
      // Sort by distance
      nearbyLocations.sort((a, b) => {
        const distanceA = this.calculateDistance(centerCoordinates, a.coordinates);
        const distanceB = this.calculateDistance(centerCoordinates, b.coordinates);
        return distanceA - distanceB;
      });
      
      return nearbyLocations;
    } catch (error) {
      console.error('Error finding nearby locations:', error);
      throw new Error('Failed to find nearby locations');
    }
  }
}

export default LocationService;