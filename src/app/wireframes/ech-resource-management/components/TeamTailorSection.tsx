'use client';

import React, { useState } from 'react';
import { Search, Car, Bike, Bus, ArrowLeft } from 'lucide-react';

interface TeamTailorSectionProps {
  onBack: () => void;
  onFindMatches?: (echId?: string, therapyType?: string) => void;
  highlightTherapistId?: string | null;
}

// Team Tailor Therapists Data (30 therapists)
const teamTailorTherapists = [
  {
    id: 19,
    name: 'Katharina Schulze',
    email: 'katharina.schulze@teamtailor.com',
    role: 'THERAPIST',
    location: 'Berlin',
    address: 'Kurfürstendamm 78, 10709 Berlin-Charlottenburg',
    therapistType: 'Physiotherapy',
    transportationType: ['Public transport', 'Own car'],
    status: 'Active',
    utilization: 32,
    source: 'Team Tailor'
  },
  {
    id: 20,
    name: 'Alexander König',
    email: 'alexander.koenig@teamtailor.com',
    role: 'THERAPIST',
    location: 'Munich',
    address: 'Theatinerstraße 89, 80333 München-Altstadt',
    therapistType: 'Occupational Therapy',
    transportationType: ['Public transport', 'Motorcycle'],
    status: 'Active',
    utilization: 28,
    source: 'Team Tailor'
  },
  {
    id: 21,
    name: 'Isabel Werner',
    email: 'isabel.werner@teamtailor.com',
    role: 'THERAPIST',
    location: 'Hamburg',
    address: 'Steinstraße 45, 20095 Hamburg-Altstadt',
    therapistType: 'Speech Therapy',
    transportationType: ['Public transport'],
    status: 'Active',
    utilization: 35,
    source: 'Team Tailor'
  },
  {
    id: 22,
    name: 'Maximilian Bayer',
    email: 'maximilian.bayer@teamtailor.com',
    role: 'THERAPIST',
    location: 'Frankfurt',
    address: 'Bockenheimer Landstraße 56, 60323 Frankfurt am Main-Westend',
    therapistType: 'Physiotherapy',
    transportationType: ['Public transport', 'Own car'],
    status: 'Active',
    utilization: 24,
    source: 'Team Tailor'
  },
  {
    id: 23,
    name: 'Charlotte Vogel',
    email: 'charlotte.vogel@teamtailor.com',
    role: 'THERAPIST',
    location: 'Cologne',
    address: 'Ehrenstraße 67, 50672 Köln-Innenstadt',
    therapistType: 'Occupational Therapy',
    transportationType: ['Public transport', 'Motorcycle'],
    status: 'Active',
    utilization: 31,
    source: 'Team Tailor'
  },
  {
    id: 24,
    name: 'Sebastian Krüger',
    email: 'sebastian.krueger@teamtailor.com',
    role: 'THERAPIST',
    location: 'Berlin',
    address: 'Prenzlauer Allee 123, 10409 Berlin-Prenzlauer Berg',
    therapistType: 'Speech Therapy',
    transportationType: ['Public transport'],
    status: 'Active',
    utilization: 29,
    source: 'Team Tailor'
  },
  {
    id: 25,
    name: 'Franziska Huber',
    email: 'franziska.huber@teamtailor.com',
    role: 'THERAPIST',
    location: 'Munich',
    address: 'Isartor Platz 34, 80331 München-Altstadt',
    therapistType: 'Physiotherapy',
    transportationType: ['Public transport', 'Own car'],
    status: 'Active',
    utilization: 26,
    source: 'Team Tailor'
  },
  {
    id: 26,
    name: 'Daniel Sommer',
    email: 'daniel.sommer@teamtailor.com',
    role: 'THERAPIST',
    location: 'Hamburg',
    address: 'Speicherstadt 78, 20457 Hamburg-HafenCity',
    therapistType: 'Occupational Therapy',
    transportationType: ['Public transport', 'Motorcycle'],
    status: 'Active',
    utilization: 33,
    source: 'Team Tailor'
  },
  {
    id: 27,
    name: 'Vanessa Wolf',
    email: 'vanessa.wolf@teamtailor.com',
    role: 'THERAPIST',
    location: 'Frankfurt',
    address: 'Römerberg 23, 60311 Frankfurt am Main-Altstadt',
    therapistType: 'Speech Therapy',
    transportationType: ['Public transport'],
    status: 'Active',
    utilization: 30,
    source: 'Team Tailor'
  },
  {
    id: 28,
    name: 'Tobias Lange',
    email: 'tobias.lange@teamtailor.com',
    role: 'THERAPIST',
    location: 'Cologne',
    address: 'Rudolfplatz 45, 50674 Köln-Innenstadt',
    therapistType: 'Physiotherapy',
    transportationType: ['Public transport', 'Own car'],
    status: 'Active',
    utilization: 27,
    source: 'Team Tailor'
  },
  {
    id: 29,
    name: 'Christina Becker',
    email: 'christina.becker@teamtailor.com',
    role: 'THERAPIST',
    location: 'Berlin',
    address: 'Hackescher Markt 56, 10178 Berlin-Mitte',
    therapistType: 'Occupational Therapy',
    transportationType: ['Public transport', 'Motorcycle'],
    status: 'Active',
    utilization: 25,
    source: 'Team Tailor'
  },
  {
    id: 30,
    name: 'Patrick Roth',
    email: 'patrick.roth@teamtailor.com',
    role: 'THERAPIST',
    location: 'Munich',
    address: 'Viktualienmarkt 89, 80331 München-Altstadt',
    therapistType: 'Speech Therapy',
    transportationType: ['Public transport'],
    status: 'Active',
    utilization: 34,
    source: 'Team Tailor'
  },
  {
    id: 31,
    name: 'Melanie Fischer',
    email: 'melanie.fischer@teamtailor.com',
    role: 'THERAPIST',
    location: 'Hamburg',
    address: 'Landungsbrücken 67, 20359 Hamburg-St. Pauli',
    therapistType: 'Physiotherapy',
    transportationType: ['Public transport', 'Own car'],
    status: 'Active',
    utilization: 28,
    source: 'Team Tailor'
  },
  {
    id: 32,
    name: 'Robin Müller',
    email: 'robin.mueller@teamtailor.com',
    role: 'THERAPIST',
    location: 'Frankfurt',
    address: 'Sachsenhausen 78, 60594 Frankfurt am Main-Sachsenhausen',
    therapistType: 'Occupational Therapy',
    transportationType: ['Public transport', 'Motorcycle'],
    status: 'Active',
    utilization: 36,
    source: 'Team Tailor'
  },
  {
    id: 33,
    name: 'Stephanie Klein',
    email: 'stephanie.klein@teamtailor.com',
    role: 'THERAPIST',
    location: 'Cologne',
    address: 'Rheinufer 23, 50679 Köln-Deutz',
    therapistType: 'Speech Therapy',
    transportationType: ['Public transport'],
    status: 'Active',
    utilization: 32,
    source: 'Team Tailor'
  },
  {
    id: 34,
    name: 'Marco Weber',
    email: 'marco.weber@teamtailor.com',
    role: 'THERAPIST',
    location: 'Berlin',
    address: 'Warschauer Straße 45, 10243 Berlin-Friedrichshain',
    therapistType: 'Physiotherapy',
    transportationType: ['Public transport', 'Own car'],
    status: 'Active',
    utilization: 29,
    source: 'Team Tailor'
  },
  {
    id: 35,
    name: 'Andrea Hoffmann',
    email: 'andrea.hoffmann@teamtailor.com',
    role: 'THERAPIST',
    location: 'Munich',
    address: 'Glockenbachviertel 56, 80469 München-Isarvorstadt',
    therapistType: 'Occupational Therapy',
    transportationType: ['Public transport', 'Motorcycle'],
    status: 'Active',
    utilization: 31,
    source: 'Team Tailor'
  },
  {
    id: 36,
    name: 'Benjamin König',
    email: 'benjamin.koenig@teamtailor.com',
    role: 'THERAPIST',
    location: 'Hamburg',
    address: 'Schanzenviertel 89, 20357 Hamburg-Eimsbüttel',
    therapistType: 'Speech Therapy',
    transportationType: ['Public transport'],
    status: 'Active',
    utilization: 33,
    source: 'Team Tailor'
  },
  {
    id: 37,
    name: 'Janina Schmidt',
    email: 'janina.schmidt@teamtailor.com',
    role: 'THERAPIST',
    location: 'Frankfurt',
    address: 'Bornheim 67, 60385 Frankfurt am Main-Bornheim',
    therapistType: 'Physiotherapy',
    transportationType: ['Public transport', 'Own car'],
    status: 'Active',
    utilization: 27,
    source: 'Team Tailor'
  },
  {
    id: 38,
    name: 'Dennis Braun',
    email: 'dennis.braun@teamtailor.com',
    role: 'THERAPIST',
    location: 'Cologne',
    address: 'Belgisches Viertel 78, 50674 Köln-Innenstadt',
    therapistType: 'Occupational Therapy',
    transportationType: ['Public transport', 'Motorcycle'],
    status: 'Active',
    utilization: 35,
    source: 'Team Tailor'
  },
  {
    id: 39,
    name: 'Laura Richter',
    email: 'laura.richter@teamtailor.com',
    role: 'THERAPIST',
    location: 'Berlin',
    address: 'Kreuzberg 34, 10961 Berlin-Kreuzberg',
    therapistType: 'Speech Therapy',
    transportationType: ['Public transport'],
    status: 'Active',
    utilization: 26,
    source: 'Team Tailor'
  },
  {
    id: 40,
    name: 'Kevin Neumann',
    email: 'kevin.neumann@teamtailor.com',
    role: 'THERAPIST',
    location: 'Munich',
    address: 'Schwabing-West 45, 80797 München-Schwabing',
    therapistType: 'Physiotherapy',
    transportationType: ['Public transport', 'Own car'],
    status: 'Active',
    utilization: 30,
    source: 'Team Tailor'
  },
  {
    id: 41,
    name: 'Sandra Zimmermann',
    email: 'sandra.zimmermann@teamtailor.com',
    role: 'THERAPIST',
    location: 'Hamburg',
    address: 'Ottensen 23, 22765 Hamburg-Altona',
    therapistType: 'Occupational Therapy',
    transportationType: ['Public transport', 'Motorcycle'],
    status: 'Active',
    utilization: 34,
    source: 'Team Tailor'
  },
  {
    id: 42,
    name: 'Philipp Wagner',
    email: 'philipp.wagner@teamtailor.com',
    role: 'THERAPIST',
    location: 'Frankfurt',
    address: 'Ostend 56, 60314 Frankfurt am Main-Ostend',
    therapistType: 'Speech Therapy',
    transportationType: ['Public transport'],
    status: 'Active',
    utilization: 29,
    source: 'Team Tailor'
  },
  {
    id: 43,
    name: 'Nina Fischer',
    email: 'nina.fischer@teamtailor.com',
    role: 'THERAPIST',
    location: 'Cologne',
    address: 'Agnesviertel 89, 50677 Köln-Innenstadt',
    therapistType: 'Physiotherapy',
    transportationType: ['Public transport', 'Own car'],
    status: 'Active',
    utilization: 33,
    source: 'Team Tailor'
  },
  {
    id: 44,
    name: 'Florian Schulz',
    email: 'florian.schulz@teamtailor.com',
    role: 'THERAPIST',
    location: 'Berlin',
    address: 'Neukölln 67, 12043 Berlin-Neukölln',
    therapistType: 'Occupational Therapy',
    transportationType: ['Public transport', 'Motorcycle'],
    status: 'Active',
    utilization: 31,
    source: 'Team Tailor'
  },
  {
    id: 45,
    name: 'Tina Krause',
    email: 'tina.krause@teamtailor.com',
    role: 'THERAPIST',
    location: 'Munich',
    address: 'Maxvorstadt 78, 80333 München-Maxvorstadt',
    therapistType: 'Speech Therapy',
    transportationType: ['Public transport'],
    status: 'Active',
    utilization: 28,
    source: 'Team Tailor'
  },
  {
    id: 46,
    name: 'Oliver Becker',
    email: 'oliver.becker@teamtailor.com',
    role: 'THERAPIST',
    location: 'Hamburg',
    address: 'Winterhude 45, 22303 Hamburg-Nord',
    therapistType: 'Physiotherapy',
    transportationType: ['Public transport', 'Own car'],
    status: 'Active',
    utilization: 32,
    source: 'Team Tailor'
  },
  {
    id: 47,
    name: 'Jessica Wolf',
    email: 'jessica.wolf@teamtailor.com',
    role: 'THERAPIST',
    location: 'Frankfurt',
    address: 'Gallus 23, 60326 Frankfurt am Main-Gallus',
    therapistType: 'Occupational Therapy',
    transportationType: ['Public transport', 'Motorcycle'],
    status: 'Active',
    utilization: 27,
    source: 'Team Tailor'
  },
  {
    id: 48,
    name: 'Tim Hartmann',
    email: 'tim.hartmann@teamtailor.com',
    role: 'THERAPIST',
    location: 'Cologne',
    address: 'Ehrenfeld 56, 50823 Köln-Ehrenfeld',
    therapistType: 'Speech Therapy',
    transportationType: ['Public transport'],
    status: 'Active',
    utilization: 35,
    source: 'Team Tailor'
  }
];

export default function TeamTailorSection({ onBack, onFindMatches, highlightTherapistId }: TeamTailorSectionProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedTherapyType, setSelectedTherapyType] = useState('');

  // Filter Team Tailor therapists based on search term and therapy type
  const filteredTherapists = teamTailorTherapists.filter(therapist => {
    const transportSearch = Array.isArray(therapist.transportationType) 
      ? therapist.transportationType.some((transport) => transport.toLowerCase().includes(searchTerm.toLowerCase()))
      : (therapist.transportationType as string).toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSearch = therapist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      therapist.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      therapist.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      therapist.therapistType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transportSearch;
    
    const matchesTherapyType = selectedTherapyType === '' || therapist.therapistType === selectedTherapyType;
    
    return matchesSearch && matchesTherapyType;
  });

  // Pagination
  const totalPages = Math.ceil(filteredTherapists.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTherapists = filteredTherapists.slice(startIndex, endIndex);

  const getStatusBadge = (status: string) => {
    const colors = {
      'Active': 'bg-green-100 text-green-800',
      'Inactive': 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  const getUtilizationBadge = (utilization: number) => {
    let bgColor = '';
    let textColor = '';
    
    if (utilization >= 85) {
      bgColor = 'bg-red-200';
      textColor = 'text-red-900';
    } else if (utilization >= 70) {
      bgColor = 'bg-yellow-200';
      textColor = 'text-yellow-900';
    } else {
      bgColor = 'bg-green-200';
      textColor = 'text-green-900';
    }
    
    return (
      <span className={`px-3 py-1.5 rounded-full text-sm font-bold ${bgColor} ${textColor}`}>
        {utilization}%
      </span>
    );
  };

  const getTransportIcon = (transportationType: string) => {
    const iconClass = "w-5 h-5 text-gray-600";
    switch (transportationType) {
      case 'Own car':
        return <span title="Own car"><Car className={iconClass} /></span>;
      case 'Motorcycle':
        return <span title="Motorcycle"><Bike className={iconClass} /></span>;
      case 'Public transport':
        return <span title="Public transport"><Bus className={iconClass} /></span>;
      default:
        return <span title={transportationType}><Car className={iconClass} /></span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="text-[#0f2c59] hover:text-[#1a3a6b] p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-xl font-semibold text-[#0f2c59]">Team Tailor Candidates</h2>
            <p className="text-gray-600">View potential therapist candidates from Team Tailor (Not yet hired)</p>
          </div>
        </div>
        <div className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
          Candidates Only
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white p-4 rounded-lg border">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search candidates (Name, Email, Location, Type...)"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0f2c59] focus:border-transparent"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            
            <div className="min-w-[160px]">
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0f2c59] focus:border-transparent"
                value={selectedTherapyType}
                onChange={(e) => {
                  setSelectedTherapyType(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="">All Therapy Types</option>
                <option value="Physiotherapy">Physiotherapy</option>
                <option value="Occupational Therapy">Occupational Therapy</option>
                <option value="Speech Therapy">Speech Therapy</option>
              </select>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>Show:</span>
            <select
              className="border border-gray-300 rounded px-2 py-1"
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span>per page</span>
          </div>
        </div>
      </div>

      {/* Candidates Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-orange-50 border-b">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Therapy Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transport</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Exp. Utilization</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentTherapists.map((therapist) => (
                <tr key={therapist.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm">
                      <div className="font-medium text-gray-900">{therapist.name}</div>
                      <div className="text-gray-500">ID: {therapist.id}</div>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{therapist.email}</span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm">
                      <div className="text-gray-900">{therapist.location}</div>
                      <div className="text-gray-500 text-xs">{therapist.address}</div>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{therapist.therapistType}</span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex justify-center gap-1">
                      {Array.isArray(therapist.transportationType) 
                        ? therapist.transportationType.map((transport, index) => (
                            <span key={index}>{getTransportIcon(transport)}</span>
                          ))
                        : getTransportIcon(therapist.transportationType)
                      }
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-center">
                    {getUtilizationBadge(therapist.utilization)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    {getStatusBadge(therapist.status)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <p className="text-sm text-gray-700">
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredTherapists.length)} of {filteredTherapists.length} candidates
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                
                {[...Array(totalPages)].map((_, index) => {
                  const page = index + 1;
                  if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-1 text-sm border rounded ${
                          currentPage === page
                            ? 'bg-[#0f2c59] text-white border-[#0f2c59]'
                            : 'border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  } else if (page === currentPage - 2 || page === currentPage + 2) {
                    return <span key={page} className="px-2 text-gray-500">...</span>;
                  }
                  return null;
                })}
                
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 