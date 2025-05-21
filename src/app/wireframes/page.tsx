import React from 'react';
import Link from 'next/link';
import WireframeLayout from '@/components/WireframeLayout';
import WireframeBox from '@/components/WireframeBox';
import WireframeThumbnail from '@/components/WireframeThumbnail';

export default function WireframesPage() {
  // Wireframes organized into sections
  
  const finalWireframes = [
    {
      id: 'treatment-documentation-v2',
      title: 'Treatment Documentation V2',
      description: 'Updated version of treatment documentation interface with enhancements',
      imagePath: '/images/wireframes/treatment-documentation-thumb.png',
      link: '/wireframes/treatment-documentation-v2'
    },
    {
      id: 'therapist-dashboard-tabs',
      title: 'Therapist Dashboard Tabs',
      description: 'Tabbed interface for therapist data management with patient overview',
      imagePath: '/images/wireframes/dashboard-thumb.png',
      link: '/wireframes/therapist-dashboard-tabs'
    },
    {
      id: 'vo-ordering-and-linking',
      title: 'Admin VO Management',
      description: 'Dashboard for managing patient prescriptions (VOs) status and follow-ups',
      imagePath: '/images/wireframes/dashboard-thumb.png',
      link: '/wireframes/vo-ordering-and-linking'
    },
    {
      id: 'kpi-dashboard',
      title: 'KPI Dashboard',
      description: 'Interactive dashboard showing Revenue, VOs, Treatment Time, and other KPIs',
      imagePath: '/images/wireframes/dashboard-thumb.png',
      link: '/wireframes/kpi-dashboard'
    }
  ];

  const draftWireframes = [
    {
      id: 'therapist-vo-renewal-termination',
      title: 'Therapist VO Renewal & Termination',
      description: 'Wireframe for managing VO renewals and terminations.',
      imagePath: '/images/wireframes/dashboard-thumb.png', // Placeholder image
      link: '/wireframes/therapist-vo-renewal-termination'
    },
    {
      id: 'clean-up-dashboard',
      title: 'Clean Up Dashboard',
      description: 'New dashboard wireframe for cleaning up data.', // Placeholder description
      imagePath: '/images/wireframes/dashboard-thumb.png', // Placeholder image
      link: '/wireframes/clean-up-dashboard' // Update link
    },
    {
      id: 'treatment-rejection-termination',
      title: 'Treatment Rejection and Termination',
      description: 'Wireframe for handling treatment rejection and termination processes.',
      imagePath: '/images/wireframes/treatment-documentation-thumb.png', // Using existing relevant thumbnail
      link: '/wireframes/drafts/treatment-rejection-termination'
    }
  ];

  // Removed wireframes:
  // - prescription-renewals
  // - treatment-documentation
  // - admin-patient-vo-ordering-v2

  return (
    <WireframeLayout title="Therapios" username="User Therapist" userInitials="UT" showSidebar={false}>
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2 text-[#0f2c59]">Therapios Wireframes</h1>
          <p className="text-gray-800">
            Interactive feature wireframes for Therapios.
          </p>
        </div>

        {/* Final Wireframes Section */}
        <div className="mb-10">
          <h2 className="text-xl font-bold mb-4 text-[#0f2c59] pb-2 border-b border-gray-200">
            Final Wireframes
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {finalWireframes.map((wireframe) => (
              <WireframeThumbnail
                key={wireframe.title}
                {...wireframe}
              />
            ))}
          </div>
        </div>

        {/* Draft Wireframes Section */}
        <div className="mb-10">
          <h2 className="text-xl font-bold mb-4 text-[#0f2c59] pb-2 border-b border-gray-200">
            Draft Wireframes
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {draftWireframes.map((wireframe) => (
              <WireframeThumbnail
                key={wireframe.title}
                {...wireframe}
              />
            ))}
          </div>
        </div>
      </div>
    </WireframeLayout>
  );
} 