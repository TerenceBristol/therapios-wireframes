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
  heilmittel?: string[]; // Array of Heilmittel codes
  isActive?: boolean;
  isPlaceholder?: boolean;
  selected?: boolean;
  patientName?: string;
  patientBirthDate?: string;
  patientFacility?: string;
};

// Updated Patient type with expanded state and VOs
type Patient = {
  id: number;
  name: string;
  birthDate: string;
  facility: string;
  patientTags: string[]; // Changed from patientStatus to patientTags array
  expanded: boolean;
  vos: VO[];
};

// Define Toast type for notifications
type Toast = {
  id: number;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
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

export default function AdminPatientVOOrderingWireframe() {
  const [dateFilter, setDateFilter] = useState("01.03.2025 - 31.03.2025");
  const [therapistFilter, setTherapistFilter] = useState("(Select)");
  const [voStatusFilter, setVoStatusFilter] = useState("VO Status");
  const [patientStatusFilter, setPatientStatusFilter] = useState("All Patients");
  const [searchTerm, setSearchTerm] = useState("");
  const [showColumns, setShowColumns] = useState(false);
  const [selectedPatients, setSelectedPatients] = useState<number[]>([]);
  
  // Add state variables for Order VO functionality
  const [isOrderViewActive, setIsOrderViewActive] = useState(false);
  const [selectAllChecked, setSelectAllChecked] = useState(false);
  const [doctorFilter, setDoctorFilter] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const [selectedOrdersForPdf, setSelectedOrdersForPdf] = useState<VO[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  
  // Helper function to determine patient tags based on VOs
  const determinePatientTags = (vos: VO[]): string[] => {
    const tags: string[] = [];
    
    // Check for each condition and add the appropriate tag
    if (vos.some(vo => vo.adminStatus === "In Behandlung - Expiring")) {
      tags.push("Expiring VO");
    }
    
    if (vos.some(vo => vo.adminStatus === "Bestellt")) {
      tags.push("VO Ordered");
    }
    
    if (vos.some(vo => vo.adminStatus === "Neu ausstellen")) {
      tags.push("VO Ready");
    }
    
    if (vos.some(vo => vo.adminStatus === "In Behandlung")) {
      tags.push("Active");
    }
    
    // If no tags were added, add "Complete"
    if (tags.length === 0) {
      tags.push("Complete");
    }
    
    return tags;
  };

  // Function to get style for a specific tag
  const getTagStyle = (tag: string) => {
    switch (tag) {
      case 'Expiring VO':
        return {
          bg: 'bg-red-600',
          text: 'text-white',
          icon: <WarningIcon />
        };
      case 'VO Ordered':
        return {
          bg: 'bg-amber-400',
          text: 'text-gray-800',
          icon: <ClockIcon />
        };
      case 'VO Ready':
        return {
          bg: 'bg-blue-500',
          text: 'text-white',
          icon: <CheckmarkIcon />
        };
      case 'Active':
        return {
          bg: 'bg-green-500',
          text: 'text-white',
          icon: null
        };
      case 'Complete':
        return {
          bg: 'bg-gray-500',
          text: 'text-white',
          icon: null
        };
      default:
        return {
          bg: 'bg-gray-200',
          text: 'text-gray-800',
          icon: null
        };
    }
  };

  // Updated mock data for patients with the new structure and correctly calculated statuses
  const [patients, setPatients] = useState<Patient[]>([
    {
      id: 1,
      name: "Erna Aderhold",
      birthDate: "29.5.1940",
      facility: "Seniorenzentrum Sonnenschein",
      patientTags: ["VO Ordered - Pending"], // This will be calculated by determinePatientStatus
      expanded: false,
      vos: [
        {
          id: "VO-NEW-001",
          therapist: "J. Peter",
          doctor: "C. Otto",
          adminStatus: "Bestellt",
          isActive: false,
          isPlaceholder: true,
          heilmittel: ["BGM", "AEB", "L-BD"]
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
          isActive: false,
          heilmittel: ["BGM", "AEB", "L-BD"]
        }
      ]
    },
    {
      id: 2,
      name: "Günter Ahr",
      birthDate: "26.11.1929",
      facility: "Pflegeheim Waldblick",
      patientTags: ["Active Treatment"],
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
          isActive: true,
          heilmittel: ["KG-H", "KG-H-BV", "BO-K"]
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
          isActive: false,
          heilmittel: ["KG-H", "KG-H-BV", "BO-K"]
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
          isActive: false,
          heilmittel: ["KG-H", "KG-H-BV", "BO-K"]
        }
      ]
    },
    {
      id: 3,
      name: "Christel Albrecht",
      birthDate: "30.12.1931",
      facility: "Altenheim St. Elisabeth",
      patientTags: ["Active Treatment"],
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
          adminStatus: "In Behandlung - Expiring",
          hasNote: true,
          doppelBeh: "Select",
          heilmittel: ["BGM", "KG-H-BV", "KG-VID-BV"],
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
          isActive: false,
          heilmittel: ["BGM", "KG-H-BV", "KG-VID-BV"]
        }
      ]
    },
    {
      id: 4,
      name: "Knut Andersohn",
      birthDate: "1.9.1934",
      facility: "Seniorenheim Rosengarten",
      patientTags: ["Treatment Complete"],
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
          isActive: false,
          heilmittel: ["MFB-2-HB", "MFB-E-HB", "MFB-G-HB"]
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
          isActive: false,
          heilmittel: ["MFB-2-HB", "MFB-E-HB", "MFB-G-HB"]
        }
      ]
    },
    {
      id: 5,
      name: "Gisela Annick",
      birthDate: "16.12.1930",
      facility: "Seniorenstift Am Park",
      patientTags: ["VO Ordered - Pending"],
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
          heilmittel: ["BO-E-H", "L-E30H", "MFB-2-HB"],
          isActive: true
        },
        {
          id: "VO-NEW-005",
          therapist: "F. Becker",
          doctor: "S. Dulce",
          adminStatus: "Bestellt",
          isActive: false,
          heilmittel: ["BO-E-H", "L-E30H", "MFB-2-HB"],
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
          isActive: false,
          heilmittel: ["BO-E-H", "L-E30H", "MFB-2-HB"]
        },
      ]
    },
    {
      id: 6,
      name: "Renate Baase",
      birthDate: "21.4.1946",
      facility: "Altenheim St. Andreas",
      patientTags: ["Treatment Complete"],
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
          isActive: false,
          heilmittel: ["L-E45H", "L-E60H", "BGM-BV"]
        }
      ]
    },
    {
      id: 7,
      name: "Margarete Bachmeier",
      birthDate: "13.9.1940",
      facility: "Pflegeheim Waldblick",
      patientTags: ["VO Ordered - Pending"],
      expanded: false,
      vos: [
        {
          id: "VO-NEW-007",
          therapist: "J. Scheffler",
          doctor: "S. Dulce 3",
          adminStatus: "Bestellt",
          isActive: false,
          isPlaceholder: true,
          heilmittel: ["KGM-H", "KMT-BV", "KMT-H"]
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
          isActive: false,
          heilmittel: ["KGM-H", "KMT-BV", "KMT-H"]
        }
      ]
    },
    {
      id: 8,
      name: "Manfred Bach",
      birthDate: "22.12.1939",
      facility: "Seniorenzentrum Lebensfreude",
      patientTags: ["VO Ready for Transition"],
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
          isActive: false,
          heilmittel: ["KOMP", "KT-H-BV", "L-BD"]
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
          isActive: false,
          heilmittel: ["KOMP", "KT-H-BV", "L-BD"]
        }
      ]
    },
    {
      id: 9,
      name: "Margot Bahle",
      birthDate: "17.3.1934",
      facility: "Seniorenresidenz Blumenfeld",
      patientTags: ["Active Treatment"],
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
          isActive: true,
          heilmittel: ["NOB-2-HB", "NOB-E-HB", "NOB-G-HB"]
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
          isActive: false,
          heilmittel: ["NOB-2-HB", "NOB-E-HB", "NOB-G-HB"]
        }
      ]
    },
    {
      id: 10,
      name: "Erika Ballach",
      birthDate: "14.5.1928",
      facility: "Altenpflegeheim St. Maria",
      patientTags: ["Active Treatment"],
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
          heilmittel: ["PFB-2-HB", "PFB-E-HB", "L-BD"],
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
          heilmittel: ["PFB-2-HB", "PFB-E-HB", "L-BD"],
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
          heilmittel: ["PFB-2-HB", "PFB-E-HB", "L-BD"],
          isActive: false
        }
      ]
    },
    {
      id: 11,
      name: "Herbert Schmidt",
      birthDate: "03.7.1932",
      facility: "Seniorenzentrum Lindenhof",
      patientTags: ["VO Ready for Transition"],
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
          heilmittel: ["HR-H-BV", "KG-H", "BGM"],
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
          heilmittel: ["HR-H-BV", "KG-H", "BGM"],
          isActive: true
        }
      ]
    },
    {
      id: 12,
      name: "Ursula Krüger",
      birthDate: "27.8.1935",
      facility: "Seniorenresidenz Blumenfeld",
      patientTags: ["Needs New VO - Urgent"],
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
          adminStatus: "In Behandlung - Expiring",
          hasNote: true,
          doppelBeh: "Select",
          heilmittel: ["L-ED", "PFB-G-HB", "PFB-2-HB"],
          isActive: true
        }
      ]
    },
    {
      id: 13,
      name: "Thomas Müller",
      birthDate: "15.6.1938",
      facility: "Seniorenzentrum Lindenhof",
      patientTags: [], // Will be calculated by determinePatientTags
      expanded: false,
      vos: [
        {
          id: "VO-2023-013A",
          aktVO: "[2567-4]",
          issueDate: "10.02.2025",
          expiryDate: "10.05.2025",
          therapist: "K. Mischke",
          doctor: "B. Tönneßen",
          voStatus: "0 / 0",
          adminStatus: "Neu ausstellen",
          hasNote: false,
          doppelBeh: "Select",
          isActive: false
        },
        {
          id: "VO-2023-013B",
          aktVO: "[2567-5]",
          issueDate: "01.03.2025",
          expiryDate: "01.06.2025",
          therapist: "K. Mischke",
          doctor: "B. Tönneßen",
          voStatus: "8 / 10",
          adminStatus: "In Behandlung - Expiring",
          hasNote: true,
          doppelBeh: "Select",
          heilmittel: ["NOB-2-HB", "NOB-E-HB", "NOB-G-HB"],
          isActive: true
        },
        {
          id: "VO-2022-013",
          aktVO: "[2567-3]",
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
    }
  ].map(patient => ({
    ...patient,
    patientTags: determinePatientTags(patient.vos) // Calculate correct status for each patient
  })));

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
      case 'In Behandlung - Expiring': return 'bg-amber-100 border border-amber-400 text-amber-800';
      case 'Abgeschlossen': return 'bg-gray-100 border border-gray-400 text-gray-800';
      case 'Abgelehnt': return 'bg-red-100 border border-red-400 text-red-800';
      case 'Zu bestellen': return 'bg-amber-100 border border-amber-400 text-amber-800';
      case 'Neu ausstellen': return 'bg-blue-100 border border-blue-400 text-blue-800';
      case 'Bestellt': return 'bg-purple-100 border border-purple-400 text-purple-800';
      default: return 'bg-gray-100 border border-gray-400 text-gray-800';
    }
  };

  // Function to render patient status badge with appropriate styling
  const getPatientStatusBadge = (tags: Patient['patientTags']) => {
    return (
      <div className="flex flex-wrap gap-1">
        {tags.map((tag, index) => {
          const style = getTagStyle(tag);
          return (
            <div key={index} className={`inline-flex items-center px-2 py-1 rounded-full ${style.bg} ${style.text} text-xs font-medium`}>
              {style.icon && <span className="mr-1">{style.icon}</span>}
              <span>{tag}</span>
            </div>
          );
        })}
      </div>
    );
  };

  // Helper function to get color for patient status (for border color)
  const getPatientStatusColor = (tags: Patient['patientTags']): string => {
    // Prioritize tags in this order
    const priorityOrder = ['Expiring VO', 'VO Ordered', 'VO Ready', 'Active', 'Complete'];
    
    // Find the highest priority tag
    for (const priority of priorityOrder) {
      if (tags.includes(priority)) {
        const style = getTagStyle(priority);
        // Extract hex color from the bg class
        return priority === 'Expiring VO' ? '#e53935' :
               priority === 'VO Ordered' ? '#ffc107' :
               priority === 'VO Ready' ? '#2196f3' :
               priority === 'Active' ? '#4caf50' : '#9e9e9e';
      }
    }
    
    return '#9e9e9e'; // Default gray
  };

  // Toast notification functions
  const addToast = (message: string, type: 'success' | 'info' | 'warning' | 'error' = 'info') => {
    const id = Date.now();
    setToasts(prevToasts => [...prevToasts, { id, message, type }]);
    
    // Auto remove toast after 3 seconds
    setTimeout(() => {
      removeToast(id);
    }, 3000);
  };
  
  const removeToast = (id: number) => {
    setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
  };

  // Toggle expanded state for a patient
  const togglePatientExpanded = (id: number) => {
    setPatients(prevPatients => 
      prevPatients.map(patient => 
        patient.id === id 
          ? { ...patient, expanded: !patient.expanded } 
          : patient
      )
    );
  };

  // Helper function to check if a VO needs to be ordered
  const voNeedsOrder = (vo: VO): boolean => {
    // Only include VOs with "In Behandlung - Expiring" status
    return vo.adminStatus === "In Behandlung - Expiring";
  };
  
  // Function to get VOs that need to be ordered
  const getVOsNeedingOrder = () => {
    return patients
      // First filter patients based on their tags
      .filter(patient => 
        patient.patientTags.includes("Expiring VO") && 
        !patient.patientTags.includes("VO Ordered") &&
        !patient.patientTags.includes("VO Ready")
      )
      // Then flatMap to get their VOs
      .flatMap(patient => 
        patient.vos
          // Only include VOs that need ordering
          .filter(vo => voNeedsOrder(vo))
          // Apply doctor filter if set
          .filter(vo => doctorFilter === '' || vo.doctor === doctorFilter)
          // Add patient info to each VO
          .map(vo => ({
            ...vo,
            patientName: patient.name,
            patientBirthDate: patient.birthDate,
            patientFacility: patient.facility
          }))
      );
  };

  // Function to handle selecting all VOs
  const handleSelectAllVOs = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setSelectAllChecked(checked);
    
    // Update all VOs in the orderable list
    setPatients(prevPatients => {
      return prevPatients.map(patient => ({
        ...patient,
        vos: patient.vos.map(vo => 
          voNeedsOrder(vo) ? { ...vo, selected: checked } : vo
        )
      }));
    });
  };

  // Function to handle selecting a single VO
  const handleSelectVO = (selectedVO: VO) => {
    setPatients(prevPatients => {
      return prevPatients.map(patient => {
        // Find the VO in this patient's list
        const voIndex = patient.vos.findIndex(vo => vo.id === selectedVO.id);
        
        // If found, toggle its selected state
        if (voIndex !== -1) {
          const updatedVOs = [...patient.vos];
          updatedVOs[voIndex] = {
            ...updatedVOs[voIndex],
            selected: !updatedVOs[voIndex].selected
          };
          
          return {
            ...patient,
            vos: updatedVOs
          };
        }
        
        return patient;
      });
    });
  };

  // Handle toggling the order view
  const handleToggleOrderView = () => {
    // Toggle the view state
    const newState = !isOrderViewActive;
    setIsOrderViewActive(newState);
    
    if (newState) {
      // Reset selection and filters when entering order view
      setSelectAllChecked(false);
      setDoctorFilter('');
    }
  };

  // Function to get filtered patients based on all filter criteria
  const getFilteredPatients = () => {
    return patients.filter(patient => {
      // Search term filter
      const searchMatches = searchTerm === "" || 
        patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.facility.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Therapist filter
      const therapistMatches = therapistFilter === "(Select)" || 
        patient.vos.some(vo => vo.therapist === therapistFilter);
      
      // VO status filter
      const voStatusMatches = voStatusFilter === "VO Status" ||
        patient.vos.some(vo => {
          if (voStatusFilter === "In Progress") return vo.adminStatus === "In Behandlung" || vo.adminStatus === "In Behandlung - Expiring";
          if (voStatusFilter === "Complete") return vo.adminStatus === "Abgeschlossen";
          if (voStatusFilter === "Ordered") return vo.adminStatus === "Bestellt";
          if (voStatusFilter === "Ready for Transition") return vo.adminStatus === "Neu ausstellen";
          return false;
        });
      
      // Patient status filter
      const patientStatusMatches = patientStatusFilter === "All Patients" ||
        patient.patientTags.includes(patientStatusFilter);
      
      return searchMatches && therapistMatches && voStatusMatches && patientStatusMatches;
    });
  };

  return (
    <WireframeLayout title="Therapios" username="Super Admin" userInitials="SA" showSidebar={false}>
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <p className="text-gray-700">Hello Super Admin, I hope you have a wonderful day.</p>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard - Verwaltung</h1>
        </div>

        {/* KPI cards in a single row with clickable functionality */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {/* Patients with Expiring VOs card */}
          <div 
            className="bg-white p-4 rounded shadow cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => setPatientStatusFilter("Expiring VO")}
          >
            <div className="flex items-center mb-2">
              <span className="h-2 w-2 rounded-full bg-red-600 mr-2"></span>
              <h3 className="text-gray-700">Patients with Expiring VOs</h3>
            </div>
            <p className="text-2xl font-bold">
              {patients.filter(p => p.patientTags.includes("Expiring VO")).length}
            </p>
          </div>
          
          {/* Patients with Ordered VOs card */}
          <div 
            className="bg-white p-4 rounded shadow cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => setPatientStatusFilter("VO Ordered")}
          >
            <div className="flex items-center mb-2">
              <span className="h-2 w-2 rounded-full bg-amber-400 mr-2"></span>
              <h3 className="text-gray-700">Patients with Ordered VOs</h3>
            </div>
            <p className="text-2xl font-bold">
              {patients.filter(p => p.patientTags.includes("VO Ordered")).length}
            </p>
          </div>
          
          {/* Patients with Ready VOs card */}
          <div 
            className="bg-white p-4 rounded shadow cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => setPatientStatusFilter("VO Ready")}
          >
            <div className="flex items-center mb-2">
              <span className="h-2 w-2 rounded-full bg-blue-500 mr-2"></span>
              <h3 className="text-gray-700">Patients with Ready VOs</h3>
            </div>
            <p className="text-2xl font-bold">
              {patients.filter(p => p.patientTags.includes("VO Ready")).length}
            </p>
          </div>
          
          {/* Active Patients card */}
          <div 
            className="bg-white p-4 rounded shadow cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => setPatientStatusFilter("Active")}
          >
            <div className="flex items-center mb-2">
              <span className="h-2 w-2 rounded-full bg-green-500 mr-2"></span>
              <h3 className="text-gray-700">Patients in Active Treatment</h3>
            </div>
            <p className="text-2xl font-bold">
              {patients.filter(p => p.patientTags.includes("Active")).length}
            </p>
          </div>
        </div>

        {/* Filter controls - removed the dropdown filters */}
        <div className="flex justify-end gap-2 mb-6">
          <div className="relative border border-gray-300 rounded-md px-3 py-2 flex items-center">
            <span>Period: {dateFilter}</span>
            <svg className="w-5 h-5 ml-2 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
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
                onClick={handleToggleOrderView}
              >
                {isOrderViewActive ? (
                  <>
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    <span>Back to Patient View</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                    </svg>
                    <span>Order VO</span>
                  </>
                )}
              </button>

              {isOrderViewActive && (
                <>
                  <button 
                    onClick={() => {
                      // Get selected VOs
                      const selectedVOs: VO[] = [];
                      patients.forEach(patient => {
                        patient.vos.forEach(vo => {
                          if (vo.selected && voNeedsOrder(vo)) {
                            selectedVOs.push({
                              ...vo,
                              patientName: patient.name,
                              patientBirthDate: patient.birthDate,
                              patientFacility: patient.facility
                            });
                          }
                        });
                      });
                      setSelectedOrdersForPdf(selectedVOs);
                      setShowPdfPreview(true);
                    }}
                    className="px-4 py-1.5 border border-gray-300 rounded text-sm flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!patients.some(p => p.vos.some(v => v.selected && voNeedsOrder(v)))}
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Export PDF
                  </button>
                  <button 
                    onClick={() => setShowConfirmDialog(true)}
                    className="px-4 py-1.5 bg-blue-600 text-white rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!patients.some(p => p.vos.some(v => v.selected && voNeedsOrder(v)))}
                  >
                    Mark as Ordered
                  </button>
                </>
              )}
            </div>
            <div className="relative">
              {!isOrderViewActive && (
                <input
                  type="text"
                  placeholder="Search"
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              )}
              {isOrderViewActive && (
                <select
                  className="border border-gray-300 rounded px-3 py-1.5 text-sm w-64"
                  value={doctorFilter}
                  onChange={(e) => setDoctorFilter(e.target.value)}
                >
                  <option value="">Filter by Doctor</option>
                  {Array.from(new Set(
                    patients.flatMap(patient => 
                      patient.vos
                        .filter(vo => voNeedsOrder(vo))
                        .map(vo => vo.doctor)
                    )
                  )).map(doctor => (
                    <option key={doctor} value={doctor}>{doctor}</option>
                  ))}
                </select>
              )}
              {!isOrderViewActive && (
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              )}
            </div>

            {/* Add Reset Filter button that appears when a filter is active */}
            {patientStatusFilter !== "All Patients" && !isOrderViewActive && (
              <button 
                onClick={() => setPatientStatusFilter("All Patients")}
                className="ml-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-sm flex items-center"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Reset Filter
              </button>
            )}
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            {!isOrderViewActive ? (
              // Patient View Table
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
                  {getFilteredPatients().map((patient) => (
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
                          {getPatientStatusBadge(patient.patientTags)}
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
                                style={{ borderLeftColor: getPatientStatusColor(patient.patientTags) }}
                              >
                                {/* VO Table Header */}
                                <div className="grid grid-cols-9 bg-gray-100 px-4 py-2 border-b border-gray-200 gap-1">
                                  <div className="font-medium">VO</div>
                                  <div className="font-medium">Issued</div>
                                  <div className="font-medium">Expires</div>
                                  <div className="font-medium">Therapist</div>
                                  <div className="font-medium">Doctor</div>
                                  <div className="font-medium">VO Status</div>
                                  <div className="font-medium">Admin Status</div>
                                  <div className="font-medium">Heilmittel</div>
                                  <div className="font-medium">Note</div>
                                </div>
                                
                                {/* VO Table Content */}
                                {patient.vos.map((vo, i) => (
                                  <div 
                                    key={i} 
                                    className={`grid grid-cols-9 px-4 py-3 gap-1 ${vo.isActive ? 'bg-blue-50' : 'bg-white'} border-b border-gray-200`}
                                  >
                                    <div>{vo.aktVO || '-'}</div>
                                    <div>{vo.issueDate || '-'}</div>
                                    <div>{vo.expiryDate || '-'}</div>
                                    <div>{vo.therapist}</div>
                                    <div>{vo.doctor}</div>
                                    <div>{vo.voStatus || '-'}</div>
                                    <div>
                                      <select 
                                        className={`w-full px-3 py-1 rounded-full text-xs font-semibold appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 ${getStatusStyle(vo.adminStatus)}`}
                                        value={vo.adminStatus}
                                        onChange={(e) => {
                                          // Update VO status
                                          const newStatus = e.target.value;
                                          const updatedVOs = [...patient.vos];
                                          updatedVOs[i] = {
                                            ...updatedVOs[i],
                                            adminStatus: newStatus
                                          };
                                          
                                          // Recalculate patient tags
                                          const newTags = determinePatientTags(updatedVOs);
                                          
                                          // Update patient in state
                                          setPatients(prevPatients => 
                                            prevPatients.map(p => 
                                              p.id === patient.id ? {
                                                ...p,
                                                vos: updatedVOs,
                                                patientTags: newTags
                                              } : p
                                            )
                                          );
                                        }}
                                        style={{backgroundPosition: 'right 0.5rem center'}}
                                      >
                                        <option value="In Behandlung">In Behandlung</option>
                                        <option value="In Behandlung - Expiring">In Behandlung - Expiring</option>
                                        <option value="Abgeschlossen">Abgeschlossen</option>
                                        <option value="Abgelehnt">Abgelehnt</option>
                                        <option value="Neu ausstellen">Neu ausstellen</option>
                                        <option value="Bestellt">Bestellt</option>
                                      </select>
                                    </div>
                                    <div>
                                      {vo.heilmittel ? 
                                        <div className="flex flex-wrap gap-1">
                                          {vo.heilmittel.map((code, index) => (
                                            <span key={index} className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                                              {code}
                                            </span>
                                          ))}
                                        </div> : 
                                        '-'
                                      }
                                    </div>
                                    <div>
                                      {vo.hasNote && (
                                        <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                        </svg>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            ) : (
              // Order View Table
              <div className="bg-white rounded-lg shadow overflow-hidden mt-4">
                <div className="grid grid-cols-9 bg-gray-100 px-4 py-3 border-b border-gray-200">
                  <div className="font-medium">
                    <input 
                      type="checkbox" 
                      className="mr-2"
                      checked={selectAllChecked}
                      onChange={handleSelectAllVOs}
                    />
                    Select All
                  </div>
                  <div className="font-medium">Patient Name</div>
                  <div className="font-medium">Patient Status</div>
                  <div className="font-medium">VO#</div>
                  <div className="font-medium">Therapist</div>
                  <div className="font-medium">Doctor</div>
                  <div className="font-medium">Status</div>
                  <div className="font-medium">Exp. Date</div>
                  <div className="font-medium">Heilmittel</div>
                </div>

                <div>
                  {getVOsNeedingOrder().map((vo, index) => {
                    // Find the patient for this VO to access their tags
                    const patient = patients.find(p => p.name === vo.patientName);
                    
                    return (
                      <div 
                        key={index}
                        className="grid grid-cols-9 px-4 py-3 border-b border-gray-200 hover:bg-gray-50"
                      >
                        <div>
                          <input 
                            type="checkbox" 
                            checked={vo.selected || false}
                            onChange={() => handleSelectVO(vo)}
                          />
                        </div>
                        <div>{vo.patientName}</div>
                        <div>
                          {patient && getPatientStatusBadge(patient.patientTags)}
                        </div>
                        <div>{vo.aktVO}</div>
                        <div>{vo.therapist}</div>
                        <div>{vo.doctor}</div>
                        <div className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusStyle(vo.adminStatus)}`}>
                          {vo.adminStatus}
                        </div>
                        <div>{vo.expiryDate}</div>
                        <div>
                          {vo.heilmittel ? 
                            <div className="flex flex-wrap gap-1">
                              {vo.heilmittel.map((code, idx) => (
                                <span key={idx} className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                                  {code}
                                </span>
                              ))}
                            </div> : 
                            '-'
                          }
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
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
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
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

      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-50 flex flex-col space-y-2">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`px-4 py-2 rounded shadow-lg text-white max-w-xs 
            ${toast.type === 'success' ? 'bg-green-500' : 
              toast.type === 'error' ? 'bg-red-500' : 
              toast.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'}`}
          >
            {toast.message}
          </div>
        ))}
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-[60]">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="mb-4">
              <h3 className="text-lg font-medium mb-2">Confirm Action</h3>
              <p className="text-sm text-gray-600">
                Are you sure you want to mark {patients.flatMap(p => p.vos).filter(v => v.selected && voNeedsOrder(v)).length} prescription(s) as ordered?
              </p>
            </div>
            <div className="flex justify-end space-x-2">
              <button 
                onClick={() => setShowConfirmDialog(false)}
                className="px-4 py-2 border border-gray-300 rounded text-sm"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  // Get all selected VOs and create new placeholder VOs
                  const updatedPatients = patients.map(patient => {
                    // Find selected VOs that need follow-up orders
                    const selectedVOs = patient.vos.filter(vo => vo.selected && voNeedsOrder(vo));
                    
                    if (selectedVOs.length === 0) return patient;
                    
                    // Create new placeholder VOs
                    const newVOs = selectedVOs.map(vo => ({
                      id: `VO-NEW-${patient.id}-${Date.now()}`,
                      therapist: vo.therapist,
                      doctor: vo.doctor,
                      adminStatus: "Bestellt",
                      isActive: false,
                      isPlaceholder: true,
                      heilmittel: vo.heilmittel // Copy Heilmittel codes from the original VO
                    }));
                    
                    // Unselect the original VOs
                    const updatedVOs = patient.vos.map(vo => 
                      vo.selected && voNeedsOrder(vo) ? { ...vo, selected: false } : vo
                    );
                    
                    // Combine updated VOs with new placeholder VOs
                    const combinedVOs = [...updatedVOs, ...newVOs];
                    
                    // Return updated patient with new placeholder VOs and recalculated status
                    return {
                      ...patient,
                      vos: combinedVOs,
                      patientTags: determinePatientTags(combinedVOs) // Recalculate status based on updated VOs
                    };
                  });

                  // Update patients state
                  setPatients(updatedPatients);
                  
                  // Show success toast
                  const selectedCount = patients.flatMap(p => p.vos).filter(v => v.selected && voNeedsOrder(v)).length;
                  addToast(`${selectedCount} follow-up prescription(s) ordered`, 'success');
                  
                  // Reset selection and close dialog
                  setSelectAllChecked(false);
                  setShowConfirmDialog(false);
                  
                  // Return to patient view
                  setIsOrderViewActive(false);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded text-sm"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PDF Preview Modal */}
      {showPdfPreview && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Prescription PDF Preview</h3>
              <button 
                onClick={() => setShowPdfPreview(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* PDF Preview Content */}
            <div className="border border-gray-300 rounded-lg p-6 bg-white max-h-[70vh] overflow-y-auto">
              <div className="flex justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Therapios</h2>
                  <p className="text-sm text-gray-600">Prescription Order Form</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Date: {new Date().toLocaleDateString()}</p>
                  <p className="text-sm text-gray-600">Order ID: ORD-{Date.now().toString().slice(-6)}</p>
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="text-md font-medium border-b pb-2 mb-2">Selected Prescriptions:</h3>
                <table className="w-full text-sm">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                    <tr>
                      <th className="px-3 py-2 text-left">Patient</th>
                      <th className="px-3 py-2 text-left">DOB</th>
                      <th className="px-3 py-2 text-left">Facility</th>
                      <th className="px-3 py-2 text-left">Therapist</th>
                      <th className="px-3 py-2 text-left">Doctor</th>
                      <th className="px-3 py-2 text-left">Prescription #</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrdersForPdf.map((vo) => (
                      <tr key={vo.id} className="border-b">
                        <td className="px-3 py-2">{vo.patientName}</td>
                        <td className="px-3 py-2">{vo.patientBirthDate}</td>
                        <td className="px-3 py-2">{vo.patientFacility}</td>
                        <td className="px-3 py-2">{vo.therapist}</td>
                        <td className="px-3 py-2">{vo.doctor}</td>
                        <td className="px-3 py-2">{vo.aktVO || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="mb-6">
                <h3 className="text-md font-medium border-b pb-2 mb-2">Order Information:</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm"><span className="font-medium">Ordered By:</span> Admin Admin</p>
                    <p className="text-sm"><span className="font-medium">Order Date:</span> {new Date().toLocaleDateString()}</p>
                    <p className="text-sm"><span className="font-medium">Total Prescriptions:</span> {selectedOrdersForPdf.length}</p>
                  </div>
                  <div>
                    <p className="text-sm"><span className="font-medium">Delivery Method:</span> Electronic</p>
                    <p className="text-sm"><span className="font-medium">Status:</span> Processing</p>
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="text-md font-medium border-b pb-2 mb-2">Additional Notes:</h3>
                <p className="text-sm text-gray-600">All prescriptions will be processed within 24-48 hours. Please contact support for any questions regarding this order.</p>
              </div>
              
              <div className="flex justify-between border-t pt-4">
                <div className="text-sm text-gray-600">
                  <p>Therapios GmbH</p>
                  <p>Health Provider ID: TH-123456</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">This is a simulated document for demonstration purposes only</p>
                </div>
              </div>
            </div>
            
            {/* PDF Actions */}
            <div className="flex justify-end space-x-2 mt-4">
              <button 
                onClick={() => setShowPdfPreview(false)}
                className="px-4 py-2 border border-gray-300 rounded text-sm"
              >
                Close
              </button>
              <button 
                onClick={() => {
                  addToast('PDF downloaded successfully', 'success');
                  setTimeout(() => {
                    setShowPdfPreview(false);
                  }, 1000);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded text-sm flex items-center"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </WireframeLayout>
  );
} 