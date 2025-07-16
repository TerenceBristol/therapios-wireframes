'use client';

import React from 'react';
import WireframeLayout from '@/components/WireframeLayout';
import AnnouncementBanner from '@/components/AnnouncementBanner';

export default function PatientsDemo() {
  // Custom navigation items for the patients view
  const customNavItems = [
    { label: 'Dashboard', href: '#', isActive: false },
    { label: 'Therapist', href: '/wireframes/therapist', isActive: false },
    { label: 'Patients', href: '/wireframes/patients', isActive: true },
    { label: 'Reports', href: '#', isActive: false },
    { label: 'Upload Data', href: '#', isActive: false },
    { label: 'Knowledge Center', href: '#', isActive: false },
    { 
      label: 'Admin', 
      href: '#', 
      isActive: false,
      dropdown: [
        { label: 'Announcements', href: '/wireframes/drafts/announcements' }
      ]
    },
    { label: 'KPI Dashboard', href: '#', isActive: false },
  ];

  return (
    <WireframeLayout 
      title="Therapios"
      username="Super Admin"
      userInitials="SA"
      customNavItems={customNavItems}
    >
      {/* Announcement Banner */}
      <AnnouncementBanner className="mb-0" />

      {/* Main Content - Patient Management Demo */}
      <div className="bg-white min-h-screen">
        <div className="relative">
          {/* Header */}
          <div className="bg-white p-6 border-b border-gray-200">
            <div className="mb-2">
              <p className="text-gray-600 text-sm">Hello Super Admin, I hope you have a wonderful day.</p>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-8">Patient Management Overview</h1>
            
            {/* Tabs */}
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8">
                <button className="py-2 px-1 border-b-2 border-blue-500 text-blue-600 font-medium text-sm">
                  All Patients (184)
                </button>
                <button className="py-2 px-1 text-gray-500 hover:text-gray-700 font-medium text-sm">
                  Active Treatments (98)
                </button>
                <button className="py-2 px-1 text-gray-500 hover:text-gray-700 font-medium text-sm">
                  Pending Approval (12)
                </button>
              </nav>
            </div>
          </div>

          {/* Controls Row */}
          <div className="bg-white p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div className="flex space-x-4">
                <select className="border border-gray-300 rounded-md px-3 py-2 text-sm">
                  <option>Show columns</option>
                </select>
                <select className="border border-gray-300 rounded-md px-3 py-2 text-sm">
                  <option>Filter by Status</option>
                </select>
              </div>
              <div className="flex items-center space-x-4">
                <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700">
                  Add Patient
                </button>
                <input 
                  type="text" 
                  placeholder="Search Patients" 
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm w-64"
                />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input type="checkbox" className="rounded" />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date of Birth</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Treatment Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Facility</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Visit</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {/* Sample patient rows */}
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap"><input type="checkbox" className="rounded" /></td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">P-2755</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Margot Andresen</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">15.03.1958</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">KG-H</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    Hauptstadtpflege Haus Dr. Hermann-Kantorowicz
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Active
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">2024-12-15</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-900">View</button>
                      <button className="text-gray-600 hover:text-gray-900">Edit</button>
                    </div>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap"><input type="checkbox" className="rounded" /></td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">P-2073</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Ilse Aust</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">22.07.1965</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">KG-H</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    Vivantes HSP Haus Ernst Hoppe
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Active
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">2024-12-14</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-900">View</button>
                      <button className="text-gray-600 hover:text-gray-900">Edit</button>
                    </div>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap"><input type="checkbox" className="rounded" /></td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">P-2321</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Günter Bensch</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">08.11.1950</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">KG-H</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    Vivantes HSP Haus Ernst Hoppe
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                      Pending
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">2024-12-13</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-900">View</button>
                      <button className="text-gray-600 hover:text-gray-900">Edit</button>
                    </div>
                  </td>
                </tr>
                {/* More rows... */}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </WireframeLayout>
  );
} 