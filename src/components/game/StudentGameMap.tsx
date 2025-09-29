import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Target, Check, Eye, MapPin, Lightbulb } from 'lucide-react';
import type { Location } from '../../api';
import { ClientClueLocationService, type ClueLocationContext, type ClueHint } from '../../services/clientClueLocationService';

// Fix default markers - suppress TS error for leaflet icon fix
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(L.Icon.Default.prototype as any)._getIconUrl = undefined;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface StudentGameMapProps {
  locations: Location[];
  selectedLocation: Location | null;
  onLocationSelect: (location: Location | null) => void;
  sessionId?: string;
  roundNumber?: number;
  showAllLocations?: boolean;
  disabled?: boolean;
  className?: string;
}

interface MapClickHandlerProps {
  locations: Location[];
  onLocationSelect: (location: Location | null) => void;
  disabled?: boolean;
}

// Component to handle map clicks
const MapClickHandler: React.FC<MapClickHandlerProps> = ({ locations, onLocationSelect, disabled }) => {
  const [clickPosition, setClickPosition] = useState<[number, number] | null>(null);

  useMapEvents({
    click: (e) => {
      if (disabled) return;
      
      const { lat, lng } = e.latlng;
      setClickPosition([lat, lng]);
      
      // Find the closest location to the click
      let closestLocation: Location | null = null;
      let minDistance = Infinity;
      
      locations.forEach(location => {
        // Check if location has valid coordinates
        if (location.latitude !== undefined && location.longitude !== undefined) {
          const distance = Math.sqrt(
            Math.pow(lat - location.latitude, 2) + 
            Math.pow(lng - location.longitude, 2)
          );
          
          // Consider locations within a reasonable click radius (about 5 degrees)
          if (distance < 5 && distance < minDistance) {
            minDistance = distance;
            closestLocation = location;
          }
        }
      });
      
      onLocationSelect(closestLocation);
    }
  });

  return clickPosition ? (
    <Marker position={clickPosition} icon={L.divIcon({
      className: 'custom-div-icon',
      html: `<div style="background-color: #ef4444; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
      iconSize: [12, 12],
      iconAnchor: [6, 6]
    })}>
      <Popup>
        <div className="text-center">
          <p className="font-medium text-gray-700">Clicked here</p>
          <p className="text-sm text-gray-500">
            {clickPosition[0].toFixed(2)}, {clickPosition[1].toFixed(2)}
          </p>
        </div>
      </Popup>
    </Marker>
  ) : null;
};

const StudentGameMap: React.FC<StudentGameMapProps> = ({
  locations,
  selectedLocation,
  onLocationSelect,
  sessionId,
  roundNumber = 1,
  showAllLocations = false,
  disabled = false,
  className = ''
}) => {
  const [mapCenter] = useState<[number, number]>([20, 0]); // World center
  const [mapZoom] = useState<number>(2);
  const [clueContext, setClueContext] = useState<ClueLocationContext | null>(null);
  const [showHints, setShowHints] = useState<boolean>(false);
  const [isLoadingContext, setIsLoadingContext] = useState<boolean>(false);

  // Load clue context when session information is available
  useEffect(() => {
    if (sessionId) {
      setIsLoadingContext(true);
      ClueLocationService.getClueLocationContext(sessionId, roundNumber)
        .then(context => {
          setClueContext(context);
        })
        .catch(error => {
          console.error('Failed to load clue context:', error);
          setClueContext(null);
        })
        .finally(() => {
          setIsLoadingContext(false);
        });
    }
  }, [sessionId, roundNumber]);

  return (
    <div className={`relative ${className}`}>
      <div className="h-96 w-full rounded-lg border-2 border-gray-300 overflow-hidden">
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          style={{ height: '100%', width: '100%' }}
          className={disabled ? 'pointer-events-none opacity-60' : ''}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          
          {/* Map click handler */}
          <MapClickHandler 
            locations={locations}
            onLocationSelect={onLocationSelect}
            disabled={disabled}
          />
          
          {/* Show all available locations if enabled */}
          {showAllLocations && locations.map(location => (
            (location.latitude !== undefined && location.longitude !== undefined) && (
              <Marker
                key={location.id}
                position={[location.latitude, location.longitude]}
                icon={L.divIcon({
                  className: 'custom-location-icon',
                  html: `<div style="background-color: #3b82f6; width: 10px; height: 10px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
                  iconSize: [10, 10],
                  iconAnchor: [5, 5]
                })}
              >
                <Popup>
                  <div className="text-center">
                    <p className="font-medium text-blue-700">{location.name}</p>
                    <p className="text-sm text-gray-600">{location.country}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {location.latitude.toFixed(2)}, {location.longitude.toFixed(2)}
                    </p>
                  </div>
                </Popup>
              </Marker>
            )
          ))}
          
          {/* Show selected location with special marker */}
          {selectedLocation && (selectedLocation.latitude !== undefined && selectedLocation.longitude !== undefined) && (
            <Marker
              position={[selectedLocation.latitude, selectedLocation.longitude]}
              icon={L.divIcon({
                className: 'custom-selected-icon',
                html: `<div style="background-color: #10b981; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center;"><div style="color: white; font-size: 10px;">✓</div></div>`,
                iconSize: [16, 16],
                iconAnchor: [8, 8]
              })}
            >
              <Popup>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Check className="text-green-600 mr-1" size={16} />
                    <span className="font-medium text-green-700">Selected</span>
                  </div>
                  <p className="font-medium text-gray-700">{selectedLocation.name}</p>
                  <p className="text-sm text-gray-600">{selectedLocation.country}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {selectedLocation.latitude.toFixed(2)}, {selectedLocation.longitude.toFixed(2)}
                  </p>
                </div>
              </Popup>
            </Marker>
          )}
        </MapContainer>
      </div>
      
      {/* Clue Hints Panel */}
      {clueContext && clueContext.clueHints.length > 0 && (
        <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <Lightbulb className="text-blue-600 mr-2" size={16} />
              <span className="font-medium text-blue-800">Map Navigation Hints</span>
            </div>
            <button
              onClick={() => setShowHints(!showHints)}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              {showHints ? 'Hide' : 'Show'} ({clueContext.clueHints.length})
            </button>
          </div>
          
          {showHints && (
            <div className="space-y-2">
              {clueContext.clueHints.map((hint, index) => (
                <div key={index} className="bg-white rounded p-2 border border-blue-100">
                  <div className="flex items-start">
                    <MapPin className="text-blue-500 mr-2 mt-0.5 flex-shrink-0" size={14} />
                    <div>
                      <div className="text-xs font-medium text-blue-700 uppercase mb-1">
                        {hint.type} Clue
                      </div>
                      <p className="text-sm text-gray-700">{hint.hint}</p>
                      {hint.specificity === 'precise' && (
                        <div className="text-xs text-blue-600 mt-1 flex items-center">
                          <Eye className="mr-1" size={12} />
                          High precision clue - look carefully!
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="text-xs text-blue-600 border-t border-blue-200 pt-2">
                💡 Tip: Look for locations where multiple clue types point to the same area
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Clue Progress */}
      {clueContext && (
        <div className="mt-2 bg-gray-50 border border-gray-200 rounded p-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">
              Clues revealed: {clueContext.revealedClues.length} of {clueContext.totalCluesAvailable}
            </span>
            <div className="flex space-x-1">
              {Array.from({ length: clueContext.totalCluesAvailable }, (_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full ${
                    i < clueContext.revealedClues.length
                      ? 'bg-blue-500'
                      : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      )}
      
      {isLoadingContext && (
        <div className="mt-2 text-center text-sm text-gray-500">
          Loading clue context...
        </div>
      )}
      
      {/* Map Instructions */}
      <div className="mt-3 text-center">
        {disabled ? (
          <p className="text-sm text-gray-500">Map interaction disabled</p>
        ) : (
          <div className="text-sm text-gray-600">
            <div className="flex items-center justify-center space-x-4">
              <div className="flex items-center">
                <Target className="text-blue-500 mr-1" size={16} />
                <span>Click near a location to select it</span>
              </div>
              {selectedLocation && (
                <div className="flex items-center text-green-600">
                  <Check className="mr-1" size={16} />
                  <span>{selectedLocation.name} selected</span>
                </div>
              )}
            </div>
            {showAllLocations && (
              <p className="text-xs text-gray-500 mt-1">
                Blue dots show all available locations
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentGameMap;