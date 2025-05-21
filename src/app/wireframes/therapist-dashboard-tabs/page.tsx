'use client';

import React, { useState } from 'react';
import WireframeLayout from '@/components/WireframeLayout';

export default function TherapistDashboardTabsWireframe() {
  // State to track which prescription tab is active
  const [activeTab, setActiveTab] = useState<'open' | 'closed'>('open');

  // Dummy data for the therapist table based on the screenshot
  const patients = [
    { 
      id: 1, 
      name: 'Franz Abitz', 
      facility: 'FSE Pflegeeinrichtung Treptow / Johannisthal', 
      days: '-', 
      organizer: 'Select', 
      voNum: '4811-1', 
      voStatus: '-', 
      doctor: 'M. von Brevern', 
      frequency: '1-3', 
      adminStatus: 'Abgerechnet',
      adminDate: 'am 18.09.2024'
    },
    { 
      id: 2, 
      name: 'Franz Konig', 
      facility: 'FSE Pflegeeinrichtung Treptow / Johannisthal', 
      days: '-', 
      organizer: 'Select', 
      voNum: '2155-4', 
      voStatus: '-', 
      doctor: 'M. von Brevern', 
      frequency: '1-3', 
      adminStatus: 'Zu bestellen',
      adminDate: ''
    },
    { 
      id: 3, 
      name: 'Michael Schmidt', 
      facility: 'FSE Pflegeeinrichtung Treptow / Johannisthal', 
      days: '-', 
      organizer: 'Select', 
      voNum: '2155-5', 
      voStatus: '-', 
      doctor: 'M. von Brevern', 
      frequency: '1-3', 
      adminStatus: 'Abgeschlossen',
      adminDate: ''
    },
    { 
      id: 4, 
      name: 'Thomas Muller', 
      facility: 'FSE Pflegeeinrichtung Treptow / Johannisthal', 
      days: '-', 
      organizer: 'Select', 
      voNum: '2155-6', 
      voStatus: '-', 
      doctor: 'M. von Brevern', 
      frequency: '1-3', 
      adminStatus: 'In Behandlung',
      adminDate: ''
    },
    { 
      id: 5, 
      name: 'Wilhelm Adelgrund', 
      facility: 'FSE Pflegeeinrichtung Treptow / Johannisthal', 
      days: '-', 
      organizer: 'Select', 
      voNum: '2163-1', 
      voStatus: '-', 
      doctor: 'H. Vulturius', 
      frequency: '1-2', 
      adminStatus: 'In Behandlung',
      adminDate: ''
    },
    { 
      id: 6, 
      name: 'Rosemarie Affeldt', 
      facility: 'ProCurand Seniorenresidenz Bölschestraße', 
      days: '-', 
      organizer: 'Select', 
      voNum: '3163-1', 
      voStatus: '-', 
      doctor: 'W. Weihe', 
      frequency: '1-3', 
      adminStatus: 'Abgelehnt',
      adminDate: ''
    },
    { 
      id: 7, 
      name: 'Kerstin Allenstein', 
      facility: 'Senioren Centrum Haus Pappelhof gGmbH', 
      days: '-', 
      organizer: 'Select', 
      voNum: '2171-2', 
      voStatus: '-', 
      doctor: 'S. Vulturius-Pawlak', 
      frequency: '1', 
      adminStatus: 'Abgerechnet',
      adminDate: 'am 16.12.2024'
    },
    { 
      id: 8, 
      name: 'Heidi Weber', 
      facility: 'Senioren Centrum Haus Pappelhof gGmbH', 
      days: '-', 
      organizer: 'Select', 
      voNum: '2171-3', 
      voStatus: '-', 
      doctor: 'S. Vulturius-Pawlak', 
      frequency: '1', 
      adminStatus: 'Abgeschlossen',
      adminDate: ''
    },
    { 
      id: 9, 
      name: 'Dieter Fischer', 
      facility: 'Senioren Centrum Haus Pappelhof gGmbH', 
      days: '-', 
      organizer: 'Select', 
      voNum: '2171-4', 
      voStatus: '-', 
      doctor: 'S. Vulturius-Pawlak', 
      frequency: '1', 
      adminStatus: 'In Behandlung',
      adminDate: ''
    },
    { 
      id: 10, 
      name: 'Abida Amin', 
      facility: 'Senioren Centrum Haus Pappelhof gGmbH', 
      days: '-', 
      organizer: 'Select', 
      voNum: '2570-1', 
      voStatus: '-', 
      doctor: 'S. Ernst', 
      frequency: '1-2', 
      adminStatus: 'Neu ausstehend',
      adminDate: ''
    },
    { 
      id: 11, 
      name: 'Gerda Hoffmann', 
      facility: 'Senioren Centrum Haus Pappelhof gGmbH', 
      days: '-', 
      organizer: 'Select', 
      voNum: '2570-2', 
      voStatus: '-', 
      doctor: 'S. Ernst', 
      frequency: '1-2', 
      adminStatus: 'Bestellt',
      adminDate: ''
    },
    { 
      id: 12, 
      name: 'Doris Arndt', 
      facility: 'ProCurand Seniorenresidenz Bölschestraße', 
      days: '-', 
      organizer: 'Select', 
      voNum: '1739-10', 
      voStatus: '-', 
      doctor: 'W. Weihe', 
      frequency: '1-3', 
      adminStatus: 'Zu bestellen',
      adminDate: ''
    },
    { 
      id: 13, 
      name: 'Christian Balzer', 
      facility: 'FSE Pflegeeinrichtung Treptow / Johannisthal', 
      days: '-', 
      organizer: 'Select', 
      voNum: '3245-1', 
      voStatus: '-', 
      doctor: 'S. Vulturius-Pawlak', 
      frequency: '1', 
      adminStatus: 'Abgelehnt',
      adminDate: ''
    },
  ];

  // Filter patients based on active tab
  const filteredPatients = patients.filter(patient => {
    if (activeTab === 'open') {
      return ['Zu bestellen', 'Bestellt', 'In Behandlung'].includes(patient.adminStatus);
    } else if (activeTab === 'closed') {
      return ['Abgeschlossen', 'Abgelehnt'].includes(patient.adminStatus);
    }
    return false;
  });

  // Function to get the admin status color based on status
  const getAdminStatusColor = (status: string) => {
    switch (status) {
      case 'Bestellt':
        return 'text-orange-500';
      case 'In Behandlung':
        return 'text-green-500';
      case 'Abgeschlossen':
        return 'text-green-700';
      case 'Abgerechnet':
        return 'text-blue-400';
      case 'Abgelehnt':
        return 'text-gray-400';
      case 'Zu bestellen':
        return 'text-blue-700';
      case 'Neu ausstehend':
        return 'text-gray-400';
      default:
        return 'text-gray-700';
    }
  };

  return (
    <WireframeLayout title="Therapios" username="Super Admin" userInitials="SA">
      <div className="max-w-full mx-auto">
        <div className="mb-6">
          <p className="text-gray-600 mb-1">Hello Super Admin, I hope you have a wonderful day.</p>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Therapist Data Overview</h1>
          
          {/* Prescription Tabs */}
          <div className="mb-4">
            <div className="flex border-b border-gray-300">
              <button 
                className={`px-4 py-2 font-medium text-sm ${activeTab === 'open' 
                  ? 'border-b-2 border-blue-500 text-blue-600' 
                  : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setActiveTab('open')}
              >
                OPEN PRESCRIPTIONS
              </button>
              <button 
                className={`px-4 py-2 font-medium text-sm ${activeTab === 'closed' 
                  ? 'border-b-2 border-blue-500 text-blue-600' 
                  : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setActiveTab('closed')}
              >
                CLOSED PRESCRIPTIONS
              </button>
            </div>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="flex justify-between p-4 border-b border-gray-200">
              <div className="relative">
                <button className="flex items-center space-x-1 px-3 py-1.5 border border-gray-300 rounded bg-white text-sm">
                  <span>Show columns</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 9L12 15L18 9" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
              
              <div className="relative">
                <div className="flex items-center border border-gray-300 rounded overflow-hidden">
                  <input 
                    type="text" 
                    className="pl-10 pr-3 py-1.5 w-64 text-sm focus:outline-none"
                    placeholder="Search Patient"
                  />
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M21 21L17 17" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="therapios-table">
                <thead>
                  <tr>
                    <th className="w-10">
                      <input type="checkbox" className="h-4 w-4" />
                    </th>
                    <th>Name</th>
                    <th>Einrichtung</th>
                    <th>Tage s.l. Beh.</th>
                    <th>Organizer</th>
                    <th>Akt. VO#</th>
                    <th>VO Status (#/#)</th>
                    <th>Arzt</th>
                    <th>Frequenz</th>
                    <th>Admin status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPatients.map((patient) => (
                    <tr key={patient.id}>
                      <td>
                        <input type="checkbox" className="h-4 w-4" />
                      </td>
                      <td>{patient.name}</td>
                      <td>{patient.facility}</td>
                      <td>{patient.days}</td>
                      <td>
                        <div className="relative w-full">
                          <select className="w-full border border-gray-300 rounded p-1 text-sm bg-white">
                            <option>{patient.organizer}</option>
                            <option>Other Option</option>
                          </select>
                        </div>
                      </td>
                      <td>{patient.voNum}</td>
                      <td>{patient.voStatus}</td>
                      <td>{patient.doctor}</td>
                      <td>{patient.frequency}</td>
                      <td>
                        <span className={getAdminStatusColor(patient.adminStatus)}>
                          {patient.adminStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </WireframeLayout>
  );
} 