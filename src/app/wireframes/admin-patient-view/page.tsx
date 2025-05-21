'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import WireframeLayout from '@/components/WireframeLayout';

// Define a type for VO (prescription) data
type VO = {
  id: string;
  aktVO?: string;
  issueDate?: string;
  expiryDate?: string;
  therapist: string;
  doctor: string;
  voStatus?: string;
  adminStatus: string;
  hasNote?: boolean;
  doppelBeh?: string;
  isActive?: boolean;
  isPlaceholder?: boolean;
};

// Updated Patient type with expanded state and VOs
type Patient = {
  id: number;
  name: string;
  birthDate: string;
  facility: string;
  patientStatus: 'Needs New VO - Urgent' | 'VO Ordered - Pending' | 'VO Ready for Transition' | 'Active Treatment' | 'Treatment Complete';
  expanded: boolean;
  vos: VO[];
};

// SVG Icons for status indicators
const WarningIcon = () => (
  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
  </svg>
);

const ClockIcon = () => (
  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
  </svg>
);

const CheckmarkIcon = () => (
  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
  </svg>
);

export default function AdminPatientViewWireframe() {
  const [dateFilter, setDateFilter] = useState("01.03.2025 - 31.03.2025");
  const [therapistFilter, setTherapistFilter] = useState("(Select)");
  const [voStatusFilter, setVoStatusFilter] = useState("VO Status");
  const [patientStatusFilter, setPatientStatusFilter] = useState("All Patients");
  const [searchTerm, setSearchTerm] = useState("");
  const [showColumns, setShowColumns] = useState(false);
  const [selectedPatients, setSelectedPatients] = useState<number[]>([]);
  
  // Updated mock data for patients with the new structure
  const [patients, setPatients] = useState<Patient[]>([
    {
      id: 1,
      name: "Erna Aderhold",
      birthDate: "29.5.1940",
      facility: "Seniorenzentrum Sonnenschein",
      patientStatus: "VO Ordered - Pending",
      expanded: false,
      vos: [
        {
          id: "VO-NEW-001",
          therapist: "J. Peter",
          doctor: "C. Otto",
          adminStatus: "Bestellt",
          isActive: false,
          isPlaceholder: true
        },
        {
          id: "VO-2022-001",
          aktVO: "[3206-0]",
          issueDate: "15.12.2024",
          expiryDate: "15.03.2025",
          therapist: "J. Peter",
          doctor: "C. Otto",
          voStatus: "10 / 10",
          adminStatus: "Abgeschlossen",
          hasNote: true,
          doppelBeh: "Select",
          isActive: false
        }
      ]
    },
    {
      id: 2,
      name: "Günter Ahr",
      birthDate: "26.11.1929",
      facility: "Pflegeheim Waldblick",
      patientStatus: "Active Treatment",
      expanded: false,
      vos: [
        {
          id: "VO-2023-002",
          aktVO: "[2281-5]",
          issueDate: "20.03.2025",
          expiryDate: "20.06.2025",
          therapist: "L. Weiske",
          doctor: "J. Banzhaf",
          voStatus: "2 / 10",
          adminStatus: "In Behandlung",
          hasNote: true,
          doppelBeh: "Select",
          isActive: true
        },
        {
          id: "VO-2022-002",
          aktVO: "[2281-4]",
          issueDate: "10.12.2024",
          expiryDate: "10.03.2025",
          therapist: "L. Weiske",
          doctor: "J. Banzhaf",
          voStatus: "10 / 10",
          adminStatus: "Abgeschlossen",
          hasNote: true,
          doppelBeh: "Select",
          isActive: false
        },
        {
          id: "VO-2021-002",
          aktVO: "[2281-3]",
          issueDate: "15.09.2024",
          expiryDate: "15.12.2024",
          therapist: "L. Weiske",
          doctor: "J. Banzhaf",
          voStatus: "10 / 10",
          adminStatus: "Abgeschlossen",
          hasNote: true,
          doppelBeh: "Select",
          isActive: false
        }
      ]
    },
    {
      id: 3,
      name: "Christel Albrecht",
      birthDate: "30.12.1931",
      facility: "Altenheim St. Elisabeth",
      patientStatus: "Active Treatment",
      expanded: false,
      vos: [
        {
          id: "VO-2023-003",
          aktVO: "[3022-3]",
          issueDate: "10.03.2025",
          expiryDate: "10.06.2025",
          therapist: "J. Scheffler",
          doctor: "S. Dulce 3",
          voStatus: "3 / 10",
          adminStatus: "In Behandlung",
          hasNote: true,
          doppelBeh: "Select",
          isActive: true
        },
        {
          id: "VO-2022-003",
          aktVO: "[3022-2]",
          issueDate: "05.12.2024",
          expiryDate: "05.03.2025",
          therapist: "J. Scheffler",
          doctor: "S. Dulce 3",
          voStatus: "10 / 10",
          adminStatus: "Abgeschlossen",
          hasNote: true,
          doppelBeh: "Select",
          isActive: false
        }
      ]
    },
    {
      id: 4,
      name: "Knut Andersohn",
      birthDate: "1.9.1934",
      facility: "Seniorenheim Rosengarten",
      patientStatus: "Treatment Complete",
      expanded: false,
      vos: [
        {
          id: "VO-2023-004",
          aktVO: "[2669-4]",
          issueDate: "29.03.2025",
          expiryDate: "29.06.2025",
          therapist: "I. Kluke",
          doctor: "D. Koubek",
          voStatus: "10 / 10",
          adminStatus: "Abgeschlossen",
          hasNote: true,
          doppelBeh: "Select",
          isActive: false
        },
        {
          id: "VO-2022-004",
          aktVO: "[2669-3]",
          issueDate: "20.12.2024",
          expiryDate: "20.03.2025",
          therapist: "I. Kluke",
          doctor: "D. Koubek",
          voStatus: "10 / 10",
          adminStatus: "Abgeschlossen",
          hasNote: true,
          doppelBeh: "Select",
          isActive: false
        }
      ]
    },
    {
      id: 5,
      name: "Gisela Annick",
      birthDate: "16.12.1930",
      facility: "Seniorenstift Am Park",
      patientStatus: "VO Ordered - Pending",
      expanded: false,
      vos: [
        {
          id: "VO-2023-005",
          aktVO: "[1581-6]",
          issueDate: "29.03.2025",
          expiryDate: "29.06.2025",
          therapist: "F. Becker",
          doctor: "S. Dulce",
          voStatus: "4 / 12",
          adminStatus: "In Behandlung",
          hasNote: true,
          doppelBeh: "Select",
          isActive: true
        },
        {
          id: "VO-NEW-005",
          therapist: "F. Becker",
          doctor: "S. Dulce",
          adminStatus: "Bestellt",
          isActive: false,
          isPlaceholder: true
        },
        {
          id: "VO-2022-005",
          aktVO: "[1581-5]",
          issueDate: "15.12.2024",
          expiryDate: "15.03.2025",
          therapist: "F. Becker",
          doctor: "S. Dulce",
          voStatus: "12 / 12",
          adminStatus: "Abgeschlossen",
          hasNote: true,
          doppelBeh: "Select",
          isActive: false
        },
      ]
    },
    {
      id: 6,
      name: "Renate Baase",
      birthDate: "21.4.1946",
      facility: "Altenheim St. Andreas",
      patientStatus: "Treatment Complete",
      expanded: false,
      vos: [
        {
          id: "VO-2023-006",
          aktVO: "[597-22]",
          issueDate: "04.03.2025",
          expiryDate: "04.06.2025",
          therapist: "H. Panagopoulos",
          doctor: "D. Niedeggen",
          voStatus: "0 / 10",
          adminStatus: "Abgelehnt",
          hasNote: true,
          doppelBeh: "Select",
          isActive: false
        }
      ]
    },
    {
      id: 7,
      name: "Margarete Bachmeier",
      birthDate: "13.9.1940",
      facility: "Pflegeheim Waldblick",
      patientStatus: "VO Ordered - Pending",
      expanded: false,
      vos: [
        {
          id: "VO-NEW-007",
          therapist: "J. Scheffler",
          doctor: "S. Dulce 3",
          adminStatus: "Bestellt",
          isActive: false,
          isPlaceholder: true
        },
        {
          id: "VO-2022-007",
          aktVO: "[9921-2]",
          issueDate: "01.12.2024",
          expiryDate: "01.03.2025",
          therapist: "J. Scheffler",
          doctor: "S. Dulce 3",
          voStatus: "10 / 10",
          adminStatus: "Abgeschlossen",
          hasNote: true,
          doppelBeh: "Select",
          isActive: false
        }
      ]
    },
    {
      id: 8,
      name: "Manfred Bach",
      birthDate: "22.12.1939",
      facility: "Seniorenzentrum Lebensfreude",
      patientStatus: "VO Ready for Transition",
      expanded: false,
      vos: [
        {
          id: "VO-2023-008",
          aktVO: "[2414-5]",
          issueDate: "28.02.2025",
          expiryDate: "28.05.2025",
          therapist: "K. Mischke",
          doctor: "B. Tönneßen",
          voStatus: "0 / 0",
          adminStatus: "Neu ausstellen",
          hasNote: true,
          doppelBeh: "Select",
          isActive: false
        },
        {
          id: "VO-2022-008",
          aktVO: "[2414-4]",
          issueDate: "15.11.2024",
          expiryDate: "15.02.2025",
          therapist: "K. Mischke",
          doctor: "B. Tönneßen",
          voStatus: "10 / 10",
          adminStatus: "Abgeschlossen",
          hasNote: true,
          doppelBeh: "Select",
          isActive: false
        }
      ]
    },
    {
      id: 9,
      name: "Margot Bahle",
      birthDate: "17.3.1934",
      facility: "Seniorenresidenz Blumenfeld",
      patientStatus: "Active Treatment",
      expanded: false,
      vos: [
        {
          id: "VO-2023-009",
          aktVO: "[740-8]",
          issueDate: "13.03.2025",
          expiryDate: "13.06.2025",
          therapist: "M. Selz",
          doctor: "D. Hubalek",
          voStatus: "5 / 12",
          adminStatus: "In Behandlung",
          hasNote: true,
          doppelBeh: "Select",
          isActive: true
        },
        {
          id: "VO-2022-009",
          aktVO: "[740-7]",
          issueDate: "10.12.2024",
          expiryDate: "10.03.2025",
          therapist: "M. Selz",
          doctor: "D. Hubalek",
          voStatus: "12 / 12",
          adminStatus: "Abgeschlossen",
          hasNote: true,
          doppelBeh: "Select",
          isActive: false
        }
      ]
    },
    {
      id: 10,
      name: "Erika Ballach",
      birthDate: "14.5.1928",
      facility: "Altenpflegeheim St. Maria",
      patientStatus: "Active Treatment",
      expanded: false,
      vos: [
        {
          id: "VO-2023-010",
          aktVO: "[1668-12]",
          issueDate: "05.03.2025",
          expiryDate: "05.06.2025",
          therapist: "J. Scheffler",
          doctor: "S. Dulce 3",
          voStatus: "6 / 10",
          adminStatus: "In Behandlung",
          hasNote: true,
          doppelBeh: "Select",
          isActive: true
        },
        {
          id: "VO-2022-010",
          aktVO: "[1668-11]",
          issueDate: "01.12.2024",
          expiryDate: "01.03.2025",
          therapist: "J. Scheffler",
          doctor: "S. Dulce 3",
          voStatus: "10 / 10",
          adminStatus: "Abgeschlossen",
          hasNote: false,
          doppelBeh: "Select",
          isActive: false
        },
        {
          id: "VO-2021-010",
          aktVO: "[1668-10]",
          issueDate: "01.09.2024",
          expiryDate: "01.12.2024",
          therapist: "J. Scheffler",
          doctor: "S. Dulce 3",
          voStatus: "10 / 10",
          adminStatus: "Abgeschlossen",
          hasNote: true,
          doppelBeh: "Select",
          isActive: false
        }
      ]
    },
    {
      id: 11,
      name: "Herbert Schmidt",
      birthDate: "03.7.1932",
      facility: "Seniorenzentrum Lindenhof",
      patientStatus: "VO Ready for Transition",
      expanded: false,
      vos: [
        {
          id: "VO-2023-011A",
          aktVO: "[1875-8]",
          issueDate: "18.03.2025",
          expiryDate: "18.06.2025",
          therapist: "M. Weber",
          doctor: "K. Schulz",
          voStatus: "0 / 0",
          adminStatus: "Neu ausstellen",
          hasNote: true,
          doppelBeh: "Select",
          isActive: false
        },
        {
          id: "VO-2023-011",
          aktVO: "[1875-7]",
          issueDate: "10.03.2025",
          expiryDate: "10.06.2025",
          therapist: "M. Weber",
          doctor: "K. Schulz",
          voStatus: "8 / 10",
          adminStatus: "In Behandlung",
          hasNote: true,
          doppelBeh: "Select",
          isActive: true
        }
      ]
    },
    {
      id: 12,
      name: "Ursula Krüger",
      birthDate: "27.8.1935",
      facility: "Seniorenresidenz Blumenfeld",
      patientStatus: "Needs New VO - Urgent",
      expanded: false,
      vos: [
        {
          id: "VO-2023-012",
          aktVO: "[1459-3]",
          issueDate: "01.01.2025",
          expiryDate: "01.04.2025",
          therapist: "F. Becker",
          doctor: "C. Otto",
          voStatus: "9 / 10",
          adminStatus: "In Behandlung",
          hasNote: true,
          doppelBeh: "Select",
          isActive: true
        }
      ]
    }
  ]);

  // Function to toggle the expanded state of a patient
  const toggleExpanded = (patientId: number) => {
    setPatients(patients.map(patient => 
      patient.id === patientId 
        ? { ...patient, expanded: !patient.expanded } 
        : patient
    ));
  };

  // Function to toggle patient selection
  const togglePatientSelection = (patientId: number, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row click from expanding
    if (selectedPatients.includes(patientId)) {
      setSelectedPatients(selectedPatients.filter(id => id !== patientId));
    } else {
      setSelectedPatients([...selectedPatients, patientId]);
    }
  };

  // Helper function to get status badge style
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'In Behandlung': return 'bg-green-100 border border-green-400 text-green-800';
      case 'Abgeschlossen': return 'bg-gray-100 border border-gray-400 text-gray-800';
      case 'Abgelehnt': return 'bg-red-100 border border-red-400 text-red-800';
      case 'Zu bestellen': return 'bg-amber-100 border border-amber-400 text-amber-800';
      case 'Neu ausstellen': return 'bg-blue-100 border border-blue-400 text-blue-800';
      case 'Bestellt': return 'bg-purple-100 border border-purple-400 text-purple-800';
      default: return 'bg-gray-100 border border-gray-400 text-gray-800';
    }
  };

  // Function to render patient status badge with appropriate styling
  const getPatientStatusBadge = (status: Patient['patientStatus']) => {
    switch (status) {
      case 'Needs New VO - Urgent':
        return (
          <div className="inline-flex items-center px-4 py-1 rounded-full bg-[#e53935] text-white">
            <WarningIcon />
            <span>Needs New VO - Urgent</span>
          </div>
        );
      case 'VO Ordered - Pending':
        return (
          <div className="inline-flex items-center px-4 py-1 rounded-full bg-[#ffc107] text-[#333]">
            <ClockIcon />
            <span>VO Ordered - Pending</span>
          </div>
        );
      case 'VO Ready for Transition':
        return (
          <div className="inline-flex items-center px-4 py-1 rounded-full bg-[#2196f3] text-white">
            <CheckmarkIcon />
            <span>VO Ready for Transition</span>
          </div>
        );
      case 'Active Treatment':
        return (
          <div className="inline-flex items-center px-4 py-1 rounded-full bg-[#4caf50] text-white">
            <span>Active Treatment</span>
          </div>
        );
      case 'Treatment Complete':
        return (
          <div className="inline-flex items-center px-4 py-1 rounded-full bg-[#9e9e9e] text-white">
            <span>Treatment Complete</span>
          </div>
        );
      default:
        return <span>{status}</span>;
    }
  };

  // Helper function to get color for patient status
  const getPatientStatusColor = (status: Patient['patientStatus']): string => {
    switch (status) {
      case 'Needs New VO - Urgent': return '#e53935';
      case 'VO Ordered - Pending': return '#ffc107';
      case 'VO Ready for Transition': return '#2196f3';
      case 'Active Treatment': return '#4caf50';
      case 'Treatment Complete': return '#9e9e9e';
      default: return '#9e9e9e';
    }
  };

  return (
    <WireframeLayout title="Therapios" username="Super Admin" userInitials="SA" showSidebar={false}>
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <p className="text-gray-700">Hello Super Admin, I hope you have a wonderful day.</p>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard - Verwaltung</h1>
        </div>

        {/* Filter controls */}
        <div className="flex justify-end gap-2 mb-6">
          <div className="relative">
            <select 
              className="border border-gray-300 rounded-md px-3 py-2 appearance-none pr-8 bg-white"
              value={patientStatusFilter}
              onChange={(e) => setPatientStatusFilter(e.target.value)}
            >
              <option>All Patients</option>
              <option>Needs New VO - Urgent</option>
              <option>VO Ordered - Pending</option>
              <option>VO Ready for Transition</option>
              <option>Active Treatment</option>
              <option>Treatment Complete</option>
            </select>
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          <div className="relative">
            <select 
              className="border border-gray-300 rounded-md px-3 py-2 appearance-none pr-8 bg-white"
              value={voStatusFilter}
              onChange={(e) => setVoStatusFilter(e.target.value)}
            >
              <option>VO Status</option>
              <option>Bestellt</option>
              <option>In Behandlung</option>
              <option>Abgeschlossen</option>
              <option>Abgelehnt</option>
              <option>Zu bestellen</option>
            </select>
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          <div className="relative">
            <select 
              className="border border-gray-300 rounded-md px-3 py-2 appearance-none pr-8 bg-white"
              value={therapistFilter}
              onChange={(e) => setTherapistFilter(e.target.value)}
            >
              <option>Therapist: (Select)</option>
              <option>J. Peter</option>
              <option>L. Weiske</option>
              <option>J. Scheffler</option>
              <option>I. Kluke</option>
              <option>F. Becker</option>
            </select>
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          <div className="relative border border-gray-300 rounded-md px-3 py-2 flex items-center">
            <span>Period: {dateFilter}</span>
            <svg className="w-5 h-5 ml-2 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
          </div>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="border-l-4 border-red-500 pl-4 p-4 bg-white rounded-md shadow-sm">
            <div className="flex items-center text-gray-600 text-sm">
              <WarningIcon />
              <span>Patients Needing New VOs</span>
            </div>
            <p className="text-2xl font-bold">
              {patients.filter(p => p.patientStatus === 'Needs New VO - Urgent').length}
            </p>
          </div>
          <div className="border-l-4 border-amber-500 pl-4 p-4 bg-white rounded-md shadow-sm">
            <div className="flex items-center text-gray-600 text-sm">
              <ClockIcon />
              <span>Patients with Pending VOs</span>
            </div>
            <p className="text-2xl font-bold">
              {patients.filter(p => p.patientStatus === 'VO Ordered - Pending').length}
            </p>
          </div>
        </div>

        {/* Data table */}
        <div className="bg-white rounded-md shadow overflow-hidden">
          <div className="flex justify-between p-4">
            <div className="flex items-center gap-2">
              <div className="relative">
                <button 
                  onClick={() => setShowColumns(!showColumns)}
                  className="flex items-center space-x-1 bg-white border border-gray-300 rounded-md px-3 py-1.5 text-sm"
                >
                  <span>Show columns</span>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
                
                {showColumns && (
                  <div className="absolute z-10 mt-1 w-56 bg-white border border-gray-200 rounded-md shadow-lg">
                    <div className="p-2 space-y-1">
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-2" defaultChecked />
                        <span>Name</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-2" defaultChecked />
                        <span>Date of Birth</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-2" defaultChecked />
                        <span>Facility</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-2" defaultChecked />
                        <span>Patient Status</span>
                      </label>
                    </div>
                  </div>
                )}
              </div>
              
              <button 
                className="flex items-center space-x-1 bg-blue-600 text-white border border-blue-700 rounded-md px-3 py-1.5 text-sm"
                onClick={() => alert(`Order VOs for selected patients`)}
              >
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                </svg>
                <span>Order VO</span>
              </button>
            </div>
            <div className="relative">
              <input
                type="text"
                placeholder="Search"
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {/* Column for expand/collapse */}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date of Birth
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Facility
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {patients.map((patient) => (
                  <React.Fragment key={patient.id}>
                    <tr 
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => toggleExpanded(patient.id)}
                      style={{ height: '60px' }}
                    >
                      <td className="px-3 py-4 whitespace-nowrap">
                        <div className="text-gray-500">
                          {patient.expanded ? (
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{patient.name}</div>
                        {patient.vos.length > 1 && (
                          <div className="inline-flex items-center text-xs bg-gray-100 text-gray-700 rounded-full px-2 py-0.5 mt-1">
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm3 1h6v4H7V5zm8 8v2H5v-2h10zM5 8h10v2H5V8z" clipRule="evenodd" />
                            </svg>
                            {patient.vos.length} VOs
                          </div>
                        )}
                        {patient.vos.length === 1 && patient.vos[0].isPlaceholder && (
                          <div className="inline-flex items-center text-xs bg-purple-100 text-purple-700 rounded-full px-2 py-0.5 mt-1">
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                            </svg>
                            VO Bestellt
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{patient.birthDate}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{patient.facility}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getPatientStatusBadge(patient.patientStatus)}
                      </td>
                    </tr>
                    
                    {/* Expanded VO Section */}
                    {patient.expanded && (
                      <tr>
                        <td colSpan={6} className="p-0">
                          <div 
                            className="overflow-hidden transition-all duration-300 ease-in-out" 
                            style={{ maxHeight: patient.expanded ? '1000px' : '0' }}
                          >
                            <div 
                              className="bg-gray-50 ml-16 border-l-[3px]" 
                              style={{ borderLeftColor: getPatientStatusColor(patient.patientStatus) }}
                            >
                              {/* VO Table Header */}
                              <div className="grid grid-cols-9 gap-4 px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                                <div>Therapist</div>
                                <div>VO#</div>
                                <div>Est. End Date</div>
                                <div>VO Status</div>
                                <div>Doctor</div>
                                <div>Remarks</div>
                                <div>Ausst. Datum</div>
                                <div>Admin Status</div>
                                <div>Logs</div>
                              </div>
                              
                              {/* VO Rows */}
                              <div>
                                {patient.vos
                                  .sort((a, b) => {
                                    const dateA = a.issueDate ? new Date(a.issueDate).getTime() : 0;
                                    const dateB = b.issueDate ? new Date(b.issueDate).getTime() : 0;
                                    return dateB - dateA;
                                  })
                                  .map((vo, index) => (
                                  <div 
                                    key={vo.id}
                                    className={`grid grid-cols-9 gap-4 px-6 py-3 ${
                                      index !== patient.vos.length - 1 ? 'border-b border-gray-200' : ''
                                    } ${vo.isActive ? 'font-medium' : 'opacity-80'} ${
                                      vo.isPlaceholder ? 'border border-dashed border-gray-300 bg-gray-50 rounded-md my-1' : ''
                                    }`}
                                    style={{ height: '50px' }}
                                  >
                                    <div className="flex items-center text-sm">{vo.therapist}</div>
                                    <div className="flex items-center text-sm">{vo.aktVO || '-'}</div>
                                    <div className="flex items-center text-sm">{vo.expiryDate || '-'}</div>
                                    <div className="flex items-center text-sm">{vo.voStatus || (vo.isPlaceholder ? '0 / 0' : '-')}</div>
                                    <div className="flex items-center text-sm">{vo.doctor}</div>
                                    <div className="flex items-center text-sm">
                                      {vo.hasNote && (
                                        <button className="flex items-center space-x-1 text-gray-600">
                                          <span>Add Note</span>
                                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                          </svg>
                                        </button>
                                      )}
                                    </div>
                                    <div className="flex items-center text-sm">{vo.issueDate || '-'}</div>
                                    <div className="flex items-center text-sm">
                                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusStyle(vo.adminStatus)}`}>
                                        {vo.adminStatus}
                                      </span>
                                    </div>
                                    <div className="flex items-center text-sm">
                                      <button className="text-gray-500 hover:text-gray-700">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200">
            <div className="flex items-center">
              <span className="text-sm text-gray-700">Rows per page</span>
              <div className="relative ml-2">
                <select className="border border-gray-300 rounded-md px-3 py-1 appearance-none pr-8 bg-white">
                  <option>10</option>
                  <option>25</option>
                  <option>50</option>
                  <option>100</option>
                </select>
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700">1-10 of 479</span>
              <button className="p-1 rounded-md border border-gray-300">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
              <button className="p-1 rounded-md border border-gray-300">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              <button className="p-1 rounded-md border border-gray-300">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </WireframeLayout>
  );
} 