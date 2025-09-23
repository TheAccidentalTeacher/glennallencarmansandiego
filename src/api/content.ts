import { api } from './client';
import type { ApiResponse } from './client';

// Content Types
export interface Case {
  id: string;
  title: string;
  description: string;
  difficultyLevel: number;
  villainId: string;
  villainName?: string;
  targetLocationId: string;
  locationName?: string;
  locationCountry?: string;
  estimatedDurationMinutes?: number;
  createdBy: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Clue {
  id: string;
  caseId: string;
  type: string;
  content: string;
  revealOrder: number;
  difficultyLevel: number;
  pointsValue: number;
  culturalContext?: string;
  isActive: boolean;
}

export interface Location {
  id: string;
  name: string;
  country: string;
  region: string;
  latitude: number;
  longitude: number;
  description: string;
  culturalInfo: string;
  historicalSignificance: string;
  isActive: boolean;
}

export interface Villain {
  id: string;
  name: string;
  description: string;
  backstory: string;
  difficulty: number;
  signature: string;
  isActive: boolean;
}

export interface CreateCaseRequest {
  title: string;
  description: string;
  difficultyLevel: number;
  villainId: string;
  targetLocationId: string;
  estimatedDurationMinutes?: number;
}

export interface UpdateCaseRequest {
  title?: string;
  description?: string;
  difficultyLevel?: number;
  villainId?: string;
  targetLocationId?: string;
  estimatedDurationMinutes?: number;
}

export interface CaseListParams {
  limit?: number;
  offset?: number;
}

// Content Service
export class ContentService {
  // Cases
  static async getCases(params?: CaseListParams): Promise<ApiResponse<{ cases: Case[] }>> {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());
    
    const query = queryParams.toString();
    const url = query ? `/content/cases?${query}` : '/content/cases';
    
    return api.get<{ cases: Case[] }>(url);
  }

  static async getMyCases(params?: CaseListParams): Promise<ApiResponse<{ cases: Case[] }>> {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());
    
    const query = queryParams.toString();
    const url = query ? `/content/my-cases?${query}` : '/content/my-cases';
    
    return api.get<{ cases: Case[] }>(url);
  }

  static async getCaseClues(caseId: string): Promise<ApiResponse<{ clues: Clue[] }>> {
    return api.get<{ clues: Clue[] }>(`/content/cases/${caseId}/clues`);
  }

  static async createCase(data: CreateCaseRequest): Promise<ApiResponse<{ case: Case }>> {
    return api.post<{ case: Case }>('/content/cases', data);
  }

  static async updateCase(caseId: string, data: UpdateCaseRequest): Promise<ApiResponse<{ case: Case }>> {
    return api.put<{ case: Case }>(`/content/cases/${caseId}`, data);
  }

  static async deleteCase(caseId: string): Promise<ApiResponse> {
    return api.delete(`/content/cases/${caseId}`);
  }

  // Locations (if we add these endpoints later)
  static async getLocations(): Promise<ApiResponse<{ locations: Location[] }>> {
    return api.get<{ locations: Location[] }>('/content/locations');
  }

  static async getLocation(locationId: string): Promise<ApiResponse<{ location: Location }>> {
    return api.get<{ location: Location }>(`/content/locations/${locationId}`);
  }

  // Villains (if we add these endpoints later)
  static async getVillains(): Promise<ApiResponse<{ villains: Villain[] }>> {
    return api.get<{ villains: Villain[] }>('/content/villains');
  }

  static async getVillain(villainId: string): Promise<ApiResponse<{ villain: Villain }>> {
    return api.get<{ villain: Villain }>(`/content/villains/${villainId}`);
  }
}

export default ContentService;