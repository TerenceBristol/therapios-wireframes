'use client';

import React, { useState } from 'react';
import { Search, Plus, Edit2, Car, Bike, Bus } from 'lucide-react';

// ECH data for prescription calculation - Expanded to cover all 30 therapists
const sampleECHs = [
  // Berlin ECHs (8 total) - 7 Berlin therapists
  {
    id: 'E3',
    name: 'Alpenland Marzahn',
    prescriptionsByType: {
      'Physiotherapy': 8,
      'Occupational Therapy': 4,
      'Speech Therapy': 3
    },
    assignedTherapists: ['Anna Schmidt', 'Carla Engel', 'Maximilian Förster']
  },
  {
    id: 'E5',
    name: 'Caritas Hospitz Katarinhaus berlin Reinickendorf',
    prescriptionsByType: {
      'Physiotherapy': 6,
      'Occupational Therapy': 3,
      'Speech Therapy': 4
    },
    assignedTherapists: ['Lars Becker', 'Carla Engel', 'Nele Kaufmann']
  },
  {
    id: 'E8',
    name: 'FSE Pflegeeinrichtung Treptow / Johannisthal',
    prescriptionsByType: {
      'Physiotherapy': 12,
      'Occupational Therapy': 6,
      'Speech Therapy': 8
    },
    assignedTherapists: ['Anna Schmidt', 'Carla Engel', 'Maximilian Förster', 'Nele Kaufmann']
  },
  {
    id: 'E9',
    name: 'Haus am ZernseeSenioren',
    prescriptionsByType: {
      'Physiotherapy': 4,
      'Occupational Therapy': 2,
      'Speech Therapy': 3
    },
    assignedTherapists: ['Finn Roth', 'Nele Kaufmann']
  },
  {
    id: 'E11',
    name: 'Haus El Joie de Vivre betreutes Wohnen Wildau',
    prescriptionsByType: {
      'Physiotherapy': 3,
      'Occupational Therapy': 4,
      'Speech Therapy': 2
    },
    assignedTherapists: ['Maya Schulz', 'Carla Engel']
  },
  {
    id: 'E12',
    name: 'WG Zeuthen',
    prescriptionsByType: {
      'Physiotherapy': 5,
      'Occupational Therapy': 1,
      'Speech Therapy': 2
    },
    assignedTherapists: ['Lars Becker', 'Maximilian Förster']
  },
  {
    id: 'E13',
    name: 'Haus Fontanehof',
    prescriptionsByType: {
      'Physiotherapy': 7,
      'Occupational Therapy': 3,
      'Speech Therapy': 4
    },
    assignedTherapists: ['Finn Roth', 'Nele Kaufmann']
  },
  {
    id: 'E21',
    name: '(Pflegewerk) Theodorus Senioren Centrum Michaelkirchstraße',
    prescriptionsByType: {
      'Physiotherapy': 6,
      'Occupational Therapy': 8,
      'Speech Therapy': 3
    },
    assignedTherapists: ['Anna Schmidt', 'Carla Engel', 'Maximilian Förster']
  },

  // Munich ECHs (3 total) - 6 Munich therapists  
  {
    id: 'E18',
    name: 'Korian Haus am Wiesengrund',
    prescriptionsByType: {
      'Physiotherapy': 15,
      'Occupational Therapy': 8,
      'Speech Therapy': 5
    },
    assignedTherapists: ['Amelie Hartmann', 'Michael Weber', 'Emma Richter']
  },
  {
    id: 'E22',
    name: 'Augustinum München',
    prescriptionsByType: {
      'Physiotherapy': 9,
      'Occupational Therapy': 6,
      'Speech Therapy': 7
    },
    assignedTherapists: ['Amelie Hartmann', 'Noah König', 'Vincent Berger']
  },
  {
    id: 'E23',
    name: 'Pro Seniore Residenz München Schwabing',
    prescriptionsByType: {
      'Physiotherapy': 4,
      'Occupational Therapy': 5,
      'Speech Therapy': 3
    },
    assignedTherapists: ['Emma Richter', 'Zoe Sommer', 'Vincent Berger']
  },

  // Hamburg ECHs (3 total) - 6 Hamburg therapists
  {
    id: 'E24',
    name: 'Seniorenresidenz Alsterblick Hamburg',
    prescriptionsByType: {
      'Physiotherapy': 8,
      'Occupational Therapy': 4,
      'Speech Therapy': 6
    },
    assignedTherapists: ['Felix Wagner', 'Jonas Neumann', 'Sarah Klein']
  },
  {
    id: 'E25',
    name: 'Pflegezentrum Hamburg-Altona',
    prescriptionsByType: {
      'Physiotherapy': 6,
      'Occupational Therapy': 7,
      'Speech Therapy': 9
    },
    assignedTherapists: ['Ida Lorenz', 'Jonas Neumann', 'Lara Braun', 'Paul Hartwig']
  },
  {
    id: 'E26',
    name: 'Haus am Elbufer Hamburg',
    prescriptionsByType: {
      'Physiotherapy': 3,
      'Occupational Therapy': 2,
      'Speech Therapy': 4
    },
    assignedTherapists: ['Felix Wagner', 'Sarah Klein', 'Paul Hartwig']
  },

  // Frankfurt ECHs (2 total) - 5 Frankfurt therapists
  {
    id: 'E20',
    name: 'DOMICIL Seniorenpflegeheim Bergstraße',
    prescriptionsByType: {
      'Physiotherapy': 11,
      'Occupational Therapy': 6,
      'Speech Therapy': 3
    },
    assignedTherapists: ['Thomas Müller', 'Sophie Fischer', 'Elias Wolf']
  },
  {
    id: 'E27',
    name: 'Seniorenwohnen Frankfurt Sachsenhausen',
    prescriptionsByType: {
      'Physiotherapy': 7,
      'Occupational Therapy': 8,
      'Speech Therapy': 2
    },
    assignedTherapists: ['Mila Vogel', 'Moritz Jung', 'Elias Wolf']
  },

  // Cologne ECHs (2 total) - 5 Cologne therapists
  {
    id: 'E28',
    name: 'Seniorenheim Köln-Innenstadt',
    prescriptionsByType: {
      'Physiotherapy': 5,
      'Occupational Therapy': 9,
      'Speech Therapy': 6
    },
    assignedTherapists: ['Julia Hoffmann', 'Hannah Krause', 'Leon Zimmermann']
  },
  {
    id: 'E29',
    name: 'Residenz am Rhein Köln',
    prescriptionsByType: {
      'Physiotherapy': 3,
      'Occupational Therapy': 4,
      'Speech Therapy': 8
    },
    assignedTherapists: ['Hannah Krause', 'Jannik Stein', 'Leonie Pfeiffer']
  }
];

// Updated sample data for 30 Flow therapists with % utilization
const sampleTherapists = [
  {
    id: 1,
    name: 'Anna Schmidt',
    email: 'anna.schmidt@therapios.com',
    role: 'THERAPIST',
    location: 'Berlin',
    address: 'Unter den Linden 45, 10117 Berlin-Mitte',
    therapistType: 'Physiotherapy',
    transportationType: ['Public transport', 'Own car'],
    status: 'Active',
    utilization: 45,
    source: 'Flow'
  },
  {
    id: 2,
    name: 'Michael Weber',
    email: 'michael.weber@therapios.com',
    role: 'THERAPIST',
    location: 'Munich',
    address: 'Marienplatz 12, 80331 München-Altstadt',
    therapistType: 'Occupational Therapy',
    transportationType: ['Public transport'],
    status: 'Active',
    utilization: 72,
    source: 'Flow'
  },
  {
    id: 3,
    name: 'Sarah Klein',
    email: 'sarah.klein@therapios.com',
    role: 'THERAPIST',
    location: 'Hamburg',
    address: 'Reeperbahn 89, 20359 Hamburg-St. Pauli',
    therapistType: 'Speech Therapy',
    transportationType: ['Public transport', 'Motorcycle'],
    status: 'Active',
    utilization: 83,
    source: 'Flow'
  },
  {
    id: 4,
    name: 'Thomas Müller',
    email: 'thomas.mueller@therapios.com',
    role: 'THERAPIST',
    location: 'Frankfurt',
    address: 'Zeil 67, 60313 Frankfurt am Main-Innenstadt',
    therapistType: 'Physiotherapy',
    transportationType: ['Public transport', 'Own car'],
    status: 'Active',
    utilization: 28,
    source: 'Flow'
  },
  {
    id: 5,
    name: 'Julia Hoffmann',
    email: 'julia.hoffmann@therapios.com',
    role: 'THERAPIST',
    location: 'Cologne',
    address: 'Schildergasse 23, 50667 Köln-Innenstadt',
    therapistType: 'Occupational Therapy',
    transportationType: ['Public transport'],
    status: 'Inactive',
    utilization: 0,
    source: 'Flow'
  },
  {
    id: 6,
    name: 'Lars Becker',
    email: 'lars.becker@therapios.com',
    role: 'THERAPIST',
    location: 'Berlin',
    address: 'Friedrichstraße 156, 10117 Berlin-Mitte',
    therapistType: 'Physiotherapy',
    transportationType: ['Public transport', 'Motorcycle'],
    status: 'Active',
    utilization: 91,
    source: 'Flow'
  },
  {
    id: 7,
    name: 'Emma Richter',
    email: 'emma.richter@therapios.com',
    role: 'THERAPIST',
    location: 'Munich',
    address: 'Leopoldstraße 78, 80802 München-Schwabing',
    therapistType: 'Speech Therapy',
    transportationType: ['Public transport', 'Own car'],
    status: 'Active',
    utilization: 56,
    source: 'Flow'
  },
  {
    id: 8,
    name: 'Felix Wagner',
    email: 'felix.wagner@therapios.com',
    role: 'THERAPIST',
    location: 'Hamburg',
    address: 'Mönckebergstraße 34, 20095 Hamburg-Altstadt',
    therapistType: 'Physiotherapy',
    transportationType: ['Public transport'],
    status: 'Active',
    utilization: 67,
    source: 'Flow'
  },
  {
    id: 9,
    name: 'Sophie Fischer',
    email: 'sophie.fischer@therapios.com',
    role: 'THERAPIST',
    location: 'Frankfurt',
    address: 'Goethestraße 91, 60313 Frankfurt am Main-Innenstadt',
    therapistType: 'Occupational Therapy',
    transportationType: ['Public transport', 'Own car'],
    status: 'Active',
    utilization: 38,
    source: 'Flow'
  },
  {
    id: 10,
    name: 'Leon Zimmermann',
    email: 'leon.zimmermann@therapios.com',
    role: 'THERAPIST',
    location: 'Cologne',
    address: 'Hohe Straße 145, 50667 Köln-Innenstadt',
    therapistType: 'Speech Therapy',
    transportationType: ['Public transport', 'Motorcycle'],
    status: 'Active',
    utilization: 79,
    source: 'Flow'
  },
  {
    id: 11,
    name: 'Maya Schulz',
    email: 'maya.schulz@therapios.com',
    role: 'THERAPIST',
    location: 'Berlin',
    address: 'Potsdamer Platz 8, 10785 Berlin-Tiergarten',
    therapistType: 'Physiotherapy',
    transportationType: ['Public transport'],
    status: 'Inactive',
    utilization: 0,
    source: 'Flow'
  },
  {
    id: 12,
    name: 'Noah König',
    email: 'noah.koenig@therapios.com',
    role: 'THERAPIST',
    location: 'Munich',
    address: 'Maximilianstraße 56, 80539 München-Altstadt',
    therapistType: 'Occupational Therapy',
    transportationType: ['Public transport', 'Own car'],
    status: 'Active',
    utilization: 52,
    source: 'Flow'
  },
  {
    id: 13,
    name: 'Lara Braun',
    email: 'lara.braun@therapios.com',
    role: 'THERAPIST',
    location: 'Hamburg',
    address: 'Alstertor 23, 20095 Hamburg-Altstadt',
    therapistType: 'Speech Therapy',
    transportationType: ['Public transport', 'Motorcycle'],
    status: 'Active',
    utilization: 85,
    source: 'Flow'
  },
  {
    id: 14,
    name: 'Elias Wolf',
    email: 'elias.wolf@therapios.com',
    role: 'THERAPIST',
    location: 'Frankfurt',
    address: 'Kaiserstraße 78, 60329 Frankfurt am Main-Bahnhofsviertel',
    therapistType: 'Physiotherapy',
    transportationType: ['Public transport'],
    status: 'Active',
    utilization: 31,
    source: 'Flow'
  },
  {
    id: 15,
    name: 'Hannah Krause',
    email: 'hannah.krause@therapios.com',
    role: 'THERAPIST',
    location: 'Cologne',
    address: 'Neumarkt 67, 50667 Köln-Innenstadt',
    therapistType: 'Occupational Therapy',
    transportationType: ['Public transport', 'Own car'],
    status: 'Active',
    utilization: 63,
    source: 'Flow'
  },
  {
    id: 16,
    name: 'Maximilian Förster',
    email: 'max.foerster@therapios.com',
    role: 'THERAPIST',
    location: 'Berlin',
    address: 'Alexanderplatz 34, 10178 Berlin-Mitte',
    therapistType: 'Speech Therapy',
    transportationType: ['Public transport', 'Own car'],
    status: 'Active',
    utilization: 22,
    source: 'Flow'
  },
  {
    id: 17,
    name: 'Amelie Hartmann',
    email: 'amelie.hartmann@therapios.com',
    role: 'THERAPIST',
    location: 'Munich',
    address: 'Sendlinger Straße 89, 80331 München-Altstadt',
    therapistType: 'Physiotherapy',
    transportationType: ['Public transport', 'Motorcycle'],
    status: 'Active',
    utilization: 74,
    source: 'Flow'
  },
  {
    id: 18,
    name: 'Jonas Neumann',
    email: 'jonas.neumann@therapios.com',
    role: 'THERAPIST',
    location: 'Hamburg',
    address: 'Jungfernstieg 45, 20354 Hamburg-Neustadt',
    therapistType: 'Occupational Therapy',
    transportationType: ['Public transport'],
    status: 'Active',
    utilization: 89,
    source: 'Flow'
  },
  // Additional 12 Flow therapists (IDs 49-60)
  {
    id: 49,
    name: 'Carla Engel',
    email: 'carla.engel@therapios.com',
    role: 'THERAPIST',
    location: 'Berlin',
    address: 'Kastanienallee 67, 10435 Berlin-Prenzlauer Berg',
    therapistType: 'Occupational Therapy',
    transportationType: ['Public transport', 'Own car'],
    status: 'Active',
    utilization: 58,
    source: 'Flow'
  },
  {
    id: 50,
    name: 'Vincent Berger',
    email: 'vincent.berger@therapios.com',
    role: 'THERAPIST',
    location: 'Munich',
    address: 'Augustinerstraße 12, 80333 München-Altstadt',
    therapistType: 'Speech Therapy',
    transportationType: ['Public transport', 'Motorcycle'],
    status: 'Active',
    utilization: 77,
    source: 'Flow'
  },
  {
    id: 51,
    name: 'Ida Lorenz',
    email: 'ida.lorenz@therapios.com',
    role: 'THERAPIST',
    location: 'Hamburg',
    address: 'Hafencity 89, 20457 Hamburg-HafenCity',
    therapistType: 'Physiotherapy',
    transportationType: ['Public transport'],
    status: 'Active',
    utilization: 41,
    source: 'Flow'
  },
  {
    id: 52,
    name: 'Moritz Jung',
    email: 'moritz.jung@therapios.com',
    role: 'THERAPIST',
    location: 'Frankfurt',
    address: 'Berger Straße 45, 60316 Frankfurt am Main-Nordend',
    therapistType: 'Occupational Therapy',
    transportationType: ['Public transport', 'Own car'],
    status: 'Active',
    utilization: 69,
    source: 'Flow'
  },
  {
    id: 53,
    name: 'Leonie Pfeiffer',
    email: 'leonie.pfeiffer@therapios.com',
    role: 'THERAPIST',
    location: 'Cologne',
    address: 'Wilhelmsring 78, 50672 Köln-Innenstadt',
    therapistType: 'Speech Therapy',
    transportationType: ['Public transport', 'Motorcycle'],
    status: 'Active',
    utilization: 84,
    source: 'Flow'
  },
  {
    id: 54,
    name: 'Finn Roth',
    email: 'finn.roth@therapios.com',
    role: 'THERAPIST',
    location: 'Berlin',
    address: 'Oranienburger Straße 23, 10178 Berlin-Mitte',
    therapistType: 'Physiotherapy',
    transportationType: ['Public transport'],
    status: 'Active',
    utilization: 35,
    source: 'Flow'
  },
  {
    id: 55,
    name: 'Zoe Sommer',
    email: 'zoe.sommer@therapios.com',
    role: 'THERAPIST',
    location: 'Munich',
    address: 'Schelling Straße 56, 80799 München-Maxvorstadt',
    therapistType: 'Occupational Therapy',
    transportationType: ['Public transport', 'Own car'],
    status: 'Active',
    utilization: 62,
    source: 'Flow'
  },
  {
    id: 56,
    name: 'Paul Hartwig',
    email: 'paul.hartwig@therapios.com',
    role: 'THERAPIST',
    location: 'Hamburg',
    address: 'Große Freiheit 34, 22767 Hamburg-Altona',
    therapistType: 'Speech Therapy',
    transportationType: ['Public transport', 'Motorcycle'],
    status: 'Active',
    utilization: 88,
    source: 'Flow'
  },
  {
    id: 57,
    name: 'Mila Vogel',
    email: 'mila.vogel@therapios.com',
    role: 'THERAPIST',
    location: 'Frankfurt',
    address: 'Schweizer Straße 89, 60594 Frankfurt am Main-Sachsenhausen',
    therapistType: 'Physiotherapy',
    transportationType: ['Public transport'],
    status: 'Active',
    utilization: 49,
    source: 'Flow'
  },
  {
    id: 58,
    name: 'Jannik Stein',
    email: 'jannik.stein@therapios.com',
    role: 'THERAPIST',
    location: 'Cologne',
    address: 'Friesenplatz 12, 50672 Köln-Innenstadt',
    therapistType: 'Occupational Therapy',
    transportationType: ['Public transport', 'Own car'],
    status: 'Active',
    utilization: 73,
    source: 'Flow'
  },
  {
    id: 59,
    name: 'Nele Kaufmann',
    email: 'nele.kaufmann@therapios.com',
    role: 'THERAPIST',
    location: 'Berlin',
    address: 'Torstraße 67, 10119 Berlin-Mitte',
    therapistType: 'Speech Therapy',
    transportationType: ['Public transport', 'Motorcycle'],
    status: 'Inactive',
    utilization: 0,
    source: 'Flow'
  },
  {
    id: 60,
    name: 'Theo Bachmann',
    email: 'theo.bachmann@therapios.com',
    role: 'THERAPIST',
    location: 'Munich',
    address: 'Tal 45, 80331 München-Altstadt',
    therapistType: 'Physiotherapy',
    transportationType: ['Public transport'],
    status: 'Active',
    utilization: 91,
    source: 'Flow'
  }
];

interface TeamSectionProps {
  onEditUser?: (userId: string) => void;
  onShowTeamTailor?: () => void;
  onFindMatches?: (echId?: string, therapyType?: string) => void;
  highlightTherapistId?: string | null;
}

export default function TeamSection({ onEditUser, onShowTeamTailor, onFindMatches, highlightTherapistId }: TeamSectionProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedTherapyType, setSelectedTherapyType] = useState('');
  const [hoveredTooltip, setHoveredTooltip] = useState<string | null>(null);

  // Calculate prescriptions for each therapist
  const calculateTherapistPrescriptions = (therapistName: string, therapistType: string) => {
    const echAssignments = [];
    let totalPrescriptions = 0;

    // Find ECHs where this therapist is assigned
    for (const ech of sampleECHs) {
      if (ech.assignedTherapists.includes(therapistName)) {
        // Count therapists of the same type at this ECH
        const sameTypeTherapists = ech.assignedTherapists.filter(name => {
          const therapist = sampleTherapists.find(t => t.name === name);
          return therapist && therapist.therapistType === therapistType;
        });

        // Calculate this therapist's share of prescriptions for their specialty
        const prescriptionsForType = ech.prescriptionsByType[therapistType as keyof typeof ech.prescriptionsByType] || 0;
        const therapistShare = Math.floor(prescriptionsForType / sameTypeTherapists.length);
        
        if (therapistShare > 0) {
          echAssignments.push({
            echId: ech.id,
            echName: ech.name,
            prescriptions: therapistShare
          });
          totalPrescriptions += therapistShare;
        }
      }
    }

    return {
      totalPrescriptions,
      echAssignments
    };
  };

  // Filter therapists based on search term and therapy type (Flow therapists only)
  const filteredTherapists = sampleTherapists
    .filter(therapist => therapist.source === 'Flow') // Only show Flow therapists
    .filter(therapist => {
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

  const handleEditTherapist = (id: number) => {
    if (onEditUser) {
      onEditUser(id.toString());
    }
  };

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

  const getUtilizationColor = (utilization: number) => {
    if (utilization >= 85) return 'text-red-600 font-medium';
    if (utilization >= 70) return 'text-yellow-600 font-medium';
    return 'text-green-600 font-medium';
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
        <div>
          <h2 className="text-xl font-semibold text-[#0f2c59]">Team Management</h2>
          <p className="text-gray-600">Manage therapist profiles and information</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <button className="bg-[#0f2c59] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#1a3a6b] transition-colors">
            <Plus size={16} />
            Add New Therapist
          </button>
          <button 
            onClick={onShowTeamTailor}
            className="bg-gray-600 text-white px-2 py-1 rounded text-xs hover:bg-gray-700 transition-colors opacity-80"
          >
            View Team Tailor Candidates
          </button>
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
                placeholder="Search therapists (Name, Email, Location, Type...)"
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

      {/* Therapist Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Therapy Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prescriptions</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transport</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Utilization</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
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
                    <span className="text-sm text-gray-900">{therapist.location}</span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{therapist.therapistType}</span>
                  </td>
                  <td className="px-4 py-4">
                    {(() => {
                      const prescriptionData = calculateTherapistPrescriptions(therapist.name, therapist.therapistType);
                      // Sort ECH assignments by prescription count (highest first)
                      const sortedAssignments = [...prescriptionData.echAssignments].sort((a, b) => b.prescriptions - a.prescriptions);
                      
                      return (
                        <div className="text-sm">
                          {/* Top tier: Total only */}
                          <div className="font-medium text-[#0f2c59] mb-2">
                            Total: {prescriptionData.totalPrescriptions}
                          </div>
                          
                          {/* Bottom tier: All ECH assignments in one row with individual tooltips */}
                          {sortedAssignments.length > 0 && (
                            <div className="text-xs text-gray-600">
                              <div className="flex flex-wrap gap-2">
                                {sortedAssignments.map((assignment, index) => {
                                  const tooltipId = `tooltip-${therapist.id}-${assignment.echId}`;
                                  return (
                                    <div key={index} className="relative">
                                      <span 
                                        className="bg-gray-100 px-2 py-1 rounded text-gray-700 cursor-help hover:bg-gray-200 transition-colors"
                                        onMouseEnter={() => setHoveredTooltip(tooltipId)}
                                        onMouseLeave={() => setHoveredTooltip(null)}
                                      >
                                        <strong>{assignment.echId}</strong>:{assignment.prescriptions}
                                      </span>
                                      {hoveredTooltip === tooltipId && (
                                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg z-10 whitespace-nowrap">
                                          {assignment.echName}
                                          {/* Tooltip arrow */}
                                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })()}
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
                  <td className="px-4 py-4 whitespace-nowrap">
                    {getUtilizationBadge(therapist.utilization)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    {getStatusBadge(therapist.status)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEditTherapist(therapist.id)}
                      className="text-[#0f2c59] hover:text-[#1a3a6b] flex items-center gap-1 transition-colors"
                      title="Edit Therapist"
                    >
                      <Edit2 size={16} />
                    </button>
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
              Showing {startIndex + 1} to {Math.min(endIndex, filteredTherapists.length)} of {filteredTherapists.length} therapists
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