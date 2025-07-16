'use client';

import React, { useState } from 'react';
import { useAnnouncements, type AnnouncementType } from '@/hooks/useAnnouncements';

const AnnouncementManager: React.FC = () => {
  const { 
    announcements, 
    saveAnnouncement, 
    updateAnnouncement, 
    deleteAnnouncement,
    getAnnouncementTypeConfig,
    validateAnnouncement,
    forceExpiryCheck
  } = useAnnouncements();

  // Form state
  const [formData, setFormData] = useState({
    isActive: false,
    type: 'general' as AnnouncementType,
    message: '',
    expiryType: 'never' as 'never' | 'time-based',
    expiryDuration: 1,
    expiryUnit: 'hours' as 'hours' | 'days'
  });

  // Error state
  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Clear messages when form data changes
  React.useEffect(() => {
    if (errors.length > 0) {
      setErrors([]);
    }
  }, [formData.message, formData.type, formData.expiryType]);

  // Character count for message
  const messageLength = formData.message.length;
  const maxLength = 300;

  // Validation
  const validationErrors = validateAnnouncement(formData);
  const isFormValid = validationErrors.length === 0 && formData.message.trim().length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous messages
    setErrors([]);
    
    // Validate form
    const validationErrors = validateAnnouncement(formData);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const announcement = saveAnnouncement({
        isActive: formData.isActive,
        type: formData.type,
        message: formData.message.trim(),
        expiryType: formData.expiryType,
        expiryDuration: formData.expiryType === 'time-based' ? formData.expiryDuration : undefined,
        expiryUnit: formData.expiryType === 'time-based' ? formData.expiryUnit : undefined
      });

      // Reset form
      setFormData({
        isActive: false,
        type: 'general',
        message: '',
        expiryType: 'never',
        expiryDuration: 1,
        expiryUnit: 'hours'
      });

      // Force expiry check to update UI immediately
      forceExpiryCheck();

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create announcement';
      setErrors([errorMessage]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleAnnouncementActive = (id: string, isActive: boolean) => {
    updateAnnouncement(id, { isActive });
  };

  const handleDeleteAnnouncement = (id: string) => {
    if (confirm('Are you sure you want to delete this announcement?')) {
      deleteAnnouncement(id);
    }
  };



  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Announcement Management</h1>
        <p className="text-gray-600">
          Create and manage announcements that appear on therapist and admin dashboards.
        </p>
      </div>



      {/* Error and Success Messages */}
      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                {errors.length === 1 ? 'Error' : 'Errors'}
              </h3>
              <ul className="mt-2 text-sm text-red-700 list-disc list-inside">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}



      {/* Create New Announcement Form */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Create New Announcement</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">


          {/* Announcement Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Announcement Type
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as AnnouncementType }))}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="general">📢 General Announcement</option>
              <option value="feature">⭐ New Feature</option>
              <option value="technical">⚠️ Technical Issue</option>
              <option value="company">🏢 Company Announcement</option>
            </select>
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message
            </label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
              placeholder="Enter your announcement message..."
              rows={4}
              className={`w-full p-3 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                messageLength > maxLength ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            <div className="flex justify-between items-center mt-2">
              <p className="text-sm text-gray-500">
                Character limit: 300
              </p>
              <p className={`text-sm ${
                messageLength > maxLength ? 'text-red-600' : 
                messageLength > maxLength * 0.8 ? 'text-yellow-600' : 'text-gray-500'
              }`}>
                {messageLength}/{maxLength}
              </p>
            </div>
          </div>

          {/* Expiry Settings */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Expiry Settings
            </label>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="never"
                  checked={formData.expiryType === 'never'}
                  onChange={(e) => setFormData(prev => ({ ...prev, expiryType: 'never' }))}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Never expire</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="time-based"
                  checked={formData.expiryType === 'time-based'}
                  onChange={(e) => setFormData(prev => ({ ...prev, expiryType: 'time-based' }))}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Expire after:</span>
              </label>
              
              {formData.expiryType === 'time-based' && (
                <div className="ml-6 flex items-center space-x-3">
                  <input
                    type="number"
                    min="1"
                    max="168"
                    value={formData.expiryDuration}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      expiryDuration: Math.max(1, parseInt(e.target.value) || 1)
                    }))}
                    className="w-20 p-2 border border-gray-300 rounded-md text-sm"
                  />
                  <select
                    value={formData.expiryUnit}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      expiryUnit: e.target.value as 'hours' | 'days'
                    }))}
                    className="p-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="hours">Hours</option>
                    <option value="days">Days</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!isFormValid || isSubmitting}
            className={`w-full py-3 px-4 rounded-md font-medium text-sm transition-colors flex items-center justify-center ${
              isFormValid && !isSubmitting
                ? 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating...
              </>
            ) : (
              'Create Announcement'
            )}
          </button>
        </form>
      </div>



      {/* Existing Announcements */}
      {announcements.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Existing Announcements</h3>
          <div className="space-y-4">
            {announcements.map((announcement) => {
                             // Get banner-style configuration
               const getBannerConfig = (type: AnnouncementType, isActive: boolean) => {
                 const baseConfigs: Record<AnnouncementType, {
                   bgColor: string;
                   textColor: string;
                   borderColor: string;
                   iconColor: string;
                   icon: string;
                   label: string;
                 }> = {
                   feature: {
                     bgColor: isActive ? 'bg-blue-100' : 'bg-gray-50',
                     textColor: isActive ? 'text-blue-800' : 'text-gray-500',
                     borderColor: isActive ? 'border-blue-200' : 'border-gray-200',
                     iconColor: isActive ? 'text-blue-600' : 'text-gray-400',
                     icon: '⭐',
                     label: 'New Feature'
                   },
                   technical: {
                     bgColor: isActive ? 'bg-red-100' : 'bg-gray-50',
                     textColor: isActive ? 'text-red-800' : 'text-gray-500',
                     borderColor: isActive ? 'border-red-200' : 'border-gray-200',
                     iconColor: isActive ? 'text-red-600' : 'text-gray-400',
                     icon: '⚠️',
                     label: 'Technical Issue'
                   },
                   company: {
                     bgColor: isActive ? 'bg-green-100' : 'bg-gray-50',
                     textColor: isActive ? 'text-green-800' : 'text-gray-500',
                     borderColor: isActive ? 'border-green-200' : 'border-gray-200',
                     iconColor: isActive ? 'text-green-600' : 'text-gray-400',
                     icon: '🏢',
                     label: 'Company'
                   },
                   general: {
                     bgColor: isActive ? 'bg-gray-100' : 'bg-gray-50',
                     textColor: isActive ? 'text-gray-800' : 'text-gray-500',
                     borderColor: isActive ? 'border-gray-200' : 'border-gray-200',
                     iconColor: isActive ? 'text-gray-600' : 'text-gray-400',
                     icon: '📢',
                     label: 'General'
                   }
                 };
                 return baseConfigs[type] || baseConfigs.general;
               };

              const config = getBannerConfig(announcement.type, announcement.isActive);
              
              return (
                <div
                  key={announcement.id}
                  className="border border-gray-200 rounded-lg overflow-hidden"
                >
                  {/* Banner Preview */}
                  <div
                    className={`
                      relative w-full border-l-4 p-4 shadow-sm
                      ${config.bgColor} ${config.textColor} ${config.borderColor}
                      ${!announcement.isActive ? 'opacity-60' : ''}
                    `}
                  >
                    <div className="flex items-start space-x-3">
                      {/* Icon */}
                      <span className={`text-lg mt-0.5 flex-shrink-0 ${config.iconColor}`}>
                        {config.icon}
                      </span>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        {/* Type Badge */}
                        <div className="flex items-center space-x-2 mb-1">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.bgColor} ${config.textColor} border ${config.borderColor}`}>
                            {config.label}
                          </span>
                          {announcement.expiresAt && (
                            <span className="text-xs opacity-75">
                              Expires: {new Date(announcement.expiresAt).toLocaleDateString()} at {new Date(announcement.expiresAt).toLocaleTimeString()}
                            </span>
                          )}
                        </div>
                        
                        {/* Message */}
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">
                          {announcement.message}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Management Controls */}
                  <div className="bg-gray-50 border-t border-gray-200 px-4 py-3">
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-500">
                        Created: {announcement.createdAt.toLocaleString()}
                      </div>
                      <div className="flex items-center space-x-3">
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <span className="text-sm text-gray-700">Active</span>
                          <div className="relative inline-flex items-center">
                            <input
                              type="checkbox"
                              checked={announcement.isActive}
                              onChange={(e) => toggleAnnouncementActive(announcement.id, e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                          </div>
                        </label>
                        <button
                          onClick={() => handleDeleteAnnouncement(announcement.id)}
                          className="text-red-600 hover:text-red-800 p-1"
                          title="Delete announcement"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default AnnouncementManager; 