import { query } from './database';
import type { Case } from '../types';

export class CaseService {
  static async createCase(caseData: {
    title: string;
    description: string;
    villainId: string;
    targetLocationId: string;
    difficultyLevel: number;
    estimatedDurationMinutes?: number;
    createdBy: string;
  }): Promise<Case> {
    const result = await query(
      `INSERT INTO cases (title, description, villain_id, target_location_id, difficulty_level, estimated_duration_minutes, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        caseData.title,
        caseData.description,
        caseData.villainId,
        caseData.targetLocationId,
        caseData.difficultyLevel,
        caseData.estimatedDurationMinutes || 45,
        caseData.createdBy
      ]
    );
    
    return this.mapCaseFromDb(result.rows[0]);
  }

  static async findById(id: string): Promise<Case | null> {
    const result = await query(
      `SELECT c.*, v.name as villain_name, l.name as location_name, l.country as location_country
       FROM cases c
       JOIN villains v ON c.villain_id = v.id
       JOIN locations l ON c.target_location_id = l.id
       WHERE c.id = $1 AND c.is_active = true`,
      [id]
    );
    
    if (!result.rows[0]) return null;
    return this.mapCaseFromDb(result.rows[0]);
  }

  static async listCases(createdBy?: string, limit = 50, offset = 0): Promise<Case[]> {
    const whereClause = createdBy ? 'WHERE c.created_by = $1 AND c.is_active = true' : 'WHERE c.is_active = true';
    const params = createdBy ? [createdBy, limit, offset] : [limit, offset];
    const limitOffset = createdBy ? 'LIMIT $2 OFFSET $3' : 'LIMIT $1 OFFSET $2';
    
    const result = await query(
      `SELECT c.*, v.name as villain_name, l.name as location_name, l.country as location_country
       FROM cases c
       JOIN villains v ON c.villain_id = v.id
       JOIN locations l ON c.target_location_id = l.id
       ${whereClause}
       ORDER BY c.created_at DESC
       ${limitOffset}`,
      params
    );
    
    return result.rows.map((row: any) => this.mapCaseFromDb(row));
  }

  static async getCaseClues(caseId: string): Promise<any[]> {
    const result = await query(
      `SELECT * FROM clues 
       WHERE case_id = $1 
       ORDER BY reveal_order ASC`,
      [caseId]
    );
    
    return result.rows.map((row: any) => ({
      id: row.id,
      caseId: row.case_id,
      type: row.type,
      content: row.content,
      revealOrder: row.reveal_order,
      difficultyLevel: row.difficulty_level,
      pointsValue: row.points_value,
      mediaUrl: row.media_url,
      mediaType: row.media_type,
      createdAt: row.created_at,
    }));
  }

  static async updateCase(id: string, updates: Partial<{
    title: string;
    description: string;
    villainId: string;
    targetLocationId: string;
    difficultyLevel: number;
    estimatedDurationMinutes: number;
    isActive: boolean;
  }>): Promise<Case | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined) {
        const dbKey = key === 'villainId' ? 'villain_id' : 
                     key === 'targetLocationId' ? 'target_location_id' :
                     key === 'difficultyLevel' ? 'difficulty_level' :
                     key === 'estimatedDurationMinutes' ? 'estimated_duration_minutes' :
                     key === 'isActive' ? 'is_active' : 
                     key.replace(/([A-Z])/g, '_$1').toLowerCase();
        
        fields.push(`${dbKey} = $${paramCount++}`);
        values.push(value);
      }
    });

    if (fields.length === 0) {
      return this.findById(id);
    }

    values.push(id);
    
    const result = await query(
      `UPDATE cases SET ${fields.join(', ')}, updated_at = NOW()
       WHERE id = $${paramCount}
       RETURNING *`,
      values
    );
    
    return result.rows[0] ? this.mapCaseFromDb(result.rows[0]) : null;
  }

  static async deleteCase(id: string): Promise<boolean> {
    const result = await query(
      'UPDATE cases SET is_active = false, updated_at = NOW() WHERE id = $1',
      [id]
    );
    return result.rowCount > 0;
  }

  private static mapCaseFromDb(row: any): Case {
    return {
      id: row.id,
      title: row.title,
      scenario: row.description,
      stolenItem: row.stolen_item || 'Unknown Item',
      educationalObjectives: [],
      primaryGeographicAnswer: row.location_name || 'Unknown Location',
      alternateAcceptableAnswers: [],
      villainId: row.villain_id,
      rounds: [],
      timingProfile: 'full',
      warrantRequirements: {
        requireLocation: true,
        requireVillain: true,
        requireEvidenceJustifications: 3
      },
      scoringProfileId: 'default',
      status: 'published',
      culturalReviewStatus: 'approved',
      metadata: {
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        createdBy: row.created_by
      }
    };
  }
}

export class VillainService {
  static async createVillain(villainData: {
    name: string;
    description: string;
    backstory?: string;
    imageUrl?: string;
    difficultyLevel: number;
    createdBy: string;
  }): Promise<any> {
    const result = await query(
      `INSERT INTO villains (name, description, backstory, image_url, difficulty_level, created_by)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        villainData.name,
        villainData.description,
        villainData.backstory,
        villainData.imageUrl,
        villainData.difficultyLevel,
        villainData.createdBy
      ]
    );
    
    return result.rows[0];
  }

  static async findById(id: string): Promise<any | null> {
    const result = await query(
      'SELECT * FROM villains WHERE id = $1 AND is_active = true',
      [id]
    );
    
    return result.rows[0] || null;
  }

  static async listVillains(createdBy?: string, limit = 50, offset = 0): Promise<any[]> {
    const whereClause = createdBy ? 'WHERE created_by = $1 AND is_active = true' : 'WHERE is_active = true';
    const params = createdBy ? [createdBy, limit, offset] : [limit, offset];
    const limitOffset = createdBy ? 'LIMIT $2 OFFSET $3' : 'LIMIT $1 OFFSET $2';
    
    const result = await query(
      `SELECT * FROM villains 
       ${whereClause}
       ORDER BY created_at DESC
       ${limitOffset}`,
      params
    );
    
    return result.rows;
  }
}

export class LocationService {
  static async createLocation(locationData: {
    name: string;
    country: string;
    region?: string;
    latitude: number;
    longitude: number;
    population?: number;
    areaKm2?: number;
    climate?: string;
    notableFeatures?: string[];
    culturalInfo?: string;
    economicInfo?: string;
    historicalInfo?: string;
    imageUrl?: string;
    flagUrl?: string;
  }): Promise<any> {
    const result = await query(
      `INSERT INTO locations (name, country, region, latitude, longitude, population, area_km2, climate, notable_features, cultural_info, economic_info, historical_info, image_url, flag_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
       RETURNING *`,
      [
        locationData.name,
        locationData.country,
        locationData.region,
        locationData.latitude,
        locationData.longitude,
        locationData.population,
        locationData.areaKm2,
        locationData.climate,
        locationData.notableFeatures,
        locationData.culturalInfo,
        locationData.economicInfo,
        locationData.historicalInfo,
        locationData.imageUrl,
        locationData.flagUrl
      ]
    );
    
    return result.rows[0];
  }

  static async findById(id: string): Promise<any | null> {
    const result = await query(
      'SELECT * FROM locations WHERE id = $1 AND is_active = true',
      [id]
    );
    
    return result.rows[0] || null;
  }

  static async listLocations(limit = 100, offset = 0): Promise<any[]> {
    const result = await query(
      `SELECT * FROM locations 
       WHERE is_active = true
       ORDER BY name ASC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    
    return result.rows;
  }

  static async searchLocations(searchQuery: string, limit = 20): Promise<any[]> {
    const result = await query(
      `SELECT * FROM locations 
       WHERE is_active = true 
       AND (name ILIKE $1 OR country ILIKE $1 OR region ILIKE $1)
       ORDER BY name ASC
       LIMIT $2`,
      [`%${searchQuery}%`, limit]
    );
    
    return result.rows;
  }
}