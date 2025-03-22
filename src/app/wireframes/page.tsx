import React from 'react';
import Link from 'next/link';
import WireframeLayout from '@/components/WireframeLayout';
import WireframeBox from '@/components/WireframeBox';
import WireframeThumbnail from '@/components/WireframeThumbnail';

export default function WireframesPage() {
  // Sample wireframe data - this would be expanded as you create more wireframes
  const wireframes = [
    {
      id: 'dashboard',
      title: 'Therapios Dashboard',
      description: 'Main dashboard interface for therapists to manage their practice',
      imagePath: '/images/wireframes/dashboard-thumb.png',
      link: '/wireframes/dashboard'
    },
    {
      id: 'prescription-renewals',
      title: 'Prescription Renewals',
      description: 'Workflow for managing and processing prescription renewal requests',
      imagePath: '/images/wireframes/prescription-renewals-thumb.png',
      link: '/wireframes/prescription-renewals'
    },
    {
      id: 'admin-dashboard',
      title: 'Admin Dashboard',
      description: 'Administrative interface for managing system settings and users',
      imagePath: '/images/wireframes/admin-dashboard-thumb.png',
      link: '/wireframes/admin-dashboard'
    },
    {
      id: 'treatment-documentation',
      title: 'Treatment Documentation',
      description: 'Interface for documenting patient treatment sessions and progress',
      imagePath: '/images/wireframes/treatment-documentation-thumb.png',
      link: '/wireframes/treatment-documentation'
    },
  ];

  return (
    <WireframeLayout title="Therapios" username="User Therapist" userInitials="UT" showSidebar={false}>
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2 text-[#0f2c59]">Therapios Wireframes</h1>
          <p className="text-gray-800">
            Interactive feature wireframes for Therapios.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {wireframes.map((wireframe) => (
            <WireframeThumbnail
              key={wireframe.title}
              {...wireframe}
            />
          ))}
        </div>
      </div>
    </WireframeLayout>
  );
} 