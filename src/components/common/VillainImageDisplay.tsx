import React, { useEffect, useState } from 'react';
import { VillainImages } from '../../services/villainImageService';

interface VillainImageDisplayProps {
  villainId: string;
  currentRound?: number;
  showAllImages?: boolean;
  className?: string;
}

interface ApiResponse<T> {
  success: boolean;
  images?: T;
  imageUrl?: string;
  error?: string;
}

const VillainImageDisplay: React.FC<VillainImageDisplayProps> = ({ 
  villainId, 
  currentRound = 0, 
  showAllImages = false,
  className = '' 
}) => {
  const [villainImages, setVillainImages] = useState<VillainImages | null>(null);
  const [contextualImage, setContextualImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all images for the villain
  useEffect(() => {
    const fetchVillainImages = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/images/villains/${villainId}`);
        const data: ApiResponse<VillainImages> = await response.json();

        if (data.success && data.images) {
          setVillainImages(data.images);
        } else {
          setError(data.error || 'Failed to load villain images');
        }
      } catch (err) {
        setError('Network error loading villain images');
        console.error('Error fetching villain images:', err);
      } finally {
        setLoading(false);
      }
    };

    if (villainId) {
      fetchVillainImages();
    }
  }, [villainId]);

  // Fetch contextual image for specific round
  useEffect(() => {
    if (currentRound > 0 && villainId) {
      const fetchContextualImage = async () => {
        try {
          const response = await fetch(`/api/images/villains/${villainId}/round/${currentRound}`);
          const data: ApiResponse<never> = await response.json();

          if (data.success && data.imageUrl) {
            setContextualImage(data.imageUrl);
          }
        } catch (err) {
          console.error('Error fetching contextual image:', err);
        }
      };

      fetchContextualImage();
    }
  }, [villainId, currentRound]);

  if (loading) {
    return (
      <div className={`villain-image-loading ${className}`}>
        <div className="animate-pulse bg-gray-300 rounded-lg aspect-square"></div>
        <p className="text-sm text-gray-600 mt-2">Loading character images...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`villain-image-error ${className}`}>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p className="font-bold">Image Loading Error</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!villainImages) {
    return (
      <div className={`villain-image-empty ${className}`}>
        <div className="bg-gray-100 border border-gray-300 text-gray-600 px-4 py-3 rounded">
          <p>No images available for this character</p>
        </div>
      </div>
    );
  }

  // Show all images in gallery mode
  if (showAllImages) {
    return (
      <div className={`villain-image-gallery ${className}`}>
        <h3 className="text-lg font-semibold mb-4">{villainImages.villainName} Gallery</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {villainImages.allImages.map((imageUrl, index) => (
            <div key={index} className="villain-gallery-item">
              <img 
                src={imageUrl} 
                alt={`${villainImages.villainName} scene ${index + 1}`}
                className="w-full h-auto rounded-lg shadow-md hover:shadow-lg transition-shadow"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Show contextual image based on current round
  const displayImage = currentRound > 0 && contextualImage 
    ? contextualImage 
    : villainImages.primaryImage;

  const getImageContext = (): string => {
    switch (currentRound) {
      case 1: return 'Geographic Context';
      case 2: return 'Cultural Context';
      case 3: return 'Economic Context';
      case 4: return 'Landmark Context';
      default: return 'Character Portrait';
    }
  };

  return (
    <div className={`villain-image-display ${className}`}>
      <div className="villain-image-container">
        <img 
          src={displayImage} 
          alt={`${villainImages.villainName} - ${getImageContext()}`}
          className="villain-image w-full h-auto rounded-lg shadow-lg"
          style={{ maxHeight: '400px', objectFit: 'cover' }}
        />
        {currentRound > 0 && (
          <div className="image-context-label mt-2 text-sm text-gray-600 font-medium">
            Round {currentRound}: {getImageContext()}
          </div>
        )}
      </div>
      
      {/* Optional: Show image navigation dots */}
      <div className="image-navigation mt-4 flex justify-center space-x-2">
        {[0, 1, 2, 3, 4].map((round) => (
          <button
            key={round}
            className={`w-3 h-3 rounded-full transition-colors ${
              (currentRound || 0) === round 
                ? 'bg-blue-600' 
                : 'bg-gray-300 hover:bg-gray-400'
            }`}
            onClick={() => {
              // This could trigger a prop change or emit an event
              // For now, it's just visual feedback
            }}
            title={round === 0 ? 'Portrait' : `Round ${round}`}
          />
        ))}
      </div>
    </div>
  );
};

// Hook for easily accessing villain image data
export const useVillainImages = (villainId: string) => {
  const [images, setImages] = useState<VillainImages | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchImages = async () => {
    if (!villainId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/images/villains/${villainId}`);
      const data: ApiResponse<VillainImages> = await response.json();

      if (data.success && data.images) {
        setImages(data.images);
      } else {
        setError(data.error || 'Failed to load images');
      }
    } catch (err) {
      setError('Network error');
      console.error('Error in useVillainImages:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, [villainId]);

  return { images, loading, error, refetch: fetchImages };
};

export default VillainImageDisplay;