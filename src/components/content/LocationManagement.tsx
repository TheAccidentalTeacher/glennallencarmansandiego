import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import type { LatLngExpression } from 'leaflet';
import { 
  Globe, 
  MapPin, 
  X,
  Users
} from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
import L from 'leaflet';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface VillainLocation {
  id: string;
  name: string;
  codename: string;
  coordinates: [number, number]; // [latitude, longitude]
  region: string;
  difficulty: number;
  specialty: string;
  description: string;
  clueThemes: string[];
}

const VILLAIN_LOCATIONS: VillainLocation[] = [
  {
    id: 'sourdough-pete',
    name: 'Peter "Pete" Goldpanner McKinley',
    codename: 'Sourdough Pete',
    coordinates: [64.0685, -152.2782], // Alaska interior
    region: 'Alaska, North America',
    difficulty: 5,
    specialty: 'Master Thief with World Geography Expertise',
    description: 'Remote Alaskan wilderness - extreme cold, tundra, boreal forest',
    clueThemes: ['Arctic climate', 'Tundra ecosystems', 'Gold rush history', 'Wilderness survival']
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
    clueThemes: ['Mountain formation', 'Alpine climate', 'Glacial systems', 'European geography']
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
    clueThemes: ['Desert formation', 'Ancient trade routes', 'Water scarcity', 'Archaeological sites']
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
    clueThemes: ['Plate tectonics', 'Earthquake formation', 'Volcanic activity', 'Mountain building']
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
    clueThemes: ['Mountain formation', 'Altitude effects', 'Glacial retreat', 'Mining regions']
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
    clueThemes: ['African biomes', 'Wildlife migration', 'Conservation', 'Seasonal climate']
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
    clueThemes: ['Monsoon formation', 'Seasonal patterns', 'Agricultural adaptation', 'Climate systems']
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
    clueThemes: ['Coral reefs', 'Island formation', 'Marine biodiversity', 'Ocean currents']
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
    clueThemes: ['Ancient engineering', 'Arid climates', 'Water management', 'Desert cities']
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
    clueThemes: ['River systems', 'Historical geography', 'Political boundaries', 'Cartography']
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
    clueThemes: ['Volcanic activity', 'Island formation', 'Geothermal energy', 'Pacific Ring of Fire']
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
    clueThemes: ['Watershed systems', 'Continental divides', 'Forest ecosystems', 'Environmental stewardship']
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
    clueThemes: ['Tropical ecology', 'Biodiversity', 'Rainforest structure', 'Conservation corridors']
  }
];

const LocationManagement: React.FC = () => {
  const [locations] = useState<VillainLocation[]>(VILLAIN_LOCATIONS);
  const [selectedLocation, setSelectedLocation] = useState<VillainLocation | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('map');

  const handleLocationClick = (location: VillainLocation) => {
    setSelectedLocation(location);
  };

  const LocationClickHandler: React.FC = () => {
    useMapEvents({
      click: () => {
        setSelectedLocation(null);
      },
    });
    return null;
  };

  const getDifficultyColor = (difficulty: number): string => {
    switch (difficulty) {
      case 3: return 'text-green-600 bg-green-100';
      case 4: return 'text-yellow-600 bg-yellow-100';
      case 5: return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getDifficultyLabel = (difficulty: number): string => {
    switch (difficulty) {
      case 3: return 'Moderate';
      case 4: return 'Challenging';
      case 5: return 'Master';
      default: return 'Unknown';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-2xl shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Globe className="text-white" size={32} />
            <div>
              <h2 className="text-2xl font-bold">Location Management</h2>
              <p className="text-purple-100">World map of villain locations • {locations.length} regions</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('map')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                viewMode === 'map' 
                  ? 'bg-white text-purple-600 font-medium' 
                  : 'bg-purple-500 text-white hover:bg-purple-400'
              }`}
            >
              <MapPin size={16} className="inline mr-2" />
              Map View
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                viewMode === 'list' 
                  ? 'bg-white text-purple-600 font-medium' 
                  : 'bg-purple-500 text-white hover:bg-purple-400'
              }`}
            >
              <Users size={16} className="inline mr-2" />
              List View
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {viewMode === 'map' ? (
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div style={{ height: '600px', width: '100%' }}>
            <MapContainer
              center={[20, 0] as LatLngExpression}
              zoom={2}
              style={{ height: '100%', width: '100%' }}
              className="rounded-2xl"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <LocationClickHandler />
              
              {locations.map((location) => (
                <Marker
                  key={location.id}
                  position={location.coordinates as LatLngExpression}
                  eventHandlers={{
                    click: () => handleLocationClick(location),
                  }}
                >
                  <Popup>
                    <div className="p-2 min-w-64">
                      <h3 className="font-bold text-lg text-purple-700">{location.codename}</h3>
                      <p className="text-sm text-gray-600 mb-2">{location.name}</p>
                      <p className="text-sm font-medium text-blue-600 mb-2">{location.region}</p>
                      <p className="text-xs text-gray-700 mb-2">{location.description}</p>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(location.difficulty)}`}>
                          {getDifficultyLabel(location.difficulty)}
                        </span>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {locations.map((location) => (
            <div
              key={location.id}
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow p-6 cursor-pointer"
              onClick={() => handleLocationClick(location)}
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-bold text-gray-800">{location.codename}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(location.difficulty)}`}>
                  {getDifficultyLabel(location.difficulty)}
                </span>
              </div>
              
              <p className="text-sm text-gray-600 mb-2">{location.name}</p>
              <p className="text-sm font-medium text-blue-600 mb-3">{location.region}</p>
              <p className="text-xs text-gray-700 mb-3">{location.description}</p>
              
              <div className="flex items-center text-xs text-gray-500">
                <MapPin size={12} className="mr-1" />
                {location.coordinates[0].toFixed(2)}, {location.coordinates[1].toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Location Detail Panel */}
      {selectedLocation && (
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">{selectedLocation.codename}</h3>
              <p className="text-gray-600 mb-1">{selectedLocation.name}</p>
              <p className="text-blue-600 font-medium">{selectedLocation.region}</p>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(selectedLocation.difficulty)}`}>
                Difficulty: {getDifficultyLabel(selectedLocation.difficulty)}
              </span>
              <button
                onClick={() => setSelectedLocation(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-3">Geographic Information</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Coordinates:</span>
                  <span className="font-mono text-sm">{selectedLocation.coordinates[0].toFixed(4)}, {selectedLocation.coordinates[1].toFixed(4)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Specialty:</span>
                  <span className="text-right text-sm">{selectedLocation.specialty}</span>
                </div>
              </div>
              <div className="mt-4">
                <h5 className="font-medium text-gray-700 mb-2">Environment Description</h5>
                <p className="text-sm text-gray-600">{selectedLocation.description}</p>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-3">Educational Themes</h4>
              <div className="flex flex-wrap gap-2">
                {selectedLocation.clueThemes.map((theme, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium"
                  >
                    {theme}
                  </span>
                ))}
              </div>
              
              <div className="mt-4">
                <h5 className="font-medium text-gray-700 mb-2">Game Integration</h5>
                <p className="text-sm text-gray-600">
                  Students will identify this location through geographic clues related to {selectedLocation.clueThemes.slice(0, 2).join(' and ')}.
                  This location represents a {getDifficultyLabel(selectedLocation.difficulty).toLowerCase()} challenge requiring understanding of {selectedLocation.region.toLowerCase()}.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationManagement;