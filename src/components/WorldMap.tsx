import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers not showing up in Leaflet with Webpack
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface WorldMapProps {
  onLocationGuess: (latitude: number, longitude: number, locationName: string) => void;
  disabled?: boolean;
  caseHints?: {
    targetLocation?: { lat: number; lng: number; name: string };
    focusRegion?: { bounds: [[number, number], [number, number]] };
    clueContext?: string;
    round?: number;
  };
}

// Predefined interesting locations that students can quickly click on
const QUICK_LOCATIONS = [
  // Mountains & High Places
  { name: "Himalayas, Nepal", lat: 28.0, lng: 84.0, region: "Mountain Ranges", icon: "🏔️" },
  { name: "Rocky Mountains, USA", lat: 39.7, lng: -105.5, region: "Mountain Ranges", icon: "🏔️" },
  { name: "Andes Mountains, Peru", lat: -13.1631, lng: -72.5450, region: "Mountain Ranges", icon: "🏔️" },
  { name: "Alps, Switzerland", lat: 46.5, lng: 8.0, region: "Mountain Ranges", icon: "🏔️" },
  { name: "Mount Aconcagua, Argentina", lat: -32.6533, lng: -70.0109, region: "Mountain Ranges", icon: "🏔️" },
  
  // Deserts & Arid Regions
  { name: "Sahara Desert, Africa", lat: 23.0, lng: 8.0, region: "Deserts", icon: "🏜️" },
  { name: "Atacama Desert, Chile", lat: -24.5, lng: -69.0, region: "Deserts", icon: "🏜️" },
  { name: "Gobi Desert, Mongolia", lat: 42.5, lng: 103.0, region: "Deserts", icon: "🏜️" },
  { name: "Arizona Desert, USA", lat: 33.4, lng: -112.0, region: "Deserts", icon: "🏜️" },
  
  // Coastal & Marine Areas
  { name: "Great Barrier Reef, Australia", lat: -18.0, lng: 147.0, region: "Coastal", icon: "🐠" },
  { name: "Caribbean Islands", lat: 18.0, lng: -75.0, region: "Coastal", icon: "🏝️" },
  { name: "Mediterranean Sea", lat: 36.0, lng: 16.0, region: "Coastal", icon: "🌊" },
  { name: "Pacific Ring of Fire", lat: 0.0, lng: -155.0, region: "Coastal", icon: "🌋" },
  
  // Arctic & Antarctic
  { name: "Alaska, USA", lat: 64.0, lng: -153.0, region: "Arctic", icon: "🧊" },
  { name: "Greenland", lat: 72.0, lng: -40.0, region: "Arctic", icon: "🧊" },
  { name: "Antarctica", lat: -82.0, lng: 0.0, region: "Antarctic", icon: "🐧" },
  
  // Major Cities & Cultural Sites
  { name: "Cairo, Egypt", lat: 30.0444, lng: 31.2357, region: "Cities", icon: "🏛️" },
  { name: "Machu Picchu, Peru", lat: -13.1631, lng: -72.5450, region: "Historical", icon: "🏛️" },
  { name: "Petra, Jordan", lat: 30.3285, lng: 35.4444, region: "Historical", icon: "🏛️" },
  { name: "Great Wall of China", lat: 40.4319, lng: 116.5704, region: "Historical", icon: "🏛️" }
];

const WorldMap: React.FC<WorldMapProps> = ({ onLocationGuess, disabled = false, caseHints }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number; name: string } | null>(null);
  const [showQuickPicks, setShowQuickPicks] = useState(true);

  // Calculate distance between two points (Haversine formula)
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Initialize the map
  useEffect(() => {
    if (!mapRef.current || leafletMapRef.current) return;

    // Create the map
    const map = L.map(mapRef.current, {
      center: [20, 0], // Start with a global view
      zoom: 2,
      zoomControl: true,
      scrollWheelZoom: true,
    });

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 18,
    }).addTo(map);

    // Create custom icons for different types of locations
    const createCustomIcon = (icon: string, color = '#ff4444') => {
      return L.divIcon({
        html: `<div style="background-color: ${color}; color: white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; font-size: 16px; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">${icon}</div>`,
        className: 'custom-marker',
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      });
    };

    // Add map click handler
    map.on('click', (e: L.LeafletMouseEvent) => {
      if (disabled) return;

      const { lat, lng } = e.latlng;
      const guessName = `Location (${lat.toFixed(2)}, ${lng.toFixed(2)})`;
      
      // Clear previous guess marker
      markersRef.current.forEach(marker => map.removeLayer(marker));
      markersRef.current = [];

      // Add new guess marker
      const guessMarker = L.marker([lat, lng], {
        icon: createCustomIcon('📍', '#4CAF50')
      }).addTo(map);
      
      guessMarker.bindPopup(`Your Guess: ${guessName}`).openPopup();
      markersRef.current.push(guessMarker);

      setSelectedLocation({ lat, lng, name: guessName });
      onLocationGuess(lat, lng, guessName);
    });

    leafletMapRef.current = map;

    // Cleanup function
    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, [disabled, onLocationGuess]);

  // Update map based on case hints
  useEffect(() => {
    if (!leafletMapRef.current || !caseHints) return;

    const map = leafletMapRef.current;

    // Clear existing markers
    markersRef.current.forEach(marker => map.removeLayer(marker));
    markersRef.current = [];

    // If there's a focus region, adjust the map view
    if (caseHints.focusRegion) {
      map.fitBounds(caseHints.focusRegion.bounds);
    }

    // If there's a target location hint, add it to the map (but don't reveal exact location)
    if (caseHints.targetLocation && caseHints.round && caseHints.round > 1) {
      // Show general area circle for later rounds
      const circle = L.circle([caseHints.targetLocation.lat, caseHints.targetLocation.lng], {
        color: '#ff6b35',
        fillColor: '#ff6b35',
        fillOpacity: 0.1,
        radius: 500000, // 500km radius
      }).addTo(map);
      
      circle.bindPopup(`🔍 Search this general area...`);
    }
  }, [caseHints]);

  const handleQuickLocationClick = (location: typeof QUICK_LOCATIONS[0]) => {
    if (disabled || !leafletMapRef.current) return;

    const map = leafletMapRef.current;
    
    // Clear previous markers
    markersRef.current.forEach(marker => map.removeLayer(marker));
    markersRef.current = [];

    // Add marker and center map
    const marker = L.marker([location.lat, location.lng], {
      icon: L.divIcon({
        html: `<div style="background-color: #4CAF50; color: white; border-radius: 50%; width: 35px; height: 35px; display: flex; align-items: center; justify-content: center; font-size: 18px; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">${location.icon}</div>`,
        className: 'custom-marker',
        iconSize: [35, 35],
        iconAnchor: [17, 17],
      })
    }).addTo(map);

    marker.bindPopup(`${location.icon} ${location.name}`).openPopup();
    markersRef.current.push(marker);

    map.setView([location.lat, location.lng], 6);
    setSelectedLocation({ lat: location.lat, lng: location.lng, name: location.name });
    onLocationGuess(location.lat, location.lng, location.name);
  };

  // Filter quick locations based on case context
  const getRelevantLocations = () => {
    if (!caseHints?.clueContext) return QUICK_LOCATIONS;
    
    const context = caseHints.clueContext.toLowerCase();
    
    if (context.includes('mountain') || context.includes('altitude') || context.includes('peak')) {
      return QUICK_LOCATIONS.filter(loc => loc.region === 'Mountain Ranges');
    }
    if (context.includes('desert') || context.includes('arid') || context.includes('sand')) {
      return QUICK_LOCATIONS.filter(loc => loc.region === 'Deserts');
    }
    if (context.includes('coast') || context.includes('ocean') || context.includes('sea') || context.includes('marine')) {
      return QUICK_LOCATIONS.filter(loc => loc.region === 'Coastal');
    }
    if (context.includes('cold') || context.includes('ice') || context.includes('arctic') || context.includes('polar')) {
      return QUICK_LOCATIONS.filter(loc => loc.region === 'Arctic' || loc.region === 'Antarctic');
    }
    
    return QUICK_LOCATIONS;
  };

  const relevantLocations = getRelevantLocations();

  return (
    <div className="w-full bg-gradient-to-br from-blue-900 to-green-800 rounded-xl p-4 border-2 border-blue-400">
      <div className="text-center mb-4">
        <h3 className="text-2xl font-bold text-white mb-2">🌍 Interactive Detective Map</h3>
        <p className="text-blue-200">
          {caseHints?.clueContext ? 
            `🔍 Focus: ${caseHints.clueContext}` : 
            'Click anywhere on the map to make your location guess!'
          }
        </p>
        {selectedLocation && (
          <p className="text-yellow-300 font-semibold mt-2 text-lg">
            ✅ Selected: {selectedLocation.name}
          </p>
        )}
      </div>

      {/* The actual Leaflet map */}
      <div 
        ref={mapRef} 
        className="w-full h-96 rounded-lg border-2 border-blue-300 shadow-lg mb-4"
        style={{ minHeight: '400px' }}
      />

      {/* Quick pick buttons */}
      <div className="mt-4">
        <button
          onClick={() => setShowQuickPicks(!showQuickPicks)}
          className="mb-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {showQuickPicks ? '🔼 Hide' : '🔽 Show'} Quick Location Picks ({relevantLocations.length})
        </button>

        {showQuickPicks && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-w-6xl mx-auto">
            {relevantLocations.map(location => (
              <button
                key={location.name}
                onClick={() => handleQuickLocationClick(location)}
                disabled={disabled}
                className={`p-3 rounded-lg font-semibold text-sm transition-all border-2 ${
                  selectedLocation?.name === location.name
                    ? 'bg-yellow-400 border-yellow-600 text-black'
                    : 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <div className="text-center">
                  <div className="text-lg mb-1">{location.icon}</div>
                  <div className="text-xs font-bold">{location.name.split(',')[0]}</div>
                  <div className="text-xs opacity-75">{location.region}</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="mt-4 text-center">
        <p className="text-lg text-blue-200 font-semibold">
          💡 Tip: Use the clues to guide your search. The closer your guess, the more points you'll earn!
        </p>
        {selectedLocation && caseHints?.targetLocation && (
          <p className="text-green-300 mt-2">
            📏 Distance from target: ~{calculateDistance(
              selectedLocation.lat, 
              selectedLocation.lng, 
              caseHints.targetLocation.lat, 
              caseHints.targetLocation.lng
            ).toFixed(0)} km
          </p>
        )}
      </div>
    </div>
  );
};

export default WorldMap;