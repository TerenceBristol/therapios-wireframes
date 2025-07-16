"use client"

import { useAnnouncements } from '@/hooks/useAnnouncements';
import { Star, AlertTriangle, Building, Megaphone, X } from 'lucide-react';
import { useState, useEffect } from 'react';

type AnnouncementBannerProps = {
  className?: string;
};

const AnnouncementBanner: React.FC<AnnouncementBannerProps> = ({ className = "" }) => {
  const { announcements, dismissAnnouncement } = useAnnouncements();
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [visibleBanners, setVisibleBanners] = useState<string[]>([]);

  // Get active announcements that haven't been dismissed this session
  const activeAnnouncements = announcements.filter(
    announcement => announcement.isActive && !dismissedIds.has(announcement.id)
  );

  // Update visible banners when active announcements change
  useEffect(() => {
    const newVisibleIds = activeAnnouncements.map(a => a.id);
    setVisibleBanners(newVisibleIds);
  }, [activeAnnouncements.length]);

  // Handle dismiss with animation
  const handleDismiss = (id: string) => {
    // Remove from visible banners first for animation
    setVisibleBanners(prev => prev.filter(bannerId => bannerId !== id));
    
    // Add to dismissed set after animation delay
    setTimeout(() => {
      setDismissedIds(prev => new Set([...prev, id]));
    }, 300);
  };

  // Get announcement type configuration
  const getAnnouncementConfig = (type: string) => {
    switch (type) {
      case 'feature':
        return {
          icon: Star,
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-800',
          borderColor: 'border-blue-200',
          iconColor: 'text-blue-600'
        };
      case 'technical':
        return {
          icon: AlertTriangle,
          bgColor: 'bg-red-100',
          textColor: 'text-red-800',
          borderColor: 'border-red-200',
          iconColor: 'text-red-600'
        };
      case 'company':
        return {
          icon: Building,
          bgColor: 'bg-green-100',
          textColor: 'text-green-800',
          borderColor: 'border-green-200',
          iconColor: 'text-green-600'
        };
      case 'general':
      default:
        return {
          icon: Megaphone,
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-800',
          borderColor: 'border-gray-200',
          iconColor: 'text-gray-600'
        };
    }
  };

  // Get formatted type label
  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'feature':
        return 'New Feature';
      case 'technical':
        return 'Technical Issue';
      case 'company':
        return 'Company';
      case 'general':
      default:
        return 'General';
    }
  };

  // Don't render anything if no active announcements
  if (activeAnnouncements.length === 0) {
    return null;
  }

  return (
    <div className={`w-full space-y-2 ${className}`}>
      {activeAnnouncements.map((announcement) => {
        const config = getAnnouncementConfig(announcement.type);
        const Icon = config.icon;
        const isVisible = visibleBanners.includes(announcement.id);

        return (
          <div
            key={announcement.id}
            className={`
              relative w-full border-l-4 p-4 pr-12 shadow-sm transition-all duration-300 ease-in-out
              ${config.bgColor} ${config.textColor} ${config.borderColor}
              ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}
            `}
            style={{
              transform: isVisible ? 'translateY(0)' : 'translateY(-8px)',
            }}
          >
            <div className="flex items-start space-x-3">
              {/* Icon */}
              <Icon className={`h-5 w-5 mt-0.5 flex-shrink-0 ${config.iconColor}`} />
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                {/* Type Badge */}
                <div className="flex items-center space-x-2 mb-1">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.bgColor} ${config.textColor} border ${config.borderColor}`}>
                    {getTypeLabel(announcement.type)}
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

            {/* Dismiss Button */}
            <button
              onClick={() => handleDismiss(announcement.id)}
              className={`
                absolute top-4 right-4 p-1 rounded-full transition-colors duration-200
                ${config.textColor} hover:bg-black hover:bg-opacity-10 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-current
              `}
              aria-label="Dismiss announcement"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default AnnouncementBanner; 