import React, { useState, useEffect } from 'react';
import { ContentService } from '../../api';
import type { Location, Villain, CreateCaseRequest } from '../../api';
import { 
  Save, 
  X, 
  Globe, 
  Users, 
  Clock, 
  BookOpen,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

interface CaseFormProps {
  onClose: () => void;
  onSave: (caseData: CreateCaseRequest) => Promise<void>;
  className?: string;
}

const CaseForm: React.FC<CaseFormProps> = ({ onClose, onSave, className = '' }) => {
  const [formData, setFormData] = useState<CreateCaseRequest>({
    title: '',
    description: '',
    difficultyLevel: 1,
    villainId: '',
    targetLocationId: '',
    estimatedDurationMinutes: 30
  });

  const [locations, setLocations] = useState<Location[]>([]);
  const [villains, setVillains] = useState<Villain[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load locations and villains
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoadingData(true);
        
        const [locationsResponse, villainsResponse] = await Promise.all([
          ContentService.getLocations(),
          ContentService.getVillains()
        ]);

        if (locationsResponse.success && locationsResponse.data) {
          setLocations(locationsResponse.data.locations);
        }

        if (villainsResponse.success && villainsResponse.data) {
          setVillains(villainsResponse.data.villains);
        }
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoadingData(false);
      }
    };

    loadData();
  }, []);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Case title is required';
    } else if (formData.title.length < 3) {
      newErrors.title = 'Case title must be at least 3 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Case description is required';
    } else if (formData.description.length < 20) {
      newErrors.description = 'Description must be at least 20 characters';
    }

    if (!formData.villainId) {
      newErrors.villainId = 'Please select a villain';
    }

    if (!formData.targetLocationId) {
      newErrors.targetLocationId = 'Please select a target location';
    }

    if (!formData.estimatedDurationMinutes || formData.estimatedDurationMinutes < 5) {
      newErrors.estimatedDurationMinutes = 'Duration must be at least 5 minutes';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setIsLoading(true);
      await onSave(formData);
    } catch (error) {
      console.error('Failed to save case:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof CreateCaseRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const getDifficultyDescription = (level: number) => {
    switch (level) {
      case 1: return 'Simple clues, obvious connections (Elementary students)';
      case 2: return 'Moderate complexity, some reasoning required (Middle school)';
      case 3: return 'Complex clues, critical thinking needed (High school)';
      case 4: return 'Advanced deduction, cultural knowledge (Advanced students)';
      case 5: return 'Expert level, extensive research required (Honors/AP level)';
      default: return '';
    }
  };

  if (loadingData) {
    return (
      <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 ${className}`}>
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading case creation form...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 ${className}`}>
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-800 to-red-900 text-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center">
              <BookOpen className="mr-2" size={24} />
              Create New Case
            </h2>
            <button
              onClick={onClose}
              className="text-white hover:text-red-200 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
          <p className="text-red-200 mt-2">Design an educational Carmen Sandiego adventure</p>
        </div>

        {/* Form */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Basic Information</h3>
              
              {/* Case Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Case Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="The Mystery of the Missing Artifact"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 ${
                    errors.title ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.title && (
                  <div className="flex items-center mt-1 text-red-600 text-sm">
                    <AlertCircle size={14} className="mr-1" />
                    {errors.title}
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Case Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe the mystery and what students will investigate..."
                  rows={4}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 ${
                    errors.description ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                <div className="flex justify-between items-center mt-1">
                  {errors.description ? (
                    <div className="flex items-center text-red-600 text-sm">
                      <AlertCircle size={14} className="mr-1" />
                      {errors.description}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">
                      {formData.description.length}/500 characters
                    </div>
                  )}
                </div>
              </div>

              {/* Difficulty Level */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Difficulty Level *
                </label>
                <select
                  value={formData.difficultyLevel}
                  onChange={(e) => handleInputChange('difficultyLevel', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value={1}>Level 1 - Beginner</option>
                  <option value={2}>Level 2 - Intermediate</option>
                  <option value={3}>Level 3 - Advanced</option>
                  <option value={4}>Level 4 - Expert</option>
                  <option value={5}>Level 5 - Master Detective</option>
                </select>
                <p className="text-sm text-gray-600 mt-1">
                  {getDifficultyDescription(formData.difficultyLevel)}
                </p>
              </div>

              {/* Estimated Duration */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estimated Duration (minutes) *
                </label>
                <div className="flex items-center space-x-2">
                  <Clock size={20} className="text-gray-400" />
                  <input
                    type="number"
                    value={formData.estimatedDurationMinutes}
                    onChange={(e) => handleInputChange('estimatedDurationMinutes', parseInt(e.target.value) || 0)}
                    min="5"
                    max="120"
                    className={`flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 ${
                      errors.estimatedDurationMinutes ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  <span className="text-sm text-gray-500">minutes</span>
                </div>
                {errors.estimatedDurationMinutes && (
                  <div className="flex items-center mt-1 text-red-600 text-sm">
                    <AlertCircle size={14} className="mr-1" />
                    {errors.estimatedDurationMinutes}
                  </div>
                )}
              </div>
            </div>

            {/* Characters and Setting */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Characters & Setting</h3>
              
              {/* Villain Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Users className="inline mr-1" size={16} />
                  Villain *
                </label>
                <select
                  value={formData.villainId}
                  onChange={(e) => handleInputChange('villainId', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 ${
                    errors.villainId ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select a villain...</option>
                  {villains.map(villain => (
                    <option key={villain.id} value={villain.id}>
                      {villain.name}
                    </option>
                  ))}
                </select>
                {errors.villainId && (
                  <div className="flex items-center mt-1 text-red-600 text-sm">
                    <AlertCircle size={14} className="mr-1" />
                    {errors.villainId}
                  </div>
                )}
                {formData.villainId && (
                  <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                    {villains.find(v => v.id === formData.villainId)?.description}
                  </div>
                )}
              </div>

              {/* Target Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Globe className="inline mr-1" size={16} />
                  Target Location *
                </label>
                <select
                  value={formData.targetLocationId}
                  onChange={(e) => handleInputChange('targetLocationId', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 ${
                    errors.targetLocationId ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select target location...</option>
                  {locations.map(location => (
                    <option key={location.id} value={location.id}>
                      {location.name}, {location.country} ({location.region})
                    </option>
                  ))}
                </select>
                {errors.targetLocationId && (
                  <div className="flex items-center mt-1 text-red-600 text-sm">
                    <AlertCircle size={14} className="mr-1" />
                    {errors.targetLocationId}
                  </div>
                )}
                {formData.targetLocationId && (
                  <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                    {locations.find(l => l.id === formData.targetLocationId)?.description}
                  </div>
                )}
              </div>
            </div>

            {/* Educational Notes */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <CheckCircle className="text-blue-600 mr-2 mt-0.5" size={20} />
                <div>
                  <h4 className="font-medium text-blue-900">Educational Tips</h4>
                  <ul className="text-sm text-blue-800 mt-2 space-y-1">
                    <li>• Choose locations that offer rich cultural and historical learning opportunities</li>
                    <li>• Select villains with interesting backstories that connect to the location</li>
                    <li>• Consider your students' age and knowledge level when setting difficulty</li>
                    <li>• Plan for 5-10 minutes per clue when estimating duration</li>
                  </ul>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="border-t px-6 py-4 bg-gray-50 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
          
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium flex items-center"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Creating...
              </>
            ) : (
              <>
                <Save className="mr-2" size={16} />
                Create Case
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CaseForm;