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
  treated?: boolean;
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
  const [isSuggestionsModalOpen, setIsSuggestionsModalOpen] = useState(false);
  const [currentPatientId, setCurrentPatientId] = useState<number | null>(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  
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
      selected: true,
      session: '4/10',
      notes: 'Standard Physiotherapy session completed.'
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
      doctor: 'Niedeggen'
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
      selected: true,
      session: '7/10',
      notes: 'Occupational therapy focus on hand exercises.'
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
      doctor: 'Niedeggen'
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
      doctor: 'Niedeggen'
    }
  ]);

  // Generate start times for all patients in the modal
  const generateStartTimes = (patientsList: Patient[]) => {
    // Start at 8:00 AM
    const baseHour = 8;
    const baseMinute = 0;
    
    return patientsList.map((patient, index) => {
      // Calculate time increments (20 minutes per patient)
      const additionalMinutes = index * 20;
      const totalMinutes = baseMinute + additionalMinutes;
      
      // Calculate hours and minutes
      const hours = baseHour + Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      
      // Format the time as HH:MM AM
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const formattedHours = hours % 12 || 12; // Convert 0 to 12 for 12 AM
      const formattedMinutes = minutes.toString().padStart(2, '0');
      const startTime = `${formattedHours}:${formattedMinutes} ${ampm}`;
      
      // Ensure each patient has notes (use existing or add a new random one)
      const notes = patient.notes || getRandomNote();
      
      return { ...patient, startTime, notes };
    });
  };

  // Function to update modal patients when the modal opens
  useEffect(() => {
    if (isModalOpen) {
      const selected = patients.filter(patient => patient.selected);
      setModalPatients(generateStartTimes(selected));
    }
  }, [isModalOpen, patients]);

  // Function to handle start time changes
  const handleStartTimeChange = (id: number, startTime: string) => {
    setModalPatients(modalPatients.map(patient => 
      patient.id === id ? { ...patient, startTime } : patient
    ));
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

  // Function to update patient notes
  const updatePatientNotes = (id: number, notes: string) => {
    setModalPatients(modalPatients.map(patient => 
      patient.id === id ? { ...patient, notes } : patient
    ));
  };

  // Function to open the suggestions modal
  const openSuggestionsModal = (patientId: number) => {
    setCurrentPatientId(patientId);
    setIsSuggestionsModalOpen(true);
  };

  // Function to select a suggested note
  const selectSuggestedNote = (note: string) => {
    if (currentPatientId !== null) {
      updatePatientNotes(currentPatientId, note);
    }
    setIsSuggestionsModalOpen(false);
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
    // Update the main patients list with notes from the modal
    const updatedPatients = patients.map(patient => {
      const modalPatient = modalPatients.find(mp => mp.id === patient.id);
      if (modalPatient) {
        // Convert treatment date from DD.MM.YYYY to MM/DD/YYYY format for consistency
        const [day, month, year] = treatmentDate.split('.');
        const formattedDate = `${month}/${day}/${year}`;
        
        // Mark the patient as treated and update other fields
        return { 
          ...patient, 
          notes: modalPatient.notes, 
          startTime: modalPatient.startTime,
          organizer: 'Treated', // Set organizer to "Treated"
          treated: true, // Flag to highlight the row
          lastTreatment: formattedDate // Update last treatment date
        };
      }
      return patient;
    });
    
    setPatients(updatedPatients);
    console.log('Saving treatment documentation');
    toggleModal();
  };

  // Drag & Drop Functions
  const handleDragStart = (patientId: number) => {
    setDraggedPatientId(patientId);
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
      setModalPatients(patientsWithNewTimes);
    }

    setDraggedPatientId(null);
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
          <div className="grid grid-cols-8 gap-4 py-3 px-4 bg-gray-100 text-gray-700 font-medium text-sm">
            <div className="col-span-1"></div>
            <div className="col-span-1">Name Patient</div>
            <div className="col-span-1">Facility</div>
            <div className="col-span-1">Last Treatment (Date)</div>
            <div className="col-span-1">Frequency WTD</div>
            <div className="col-span-1">Organizer</div>
            <div className="col-span-1">Prescription (Current)</div>
            <div className="col-span-1">Doctor</div>
          </div>

          {/* Table Rows */}
          {patients.map((patient) => (
            <div 
              key={patient.id} 
              className={`grid grid-cols-8 gap-4 py-3 px-4 border-t border-gray-200 items-center ${
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
              <div className="col-span-1">{patient.doctor}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Treatment Documentation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 overflow-hidden">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="bg-[#2c5282] text-white py-4 px-6 rounded-t-lg flex justify-between items-center">
              <h2 className="text-xl font-semibold">Mark Selected Patients as Treated ({selectedCount})</h2>
              <button 
                onClick={toggleModal}
                className="text-white hover:text-gray-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body - Scrollable */}
            <div className="p-6 overflow-y-auto flex-grow">
              {/* Treatment Date with Calendar Icon */}
              <div className="mb-6 flex items-center">
                <label className="text-gray-700 text-lg font-medium mr-3">Treatment Date:</label>
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

              {/* Patient Cards - Now with drag and drop */}
              {modalPatients.map((patient) => (
                <div 
                  key={patient.id} 
                  draggable
                  onDragStart={() => handleDragStart(patient.id)}
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop(patient.id)}
                  className={`mb-4 bg-gray-50 border border-gray-200 rounded-md p-4 ${
                    draggedPatientId === patient.id ? 'opacity-50' : ''
                  } cursor-move`}
                >
                  <div className="flex justify-between mb-1">
                    <div className="flex items-center">
                      <div className="mr-2">
                        <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">{patient.name}</h3>
                        <span className="text-sm text-gray-600">Prescription: {patient.prescription}</span>
                      </div>
                    </div>
                    <span className="text-gray-600">Treatment: {patient.session || '1/10'}</span>
                  </div>
                  
                  <div className="flex items-center mb-3">
                    <label className="text-gray-700 font-medium mr-2">Start Time:</label>
                    <input 
                      type="text"
                      value={patient.startTime || ''}
                      onChange={(e) => handleStartTimeChange(patient.id, e.target.value)}
                      className="border border-gray-300 rounded-md py-1 px-3 w-28"
                    />
                  </div>
                  
                  <div className="flex items-start">
                    <label className="text-gray-700 font-medium mr-2 mt-2">Notes:</label>
                    <div className="flex-grow relative">
                      <AutoResizeTextarea
                        value={patient.notes || ''}
                        onChange={(e) => updatePatientNotes(patient.id, e.target.value)}
                        placeholder="Enter treatment notes here..."
                        className="pr-10"
                      />
                      <button 
                        onClick={() => openSuggestionsModal(patient.id)}
                        className="absolute right-2 top-2 text-gray-500 hover:text-gray-700 bg-transparent p-1 rounded"
                        title="Suggest notes"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Modal Footer - Fixed at bottom */}
            <div className="flex justify-end gap-3 p-4 border-t border-gray-200 bg-white rounded-b-lg">
              <button 
                onClick={toggleModal}
                className="bg-gray-400 hover:bg-gray-500 text-white py-2 px-6 rounded-md"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                className="bg-[#2c5282] hover:bg-[#3a6eaa] text-white py-2 px-6 rounded-md"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Suggested Notes Modal */}
      {isSuggestionsModalOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-[60]">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4">
            <div className="bg-[#2c5282] text-white py-3 px-4 rounded-t-lg flex justify-between items-center">
              <h3 className="text-lg font-semibold">Suggested Notes</h3>
              <button 
                onClick={() => setIsSuggestionsModalOpen(false)}
                className="text-white hover:text-gray-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4">
              <p className="text-sm text-gray-600 mb-3">Select a suggested note from the options below:</p>
              
              <div className="space-y-3">
                {suggestedNotes.map((note, index) => (
                  <div 
                    key={index}
                    onClick={() => selectSuggestedNote(note)}
                    className="p-3 border border-gray-200 rounded-md hover:bg-blue-50 cursor-pointer transition duration-150"
                  >
                    <p>{note}</p>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 flex justify-end">
                <button 
                  onClick={() => setIsSuggestionsModalOpen(false)}
                  className="bg-gray-400 hover:bg-gray-500 text-white py-1.5 px-4 rounded-md text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </WireframeLayout>
  );
} 