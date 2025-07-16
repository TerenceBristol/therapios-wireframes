'use client';

import React, { useState } from 'react';
import { Search, Plus, Edit2, MapPin, Activity, FileText } from 'lucide-react';
import { mondayECHs } from '../data/mondayECHs';



// Sample ECH data - simplified, removed capacity/occupancy
const sampleECHs = [
  {
    id: 'E3',
    name: 'Alpenland Marzahn',
    location: 'Berlin',
    address: 'Marzahner Promenade 123, 12679 Berlin-Marzahn',
    activeVOs: 15,
    prescriptionsByType: {
      'Physiotherapy': 8,
      'Occupational Therapy': 4,
      'Speech Therapy': 3
    },
    contactPerson: 'Dr. Anna Bergmann',
    phone: '+49 30 12345678',
    email: 'kontakt@alpenland-marzahn.de',
    status: 'Active',
    assignedTherapists: ['Anna Schmidt', 'Emma Richter', 'Lara Braun']
  },
  {
    id: 'E5',
    name: 'Caritas Hospitz Katarinhaus berlin Reinickendorf',
    location: 'Berlin',
    address: 'Katarinstraße 45, 13409 Berlin-Reinickendorf',
    activeVOs: 8,
    prescriptionsByType: {
      'Physiotherapy': 3,
      'Occupational Therapy': 3,
      'Speech Therapy': 2
    },
    contactPerson: 'Maria Weber',
    phone: '+49 30 23456789',
    email: 'info@caritas-katarinhaus.de',
    status: 'Active',
    assignedTherapists: ['Sarah Klein', 'Felix Wagner', 'Lara Braun']
  },
  {
    id: 'E8',
    name: 'FSE Pflegeeinrichtung Treptow / Johannisthal',
    location: 'Berlin',
    address: 'Johannisthaler Straße 78, 12487 Berlin-Treptow',
    activeVOs: 22,
    prescriptionsByType: {
      'Physiotherapy': 12,
      'Occupational Therapy': 6,
      'Speech Therapy': 4
    },
    contactPerson: 'Thomas Müller',
    phone: '+49 30 34567890',
    email: 'verwaltung@fse-treptow.de',
    status: 'Active',
    assignedTherapists: ['Anna Schmidt', 'Emma Richter', 'Lara Braun']
  },
  {
    id: 'E9',
    name: 'Haus am ZernseeSenioren',
    location: 'Berlin',
    address: 'Zernsdorfer Straße 12, 15711 König Wusterhausen',
    activeVOs: 12,
    prescriptionsByType: {
      'Physiotherapy': 6,
      'Occupational Therapy': 4,
      'Speech Therapy': 2
    },
    contactPerson: 'Sabine Klein',
    phone: '+49 3375 123456',
    email: 'info@haus-zernsee.de',
    status: 'Active',
    assignedTherapists: ['Anna Schmidt', 'Emma Richter', 'Noah König']
  },
  {
    id: 'E11',
    name: 'Haus El Joie de Vivre betreutes Wohnen Wildau',
    location: 'Berlin',
    address: 'Wildauer Straße 89, 15745 Wildau',
    activeVOs: 9,
    prescriptionsByType: {
      'Physiotherapy': 4,
      'Occupational Therapy': 3,
      'Speech Therapy': 2
    },
    contactPerson: 'Pierre Dubois',
    phone: '+49 3375 234567',
    email: 'reception@joiedevivre-wildau.de',
    status: 'Active',
    assignedTherapists: ['Sarah Klein', 'Sophie Fischer', 'Hannah Krause']
  },
  {
    id: 'E12',
    name: 'WG Zeuthen',
    location: 'Berlin',
    address: 'Fontanestraße 23, 15738 Zeuthen',
    activeVOs: 6,
    prescriptionsByType: {
      'Physiotherapy': 2,
      'Occupational Therapy': 2,
      'Speech Therapy': 2
    },
    contactPerson: 'Helga Richter',
    phone: '+49 33762 45678',
    email: 'leitung@wg-zeuthen.de',
    status: 'Active',
    assignedTherapists: ['Thomas Müller', 'Leon Zimmermann', 'Hannah Krause']
  },
  {
    id: 'E13',
    name: 'Haus Fontanehof',
    location: 'Berlin',
    address: 'Fontanestraße 156, 14193 Berlin-Charlottenburg',
    activeVOs: 18,
    prescriptionsByType: {
      'Physiotherapy': 10,
      'Occupational Therapy': 5,
      'Speech Therapy': 3
    },
    contactPerson: 'Ingrid Schneider',
    phone: '+49 30 45678901',
    email: 'info@fontanehof.de',
    status: 'Active',
    assignedTherapists: ['Julia Hoffmann', 'Leon Zimmermann']
  },
  {
    id: 'E18',
    name: 'Korian Haus am Wiesengrund',
    location: 'Munich',
    address: 'Wiesengrund 67, 80939 München-Freimann',
    activeVOs: 28,
    prescriptionsByType: {
      'Physiotherapy': 15,
      'Occupational Therapy': 8,
      'Speech Therapy': 5
    },
    contactPerson: 'Dr. Hans Baumann',
    phone: '+49 89 12345678',
    email: 'leitung@korian-wiesengrund.de',
    status: 'Active',
    assignedTherapists: ['Julia Hoffmann', 'Maya Schulz']
  },
  {
    id: 'E20',
    name: 'DOMICIL Seniorenpflegeheim Bergstraße',
    location: 'Frankfurt',
    address: 'Bergstraße 234, 60318 Frankfurt am Main-Nordend',
    activeVOs: 20,
    prescriptionsByType: {
      'Physiotherapy': 11,
      'Occupational Therapy': 6,
      'Speech Therapy': 3
    },
    contactPerson: 'Andrea Hoffmann',
    phone: '+49 69 23456789',
    email: 'info@domicil-bergstrasse.de',
    status: 'Active',
    assignedTherapists: ['Lars Becker', 'Noah König']
  },
  {
    id: 'E21',
    name: '(Pflegewerk) Theodorus Senioren Centrum Michaelkirchstraße',
    location: 'Berlin',
    address: 'Michaelkirchstraße 89, 10179 Berlin-Mitte',
    activeVOs: 17,
    prescriptionsByType: {
      'Physiotherapy': 6,
      'Occupational Therapy': 8,
      'Speech Therapy': 3
    },
    contactPerson: 'Michael Kramer',
    phone: '+49 30 56789012',
    email: 'zentrum@theodorus-berlin.de',
    status: 'Maintenance',
    assignedTherapists: ['Anna Schmidt', 'Carla Engel', 'Maximilian Förster']
  },
  // New Munich ECHs
  {
    id: 'E22',
    name: 'Augustinum München',
    location: 'Munich',
    address: 'Leopoldstraße 234, 80807 München-Schwabing',
    activeVOs: 22,
    prescriptionsByType: {
      'Physiotherapy': 9,
      'Occupational Therapy': 6,
      'Speech Therapy': 7
    },
    contactPerson: 'Dr. Brigitte Maier',
    phone: '+49 89 34567890',
    email: 'info@augustinum-muenchen.de',
    status: 'Active',
    assignedTherapists: ['Amelie Hartmann', 'Noah König', 'Vincent Berger']
  },
  {
    id: 'E23',
    name: 'Pro Seniore Residenz München Schwabing',
    location: 'Munich',
    address: 'Schelling Straße 89, 80799 München-Maxvorstadt',
    activeVOs: 12,
    prescriptionsByType: {
      'Physiotherapy': 4,
      'Occupational Therapy': 5,
      'Speech Therapy': 3
    },
    contactPerson: 'Stefan Huber',
    phone: '+49 89 45678901',
    email: 'residenz@proseniore-muenchen.de',
    status: 'Active',
    assignedTherapists: ['Emma Richter', 'Zoe Sommer', 'Vincent Berger']
  },
  // New Hamburg ECHs
  {
    id: 'E24',
    name: 'Seniorenresidenz Alsterblick Hamburg',
    location: 'Hamburg',
    address: 'Alsterufer 45, 20354 Hamburg-Neustadt',
    activeVOs: 18,
    prescriptionsByType: {
      'Physiotherapy': 8,
      'Occupational Therapy': 4,
      'Speech Therapy': 6
    },
    contactPerson: 'Marina Hansen',
    phone: '+49 40 12345678',
    email: 'kontakt@alsterblick-hamburg.de',
    status: 'Active',
    assignedTherapists: ['Felix Wagner', 'Jonas Neumann', 'Sarah Klein']
  },
  {
    id: 'E25',
    name: 'Pflegezentrum Hamburg-Altona',
    location: 'Hamburg',
    address: 'Große Bergstraße 78, 22767 Hamburg-Altona',
    activeVOs: 22,
    prescriptionsByType: {
      'Physiotherapy': 6,
      'Occupational Therapy': 7,
      'Speech Therapy': 9
    },
    contactPerson: 'Torben Schmidt',
    phone: '+49 40 23456789',
    email: 'info@pflegezentrum-altona.de',
    status: 'Active',
    assignedTherapists: ['Ida Lorenz', 'Jonas Neumann', 'Lara Braun', 'Paul Hartwig']
  },
  {
    id: 'E26',
    name: 'Haus am Elbufer Hamburg',
    location: 'Hamburg',
    address: 'Elbchaussee 234, 22605 Hamburg-Othmarschen',
    activeVOs: 9,
    prescriptionsByType: {
      'Physiotherapy': 3,
      'Occupational Therapy': 2,
      'Speech Therapy': 4
    },
    contactPerson: 'Anja Petersen',
    phone: '+49 40 34567890',
    email: 'leitung@elbufer-hamburg.de',
    status: 'Active',
    assignedTherapists: ['Felix Wagner', 'Sarah Klein', 'Paul Hartwig']
  },
  // New Frankfurt ECH
  {
    id: 'E27',
    name: 'Seniorenwohnen Frankfurt Sachsenhausen',
    location: 'Frankfurt',
    address: 'Schweizer Straße 123, 60594 Frankfurt am Main-Sachsenhausen',
    activeVOs: 17,
    prescriptionsByType: {
      'Physiotherapy': 7,
      'Occupational Therapy': 8,
      'Speech Therapy': 2
    },
    contactPerson: 'Claudia Zimmermann',
    phone: '+49 69 34567890',
    email: 'info@seniorenwohnen-sachsenhausen.de',
    status: 'Active',
    assignedTherapists: ['Mila Vogel', 'Moritz Jung', 'Elias Wolf']
  },
  // New Cologne ECHs
  {
    id: 'E28',
    name: 'Seniorenheim Köln-Innenstadt',
    location: 'Cologne',
    address: 'Hohe Straße 234, 50667 Köln-Innenstadt',
    activeVOs: 20,
    prescriptionsByType: {
      'Physiotherapy': 5,
      'Occupational Therapy': 9,
      'Speech Therapy': 6
    },
    contactPerson: 'Petra Richter',
    phone: '+49 221 12345678',
    email: 'info@seniorenheim-koeln.de',
    status: 'Active',
    assignedTherapists: ['Julia Hoffmann', 'Hannah Krause', 'Leon Zimmermann']
  },
  {
    id: 'E29',
    name: 'Residenz am Rhein Köln',
    location: 'Cologne',
    address: 'Rheinufer 89, 50678 Köln-Deutz',
    activeVOs: 15,
    prescriptionsByType: {
      'Physiotherapy': 3,
      'Occupational Therapy': 4,
      'Speech Therapy': 8
    },
    contactPerson: 'Wolfgang Klein',
    phone: '+49 221 23456789',
    email: 'kontakt@residenz-rhein-koeln.de',
    status: 'Active',
    assignedTherapists: ['Hannah Krause', 'Jannik Stein', 'Leonie Pfeiffer']
  }
];

interface ECHSectionProps {
  onEditECH: (echId: string) => void;
  onFindTherapists?: (echId: string, therapyTypes: string[]) => void;
  showMondayECHs?: boolean;
  onShowMondayECHs?: () => void;
  onBackFromMondayECHs?: () => void;
}

export default function ECHSection({ onEditECH, onFindTherapists, showMondayECHs, onShowMondayECHs, onBackFromMondayECHs }: ECHSectionProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Select data source based on toggle state
  const dataSource = showMondayECHs ? mondayECHs : sampleECHs;
  
  // Filter ECHs based on search term
  const filteredECHs = dataSource.filter(ech =>
    ech.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ech.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ech.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ech.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filteredECHs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentECHs = filteredECHs.slice(startIndex, endIndex);

  const handleEditECH = (id: string) => {
    if (onEditECH) {
      onEditECH(id);
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      'Active': 'bg-green-100 text-green-800',
      'Maintenance': 'bg-yellow-100 text-yellow-800',
      'Inactive': 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  // Mock function to get therapy type for a therapist (in real app, this would come from therapist data)
  const getTherapistType = (therapistName: string) => {
    const therapistTypes: { [key: string]: string } = {
      'Anna Schmidt': 'Physiotherapy',
      'Emma Richter': 'Speech Therapy',
      'Lara Braun': 'Speech Therapy',
      'Sarah Klein': 'Speech Therapy',
      'Felix Wagner': 'Physiotherapy',
      'Thomas Müller': 'Physiotherapy',
      'Noah König': 'Occupational Therapy',
      'Sophie Fischer': 'Occupational Therapy',
      'Hannah Krause': 'Occupational Therapy',
      'Julia Hoffmann': 'Occupational Therapy',
      'Leon Zimmermann': 'Speech Therapy',
      'Maya Schulz': 'Physiotherapy',
      'Lars Becker': 'Physiotherapy',
      'Elias Wolf': 'Physiotherapy'
    };
    return therapistTypes[therapistName] || 'Physiotherapy';
  };

  const getTherapyTypeBadgeColor = (therapyType: string) => {
    const colors = {
      'Physiotherapy': 'bg-blue-100 text-blue-800',
      'Occupational Therapy': 'bg-purple-100 text-purple-800',
      'Speech Therapy': 'bg-green-100 text-green-800'
    };
    return colors[therapyType as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getSalesStatusBadge = (status: string) => {
    const colors = {
      // Early Stage (Active Pipeline)
      'Interessiert': 'bg-purple-100 text-purple-800',
      'IP Meeting': 'bg-blue-100 text-blue-800',
      
      // Onboarding Stages
      'Onboarding (Therapeutensuche)': 'bg-green-100 text-green-800',
      'Onboarding': 'bg-yellow-100 text-yellow-800',
      
      // Active Stages
      'Aktiv (Therapeutensuche)': 'bg-blue-100 text-blue-800',
      'Aktiv': 'bg-green-100 text-green-800',
      
      // Closed/Inactive Stages
      'Nicht interessiert': 'bg-amber-100 text-amber-800',
      'Lost': 'bg-purple-100 text-purple-800',
      'Inaktiv (Lost)': 'bg-pink-100 text-pink-800',
      'Von uns abgelehnt': 'bg-pink-100 text-pink-800',
      
      // Legacy statuses (for backwards compatibility)
      'In Contact': 'bg-blue-100 text-blue-800',
      'Closing': 'bg-green-100 text-green-800'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-[#0f2c59]">
            {showMondayECHs ? 'Monday.com ECH Prospects' : 'ECH Overview'}
          </h2>
          <p className="text-gray-600">
            {showMondayECHs 
              ? 'View potential ECH prospects from Monday.com (Sales pipeline)'
              : 'Manage elderly care homes and their details'
            }
          </p>
          
          {!showMondayECHs && (
            /* Therapy Type Legend */
            <div className="flex items-center gap-6 mt-2 text-xs text-gray-600">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Physiotherapy</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>Occupational Therapy</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Speech Therapy</span>
              </div>
            </div>
          )}
          
          {showMondayECHs && onBackFromMondayECHs && (
            <button 
              onClick={onBackFromMondayECHs}
              className="mt-2 text-gray-600 hover:text-[#0f2c59] text-sm underline transition-colors"
            >
              ← Back to Regular ECHs
            </button>
          )}
        </div>
        <div className="flex flex-col items-end gap-2">
          <button className="bg-[#0f2c59] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#1a3a6b] transition-colors">
            <Plus size={16} />
            Add New ECH
          </button>
          {!showMondayECHs && onShowMondayECHs && (
            <button 
              onClick={onShowMondayECHs}
              className="bg-gray-600 text-white px-2 py-1 rounded text-xs hover:bg-gray-700 transition-colors opacity-80"
              title="Prototype only - View Monday.com ECH prospects"
            >
              View Monday.com ECHs
            </button>
          )}
        </div>
      </div>

      {/* Search Filter */}
      <div className="flex justify-end">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search ECH (Name, Location, Address...)"
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0f2c59] focus:border-transparent"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      {/* ECH Table - Removed Capacity and Occupancy columns */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ECH Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {showMondayECHs ? 'Sales Status' : 'Active Prescriptions'}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentECHs.map((ech) => (
                <tr key={ech.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-[#0f2c59]">{ech.id}</span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-sm">
                      <div className="font-medium text-gray-900" title={ech.address}>{ech.name}</div>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{ech.location}</span>
                  </td>
                  <td className="px-4 py-4">
                    {showMondayECHs ? (
                      /* Monday.com ECH - Show Sales Status */
                      <div className="text-sm">
                        {getSalesStatusBadge((ech as any).salesStatus)}

                      </div>
                    ) : (
                      /* Regular ECH - Show Prescriptions */
                      <div className="text-sm">
                        <div className="font-medium text-[#0f2c59] mb-2">
                          Total: {(ech as any).activeVOs}
                        </div>
                        <div className="grid grid-cols-3 gap-1 text-xs">
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span className="text-gray-600">{(ech as any).prescriptionsByType?.['Physiotherapy'] || 0}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                            <span className="text-gray-600">{(ech as any).prescriptionsByType?.['Occupational Therapy'] || 0}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-gray-600">{(ech as any).prescriptionsByType?.['Speech Therapy'] || 0}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white px-4 py-3 border rounded-lg">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>
              Showing {startIndex + 1} to {Math.min(endIndex, filteredECHs.length)} of {filteredECHs.length} results
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1 border rounded text-sm ${
                    page === currentPage
                      ? 'bg-[#0f2c59] text-white border-[#0f2c59]'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
            
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 