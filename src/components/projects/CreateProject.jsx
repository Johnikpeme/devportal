import React, { useState } from 'react';
import { Upload, Gamepad2, CheckCircle } from 'lucide-react';
import Button from '../common/Button';
import Input from '../common/Input';
import { projectService } from '../../services/projectService';

const CreateProject = ({ onClose, onProjectCreated }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    platforms: [],
    genre: '',
    budget: '',
    engine: 'unity',
  });

  const [logoPreview, setLogoPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [createdProjectName, setCreatedProjectName] = useState('');

  const platformsOptions = [
    { value: 'pc', label: 'PC' },
    { value: 'console-ps5', label: 'PlayStation 5' },
    { value: 'console-xbox', label: 'Xbox Series X/S' },
    { value: 'console-switch', label: 'Nintendo Switch' },
    { value: 'mobile-ios', label: 'iOS' },
    { value: 'mobile-android', label: 'Android' },
    { value: 'vr', label: 'VR' },
    { value: 'cloud', label: 'Cloud Gaming' }
  ];

  const genreOptions = [
    'Action RPG', 'FPS', 'Battle Royale', 'MOBA', 'MMORPG', 'Racing', 
    'Sports', 'Simulation', 'Strategy', 'Puzzle', 'Adventure', 'Horror',
    'Survival', 'Platformer', 'Fighting', 'Rhythm', 'Sandbox', 'Educational'
  ];

  const handlePlatformChange = (platform) => {
    setFormData(prev => {
      if (prev.platforms.includes(platform)) {
        return { ...prev, platforms: prev.platforms.filter(p => p !== platform) };
      } else {
        return { ...prev, platforms: [...prev.platforms, platform] };
      }
    });
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    // Validation
    if (!formData.name.trim()) {
      setError('Please enter a project name');
      return;
    }
    
    if (!formData.genre) {
      setError('Please select a genre');
      return;
    }
    
    if (formData.platforms.length === 0) {
      setError('Please select at least one platform');
      return;
    }
    
    setLoading(true);
    
    try {
      // Prepare project data for Supabase
      const projectData = {
        name: formData.name,
        description: formData.description,
        genre: [formData.genre], // Convert to array
        platform: formData.platforms,
        status: 'active',
        progress: 0,
        budget: {
          total: formData.budget ? parseFloat(formData.budget) : 0,
          spent: 0,
          allocated: {},
          remaining: formData.budget ? parseFloat(formData.budget) : 0,
          pricePoints: { deluxe: 0, standard: 0, collector: 0 },
          projectedRevenue: 0
        },
        technical: {
          engine: formData.engine,
          api: '',
          dlss: false,
          renderer: '',
          languages: [],
          rayTracing: false,
          resolution: '',
          storageRequired: ''
        }
      };
      
      // Create project in Supabase
      const createdProject = await projectService.createProject(projectData);
      
      // Show success state
      setSuccess(true);
      setCreatedProjectName(formData.name);
      setLoading(false);
      
      // Clear form
      setFormData({
        name: '',
        description: '',
        platforms: [],
        genre: '',
        budget: '',
        engine: 'unity',
      });
      setLogoPreview(null);
      
      // Wait 1.5 seconds to show success message, then trigger callback
      setTimeout(() => {
        if (onProjectCreated) {
          onProjectCreated(createdProject);
        }
      }, 1500);
      
    } catch (error) {
      console.error('Error creating project:', error);
      setError(`Failed to create project: ${error.message}`);
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Success screen
  if (success) {
    return (
      <div className="space-y-6 text-center py-8">
        <div className="flex flex-col items-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Project Created!</h3>
          <p className="text-gray-600 mb-4">
            <span className="font-semibold">{createdProjectName}</span> has been successfully created.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            The project has been added to your dashboard.
          </p>
          <div className="animate-pulse text-sm text-gray-500">
            Closing in a moment...
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Logo Upload Section */}
      <div className="flex items-center gap-6 mb-6">
        <div className="relative">
          <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer group">
            <label className="cursor-pointer w-full h-full flex items-center justify-center">
              {logoPreview ? (
                <img 
                  src={logoPreview} 
                  alt="Logo preview" 
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <div className="flex flex-col items-center">
                  <Gamepad2 className="w-10 h-10 text-gray-400 group-hover:text-gray-600 mb-2" />
                  <span className="text-xs text-gray-500">Upload Logo</span>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
                disabled={loading}
              />
            </label>
          </div>
          <div className="absolute -bottom-1 -right-1 bg-primary text-white p-1 rounded-full">
            <Upload className="w-3 h-3" />
          </div>
        </div>
        <div>
          <p className="font-medium text-gray-900">Game Logo</p>
          <p className="text-sm text-gray-500">Optional: 512×512 PNG recommended</p>
        </div>
      </div>

      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Project Name *
          </label>
          <Input
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="Enter project name"
            required
            fullWidth
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Genre *
          </label>
          <select
            value={formData.genre}
            onChange={(e) => handleInputChange('genre', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            required
            disabled={loading}
          >
            <option value="">Select a genre</option>
            {genreOptions.map(genre => (
              <option key={genre} value={genre}>{genre}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder="Describe your game project..."
          rows={4}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading}
        />
      </div>

      {/* Platforms Section */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Target Platforms *
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {platformsOptions.map(platform => (
            <label
              key={platform.value}
              className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition-all ${
                formData.platforms.includes(platform.value)
                  ? 'border-primary bg-primary/5 ring-1 ring-primary'
                  : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
              } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <input
                type="checkbox"
                checked={formData.platforms.includes(platform.value)}
                onChange={() => handlePlatformChange(platform.value)}
                className="rounded text-primary focus:ring-primary"
                disabled={loading}
              />
              <span className="text-sm font-medium">{platform.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Technical Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Game Engine
          </label>
          <select
            value={formData.engine}
            onChange={(e) => handleInputChange('engine', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            <option value="unity">Unity</option>
            <option value="unreal">Unreal Engine</option>
            <option value="godot">Godot</option>
            <option value="custom">Custom Engine</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Budget (USD)
          </label>
          <Input
            type="number"
            value={formData.budget}
            onChange={(e) => handleInputChange('budget', e.target.value)}
            placeholder="Estimated budget"
            fullWidth
            disabled={loading}
          />
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={loading}
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Creating...
            </>
          ) : 'Create Project'}
        </Button>
      </div>
    </form>
  );
};

export default CreateProject;