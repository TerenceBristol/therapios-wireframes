'use client';

import React, { useState, useEffect } from 'react';
import WireframeLayout from '@/components/WireframeLayout';
import { cloneDeep } from 'lodash';

// Define LogEntry interface
interface LogEntry {
  timestamp: Date;
  action: 'STATUS_CHANGE' | 'ORDERED' | 'TREATMENT_STARTED' | 'VO_CLOSED';
  description: string;
  fromStatus?: string;
  toStatus?: string;
  user: string;
}

// Define VO interface to fix type errors
interface VO {
  id: number; // Changed from string to number to match patients array
  selected: boolean;
  name: string;
  aktVO: string;
  status: string;
  statusClass: string;
  previousStatus?: string;
  changed?: boolean;
  nextVO?: string;
  followUpStatus: string;
  logs?: LogEntry[];
  // Adding other required fields from the patients array
  geburtsdatum: string;
  heilmittel: string;
  heilmittelAnzahl: string;
  einrichtung: string;
  therapeut: string;
  ausstDatum: string;
  voStatus: string;
  previousVO: string;
  arzt: string;
  note: boolean;
  orderStatus?: string;
  folgeVO?: string;
}

export default function AdminVOManagementWireframe() {
  const [dateFilter, setDateFilter] = useState("01.02.2025 - 31.05.2025");
  const [therapistFilter, setTherapistFilter] = useState("(Select)");
  const [voStatusFilter, setVoStatusFilter] = useState("VO Status");
  const [searchTerm, setSearchTerm] = useState("");
  const [showColumns, setShowColumns] = useState(false);
  const [selectAll, setSelectAll] = useState(false);
  
  // New filter state variables
  const [followUpStatusFilter, setFollowUpStatusFilter] = useState("All VOs");
  const [doctorFilter, setDoctorFilter] = useState("All Doctors");
  const [patientFilter, setPatientFilter] = useState("All Patients");
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  
  // Add activeTab state variable
  const [activeTab, setActiveTab] = useState("F.-VO bestellen");
  
  // Order modal state
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderModalDoctor, setOrderModalDoctor] = useState("");
  
  // Add success notification state
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  // Add notification type state for color coding
  const [notificationType, setNotificationType] = useState<"ordered" | "default">("default");

  // Add new state for order workflow
  const [showOrderWorkflow, setShowOrderWorkflow] = useState(false);
  const [workflowStep, setWorkflowStep] = useState(1);
  const [showDoctorSelectionDialog, setShowDoctorSelectionDialog] = useState(false);

  // Add state for logs functionality
  const [showLogsModal, setShowLogsModal] = useState(false);
  const [currentLogVO, setCurrentLogVO] = useState<any>(null);

  // Add state for VO link simulation
  const [showSimulateLinkModal, setShowSimulateLinkModal] = useState(false);
  const [simulationResults, setSimulationResults] = useState<Array<{
    originalVO: VO;
    matchedVO: VO;
    originalStatus: string;
    newStatus: string;
  }>>([]);

  // Add state for completed treatments simulation
  const [showCompletedTreatmentsModal, setShowCompletedTreatmentsModal] = useState(false);
  const [completedTreatmentsResults, setCompletedTreatmentsResults] = useState<Array<{
    originalVO: VO;
    folgeVO: VO;
    originalStatus: string;
    newStatus: string;
  }>>([]);

  // Add state for sorting
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Define follow-up status types
  const followUpStatusTypes = {
    NEEDS: 'F.-VO bestellen',
    ORDERED: 'F.-VO bestelt',
    READY_FU: 'F.-VO erhalten',
    TERMINATED: 'Terminated',
    AKTIV: 'Aktiv',
    FERTIG: 'Fertig behandelt',
    ABGEBROCHEN: 'Abgebrochen',
    ABGERECHNET: 'Abgerechnet'
  };

  // Status indicator components
  const StatusIndicator = ({ type }: { type: string }) => {
    let bgColor, textColor;
    
    switch(type) {
      case followUpStatusTypes.NEEDS:
        bgColor = 'bg-red-100';
        textColor = 'text-red-600';
        break;
      case followUpStatusTypes.ORDERED:
        bgColor = 'bg-amber-100';
        textColor = 'text-amber-600';
        break;
      case followUpStatusTypes.READY_FU:
        bgColor = 'bg-green-100';
        textColor = 'text-green-600';
        break;
      case followUpStatusTypes.TERMINATED:
        bgColor = 'bg-red-800';
        textColor = 'text-red-100';
        break;
      case followUpStatusTypes.AKTIV:
        bgColor = 'bg-blue-100';
        textColor = 'text-blue-600';
        break;
      case followUpStatusTypes.FERTIG:
        bgColor = 'bg-green-800';
        textColor = 'text-green-100';
        break;
      case followUpStatusTypes.ABGEBROCHEN:
        bgColor = 'bg-red-500';
        textColor = 'text-white';
        break;
      case followUpStatusTypes.ABGERECHNET:
        bgColor = 'bg-purple-100';
        textColor = 'text-purple-600';
        break;
      default:
        bgColor = 'bg-gray-100';
        textColor = 'text-gray-600';
    }
    
    return (
      <div className={`px-2 py-1 rounded ${bgColor} ${textColor}`}>
        <span className="text-xs font-medium">{type}</span>
      </div>
    );
  };
  
  // Sample data for table rows with added follow-up status, previous VO, and next VO
  const [patients, setPatients] = useState<VO[]>([
    // 1. Aktiv VOs - new with blank Order Status
    {
      id: 101,
      selected: false,
      name: "Klaus Schmidt",
      geburtsdatum: "03.11.1965",
      heilmittel: "KG-ZNS",
      heilmittelAnzahl: "20x",
      einrichtung: "Rehazentrum Mitte",
      therapeut: "M. Müller",
      aktVO: "[3421-1]",
      ausstDatum: "15.05.2025",
      voStatus: "2/20",  // Only 10% complete - not enough for "F.-VO bestellen"
      followUpStatus: "", // Blank as it's new and not 80% complete
      previousVO: "",
      nextVO: "",
      arzt: "Dr. Becker",
      note: false,
      status: "Aktiv",
      statusClass: "bg-blue-100 text-blue-800",
      logs: []
    },
    
    // 2. Aktiv VOs - ≥80% complete with "F.-VO bestellen" Order Status
    {
      id: 102,
      selected: false,
      name: "Helga Weber",
      geburtsdatum: "22.07.1948",
      heilmittel: "KG-H, KG-ZNS",
      heilmittelAnzahl: "20x",
      einrichtung: "Physio Plus GmbH",
      therapeut: "S. Klein",
      aktVO: "[4532-7]",
      ausstDatum: "10.04.2025",
      voStatus: "16/20", // 80% complete - should trigger "F.-VO bestellen"
      followUpStatus: "F.-VO bestellen", // Using followUpStatusTypes.NEEDS
      previousVO: "[4532-6]",
      nextVO: "",
      arzt: "Dr. Hoffmann",
      note: true,
      status: "Aktiv",
      statusClass: "bg-blue-100 text-blue-800",
      logs: []
    },
    {
      id: 103,
      selected: false,
      name: "Friedrich Bauer",
      geburtsdatum: "14.03.1957",
      heilmittel: "MT",
      heilmittelAnzahl: "10x",
      einrichtung: "Therapiezentrum Nord",
      therapeut: "L. Wagner",
      aktVO: "[8765-3]",
      ausstDatum: "28.03.2025",
      voStatus: "9/10", // 90% complete - should trigger "F.-VO bestellen"
      followUpStatus: "F.-VO bestellen", // Using followUpStatusTypes.NEEDS
      previousVO: "[8765-2]",
      nextVO: "",
      arzt: "Dr. Fischer",
      note: false,
      status: "Aktiv",
      statusClass: "bg-blue-100 text-blue-800",
      logs: []
    },
    
    // 3. Aktiv VOs - with linked follow-up and "F.-VO bestelt" Order Status
    {
      id: 104,
      selected: false,
      name: "Monika Krause",
      geburtsdatum: "09.12.1970",
      heilmittel: "KG-H, MT",
      heilmittelAnzahl: "18x",
      einrichtung: "Gesundheitszentrum West",
      therapeut: "A. Schneider",
      aktVO: "[2378-9]",
      ausstDatum: "05.04.2025",
      voStatus: "17/18", // Almost complete
      followUpStatus: "F.-VO bestelt", // Using followUpStatusTypes.ORDERED
      previousVO: "[2378-8]",
      nextVO: "[2378-10]", // Has a linked follow-up VO
      arzt: "Dr. Meyer",
      note: true,
      status: "Aktiv",
      statusClass: "bg-blue-100 text-blue-800",
      logs: []
    },
    
    // 4. Abgebrochen VOs - all with blank Order Status
    {
      id: 105,
      selected: false,
      name: "Thomas Schulz",
      geburtsdatum: "27.02.1982",
      heilmittel: "KG-ZNS",
      heilmittelAnzahl: "15x",
      einrichtung: "Reha Süd",
      therapeut: "K. Neumann",
      aktVO: "[6543-2]",
      ausstDatum: "20.03.2025",
      voStatus: "7/15", // Treatment aborted at this point
      followUpStatus: "", // Blank as specified for Abgebrochen status
      previousVO: "[6543-1]",
      nextVO: "",
      arzt: "Dr. Richter",
      note: true,
      status: "Abgebrochen",
      statusClass: "bg-red-500 text-white",
      logs: []
    },
    {
      id: 106,
      selected: false,
      name: "Erika Schäfer",
      geburtsdatum: "15.09.1961",
      heilmittel: "KG",
      heilmittelAnzahl: "12x",
      einrichtung: "Therapiezentrum Ost",
      therapeut: "H. Schwarz",
      aktVO: "[1987-4]",
      ausstDatum: "12.05.2025",
      voStatus: "3/12", // Treatment aborted early
      followUpStatus: "", // Blank as specified for Abgebrochen status
      previousVO: "[1987-3]",
      nextVO: "",
      arzt: "Dr. Schmitt",
      note: false,
      status: "Abgebrochen",
      statusClass: "bg-red-500 text-white",
      logs: []
    },
    
    // 5. Fertig behandelt VOs - all with blank Order Status
    {
      id: 107,
      selected: false,
      name: "Martin Wolf",
      geburtsdatum: "08.06.1975",
      heilmittel: "KG-H",
      heilmittelAnzahl: "10x",
      einrichtung: "Physio & Reha Zentrum",
      therapeut: "R. Becker",
      aktVO: "[3210-6]",
      ausstDatum: "30.03.2025",
      voStatus: "7/10", // Changed from 10/10 to 7/10 (incomplete)
      followUpStatus: followUpStatusTypes.READY_FU, // F.-VO erhalten
      previousVO: "[3210-5]",
      nextVO: "[3210-7]", // Added nextVO reference
      arzt: "Dr. Koch",
      note: false,
      status: "Aktiv", // Changed from "Fertig behandelt" to "Aktiv"
      statusClass: "bg-blue-100 text-blue-800", // Changed to match Aktiv styling
      logs: []
    },
    {
      id: 108,
      selected: false,
      name: "Ursula Zimmermann",
      geburtsdatum: "11.04.1953",
      heilmittel: "MT",
      heilmittelAnzahl: "6x",
      einrichtung: "Therapie & Wellness GmbH",
      therapeut: "P. Hoffmann",
      aktVO: "[5432-3]",
      ausstDatum: "15.04.2025",
      voStatus: "4/6", // Changed from 6/6 to 4/6 (incomplete)
      followUpStatus: followUpStatusTypes.READY_FU, // F.-VO erhalten
      previousVO: "[5432-2]",
      nextVO: "[5432-4]", // Added nextVO reference
      arzt: "Dr. Werner",
      note: true,
      status: "Aktiv", // Changed from "Fertig behandelt" to "Aktiv"
      statusClass: "bg-blue-100 text-blue-800", // Changed to match Aktiv styling
      logs: []
    },
    // Add the Folge VOs
    {
      id: 109,
      selected: false,
      name: "Martin Wolf",
      geburtsdatum: "08.06.1975",
      heilmittel: "KG-H",
      heilmittelAnzahl: "10x",
      einrichtung: "Physio & Reha Zentrum",
      therapeut: "R. Becker",
      aktVO: "[3210-7]", // The Folge VO number
      ausstDatum: "15.05.2025", // Later date than original VO
      voStatus: "0/10", // Not started yet
      followUpStatus: "", // No follow-up status yet
      previousVO: "[3210-6]", // Links back to original VO
      nextVO: "",
      arzt: "Dr. Koch",
      note: false,
      status: "In Behandlung", // New VOs have "In Behandlung" status
      statusClass: "bg-gray-100 text-gray-800",
      logs: []
    },
    {
      id: 110,
      selected: false,
      name: "Ursula Zimmermann",
      geburtsdatum: "11.04.1953",
      heilmittel: "MT",
      heilmittelAnzahl: "6x",
      einrichtung: "Therapie & Wellness GmbH",
      therapeut: "P. Hoffmann",
      aktVO: "[5432-4]", // The Folge VO number
      ausstDatum: "30.05.2025", // Later date than original VO
      voStatus: "0/6", // Not started yet
      followUpStatus: "", // No follow-up status yet
      previousVO: "[5432-3]", // Links back to original VO
      nextVO: "",
      arzt: "Dr. Werner",
      note: true,
      status: "In Behandlung", // New VOs have "In Behandlung" status
      statusClass: "bg-gray-100 text-gray-800",
      logs: []
    }
  ]);
  
  // Utility function to calculate completion percentage from voStatus
  const getCompletionPercentage = (voStatus: string): number => {
    if (!voStatus || typeof voStatus !== 'string') return 0;
    
    // Extract numbers from format like "12 / 18"
    const match = voStatus.match(/(\d+)\s*\/\s*(\d+)/);
    if (!match) return 0;
    
    const completed = parseInt(match[1], 10);
    const total = parseInt(match[2], 10);
    
    if (isNaN(completed) || isNaN(total) || total === 0) return 0;
    
    return (completed / total) * 100;
  };
  
  // Apply F.VO Order Status logic based on VO status and completion percentage
  useEffect(() => {
    const updatedPatients = patients.map(patient => {
      const newPatient = { ...patient };
      
      // Get completion percentage
      const completionPercentage = getCompletionPercentage(patient.voStatus);
      
      // Apply the requested logic
      if (patient.status === "In Behandlung...") {
        // Rule 1: When VO status is "In Behandlung", followUpStatus will always be blank
        newPatient.followUpStatus = "";
      } else if (patient.status === "Abgebrochen") {
        // Rule 2: When VO status is "Abgebrochen", followUpStatus will always be blank
        newPatient.followUpStatus = "";
      } else if (patient.status === "Aktiv") {
        // Rule 3: When VO status is "Aktiv":
        if (completionPercentage >= 80) {
          // If ≥80% complete, set to "F.-VO bestellen"
          newPatient.followUpStatus = followUpStatusTypes.NEEDS;
        } else if (newPatient.followUpStatus === followUpStatusTypes.NEEDS) {
          // Only reset if it was previously set to NEEDS, don't override other statuses
          newPatient.followUpStatus = "";
        }
      }
      
      return newPatient;
    });
    
    setPatients(updatedPatients);
  }, []); // Run once on component mount

  useEffect(() => {
    // Remove patients with VO Status "Abgeschlossen" and "Simulation"
    // Remove patients with F.-VO OrderStatus "Aktiv", "Abgerechnet," and "Fertig behandelt"
    const filteredPatients = patients.filter(patient => 
      patient.status !== "Abgeschlossen" && 
      patient.status !== "Simulation" &&
      patient.followUpStatus !== followUpStatusTypes.AKTIV &&
      patient.followUpStatus !== followUpStatusTypes.ABGERECHNET &&
      patient.followUpStatus !== followUpStatusTypes.FERTIG
    );
    
    setPatients(filteredPatients);
  }, []);

  // Toggle select all
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    setSelectAll(isChecked);
    
    // Only select patients that match the current filter (by doctor)
    setPatients(prevPatients => 
      prevPatients.map(patient => {
        // Only modify patients that match the current filter (doctor)
        if (doctorFilter === "All Doctors" || patient.arzt === doctorFilter) {
          // Only select patients in the filtered view
          const isInFilteredView = filteredPatients.some(fp => fp.id === patient.id);
          return { ...patient, selected: isChecked && isInFilteredView };
        }
        return patient;
      })
    );
  };
  
  // Toggle individual selection
  const handleSelectRow = (id: number) => {
    setPatients(prevPatients => {
      const updatedPatients = prevPatients.map(patient => 
        patient.id === id ? { ...patient, selected: !patient.selected } : patient
      );
      
      // Check if all patients are selected and update selectAll state
      const allSelected = updatedPatients.every(patient => patient.selected);
      setSelectAll(allSelected);
      
      return updatedPatients;
    });
  };

  // Format patient name as "Last Name, First Name"
  const formatPatientName = (fullName: string) => {
    const nameParts = fullName.split(' ');
    if (nameParts.length < 2) return fullName;
    
    // Assume last part is the last name, everything else is first name
    const lastName = nameParts[nameParts.length - 1];
    const firstName = nameParts.slice(0, nameParts.length - 1).join(' ');
    
    return `${lastName}, ${firstName}`;
  };

  // Helper function to parse Heilmittel and assign individual Anzahl values
  const parseHeilmittelWithAnzahl = (patient: any) => {
    const heilmittelTypes = patient.heilmittel.split(',').map((h: string) => h.trim()).filter((h: string) => h);
    
    if (heilmittelTypes.length === 0) return [];
    
    // Extract the base anzahl number without the 'x'
    const baseAnzahl = parseInt(patient.heilmittelAnzahl.replace('x', ''));
    
    // For each Heilmittel type, create a slightly different Anzahl value
    // This simulates real-world data where different Heilmittel might have different anzahl
    return heilmittelTypes.map((type: string, index: number) => {
      // Vary the Anzahl slightly for each Heilmittel type (±2) but keep within bounds (1-20)
      let anzahl = baseAnzahl;
      if (heilmittelTypes.length > 1) {
        anzahl = Math.max(1, Math.min(20, baseAnzahl + (index - 1) * 2));
      }
      return { type, anzahl: `${anzahl}x` };
    });
  };

  // Format Heilmittel and Anzahl for display in modal
  const formatHeilmittelForDisplay = (patient: any) => {
    const heilmittelDetails = parseHeilmittelWithAnzahl(patient);
    
    if (heilmittelDetails.length === 0) return '-';
    
    return heilmittelDetails.map((item: { type: string, anzahl: string }) => 
      `${item.type} (${item.anzahl})`
    ).join(', ');
  };

  // Format Heilmittel and Anzahl for clipboard
  const formatHeilmittelForClipboard = (patient: any) => {
    const heilmittelDetails = parseHeilmittelWithAnzahl(patient);
    
    if (heilmittelDetails.length === 0) return 'None';
    
    return heilmittelDetails.map((item: { type: string, anzahl: string }) => 
      `${item.type} (${item.anzahl})`
    ).join(', ');
  };

  // Handle tab change
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    
    // Reset all filters when changing tabs
    setFollowUpStatusFilter("All VOs");
    setDoctorFilter("All Doctors");
    setPatientFilter("All Patients");
    setSearchTerm("");
    setActiveFilters([]);
  };

  // Function to handle column header click for sorting
  const handleSort = (column: string) => {
    // Only enable sorting in the All VOs tab
    if (activeTab !== "All VOs") return;
    
    // If clicking the same column, toggle direction
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new sort column and default to ascending
      setSortBy(column);
      setSortDirection('asc');
    }
  };

  // Filter and sort functions
  const filterPatients = () => {
    let filteredPatients = [...patients];

    // First, filter by active tab
    switch (activeTab) {
      case "F.-VO bestellen":
        filteredPatients = filteredPatients.filter(patient => 
          patient.followUpStatus === followUpStatusTypes.NEEDS
        );
        break;
      case "F.-VO bestelt":
        filteredPatients = filteredPatients.filter(patient => 
          patient.followUpStatus === followUpStatusTypes.ORDERED
        );
        break;
      case "F.-VO erhalten":
        filteredPatients = filteredPatients.filter(patient => 
          patient.followUpStatus === followUpStatusTypes.READY_FU
        );
        break;
      case "Fertig Behandelt":
        filteredPatients = filteredPatients.filter(patient => 
          patient.status === "Fertig behandelt"
        );
        break;
      case "All VOs":
        // No filter, show all patients
        break;
    }

    // Apply other filters (same as before)
    // Filter by follow-up status (if explicitly set)
    if (followUpStatusFilter !== "All VOs") {
      switch (followUpStatusFilter) {
        case "F.-VO bestellen":
          filteredPatients = filteredPatients.filter(patient => patient.followUpStatus === followUpStatusTypes.NEEDS);
          break;
        case "F.-VO bestelt":
          filteredPatients = filteredPatients.filter(patient => patient.followUpStatus === followUpStatusTypes.ORDERED);
          break;
        case "F.-VO erhalten":
          filteredPatients = filteredPatients.filter(patient => patient.followUpStatus === followUpStatusTypes.READY_FU);
          break;
        case "Fertig Behandelt":
          filteredPatients = filteredPatients.filter(patient => patient.status === "Fertig behandelt");
          break;
        default:
          // No additional filtering
          break;
      }
    }

    // Filter by doctor
    if (doctorFilter !== "All Doctors") {
      filteredPatients = filteredPatients.filter(patient => patient.arzt === doctorFilter);
    }

    // Filter by patient name
    if (patientFilter !== "All Patients") {
      filteredPatients = filteredPatients.filter(patient => patient.name === patientFilter);
    }

    // Filter by search term
    if (searchTerm) {
      const lowercasedSearchTerm = searchTerm.toLowerCase();
      filteredPatients = filteredPatients.filter(patient => 
        patient.name.toLowerCase().includes(lowercasedSearchTerm) ||
        patient.therapeut.toLowerCase().includes(lowercasedSearchTerm) ||
        patient.arzt.toLowerCase().includes(lowercasedSearchTerm) ||
        patient.aktVO.toLowerCase().includes(lowercasedSearchTerm)
      );
    }

    // Apply sorting for the All VOs tab
    if (activeTab === "All VOs" && sortBy) {
      filteredPatients.sort((a, b) => {
        let valueA, valueB;
        
        // Get values based on sort column
        switch (sortBy) {
          case 'followUpStatus':
            valueA = a.followUpStatus;
            valueB = b.followUpStatus;
            break;
          case 'name':
            valueA = a.name;
            valueB = b.name;
            break;
          // Add other sortable columns if needed
          default:
            valueA = a[sortBy as keyof typeof a] || '';
            valueB = b[sortBy as keyof typeof b] || '';
        }
        
        // Compare based on direction
        if (sortDirection === 'asc') {
          return valueA > valueB ? 1 : valueA < valueB ? -1 : 0;
        } else {
          return valueA < valueB ? 1 : valueA > valueB ? -1 : 0;
        }
      });
      
      return filteredPatients;
    }

    // Default sort by doctor for non-All VOs tabs
    return filteredPatients.sort((a, b) => a.arzt.localeCompare(b.arzt));
  };

  // Get filtered patients
  const filteredPatients = filterPatients();

  // Group patients by doctor if in "F.-VO bestellen" tab
  const patientsByDoctor = React.useMemo(() => {
    if (activeTab === "F.-VO bestellen" && doctorFilter === "All Doctors") {
      // Group patients by doctor when no specific doctor is selected
      const groupedPatients: Record<string, typeof patients> = {};
      
      filteredPatients.forEach(patient => {
        if (!groupedPatients[patient.arzt]) {
          groupedPatients[patient.arzt] = [];
        }
        groupedPatients[patient.arzt].push(patient);
      });
      
      return groupedPatients;
    }
    
    // If a doctor is selected or not in "F.-VO bestellen" tab, don't group
    return { [doctorFilter]: filteredPatients };
  }, [filteredPatients, activeTab, doctorFilter]);

  // Calculate counts for tab badges
  const countPatientsByStatus = () => {
    const readyCount = patients.filter(patient => patient.followUpStatus === followUpStatusTypes.AKTIV).length;
    const okCount = patients.filter(patient => patient.followUpStatus === followUpStatusTypes.FERTIG).length;
    const needsCount = patients.filter(patient => patient.followUpStatus === followUpStatusTypes.NEEDS).length;
    const orderedCount = patients.filter(patient => patient.followUpStatus === followUpStatusTypes.ORDERED).length;
    const receivedCount = patients.filter(patient => patient.followUpStatus === followUpStatusTypes.READY_FU).length;
    const closedCount = patients.filter(patient => 
      patient.followUpStatus === followUpStatusTypes.FERTIG || 
      patient.followUpStatus === followUpStatusTypes.ABGEBROCHEN || 
      patient.followUpStatus === followUpStatusTypes.ABGERECHNET
    ).length;
    const terminatedCount = patients.filter(patient => patient.followUpStatus === followUpStatusTypes.TERMINATED).length;
    const fertigBehandeltCount = patients.filter(patient => patient.status === "Fertig behandelt").length;
    
    return {
      ready: readyCount,
      ok: okCount,
      needs: needsCount,
      ordered: orderedCount,
      received: receivedCount,
      closed: closedCount,
      terminated: terminatedCount,
      fertigBehandelt: fertigBehandeltCount
    };
  };

  // Get unique doctors for doctor filter dropdown
  const uniqueDoctors = Array.from(new Set(patients.map(patient => patient.arzt)))
    .map(doctor => {
      const followUpCount = patients.filter(p => p.arzt === doctor && p.followUpStatus === followUpStatusTypes.NEEDS).length;
      return {
        name: doctor,
        count: followUpCount
      };
    })
    .sort((a, b) => b.count - a.count);

  // Get unique patients for patient filter dropdown
  const uniquePatients = Array.from(new Set(patients.map(patient => patient.name)));

  // Apply a filter and update active filters
  const applyFilter = (filterType: string, value: string) => {
    // Update the appropriate filter state
    switch (filterType) {
      case 'followUpStatus':
        setFollowUpStatusFilter(value);
        break;
      case 'doctor':
        setDoctorFilter(value);
        // When changing doctor, reset selections
        if (activeTab === "F.-VO bestellen" && value !== "All Doctors") {
          autoSelectPatientsByDoctor(value);
        }
        break;
      case 'patient':
        setPatientFilter(value);
        break;
    }

    // Update active filters
    if (value === "All VOs" || value === "All Doctors" || value === "All Patients") {
      setActiveFilters(prevFilters => prevFilters.filter(filter => !filter.startsWith(filterType)));
    } else {
      setActiveFilters(prevFilters => {
        const newFilters = prevFilters.filter(filter => !filter.startsWith(filterType));
        newFilters.push(`${filterType}:${value}`);
        return newFilters;
      });
    }
  };
  
  // Auto-select patients by doctor - modified to NOT auto-select
  const autoSelectPatientsByDoctor = (doctorName: string) => {
    setPatients(prevPatients => {
      const updatedPatients = prevPatients.map(patient => ({
        ...patient,
        // No longer auto-select patients, just reset selection
        selected: false
      }));
      
      // Reset selectAll state
      setSelectAll(false);
      
      return updatedPatients;
    });
  };
  
  // Function to show notification for various actions
  const showNotification = (message: string, type: "ordered" | "default" | undefined = "default") => {
    setNotificationMessage(message);
    setShowSuccessNotification(true);
    setNotificationType(type);
    
    // Hide notification after 3 seconds
    setTimeout(() => {
      setShowSuccessNotification(false);
    }, 3000);
  };

  // Clear all filters
  const clearAllFilters = () => {
    setFollowUpStatusFilter("All VOs");
    setDoctorFilter("All Doctors");
    setPatientFilter("All Patients");
    setActiveFilters([]);
  };

  // Function to handle starting treatments
  const handleStartTreatment = (vo: any) => {
    // Update the patients state
    setPatients(prevPatients => {
      return prevPatients.map(patient => {
        if (patient.id === vo.id) {
          // Add log entry for starting treatment
          const newLog: LogEntry = {
            timestamp: new Date(),
            action: 'TREATMENT_STARTED',
            description: `Treatment started for VO ${vo.aktVO}`,
            fromStatus: followUpStatusTypes.READY_FU,
            toStatus: followUpStatusTypes.FERTIG,
            user: 'Super Admin'
          };
          
          // Create logs array if it doesn't exist
          const logs = patient.logs || [];
          
          return {
            ...patient,
            followUpStatus: followUpStatusTypes.FERTIG,
            logs: [...logs, newLog]
          };
        }
        return patient;
      });
    });
    
    // Show success notification with blue color
    showNotification(`Started treatments for VO ${vo.aktVO}`, "default");
    
    // If in "Ready" tab, switch to "OK" tab after starting treatments
    if (activeTab === "Ready") {
      handleTabChange("Aktiv");
    }
  };
  
  // Function to automatically start treatments when a VO's status changes
  const autoStartTreatments = (vos: any[]) => {
    // Deep clone the VOs array to avoid directly modifying the original state
    const newVOs = cloneDeep(vos);
    
    // Create results array to return
    const simResults: Array<{
      primaryVO: any;
      previousVOStatus: string;
      newVOStatus: string;
    }> = [];
    
    // Find any VOs with the status "Abgeschlossen" that triggered the auto-start
    const abgeschlossenVO = newVOs.find((vo: any) => vo.status === "Abgeschlossen" && vo.changed);
    
    if (abgeschlossenVO) {
      // Process the primary VO when its VO status changes to "Abgeschlossen"
      const previousVOStatus = abgeschlossenVO.previousStatus;
      const newVOStatus = "Abgeschlossen";
      
      // Track operations for simulation display
      simResults.push({
        primaryVO: abgeschlossenVO.aktVO,
        previousVOStatus: previousVOStatus,
        newVOStatus: newVOStatus,
      });
      
      // Update the primary VO - change to Closed
      abgeschlossenVO.status = "Abgeschlossen";
      abgeschlossenVO.statusClass = "bg-green-100 text-green-800";
      
      // Add log entry for closing the VO
      const newLog: LogEntry = {
        timestamp: new Date(),
        action: 'VO_CLOSED',
        description: `VO ${abgeschlossenVO.aktVO} automatically closed (VO status changed to Abgeschlossen)`,
        fromStatus: followUpStatusTypes.READY_FU,
        toStatus: followUpStatusTypes.FERTIG,
        user: 'System'
      };
      
      // Create logs array if it doesn't exist
      const logs = abgeschlossenVO.logs || [];
      
      abgeschlossenVO.logs = [...logs, newLog];
    }
    
    return simResults;
  };
  
  // Function to handle viewing logs
  const handleViewLogs = (vo: any) => {
    setCurrentLogVO(vo);
    setShowLogsModal(true);
  };

  // Log entry interface
  interface LogEntry {
    timestamp: Date;
    action: 'STATUS_CHANGE' | 'ORDERED' | 'TREATMENT_STARTED' | 'VO_CLOSED';
    description: string;
    fromStatus?: string;
    toStatus?: string;
    user: string;
  }

  // Helper function to format date and time
  const formatDateTime = (date: Date): string => {
    return new Date(date).toLocaleString('en-DE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Function to add a log entry
  const addLogEntry = (voId: number, entry: Omit<LogEntry, 'timestamp' | 'user'>) => {
    setPatients(prevPatients => {
      return prevPatients.map(patient => {
        if (patient.id === voId) {
          const newLog: LogEntry = {
            ...entry,
            timestamp: new Date(),
            user: 'Super Admin' // Hardcoded for this wireframe
          };
          
          // Create logs array if it doesn't exist
          const logs = patient.logs || [];
          
          return {
            ...patient,
            logs: [...logs, newLog]
          };
        }
        return patient;
      });
    });
  };

  // Simulation log entry interface - update to match the actual used type
  interface SimulationLogEntry {
    id: string;
    primaryVO: string; // Changed from optional to required
    linkedVO: string;  // Changed from optional to required
    previousVOStatus: string; // Changed from optional to required
    newVOStatus: string; // Changed from optional to required
    previousOrderStatus?: string;
    newOrderStatus?: string;
  }

  // Add count variables from countPatientsByStatus()
  const counts = countPatientsByStatus();
  const toOrderCount = counts.needs;
  const orderedCount = counts.ordered;
  const receivedCount = counts.received;
  const readyCount = counts.ready;
  const okCount = counts.ok;
  const closedCount = counts.closed;
  const fertigBehandeltCount = counts.fertigBehandelt;
  const allCount = patients.length;

  // Helper function to compare two dates in format DD.MM.YYYY
  const compareAusstDatum = (date1: string, date2: string): number => {
    // Convert DD.MM.YYYY to YYYY-MM-DD for proper comparison
    const parts1 = date1.split('.');
    const parts2 = date2.split('.');
    
    if (parts1.length !== 3 || parts2.length !== 3) {
      return 0; // Invalid format, consider them equal
    }
    
    const formattedDate1 = `${parts1[2]}-${parts1[1]}-${parts1[0]}`;
    const formattedDate2 = `${parts2[2]}-${parts2[1]}-${parts2[0]}`;
    
    // Return positive if date1 is newer, negative if date2 is newer, 0 if equal
    return new Date(formattedDate1).getTime() - new Date(formattedDate2).getTime();
  };
  
  // Function to simulate linking of Folge VOs
  const runFolgeVOSimulation = () => {
    // Create a copy of patients data for the simulation
    const simulatedVOs = [...patients];
    const results: Array<{
      originalVO: VO;
      matchedVO: VO;
      originalStatus: string;
      newStatus: string;
    }> = [];
    
    // Find VOs with "F.-VO bestelt" status
    const vosBestelt = simulatedVOs.filter(vo => vo.followUpStatus === "F.-VO bestelt");
    
    // For each "F.-VO bestelt" VO, find potential matches
    vosBestelt.forEach(originalVO => {
      // Look for VOs that:
      // 1. Have the same patient name
      // 2. Have the same Heilmittel
      // 3. Have a more recent Ausst Datum
      // 4. Aren't already linked
      
      const potentialMatches = simulatedVOs.filter(vo => 
        vo.name === originalVO.name &&
        vo.heilmittel === originalVO.heilmittel &&
        compareAusstDatum(vo.ausstDatum, originalVO.ausstDatum) > 0 &&
        vo.id !== originalVO.id &&
        vo.followUpStatus !== "F.-VO bestelt" // Not another VO waiting for a follow-up
      );
      
      // Sort potential matches by date (newest first) to find the most recent match
      potentialMatches.sort((a, b) => compareAusstDatum(b.ausstDatum, a.ausstDatum));
      
      // If we found a match, link them
      if (potentialMatches.length > 0) {
        const matchedVO = potentialMatches[0];
        
        // In a real system, update would occur on original data
        // Here we're just simulating the result
        
        // Add to simulation results
        results.push({
          originalVO: {...originalVO},
          matchedVO: {...matchedVO},
          originalStatus: "F.-VO bestelt",
          newStatus: "F.-VO erhalten"
        });
        
        // Update the VO in our simulated data
        const originalIndex = simulatedVOs.findIndex(vo => vo.id === originalVO.id);
        if (originalIndex !== -1) {
          simulatedVOs[originalIndex] = {
            ...simulatedVOs[originalIndex],
            followUpStatus: "F.-VO erhalten",
            nextVO: matchedVO.aktVO // Update the Folge VO # field
          };
        }
      }
    });
    
    // Update state with simulation results
    setSimulationResults(results);
    
    // If matches were found, update the actual patients data with the changes
    if (results.length > 0) {
      setPatients(prevPatients => {
        return prevPatients.map(patient => {
          // Find if this patient was updated in our simulation
          const resultMatch = results.find(result => result.originalVO.id === patient.id);
          if (resultMatch) {
            // Add log entry for the automatic linking
            const newLog: LogEntry = {
              timestamp: new Date(),
              action: 'STATUS_CHANGE',
              description: `VO automatically linked with VO# ${resultMatch.matchedVO.aktVO}`,
              fromStatus: "F.-VO bestelt",
              toStatus: "F.-VO erhalten",
              user: 'System'
            };
            
            // Create logs array if it doesn't exist
            const logs = patient.logs || [];
            
            return {
              ...patient,
              followUpStatus: "F.-VO erhalten",
              nextVO: resultMatch.matchedVO.aktVO,
              logs: [...logs, newLog]
            };
          }
          return patient;
        });
      });
      
      // Show success notification
      showNotification(`Successfully linked ${results.length} VOs with matching follow-ups`, "default");
    } else {
      // If no matches were found, show a notification
      showNotification("No matching VOs found for automatic linking.", "default");
    }
  };
  
  // Function to simulate completion of treatments for VOs
  const runCompletedTreatmentsSimulation = () => {
    // Clear previous results
    setCompletedTreatmentsResults([]);
    
    // Find VOs with "Aktiv" status and "F.-VO erhalten" followUpStatus that have a Folge VO
    const eligibleVOs = patients.filter(vo => 
      vo.status === "Aktiv" && 
      vo.followUpStatus === followUpStatusTypes.READY_FU &&
      vo.nextVO // Must have a Folge VO
    );
    
    if (eligibleVOs.length === 0) {
      // No eligible VOs found for simulation
      showNotification("No eligible VOs found for treatment completion simulation.", "default");
      return;
    }
    
    // Create a copy of patients data for simulation
    const updatedPatients = [...patients];
    
    // Store simulation results
    const results: Array<{
      originalVO: VO;
      folgeVO: VO;
      originalStatus: string;
      newStatus: string;
    }> = [];
    
    // Process each eligible VO
    eligibleVOs.forEach(originalVO => {
      // Find the corresponding Folge VO by its aktVO number
      const folgeVO = patients.find(vo => vo.aktVO === originalVO.nextVO);
      
      if (!folgeVO || folgeVO.status !== "In Behandlung") {
        // Skip if Folge VO not found or not in expected status
        return;
      }
      
      // Find indices for updates
      const originalVOIndex = updatedPatients.findIndex(vo => vo.id === originalVO.id);
      const folgeVOIndex = updatedPatients.findIndex(vo => vo.id === folgeVO.id);
      
      if (originalVOIndex === -1 || folgeVOIndex === -1) {
        // Skip if we couldn't find either VO in our array
        return;
      }
      
      // Create log entry for original VO status change
      const originalVOLog: LogEntry = {
        timestamp: new Date(),
        action: 'STATUS_CHANGE',
        description: 'Treatments completed - VO status changed to Fertig behandelt',
        fromStatus: 'Aktiv',
        toStatus: 'Fertig behandelt',
        user: 'System'
      };
      
      // Create log entry for Folge VO status change
      const folgeVOLog: LogEntry = {
        timestamp: new Date(),
        action: 'STATUS_CHANGE',
        description: 'Original VO treatments completed - Status changed to Aktiv',
        fromStatus: 'In Behandlung',
        toStatus: 'Aktiv',
        user: 'System'
      };
      
      // Update original VO (Aktiv → Fertig behandelt)
      updatedPatients[originalVOIndex] = {
        ...updatedPatients[originalVOIndex],
        status: "Fertig behandelt",
        statusClass: "bg-green-800 text-green-100", // Style for Fertig behandelt
        followUpStatus: "", // Clear the Order Status as requested
        // Preserve both the nextVO and folgeVO properties if they exist
        nextVO: updatedPatients[originalVOIndex].nextVO, // Preserve the link to the Folge VO
        folgeVO: updatedPatients[originalVOIndex].folgeVO,
        // Update VO status to show as completed
        voStatus: updatedPatients[originalVOIndex].voStatus.replace(/^\d+\//, 
                  updatedPatients[originalVOIndex].voStatus.split('/')[1] + '/'),
        logs: [
          ...(updatedPatients[originalVOIndex].logs || []),
          originalVOLog
        ]
      };
      
      // Update Folge VO (In Behandlung → Aktiv)
      updatedPatients[folgeVOIndex] = {
        ...updatedPatients[folgeVOIndex],
        status: "Aktiv",
        statusClass: "bg-blue-100 text-blue-800", // Style for Aktiv
        logs: [
          ...(updatedPatients[folgeVOIndex].logs || []),
          folgeVOLog
        ]
      };
      
      // Add to results
      results.push({
        originalVO: originalVO,
        folgeVO: folgeVO,
        originalStatus: "Aktiv",
        newStatus: "Fertig behandelt"
      });
    });
    
    // Update patients state with changes
    setPatients(updatedPatients);
    
    // Update simulation results
    setCompletedTreatmentsResults(results);
    
    // Show notification
    if (results.length > 0) {
      showNotification(`Completed treatments for ${results.length} VOs and activated their Folge VOs.`, "default");
    } else {
      showNotification("No matching VOs found for treatment completion.", "default");
    }
  };
  
  // Add sample data initialization with new VOs
  useEffect(() => {
    // Part 1: Add sample data for VOs that can be matched in the simulation
    const sampleNewVOs: VO[] = [
      // New VO that can be linked with Monika Krause's VO (id: 104) which has "F.-VO bestelt" status
      {
        id: 1001,
        selected: false,
        name: "Monika Krause",
        geburtsdatum: "09.12.1970",
        heilmittel: "KG-H, MT", // Same as original
        heilmittelAnzahl: "18x",
        einrichtung: "Gesundheitszentrum West",
        therapeut: "A. Schneider", // Same therapist
        aktVO: "[2378-10]", // Incremented VO #
        ausstDatum: "18.05.2025", // More recent date
        voStatus: "0/18", // Just starting treatment
        followUpStatus: "", // Blank as it's new
        previousVO: "[2378-9]", // Previous VO is the one with "F.-VO bestelt"
        nextVO: "",
        arzt: "Dr. Meyer", // Same doctor
        note: false,
        status: "In Behandlung", // New VOs have "In Behandlung" status
        statusClass: "bg-gray-100 text-gray-800",
        logs: []
      },
      
      // Another new VO for Friedrich Bauer that can potentially be linked
      {
        id: 1002,
        selected: false,
        name: "Friedrich Bauer",
        geburtsdatum: "14.03.1957",
        heilmittel: "MT", // Same as original
        heilmittelAnzahl: "10x",
        einrichtung: "Therapiezentrum Nord",
        therapeut: "L. Wagner", // Same therapist
        aktVO: "[8765-4]", // Incremented VO #
        ausstDatum: "10.06.2025", // More recent date
        voStatus: "0/10", // Just starting treatment
        followUpStatus: "", // Blank as it's new
        previousVO: "[8765-3]", // Previous VO is the one with "F.-VO bestellen"
        nextVO: "",
        arzt: "Dr. Fischer", // Same doctor
        note: false,
        status: "In Behandlung", // New VOs have "In Behandlung" status
        statusClass: "bg-gray-100 text-gray-800",
        logs: []
      }
    ];
    
    // Part 2: Create follow-up VOs for patients with "Fertig behandelt" status
    // First, get all VOs with "Fertig behandelt" status
    const fertigBehandeltVOs = patients.filter(vo => vo.status === "Fertig behandelt");
    
    // Create a follow-up VO for each "Fertig behandelt" VO
    const fertigBehandeltFollowUps: VO[] = fertigBehandeltVOs.map((originalVO, index) => {
      // Extract base VO number and increment it
      const baseVONumber = originalVO.aktVO.replace(/[\[\]]/g, ""); // Remove brackets
      const parts = baseVONumber.split('-');
      const newVONumber = `[${parts[0]}-${parseInt(parts[1]) + 1}]`;
      
      return {
        id: 2000 + index, // New unique ID starting from 2000
        selected: false,
        name: originalVO.name,
        geburtsdatum: originalVO.geburtsdatum,
        heilmittel: originalVO.heilmittel,
        heilmittelAnzahl: originalVO.heilmittelAnzahl,
        einrichtung: originalVO.einrichtung,
        therapeut: originalVO.therapeut,
        aktVO: newVONumber,
        ausstDatum: addDaysToDate(originalVO.ausstDatum, 60), // Roughly 2 months later
        voStatus: "0/" + originalVO.heilmittelAnzahl.replace("x", ""),
        followUpStatus: "",
        previousVO: originalVO.aktVO,
        nextVO: "",
        arzt: originalVO.arzt,
        note: false,
        status: "In Behandlung",
        statusClass: "bg-gray-100 text-gray-800",
        logs: []
      };
    });
    
    // Now update original "Fertig behandelt" VOs to have their nextVO field set
    setPatients(prevPatients => {
      return prevPatients.map(patient => {
        if (patient.status === "Fertig behandelt") {
          // Find the corresponding follow-up VO we just created
          const followUpVO = fertigBehandeltFollowUps.find(
            followUp => followUp.previousVO === patient.aktVO
          );
          
          if (followUpVO) {
            return {
              ...patient,
              nextVO: followUpVO.aktVO, // Set the Folge VO # field
              followUpStatus: "F.-VO erhalten" // Set status to "F.-VO erhalten"
            };
          }
        }
        return patient;
      });
    });
    
    // Then add all the new VOs to the patients state
    // Combine all sample VOs
    const allNewVOs = [...sampleNewVOs, ...fertigBehandeltFollowUps];
    
    // Update patients state with all new sample VOs
    setPatients(prevPatients => [...prevPatients, ...allNewVOs]);
  }, []); // Empty dependency array ensures this runs only once
  
  // Helper function to add days to a date in format DD.MM.YYYY
  const addDaysToDate = (dateString: string, daysToAdd: number): string => {
    const parts = dateString.split('.');
    const date = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`); // Convert to YYYY-MM-DD for parsing
    date.setDate(date.getDate() + daysToAdd);
    
    // Format back to DD.MM.YYYY
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}.${month}.${year}`;
  };

  return (
    <WireframeLayout 
      title="Admin VO Management"
      username="Super Admin"
      userInitials="SA"
      showSidebar={false}
    >
      <div className="p-6">
        {/* Success notification has been moved above the table */}

        {/* Header */}
        <div className="mb-6">
          <p className="text-gray-700">Hello Super Admin, I hope you have a wonderful day.</p>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard - Verwaltung</h1>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              {[
                { name: "F.-VO bestellen", count: toOrderCount, color: "text-red-600 bg-red-100" },
                { name: "F.-VO bestelt", count: orderedCount, color: "text-amber-600 bg-amber-100" },
                { name: "F.-VO erhalten", count: receivedCount, color: "text-green-600 bg-green-100" },
                { name: "Fertig Behandelt", count: fertigBehandeltCount, color: "text-green-800 bg-green-100" },
                { name: "All VOs", count: allCount, color: "text-purple-600 bg-purple-100" }
              ].map((tab) => (
                <button
                  key={tab.name}
                  onClick={() => handleTabChange(tab.name)}
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.name
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {tab.name}
                  {tab.count > 0 && (
                    <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${tab.color}`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Filter controls */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            {/* Left side - Doctor filter and Order VOs button */}
            <div className="flex items-center space-x-2">
              {/* Doctor filter - always visible but with different labels based on tab */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Arzt
                </label>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <select 
                      className="border border-gray-300 rounded-md px-3 py-2 pr-8 appearance-none bg-white"
                      value={doctorFilter}
                      onChange={(e) => applyFilter('doctor', e.target.value)}
                    >
                      <option value="All Doctors">Select</option>
                      {uniqueDoctors.map((doctor, index) => (
                        <option key={index} value={doctor.name}>
                          {doctor.name}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                      </svg>
                    </div>
                  </div>
                  
                  {/* Order VOs button - only visible in "F.-VO bestellen" tab */}
                  {activeTab === "F.-VO bestellen" && (
                    <button
                      onClick={() => {
                        if (doctorFilter === "All Doctors") {
                          // Show doctor selection dialog
                          setShowDoctorSelectionDialog(true);
                        } else if (patients.some(p => p.selected)) {
                          // Doctor and patients selected, show order modal
                          setShowOrderModal(true);
                        }
                      }}
                      disabled={doctorFilter === "All Doctors" || !patients.some(p => p.selected)}
                      className={`inline-flex items-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium ${
                        doctorFilter !== "All Doctors" && patients.some(p => p.selected)
                          ? "bg-blue-600 hover:bg-blue-700 text-white border-transparent" 
                          : "bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed opacity-75"
                      } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                      title={doctorFilter === "All Doctors" ? "Select a doctor first" : "Select at least one patient"}
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      Order VOs
                    </button>
                  )}
                </div>
                {activeTab === "F.-VO bestellen" && (
                  <div className="mt-2 flex items-center p-2 bg-blue-50 rounded-md">
                    <svg className="h-5 w-5 text-blue-500 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0zM10 10a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <p className="text-sm font-medium text-blue-600">
                      {doctorFilter === "All Doctors" 
                        ? "Select a doctor to Order VOs"
                        : "Select VOs to order"}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Right side - Search and more filters */}
            <div className="flex items-center space-x-2">
              {/* Search box - moved to right side */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by name, VO#, doctor..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 10a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
              </div>

              {/* More filters dropdown - moved to right side */}
              <div className="relative">
                <button
                  onClick={() => setShowColumns(!showColumns)}
                  className="flex items-center space-x-1 bg-white border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <span>More Filters</span>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
                {showColumns && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                    <div className="p-4 space-y-3">
                      {/* Patient Filter Dropdown - moved inside More Filters */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Patient
                        </label>
                        <select 
                          className="w-full border border-gray-300 rounded-md px-3 py-2 appearance-none bg-white"
                          value={patientFilter}
                          onChange={(e) => applyFilter('patient', e.target.value)}
                        >
                          <option>All Patients</option>
                          {uniquePatients.map((patient, index) => (
                            <option key={index} value={patient}>{patient}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Date Range
                        </label>
                        <div className="relative border border-gray-300 rounded-md px-3 py-2 flex items-center">
                          <span className="text-sm">{dateFilter}</span>
                          <svg className="w-5 h-5 ml-2 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Therapist
                        </label>
                        <select 
                          className="w-full border border-gray-300 rounded-md px-3 py-2 appearance-none bg-white"
                          value={therapistFilter}
                          onChange={(e) => setTherapistFilter(e.target.value)}
                        >
                          <option>Therapist: (Select)</option>
                          <option>A. Rosky</option>
                          <option>P. Sandra</option>
                          <option>J. Scheffler</option>
                          <option>K. Mischke</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Show/Hide Columns
                        </label>
                        <div className="space-y-2">
                          <label className="flex items-center">
                            <input type="checkbox" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" defaultChecked />
                            <span className="ml-2 text-sm text-gray-700">Name</span>
                          </label>
                          <label className="flex items-center">
                            <input type="checkbox" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" defaultChecked />
                            <span className="ml-2 text-sm text-gray-700">Heilmittel</span>
                          </label>
                          <label className="flex items-center">
                            <input type="checkbox" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" defaultChecked />
                            <span className="ml-2 text-sm text-gray-700">Therapeut</span>
                          </label>
                          <label className="flex items-center">
                            <input type="checkbox" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" defaultChecked />
                            <span className="ml-2 text-sm text-gray-700">Doctor</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Clear all filters button */}
              <button 
                onClick={clearAllFilters}
                className="text-sm text-blue-600 hover:text-blue-800 ml-2"
              >
                Clear all filters
              </button>
            </div>
          </div>
        </div>

        {/* Success notification above table */}
        {showSuccessNotification && (
          <div className={`mb-4 px-4 py-3 rounded shadow-lg flex items-center ${
            notificationType === "ordered" 
              ? "bg-amber-50 border border-amber-200 text-amber-800" 
              : "bg-blue-50 border border-blue-200 text-blue-800"
          }`}>
            <svg className={`h-5 w-5 mr-2 ${
              notificationType === "ordered" 
                ? "text-amber-400" 
                : "text-blue-400"
            }`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <div className="flex-1">
              <p className="text-sm font-medium">{notificationMessage}</p>
            </div>
            <button 
              onClick={() => setShowSuccessNotification(false)}
              className={`${
                notificationType === "ordered" 
                  ? "text-amber-400 hover:text-amber-600" 
                  : "text-blue-400 hover:text-blue-600"
              }`}
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        )}

        {/* Data table */}
        <div className="bg-white rounded-md shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {/* Only show checkbox column when in "F.-VO bestellen" tab AND a doctor is selected */}
                  {activeTab === "F.-VO bestellen" && doctorFilter !== "All Doctors" && (
                    <th scope="col" className="px-6 py-3 w-10">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          checked={selectAll}
                          onChange={handleSelectAll}
                        />
                      </div>
                    </th>
                  )}
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">
                    Heilmittel
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                    Therapeut
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">
                    Akt. VO#
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                    Ausst. Datum
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[180px]">
                    Beh. Status (#/#)
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                    Arzt
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                    VO Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">
                    F.-VO OrderStatus
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">
                    Folge VO #
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                    Logs
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {/* Always show a flat list of patients, no grouping by doctor */}
                {filteredPatients.map((patient, index) => {
                  // Determine if this row starts a new doctor group (for visual distinction)
                  const isFirstPatientForDoctor = index === 0 || patient.arzt !== filteredPatients[index - 1].arzt;
                  
                  // Simplify row styling - just use basic alternating colors
                  const isEvenRow = index % 2 === 0;
                  const rowBgClass = isEvenRow ? 'bg-white' : 'bg-gray-50';
                  
                  // Extra styling for selected patients
                  const selectedClass = patient.selected ? 'bg-blue-50 hover:bg-blue-100' : `${rowBgClass} hover:bg-gray-100`;
                  
                  // Remove the border for doctor grouping
                  const borderClass = '';
                  
                  return (
                    <tr 
                      key={patient.id} 
                      className={`${selectedClass} ${borderClass} transition-colors`}
                    >
                      {/* Only show checkbox column when in "F.-VO bestellen" tab AND a doctor is selected */}
                      {activeTab === "F.-VO bestellen" && doctorFilter !== "All Doctors" && (
                        <td className="w-10 px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                              checked={patient.selected}
                              onChange={() => handleSelectRow(patient.id)}
                            />
                          </div>
                        </td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{patient.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{patient.heilmittel}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{patient.therapeut}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{patient.aktVO}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{patient.ausstDatum}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap min-w-[180px]">
                        <div className="flex items-center justify-between space-x-2">
                          <div className="text-sm text-gray-900">{patient.voStatus}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{patient.arzt}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`inline-flex items-center px-2.5 py-1.5 rounded-md text-xs font-medium ${patient.statusClass}`}>
                          {patient.status}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <StatusIndicator type={patient.followUpStatus} />
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap min-w-[150px]">
                        <div className="text-sm text-gray-900">
                          {(patient.followUpStatus === followUpStatusTypes.READY_FU || 
                            patient.followUpStatus === followUpStatusTypes.FERTIG || 
                            patient.followUpStatus === followUpStatusTypes.ABGEBROCHEN || 
                            patient.followUpStatus === followUpStatusTypes.ABGERECHNET ||
                            patient.status === "Fertig behandelt") ? (
                            <span>{patient.nextVO}</span>
                          ) : ""}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <button 
                          className="text-gray-500 hover:text-gray-700"
                          onClick={() => handleViewLogs(patient)}
                          title="View VO logs"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Empty state when no patients match filters */}
          {filteredPatients.length === 0 && (
            <div className="py-12 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No matching patients</h3>
              <p className="mt-1 text-sm text-gray-500">Try adjusting your filters to find what you're looking for.</p>
              <div className="mt-6">
                <button
                  onClick={clearAllFilters}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Clear all filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Doctor selection dialog */}
        {showDoctorSelectionDialog && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Select a Doctor First</h3>
                <button onClick={() => setShowDoctorSelectionDialog(false)} className="text-gray-400 hover:text-gray-500">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-4">
                  VOs can only be ordered in bulk if they have the same doctor. Please select a doctor to continue:
                </p>
                <div className="relative">
                  <select 
                    className="w-full border border-gray-300 rounded-md px-3 py-2 pr-8 appearance-none bg-white"
                    value={doctorFilter}
                    onChange={(e) => applyFilter('doctor', e.target.value)}
                  >
                    <option value="All Doctors">Select</option>
                    {uniqueDoctors.map((doctor, index) => (
                      <option key={index} value={doctor.name}>
                        {doctor.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowDoctorSelectionDialog(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (doctorFilter !== "All Doctors") {
                      setShowDoctorSelectionDialog(false);
                      setShowOrderWorkflow(true);
                      setWorkflowStep(2); // Move to step 2 since doctor is now selected
                    }
                  }}
                  disabled={doctorFilter === "All Doctors"}
                  className={`px-4 py-2 rounded-md text-sm font-medium text-white ${
                    doctorFilter !== "All Doctors" 
                      ? "bg-blue-600 hover:bg-blue-700" 
                      : "bg-blue-400 cursor-not-allowed"
                  }`}
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Order VOs Modal - updated with new workflow and buttons */}
        {showOrderModal && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Order Follow-up VOs</h3>
                <button onClick={() => setShowOrderModal(false)} className="text-gray-400 hover:text-gray-500">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* Show doctor confirmation */}
              <div className="mb-4 bg-blue-50 p-3 rounded-md">
                <div className="flex items-center">
                  <svg className="h-5 w-5 text-blue-400 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <span className="text-sm font-medium text-blue-800">Doctor selected:</span>
                    <span className="ml-1 text-sm text-blue-800">{doctorFilter}</span>
                  </div>
                </div>
              </div>
              
              {/* Detailed patient table */}
              <div className="mb-6 overflow-hidden border border-gray-200 rounded-md">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">
                        Patient Name
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                        Geburtsdatum
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[180px]">
                        Heilmittel & Anzahl
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {patients.filter(patient => patient.selected).map(patient => (
                      <tr key={patient.id}>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                          {formatPatientName(patient.name)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {patient.geburtsdatum}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {parseHeilmittelWithAnzahl(patient).map((item: { type: string, anzahl: string }, index: number) => (
                            <div key={index} className="py-0.5">
                              <span className="font-medium">{item.type}</span>
                              <span className="ml-2 px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs">
                                {item.anzahl}
                              </span>
                            </div>
                          ))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="mt-6 flex flex-col space-y-3">
                {/* "Copy Information" button */}
                <div className="relative">
                  <button
                    onClick={() => {
                      // Format data for clipboard
                      const selectedPatients = patients.filter(patient => patient.selected);
                      const patientData = selectedPatients.map(patient => 
                        `${formatPatientName(patient.name)}    ${patient.geburtsdatum}    ${formatHeilmittelForClipboard(patient)}`
                      ).join('\n');
                      
                      // Try to use clipboard API if available
                      if (navigator.clipboard && window.isSecureContext) {
                        navigator.clipboard.writeText(patientData)
                          .then(() => {
                            // Show notification outside modal
                            showNotification(`Information for ${selectedPatients.length} patients copied to clipboard`, "default");
                            
                            // Show inline confirmation message
                            const copyBtn = document.getElementById('copy-info-btn');
                            if (copyBtn) {
                              const originalText = copyBtn.innerHTML;
                              copyBtn.innerHTML = `
                                <svg class="h-5 w-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                                </svg>
                                Copied to clipboard!
                              `;
                              setTimeout(() => {
                                copyBtn.innerHTML = originalText;
                              }, 2000);
                            }
                          })
                          .catch(() => {
                            // Fallback if clipboard API fails
                            showNotification(`Information for ${selectedPatients.length} patients ready to copy`, "default");
                          });
                      } else {
                        // Fallback for browsers without clipboard API support
                        showNotification(`Information for ${selectedPatients.length} patients ready to copy`, "default");
                      }
                    }}
                    id="copy-info-btn"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center justify-center"
                  >
                    <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                    </svg>
                    Copy Information
                  </button>
                </div>
                
                {/* "Mark as Ordered" button */}
                <button
                  onClick={() => {
                    // Use selected doctor from filter
                    const selectedDoctor = doctorFilter;
                    
                    // Count selected patients
                    const selectedPatientCount = patients.filter(patient => patient.selected).length;
                    
                    // Update selected patients' status to "Follow-up Ordered"
                    const updatedPatients = patients.map(patient => {
                      if (patient.selected) {
                        // Add log entry for ordering
                        const newLog: LogEntry = {
                          timestamp: new Date(),
                          action: 'ORDERED',
                          description: `Follow-up VO ordered for Dr. ${selectedDoctor}`,
                          fromStatus: followUpStatusTypes.NEEDS,
                          toStatus: followUpStatusTypes.ORDERED,
                          user: 'Super Admin'
                        };
                        
                        // Create logs array if it doesn't exist
                        const logs = patient.logs || [];
                        
                        return {
                          ...patient,
                          followUpStatus: followUpStatusTypes.ORDERED,
                          selected: false, // Deselect after ordering
                          logs: [...logs, newLog]
                        };
                      }
                      return patient;
                    });
                    
                    setPatients(updatedPatients);
                    setSelectAll(false);
                    setShowOrderModal(false);
                    
                    // Show success notification
                    showNotification(`Successfully marked ${selectedPatientCount} follow-up VOs as ordered for Dr. ${selectedDoctor}`, "ordered");
                    
                    // If in "F.-VO bestellen" tab, switch to "F.-VO bestelt" tab after ordering
                    if (activeTab === "F.-VO bestellen") {
                      handleTabChange("F.-VO bestelt");
                    }
                  }}
                  disabled={doctorFilter === "All Doctors"}
                  className={`w-full px-4 py-2 rounded-md text-sm font-medium text-white ${
                    doctorFilter !== "All Doctors" 
                      ? "bg-blue-600 hover:bg-blue-700" 
                      : "bg-blue-400 cursor-not-allowed"
                  } flex items-center justify-center`}
                >
                  <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Mark as Ordered
                </button>
                
                {/* Cancel button */}
                <button
                  onClick={() => setShowOrderModal(false)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Logs Modal */}
        {showLogsModal && currentLogVO && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full p-6 max-h-[80vh] overflow-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Logs for VO {currentLogVO.aktVO} - {currentLogVO.name}
                </h3>
                <button onClick={() => setShowLogsModal(false)} className="text-gray-400 hover:text-gray-500">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {currentLogVO.logs && currentLogVO.logs.length > 0 ? (
                <div>
                  <div className="border border-gray-200 rounded-md mb-4">
                    <ul className="divide-y divide-gray-200">
                      {currentLogVO.logs.map((log: LogEntry, index: number) => (
                        <li key={index} className="px-4 py-3">
                          <div className="flex justify-between">
                            <div className="text-sm text-gray-600">
                              {new Date(log.timestamp).toLocaleString()}
                            </div>
                            <div>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                log.action === 'ORDERED' ? 'bg-yellow-100 text-yellow-800' :
                                log.action === 'TREATMENT_STARTED' ? 'bg-blue-100 text-blue-800' :
                                log.action === 'VO_CLOSED' ? 'bg-green-100 text-green-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {log.action === 'ORDERED' ? 'Ordered' :
                                log.action === 'TREATMENT_STARTED' ? 'Treatment Started' :
                                log.action === 'VO_CLOSED' ? 'VO Closed' :
                                log.action}
                              </span>
                            </div>
                          </div>
                          <div className="mt-1 text-sm text-gray-900">
                            {log.description}
                          </div>
                          {(log.fromStatus || log.toStatus) && (
                            <div className="mt-2 text-xs text-gray-500">
                              {log.fromStatus && <span className="mr-2">From: <span className="font-medium">{log.fromStatus}</span></span>}
                              {log.toStatus && <span>To: <span className="font-medium">{log.toStatus}</span></span>}
                            </div>
                          )}
                          <div className="mt-1 text-xs text-gray-500">
                            By: <span className="font-medium">{log.user}</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="text-center py-10">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No logs found</h3>
                  <p className="mt-1 text-sm text-gray-500">There are no action logs for this VO yet.</p>
                </div>
              )}
              
              <div className="flex justify-end mt-4">
                <button
                  onClick={() => setShowLogsModal(false)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Simulate Folge VO Link button - fixed position at bottom right */}
      {activeTab === "F.-VO bestelt" && (
        <div className="fixed bottom-6 right-6">
          <button
            onClick={() => setShowSimulateLinkModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
            </svg>
            Simulate Folge VO Link
          </button>
        </div>
      )}
      
      {/* Simulate Completed Treatments button - fixed position at bottom right */}
      {activeTab === "F.-VO erhalten" && (
        <div className="fixed bottom-6 right-6">
          <button
            onClick={() => {
              runCompletedTreatmentsSimulation();
              setShowCompletedTreatmentsModal(true);
            }}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Simulate Completed Treatments
          </button>
        </div>
      )}
      
      {/* Simulate Folge VO Link Modal */}
      {showSimulateLinkModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full p-6 max-h-[80vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Simulate Folge VO Link
              </h3>
              <button onClick={() => setShowSimulateLinkModal(false)} className="text-gray-400 hover:text-gray-500">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Explanation section */}
            <div className="mb-6 bg-blue-50 p-4 rounded-md">
              <h4 className="text-sm font-medium text-blue-800 mb-2">How Folge VO Linking Works</h4>
              <p className="text-sm text-blue-700 mb-2">
                This simulation demonstrates the automatic linking that occurs when:
              </p>
              <ul className="list-disc pl-5 text-sm text-blue-700 mb-2">
                <li>A VO has "F.-VO Bestelt" status (a follow-up VO has been ordered)</li>
                <li>A new VO appears in the system for the same patient</li>
                <li>The new VO has the same Heilmittel (therapy type)</li>
                <li>The new VO has a more recent issue date</li>
              </ul>
              <p className="text-sm text-blue-700">
                When these conditions are met, the original VO's "Folge VO #" field will be updated with the new VO's number, 
                and its status will change from "F.-VO Bestelt" to "F.-VO erhalten".
              </p>
            </div>
            
            {/* Results section - displayed after simulation is run */}
            {simulationResults.length > 0 ? (
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-800 mb-3">Simulation Results</h4>
                <div className="border border-gray-200 rounded-md overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Patient
                        </th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Original VO
                        </th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Matched With
                        </th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status Change
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {simulationResults.map((result, index) => (
                        <tr key={index}>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                            {result.originalVO.name}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            <div>VO# {result.originalVO.aktVO}</div>
                            <div className="text-xs text-gray-400">{result.originalVO.heilmittel} | {result.originalVO.ausstDatum}</div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            <div>VO# {result.matchedVO.aktVO}</div>
                            <div className="text-xs text-gray-400">{result.matchedVO.heilmittel} | {result.matchedVO.ausstDatum}</div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                                {result.originalStatus}
                              </div>
                              <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                              <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                {result.newStatus}
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="mb-6 border border-gray-200 rounded-md p-6 text-center">
                <p className="text-gray-500 mb-2">
                  Click "Run Simulation" to find and link matching VOs.
                </p>
                <p className="text-sm text-gray-400">
                  Results will appear here after the simulation is run.
                </p>
              </div>
            )}
            
            {/* Action buttons */}
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowSimulateLinkModal(false);
                  // Clear simulation results when closing
                  setSimulationResults([]);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                {simulationResults.length > 0 ? 'Close' : 'Cancel'}
              </button>
              
              {simulationResults.length === 0 && (
                <button
                  onClick={() => {
                    // Run the simulation logic
                    runFolgeVOSimulation();
                  }}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Run Simulation
                </button>
              )}
              
              {simulationResults.length > 0 && (
                <button
                  onClick={() => {
                    // Reset and run again
                    setSimulationResults([]);
                    runFolgeVOSimulation();
                  }}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Run Again
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Simulate Completed Treatments Modal */}
      {showCompletedTreatmentsModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full p-6 max-h-[80vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Simulate Completed Treatments
              </h3>
              <button onClick={() => setShowCompletedTreatmentsModal(false)} className="text-gray-400 hover:text-gray-500">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Explanation section */}
            <div className="mb-6 bg-blue-50 p-4 rounded-md">
              <h4 className="text-sm font-medium text-blue-800 mb-2">How Treatment Completion Works</h4>
              <p className="text-sm text-blue-700 mb-2">
                This simulation demonstrates what happens when all treatments for an Aktiv VO are completed:
              </p>
              <ul className="list-disc pl-5 text-sm text-blue-700 mb-2">
                <li>When a VO with "Aktiv" status and "F.-VO erhalten" Order Status completes all treatments:</li>
                <li>The original VO's status changes to "Fertig behandelt"</li>
                <li>The original VO's Order Status is cleared</li>
                <li>The linked Folge VO's status changes from "In Behandlung" to "Aktiv"</li>
              </ul>
              <p className="text-sm text-blue-700">
                This simulation automatically identifies eligible VOs and applies these status changes.
              </p>
            </div>
            
            {/* Results section - displayed after simulation is run */}
            {completedTreatmentsResults.length > 0 ? (
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-800 mb-3">Simulation Results</h4>
                <div className="border border-gray-200 rounded-md overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">
                          Patient
                        </th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">
                          Original VO
                        </th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">
                          Status Change
                        </th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">
                          Folge VO
                        </th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">
                          Status Change
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {completedTreatmentsResults.map((result, index) => (
                        <tr key={index}>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                            {result.originalVO.name}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            <div>VO# {result.originalVO.aktVO}</div>
                            <div className="text-xs text-gray-400">{result.originalVO.heilmittel}</div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                Aktiv
                              </div>
                              <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                              <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-800 text-green-100">
                                Fertig behandelt
                              </div>
                            </div>
                            <div className="mt-1 text-xs text-gray-500">Order Status: F.-VO erhalten → None</div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            <div>VO# {result.folgeVO.aktVO}</div>
                            <div className="text-xs text-gray-400">{result.folgeVO.heilmittel}</div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                In Behandlung
                              </div>
                              <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                              <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                Aktiv
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="mb-6 border border-gray-200 rounded-md p-6 text-center">
                <p className="text-gray-500 mb-2">
                  No eligible VOs found for treatment completion simulation.
                </p>
                <p className="text-sm text-gray-400">
                  To be eligible, a VO must have "Aktiv" status, "F.-VO erhalten" Order Status, and a linked Folge VO.
                </p>
              </div>
            )}
            
            {/* Action buttons */}
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowCompletedTreatmentsModal(false);
                  // Clear simulation results when closing
                  setCompletedTreatmentsResults([]);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
              
              {completedTreatmentsResults.length > 0 && (
                <button
                  onClick={() => {
                    // Reset and run again
                    setCompletedTreatmentsResults([]);
                    runCompletedTreatmentsSimulation();
                  }}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Run Again
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </WireframeLayout>
  );
} 
