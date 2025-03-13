import React from 'react';
import Link from 'next/link';
import WireframeLayout from '@/components/WireframeLayout';
import WireframeBox from '@/components/WireframeBox';

export default function WireframesPage() {
  // Sample wireframe data - this would be expanded as you create more wireframes
  const wireframes = [
    {
      id: 'dashboard',
      title: 'Therapios Dashboard',
      description: 'Main dashboard wireframe based on the Therapios design',
      path: '/wireframes/dashboard',
    },
    {
      id: 'prescription-renewals',
      title: 'Prescription Renewals',
      description: 'Interactive dashboard with notification panel for prescription renewals',
      path: '/wireframes/prescription-renewals',
      interactive: true
    },
    {
      id: 'admin-dashboard',
      title: 'Admin Dashboard (English)',
      description: 'Administration dashboard for managing prescription requests',
      path: '/wireframes/admin-dashboard',
      interactive: true
    },
    {
      id: 'treatment-documentation',
      title: 'Treatment Documentation',
      description: 'Interactive feature for documenting patient treatments',
      path: '/wireframes/treatment-documentation',
      interactive: true
    },
    // Add more wireframes as you create them
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

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {wireframes.map((wireframe) => (
            <Link 
              href={wireframe.path} 
              key={wireframe.id}
              className="block"
            >
              <div className="bg-white border border-gray-300 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                <div className="h-40 bg-gray-100 border-b border-gray-300 flex items-center justify-center relative">
                  <WireframeBox 
                    height="h-32" 
                    width="w-3/4" 
                    label={wireframe.title} 
                    className={
                      wireframe.id === 'dashboard' ? "bg-[#f5f7fa] border-[#0f2c59]" : 
                      wireframe.id === 'prescription-renewals' ? "bg-[#f5f7fa] border-[#0f2c59]" : 
                      wireframe.id === 'admin-dashboard' ? "bg-[#f5f7fa] border-[#0f2c59]" : 
                      wireframe.id === 'treatment-documentation' ? "bg-[#f5f7fa] border-[#0f2c59]" : ""
                    } 
                  />
                  {wireframe.interactive && (
                    <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                      Interactive
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-medium mb-1 text-gray-900">{wireframe.title}</h3>
                  <p className="text-sm text-gray-800">{wireframe.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </WireframeLayout>
  );
} 