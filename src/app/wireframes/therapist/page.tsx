'use client';

import React from 'react';
import WireframeLayout from '@/components/WireframeLayout';
import AnnouncementBanner from '@/components/AnnouncementBanner';

export default function TherapistDashboardDemo() {
  // Custom navigation items for the therapist view
  const customNavItems = [
    { label: 'Dashboard', href: '#', isActive: false },
    { label: 'Therapist', href: '/wireframes/therapist', isActive: true },
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
      username="Andreas Rosky"
      userInitials="AR"
      customNavItems={customNavItems}
    >
      {/* Announcement Banner */}
      <AnnouncementBanner className="mb-0" />

      {/* Main Content - Therapist Dashboard Screenshot */}
      <div className="bg-white min-h-screen">
        <div className="relative">
          {/* Header matching the screenshot */}
          <div className="bg-white p-6 border-b border-gray-200">
            <div className="mb-2">
              <p className="text-gray-600 text-sm">Hello Andreas Rosky, I hope you have a wonderful day.</p>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-8">Therapist Data Overview</h1>
            
            {/* Tabs */}
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8">
                <button className="py-2 px-1 border-b-2 border-blue-500 text-blue-600 font-medium text-sm">
                  Open Prescription (71)
                </button>
                <button className="py-2 px-1 text-gray-500 hover:text-gray-700 font-medium text-sm">
                  Closed Prescription (90)
                </button>
                <button className="py-2 px-1 text-gray-500 hover:text-gray-700 font-medium text-sm">
                  Calendar
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
                  <option>ECH</option>
                </select>
              </div>
              <div className="flex items-center">
                <input 
                  type="text" 
                  placeholder="Search Patient" 
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Einrichtung</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tage s.l. Beh.</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Beh. b.d.W</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Organizer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">VO Nr.</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Heilmittel</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Beh. Status (#/#)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doppel-Beh.</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Frequenz</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doku</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {/* Sample rows from the screenshot */}
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap"><input type="checkbox" className="rounded" /></td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Margot Andresen</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    Hauptstadtpflege Haus Dr. Hermann-Kantorowicz
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">13</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">0</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <select className="border border-gray-300 rounded text-sm px-2 py-1">
                      <option>Select</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">2755-5</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">KG-H</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">4 / 10</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Nein</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">1-2</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button className="bg-gray-100 p-2 rounded">📄</button>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap"><input type="checkbox" className="rounded" /></td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Ilse Aust</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    Vivantes HSP Haus Ernst Hoppe
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">14</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">0</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <select className="border border-gray-300 rounded text-sm px-2 py-1">
                      <option>Select</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">2073-10</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">KG-H</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">4 / 10</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Nein</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"></td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button className="bg-gray-100 p-2 rounded">📄</button>
                  </td>
                </tr>
                {/* Add more rows as needed */}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </WireframeLayout>
  );
} 