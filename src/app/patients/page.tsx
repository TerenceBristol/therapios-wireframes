'use client';

import React from 'react';
import WireframeLayout from '@/components/WireframeLayout';

// Define the patient data type for this page
type PatientDisplay = {
  id: string; 
  name: string;
  status: 'Active' | 'Inactive';
};

export default function PatientOverviewPage() {
  // Combined patient data from active and inactive lists
  const allPatients: PatientDisplay[] = [
    // Active Patients (from treatment-rejection-termination page data)
    { id: 'P1', name: 'John Smith', status: 'Active' },
    { id: 'P2', name: 'Emma Johnson', status: 'Active' },
    { id: 'P3', name: 'Michael Williams', status: 'Active' },
    { id: 'P4', name: 'Patricia Brown', status: 'Active' },
    { id: 'P5', name: 'Thomas Miller', status: 'Active' },
    // Inactive Patients (from treatment-rejection-termination page data)
    { id: 'P6', name: 'Alice Brown', status: 'Inactive' },
    { id: 'P7', name: 'Robert Green', status: 'Inactive' },
    { id: 'P8', name: 'Julia White', status: 'Inactive' },
  ];

  return (
    <WireframeLayout title="Patient Overview" username="User Therapist" userInitials="UT" showSidebar={false}>
      <div className="p-4 md:p-8">
        <h1 className="text-2xl font-semibold mb-6 text-gray-800">Patient Overview</h1>
        
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Patient ID
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Patient Name
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {allPatients.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">
                    No patients to display.
                  </td>
                </tr>
              ) : (
                allPatients.map((patient) => (
                  <tr key={patient.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {patient.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {patient.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          patient.status === 'Active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {patient.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </WireframeLayout>
  );
} 