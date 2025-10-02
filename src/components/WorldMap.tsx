import React, { useState } from 'react';

interface WorldMapProps {
  onLocationGuess: (latitude: number, longitude: number, locationName: string) => void;
  disabled?: boolean;
}

// Major world locations for quick guessing
const WORLD_LOCATIONS = [
  // North America
  { name: "New York, USA", lat: 40.7128, lng: -74.0060, region: "North America" },
  { name: "Los Angeles, USA", lat: 34.0522, lng: -118.2437, region: "North America" },
  { name: "Mexico City, Mexico", lat: 19.4326, lng: -99.1332, region: "North America" },
  { name: "Toronto, Canada", lat: 43.6532, lng: -79.3832, region: "North America" },
  
  // South America
  { name: "Rio de Janeiro, Brazil", lat: -22.9068, lng: -43.1729, region: "South America" },
  { name: "Buenos Aires, Argentina", lat: -34.6037, lng: -58.3816, region: "South America" },
  { name: "Lima, Peru", lat: -12.0464, lng: -77.0428, region: "South America" },
  { name: "Bogotá, Colombia", lat: 4.7110, lng: -74.0721, region: "South America" },
  
  // Europe
  { name: "London, UK", lat: 51.5074, lng: -0.1278, region: "Europe" },
  { name: "Paris, France", lat: 48.8566, lng: 2.3522, region: "Europe" },
  { name: "Berlin, Germany", lat: 52.5200, lng: 13.4050, region: "Europe" },
  { name: "Rome, Italy", lat: 41.9028, lng: 12.4964, region: "Europe" },
  
  // Africa
  { name: "Cairo, Egypt", lat: 30.0444, lng: 31.2357, region: "Africa" },
  { name: "Lagos, Nigeria", lat: 6.5244, lng: 3.3792, region: "Africa" },
  { name: "Johannesburg, South Africa", lat: -26.2041, lng: 28.0473, region: "Africa" },
  { name: "Nairobi, Kenya", lat: -1.2921, lng: 36.8219, region: "Africa" },
  
  // Asia
  { name: "Beijing, China", lat: 39.9042, lng: 116.4074, region: "Asia" },
  { name: "Tokyo, Japan", lat: 35.6762, lng: 139.6503, region: "Asia" },
  { name: "Mumbai, India", lat: 19.0760, lng: 72.8777, region: "Asia" },
  { name: "Bangkok, Thailand", lat: 13.7563, lng: 100.5018, region: "Asia" },
  
  // Oceania
  { name: "Sydney, Australia", lat: -33.8688, lng: 151.2093, region: "Oceania" },
  { name: "Melbourne, Australia", lat: -37.8136, lng: 144.9631, region: "Oceania" }
];

const WorldMap: React.FC<WorldMapProps> = ({ onLocationGuess, disabled = false }) => {
  const [selectedLocation, setSelectedLocation] = useState<typeof WORLD_LOCATIONS[0] | null>(null);

  const handleLocationClick = (location: typeof WORLD_LOCATIONS[0]) => {
    if (disabled) return;
    
    setSelectedLocation(location);
    onLocationGuess(location.lat, location.lng, location.name);
  };

  return (
    <div className="w-full bg-gradient-to-br from-blue-900 to-green-800 rounded-xl p-6 border-2 border-blue-400">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-white mb-2">🌍 Interactive World Map</h3>
        <p className="text-blue-200">Click on a location to make your guess!</p>
        {selectedLocation && (
          <p className="text-yellow-300 font-semibold mt-2 text-lg">
            ✅ Selected: {selectedLocation.name}
          </p>
        )}
      </div>

      {/* Simple Location Grid - With Inline Styles for Visibility */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
        {WORLD_LOCATIONS.map(location => (
          <button
            key={location.name}
            onClick={() => handleLocationClick(location)}
            disabled={disabled}
            style={{
              padding: '16px',
              borderRadius: '8px',
              fontWeight: 'bold',
              fontSize: '16px',
              minHeight: '80px',
              border: '2px solid',
              backgroundColor: selectedLocation?.name === location.name ? '#EAB308' : '#1F2937',
              borderColor: selectedLocation?.name === location.name ? '#D97706' : '#4B5563',
              color: selectedLocation?.name === location.name ? '#000000' : '#FFFFFF',
              cursor: disabled ? 'not-allowed' : 'pointer',
              opacity: disabled ? 0.5 : 1,
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              if (!disabled && selectedLocation?.name !== location.name) {
                e.currentTarget.style.backgroundColor = '#374151';
                e.currentTarget.style.borderColor = '#6B7280';
              }
            }}
            onMouseLeave={(e) => {
              if (!disabled && selectedLocation?.name !== location.name) {
                e.currentTarget.style.backgroundColor = '#1F2937';
                e.currentTarget.style.borderColor = '#4B5563';
              }
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: 'bold', fontSize: '16px' }}>
                {location.name.split(",")[0]}
              </div>
              <div style={{ fontSize: '14px', opacity: 0.8, marginTop: '2px' }}>
                {location.name.split(",")[1]}
              </div>
              <div style={{ fontSize: '12px', opacity: 0.6, marginTop: '4px' }}>
                {location.region}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Instructions */}
      <div className="mt-6 text-center">
        <p className="text-lg text-blue-200 font-semibold">
          💡 Tip: The closer your guess, the more points you'll earn!
        </p>
        {selectedLocation && (
          <p className="text-green-300 mt-2">
            Ready to submit guess for: <span className="font-bold">{selectedLocation.name}</span>
          </p>
        )}
      </div>
    </div>
  );
};

export default WorldMap;