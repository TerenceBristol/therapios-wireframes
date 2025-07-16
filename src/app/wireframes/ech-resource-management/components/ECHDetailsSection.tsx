'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Users } from 'lucide-react';

// Sample ECH data (simplified, removed capacity/occupancy and therapist assignments)
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
    voNumbers: {
      'Physiotherapy': ['1247-8', '3456-12', '789-3', '2341-67', '456-2', '1123-9', '2987-45', '567-11'],
      'Occupational Therapy': ['2234-7', '4567-23', '891-6', '3456-89'],
      'Speech Therapy': ['1298-4', '5678-34', '234-8']
    },
    status: 'Active',
    assignedTherapists: ['Anna Schmidt', 'Emma Richter', 'Lara Braun', 'Katharina Schulze']
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
    voNumbers: {
      'Physiotherapy': ['3456-1', '7890-23', '123-45'],
      'Occupational Therapy': ['4567-8', '8901-34', '234-56'],
      'Speech Therapy': ['5678-9', '9012-45']
    },
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
    voNumbers: {
      'Physiotherapy': ['6789-1', '123-4', '4567-89', '890-12', '3456-7', '789-23', '1234-56', '567-8', '9012-34', '345-67', '678-9', '1234-1'],
      'Occupational Therapy': ['7890-12', '234-56', '5678-90', '123-78', '4567-2', '890-34'],
      'Speech Therapy': ['8901-23', '345-67', '6789-01', '234-89']
    },
    status: 'Active',
    assignedTherapists: ['Anna Schmidt', 'Emma Richter', 'Lara Braun', 'Sebastian Krüger']
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
    voNumbers: {
      'Physiotherapy': ['9012-3', '456-78', '7890-12', '345-6', '6789-01', '234-5'],
      'Occupational Therapy': ['8901-23', '456-7', '789-01', '2345-6'],
      'Speech Therapy': ['1234-78', '567-90']
    },
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
    voNumbers: {
      'Physiotherapy': ['3456-78', '890-1', '2345-67', '678-90'],
      'Occupational Therapy': ['4567-8', '901-23', '3456-78'],
      'Speech Therapy': ['5678-90', '123-45']
    },
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
    voNumbers: {
      'Physiotherapy': ['6789-01', '234-56'],
      'Occupational Therapy': ['7890-12', '345-67'],
      'Speech Therapy': ['8901-23', '456-78']
    },
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
    voNumbers: {
      'Physiotherapy': ['9012-34', '567-89', '1234-5', '678-90', '2345-67', '890-12', '3456-7', '789-01', '2345-6', '678-9'],
      'Occupational Therapy': ['4567-89', '012-34', '5678-9', '123-45', '6789-01'],
      'Speech Therapy': ['7890-12', '345-67', '8901-23']
    },
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
    voNumbers: {
      'Physiotherapy': ['1456-78', '234-9', '5678-01', '345-67', '7890-12', '456-7', '8901-23', '567-89', '1234-56', '678-9', '2345-67', '890-1', '3456-78', '789-01', '2345-6'],
      'Occupational Therapy': ['4567-89', '012-3', '5678-90', '123-4', '6789-01', '234-56', '7890-12', '345-6'],
      'Speech Therapy': ['8901-23', '456-78', '9012-34', '567-8', '1234-56']
    },
    status: 'Active',
    assignedTherapists: ['Julia Hoffmann', 'Maya Schulz', 'Alexander König', 'Franziska Huber']
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
    voNumbers: {
      'Physiotherapy': ['2678-90', '123-45', '4567-8', '789-01', '2345-67', '890-12', '3456-78', '901-23', '4567-89', '012-34', '5678-9'],
      'Occupational Therapy': ['6789-01', '234-56', '7890-12', '345-67', '8901-23', '456-78'],
      'Speech Therapy': ['9012-34', '567-89', '1234-56']
    },
    status: 'Active',
    assignedTherapists: ['Lars Becker', 'Noah König']
  },
  {
    id: 'E21',
    name: '(Pflegewerk) Theodorus Senioren Centrum Michaelkirchstraße',
    location: 'Berlin',
    address: 'Michaelkirchstraße 89, 10179 Berlin-Mitte',
    activeVOs: 25,
    prescriptionsByType: {
      'Physiotherapy': 14,
      'Occupational Therapy': 7,
      'Speech Therapy': 4
    },
    voNumbers: {
      'Physiotherapy': ['3678-90', '123-4', '4567-89', '012-34', '5678-90', '123-45', '6789-01', '234-56', '7890-12', '345-67', '8901-23', '456-78', '9012-34', '567-89'],
      'Occupational Therapy': ['1234-56', '678-90', '2345-67', '890-12', '3456-78', '901-23', '4567-89'],
      'Speech Therapy': ['5678-90', '123-45', '6789-01', '234-56']
    },
    status: 'Maintenance',
    assignedTherapists: ['Sarah Klein', 'Sophie Fischer', 'Elias Wolf', 'Maximilian Förster']
  }
];

const locations = ['Berlin', 'Munich', 'Hamburg', 'Frankfurt', 'Cologne'];
const statusOptions = ['Active', 'Maintenance', 'Inactive'];

// Full therapist data (consistent with TeamSection)
const allTherapists = [
  {
    id: 1,
    name: 'Anna Schmidt',
    email: 'anna.schmidt@therapios.com',
    phone: '+49 30 12345001',
    therapistType: 'Physiotherapy',
    location: 'Berlin',
    status: 'Active',
    utilization: 45
  },
  {
    id: 2,
    name: 'Michael Weber',
    email: 'michael.weber@therapios.com',
    phone: '+49 89 12345002',
    therapistType: 'Occupational Therapy',
    location: 'Munich',
    status: 'Active',
    utilization: 72
  },
  {
    id: 3,
    name: 'Sarah Klein',
    email: 'sarah.klein@therapios.com',
    phone: '+49 40 12345003',
    therapistType: 'Speech Therapy',
    location: 'Hamburg',
    status: 'Active',
    utilization: 83
  },
  {
    id: 4,
    name: 'Thomas Müller',
    email: 'thomas.mueller@therapios.com',
    phone: '+49 69 12345004',
    therapistType: 'Physiotherapy',
    location: 'Frankfurt',
    status: 'Active',
    utilization: 28
  },
  {
    id: 5,
    name: 'Julia Hoffmann',
    email: 'julia.hoffmann@therapios.com',
    phone: '+49 221 12345005',
    therapistType: 'Occupational Therapy',
    location: 'Cologne',
    status: 'Inactive',
    utilization: 0
  },
  {
    id: 6,
    name: 'Lars Becker',
    email: 'lars.becker@therapios.com',
    phone: '+49 30 12345006',
    therapistType: 'Physiotherapy',
    location: 'Berlin',
    status: 'Active',
    utilization: 91
  },
  {
    id: 7,
    name: 'Emma Richter',
    email: 'emma.richter@therapios.com',
    phone: '+49 89 12345007',
    therapistType: 'Speech Therapy',
    location: 'Munich',
    status: 'Active',
    utilization: 56
  },
  {
    id: 8,
    name: 'Felix Wagner',
    email: 'felix.wagner@therapios.com',
    phone: '+49 40 12345008',
    therapistType: 'Physiotherapy',
    location: 'Hamburg',
    status: 'Active',
    utilization: 67
  },
  {
    id: 9,
    name: 'Sophie Fischer',
    email: 'sophie.fischer@therapios.com',
    phone: '+49 69 12345009',
    therapistType: 'Occupational Therapy',
    location: 'Frankfurt',
    status: 'Active',
    utilization: 38
  },
  {
    id: 10,
    name: 'Leon Zimmermann',
    email: 'leon.zimmermann@therapios.com',
    phone: '+49 221 12345010',
    therapistType: 'Speech Therapy',
    location: 'Cologne',
    status: 'Active',
    utilization: 79
  },
  {
    id: 11,
    name: 'Maya Schulz',
    email: 'maya.schulz@therapios.com',
    phone: '+49 30 12345011',
    therapistType: 'Physiotherapy',
    location: 'Berlin',
    status: 'Inactive',
    utilization: 0
  },
  {
    id: 12,
    name: 'Noah König',
    email: 'noah.koenig@therapios.com',
    phone: '+49 89 12345012',
    therapistType: 'Occupational Therapy',
    location: 'Munich',
    status: 'Active',
    utilization: 52
  },
  {
    id: 13,
    name: 'Lara Braun',
    email: 'lara.braun@therapios.com',
    phone: '+49 40 12345013',
    therapistType: 'Speech Therapy',
    location: 'Hamburg',
    status: 'Active',
    utilization: 85
  },
  {
    id: 14,
    name: 'Elias Wolf',
    email: 'elias.wolf@therapios.com',
    phone: '+49 69 12345014',
    therapistType: 'Physiotherapy',
    location: 'Frankfurt',
    status: 'Active',
    utilization: 31
  },
  {
    id: 15,
    name: 'Hannah Krause',
    email: 'hannah.krause@therapios.com',
    phone: '+49 221 12345015',
    therapistType: 'Occupational Therapy',
    location: 'Cologne',
    status: 'Active',
    utilization: 63
  },
  {
    id: 16,
    name: 'Maximilian Förster',
    email: 'max.foerster@therapios.com',
    phone: '+49 30 12345016',
    therapistType: 'Speech Therapy',
    location: 'Berlin',
    status: 'Active',
    utilization: 22
  },
  {
    id: 17,
    name: 'Amelie Hartmann',
    email: 'amelie.hartmann@therapios.com',
    phone: '+49 89 12345017',
    therapistType: 'Physiotherapy',
    location: 'Munich',
    status: 'Active',
    utilization: 74
  },
  {
    id: 18,
    name: 'Jonas Neumann',
    email: 'jonas.neumann@therapios.com',
    phone: '+49 40 12345018',
    therapistType: 'Occupational Therapy',
    location: 'Hamburg',
    status: 'Active',
    utilization: 89
  },
  {
    id: 19,
    name: 'Katharina Schulze',
    email: 'katharina.schulze@therapios.com',
    phone: '+49 30 12345019',
    therapistType: 'Physiotherapy',
    location: 'Berlin',
    status: 'Active',
    utilization: 55
  },
  {
    id: 20,
    name: 'Alexander König',
    email: 'alexander.koenig@therapios.com',
    phone: '+49 89 12345020',
    therapistType: 'Occupational Therapy',
    location: 'Munich',
    status: 'Active',
    utilization: 67
  },
  {
    id: 21,
    name: 'Isabel Werner',
    email: 'isabel.werner@therapios.com',
    phone: '+49 40 12345021',
    therapistType: 'Speech Therapy',
    location: 'Hamburg',
    status: 'Active',
    utilization: 39
  },
  {
    id: 22,
    name: 'Maximilian Bayer',
    email: 'maximilian.bayer@therapios.com',
    phone: '+49 69 12345022',
    therapistType: 'Physiotherapy',
    location: 'Frankfurt',
    status: 'Active',
    utilization: 82
  },
  {
    id: 23,
    name: 'Charlotte Vogel',
    email: 'charlotte.vogel@therapios.com',
    phone: '+49 221 12345023',
    therapistType: 'Occupational Therapy',
    location: 'Cologne',
    status: 'Active',
    utilization: 48
  },
  {
    id: 24,
    name: 'Sebastian Krüger',
    email: 'sebastian.krueger@therapios.com',
    phone: '+49 30 12345024',
    therapistType: 'Speech Therapy',
    location: 'Berlin',
    status: 'Active',
    utilization: 91
  },
  {
    id: 25,
    name: 'Franziska Huber',
    email: 'franziska.huber@therapios.com',
    phone: '+49 89 12345025',
    therapistType: 'Physiotherapy',
    location: 'Munich',
    status: 'Active',
    utilization: 23
  },
  {
    id: 26,
    name: 'Daniel Sommer',
    email: 'daniel.sommer@therapios.com',
    phone: '+49 40 12345026',
    therapistType: 'Occupational Therapy',
    location: 'Hamburg',
    status: 'Active',
    utilization: 76
  },
  {
    id: 27,
    name: 'Vanessa Wolf',
    email: 'vanessa.wolf@therapios.com',
    phone: '+49 69 12345027',
    therapistType: 'Speech Therapy',
    location: 'Frankfurt',
    status: 'Active',
    utilization: 65
  },
  {
    id: 28,
    name: 'Tobias Lange',
    email: 'tobias.lange@therapios.com',
    phone: '+49 221 12345028',
    therapistType: 'Physiotherapy',
    location: 'Cologne',
    status: 'Active',
    utilization: 34
  },
  {
    id: 29,
    name: 'Christina Becker',
    email: 'christina.becker@therapios.com',
    phone: '+49 89 12345029',
    therapistType: 'Occupational Therapy',
    location: 'Munich',
    status: 'Active',
    utilization: 88
  },
  {
    id: 30,
    name: 'Patrick Roth',
    email: 'patrick.roth@therapios.com',
    phone: '+49 40 12345030',
    therapistType: 'Speech Therapy',
    location: 'Hamburg',
    status: 'Active',
    utilization: 42
  }
];

// Get assigned therapists based on ECH data
const getAssignedTherapists = (echId: string) => {
  // Find the ECH and get its assigned therapists
  const ech = sampleECHs.find(e => e.id === echId);
  if (!ech || !ech.assignedTherapists) return [];
  
  // Map therapist names to full therapist objects and add mock VO counts
  return ech.assignedTherapists.map((therapistName: string) => {
    const therapist = allTherapists.find(t => t.name === therapistName);
    if (!therapist) return null;
    
    // Add mock active VO count based on therapist and ECH
    const activeVOs = Math.floor(Math.random() * 4) + 1; // 1-4 VOs
    
    return {
      ...therapist,
      activeVOs
    };
  }).filter((therapist): therapist is NonNullable<typeof therapist> => therapist !== null);
};

interface ECHDetailsProps {
  echId: string;
  onBack: () => void;
  onFindTherapists?: (echId: string, therapyTypes: string[]) => void;
}

export default function ECHDetailsSection({ echId, onBack, onFindTherapists }: ECHDetailsProps) {
  // Find the ECH data
  const echData = sampleECHs.find(ech => ech.id === echId);
  const assignedTherapists = getAssignedTherapists(echId);
  
  const [formData, setFormData] = useState({
    id: echData?.id || '',
    name: echData?.name || '',
    location: echData?.location || '',
    address: echData?.address || '',
    status: echData?.status || 'Active'
  });

  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Updating ECH:', formData);
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 3000);
  };

  if (!echData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-[#0f2c59] hover:text-[#1a3a6b] transition-colors"
          >
            <ArrowLeft size={20} />
            Back to ECH List
          </button>
        </div>
        <div className="bg-white p-6 rounded-lg border text-center">
          <p className="text-gray-600">ECH not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-[#0f2c59] hover:text-[#1a3a6b] transition-colors"
        >
          <ArrowLeft size={20} />
          Back to ECH List
        </button>
        <div>
          <h2 className="text-xl font-semibold text-[#0f2c59]">Edit ECH</h2>
          <p className="text-gray-600">Update elderly care home information</p>
        </div>
      </div>

      {/* Success Message */}
      {showSuccessMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
            <span className="text-green-800 font-medium">ECH updated successfully!</span>
          </div>
        </div>
      )}

      {/* Edit Form */}
      <div className="bg-white p-8 rounded-lg border">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold text-[#0f2c59] mb-6">Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ECH ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="id"
                  value={formData.id}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ECH Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0f2c59] focus:border-transparent"
                  placeholder="Name of the ECH"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location <span className="text-red-500">*</span>
                </label>
                <select
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0f2c59] focus:border-transparent"
                >
                  {locations.map(location => (
                    <option key={location} value={location}>{location}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status <span className="text-red-500">*</span>
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0f2c59] focus:border-transparent"
                >
                  {statusOptions.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address <span className="text-red-500">*</span>
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                required
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0f2c59] focus:border-transparent"
                placeholder="Full address of the ECH"
              />
            </div>
          </div>

          {/* Active Prescriptions */}
          <div>
            <h3 className="text-lg font-semibold text-[#0f2c59] mb-6">Active Prescriptions (VOs)</h3>
            <p className="text-gray-600 text-sm mb-6">
              Prescription overview by therapy type. VO numbers are managed by the prescription system.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {(['Physiotherapy', 'Occupational Therapy', 'Speech Therapy'] as const).map((therapyType) => {
                const count = echData?.prescriptionsByType?.[therapyType] || 0;
                const voNumbers = echData?.voNumbers?.[therapyType] || [];
                const colorClass = therapyType === 'Physiotherapy' ? 'border-blue-200 bg-blue-50' :
                                 therapyType === 'Occupational Therapy' ? 'border-purple-200 bg-purple-50' :
                                 'border-green-200 bg-green-50';
                const dotColor = therapyType === 'Physiotherapy' ? 'bg-blue-500' :
                               therapyType === 'Occupational Therapy' ? 'bg-purple-500' :
                               'bg-green-500';
                
                return (
                  <div key={therapyType} className={`border rounded-lg p-4 ${colorClass}`}>
                    <div className="flex items-center gap-2 mb-3">
                      <div className={`w-3 h-3 rounded-full ${dotColor}`}></div>
                      <h4 className="font-medium text-gray-900">{therapyType}</h4>
                    </div>
                    
                    <div className="mb-3">
                      <div className="text-2xl font-bold text-gray-900">{count}</div>
                      <div className="text-sm text-gray-600">Active Prescriptions</div>
                    </div>
                    
                    {count > 0 && (
                      <div>
                        <div className="text-xs font-medium text-gray-700 mb-2">VO Numbers:</div>
                        <div className="text-xs text-gray-600 space-y-1 max-h-32 overflow-y-auto">
                          {voNumbers.slice(0, 5).map((vo: string, index: number) => (
                            <div key={index} className="bg-white/50 px-2 py-1 rounded text-xs">
                              {vo}
                            </div>
                          ))}
                          {voNumbers.length > 5 && (
                            <div className="text-gray-500 italic">
                              +{voNumbers.length - 5} more VOs...
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
            <button
              type="submit"
              className="bg-[#0f2c59] text-white px-6 py-2 rounded-lg hover:bg-[#1a3a6b] transition-colors"
            >
              Update ECH
            </button>
            <button
              type="button"
              onClick={onBack}
              className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      {/* Assigned Therapists */}
      <div className="bg-white p-6 rounded-lg border">
        <div className="flex items-center gap-2 mb-4">
          <Users className="text-[#0f2c59]" size={20} />
          <h3 className="text-lg font-semibold text-[#0f2c59]">Assigned Therapists</h3>
          <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-sm">
            {assignedTherapists.length} therapist{assignedTherapists.length !== 1 ? 's' : ''}
          </span>
        </div>
        <p className="text-gray-600 text-sm mb-4">
          Therapists currently working on VOs (prescriptions) for this ECH. This list is automatically updated based on active prescriptions.
        </p>

        {assignedTherapists.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Users className="mx-auto mb-2 text-gray-300" size={32} />
            <p>No therapists currently assigned to this ECH</p>
            <p className="text-sm">Therapists will appear here when VOs are assigned</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {['Physiotherapy', 'Occupational Therapy', 'Speech Therapy'].map(therapyType => {
              const therapistsForType = assignedTherapists.filter(t => t.therapistType === therapyType);
              return (
                <div key={therapyType}>
                  <h4 className="font-medium text-[#0f2c59] mb-3">{therapyType}</h4>
                  <div className="space-y-2">
                    {therapistsForType.length === 0 ? (
                      <p className="text-sm text-gray-500 italic">No therapists assigned</p>
                    ) : (
                      therapistsForType.map((therapist) => (
                        <div key={therapist.id} className="p-3 bg-gray-50 rounded-lg border">
                          <h5 className="font-medium text-gray-900">{therapist.name}</h5>
                          <p className="text-xs text-gray-600 mt-1">{therapist.therapistType}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
} 