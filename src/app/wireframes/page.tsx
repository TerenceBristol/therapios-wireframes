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
    },
    {
      id: 'treatment-rejection-termination',
      title: 'Treatment Rejection and Termination',
      description: 'Wireframe for handling treatment rejection and termination processes.',
      imagePath: '/images/wireframes/treatment-documentation-thumb.png',
      link: '/wireframes/treatment-rejection-termination'
    },
    {
      id: 'clean-up-dashboard',
      title: 'Clean Up Dashboard',
      description: 'New dashboard wireframe for cleaning up data.',
      imagePath: '/images/wireframes/dashboard-thumb.png',
      link: '/wireframes/clean-up-dashboard'
    },
    {
      id: 'blanko-vos-arztbericht',
      title: 'Blanko VOs',
      description: 'Copy of treatment rejection and termination wireframe for VOs and medical reports.',
      imagePath: '/images/wireframes/treatment-documentation-thumb.png',
      link: '/wireframes/drafts/blanko-vos-arztbericht'
    },
    {
      id: 'arztbericht',
      title: 'Arztbericht',
      description: 'Admin dashboard for managing therapy reports that need to be sent to doctors.',
      imagePath: '/images/wireframes/dashboard-thumb.png',
      link: '/wireframes/drafts/arztbericht'
    }
  ];

  const draftWireframes = [
    {
      id: 'ech-resource-management',
      title: 'ECH & Resource Management',
      description: 'Manage therapist assignments to Elderly Care Homes (ECH) with location-based resource allocation.',
      imagePath: '/images/wireframes/dashboard-thumb.png',
      link: '/wireframes/ech-resource-management'
    },
    {
      id: 'therapist-vo-renewal-termination',
      title: 'Therapist VO Renewal & Termination',
      description: 'Wireframe for managing VO renewals and terminations.',
      imagePath: '/images/wireframes/dashboard-thumb.png', // Placeholder image
      link: '/wireframes/therapist-vo-renewal-termination'
    },
    {
      id: 'patient-transfer',
      title: 'Patient Transfer',
      description: 'Wireframe for patient transfer functionality with non-functional VO management buttons.',
      imagePath: '/images/wireframes/treatment-documentation-thumb.png',
      link: '/wireframes/drafts/patient-transfer'
    },
    {
      id: 'admin-vo-transfers',
      title: 'Admin VO Transfers',
      description: 'Admin dashboard for managing and confirming VO transfers with status tracking and filtering.',
      imagePath: '/images/wireframes/admin-dashboard-thumb.png',
      link: '/wireframes/drafts/admin-vo-transfers'
    },
    {
      id: 'doppel-beh',
      title: 'Doppel Beh',
      description: 'Copy of the treatment rejection and termination wireframe for testing and comparison purposes.',
      imagePath: '/images/wireframes/treatment-documentation-thumb.png',
      link: '/wireframes/drafts/doppel-beh'
    },
    {
      id: 'announcements',
      title: 'Announcements',
      description: 'Wireframe demonstrating navigation menu structure with admin dashboard layout.',
      imagePath: '/images/wireframes/admin-dashboard-thumb.png',
      link: '/wireframes/drafts/announcements'
    },
    {
      id: 'vo-sharing',
      title: 'VO Sharing',
      description: 'Wireframe for VO sharing functionality with therapist assignment and management features.',
      imagePath: '/images/wireframes/treatment-documentation-thumb.png',
      link: '/wireframes/drafts/vo-sharing'
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