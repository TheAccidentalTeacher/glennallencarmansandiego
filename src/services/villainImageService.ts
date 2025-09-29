import path from 'path';

export interface VillainImages {
  villainId: string;
  villainName: string;
  primaryImage: string;
  roundImages: {
    round1: string;  // Geographic/Environmental context
    round2: string;  // Cultural/Community context
    round3: string;  // Economic/Political context
    round4: string;  // Specific location/Landmark context
  };
  allImages: string[];
}

export interface ImageMetadata {
  filename: string;
  path: string;
  context: 'portrait' | 'round1' | 'round2' | 'round3' | 'round4' | 'gallery';
  description: string;
}

export class VillainImageService {
  private static readonly BASE_IMAGE_PATH = 'content/villains/images';
  
  /**
   * Villain image directory mapping
   */
  private static readonly VILLAIN_DIRECTORIES = {
    'sourdough-pete': '00-sourdough-pete-alaska',
    'dr-meridian': '01-dr-meridian-elena-fossat',
    'professor-sahara': '02-professor-sahara-amira-hassan',
    'dr-mirage': '03-professor-tectonic-seismic-specialist',
    'professor-tectonic': '04-dr-altiplano-isabella-santos',
    'dr-sahel': '05-dr-sahel-kwame-asante',
    'dr-monsoon': '06-dr-monsoon-kiran-patel',
    'dr-coral': '07-dr-coral-maya-sari',
    'dr-qanat': '08-dr-qanat-master-of-disguise',
    'professor-atlas': '09-professor-atlas-viktor-kowalski',
    'dr-pacific': '10-dr-pacific-james-tauranga',
    'dr-watershed': '11-dr-watershed-sarah-blackfoot',
    'dr-canopy': '12-dr-canopy-carlos-mendoza'
  };

  /**
   * Get all images for a specific villain
   */
  static async getVillainImages(villainId: string): Promise<VillainImages | null> {
    const directory = this.VILLAIN_DIRECTORIES[villainId as keyof typeof this.VILLAIN_DIRECTORIES];
    if (!directory) {
      console.error(`No directory found for villain: ${villainId}`);
      return null;
    }

    const fs = await import('fs');
    const imagePath = path.join(process.cwd(), this.BASE_IMAGE_PATH, directory);
    
    try {
      const files = fs.readdirSync(imagePath)
        .filter(file => file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('.jpeg'))
        .sort(); // Sort for consistent ordering

      if (files.length === 0) {
        console.warn(`No images found for villain: ${villainId}`);
        return null;
      }

      // Map files to contextual usage
      return {
        villainId,
        villainName: this.getVillainDisplayName(villainId),
        primaryImage: `/images/villains/${directory}/${files[0]}`, // First image as primary
        roundImages: {
          round1: `/images/villains/${directory}/${files[0] || files[0]}`, // Geographic context
          round2: `/images/villains/${directory}/${files[1] || files[0]}`, // Cultural context
          round3: `/images/villains/${directory}/${files[2] || files[0]}`, // Economic context
          round4: `/images/villains/${directory}/${files[3] || files[0]}`  // Landmark context
        },
        allImages: files.map(file => `/images/villains/${directory}/${file}`)
      };
    } catch (error) {
      console.error(`Error reading images for villain ${villainId}:`, error);
      return null;
    }
  }

  /**
   * Get contextual image for specific game round
   */
  static async getContextualImage(villainId: string, round: number): Promise<string | null> {
    const images = await this.getVillainImages(villainId);
    if (!images) return null;

    switch (round) {
      case 1: return images.roundImages.round1;
      case 2: return images.roundImages.round2;
      case 3: return images.roundImages.round3;
      case 4: return images.roundImages.round4;
      default: return images.primaryImage;
    }
  }

  /**
   * Get primary portrait image for villain
   */
  static async getPrimaryImage(villainId: string): Promise<string | null> {
    const images = await this.getVillainImages(villainId);
    return images?.primaryImage || null;
  }

  /**
   * Get all available villain IDs that have images
   */
  static async getAvailableVillains(): Promise<string[]> {
    const fs = await import('fs');
    const basePath = path.join(process.cwd(), this.BASE_IMAGE_PATH);
    
    const availableVillains: string[] = [];
    
    for (const [villainId, directory] of Object.entries(this.VILLAIN_DIRECTORIES)) {
      const imagePath = path.join(basePath, directory);
      try {
        const files = fs.readdirSync(imagePath)
          .filter(file => file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('.jpeg'));
        
        if (files.length > 0) {
          availableVillains.push(villainId);
        }
      } catch (error) {
        console.warn(`Could not read directory for ${villainId}:`, error);
      }
    }
    
    return availableVillains;
  }

  /**
   * Get display name for villain
   */
  private static getVillainDisplayName(villainId: string): string {
    const nameMap: Record<string, string> = {
      'sourdough-pete': 'Sourdough Pete',
      'dr-meridian': 'Dr. Meridian',
      'professor-sahara': 'Professor Sahara',
      'dr-mirage': 'Dr. Mirage',
      'professor-tectonic': 'Professor Tectonic',
      'dr-sahel': 'Dr. Sahel',
      'dr-monsoon': 'Dr. Monsoon',
      'dr-coral': 'Dr. Coral',
      'dr-qanat': 'Dr. Qanat',
      'professor-atlas': 'Professor Atlas',
      'dr-pacific': 'Dr. Pacific',
      'dr-watershed': 'Dr. Watershed',
      'dr-canopy': 'Dr. Canopy'
    };
    
    return nameMap[villainId] || villainId;
  }

  /**
   * Validate image availability for game session
   */
  static async validateGameImages(villainId: string): Promise<boolean> {
    const images = await this.getVillainImages(villainId);
    return images !== null && images.allImages.length >= 4; // Minimum 4 images for 4 rounds
  }

  /**
   * Get image metadata for educational purposes
   */
  static getImageMetadata(villainId: string, filename: string): ImageMetadata {
    const directory = this.VILLAIN_DIRECTORIES[villainId as keyof typeof this.VILLAIN_DIRECTORIES];
    return {
      filename,
      path: `/images/villains/${directory}/${filename}`,
      context: this.inferImageContext(filename),
      description: this.generateImageDescription(villainId, filename)
    };
  }

  private static inferImageContext(filename: string): ImageMetadata['context'] {
    // Simple heuristic based on filename patterns
    if (filename.includes('(1)') || filename.includes('-1')) return 'round1';
    if (filename.includes('(2)') || filename.includes('-2')) return 'round2';
    if (filename.includes('(3)') || filename.includes('-3')) return 'round3';
    if (filename.includes('(4)') || filename.includes('-4')) return 'round4';
    return 'portrait';
  }

  private static generateImageDescription(villainId: string, filename: string): string {
    const villain = this.getVillainDisplayName(villainId);
    const context = this.inferImageContext(filename);
    
    const contextDescriptions = {
      'portrait': `Character portrait of ${villain}`,
      'round1': `${villain} in geographic/environmental context`,
      'round2': `${villain} in cultural/community context`,
      'round3': `${villain} in economic/political context`,
      'round4': `${villain} at specific landmark location`,
      'gallery': `${villain} additional scene`
    };
    
    return contextDescriptions[context] || `Image of ${villain}`;
  }
}

export default VillainImageService;