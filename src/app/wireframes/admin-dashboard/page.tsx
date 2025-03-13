'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import WireframeLayout from '@/components/WireframeLayout';

type PrescriptionRequest = {
  id: number;
  requestNumber: string;
  patientName: string;
  therapistName: string;
  doctorName: string;
  facilityName: string;
  issueDate: string;
  treatmentCount: string;
  notes?: string;
  urgent?: boolean;
};

export default function AdminDashboardWireframe() {
  const [activeTab, setActiveTab] = useState('check');
  const [dropdownOpen, setDropdownOpen] = useState(true);
  
  // Sample data for prescription requests
  const prescriptionRequests: PrescriptionRequest[] = [
    { 
      id: 1, 
      requestNumber: '#12345', 
      patientName: 'Schmidt, Maria', 
      therapistName: 'Müller, Thomas',
      doctorName: 'Dr. Hoffmann',
      facilityName: 'Sunshine Senior Home',
      issueDate: 'mm-dd-yyyy', 
      treatmentCount: '[#] / [#]'
    },
    { 
      id: 2, 
      requestNumber: '#12346', 
      patientName: 'Weber, Klaus', 
      therapistName: 'Müller, Thomas',
      doctorName: 'Dr. Bauer',
      facilityName: 'Park House',
      issueDate: 'mm-dd-yyyy', 
      treatmentCount: '[#] / [#]' 
    },
    { 
      id: 3, 
      requestNumber: '#12347', 
      patientName: 'Müller, Hans', 
      therapistName: 'Schmidt, Julia',
      doctorName: 'Dr. Schneider',
      facilityName: 'Sunshine Senior Home',
      issueDate: 'mm-dd-yyyy', 
      treatmentCount: '[#] / [#]' 
    },
    { 
      id: 4, 
      requestNumber: '#12348', 
      patientName: 'Becker, Anna', 
      therapistName: 'Schmidt, Julia',
      doctorName: 'Dr. Bauer',
      facilityName: 'Park House',
      issueDate: 'mm-dd-yyyy', 
      treatmentCount: '[#] / [#]' 
    },
    { 
      id: 5, 
      requestNumber: '#12349', 
      patientName: 'Fischer, Thomas', 
      therapistName: 'Wagner, Stefan',
      doctorName: 'Dr. Hoffmann',
      facilityName: 'Lakeside Care',
      issueDate: 'mm-dd-yyyy', 
      treatmentCount: '[#] / [#]' 
    },
    { 
      id: 6, 
      requestNumber: '#12350', 
      patientName: 'Wagner, Elisabeth', 
      therapistName: 'Wagner, Stefan',
      doctorName: 'Dr. Schneider',
      facilityName: 'Lakeside Care',
      issueDate: 'mm-dd-yyyy', 
      treatmentCount: '[#] / [#]' 
    },
    { 
      id: 7, 
      requestNumber: '#12351', 
      patientName: 'Hoffmann, Peter', 
      therapistName: 'Klein, Sarah',
      doctorName: 'Dr. Müller',
      facilityName: 'Riverside Clinic',
      issueDate: 'mm-dd-yyyy', 
      treatmentCount: '[#] / [#]' 
    },
    { 
      id: 8, 
      requestNumber: '#12352', 
      patientName: 'Schwarz, Elisabeth', 
      therapistName: 'Klein, Sarah',
      doctorName: 'Dr. Müller',
      facilityName: 'Riverside Clinic',
      issueDate: 'mm-dd-yyyy', 
      treatmentCount: '[#] / [#]' 
    },
    { 
      id: 9, 
      requestNumber: '#12353', 
      patientName: 'Braun, Michael', 
      therapistName: 'Klein, Sarah',
      doctorName: 'Dr. Hoffmann',
      facilityName: 'Sunshine Senior Home',
      issueDate: 'mm-dd-yyyy', 
      treatmentCount: '[#] / [#]' 
    },
    { 
      id: 10, 
      requestNumber: '#12354', 
      patientName: 'Wolf, Christina', 
      therapistName: 'Klein, Sarah',
      doctorName: 'Dr. Schneider',
      facilityName: 'Lakeside Care',
      issueDate: 'mm-dd-yyyy', 
      treatmentCount: '[#] / [#]' 
    },
  ];

  // Toggle dropdown menu
  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  // Handle adding a note to a request
  const handleAddNote = (id: number) => {
    console.log(`Add note to request ${id}`);
  };

  return (
    <WireframeLayout title="Therapios" username="Admin Admin" userInitials="AA" showSidebar={false}>
      <div className="max-w-full mx-auto p-6">
        {/* Page Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Dashboard - Administration</h1>
          <div className="flex items-center">
            <button className="flex items-center bg-white border border-gray-300 rounded px-3 py-1 text-sm">
              All-Time
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 border border-gray-200 rounded-md shadow-sm">
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full bg-red-500 mr-2"></div>
              <span className="text-sm text-gray-600">Prescriptions to Order</span>
            </div>
            <div className="text-3xl font-bold mt-2">123</div>
          </div>
          
          <div className="bg-white p-4 border border-gray-200 rounded-md shadow-sm">
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full bg-amber-500 mr-2"></div>
              <span className="text-sm text-gray-600">Ordered Prescriptions</span>
            </div>
            <div className="text-3xl font-bold mt-2">12,313</div>
          </div>
          
          <div className="bg-white p-4 border border-gray-200 rounded-md shadow-sm">
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full bg-green-500 mr-2"></div>
              <span className="text-sm text-gray-600">Prescriptions {`>`} 10 Days in Ordered Status</span>
            </div>
            <div className="text-3xl font-bold mt-2">1,451,124</div>
          </div>
          
          <div className="bg-white p-4 border border-gray-200 rounded-md shadow-sm">
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full bg-blue-500 mr-2"></div>
              <span className="text-sm text-gray-600">Prescriptions Ending at Quarter-End</span>
            </div>
            <div className="text-3xl font-bold mt-2">2,145,415</div>
          </div>
        </div>

        {/* Review Dropdown */}
        <div className="bg-white border border-gray-200 rounded-md shadow-sm mb-6">
          <div 
            className="flex items-center justify-between p-3 cursor-pointer"
            onClick={toggleDropdown}
          >
            <div className="flex items-center">
              <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center text-white text-xs mr-2">10</div>
              <span className="font-medium">Review</span>
            </div>
            <svg 
              className={`w-5 h-5 transform ${dropdownOpen ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          
          {dropdownOpen && (
            <div className="p-3 border-t border-gray-200">
              <ul>
                <li className="flex items-center py-1">
                  <div className="w-6 h-6 rounded-full bg-gray-600 flex items-center justify-center text-white text-xs mr-2">5</div>
                  <span>Prescriptions with 1st treatment {`>`} 28d after issue date</span>
                </li>
                <li className="flex items-center py-1">
                  <div className="w-6 h-6 rounded-full bg-gray-600 flex items-center justify-center text-white text-xs mr-2">2</div>
                  <span>Prescriptions with last treatment {`>`} 21d</span>
                </li>
                <li className="flex items-center py-1">
                  <div className="w-6 h-6 rounded-full bg-gray-600 flex items-center justify-center text-white text-xs mr-2">3</div>
                  <span>Open prescriptions with issue date {`>`} 75d</span>
                </li>
                <li className="flex items-center py-1">
                  <div className="w-6 h-6 rounded-full bg-gray-600 flex items-center justify-center text-white text-xs mr-2">0</div>
                  <span>2 open prescriptions with treatments in same discipline for same patient</span>
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="bg-white border border-gray-200 rounded-md shadow-sm mb-6">
          <div className="relative overflow-x-auto">
            <div className="flex justify-end p-3">
              <div className="relative">
                <input 
                  type="text" 
                  className="pl-8 pr-3 py-1.5 border border-gray-300 rounded w-64 text-sm"
                  placeholder="Search"
                />
                <div className="absolute left-2 top-1/2 transform -translate-y-1/2">
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>
            
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-3 border-b border-gray-200 font-medium text-gray-500">
                    <div className="flex items-center">
                      Current Prescription (No.)
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                      </svg>
                    </div>
                  </th>
                  <th className="p-3 border-b border-gray-200 font-medium text-gray-500">
                    <div className="flex items-center">
                      Issue Date
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                      </svg>
                    </div>
                  </th>
                  <th className="p-3 border-b border-gray-200 font-medium text-gray-500">
                    <div className="flex items-center">
                      Treatment #/#
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                      </svg>
                    </div>
                  </th>
                  <th className="p-3 border-b border-gray-200 font-medium text-gray-500">
                    <div className="flex items-center">
                      Doctor
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                      </svg>
                    </div>
                  </th>
                  <th className="p-3 border-b border-gray-200 font-medium text-gray-500">
                    <div className="flex items-center">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                      </svg>
                    </div>
                  </th>
                  <th className="p-3 border-b border-gray-200 font-medium text-gray-500">Comments</th>
                </tr>
              </thead>
              <tbody>
                {prescriptionRequests.map((request, index) => (
                  <tr key={request.id} className={index % 2 === 1 ? "bg-gray-50" : ""}>
                    <td className="p-3 border-b border-gray-200">{request.requestNumber}</td>
                    <td className="p-3 border-b border-gray-200">{request.issueDate}</td>
                    <td className="p-3 border-b border-gray-200">{request.treatmentCount}</td>
                    <td className="p-3 border-b border-gray-200">[Name]</td>
                    <td className="p-3 border-b border-gray-200">
                      <div className="flex items-center justify-center">
                        <button className="p-1 rounded-full hover:bg-gray-200">
                          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                          </svg>
                        </button>
                      </div>
                    </td>
                    <td className="p-3 border-b border-gray-200">
                      <button 
                        className="text-blue-600 flex items-center"
                        onClick={() => handleAddNote(request.id)}
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                        Add Note
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          <div className="p-3 border-t border-gray-200 flex justify-end">
            <div className="flex items-center">
              <button className="px-3 py-1 border border-gray-300 rounded-l-md bg-white text-sm">Previous</button>
              <button className="px-3 py-1 border-t border-b border-gray-300 bg-white text-blue-600 text-sm">1</button>
              <button className="px-3 py-1 border-t border-b border-gray-300 bg-white text-sm">2</button>
              <button className="px-3 py-1 border border-gray-300 bg-white text-sm">...</button>
              <button className="px-3 py-1 border border-gray-300 rounded-r-md bg-white text-sm">Next</button>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <Link href="/wireframes" className="text-blue-600 hover:underline text-sm">
            Back to Wireframes
          </Link>
        </div>
      </div>
    </WireframeLayout>
  );
} 