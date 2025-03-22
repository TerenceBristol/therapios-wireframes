'use client';

import React, { useState, useEffect, useRef } from 'react';
import WireframeLayout from '@/components/WireframeLayout';
import WireframeButton from '@/components/WireframeButton';
import WireframeFormControl from '@/components/WireframeFormControl';

// Define the patient data type
type Patient = {
  id: number;
  name: string;
  facility: string;
  lastTreatment: string;
  frequencyWTD: string;
  organizer: string;
  prescription: string;
  status: string;
  doctor: string;
  selected?: boolean;
  session?: string;
  notes?: string;
  startTime?: string;
  endTime?: string;
  treated?: boolean;
  treatmentHistory?: TreatmentEntry[];
  totalTreatments: number;  // Maximum number of treatments prescribed
  completedTreatments: number;  // Number of treatments completed
};

// Type for a treatment history entry
type TreatmentEntry = {
  date: string;
  startTime?: string;
  endTime?: string;
  notes?: string;
  session?: string;
};

// Auto-resizing textarea component
const AutoResizeTextarea = ({ value, onChange, placeholder, className }: { 
  value: string; 
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void; 
  placeholder?: string;
  className?: string;
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  useEffect(() => {
    if (textareaRef.current) {
      // Reset height to auto to get the correct scrollHeight
      textareaRef.current.style.height = 'auto';
      // Set the height to scrollHeight to fit content
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [value]);
  
  return (
    <textarea
      ref={textareaRef}
      value={value || ''}
      onChange={onChange}
      placeholder={placeholder}
      className={`border border-gray-300 rounded-md py-2 px-4 w-full resize-none min-h-[40px] ${className}`}
      rows={1}
    />
  );
};

export default function TreatmentDocumentationWireframe() {
  // State for modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPatientId, setCurrentPatientId] = useState<number | null>(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isDocumentationModalOpen, setIsDocumentationModalOpen] = useState(false);
  const [viewingPatient, setViewingPatient] = useState<Patient | null>(null);
  const [collapsedCards, setCollapsedCards] = useState<number[]>([]);
  
  // State to track which patients' suggestions are visible (now an array)
  const [visibleSuggestions, setVisibleSuggestions] = useState<number[]>([]);
  
  const [treatmentDate, setTreatmentDate] = useState('01.07.2025');
  const [modalPatients, setModalPatients] = useState<Patient[]>([]);
  const [draggedPatientId, setDraggedPatientId] = useState<number | null>(null);
  
  // Suggested notes
  const suggestedNotes = [
    "Standard physiotherapy session completed with positive response to treatment.",
    "Occupational therapy focused on fine motor skills, patient showing improvement.",
    "Patient reported reduced pain levels following treatment. Exercises prescribed for home practice."
  ];
  
  // Additional diverse notes for prefilling
  const additionalNotes = [
    "Patient completed all exercises with minimal assistance. Improvement in range of motion noted.",
    "Therapeutic massage and heat therapy applied to lower back. Patient reported immediate relief.",
    "Balance and coordination exercises completed. Patient showing gradual progress in stability.",
    "Functional mobility training focused on transfers. Patient confidence increasing with each session.",
    "Gait training with assistive device. Patient weight bearing tolerance improving.",
    "Manual therapy techniques applied to shoulder. Increased range detected post-treatment.",
    "Therapeutic ultrasound applied to affected area. Inflammation appears reduced.",
    "Neuromuscular re-education exercises completed. Patient reports better awareness of posture."
  ];
  
  // State for calendar dates
  const currentDate = new Date();
  const [calendarMonth, setCalendarMonth] = useState(currentDate.getMonth());
  const [calendarYear, setCalendarYear] = useState(currentDate.getFullYear());
  
  // Function to get days in month
  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };
  
  // Function to format date as DD.MM.YYYY
  const formatDate = (date: Date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  };
  
  // Function to handle date selection
  const handleDateSelect = (day: number) => {
    const selectedDate = new Date(calendarYear, calendarMonth, day);
    setTreatmentDate(formatDate(selectedDate));
    setIsCalendarOpen(false);
  };
  
  // Function to get a random note from additionalNotes
  const getRandomNote = () => {
    const randomIndex = Math.floor(Math.random() * additionalNotes.length);
    return additionalNotes[randomIndex];
  };
  
  // State for selected patients
  const [patients, setPatients] = useState<Patient[]>([
    { 
      id: 1, 
      name: 'Woggesin, Dennis', 
      facility: 'St. Mary', 
      lastTreatment: '03/10/2025', 
      frequencyWTD: '1-5', 
      organizer: '', 
      prescription: '399-17', 
      status: '/', 
      doctor: 'Niedeggen',
      session: '4/10',
      notes: 'Standard Physiotherapy session completed.',
      totalTreatments: 15,
      completedTreatments: 4
    },
    { 
      id: 2, 
      name: 'Johnson, Robert', 
      facility: 'Central', 
      lastTreatment: '03/08/2025', 
      frequencyWTD: '2-4', 
      organizer: '', 
      prescription: '402-11', 
      status: '/', 
      doctor: 'Niedeggen',
      totalTreatments: 12,
      completedTreatments: 0
    },
    { 
      id: 3, 
      name: 'Smith, Angela', 
      facility: 'Memorial', 
      lastTreatment: '03/12/2025', 
      frequencyWTD: '3-6', 
      organizer: '', 
      prescription: '388-20', 
      status: '/', 
      doctor: 'Niedeggen',
      session: '7/10',
      notes: 'Occupational therapy focus on hand exercises.',
      totalTreatments: 20,
      completedTreatments: 7
    },
    { 
      id: 4, 
      name: 'Brown, Patricia', 
      facility: 'Northside', 
      lastTreatment: '03/09/2025', 
      frequencyWTD: '0-3', 
      organizer: '', 
      prescription: '405-09', 
      status: '/', 
      doctor: 'Niedeggen',
      totalTreatments: 10,
      completedTreatments: 2
    },
    { 
      id: 5, 
      name: 'Miller, Thomas', 
      facility: 'West End', 
      lastTreatment: '03/11/2025', 
      frequencyWTD: '2-5', 
      organizer: '', 
      prescription: '397-14', 
      status: '/', 
      doctor: 'Niedeggen',
      totalTreatments: 18,
      completedTreatments: 5
    }
  ]);

  // Generate start times for all patients in the modal
  const generateStartTimes = (patientsList: Patient[]) => {
    // Start at 8:00 AM
    const baseHour = 8;
    const baseMinute = 0;
    
    // Generate times with each appointment starting right after the previous one
    return patientsList.reduce((acc: Patient[], patient, index) => {
      // For the first patient, use the base time
      if (index === 0) {
        const startHour = baseHour;
        const startMinute = baseMinute;
        
        // Calculate end time (20 minutes after start time)
        const endMinutes = startMinute + 20;
        const endHour = startHour + Math.floor(endMinutes / 60);
        const endMinute = endMinutes % 60;
        
        // Format start time
        const startAmPm = startHour >= 12 ? 'PM' : 'AM';
        const formattedStartHour = startHour % 12 || 12;
        const formattedStartMinute = startMinute.toString().padStart(2, '0');
        const startTime = `${formattedStartHour}:${formattedStartMinute} ${startAmPm}`;
        
        // Format end time
        const endAmPm = endHour >= 12 ? 'PM' : 'AM';
        const formattedEndHour = endHour % 12 || 12;
        const formattedEndMinute = endMinute.toString().padStart(2, '0');
        const endTime = `${formattedEndHour}:${formattedEndMinute} ${endAmPm}`;
        
        // Ensure patient has notes
        const notes = patient.notes || getRandomNote();
        
        acc.push({ ...patient, startTime, endTime, notes });
      } else {
        // For subsequent patients, use the end time of the previous patient as their start time
        const prevPatient = acc[index - 1];
        
        // Parse previous patient's end time
        const [prevEndTimeStr, prevAmPm] = prevPatient.endTime!.split(' ');
        const [prevEndHourStr, prevEndMinuteStr] = prevEndTimeStr.split(':');
        let prevEndHour = parseInt(prevEndHourStr);
        if (prevAmPm === 'PM' && prevEndHour !== 12) prevEndHour += 12;
        if (prevAmPm === 'AM' && prevEndHour === 12) prevEndHour = 0;
        const prevEndMinute = parseInt(prevEndMinuteStr);
        
        // Set start time to previous patient's end time
        const startHour = prevEndHour;
        const startMinute = prevEndMinute;
        
        // Calculate end time (20 minutes after start time)
        const endMinutes = startMinute + 20;
        const endHour = startHour + Math.floor(endMinutes / 60);
        const endMinute = endMinutes % 60;
        
        // Format start time
        const startAmPm = startHour >= 12 ? 'PM' : 'AM';
        const formattedStartHour = startHour % 12 || 12;
        const formattedStartMinute = startMinute.toString().padStart(2, '0');
        const startTime = `${formattedStartHour}:${formattedStartMinute} ${startAmPm}`;
        
        // Format end time
        const endAmPm = endHour >= 12 ? 'PM' : 'AM';
        const formattedEndHour = endHour % 12 || 12;
        const formattedEndMinute = endMinute.toString().padStart(2, '0');
        const endTime = `${formattedEndHour}:${formattedEndMinute} ${endAmPm}`;
        
        // Ensure patient has notes
        const notes = patient.notes || getRandomNote();
        
        acc.push({ ...patient, startTime, endTime, notes });
      }
      
      return acc;
    }, []);
  };

  // Function to update modal patients when the modal opens
  useEffect(() => {
    if (isModalOpen) {
      const selected = patients.filter(patient => patient.selected);
      const newModalPatients = generateStartTimes(selected);
      setModalPatients(newModalPatients);
      
      // Automatically show suggestions for all patients when the modal opens
      setVisibleSuggestions(newModalPatients.map(patient => patient.id));
    } else {
      // Clear visible suggestions when the modal closes
      setVisibleSuggestions([]);
    }
  }, [isModalOpen, patients]);

  // Function to handle start time changes
  const handleStartTimeChange = (id: number, startTime: string) => {
    // Find the index of the patient in modalPatients
    const patientIndex = modalPatients.findIndex(p => p.id === id);
    if (patientIndex === -1) return;
    
    // Create a new array with updated patient data
    const updatedPatients = [...modalPatients];
    
    // Parse the new start time
    const [timeStr, amPm] = startTime.split(' ');
    const [hourStr, minuteStr] = timeStr.split(':');
    let startHour = parseInt(hourStr);
    if (amPm === 'PM' && startHour !== 12) startHour += 12;
    if (amPm === 'AM' && startHour === 12) startHour = 0;
    const startMinute = parseInt(minuteStr);
    
    // Calculate new end time (20 minutes after start time)
    const endMinutes = startMinute + 20;
    const endHour = startHour + Math.floor(endMinutes / 60);
    const endMinute = endMinutes % 60;
    
    // Format end time
    const endAmPm = endHour >= 12 ? 'PM' : 'AM';
    const formattedEndHour = endHour % 12 || 12;
    const formattedEndMinute = endMinute.toString().padStart(2, '0');
    const endTime = `${formattedEndHour}:${formattedEndMinute} ${endAmPm}`;
    
    // Update the current patient
    updatedPatients[patientIndex] = { 
      ...updatedPatients[patientIndex], 
      startTime, 
      endTime 
    };
    
    // Update all subsequent patients' times
    for (let i = patientIndex + 1; i < updatedPatients.length; i++) {
      const prevPatient = updatedPatients[i - 1];
      
      // The previous patient's end time becomes this patient's start time
      const newStartTime = prevPatient.endTime;
      
      // Parse the new start time
      const [newTimeStr, newAmPm] = newStartTime!.split(' ');
      const [newHourStr, newMinuteStr] = newTimeStr.split(':');
      let newStartHour = parseInt(newHourStr);
      if (newAmPm === 'PM' && newStartHour !== 12) newStartHour += 12;
      if (newAmPm === 'AM' && newStartHour === 12) newStartHour = 0;
      const newStartMinute = parseInt(newMinuteStr);
      
      // Calculate new end time (20 minutes after start time)
      const newEndMinutes = newStartMinute + 20;
      const newEndHour = newStartHour + Math.floor(newEndMinutes / 60);
      const newEndMinute = newEndMinutes % 60;
      
      // Format end time
      const newEndAmPm = newEndHour >= 12 ? 'PM' : 'AM';
      const formattedNewEndHour = newEndHour % 12 || 12;
      const formattedNewEndMinute = newEndMinute.toString().padStart(2, '0');
      const newEndTime = `${formattedNewEndHour}:${formattedNewEndMinute} ${newEndAmPm}`;
      
      // Update this patient
      updatedPatients[i] = { 
        ...updatedPatients[i], 
        startTime: newStartTime,
        endTime: newEndTime
      };
    }
    
    setModalPatients(updatedPatients);
  };

  // Function to handle end time changes
  const handleEndTimeChange = (id: number, endTime: string) => {
    // Find the index of the patient in modalPatients
    const patientIndex = modalPatients.findIndex(p => p.id === id);
    if (patientIndex === -1) return;
    
    // Create a new array with updated patient data
    const updatedPatients = [...modalPatients];
    
    // Update the current patient's end time
    updatedPatients[patientIndex] = { 
      ...updatedPatients[patientIndex], 
      endTime 
    };
    
    // Update all subsequent patients' times
    for (let i = patientIndex + 1; i < updatedPatients.length; i++) {
      const prevPatient = updatedPatients[i - 1];
      
      // The previous patient's end time becomes this patient's start time
      const newStartTime = prevPatient.endTime;
      
      // Parse the new start time
      const [newTimeStr, newAmPm] = newStartTime!.split(' ');
      const [newHourStr, newMinuteStr] = newTimeStr.split(':');
      let newStartHour = parseInt(newHourStr);
      if (newAmPm === 'PM' && newStartHour !== 12) newStartHour += 12;
      if (newAmPm === 'AM' && newStartHour === 12) newStartHour = 0;
      const newStartMinute = parseInt(newMinuteStr);
      
      // Calculate new end time (20 minutes after start time)
      const newEndMinutes = newStartMinute + 20;
      const newEndHour = newStartHour + Math.floor(newEndMinutes / 60);
      const newEndMinute = newEndMinutes % 60;
      
      // Format end time
      const newEndAmPm = newEndHour >= 12 ? 'PM' : 'AM';
      const formattedNewEndHour = newEndHour % 12 || 12;
      const formattedNewEndMinute = newEndMinute.toString().padStart(2, '0');
      const newEndTime = `${formattedNewEndHour}:${formattedNewEndMinute} ${newEndAmPm}`;
      
      // Update this patient
      updatedPatients[i] = { 
        ...updatedPatients[i], 
        startTime: newStartTime,
        endTime: newEndTime
      };
    }
    
    setModalPatients(updatedPatients);
  };

  // Function to toggle patient selection
  const togglePatientSelection = (id: number) => {
    setPatients(patients.map(patient => 
      patient.id === id ? { ...patient, selected: !patient.selected } : patient
    ));
  };
  
  // Function to handle prescription selection
  const handlePrescriptionSelect = (id: number) => {
    console.log(`Selected prescription for patient ${id}`);
  };

  // Function to toggle showing suggestion for a patient
  const toggleSuggestions = (patientId: number) => {
    if (visibleSuggestions.includes(patientId)) {
      setVisibleSuggestions(visibleSuggestions.filter(id => id !== patientId));
    } else {
      setVisibleSuggestions([...visibleSuggestions, patientId]);
    }
  };

  // Function to select a suggested note
  const selectSuggestedNote = (patientId: number, note: string) => {
    updatePatientNotes(patientId, note);
    // Remove this patient from the visible suggestions
    setVisibleSuggestions(visibleSuggestions.filter(id => id !== patientId));
  };

  // Function to update patient notes
  const updatePatientNotes = (id: number, notes: string) => {
    setModalPatients(modalPatients.map(patient => 
      patient.id === id ? { ...patient, notes } : patient
    ));
    // Hide suggestions when user types
    if (visibleSuggestions.includes(id)) {
      setVisibleSuggestions(visibleSuggestions.filter(suggestionId => suggestionId !== id));
    }
  };

  // Check if any patient is selected to show the Document Treatment button
  const hasSelectedPatients = patients.some(patient => patient.selected);
  const selectedCount = modalPatients.length;

  // Function to toggle the modal
  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  // Function to handle saving the form
  const handleSave = () => {
    // Update the patients list with the new treatment information
    const updatedPatients = patients.map(patient => {
      const modalPatient = modalPatients.find(mp => mp.id === patient.id);
      if (modalPatient) {
        const newCompletedTreatments = Math.min(patient.completedTreatments + 1, patient.totalTreatments);
        return {
          ...patient,
          treated: true,
          lastTreatment: treatmentDate,
          notes: modalPatient.notes,
          startTime: modalPatient.startTime,
          endTime: modalPatient.endTime,
          selected: false,
          completedTreatments: newCompletedTreatments,
          treatmentHistory: [
            ...(patient.treatmentHistory || []),
            {
              date: treatmentDate,
              notes: modalPatient.notes,
              startTime: modalPatient.startTime,
              endTime: modalPatient.endTime,
              session: `${newCompletedTreatments}/${patient.totalTreatments}`
            }
          ]
        };
      }
      return patient;
    });

    setPatients(updatedPatients);
    setModalPatients([]);
    setIsModalOpen(false);
  };

  // Drag & Drop Functions
  const handleDragStart = (patientId: number) => {
    setDraggedPatientId(patientId);
    // Collapse the card being dragged
    if (!collapsedCards.includes(patientId)) {
      setCollapsedCards(prev => [...prev, patientId]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Necessary to allow dropping
  };

  const handleDrop = (targetPatientId: number) => {
    if (draggedPatientId === null || draggedPatientId === targetPatientId) {
      setDraggedPatientId(null);
      return;
    }

    // Create a copy of the current patients array
    const updatedPatients = [...modalPatients];

    // Find the indices of the dragged and target patients
    const draggedIndex = updatedPatients.findIndex(p => p.id === draggedPatientId);
    const targetIndex = updatedPatients.findIndex(p => p.id === targetPatientId);

    if (draggedIndex !== -1 && targetIndex !== -1) {
      // Store the dragged patient's data
      const draggedPatient = updatedPatients[draggedIndex];
      
      // Remove the dragged patient from the array
      updatedPatients.splice(draggedIndex, 1);
      
      // Insert the dragged patient at the target position
      updatedPatients.splice(targetIndex, 0, draggedPatient);

      // Regenerate start times based on the new order
      const patientsWithNewTimes = generateStartTimes(updatedPatients);
      
      // Preserve the collapse state of all cards
      setModalPatients(patientsWithNewTimes);
    }

    setDraggedPatientId(null);
  };

  const handleDragEnd = () => {
    setDraggedPatientId(null);
  };

  // Function to toggle the documentation view modal
  const toggleDocumentationModal = (patient: Patient | null) => {
    setViewingPatient(patient);
    setIsDocumentationModalOpen(!isDocumentationModalOpen);
  };

  // Function to toggle card collapse
  const toggleCardCollapse = (patientId: number) => {
    setCollapsedCards(prev => 
      prev.includes(patientId) 
        ? prev.filter(id => id !== patientId)
        : [...prev, patientId]
    );
  };

  return (
    <WireframeLayout title="Therapios" username="User Therapist" userInitials="UT" showSidebar={false}>
      <div className="max-w-full mx-auto bg-[#f8f9fa] rounded-lg shadow p-4">
        {/* Treatment Documentation Header */}
        <div className="mb-4 flex justify-between">
          <h1 className="text-2xl font-bold text-gray-800">Treatment Documentation</h1>
        </div>

        {/* Patient List Table */}
        <div className="bg-white rounded-lg shadow-sm mb-4">
          <div className="flex items-center justify-between p-4 border-b">
            <div className="relative flex items-center space-x-3">
              <WireframeButton 
                className="flex items-center gap-2"
                variant="outline"
              >
                Show columns
                <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v8a1 1 0 11-2 0V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
              </WireframeButton>
              
              {/* Document Treatment button - next to Show columns */}
              {hasSelectedPatients && (
                <WireframeButton variant="primary" onClick={toggleModal}>
                  Document Treatment
                </WireframeButton>
              )}
            </div>
            <div className="relative">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Search Patient"
                  className="border border-gray-300 rounded-md pl-10 pr-4 py-2 w-64 focus:outline-none focus:border-blue-500"
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Table Headers */}
          <div className="grid grid-cols-10 gap-4 py-3 px-4 bg-gray-100 text-gray-700 font-medium text-sm">
            <div className="col-span-1"></div>
            <div className="col-span-1">Name Patient</div>
            <div className="col-span-1">Facility</div>
            <div className="col-span-1">Last Treatment (Date)</div>
            <div className="col-span-1">Frequency WTD</div>
            <div className="col-span-1">Organizer</div>
            <div className="col-span-1">Prescription (Current)</div>
            <div className="col-span-1">Status VO (#/#)</div>
            <div className="col-span-1">Doctor</div>
            <div className="col-span-1">Dokumentation</div>
          </div>

          {/* Table Rows */}
          {patients.map((patient) => (
            <div 
              key={patient.id} 
              className={`grid grid-cols-10 gap-4 py-3 px-4 border-t border-gray-200 items-center ${
                patient.treated ? 'bg-green-50' : patient.selected ? 'bg-blue-50' : ''
              }`}
            >
              <div className="col-span-1 flex justify-center">
                <input 
                  type="checkbox" 
                  checked={patient.selected || false} 
                  onChange={() => togglePatientSelection(patient.id)}
                  className="h-5 w-5 text-blue-500 rounded border-gray-300"
                />
              </div>
              <div className="col-span-1">{patient.name}</div>
              <div className="col-span-1">{patient.facility}</div>
              <div className="col-span-1">
                <span className={patient.treated ? 'font-bold' : ''}>
                  {patient.lastTreatment}
                </span>
              </div>
              <div className="col-span-1">{patient.frequencyWTD}</div>
              <div className="col-span-1">
                <select 
                  className="w-full border border-gray-300 rounded px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={patient.organizer}
                  disabled={patient.treated}
                >
                  <option value="">Select</option>
                  <option value="Planned">Planned</option>
                  <option value="Treated">Treated</option>
                </select>
              </div>
              <div className="col-span-1">
                {patient.prescription}
              </div>
              <div className="col-span-1">
                <span className={`font-medium ${patient.completedTreatments === patient.totalTreatments ? 'text-green-600' : 'text-blue-600'}`}>
                  {patient.completedTreatments}/{patient.totalTreatments}
                </span>
              </div>
              <div className="col-span-1">{patient.doctor}</div>
              <div className="col-span-1 flex justify-center">
                {patient.treated && (
                  <button 
                    onClick={() => toggleDocumentationModal(patient)}
                    className="text-blue-600 hover:text-blue-800"
                    title="View documentation"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Treatment Documentation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 overflow-hidden">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="bg-white text-gray-800 py-4 px-6 rounded-t-lg flex justify-between items-center border-b">
              <h2 className="text-xl font-semibold">Mark as Treated ({selectedCount})</h2>
              <button 
                onClick={toggleModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body - Scrollable */}
            <div className="p-6 overflow-y-auto flex-grow">
              {/* Treatment Date with Calendar Icon */}
              <div className="mb-6">
                <label className="text-gray-700 text-sm font-medium mb-2 block">Treatment Date</label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={treatmentDate}
                    onChange={(e) => setTreatmentDate(e.target.value)}
                    className="border border-gray-300 rounded-md py-2 px-4 w-48 pr-10"
                  />
                  <button 
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </button>
                  
                  {/* Calendar Dropdown */}
                  {isCalendarOpen && (
                    <div className="absolute top-12 left-0 w-64 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                      <div className="p-2 flex justify-between items-center border-b border-gray-200">
                        <button 
                          onClick={() => {
                            const newMonth = calendarMonth === 0 ? 11 : calendarMonth - 1;
                            const newYear = calendarMonth === 0 ? calendarYear - 1 : calendarYear;
                            setCalendarMonth(newMonth);
                            setCalendarYear(newYear);
                          }}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>
                        <div className="font-medium">
                          {new Date(calendarYear, calendarMonth).toLocaleString('default', { month: 'long' })} {calendarYear}
                        </div>
                        <button 
                          onClick={() => {
                            const newMonth = calendarMonth === 11 ? 0 : calendarMonth + 1;
                            const newYear = calendarMonth === 11 ? calendarYear + 1 : calendarYear;
                            setCalendarMonth(newMonth);
                            setCalendarYear(newYear);
                          }}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>
                      <div className="grid grid-cols-7 gap-1 p-2">
                        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day, index) => (
                          <div key={index} className="text-center text-xs font-medium text-gray-500 py-1">
                            {day}
                          </div>
                        ))}
                        
                        {Array.from({ length: new Date(calendarYear, calendarMonth, 1).getDay() }).map((_, index) => (
                          <div key={`empty-start-${index}`} className="p-1"></div>
                        ))}
                        
                        {Array.from({ length: getDaysInMonth(calendarMonth, calendarYear) }).map((_, index) => {
                          const day = index + 1;
                          const isToday = 
                            day === currentDate.getDate() && 
                            calendarMonth === currentDate.getMonth() && 
                            calendarYear === currentDate.getFullYear();
                            
                          return (
                            <div 
                              key={`day-${day}`} 
                              onClick={() => handleDateSelect(day)}
                              className={`
                                text-center py-1 cursor-pointer hover:bg-blue-100 rounded
                                ${isToday ? 'bg-blue-500 text-white hover:bg-blue-600' : ''}
                              `}
                            >
                              {day}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Patient Cards - Now with collapsible functionality and drag-and-drop */}
              {modalPatients.map((patient) => (
                <div 
                  key={patient.id} 
                  className={`mb-4 bg-white border border-gray-200 rounded-md shadow-sm overflow-hidden ${
                    draggedPatientId === patient.id ? 'opacity-50' : ''
                  }`}
                  draggable
                  onDragStart={() => handleDragStart(patient.id)}
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop(patient.id)}
                  onDragEnd={handleDragEnd}
                >
                  {/* Card Header - Always visible */}
                  <div 
                    className="flex justify-between items-center p-4 bg-gray-50 cursor-pointer"
                    onClick={() => toggleCardCollapse(patient.id)}
                  >
                    <div className="flex items-center gap-4">
                      <svg 
                        className={`w-5 h-5 transform transition-transform ${collapsedCards.includes(patient.id) ? '' : 'rotate-180'}`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                      <div>
                        <h3 className="font-medium">{patient.name}</h3>
                        <div className="text-sm text-gray-600">
                          <span>Prescription {patient.prescription}</span>
                          <span className="mx-2">•</span>
                          <span>Treatment {patient.completedTreatments + 1}/{patient.totalTreatments}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Content - Collapsible */}
                  {!collapsedCards.includes(patient.id) && (
                    <div className="p-4 border-t border-gray-200">
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="text-sm text-gray-600 block mb-1">Start Time</label>
                          <input 
                            type="text"
                            value={patient.startTime || ''}
                            onChange={(e) => handleStartTimeChange(patient.id, e.target.value)}
                            className="border border-gray-300 rounded-md py-1.5 px-3 w-full text-sm"
                            placeholder="8:30 AM"
                          />
                        </div>
                        <div>
                          <label className="text-sm text-gray-600 block mb-1">End Time</label>
                          <input 
                            type="text"
                            value={patient.endTime || ''}
                            onChange={(e) => handleEndTimeChange(patient.id, e.target.value)}
                            className="border border-gray-300 rounded-md py-1.5 px-3 w-full text-sm"
                            placeholder="9:00 AM"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-sm text-gray-600 block mb-1">Notes</label>
                        <div className="relative">
                          <AutoResizeTextarea
                            value={patient.notes || ''}
                            onChange={(e) => updatePatientNotes(patient.id, e.target.value)}
                            placeholder="Enter treatment notes here..."
                            className="text-sm"
                          />
                          
                          {/* Suggested Notes - Updated styling */}
                          {visibleSuggestions.includes(patient.id) ? (
                            <div className="mt-2 bg-white border border-gray-200 rounded-md shadow-sm">
                              <div className="p-2 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                                <p className="text-xs text-gray-600 font-medium">SUGGESTED NOTES (click to use):</p>
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleSuggestions(patient.id);
                                  }} 
                                  className="text-xs text-gray-500 hover:text-gray-700"
                                >
                                  HIDE
                                </button>
                              </div>
                              <div className="max-h-32 overflow-y-auto">
                                {suggestedNotes.map((note, index) => (
                                  <div 
                                    key={index}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      selectSuggestedNote(patient.id, note);
                                    }}
                                    className="p-2 text-sm border-b border-gray-100 hover:bg-blue-50 cursor-pointer"
                                  >
                                    {note}
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleSuggestions(patient.id);
                              }}
                              className="mt-1 text-xs text-blue-600 hover:text-blue-800 hover:underline"
                            >
                              Show suggested notes
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 p-4 border-t border-gray-200">
              <button 
                onClick={toggleModal}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md text-sm font-medium"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md text-sm font-medium"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Documentation View Modal (read-only) */}
      {isDocumentationModalOpen && viewingPatient && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="bg-white text-gray-800 py-4 px-6 rounded-t-lg flex justify-between items-center border-b">
              <h2 className="text-xl font-semibold">Documentation (Treatment History)</h2>
              <button 
                onClick={() => toggleDocumentationModal(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body - Scrollable */}
            <div className="p-6 overflow-y-auto flex-grow">
              {/* Patient Info Grid */}
              <div className="grid grid-cols-2 gap-x-12 gap-y-2 mb-6">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Patient Name</div>
                  <div className="font-medium">{viewingPatient.name}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Facility</div>
                  <div className="font-medium">{viewingPatient.facility}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Prescription</div>
                  <div className="font-medium">{viewingPatient.prescription}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Doctor</div>
                  <div className="font-medium">{viewingPatient.doctor}</div>
                </div>
              </div>

              {/* Treatment History Table */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                {/* Table Headers */}
                <div className="grid grid-cols-12 gap-4 py-3 px-4 bg-gray-50 text-sm font-medium text-gray-600">
                  <div className="col-span-1">Treatment #</div>
                  <div className="col-span-3">Treatment Date</div>
                  <div className="col-span-3">Start and End Time</div>
                  <div className="col-span-5">Notes</div>
                </div>

                {/* Table Content */}
                <div className="divide-y divide-gray-200">
                  {viewingPatient.treatmentHistory ? (
                    viewingPatient.treatmentHistory.map((entry, index) => (
                      <div key={index} className="grid grid-cols-12 gap-4 py-3 px-4 text-sm">
                        <div className="col-span-1">{index + 1}</div>
                        <div className="col-span-3">{entry.date}</div>
                        <div className="col-span-3">
                          {entry.startTime} - {entry.endTime}
                        </div>
                        <div className="col-span-5">{entry.notes}</div>
                      </div>
                    ))
                  ) : (
                    <div className="grid grid-cols-12 gap-4 py-3 px-4 text-sm">
                      <div className="col-span-1">1</div>
                      <div className="col-span-3">{viewingPatient.lastTreatment}</div>
                      <div className="col-span-3">
                        {viewingPatient.startTime} - {viewingPatient.endTime}
                      </div>
                      <div className="col-span-5">{viewingPatient.notes}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Pagination */}
              <div className="flex justify-end items-center gap-2 mt-4">
                <button 
                  className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 disabled:text-gray-400"
                  disabled
                >
                  Vorige
                </button>
                <div className="w-8 h-8 flex items-center justify-center text-sm border border-gray-300 rounded">
                  1
                </div>
                <button 
                  className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 disabled:text-gray-400"
                  disabled
                >
                  Nächste
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </WireframeLayout>
  );
} 