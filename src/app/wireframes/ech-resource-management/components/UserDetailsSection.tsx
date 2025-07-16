'use client';

import React, { useState } from 'react';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';

const germanCities = ['Berlin', 'Munich', 'Hamburg', 'Frankfurt', 'Cologne'];
const therapistTypes = ['Physiotherapy', 'Occupational Therapy', 'Speech Therapy'];
const transportationTypes = ['Own car', 'Motorcycle', 'Public transport'];
const roles = ['THERAPIST', 'ADMIN', 'SUPER_ADMIN'];
const statusOptions = ['Active', 'Inactive'];

interface UserDetailsProps {
  userId?: string;
  onBack?: () => void;
  onFindMatches?: (echId?: string, therapyType?: string) => void;
}

export default function UserDetailsSection({ userId, onBack, onFindMatches }: UserDetailsProps) {
  // Sample user data (in real app, this would be fetched based on userId)
  const [formData, setFormData] = useState({
    role: 'THERAPIST',
    firstName: 'Anna',
    lastName: 'Schmidt',
    email: 'anna.schmidt@therapios.com',
    address: 'Unter den Linden 45, 10117 Berlin-Mitte',
    location: 'Berlin',
    therapistType: 'Physiotherapy',
    transportationType: ['Public transport'], // Changed to array with default
    status: true, // true = Active, false = Inactive
    utilization: 45, // % utilization (read-only, sourced externally)
    maxCapacity: 60, // Maximum patient capacity per week
    currentPatients: 27, // Current active patients
    newPassword: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTransportationChange = (transport: string) => {
    setFormData(prev => ({
      ...prev,
      transportationType: prev.transportationType.includes(transport)
        ? prev.transportationType.filter(t => t !== transport)
        : [...prev.transportationType, transport]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setSuccessMessage('Therapist information updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    }, 1000);
  };

  const handleCancel = () => {
    if (onBack) {
      onBack();
    } else {
      // In real app, this would navigate back to team list
      alert('Navigate back to team list');
    }
  };

  const getUtilizationColor = (utilization: number) => {
    if (utilization >= 85) return 'text-red-600';
    if (utilization >= 70) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getUtilizationBadge = (utilization: number) => {
    let bgColor = '';
    let textColor = '';
    
    if (utilization >= 85) {
      bgColor = 'bg-red-100';
      textColor = 'text-red-800';
    } else if (utilization >= 70) {
      bgColor = 'bg-yellow-100';
      textColor = 'text-yellow-800';
    } else {
      bgColor = 'bg-green-100';
      textColor = 'text-green-800';
    }
    
    return `${bgColor} ${textColor}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleCancel}
          className="flex items-center gap-2 text-gray-600 hover:text-[#0f2c59] transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-xl font-semibold text-[#0f2c59]">Edit Therapist</h2>
          <p className="text-gray-600">Update therapist information and settings</p>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
            <span className="text-green-800 font-medium">{successMessage}</span>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
          
          {/* User Role */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              User Role <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.role}
              onChange={(e) => handleInputChange('role', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0f2c59] focus:border-transparent"
              required
            >
              {roles.map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>

          {/* Name Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0f2c59] focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0f2c59] focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0f2c59] focus:border-transparent"
              required
            />
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0f2c59] focus:border-transparent"
              placeholder="Enter full address (street, postal code, city)"
              required
            />
          </div>

          {/* Location and Therapist Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0f2c59] focus:border-transparent"
                required
              >
                {germanCities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Therapy Type <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.therapistType}
                onChange={(e) => handleInputChange('therapistType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0f2c59] focus:border-transparent"
                required
              >
                {therapistTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Transportation - Multi-select with checkboxes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Transportation Methods <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {transportationTypes.map(transport => (
                <label key={transport} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.transportationType.includes(transport)}
                    onChange={() => handleTransportationChange(transport)}
                    className="h-4 w-4 text-[#0f2c59] focus:ring-[#0f2c59] border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">{transport}</span>
                </label>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Select all transportation methods available to this therapist. Public transport is recommended as default.
            </p>
            {formData.transportationType.length === 0 && (
              <p className="text-xs text-red-500 mt-1">
                At least one transportation method must be selected.
              </p>
            )}
          </div>

          {/* Status */}
          <div>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.status}
                onChange={(e) => handleInputChange('status', e.target.checked)}
                className="h-4 w-4 text-[#0f2c59] focus:ring-[#0f2c59] border-gray-300 rounded"
              />
              <span className="text-sm font-medium text-gray-700">
                Active Status <span className="text-red-500">*</span>
              </span>
            </label>
            <p className="text-xs text-gray-500 mt-1">
              Check to set therapist as active, uncheck for inactive status.
            </p>
          </div>

          {/* Current Utilization */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Utilization
            </label>
            
            <div className="flex items-center h-10 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg">
              <span className={`font-medium ${getUtilizationColor(formData.utilization)}`}>
                {formData.utilization}%
              </span>
              <div className="ml-3 flex-1 bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    formData.utilization >= 85 ? 'bg-red-500' :
                    formData.utilization >= 70 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(formData.utilization, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Optional Password Reset */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Password (Optional)
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.newPassword}
                onChange={(e) => handleInputChange('newPassword', e.target.value)}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0f2c59] focus:border-transparent"
                placeholder="Leave blank to keep current password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
            <button
              type="submit"
              disabled={isSubmitting || formData.transportationType.length === 0}
              className="bg-[#0f2c59] text-white px-6 py-2 rounded-lg hover:bg-[#1a3a6b] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Updating...' : 'Update Therapist'}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
} 