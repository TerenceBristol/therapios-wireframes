'use client';

import { useState, useCallback, useEffect } from 'react';

export type AnnouncementType = 'feature' | 'technical' | 'company' | 'general';

export interface Announcement {
  id: string;
  isActive: boolean;
  type: AnnouncementType;
  message: string;
  expiryType: 'never' | 'time-based';
  expiryDuration?: number;
  expiryUnit?: 'hours' | 'days';
  createdAt: Date;
  expiresAt?: Date;
}

// Session storage key
const ANNOUNCEMENTS_STORAGE_KEY = 'therapios_announcements';
const DISMISSED_STORAGE_KEY = 'therapios_dismissed_announcements';

export const useAnnouncements = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [dismissedAnnouncements, setDismissedAnnouncements] = useState<Set<string>>(new Set());

  // Load announcements from session storage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = sessionStorage.getItem(ANNOUNCEMENTS_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          // Convert date strings back to Date objects
          const announcements = parsed.map((ann: any) => ({
            ...ann,
            createdAt: new Date(ann.createdAt),
            expiresAt: ann.expiresAt ? new Date(ann.expiresAt) : undefined
          }));
          setAnnouncements(announcements);
        }

        const dismissedStored = sessionStorage.getItem(DISMISSED_STORAGE_KEY);
        if (dismissedStored) {
          setDismissedAnnouncements(new Set(JSON.parse(dismissedStored)));
        }
      } catch (error) {
        console.error('Error loading announcements from storage:', error);
      }
    }
  }, []);

  // Save announcements to session storage
  const saveToStorage = useCallback((announcements: Announcement[]) => {
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem(ANNOUNCEMENTS_STORAGE_KEY, JSON.stringify(announcements));
      } catch (error) {
        console.error('Error saving announcements to storage:', error);
      }
    }
  }, []);

  // Save dismissed announcements to session storage
  const saveDismissedToStorage = useCallback((dismissed: Set<string>) => {
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem(DISMISSED_STORAGE_KEY, JSON.stringify(Array.from(dismissed)));
      } catch (error) {
        console.error('Error saving dismissed announcements to storage:', error);
      }
    }
  }, []);

  // Check if announcements have expired and update them
  const checkExpiry = useCallback(() => {
    try {
      const now = new Date();
      let hasChanges = false;
      const cutoffDate = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 24 hours ago

      const updatedAnnouncements = announcements.reduce((acc, announcement) => {
        // Skip announcements with invalid dates
        if (announcement.expiresAt && isNaN(announcement.expiresAt.getTime())) {
          console.warn(`Invalid expiry date for announcement ${announcement.id}`);
          return acc;
        }

        // Check if announcement has expired
        if (
          announcement.isActive && 
          announcement.expiryType === 'time-based' && 
          announcement.expiresAt && 
          now >= announcement.expiresAt
        ) {
          hasChanges = true;
          acc.push({ ...announcement, isActive: false });
        } 
        // Clean up expired announcements that are older than 24 hours
        else if (
          !announcement.isActive && 
          announcement.expiresAt && 
          announcement.expiresAt < cutoffDate
        ) {
          hasChanges = true;
          // Don't add to acc - this removes it from the array
        } 
        else {
          acc.push(announcement);
        }
        
        return acc;
      }, [] as Announcement[]);

      if (hasChanges) {
        setAnnouncements(updatedAnnouncements);
        saveToStorage(updatedAnnouncements);
      }
    } catch (error) {
      console.error('Error during expiry check:', error);
    }
  }, [announcements, saveToStorage]);

  // Run expiry check periodically - optimize frequency based on content
  useEffect(() => {
    // Check if we have any active time-based announcements
    const hasActiveTimeBased = announcements.some(
      ann => ann.isActive && ann.expiryType === 'time-based' && ann.expiresAt
    );

    if (!hasActiveTimeBased) {
      // No active time-based announcements, check less frequently
      const interval = setInterval(checkExpiry, 300000); // Check every 5 minutes
      return () => clearInterval(interval);
    }

    // Find the next expiry time to optimize check frequency
    const nextExpiry = announcements
      .filter(ann => ann.isActive && ann.expiryType === 'time-based' && ann.expiresAt)
      .map(ann => ann.expiresAt!)
      .sort((a, b) => a.getTime() - b.getTime())[0];

    if (nextExpiry) {
      const now = new Date();
      const timeUntilExpiry = nextExpiry.getTime() - now.getTime();
      
      // If expiry is within 1 hour, check every minute
      // If expiry is within 1 day, check every 15 minutes
      // Otherwise, check every hour
      let checkInterval: number;
      if (timeUntilExpiry <= 60 * 60 * 1000) { // 1 hour
        checkInterval = 60000; // 1 minute
      } else if (timeUntilExpiry <= 24 * 60 * 60 * 1000) { // 1 day
        checkInterval = 900000; // 15 minutes
      } else {
        checkInterval = 3600000; // 1 hour
      }

      const interval = setInterval(checkExpiry, checkInterval);
      return () => clearInterval(interval);
    }

    // Fallback to default interval
    const interval = setInterval(checkExpiry, 60000);
    return () => clearInterval(interval);
  }, [checkExpiry, announcements]);

  // Create or update an announcement
  const saveAnnouncement = useCallback((announcementData: Omit<Announcement, 'id' | 'createdAt' | 'expiresAt'>) => {
    try {
      // Validation
      if (!announcementData.message || announcementData.message.trim().length === 0) {
        throw new Error('Announcement message cannot be empty');
      }
      
      if (announcementData.message.length > 300) {
        throw new Error('Announcement message cannot exceed 300 characters');
      }

      if (!['feature', 'technical', 'company', 'general'].includes(announcementData.type)) {
        throw new Error('Invalid announcement type');
      }

      const now = new Date();
      let expiresAt: Date | undefined;

      if (announcementData.expiryType === 'time-based') {
        if (!announcementData.expiryDuration || !announcementData.expiryUnit) {
          throw new Error('Duration and unit are required for time-based expiry');
        }

        if (announcementData.expiryDuration <= 0) {
          throw new Error('Expiry duration must be greater than 0');
        }

        if (announcementData.expiryDuration > 365 && announcementData.expiryUnit === 'days') {
          throw new Error('Expiry duration cannot exceed 365 days');
        }

        if (announcementData.expiryDuration > 8760 && announcementData.expiryUnit === 'hours') {
          throw new Error('Expiry duration cannot exceed 8760 hours (1 year)');
        }

        expiresAt = new Date(now);
        if (announcementData.expiryUnit === 'hours') {
          expiresAt.setHours(expiresAt.getHours() + announcementData.expiryDuration);
        } else if (announcementData.expiryUnit === 'days') {
          expiresAt.setDate(expiresAt.getDate() + announcementData.expiryDuration);
        }

        // Validate the calculated expiry date
        if (expiresAt <= now) {
          throw new Error('Expiry date cannot be in the past');
        }
      }

      const newAnnouncement: Announcement = {
        ...announcementData,
        id: `ann_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: now,
        expiresAt
      };

      const updatedAnnouncements = [...announcements, newAnnouncement];
      setAnnouncements(updatedAnnouncements);
      saveToStorage(updatedAnnouncements);

      return newAnnouncement;
    } catch (error) {
      console.error('Error saving announcement:', error);
      throw error; // Re-throw to allow UI to handle the error
    }
  }, [announcements, saveToStorage]);

  // Update an existing announcement
  const updateAnnouncement = useCallback((id: string, updates: Partial<Announcement>) => {
    const updatedAnnouncements = announcements.map(ann => 
      ann.id === id ? { ...ann, ...updates } : ann
    );
    setAnnouncements(updatedAnnouncements);
    saveToStorage(updatedAnnouncements);
  }, [announcements, saveToStorage]);

  // Delete an announcement
  const deleteAnnouncement = useCallback((id: string) => {
    const updatedAnnouncements = announcements.filter(ann => ann.id !== id);
    setAnnouncements(updatedAnnouncements);
    saveToStorage(updatedAnnouncements);
  }, [announcements, saveToStorage]);

  // Get active announcements that haven't been dismissed
  const getActiveAnnouncements = useCallback(() => {
    const now = new Date();
    return announcements.filter(announcement => 
      announcement.isActive && 
      !dismissedAnnouncements.has(announcement.id) &&
      (announcement.expiryType === 'never' || !announcement.expiresAt || now < announcement.expiresAt)
    );
  }, [announcements, dismissedAnnouncements]);

  // Dismiss an announcement
  const dismissAnnouncement = useCallback((id: string) => {
    const newDismissed = new Set(dismissedAnnouncements.add(id));
    setDismissedAnnouncements(newDismissed);
    saveDismissedToStorage(newDismissed);
  }, [dismissedAnnouncements, saveDismissedToStorage]);

  // Get announcement type configurations
  const getAnnouncementTypeConfig = useCallback((type: AnnouncementType) => {
    const configs = {
      feature: {
        label: 'New Feature',
        bgColor: 'bg-blue-100',
        textColor: 'text-blue-800',
        borderColor: 'border-blue-200',
        icon: '⭐'
      },
      technical: {
        label: 'Technical Issue',
        bgColor: 'bg-red-100',
        textColor: 'text-red-800',
        borderColor: 'border-red-200',
        icon: '⚠️'
      },
      company: {
        label: 'Company Announcement',
        bgColor: 'bg-green-100',
        textColor: 'text-green-800',
        borderColor: 'border-green-200',
        icon: '🏢'
      },
      general: {
        label: 'General Announcement',
        bgColor: 'bg-gray-100',
        textColor: 'text-gray-800',
        borderColor: 'border-gray-200',
        icon: '📢'
      }
    };
    return configs[type];
  }, []);

  // Manual expiry check (for immediate updates)
  const forceExpiryCheck = useCallback(() => {
    checkExpiry();
  }, [checkExpiry]);

  // Get announcement statistics
  const getAnnouncementStats = useCallback(() => {
    const active = announcements.filter(ann => ann.isActive).length;
    const expired = announcements.filter(ann => !ann.isActive && ann.expiresAt).length;
    const timeBased = announcements.filter(ann => ann.expiryType === 'time-based').length;
    const dismissed = dismissedAnnouncements.size;
    
    return {
      total: announcements.length,
      active,
      expired,
      timeBased,
      dismissed
    };
  }, [announcements, dismissedAnnouncements]);

  // Get next expiry time
  const getNextExpiryTime = useCallback(() => {
    const nextExpiry = announcements
      .filter(ann => ann.isActive && ann.expiryType === 'time-based' && ann.expiresAt)
      .map(ann => ann.expiresAt!)
      .sort((a, b) => a.getTime() - b.getTime())[0];
      
    return nextExpiry || null;
  }, [announcements]);

  // Clear all dismissed announcements (for session reset)
  const clearDismissed = useCallback(() => {
    setDismissedAnnouncements(new Set());
    saveDismissedToStorage(new Set());
  }, [saveDismissedToStorage]);

  // Cleanup expired announcements manually
  const cleanupExpired = useCallback(() => {
    const cutoffDate = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago
    const cleanedAnnouncements = announcements.filter(announcement => 
      announcement.isActive || 
      !announcement.expiresAt || 
      announcement.expiresAt >= cutoffDate
    );

    if (cleanedAnnouncements.length !== announcements.length) {
      setAnnouncements(cleanedAnnouncements);
      saveToStorage(cleanedAnnouncements);
      return announcements.length - cleanedAnnouncements.length;
    }
    return 0;
  }, [announcements, saveToStorage]);

  // Validate announcement data
  const validateAnnouncement = useCallback((data: Partial<Announcement>) => {
    const errors: string[] = [];

    if (data.message !== undefined) {
      if (!data.message || data.message.trim().length === 0) {
        errors.push('Message cannot be empty');
      } else if (data.message.length > 300) {
        errors.push('Message cannot exceed 300 characters');
      }
    }

    if (data.type && !['feature', 'technical', 'company', 'general'].includes(data.type)) {
      errors.push('Invalid announcement type');
    }

    if (data.expiryType === 'time-based') {
      if (!data.expiryDuration || data.expiryDuration <= 0) {
        errors.push('Duration must be greater than 0 for time-based expiry');
      }
      if (!data.expiryUnit) {
        errors.push('Unit is required for time-based expiry');
      }
    }

    return errors;
  }, []);

  return {
    announcements,
    saveAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    getActiveAnnouncements,
    dismissAnnouncement,
    getAnnouncementTypeConfig,
    forceExpiryCheck,
    getAnnouncementStats,
    getNextExpiryTime,
    clearDismissed,
    cleanupExpired,
    validateAnnouncement
  };
};