import React from 'react';

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  imageAlt: string;
  clueNumber?: number;
}

export const ImageModal: React.FC<ImageModalProps> = ({
  isOpen,
  onClose,
  imageSrc,
  imageAlt,
  clueNumber
}) => {
  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  React.useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <div 
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
      onClick={handleOverlayClick}
    >
      <div className="relative max-w-5xl max-h-full bg-gray-900 rounded-lg overflow-hidden shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-red-600 hover:bg-red-700 text-white w-10 h-10 rounded-full flex items-center justify-center text-xl font-bold transition-colors shadow-lg"
          aria-label="Close image"
        >
          ×
        </button>
        
        {/* Clue Number Badge */}
        {clueNumber && (
          <div className="absolute top-4 left-4 z-10 bg-yellow-500 text-black px-3 py-1 rounded-full font-bold text-sm shadow-lg">
            Clue #{clueNumber}
          </div>
        )}
        
        {/* Image */}
        <img
          src={imageSrc}
          alt={imageAlt}
          className="w-full h-full object-contain max-h-[90vh]"
          onError={(e) => {
            console.error('Modal image failed to load:', e.currentTarget.src);
            e.currentTarget.src = '/images/placeholder-villain.png';
          }}
        />
        
        {/* Instructions */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/60 text-white px-4 py-2 rounded-lg text-sm">
          Click outside image or press ESC to close
        </div>
      </div>
    </div>
  );
};