'use client';

import { useState, useEffect } from 'react';
import WireframeLayout from '@/components/WireframeLayout';

// Type definitions
type VOTransferPatient = {
  id: number;
  name: string;
  geburtsdatum: string;
  heilmittel: string;
  einrichtung: string;
  therapeut: string;
  originalTherapist?: string; // For tracking permanent transfers
  voNr: string;
  ausstDatum: string;
  behStatus: string;
  arzt: string;
  fvoStatus: string;
  transferStatus: 'Temporary' | 'Permanent (Pending)' | 'Permanent (Confirmed)' | '';
  selected?: boolean;
};

// Load transfer data from localStorage
const loadTransferData = (): VOTransferPatient[] => {
  if (typeof window === 'undefined') return [];
  
  try {
    const saved = localStorage.getItem('voTransfers');
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error('Error loading transfer data:', error);
    return [];
  }
};

export default function AdminVOTransfersWireframe() {
  const [patients, setPatients] = useState<VOTransferPatient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAll, setSelectedAll] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Load data from localStorage on component mount
  useEffect(() => {
    const loadedData = loadTransferData();
    console.log('=== Admin Dashboard Load Debug ===');
    console.log('Loaded transfer data from localStorage:', loadedData);
    console.log('=== End Debug ===');
    setPatients(loadedData);
  }, []);

  // Clear localStorage function for debugging
  const clearTransferData = () => {
    localStorage.removeItem('voTransfers');
    setPatients([]);
    console.log('Transfer data cleared from localStorage');
  };

  // Add window focus listener to reload data when user returns to the page
  useEffect(() => {
    const handleFocus = () => {
      const reloadedData = loadTransferData();
      console.log('=== Admin Dashboard Reload on Focus ===');
      console.log('Reloaded transfer data:', reloadedData);
      console.log('=== End Reload Debug ===');
      setPatients(reloadedData);
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);
  
  // Transfer status filters
  const [showPermanentConfirmed, setShowPermanentConfirmed] = useState(false);
  
  // Confirmation modal states
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [selectedForConfirmation, setSelectedForConfirmation] = useState<VOTransferPatient[]>([]);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessageText, setSuccessMessageText] = useState('');

  // Calculate transfer count based on current filters
  function getTransferCount() {
    return patients.filter(p => {
      // Always show Permanent (Pending)
      if (p.transferStatus === 'Permanent (Pending)') return true;
      // Show Permanent (Confirmed) only if checkbox is checked
      if (showPermanentConfirmed && p.transferStatus === 'Permanent (Confirmed)') return true;
      return false;
    }).length;
  }

  // Tab data with counts - modified for admin dashboard with VO Transfers as default
  const tabs = [
    { name: 'F.-VO Bestellen', count: 0, active: false },
    { name: 'F.-VO Bestellt', count: 0, active: false },
    { name: 'F.-VO Erhalten', count: 0, active: false },
    { name: 'Keine Folge-VO', count: 0, active: false },
    { name: 'Fertig Behandelt', count: 0, active: false },
    { name: 'Arztbericht zu versenden', count: 0, active: false },
    { name: 'Patient Transfers', count: getTransferCount(), active: true }, // New default active tab
    { name: 'All VOs', count: 0, active: false }
  ];

  // Filter patients based on transfer status checkboxes
  const filteredPatients = patients.filter(p => {
    // First apply search filter
    if (searchTerm && !p.name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    // Then apply transfer status filters
    // Always show Permanent (Pending)
    if (p.transferStatus === 'Permanent (Pending)') return true;
    // Show Permanent (Confirmed) only if checkbox is checked
    if (showPermanentConfirmed && p.transferStatus === 'Permanent (Confirmed)') return true;
    return false;
  });

  // Toggle individual patient selection
  const togglePatientSelection = (id: number) => {
    setPatients(prev => prev.map(patient => 
      patient.id === id ? { ...patient, selected: !patient.selected } : patient
    ));
  };

  // Toggle select all
  const toggleSelectAll = () => {
    const newSelectedState = !selectedAll;
    setSelectedAll(newSelectedState);
    setPatients(prev => prev.map(patient => 
      filteredPatients.some(fp => fp.id === patient.id)
        ? { ...patient, selected: newSelectedState }
        : patient
    ));
  };

  // Get selected count (only from filtered patients that are Permanent (Pending))
  const selectedPendingCount = filteredPatients.filter(p => 
    p.selected && p.transferStatus === 'Permanent (Pending)'
  ).length;

  // Handle confirming permanent transfers
  const handleConfirmPermanentTransfers = () => {
    const selectedPending = filteredPatients.filter(p => 
      p.selected && p.transferStatus === 'Permanent (Pending)'
    );
    
    if (selectedPending.length === 0) return;
    
    setSelectedForConfirmation(selectedPending);
    setShowConfirmationModal(true);
  };

  // Confirm the permanent transfer action
  const confirmTransferAction = () => {
    // Update the selected patients' status to Permanent (Confirmed)
    const updatedPatients = patients.map(patient => {
      const isSelected = selectedForConfirmation.some(sp => sp.id === patient.id);
      if (isSelected) {
        return {
          ...patient,
          transferStatus: 'Permanent (Confirmed)' as const,
          selected: false
        };
      }
      return patient;
    });

    setPatients(updatedPatients);
    
    // Save updated data to localStorage
    try {
      localStorage.setItem('voTransfers', JSON.stringify(updatedPatients));
    } catch (error) {
      console.error('Error saving transfer data:', error);
    }

    // Reset selections
    setSelectedAll(false);
    
    // Show success message
    const count = selectedForConfirmation.length;
    setSuccessMessageText(`${count} permanent transfer${count > 1 ? 's' : ''} confirmed successfully`);
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 3000);
    
    // Close modal and reset
    setShowConfirmationModal(false);
    setSelectedForConfirmation([]);
  };

  const cancelConfirmation = () => {
    setShowConfirmationModal(false);
    setSelectedForConfirmation([]);
  };

  return (
    <WireframeLayout title="Admin Dashboard - VO Transfers" username="Super Admin" userInitials="SA" showSidebar={false}>
      <div className="bg-white min-h-screen">
        {/* Header with filters */}
        <div className="border-b border-gray-200 pb-4 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-600 text-sm mb-2">Hello Super Admin, manage VO transfers efficiently.</p>
              <h1 className="text-2xl font-semibold text-gray-900">Admin Dashboard - VO Transfers</h1>
            </div>
            <div className="flex gap-4">
              {/* VO Status dropdown */}
              <div className="min-w-[200px]">
                <select className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white text-sm">
                  <option>VO Status</option>
                </select>
              </div>
              {/* ECH dropdown */}
              <div className="min-w-[120px]">
                <select className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white text-sm">
                  <option>ECH</option>
                </select>
              </div>
              {/* Therapist dropdown */}
              <div className="min-w-[200px]">
                <select className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white text-sm">
                  <option>Therapist: (Select)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-6">
          <div className="flex space-x-6">
            {tabs.map((tab, index) => (
              <button
                key={index}
                className={`pb-3 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  tab.active
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.name} <span className="font-bold">{tab.count}</span>
              </button>
            ))}
          </div>
        </div>

        {/* VO Transfers Tab Content */}
        <div className="space-y-6">
          {/* Transfer Status Filters */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="permanent-confirmed"
                checked={showPermanentConfirmed}
                onChange={(e) => setShowPermanentConfirmed(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="permanent-confirmed" className="ml-2 text-sm text-gray-700">
                Show Permanent (Confirmed) Transfers
              </label>
            </div>
          </div>

          {/* Table Controls */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white hover:bg-gray-50">
                Show columns
              </button>
              <div className="text-sm text-gray-600">
                Showing {filteredPatients.length} VO{filteredPatients.length !== 1 ? 's' : ''}
              </div>
            </div>
            <div className="flex items-center gap-4">
              {selectedPendingCount > 0 && (
                <button 
                  onClick={handleConfirmPermanentTransfers}
                  className="px-4 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700"
                >
                  Confirm Permanent Transfer ({selectedPendingCount})
                </button>
              )}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search VOs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm w-64"
                />
                <svg className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Data Table */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left w-12">
                    <input
                      type="checkbox"
                      checked={selectedAll}
                      onChange={toggleSelectAll}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Heilmittel</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Therapeut</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">VO Nr.</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transfer Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Beh. Status (#/#)</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Arzt</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPatients.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                      <div className="flex flex-col items-center">
                        <svg className="w-12 h-12 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-lg font-medium text-gray-900 mb-2">No transfers found</p>
                        <p className="text-sm text-gray-500 mb-4">Transfer patients from the Patient Transfer wireframe to see them here.</p>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => window.open('/wireframes/drafts/patient-transfer', '_blank')}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                          >
                            Go to Patient Transfer
                          </button>
                          <button 
                            onClick={clearTransferData}
                            className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700"
                          >
                            Clear Data
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredPatients.map((patient) => (
                    <tr key={patient.id} className={patient.selected ? 'bg-blue-50' : 'hover:bg-gray-50'}>
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          checked={patient.selected || false}
                          onChange={() => togglePatientSelection(patient.id)}
                          disabled={patient.transferStatus !== 'Permanent (Pending)'}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                        />
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900 font-medium">{patient.name}</td>
                      <td className="px-4 py-4 text-sm text-gray-900">{patient.heilmittel}</td>
                      <td className="px-4 py-4 text-sm text-gray-900">{patient.therapeut}</td>
                      <td className="px-4 py-4 text-sm text-gray-900">{patient.voNr}</td>
                      <td className="px-4 py-4 text-sm">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          patient.transferStatus === 'Temporary' 
                            ? 'bg-orange-100 text-orange-800'
                            : patient.transferStatus === 'Permanent (Pending)'
                            ? 'bg-yellow-100 text-yellow-800'
                            : patient.transferStatus === 'Permanent (Confirmed)'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {patient.transferStatus}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900">{patient.behStatus}</td>
                      <td className="px-4 py-4 text-sm text-gray-900">{patient.arzt}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
            <div className="flex flex-1 justify-between sm:hidden">
              <button className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                Previous
              </button>
              <button className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                Next
              </button>
            </div>
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-700">Rows per page</span>
                <select 
                  value={rowsPerPage}
                  onChange={(e) => setRowsPerPage(Number(e.target.value))}
                  className="border border-gray-300 rounded-md px-2 py-1 text-sm"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-700">1-{Math.min(rowsPerPage, filteredPatients.length)} of {filteredPatients.length}</span>
                <div className="flex gap-1">
                  <button className="p-1 rounded border border-gray-300 hover:bg-gray-50">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button className="p-1 rounded border border-gray-300 hover:bg-gray-50">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l7-7-7-7" />
                    </svg>
                  </button>
                  <button className="p-1 rounded border border-gray-300 hover:bg-gray-50">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                  <button className="p-1 rounded border border-gray-300 hover:bg-gray-50">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {showSuccessMessage && (
          <div className="fixed top-6 right-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded shadow-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              {successMessageText}
            </div>
          </div>
        )}

        {/* Confirmation Modal */}
        {showConfirmationModal && (
          <div className="fixed inset-0 backdrop-blur-md bg-white/10 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Confirm Permanent Transfers
              </h3>
              <div className="mb-6">
                <p className="text-sm text-gray-700 mb-4">
                  You are about to confirm {selectedForConfirmation.length} permanent transfer{selectedForConfirmation.length > 1 ? 's' : ''}:
                </p>
                <div className="max-h-48 overflow-y-auto border border-gray-200 rounded">
                  {selectedForConfirmation.map((patient) => (
                    <div key={patient.id} className="p-3 border-b border-gray-100 last:border-b-0">
                      <div className="font-medium text-gray-900">{patient.name}</div>
                      <div className="text-sm text-gray-600">
                        VO: {patient.voNr} | {patient.originalTherapist} → {patient.therapeut}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={cancelConfirmation}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmTransferAction}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700"
                >
                  Confirm Permanent Transfer{selectedForConfirmation.length > 1 ? 's' : ''}
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Back to Patient Transfer Button - Fixed position at bottom right */}
        <div className="fixed bottom-6 right-6 z-40">
          <button 
            onClick={() => window.open('/wireframes/drafts/patient-transfer', '_blank')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-lg"
          >
            Back to Patient Transfer
          </button>
        </div>
      </div>
    </WireframeLayout>
  );
} 