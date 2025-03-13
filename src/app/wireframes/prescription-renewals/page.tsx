'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import WireframeLayout from '@/components/WireframeLayout';
import WireframeButton from '@/components/WireframeButton';

// Define the Patient type
type Patient = {
  id: number;
  name: string;
  facility: string;
  doctor: string;
  days: string;
  treatments: string;
  organizer: string;
  currentPrescription: string;
  status: string;
  treatmentType: string;
  renewalStatus: string;
  needsRenewal: boolean;
  pending?: boolean;
  notes?: string;
  urgent?: boolean;
  requestDate?: string;
};

export default function PrescriptionRenewalsWireframe() {
  // State for interactivity
  const [notificationExpanded, setNotificationExpanded] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [noteText, setNoteText] = useState("Patient shows good progress with current treatment.\nRecommend continuing with same intensity.");
  const [isUrgent, setIsUrgent] = useState(false);
  const [showToast, setShowToast] = useState(false);
  
  const [patientData, setPatientData] = useState<Patient[]>([
    { 
      id: 1, 
      name: 'Schmidt, Maria', 
      facility: 'Sunshine Senior Home', 
      doctor: 'Dr. Hoffmann',
      days: '[#]', 
      treatments: '[1/2/3]', 
      organizer: 'Planned', 
      currentPrescription: '12345', 
      status: '[8/10]', 
      treatmentType: 'Physiotherapy',
      renewalStatus: 'Not requested', 
      needsRenewal: true 
    },
    { 
      id: 2, 
      name: 'Müller, Hans', 
      facility: 'Sunshine Senior Home', 
      doctor: 'Dr. Schneider',
      days: '[#]', 
      treatments: '[1/2/3]', 
      organizer: 'Therapy in prog.', 
      currentPrescription: '12346', 
      status: '[7/10]', 
      treatmentType: 'Physiotherapy',
      renewalStatus: 'Not requested', 
      needsRenewal: true 
    },
    { 
      id: 3, 
      name: 'Weber, Klaus', 
      facility: 'Park House', 
      doctor: 'Dr. Bauer',
      days: '[#]', 
      treatments: '[1/2/3]', 
      organizer: 'Planned', 
      currentPrescription: '12347', 
      status: '[9/10]', 
      treatmentType: 'Occupational Therapy',
      renewalStatus: 'Not requested', 
      needsRenewal: true 
    },
    { 
      id: 4, 
      name: 'Becker, Anna', 
      facility: 'Park House', 
      doctor: 'Dr. Bauer',
      days: '[#]', 
      treatments: '[1/2/3]', 
      organizer: 'Planned', 
      currentPrescription: '12348', 
      status: '[8/10]', 
      treatmentType: 'Speech Therapy',
      renewalStatus: 'Not requested', 
      needsRenewal: true 
    },
    { 
      id: 5, 
      name: 'Fischer, Thomas', 
      facility: 'Lakeside Care', 
      doctor: 'Dr. Hoffmann',
      days: '[#]', 
      treatments: '[1/2/3]', 
      organizer: 'Therapy in prog.', 
      currentPrescription: '12349', 
      status: '[6/10]', 
      treatmentType: 'Physiotherapy',
      renewalStatus: 'Not requested', 
      needsRenewal: false 
    },
    { 
      id: 6, 
      name: 'Wagner, Elisabeth', 
      facility: 'Lakeside Care', 
      doctor: 'Dr. Schneider',
      days: '[#]', 
      treatments: '[1/2/3]', 
      organizer: 'Planned', 
      currentPrescription: '12350', 
      status: '[8/10]', 
      treatmentType: 'Occupational Therapy',
      renewalStatus: 'Renewal Requested', 
      needsRenewal: true, 
      pending: true,
      notes: "Patient is responding well to therapy. Continue with current plan.",
      urgent: true,
      requestDate: "01.06.2025"
    },
    { 
      id: 7, 
      name: 'Hoffmann, Peter', 
      facility: 'Riverside Clinic', 
      doctor: 'Dr. Müller',
      days: '[#]', 
      treatments: '[1/2/3]', 
      organizer: 'Planned', 
      currentPrescription: '12351', 
      status: '[7/10]', 
      treatmentType: 'Physiotherapy',
      renewalStatus: 'Not requested', 
      needsRenewal: true 
    },
  ]);

  // Auto-hide toast after 3 seconds
  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        setShowToast(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  // Only patients needing renewal
  const patientsNeedingRenewal = patientData.filter(patient => patient.needsRenewal);

  // Filtered patients based on active filter
  const filteredPatients = patientData.filter(patient => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'needsRenewal') return patient.needsRenewal;
    if (activeFilter === 'pending') return patient.pending;
    return true;
  });

  // Get current date in DD.MM.YYYY format
  const getCurrentDate = () => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    return `${day}.${month}.${year}`;
  };

  // Function to toggle notification panel
  const toggleNotification = () => {
    setNotificationExpanded(!notificationExpanded);
  };

  // Function to handle filter change
  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
  };

  // Function to handle opening the renewal request modal
  const openRenewalModal = (patientId: number, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent closing the panel
    const patient = patientData.find(p => p.id === patientId);
    if (patient) {
      setSelectedPatient(patient);
      setIsModalOpen(true);
    }
  };

  // Function to handle opening the view request modal
  const openViewModal = (patientId: number, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event bubbling
    const patient = patientData.find(p => p.id === patientId);
    if (patient) {
      setSelectedPatient(patient);
      setIsViewModalOpen(true);
    }
  };

  // Function to close the modals
  const closeModal = () => {
    setIsModalOpen(false);
    setIsViewModalOpen(false);
    setSelectedPatient(null);
    setIsUrgent(false);
  };

  // Function to handle submitting the renewal request
  const submitRenewalRequest = () => {
    if (!selectedPatient) return;
    
    // Get current date
    const currentDate = getCurrentDate();
    
    // Update the patient's status to 'Renewal Requested'
    const updatedPatientData = patientData.map(patient => 
      patient.id === selectedPatient.id 
        ? { 
            ...patient, 
            renewalStatus: 'Renewal Requested', 
            pending: true,
            notes: noteText,
            urgent: isUrgent,
            requestDate: currentDate
          }
        : patient
    );
    
    setPatientData(updatedPatientData);
    closeModal();
    
    // Show success toast
    setShowToast(true);
  };

  return (
    <WireframeLayout title="Therapios" username="User Therapist" userInitials="UT">
      <div className="max-w-full mx-auto wireframe-container">
        {/* Header Section */}
        <div className="border-b-2 border-gray-800 p-4 flex justify-between">
          <div className="font-bold text-black">Therapios</div>
          <div className="font-bold text-black">User Therapist</div>
        </div>

        {/* Greeting */}
        <div className="border-b-2 border-gray-800 p-4">
          <p className="text-black">Hello [NAME], I hope you're having a wonderful day.</p>
        </div>

        {/* Dashboard Title */}
        <div className="border-b-2 border-gray-800 p-4 flex justify-between items-center">
          <h1 className="font-bold text-black">Dashboard</h1>
          <div className="text-black">Time period: 01.01-01.07.2025</div>
        </div>

        {/* Success Toast */}
        {showToast && (
          <div className="fixed top-4 right-4 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded shadow-md z-50 animate-fade-in">
            <div className="flex items-center">
              <div className="py-1 mr-2">✓</div>
              <div>
                <p className="font-bold">Success!</p>
                <p>Prescription renewal request has been submitted.</p>
              </div>
            </div>
          </div>
        )}

        {/* Notifications Panel */}
        <div className="border-b-2 border-gray-800 p-4">
          <div 
            className="border-2 border-gray-800 rounded wireframe-notification"
            onClick={toggleNotification}
          >
            <div className="flex justify-between items-center p-4">
              <div className="flex items-center">
                <span className="inline-flex items-center justify-center mr-2">
                  ⚠️
                </span>
                <span className="font-bold text-black">7 patients need new prescriptions</span>
              </div>
              <div>{notificationExpanded ? '▼' : '▶'}</div>
            </div>
            
            {notificationExpanded && (
              <div className="px-4 pb-4 expandable">
                <div className="border-t-2 border-gray-800 pt-4">
                  <table className="notification-panel-list">
                    <thead>
                      <tr>
                        <th className="text-black">Patient</th>
                        <th className="text-black">Status VO</th>
                        <th className="text-black">Facility</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {patientsNeedingRenewal.slice(0, 4).map((patient) => (
                        <tr key={patient.id} className="interactive-item">
                          <td className="text-black font-mono">{patient.name}</td>
                          <td className="text-black font-mono">{patient.status}</td>
                          <td className="text-black font-mono">{patient.facility}</td>
                          <td className="text-right">
                            {patient.pending ? (
                              <span 
                                className="font-mono text-blue-600 cursor-pointer"
                                onClick={(e) => openViewModal(patient.id, e)}
                              >
                                View
                              </span>
                            ) : (
                              <button 
                                className="request-button font-mono text-black"
                                onClick={(e) => openRenewalModal(patient.id, e)}
                              >
                                Request▶
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                      {patientsNeedingRenewal.length > 4 && (
                        <tr>
                          <td colSpan={4} className="py-2 text-center font-mono text-black">...</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Filter Options */}
        <div className="border-b-2 border-gray-800 p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <span className="mr-2 text-black">Display</span>
                <span>▼</span>
              </div>
              <div className="flex space-x-2">
                <span 
                  className={`px-3 py-1 border-2 rounded text-black filter-button ${activeFilter === 'all' ? 'active border-blue-500 bg-blue-50' : 'border-gray-300'}`}
                  onClick={() => handleFilterChange('all')}
                >
                  [All]
                </span>
                <span 
                  className={`px-3 py-1 border-2 rounded text-black filter-button ${activeFilter === 'needsRenewal' ? 'active border-blue-500 bg-blue-50' : 'border-gray-300'}`}
                  onClick={() => handleFilterChange('needsRenewal')}
                >
                  [Needs Renewal ⚠️]
                </span>
                <span 
                  className={`px-3 py-1 border-2 rounded text-black filter-button ${activeFilter === 'pending' ? 'active border-blue-500 bg-blue-50' : 'border-gray-300'}`}
                  onClick={() => handleFilterChange('pending')}
                >
                  [Pending Requests 🕒]
                </span>
              </div>
            </div>
            <div>
              <span className="text-black text-xl">🔍</span>
            </div>
          </div>
        </div>

        {/* Patients Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-800">
                <th className="text-left p-3 border-r-2 border-gray-800 text-black">Patient<br/>Name</th>
                <th className="text-left p-3 border-r-2 border-gray-800 text-black">Facility</th>
                <th className="text-left p-3 border-r-2 border-gray-800 text-black">Days<br/>s.l.</th>
                <th className="text-left p-3 border-r-2 border-gray-800 text-black">#Trt</th>
                <th className="text-left p-3 border-r-2 border-gray-800 text-black">Organizer</th>
                <th className="text-left p-3 border-r-2 border-gray-800 text-black">Current<br/>Presc.(#)</th>
                <th className="text-left p-3 border-r-2 border-gray-800 text-black">Status VO<br/>(#/#)</th>
                <th className="text-left p-3 text-black">Renewal<br/>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.map((patient, index) => (
                <tr key={patient.id} className="border-b-2 border-gray-800 interactive-item">
                  <td className="p-3 border-r-2 border-gray-800 text-black">{patient.name}</td>
                  <td className="p-3 border-r-2 border-gray-800 text-black">{patient.facility}</td>
                  <td className="p-3 border-r-2 border-gray-800 text-black">{patient.days}</td>
                  <td className="p-3 border-r-2 border-gray-800 text-black">{patient.treatments}</td>
                  <td className="p-3 border-r-2 border-gray-800 text-black">
                    {patient.organizer}
                  </td>
                  <td className="p-3 border-r-2 border-gray-800 text-black">{patient.currentPrescription}</td>
                  <td className="p-3 border-r-2 border-gray-800 text-black">
                    <div className="flex items-center">
                      {patient.status}
                      {patient.needsRenewal && (
                        <span className="ml-1">▶</span>
                      )}
                    </div>
                  </td>
                  <td className="p-3 text-black">
                    {patient.renewalStatus}
                    {patient.pending && (
                      <span 
                        className="ml-1 text-blue-600 cursor-pointer" 
                        onClick={(e) => openViewModal(patient.id, e)}
                      >
                        (View)
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 p-4">
          <Link href="/wireframes" className="text-blue-600 hover:underline font-medium">
            Back to Wireframes
          </Link>
        </div>

        {/* Prescription Renewal Modal */}
        {isModalOpen && selectedPatient && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="wireframe-container bg-white p-0 max-w-2xl w-full font-mono">
              {/* Modal Header */}
              <div className="border-b-2 border-gray-800 p-4 text-center">
                <h2 className="text-xl font-bold text-black">Renew Prescription - {selectedPatient.name}</h2>
              </div>
              
              {/* Modal Content */}
              <div className="p-4">
                {/* Patient Information */}
                <div className="mb-6">
                  <h3 className="font-bold text-black mb-2">Patient Information:</h3>
                  <p className="text-black">Name: {selectedPatient.name}</p>
                  <p className="text-black">Facility: {selectedPatient.facility}</p>
                  <p className="text-black">Doctor: {selectedPatient.doctor}</p>
                </div>
                
                {/* Current Treatment */}
                <div className="mb-6">
                  <h3 className="font-bold text-black mb-2">Current Treatment:</h3>
                  <p className="text-black">Current Prescription (#): {selectedPatient.currentPrescription}</p>
                  <p className="text-black">Status: {selectedPatient.status} treatments completed</p>
                  <p className="text-black">Treatment Type: {selectedPatient.treatmentType}</p>
                </div>
                
                {/* Notes Section */}
                <div className="mb-6">
                  <h3 className="font-bold text-black mb-2">Notes for Administration (optional):</h3>
                  <div className="border-2 border-gray-800 p-4">
                    <textarea 
                      className="w-full bg-transparent text-black font-mono resize-none outline-none"
                      rows={3}
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                    ></textarea>
                  </div>
                </div>
                
                {/* Urgent Checkbox */}
                <div className="mb-8">
                  <label className="flex items-center text-black cursor-pointer">
                    <span 
                      className="border-2 border-gray-800 w-6 h-6 flex items-center justify-center mr-2 text-black"
                      onClick={() => setIsUrgent(!isUrgent)}
                    >
                      {isUrgent ? "✓" : " "}
                    </span>
                    <span onClick={() => setIsUrgent(!isUrgent)}>Mark as urgent</span>
                  </label>
                </div>
                
                {/* Action Buttons */}
                <div className="flex justify-between">
                  <button 
                    className="border-2 border-gray-800 px-6 py-2 text-black font-bold interactive-item"
                    onClick={closeModal}
                  >
                    [Cancel]
                  </button>
                  <button 
                    className="border-2 border-gray-800 px-6 py-2 text-black font-bold interactive-item bg-gray-100"
                    onClick={submitRenewalRequest}
                  >
                    [Submit Request]
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* View Prescription Request Modal */}
        {isViewModalOpen && selectedPatient && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="wireframe-container bg-white p-0 max-w-2xl w-full font-mono">
              {/* Modal Header */}
              <div className="border-b-2 border-gray-800 p-4 text-center">
                <h2 className="text-xl font-bold text-black">Prescription Request - {selectedPatient.name}</h2>
              </div>
              
              {/* Modal Content */}
              <div className="p-4">
                {/* Request Status */}
                <div className="mb-6 border-2 border-gray-200 p-3 bg-blue-50">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-black">Status: {selectedPatient.renewalStatus}</span>
                    <span className="text-sm text-gray-600">Submitted on: {selectedPatient.requestDate || getCurrentDate()}</span>
                  </div>
                  {selectedPatient.urgent && (
                    <div className="mt-2 text-red-600 font-bold flex items-center">
                      <span className="mr-1">⚠️</span> Marked as urgent
                    </div>
                  )}
                </div>
                
                {/* Patient Information */}
                <div className="mb-6">
                  <h3 className="font-bold text-black mb-2">Patient Information:</h3>
                  <p className="text-black">Name: {selectedPatient.name}</p>
                  <p className="text-black">Facility: {selectedPatient.facility}</p>
                  <p className="text-black">Doctor: {selectedPatient.doctor}</p>
                </div>
                
                {/* Current Treatment */}
                <div className="mb-6">
                  <h3 className="font-bold text-black mb-2">Current Treatment:</h3>
                  <p className="text-black">Current Prescription (#): {selectedPatient.currentPrescription}</p>
                  <p className="text-black">Status: {selectedPatient.status} treatments completed</p>
                  <p className="text-black">Treatment Type: {selectedPatient.treatmentType}</p>
                </div>
                
                {/* Notes Section */}
                <div className="mb-6">
                  <h3 className="font-bold text-black mb-2">Notes for Administration:</h3>
                  <div className="border-2 border-gray-800 p-4 bg-gray-50">
                    <p className="whitespace-pre-wrap text-black font-mono">
                      {selectedPatient.notes || "No notes provided."}
                    </p>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex justify-end">
                  <button 
                    className="border-2 border-gray-800 px-6 py-2 text-black font-bold interactive-item"
                    onClick={closeModal}
                  >
                    [Close]
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </WireframeLayout>
  );
} 