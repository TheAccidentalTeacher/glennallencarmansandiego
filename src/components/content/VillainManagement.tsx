import React, { useEffect, useState } from 'react';
import { Users, Image as ImageIcon, Eye, Sparkles } from 'lucide-react';
import VillainImageService from '../../services/villainImageService';

interface Villain {
  id: string;
  name: string;
  imageCount: number;
}

const VillainManagement: React.FC = () => {
  const [villains, setVillains] = useState<Villain[]>([]);
  const [selectedVillain, setSelectedVillain] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVillains = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/api/images/villains');
        const data = await response.json();
        
        if (data.success && data.villains) {
          // Create villain objects with display names
          const villainList = data.villains.map((id: string) => ({
            id,
            name: getVillainDisplayName(id),
            imageCount: 5 // Each villain has 5 images
          }));
          
          setVillains(villainList);
          
          // Auto-select Sourdough Pete if available
          const sourdoughPete = villainList.find((v: Villain) => v.id.includes('sourdough'));
          if (sourdoughPete) {
            setSelectedVillain(sourdoughPete.id);
          } else if (villainList.length > 0) {
            setSelectedVillain(villainList[0].id);
          }
        } else {
          setError(data.error || 'Failed to load villains');
        }
      } catch (err) {
        setError('Network error loading villains');
        console.error('Error fetching villains:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchVillains();
  }, []);

  const getVillainDisplayName = (villainId: string): string => {
    const nameMap: Record<string, string> = {
      'sourdough-pete': 'Sourdough Pete (Alaska)',
      'dr-meridian': 'Dr. Meridian Elena Fossat',
      'professor-sahara': 'Professor Sahara Amira Hassan',
      'dr-mirage': 'Dr. Mirage Amara Benali',
      'professor-tectonic': 'Professor Tectonic Jin Wei Ming',
      'dr-sahel': 'Dr. Sahel Kwame Asante',
      'dr-monsoon': 'Dr. Monsoon Kiran Patel',
      'dr-coral': 'Dr. Coral Maya Sari',
      'dr-qanat': 'Dr. Qanat Reza Mehrabi',
      'professor-atlas': 'Professor Atlas Viktor Kowalski',
      'dr-pacific': 'Dr. Pacific James Tauranga',
      'dr-watershed': 'Dr. Watershed Sarah Blackfoot',
      'dr-canopy': 'Dr. Canopy Carlos Mendoza'
    };
    
    return nameMap[villainId] || villainId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getImageUrls = (villainId: string): string[] => {
    // Map villain IDs to their actual folder names and image patterns
    const villainData: Record<string, { folder: string; date: string; imageNumbers: number[] }> = {
      'sourdough-pete': { 
        folder: '13-14-sourdough-pete-alaska', 
        date: '2025-09-26', 
        imageNumbers: [0, 1, 2, 3, 4] // base, (1), (2), (3), (4)
      },
      'dr-meridian': { 
        folder: '04-dr-meridian-elena-fossat', 
        date: '2025-09-25', 
        imageNumbers: [0, 1, 2, 3, 4] // base, (1), (2), (3), (4)
      },
      'professor-sahara': { 
        folder: '02-professor-sahara-amira-hassan', 
        date: '2025-09-25', 
        imageNumbers: [5, 6, 7, 8, 9] // (5), (6), (7), (8), (9)
      },
      'dr-mirage': { 
        folder: '03-professor-tectonic-seismic-specialist', 
        date: '2025-09-25', 
        imageNumbers: [10, 11, 12, 13, 14] // (10), (11), (12), (13), (14)
      },
      'professor-tectonic': { 
        folder: '01-dr-altiplano-isabella-santos', 
        date: '2025-09-25', 
        imageNumbers: [15, 16, 17, 18, 19] // (15), (16), (17), (18), (19)
      },
      'dr-sahel': { 
        folder: '05-dr-sahel-kwame-asante', 
        date: '2025-09-25', 
        imageNumbers: [20, 21, 22, 23, 24] // (20), (21), (22), (23), (24)
      },
      'dr-monsoon': { 
        folder: '06-dr-monsoon-kiran-patel', 
        date: '2025-09-25', 
        imageNumbers: [25, 26, 27, 28, 29] // (25), (26), (27), (28), (29)
      },
      'dr-coral': { 
        folder: '07-dr-coral-maya-sari', 
        date: '2025-09-25', 
        imageNumbers: [30, 31, 32, 33, 34] // (30), (31), (32), (33), (34)
      },
      'dr-qanat': { 
        folder: '08-dr-qanat-master-of-disguise', 
        date: '2025-09-25', 
        imageNumbers: [35, 36, 37, 38, 39] // (35), (36), (37), (38), (39)
      },
      'professor-atlas': { 
        folder: '09-professor-atlas-viktor-kowalski', 
        date: '2025-09-25', 
        imageNumbers: [40, 41, 42, 43, 44] // (40), (41), (42), (43), (44)
      },
      'dr-pacific': { 
        folder: '10-dr-pacific-james-tauranga', 
        date: '2025-09-25', 
        imageNumbers: [45, 46, 47, 48, 49] // (45), (46), (47), (48), (49)
      },
      'dr-watershed': { 
        folder: '11-dr-watershed-sarah-blackfoot', 
        date: '2025-09-25', 
        imageNumbers: [50, 51, 52, 53, 54] // (50), (51), (52), (53), (54)
      },
      'dr-canopy': { 
        folder: '12-dr-canopy-carlos-mendoza', 
        date: '2025-09-25', 
        imageNumbers: [55, 56, 57, 58, 59] // (55), (56), (57), (58), (59)
      }
    };
    
    const baseUrl = `/images/villains/`;
    const data = villainData[villainId];
    
    if (!data) {
      console.warn(`No villain data found for: ${villainId}`);
      return [];
    }
    
    return data.imageNumbers.map(num => {
      if (num === 0) {
        // Base image (no parentheses)
        const imageUrl = `${baseUrl}${data.folder}/generated-image-${data.date}.png`;
        return VillainImageService.encodeImageUrl(imageUrl);
      } else {
        // Numbered image with parentheses
        const imageUrl = `${baseUrl}${data.folder}/generated-image-${data.date} (${num}).png`;
        return VillainImageService.encodeImageUrl(imageUrl);
      }
    });
  };

  if (loading) {
    return (
      <div className="text-center py-16 bg-white rounded-2xl shadow-xl">
        <div className="w-12 h-12 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Loading villain gallery...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16 bg-white rounded-2xl shadow-xl">
        <Users className="mx-auto text-red-400 mb-6" size={64} />
        <h3 className="text-2xl font-bold text-red-700 mb-4">Error Loading Villains</h3>
        <p className="text-red-600 mb-6">{error}</p>
      </div>
    );
  }

  if (villains.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-2xl shadow-xl">
        <ImageIcon className="mx-auto text-gray-400 mb-6" size={64} />
        <h3 className="text-2xl font-bold text-gray-700 mb-4">No Villain Images Found</h3>
        <p className="text-gray-600 mb-6">Upload images to the content/villains/images directory to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-6 text-white">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
            <Users size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Villain Gallery</h2>
            <p className="text-purple-100">
              {villains.length} characters • {villains.reduce((sum, v) => sum + v.imageCount, 0)} images total
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Villain List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Sparkles className="mr-2" size={20} />
              Character List
            </h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {villains.map((villain) => (
                <button
                  key={villain.id}
                  onClick={() => setSelectedVillain(villain.id)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    selectedVillain === villain.id
                      ? 'bg-amber-100 text-amber-800 border-2 border-amber-300'
                      : 'hover:bg-gray-100 border-2 border-transparent'
                  }`}
                >
                  <div className="font-medium text-sm">{villain.name}</div>
                  <div className="text-xs text-gray-500 flex items-center mt-1">
                    <ImageIcon size={12} className="mr-1" />
                    {villain.imageCount} images
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Image Display */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-2xl shadow-xl p-6">
            {selectedVillain ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                    <Eye className="mr-2" size={24} />
                    {getVillainDisplayName(selectedVillain)}
                  </h3>
                  <div className="text-sm text-gray-500">
                    Character Gallery
                  </div>
                </div>
                
                {/* Simple Image Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {getImageUrls(selectedVillain).map((imageUrl, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg overflow-hidden">
                      <img
                        src={imageUrl}
                        alt={`${getVillainDisplayName(selectedVillain)} - Image ${index + 1}`}
                        className="w-full h-48 object-cover"
                        onLoad={() => console.log(`✅ Image ${index + 1} loaded:`, imageUrl)}
                        onError={(e) => {
                          console.error(`❌ Image ${index + 1} failed:`, imageUrl);
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                      <div className="p-2 text-xs text-gray-600 text-center">
                        Image {index + 1}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <ImageIcon className="mx-auto text-gray-400 mb-4" size={48} />
                <p className="text-gray-600">Select a character to view their images</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VillainManagement;