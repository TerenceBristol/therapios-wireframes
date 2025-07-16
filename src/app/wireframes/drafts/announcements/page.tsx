'use client';

import React from 'react';
import WireframeLayout from '@/components/WireframeLayout';
import AnnouncementManager from '@/components/AnnouncementManager';

export default function AnnouncementsWireframe() {
  // Custom navigation items with Admin dropdown
  const customNavItems = [
    { label: 'Dashboard', href: '#', isActive: false, disabled: true },
    { label: 'Therapist', href: '/wireframes/therapist', isActive: false },
    { label: 'Patients', href: '/wireframes/patients', isActive: false, disabled: true },
    { label: 'Reports', href: '#', isActive: false, disabled: true },
    { label: 'Upload Data', href: '#', isActive: false, disabled: true },
    { label: 'Knowledge Center', href: '#', isActive: false, disabled: true },
    { 
      label: 'Admin', 
      href: '#', 
      isActive: true,
      dropdown: [
        { label: 'Team', href: '#', disabled: true },
        { label: 'ER', href: '#', disabled: true },
        { label: 'Announcements', href: '/wireframes/drafts/announcements' }
      ]
    },
    { label: 'KPI Dashboard', href: '#', isActive: false, disabled: true },
  ];

  return (
    <WireframeLayout 
      title="Therapios"
      username="Super Admin"
      userInitials="SA"
      customNavItems={customNavItems}
    >
      <div className="bg-gray-50 min-h-screen">
        <div className="py-8">
          <AnnouncementManager />
        </div>
      </div>
    </WireframeLayout>
  );
} 