'use client';

import React, { useState } from 'react';
import WireframeLayout from '@/components/WireframeLayout';

// Patient data type matching the screenshot
type ArztberichtPatient = {
  id: number;
  name: string;
  geburtsdatum: string;
  heilmittel: string;
  einrichtung: string;
  therapeut: string;
  voNr: string;
  ausstDatum: string;
  behStatus: string;
  arzt: string;
  fvoStatus: string;
  therapiebericht: 'Created' | 'Sent';
  selected?: boolean;
};

// Therapy report form data type (for PDF generation)
type TherapyReportForm = {
  therapyType: "Physiotherapie" | "Ergotherapie" | "Logopädie";
  startDate: Date;
  endDate: Date;
  currentFindings: string;
  specialFeatures: string;
  treatmentAccordingToPrescription: boolean;
  changeTherapyFrequency: boolean;
  changeIndividualTherapy: boolean;
  changeGroupTherapy: boolean;
  continuationOfTherapyRecommended: boolean;
};

// Mock data based on the screenshot
const mockPatients: ArztberichtPatient[] = [
  {
    id: 1,
    name: 'Heidemarie Aagaard-Konopatzki',
    geburtsdatum: '11.5.1943',
    heilmittel: 'KG-H',
    einrichtung: 'Caritas Hospitz Katarinhaus berlin Reinickendorf',
    therapeut: 'M. Frieß-Weisbacher',
    voNr: '[3139-1]',
    ausstDatum: '20.01.2025',
    behStatus: '6 / 12',
    arzt: 'P. Laudahn',
    fvoStatus: '-',
    therapiebericht: 'Created'
  },
  {
    id: 2,
    name: 'Franz Abitz',
    geburtsdatum: '20.1.1952',
    heilmittel: 'BO-E-H',
    einrichtung: 'FSE Pflegeeinrichtung Treptow / Johannisthal',
    therapeut: 'S. Zelbig',
    voNr: '[2155-6]',
    ausstDatum: '16.01.2025',
    behStatus: '10 / 20',
    arzt: 'M. von Brevern',
    fvoStatus: 'Erhalten',
    therapiebericht: 'Created'
  },
  {
    id: 3,
    name: 'Franz Abitz',
    geburtsdatum: '20.1.1952',
    heilmittel: 'BO-E-H',
    einrichtung: 'FSE Pflegeeinrichtung Treptow / Johannisthal',
    therapeut: 'S. Zelbig',
    voNr: '[2155-7]',
    ausstDatum: '22.04.2025',
    behStatus: '10 / 20',
    arzt: 'M. von Brevern',
    fvoStatus: 'Keine Folg',
    therapiebericht: 'Sent'
  },
  {
    id: 4,
    name: 'Gundula Achter',
    geburtsdatum: '19.5.1959',
    heilmittel: 'KG-H',
    einrichtung: 'Vivantes HSP Haus Ernst Hoppe',
    therapeut: 'A. Rosky',
    voNr: '[2322-4]',
    ausstDatum: '05.02.2025',
    behStatus: '0 / 10',
    arzt: 'U. Vivantes Spandau',
    fvoStatus: '-',
    therapiebericht: 'Created'
  },
  {
    id: 5,
    name: 'Ingeborg Achterberg',
    geburtsdatum: '22.11.1940',
    heilmittel: 'NOB-E-HB',
    einrichtung: 'E71 - No name',
    therapeut: 'P. Sandra',
    voNr: '[3464-1]',
    ausstDatum: '19.02.2025',
    behStatus: '10 / 10',
    arzt: 'J. Sloboda',
    fvoStatus: 'Erhalten',
    therapiebericht: 'Created'
  },
  {
    id: 6,
    name: 'Ingeborg Achterberg',
    geburtsdatum: '22.11.1940',
    heilmittel: 'NOB-E-HB',
    einrichtung: 'E71 - No name',
    therapeut: 'P. Sandra',
    voNr: '[3464-2]',
    ausstDatum: '07.04.2025',
    behStatus: '1 / 10',
    arzt: 'J. Sloboda',
    fvoStatus: 'Erhalten',
    therapiebericht: 'Sent'
  },
  {
    id: 7,
    name: 'Ingeborg Achterberg',
    geburtsdatum: '22.11.1940',
    heilmittel: 'NOB-E-HB',
    einrichtung: 'E71 - No name',
    therapeut: 'P. Sandra',
    voNr: '[3464-3]',
    ausstDatum: '06.05.2025',
    behStatus: '3 / 10',
    arzt: 'J. Sloboda',
    fvoStatus: '-',
    therapiebericht: 'Created'
  },
  {
    id: 8,
    name: 'Ingrid Ackermann',
    geburtsdatum: '14.11.1932',
    heilmittel: 'KG-H',
    einrichtung: 'Alpenland Marzahn',
    therapeut: 'J. Scheffler',
    voNr: '[2584-3]',
    ausstDatum: '17.01.2025',
    behStatus: '10 / 10',
    arzt: 'S. Dulce 3',
    fvoStatus: 'Erhalten',
    therapiebericht: 'Created'
  },
  {
    id: 9,
    name: 'Ingrid Ackermann',
    geburtsdatum: '14.11.1932',
    heilmittel: 'KG-H',
    einrichtung: 'Alpenland Marzahn',
    therapeut: 'J. Scheffler',
    voNr: '[2584-5]',
    ausstDatum: '07.02.2025',
    behStatus: '10 / 10',
    arzt: 'S. Dulce 3',
    fvoStatus: 'Erhalten',
    therapiebericht: 'Created'
  },
  {
    id: 10,
    name: 'Ingrid Ackermann',
    geburtsdatum: '14.11.1932',
    heilmittel: 'KG-H',
    einrichtung: 'Alpenland Marzahn',
    therapeut: 'J. Scheffler',
    voNr: '[2584-6]',
    ausstDatum: '21.03.2025',
    behStatus: '10 / 10',
    arzt: 'S. Dulce 3',
    fvoStatus: 'Erhalten',
    therapiebericht: 'Sent'
  }
];

// Mock therapy report data for each patient
const mockTherapyReports: {[key: number]: TherapyReportForm} = {
  1: {
    therapyType: "Physiotherapie",
    startDate: new Date('2025-01-20'),
    endDate: new Date('2025-02-20'),
    currentFindings: "Patient shows significant improvement in mobility and balance. Range of motion has increased by 30% since treatment began.",
    specialFeatures: "Patient requires additional support during standing exercises. Responds well to manual therapy techniques.",
    treatmentAccordingToPrescription: true,
    changeTherapyFrequency: false,
    changeIndividualTherapy: false,
    changeGroupTherapy: false,
    continuationOfTherapyRecommended: true
  },
  2: {
    therapyType: "Ergotherapie",
    startDate: new Date('2025-01-16'),
    endDate: new Date('2025-02-16'),
    currentFindings: "Patient demonstrates improved fine motor skills and cognitive function. Daily living activities show marked improvement.",
    specialFeatures: "Requires cognitive stimulation exercises. Benefits from structured routine and clear instructions.",
    treatmentAccordingToPrescription: true,
    changeTherapyFrequency: false,
    changeIndividualTherapy: true,
    changeGroupTherapy: false,
    continuationOfTherapyRecommended: true
  },
  3: {
    therapyType: "Ergotherapie",
    startDate: new Date('2025-04-22'),
    endDate: new Date('2025-05-22'),
    currentFindings: "Continued progress in occupational therapy goals. Patient maintains independence in most daily activities.",
    specialFeatures: "Focus on maintaining current functional level. Preventive approach to avoid regression.",
    treatmentAccordingToPrescription: true,
    changeTherapyFrequency: false,
    changeIndividualTherapy: false,
    changeGroupTherapy: false,
    continuationOfTherapyRecommended: false
  },
  4: {
    therapyType: "Physiotherapie",
    startDate: new Date('2025-02-05'),
    endDate: new Date('2025-03-05'),
    currentFindings: "Initial assessment shows limited mobility. Patient requires comprehensive rehabilitation approach.",
    specialFeatures: "Patient needs gentle mobilization techniques. Pain management is priority during early treatment phases.",
    treatmentAccordingToPrescription: true,
    changeTherapyFrequency: true,
    changeIndividualTherapy: false,
    changeGroupTherapy: false,
    continuationOfTherapyRecommended: true
  },
  5: {
    therapyType: "Ergotherapie",
    startDate: new Date('2025-02-19'),
    endDate: new Date('2025-03-19'),
    currentFindings: "Patient has achieved treatment goals successfully. Functional independence restored in target areas.",
    specialFeatures: "Excellent compliance with home exercise program. Family support system very strong.",
    treatmentAccordingToPrescription: true,
    changeTherapyFrequency: false,
    changeIndividualTherapy: false,
    changeGroupTherapy: false,
    continuationOfTherapyRecommended: false
  },
  6: {
    therapyType: "Ergotherapie",
    startDate: new Date('2025-04-07'),
    endDate: new Date('2025-05-07'),
    currentFindings: "Follow-up treatment showing sustained improvements. Patient maintains functional gains from previous therapy.",
    specialFeatures: "Maintenance therapy approach. Focus on preventing functional decline.",
    treatmentAccordingToPrescription: true,
    changeTherapyFrequency: false,
    changeIndividualTherapy: false,
    changeGroupTherapy: false,
    continuationOfTherapyRecommended: true
  },
  7: {
    therapyType: "Ergotherapie",
    startDate: new Date('2025-05-06'),
    endDate: new Date('2025-06-06'),
    currentFindings: "Ongoing treatment with steady progress. Patient adapting well to therapeutic interventions.",
    specialFeatures: "Requires modified equipment for optimal function. Environmental adaptations recommended.",
    treatmentAccordingToPrescription: true,
    changeTherapyFrequency: false,
    changeIndividualTherapy: false,
    changeGroupTherapy: true,
    continuationOfTherapyRecommended: true
  },
  8: {
    therapyType: "Physiotherapie",
    startDate: new Date('2025-01-17'),
    endDate: new Date('2025-02-17'),
    currentFindings: "Treatment completed successfully. Patient achieved all prescribed therapy goals within timeframe.",
    specialFeatures: "Excellent response to treatment protocol. No complications during therapy course.",
    treatmentAccordingToPrescription: true,
    changeTherapyFrequency: false,
    changeIndividualTherapy: false,
    changeGroupTherapy: false,
    continuationOfTherapyRecommended: false
  },
  9: {
    therapyType: "Physiotherapie",
    startDate: new Date('2025-02-07'),
    endDate: new Date('2025-03-07'),
    currentFindings: "Continued improvement in strength and mobility. Patient demonstrates good understanding of exercise program.",
    specialFeatures: "Benefits from group therapy sessions. Peer interaction enhances motivation and compliance.",
    treatmentAccordingToPrescription: true,
    changeTherapyFrequency: false,
    changeIndividualTherapy: false,
    changeGroupTherapy: true,
    continuationOfTherapyRecommended: true
  },
  10: {
    therapyType: "Physiotherapie",
    startDate: new Date('2025-03-21'),
    endDate: new Date('2025-04-21'),
    currentFindings: "Final treatment phase completed. Patient ready for discharge with home exercise program.",
    specialFeatures: "Comprehensive home program established. Family educated on supportive techniques.",
    treatmentAccordingToPrescription: true,
    changeTherapyFrequency: false,
    changeIndividualTherapy: false,
    changeGroupTherapy: false,
    continuationOfTherapyRecommended: false
  }
};

export default function ArztberichtWireframe() {
  const [patients, setPatients] = useState<ArztberichtPatient[]>(mockPatients);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAll, setSelectedAll] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'sent-doctor' | 'sent-report' | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessageText, setSuccessMessageText] = useState('');
  const [showSentReports, setShowSentReports] = useState(false);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [currentPatientForPdf, setCurrentPatientForPdf] = useState<ArztberichtPatient | null>(null);
  const [showAnnotations, setShowAnnotations] = useState(true);

  // Tab data with counts
  const tabs = [
    { name: 'F.-VO Bestellen', count: 679, active: false },
    { name: 'F.-VO Bestellt', count: 0, active: false },
    { name: 'F.-VO Erhalten', count: 2253, active: false },
    { name: 'Keine Folge-VO', count: 3, active: false },
    { name: 'Fertig Behandelt', count: 248, active: false },
    { name: 'Arztbericht zu versenden', count: 142, active: true }, // This is the active tab
    { name: 'All VOs', count: 4908, active: false }
  ];

  // Toggle individual patient selection
  const togglePatientSelection = (id: number) => {
    setPatients(prev => prev.map(patient => 
      patient.id === id ? { ...patient, selected: !patient.selected } : patient
    ));
  };

  // Filter patients based on toggle
  const filteredPatients = showSentReports 
    ? patients 
    : patients.filter(p => p.therapiebericht === 'Created');

  // Toggle select all
  const toggleSelectAll = () => {
    const newSelectedState = !selectedAll;
    setSelectedAll(newSelectedState);
    setPatients(prev => prev.map(patient => ({ ...patient, selected: newSelectedState })));
  };

  // Get selected count (only from filtered patients)
  const selectedCount = filteredPatients.filter(p => p.selected).length;

  // Handle admin actions
  const handleMarkAsSentToDoctor = () => {
    setConfirmAction('sent-doctor');
    setShowConfirmDialog(true);
  };

  const handleMarkTherapyReportSent = () => {
    setConfirmAction('sent-report');
    setShowConfirmDialog(true);
  };

  const confirmActionHandler = () => {
    const selectedPatients = patients.filter(p => p.selected);
    
    if (confirmAction === 'sent-report') {
      // Mark selected therapy reports as sent
      setPatients(prev => prev.map(patient => 
        patient.selected 
          ? { ...patient, therapiebericht: 'Sent' as const, selected: false }
          : patient
      ));
    }
    
    // Reset selections
    setSelectedAll(false);
    setPatients(prev => prev.map(patient => ({ ...patient, selected: false })));
    
    // Show success message with count
    const count = selectedPatients.length;
    setSuccessMessageText(`${count} VO report${count > 1 ? 's' : ''} marked as sent`);
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 3000);
    
    // Close dialog
    setShowConfirmDialog(false);
    setConfirmAction(null);
  };

  const cancelAction = () => {
    setShowConfirmDialog(false);
    setConfirmAction(null);
  };

  // Handle PDF viewing
  const viewPdf = (patient: ArztberichtPatient) => {
    setCurrentPatientForPdf(patient);
    setShowPdfModal(true);
  };

  // Handle marking reports as sent (changes status from Created to Sent)
  const markReportAsSent = (patientId: number) => {
    const patient = patients.find(p => p.id === patientId);
    setPatients(prev => prev.map(patient => 
      patient.id === patientId 
        ? { ...patient, therapiebericht: 'Sent' as const }
        : patient
    ));
    
    // Show success message
    setSuccessMessageText('1 VO report marked as sent');
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 3000);
  };

  return (
    <WireframeLayout title="Dashboard - Verwaltung" username="Super Admin" userInitials="SA" showSidebar={false}>
      <div className="bg-white min-h-screen">
        {/* Header with filters */}
        <div className="border-b border-gray-200 pb-4 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-600 text-sm mb-2">Hello Super Admin, I hope you have a wonderful day.</p>
              <h1 className="text-2xl font-semibold text-gray-900">Dashboard - Verwaltung</h1>
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

        {/* Table Controls */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-4">
            <button className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white hover:bg-gray-50">
              Show columns
            </button>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="showSentReports"
                checked={showSentReports}
                onChange={(e) => setShowSentReports(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="showSentReports" className="text-sm text-gray-700">
                Show sent reports
              </label>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {selectedCount > 0 && (
              <button 
                onClick={handleMarkTherapyReportSent}
                className="px-4 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700"
              >
                Mark As Sent ({selectedCount})
              </button>
            )}
            <div className="relative">
              <input
                type="text"
                placeholder="Search"
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
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ausst. Datum</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Beh. Status (#/#)</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Arzt</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Therapiebericht</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPatients.map((patient) => (
                <tr key={patient.id} className={patient.selected ? 'bg-blue-50' : 'hover:bg-gray-50'}>
                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      checked={patient.selected || false}
                      onChange={() => togglePatientSelection(patient.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-900 font-medium">{patient.name}</td>
                  <td className="px-4 py-4 text-sm text-gray-900">{patient.heilmittel}</td>
                  <td className="px-4 py-4 text-sm text-gray-900">{patient.therapeut}</td>
                  <td className="px-4 py-4 text-sm text-gray-900">{patient.voNr}</td>
                  <td className="px-4 py-4 text-sm text-gray-900">{patient.ausstDatum}</td>
                  <td className="px-4 py-4 text-sm text-gray-900">{patient.behStatus}</td>
                  <td className="px-4 py-4 text-sm text-gray-900">{patient.arzt}</td>
                  <td className="px-4 py-4 text-sm">
                    <div className="flex items-center gap-2">
                      <span className={`${
                        patient.therapiebericht === 'Created' ? 'text-blue-600' : 'text-green-600'
                      } font-medium`}>
                        {patient.therapiebericht}
                      </span>
                      <button
                        onClick={() => viewPdf(patient)}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                        title="View PDF"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-4">
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
              <span className="text-sm text-gray-700">1-10 of 4908</span>
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

        {/* Confirmation Dialog */}
        {showConfirmDialog && (
          <div className="fixed inset-0 backdrop-blur-md bg-white/10 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Confirm Action
              </h3>
              <p className="text-sm text-gray-700 mb-6">
                Are you sure you want to {confirmAction === 'sent-doctor' 
                  ? 'mark the selected items as sent to doctor' 
                  : 'mark the selected therapy reports as sent'}?
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={cancelAction}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmActionHandler}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}

        {/* PDF Modal */}
        {showPdfModal && currentPatientForPdf && (
          <div className="fixed inset-0 backdrop-blur-md bg-white/10 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
              {/* Modal Header */}
              <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    Gespeicherter Therapiebericht
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Patient: {currentPatientForPdf.name}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAnnotations(!showAnnotations)}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                    showAnnotations 
                      ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  📋 {showAnnotations ? 'Hide' : 'Show'} Dev Annotations
                </button>
              </div>

              {/* Modal Body - PDF Preview */}
              <div className="px-6 py-4 max-h-[calc(90vh-160px)] overflow-y-auto">
                <div className="bg-white border border-gray-200 rounded-lg p-8 space-y-4 min-h-[600px] text-black font-sans">
                  {/* Professional Letterhead */}
                  <div className="text-center border-b border-gray-300 pb-6">
                    <div className="mb-4">
                      <h1 className="text-xl font-bold text-black">Therapios GmbH</h1>
                      <h2 className="text-lg font-normal text-black">{showAnnotations && <span className="bg-yellow-100 px-1 rounded text-xs">📋 DEV: Therapy Type from Prescription Form</span>} Occupational Therapy</h2>
                    </div>
                    <div className="text-sm text-black">
                      <p>Oderstr. 66</p>
                      <p>14513 Teltow</p>
                    </div>
                    <div className="absolute top-8 right-8 text-sm text-black">
                      info@therapios.de
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-1">
                      <p className="text-sm text-black">Therapios GmbH, Oderstr. 66, 14513 Teltow</p>
                    </div>
                    <div></div>
                  </div>

                  {/* To Section */}
                  <div className="grid grid-cols-2 gap-8 py-4">
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-black">To:</p>
                      <p className="text-sm text-black">{currentPatientForPdf.arzt}</p>
                      <p className="text-sm text-black">
                        {/* DEV NOTE: Doctor address will be sourced from Rezepte file */}
                        {showAnnotations && <span className="bg-yellow-100 px-1 rounded text-xs">📋 DEV: Address from Rezepte</span>}
                      </p>
                      <p className="text-sm text-black">D - 15377 Märkische Höhe</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-black">Doctor's Fax Number:</p>
                    </div>
                  </div>

                  <div className="text-center py-2">
                    <span className="text-xl font-bold">-</span>
                  </div>

                  <div className="text-right py-2">
                    <p className="text-sm text-black">{new Date().toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  </div>

                  {/* Document Title */}
                  <div className="text-center py-4">
                    <h2 className="text-lg font-bold text-black">
                      Therapy Report to {showAnnotations && <span className="bg-yellow-100 px-1 rounded text-xs">📋 DEV: Doctor from Prescription Form</span>} {currentPatientForPdf.arzt} from {new Date().toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                    </h2>
                  </div>

                  {/* Patient Information */}
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-black">for the patient:</p>
                    <p className="text-sm text-black">
                      {showAnnotations && <span className="bg-yellow-100 px-1 rounded text-xs">📋 DEV: Patient Name from Prescription Form</span>} {currentPatientForPdf.name}, born: 
                      {showAnnotations && <span className="bg-yellow-100 px-1 rounded text-xs ml-1">📋 DEV: DOB from Rezepte</span>} 10.07.1934
                    </p>
                    <p className="text-sm text-black">
                      {showAnnotations && <span className="bg-yellow-100 px-1 rounded text-xs">📋 DEV: Address from Rezepte</span>} Uhlandstr. 18-19
                    </p>
                    <p className="text-sm text-black">
                      {showAnnotations && <span className="bg-yellow-100 px-1 rounded text-xs">📋 DEV: Postal from Rezepte</span>} 10553 Berlin/Tel.
                    </p>
                    <p className="text-sm text-black">
                      {showAnnotations && <span className="bg-yellow-100 px-1 rounded text-xs">📋 DEV: Insurance from Rezepte</span>} Health insurance number, Berlin, Insurance number: 007594905
                    </p>
                  </div>

                  {/* Prescription Information */}
                  <div className="space-y-2 py-4">
                    <p className="text-sm text-black">
                      Your prescription from {showAnnotations && <span className="bg-yellow-100 px-1 rounded text-xs">📋 DEV: Date from Rezepte</span>} 17.12.2024 with diagnosis {showAnnotations && <span className="bg-yellow-100 px-1 rounded text-xs">📋 DEV: Diagnosis from Rezepte</span>} F03 Non-specified dementia (-).
                    </p>
                  </div>

                  {/* Treatment Period */}
                  <div className="space-y-2">
                    <p className="text-sm text-black">
                      The treatment was conducted from {showAnnotations && <span className="bg-yellow-100 px-1 rounded text-xs">📋 DEV: Start Date from Prescription Form</span>} 01.06.2025 to {showAnnotations && <span className="bg-yellow-100 px-1 rounded text-xs">📋 DEV: End Date from Prescription Form</span>} 12.06.2025.
                    </p>
                  </div>

                  {/* Current Therapy Status */}
                  <div className="space-y-2 py-4">
                    <p className="text-sm font-semibold text-black">Current therapy status (current findings)</p>
                    <p className="text-sm text-black whitespace-pre-wrap">{showAnnotations && <span className="bg-yellow-100 px-1 rounded text-xs">📋 DEV: Current Findings from Prescription Form</span>} aaaaaaa</p>
                  </div>

                  {/* Special Features */}
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-black">Special features during the treatment course</p>
                    <p className="text-sm text-black whitespace-pre-wrap">{showAnnotations && <span className="bg-yellow-100 px-1 rounded text-xs">📋 DEV: Special Features from Prescription Form</span>} bbbbbbb</p>
                  </div>

                  {/* Treatment according to prescription */}
                  <div className="space-y-1 py-2">
                    <p className="text-sm font-semibold text-black">
                      {showAnnotations && <span className="bg-yellow-100 px-1 rounded text-xs">📋 DEV: Treatment Requirements from Prescription Form</span>} Treatment according to prescription: yes
                    </p>
                  </div>

                  {/* Continuation of therapy */}
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-black">
                      {showAnnotations && <span className="bg-yellow-100 px-1 rounded text-xs">📋 DEV: Continuation Recommendation from Prescription Form</span>} Continuation of therapy recommended: yes
                    </p>
                  </div>

                  {/* Change therapy frequency */}
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-black">
                      {showAnnotations && <span className="bg-yellow-100 px-1 rounded text-xs">📋 DEV: Change Therapy Frequency from Prescription Form</span>} Change therapy frequency: yes
                    </p>
                  </div>

                  {/* Change to individual therapy */}
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-black">
                      {showAnnotations && <span className="bg-yellow-100 px-1 rounded text-xs">📋 DEV: Change Individual Therapy from Prescription Form</span>} Change to individual therapy: no
                    </p>
                  </div>

                  {/* Change to group therapy */}
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-black">
                      {showAnnotations && <span className="bg-yellow-100 px-1 rounded text-xs">📋 DEV: Change Group Therapy from Prescription Form</span>} Change to group therapy: no
                    </p>
                  </div>

                  {/* Professional Footer */}
                  <div className="text-center pt-8">
                    <p className="text-sm text-black">With friendly greetings</p>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="border-t border-gray-200 px-6 py-4 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowPdfModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Close
                </button>
                {currentPatientForPdf.therapiebericht === 'Created' && (
                  <button
                    type="button"
                    onClick={() => {
                      markReportAsSent(currentPatientForPdf.id);
                      setShowPdfModal(false);
                    }}
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    Mark as Sent
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </WireframeLayout>
  );
} 