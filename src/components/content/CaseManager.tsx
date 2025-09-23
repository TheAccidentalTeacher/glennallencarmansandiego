import React, { useState, useEffect } from 'react';
import { ContentService } from '../../api';
import type { Case, CreateCaseRequest } from '../../api';
import CaseForm from './CaseForm';
import { 
  BookOpen, 
  Plus, 
  Search, 
  Globe, 
  Users, 
  Clock,
  Eye,
  Edit,
  Trash2,
  Star,
  FileText,
  Filter
} from 'lucide-react';

interface CaseManagerProps {
  className?: string;
  onViewClues?: (caseId: string, caseName: string) => void;
}

const CaseManager: React.FC<CaseManagerProps> = ({ className = '', onViewClues }) => {
  const [cases, setCases] = useState<Case[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<number | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Load cases
  useEffect(() => {
    loadCases();
  }, []);

  const loadCases = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await ContentService.getCases();
      if (response.success && response.data) {
        setCases(response.data.cases);
      } else {
        setError('Failed to load cases');
      }
    } catch (err) {
      setError('Failed to load cases');
      console.error('Error loading cases:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCase = async (caseData: CreateCaseRequest) => {
    try {
      const response = await ContentService.createCase(caseData);
      if (response.success && response.data) {
        setCases(prev => [response.data?.case || {} as Case, ...prev]);
        setShowCreateModal(false);
      } else {
        setError('Failed to create case');
      }
    } catch (err) {
      setError('Failed to create case');
      console.error('Error creating case:', err);
    }
  };

  const handleDeleteCase = async (caseId: string) => {
    if (!confirm('Are you sure you want to delete this case? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await ContentService.deleteCase(caseId);
      if (response.success) {
        setCases(prev => prev.filter(c => c.id !== caseId));
      } else {
        setError('Failed to delete case');
      }
    } catch (err) {
      setError('Failed to delete case');
      console.error('Error deleting case:', err);
    }
  };

  const filteredCases = cases.filter(caseItem => {
    const matchesSearch = caseItem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         caseItem.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty = difficultyFilter === null || caseItem.difficultyLevel === difficultyFilter;
    
    return matchesSearch && matchesDifficulty;
  });

  const getDifficultyLabel = (level: number) => {
    switch (level) {
      case 1: return 'Beginner';
      case 2: return 'Intermediate';
      case 3: return 'Advanced';
      case 4: return 'Expert';
      case 5: return 'Master Detective';
      default: return `Level ${level}`;
    }
  };

  const getDifficultyColor = (level: number) => {
    switch (level) {
      case 1: return 'bg-green-100 text-green-800';
      case 2: return 'bg-blue-100 text-blue-800';
      case 3: return 'bg-yellow-100 text-yellow-800';
      case 4: return 'bg-orange-100 text-orange-800';
      case 5: return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg shadow border p-8 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading cases...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-red-800 to-red-900 text-white p-6 rounded-lg shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center">
              <BookOpen className="mr-3" size={28} />
              Case Management
            </h1>
            <p className="text-red-200 mt-1">Create and manage your Carmen Sandiego investigations</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-white text-red-800 px-6 py-2 rounded-lg hover:bg-red-50 transition-colors font-medium flex items-center"
          >
            <Plus className="mr-2" size={20} />
            New Case
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <span className="font-medium">Error: </span>
          {error}
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white p-6 rounded-lg shadow border">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
          {/* Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search cases..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>

          {/* Difficulty Filter */}
          <div className="flex items-center space-x-2">
            <Filter size={20} className="text-gray-500" />
            <select
              value={difficultyFilter || ''}
              onChange={(e) => setDifficultyFilter(e.target.value ? parseInt(e.target.value) : null)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">All Difficulties</option>
              <option value="1">Beginner</option>
              <option value="2">Intermediate</option>
              <option value="3">Advanced</option>
              <option value="4">Expert</option>
              <option value="5">Master Detective</option>
            </select>
          </div>

          {/* Stats */}
          <div className="text-sm text-gray-600">
            {filteredCases.length} of {cases.length} cases
          </div>
        </div>
      </div>

      {/* Cases Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCases.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <BookOpen className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              {searchTerm || difficultyFilter ? 'No cases match your filters' : 'No cases created yet'}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || difficultyFilter 
                ? 'Try adjusting your search or filter criteria'
                : 'Create your first case to start building educational adventures!'
              }
            </p>
            {!searchTerm && !difficultyFilter && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center mx-auto"
              >
                <Plus className="mr-2" size={20} />
                Create First Case
              </button>
            )}
          </div>
        ) : (
          filteredCases.map((caseItem) => (
            <div key={caseItem.id} className="bg-white rounded-lg shadow border hover:shadow-lg transition-shadow">
              {/* Case Header */}
              <div className="p-6 border-b">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 flex-1">
                    {caseItem.title}
                  </h3>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(caseItem.difficultyLevel)}`}>
                    {getDifficultyLabel(caseItem.difficultyLevel)}
                  </div>
                </div>
                
                <p className="text-gray-600 text-sm line-clamp-3">
                  {caseItem.description}
                </p>
              </div>

              {/* Case Details */}
              <div className="p-6 space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <Globe className="mr-2" size={16} />
                  <span>{caseItem.locationName}, {caseItem.locationCountry}</span>
                </div>
                
                <div className="flex items-center text-sm text-gray-600">
                  <Users className="mr-2" size={16} />
                  <span>Villain: {caseItem.villainName}</span>
                </div>
                
                {caseItem.estimatedDurationMinutes && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="mr-2" size={16} />
                    <span>~{caseItem.estimatedDurationMinutes} minutes</span>
                  </div>
                )}
                
                <div className="flex items-center text-sm text-gray-600">
                  <Star className="mr-2" size={16} />
                  <span>Created {formatDate(caseItem.createdAt)}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="p-6 pt-0 flex items-center justify-between">
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  caseItem.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {caseItem.isActive ? 'Active' : 'Inactive'}
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {/* TODO: Preview case */}}
                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Preview case"
                  >
                    <Eye size={16} />
                  </button>
                  {onViewClues && (
                    <button
                      onClick={() => onViewClues(caseItem.id, caseItem.title)}
                      className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                      title="Manage clues"
                    >
                      <FileText size={16} />
                    </button>
                  )}
                  <button
                    onClick={() => {/* TODO: Edit case */}}
                    className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    title="Edit case"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteCase(caseItem.id)}
                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete case"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* TODO: Create Case Modal */}
      {showCreateModal && (
        <CaseForm
          onClose={() => setShowCreateModal(false)}
          onSave={handleCreateCase}
        />
      )}
    </div>
  );
};

export default CaseManager;