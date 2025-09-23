import React, { useState, useEffect } from 'react';
import { ContentService } from '../../api';
import type { Clue } from '../../api';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Eye, 
  Search,
  Star,
  ArrowUp,
  ArrowDown,
  FileText,
  X
} from 'lucide-react';

interface ClueManagerProps {
  caseId: string;
  caseName?: string;
  onClose?: () => void;
  className?: string;
}

const ClueManager: React.FC<ClueManagerProps> = ({ 
  caseId, 
  caseName = 'Unknown Case',
  onClose, 
  className = '' 
}) => {
  const [clues, setClues] = useState<Clue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Load clues for this case
  useEffect(() => {
    loadClues();
  }, [caseId]);

  const loadClues = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await ContentService.getCaseClues(caseId);
      if (response.success && response.data) {
        // Sort clues by reveal order
        const sortedClues = response.data.clues.sort((a: Clue, b: Clue) => a.revealOrder - b.revealOrder);
        setClues(sortedClues);
      } else {
        setError('Failed to load clues');
      }
    } catch (err) {
      setError('Failed to load clues');
      console.error('Error loading clues:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClue = async (clueId: string) => {
    if (!confirm('Are you sure you want to delete this clue? This action cannot be undone.')) {
      return;
    }

    try {
      // Note: This would need a deleteClue API endpoint
      // For now, we'll simulate the deletion
      console.log('Would delete clue:', clueId);
      setClues(prev => prev.filter(c => c.id !== clueId));
      setError('Note: Clue deletion API not yet implemented');
    } catch (err) {
      setError('Failed to delete clue');
      console.error('Error deleting clue:', err);
    }
  };

  const handleReorderClue = async (clueId: string, newOrder: number) => {
    try {
      // Note: This would need an updateClue API endpoint
      // For now, we'll simulate the reordering
      console.log('Would reorder clue:', clueId, 'to order:', newOrder);
      setError('Note: Clue reordering API not yet implemented');
    } catch (err) {
      setError('Failed to reorder clue');
      console.error('Error reordering clue:', err);
    }
  };

  const moveClueUp = (clue: Clue) => {
    if (clue.revealOrder > 1) {
      handleReorderClue(clue.id, clue.revealOrder - 1);
    }
  };

  const moveClueDown = (clue: Clue) => {
    const maxOrder = Math.max(...clues.map(c => c.revealOrder));
    if (clue.revealOrder < maxOrder) {
      handleReorderClue(clue.id, clue.revealOrder + 1);
    }
  };

  const filteredClues = clues.filter(clue =>
    clue.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    clue.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getClueTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'cultural':
        return 'bg-purple-100 text-purple-800';
      case 'historical':
        return 'bg-blue-100 text-blue-800';
      case 'geographical':
        return 'bg-green-100 text-green-800';
      case 'linguistic':
        return 'bg-orange-100 text-orange-800';
      case 'economic':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyStars = (level: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={12}
        className={i < level ? 'text-yellow-400 fill-current' : 'text-gray-300'}
      />
    ));
  };

  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg shadow border p-8 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading clues...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-800 to-blue-900 text-white p-6 rounded-lg shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center">
              <FileText className="mr-3" size={28} />
              Clue Management
            </h1>
            <p className="text-blue-200 mt-1">Case: {caseName}</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-white text-blue-800 px-6 py-2 rounded-lg hover:bg-blue-50 transition-colors font-medium flex items-center"
            >
              <Plus className="mr-2" size={20} />
              Add Clue
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="text-white hover:text-blue-200 transition-colors"
              >
                <X size={24} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <span className="font-medium">Error: </span>
          {error}
        </div>
      )}

      {/* Search and Controls */}
      <div className="bg-white p-6 rounded-lg shadow border">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
          {/* Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search clues..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Stats */}
          <div className="text-sm text-gray-600">
            {filteredClues.length} of {clues.length} clues
          </div>
        </div>
      </div>

      {/* Clues List */}
      <div className="bg-white rounded-lg shadow border">
        {filteredClues.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              {searchTerm ? 'No clues match your search' : 'No clues created yet'}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm 
                ? 'Try adjusting your search criteria'
                : 'Add your first clue to start building the investigation!'
              }
            </p>
            {!searchTerm && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center mx-auto"
              >
                <Plus className="mr-2" size={20} />
                Add First Clue
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredClues.map((clue) => (
              <div key={clue.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1 mr-4">
                    {/* Clue Header */}
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                        #{clue.revealOrder}
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${getClueTypeColor(clue.type)}`}>
                        {clue.type}
                      </div>
                      <div className="flex items-center space-x-1">
                        {getDifficultyStars(clue.difficultyLevel)}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Star className="mr-1" size={14} />
                        {clue.pointsValue} pts
                      </div>
                    </div>

                    {/* Clue Content */}
                    <div className="mb-3">
                      <p className="text-gray-900 text-lg leading-relaxed">
                        {clue.content}
                      </p>
                    </div>

                    {/* Cultural Context */}
                    {clue.culturalContext && (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3">
                        <h4 className="font-medium text-amber-800 mb-1">Cultural Context:</h4>
                        <p className="text-amber-700 text-sm">{clue.culturalContext}</p>
                      </div>
                    )}

                    {/* Status */}
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                        clue.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {clue.isActive ? 'Active' : 'Inactive'}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col space-y-2">
                    {/* Reorder Controls */}
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => moveClueUp(clue)}
                        disabled={clue.revealOrder === 1}
                        className="p-1 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        title="Move up"
                      >
                        <ArrowUp size={16} />
                      </button>
                      <button
                        onClick={() => moveClueDown(clue)}
                        disabled={clue.revealOrder === Math.max(...clues.map(c => c.revealOrder))}
                        className="p-1 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        title="Move down"
                      >
                        <ArrowDown size={16} />
                      </button>
                    </div>

                    {/* Main Actions */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {/* TODO: Preview clue */}}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Preview clue"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => {/* TODO: Edit clue */}}
                        className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Edit clue"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteClue(clue.id)}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete clue"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* TODO: Create Clue Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Add New Clue</h3>
              <p className="text-gray-600 mb-4">Clue creation form coming soon!</p>
              <button
                onClick={() => setShowCreateModal(false)}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClueManager;