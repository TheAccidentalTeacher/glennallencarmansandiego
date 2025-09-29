import { Router } from 'express';

const router = Router();

// Villain location data (matches the frontend component)
const VILLAIN_LOCATIONS = [
  {
    id: 'sourdough-pete',
    name: 'Peter "Pete" Goldpanner McKinley',
    codename: 'Sourdough Pete',
    coordinates: [64.0685, -152.2782], // [latitude, longitude]
    region: 'Alaska, North America',
    difficulty: 5,
    specialty: 'Master Thief with World Geography Expertise',
    description: 'Remote Alaskan wilderness - extreme cold, tundra, boreal forest',
    clueThemes: ['Arctic climate', 'Tundra ecosystems', 'Gold rush history', 'Wilderness survival'],
    active: true
  },
  {
    id: 'dr-meridian',
    name: 'Dr. Elena Fossat',
    codename: 'Dr. Meridian',
    coordinates: [46.5197, 6.6323], // Swiss Alps
    region: 'European Alpine Systems',
    difficulty: 3,
    specialty: 'Alpine Ecosystem Research & Environmental Engineering',
    description: 'Mountain systems - Alps, high altitude, glacial features',
    clueThemes: ['Mountain formation', 'Alpine climate', 'Glacial systems', 'European geography'],
    active: true
  },
  {
    id: 'professor-sahara',
    name: 'Dr. Amira Hassan',
    codename: 'Professor Sahara',
    coordinates: [23.8859, 8.5417], // Central Sahara
    region: 'North African Desert Systems',
    difficulty: 4,
    specialty: 'Desert Archaeology & Ancient Water Systems',
    description: 'Desert environments - extreme heat, arid conditions, ancient civilizations',
    clueThemes: ['Desert formation', 'Ancient trade routes', 'Water scarcity', 'Archaeological sites'],
    active: true
  },
  {
    id: 'dr-tectonic',
    name: 'Dr. Li Wei',
    codename: 'Dr. Tectonic',
    coordinates: [35.8617, 104.1954], // Central China
    region: 'East Asian Tectonic Systems',
    difficulty: 4,
    specialty: 'Seismology & Geological Survey Engineering',
    description: 'Seismically active regions - earthquakes, mountains, Ring of Fire',
    clueThemes: ['Plate tectonics', 'Earthquake formation', 'Volcanic activity', 'Mountain building'],
    active: true
  },
  {
    id: 'dr-altiplano',
    name: 'Dr. Isabella Santos',
    codename: 'Dr. Altiplano',
    coordinates: [-16.2902, -63.5887], // Bolivian Altiplano
    region: 'Andean Mountain Systems',
    difficulty: 3,
    specialty: 'Andean Geology & High-Altitude Systems',
    description: 'High-altitude plateaus - thin air, extreme elevation, glaciers',
    clueThemes: ['Mountain formation', 'Altitude effects', 'Glacial retreat', 'Mining regions'],
    active: true
  },
  {
    id: 'dr-savanna',
    name: 'Dr. Kwame Asante',
    codename: 'Dr. Savanna',
    coordinates: [-2.0469, 34.8888], // East African Savanna
    region: 'Sub-Saharan African Ecosystems',
    difficulty: 3,
    specialty: 'Wildlife Conservation & Ecosystem Management',
    description: 'Savanna ecosystems - seasonal patterns, wildlife migration, conservation',
    clueThemes: ['African biomes', 'Wildlife migration', 'Conservation', 'Seasonal climate'],
    active: true
  },
  {
    id: 'dr-monsoon',
    name: 'Dr. Priya Sharma',
    codename: 'Dr. Monsoon',
    coordinates: [20.5937, 78.9629], // Central India
    region: 'South Asian Climate Systems',
    difficulty: 4,
    specialty: 'Atmospheric Sciences & Monsoon Research',
    description: 'Monsoon regions - seasonal rainfall, agricultural systems, flooding',
    clueThemes: ['Monsoon formation', 'Seasonal patterns', 'Agricultural adaptation', 'Climate systems'],
    active: true
  },
  {
    id: 'dr-coral',
    name: 'Dr. Maya Sari',
    codename: 'Dr. Coral',
    coordinates: [-0.7893, 113.9213], // Indonesian archipelago
    region: 'Southeast Asian Maritime Systems',
    difficulty: 3,
    specialty: 'Marine Biology & Coral Reef Research',
    description: 'Coral reef systems - tropical marine, island nations, biodiversity',
    clueThemes: ['Coral reefs', 'Island formation', 'Marine biodiversity', 'Ocean currents'],
    active: true
  },
  {
    id: 'dr-qanat',
    name: 'Dr. Reza Mehrabi',
    codename: 'Dr. Qanat',
    coordinates: [32.4279, 53.6880], // Central Iran
    region: 'Middle Eastern Arid Systems',
    difficulty: 4,
    specialty: 'Ancient Engineering & Water Management',
    description: 'Arid engineering - desert adaptation, ancient irrigation, water scarcity',
    clueThemes: ['Ancient engineering', 'Arid climates', 'Water management', 'Desert cities'],
    active: true
  },
  {
    id: 'professor-atlas',
    name: 'Prof. Viktor Kowalski',
    codename: 'Professor Atlas',
    coordinates: [52.2297, 21.0122], // Central Poland
    region: 'Eastern European Geographic Systems',
    difficulty: 3,
    specialty: 'Historical Cartography & GIS',
    description: 'European plains - river systems, historical boundaries, continental climate',
    clueThemes: ['River systems', 'Historical geography', 'Political boundaries', 'Cartography'],
    active: true
  },
  {
    id: 'dr-pacific',
    name: 'Dr. James Tauranga',
    codename: 'Dr. Pacific',
    coordinates: [-41.2865, 174.7762], // New Zealand
    region: 'Oceanian Volcanic Systems',
    difficulty: 4,
    specialty: 'Volcanology & Pacific Rim Systems',
    description: 'Pacific volcanic islands - geothermal activity, Ring of Fire, island formation',
    clueThemes: ['Volcanic activity', 'Island formation', 'Geothermal energy', 'Pacific Ring of Fire'],
    active: true
  },
  {
    id: 'dr-watershed',
    name: 'Dr. Sarah Blackfoot',
    codename: 'Dr. Watershed',
    coordinates: [45.5152, -73.6774], // Montreal, representing North American watersheds
    region: 'North American Watershed Systems',
    difficulty: 3,
    specialty: 'Environmental Geography & Traditional Knowledge',
    description: 'Continental watersheds - river systems, forests, traditional territories',
    clueThemes: ['Watershed systems', 'Continental divides', 'Forest ecosystems', 'Environmental stewardship'],
    active: true
  },
  {
    id: 'dr-canopy',
    name: 'Dr. Carlos Mendoza',
    codename: 'Dr. Canopy',
    coordinates: [9.7489, -83.7534], // Costa Rica
    region: 'Central American Rainforest Systems',
    difficulty: 4,
    specialty: 'Tropical Ecology & Biodiversity Research',
    description: 'Tropical rainforests - biodiversity hotspots, cloud forests, conservation',
    clueThemes: ['Tropical ecology', 'Biodiversity', 'Rainforest structure', 'Conservation corridors'],
    active: true
  }
];

/**
 * GET /api/locations
 * Get all available game locations
 */
router.get('/', (req, res) => {
  try {
    const activeLocations = VILLAIN_LOCATIONS.filter(location => location.active);
    
    res.json({
      success: true,
      locations: activeLocations,
      count: activeLocations.length,
      totalCount: VILLAIN_LOCATIONS.length
    });
  } catch (error) {
    console.error('Error fetching locations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch locations'
    });
  }
});

/**
 * GET /api/locations/:locationId
 * Get details for a specific location
 */
router.get('/:locationId', (req, res) => {
  try {
    const { locationId } = req.params;
    const location = VILLAIN_LOCATIONS.find(loc => loc.id === locationId);
    
    if (!location) {
      return res.status(404).json({
        success: false,
        error: `Location not found: ${locationId}`
      });
    }
    
    res.json({
      success: true,
      location
    });
  } catch (error) {
    console.error(`Error fetching location ${req.params.locationId}:`, error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch location details'
    });
  }
});

/**
 * GET /api/locations/difficulty/:level
 * Get locations by difficulty level
 */
router.get('/difficulty/:level', (req, res) => {
  try {
    const difficultyLevel = parseInt(req.params.level, 10);
    
    if (!Number.isInteger(difficultyLevel) || difficultyLevel < 1 || difficultyLevel > 5) {
      return res.status(400).json({
        success: false,
        error: 'Difficulty level must be between 1 and 5'
      });
    }
    
    const filteredLocations = VILLAIN_LOCATIONS.filter(
      location => location.difficulty === difficultyLevel && location.active
    );
    
    res.json({
      success: true,
      locations: filteredLocations,
      count: filteredLocations.length,
      difficulty: difficultyLevel
    });
  } catch (error) {
    console.error(`Error fetching locations by difficulty ${req.params.level}:`, error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch locations by difficulty'
    });
  }
});

/**
 * GET /api/locations/region/:regionType
 * Get locations by region type (simplified search)
 */
router.get('/region/:regionType', (req, res) => {
  try {
    const { regionType } = req.params;
    const searchTerm = regionType.toLowerCase();
    
    const filteredLocations = VILLAIN_LOCATIONS.filter(location => 
      location.active && 
      (location.region.toLowerCase().includes(searchTerm) ||
       location.description.toLowerCase().includes(searchTerm) ||
       location.clueThemes.some(theme => theme.toLowerCase().includes(searchTerm)))
    );
    
    res.json({
      success: true,
      locations: filteredLocations,
      count: filteredLocations.length,
      searchTerm: regionType
    });
  } catch (error) {
    console.error(`Error fetching locations by region ${req.params.regionType}:`, error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch locations by region'
    });
  }
});

export default router;