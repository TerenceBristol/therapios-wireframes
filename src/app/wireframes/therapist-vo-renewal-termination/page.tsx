'use client';

import React, { useState } from 'react';
import WireframeLayout from '@/components/WireframeLayout';
import AbbrechenVOModal from '@/components/AbbrechenVOModal';
import CancelRenewalModal from '@/components/CancelRenewalModal';
import VOStatusBadge from '@/components/VOStatusBadge';
import PrescriptionLogsModal from '@/components/PrescriptionLogsModal';
import { ChevronDown, Search, Eye } from 'lucide-react';

// Define types
type VOStatus = 'Aktiv' | 'In Behandlung' | 'Fertig behandelt' | 'Abgebrochen';
interface LogEntry {
  description: string;
  timestamp: string;
}
interface PatientData {
  id: number;
  name: string;
  einrichtung: string;
  organizer: string;
  aktVo: string;
  behStatus: string;
  arzt: string;
  ausstDatum: string;
  voStatus: VOStatus;
  logs: LogEntry[];
  willNotAutoRenew?: boolean; // Added optional flag
}

// Initial data (will be moved to state)
const initialPatientData: PatientData[] = [
  { id: 1, name: 'Gundula Achter', einrichtung: 'Vivantes HSP Haus Ernst Hoppe', organizer: '', aktVo: '2322-4', behStatus: '0 / 10', arzt: 'U. Vivantes Spandau', ausstDatum: '2025-02-05', voStatus: 'Aktiv' as VOStatus, logs: [], willNotAutoRenew: false },
  { id: 2, name: 'Margot Andresen', einrichtung: 'Hauptstadtpflege Haus Dr. Hermann-Kantorowicz', organizer: '', aktVo: '2755-4', behStatus: '9 / 10', arzt: 'R. Steuer', ausstDatum: '2025-01-10', voStatus: 'Aktiv' as VOStatus, logs: [], willNotAutoRenew: false },
  { id: 3, name: 'Ilse Aust', einrichtung: 'Vivantes HSP Haus Ernst Hoppe', organizer: '', aktVo: '2073-9', behStatus: '8 / 10', arzt: 'U. Vivantes Spandau', ausstDatum: '2025-02-05', voStatus: 'In Behandlung' as VOStatus, logs: [{ description: 'VO initiated', timestamp: '4/1/2025, 10:00:00 AM' }], willNotAutoRenew: false },
  { id: 4, name: 'Erich-Detlev Balke', einrichtung: 'E19 - No name', organizer: '', aktVo: '2840-2', behStatus: '8 / 10', arzt: 'R. Steuer', ausstDatum: '2025-01-10', voStatus: 'Aktiv' as VOStatus, logs: [], willNotAutoRenew: false },
  { id: 5, name: 'Hans-Peter Belz', einrichtung: 'Vivantes HSP Haus Ernst Hoppe', organizer: '', aktVo: '2758-5', behStatus: '5 / 6', arzt: 'B. Wurl', ausstDatum: '2025-02-19', voStatus: 'Fertig behandelt' as VOStatus, logs: [{ description: 'Treatment complete', timestamp: '4/09/2025, 2:15:00 PM' }], willNotAutoRenew: false },
  { id: 6, name: 'Wolfgang Bornemann', einrichtung: 'Hauptstadtpflege Haus Dr. Hermann-Kantorowicz', organizer: '', aktVo: '2526-4', behStatus: '3 / 10', arzt: 'R. Steuer', ausstDatum: '2025-03-07', voStatus: 'Aktiv' as VOStatus, logs: [], willNotAutoRenew: false },
  { id: 7, name: 'Albert Brandies', einrichtung: 'Hauptstadtpflege Haus Dr. Hermann-Kantorowicz', organizer: '', aktVo: '3401-1', behStatus: '0 / 10', arzt: 'R. Steuer', ausstDatum: '2025-02-17', voStatus: 'Aktiv' as VOStatus, logs: [], willNotAutoRenew: false },
  { id: 8, name: 'Ronald Braukmann', einrichtung: 'Hauptstadtpflege Haus Dr. Hermann-Kantorowicz', organizer: '', aktVo: '3300-1', behStatus: '5 / 10', arzt: 'R. Steuer', ausstDatum: '2025-01-10', voStatus: 'In Behandlung' as VOStatus, logs: [], willNotAutoRenew: false },
  { id: 9, name: 'Eric-Sia-Sanga Diomande', einrichtung: 'Hauptstadtpflege Haus Dr. Hermann-Kantorowicz', organizer: '', aktVo: '2942-2', behStatus: '0 / 9', arzt: 'J. Wassermann', ausstDatum: '2024-11-14', voStatus: 'Abgebrochen' as VOStatus, logs: [{ description: 'status change\nIn Behandlung to Abgeschlossen', timestamp: '4/10/2025, 3:07:39 PM' }], willNotAutoRenew: false },
  { id: 10, name: 'Another Patient', einrichtung: 'Another Facility', organizer: '', aktVo: '1234-5', behStatus: '10 / 10', arzt: 'Dr. Who', ausstDatum: '2024-10-10', voStatus: 'Abgebrochen' as VOStatus, logs: [{ description: 'Treatment stopped by patient', timestamp: '4/05/2025, 11:30:00 AM' }], willNotAutoRenew: false },
];

export default function TherapistVORenewalTerminationPage() {
  const [patients, setPatients] = useState<PatientData[]>(initialPatientData); // Data in state
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [isAbbrechenModalOpen, setIsAbbrechenModalOpen] = useState(false);
  const [isCancelRenewalModalOpen, setIsCancelRenewalModalOpen] = useState(false);
  const [isLogsModalOpen, setIsLogsModalOpen] = useState(false);
  const [modalPatientData, setModalPatientData] = useState<{
    id: number, 
    name: string, 
    aktVo: string, 
    arzt: string, 
    voStatus: VOStatus, 
    logs: LogEntry[]
  } | null>(null);
  const [logsModalData, setLogsModalData] = useState<{patientName: string, logs: LogEntry[]} | null>(null);
  const [activeTab, setActiveTab] = useState<'open' | 'closed'>('open');

  const handleCheckboxChange = (id: number) => {
    setSelectedRows(prev => 
      prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
    );
  };

  // Filter data based on active tab - Use patients state
  const filteredData = patients.filter(item => {
    if (activeTab === 'open') {
      return item.voStatus === 'Aktiv';
    } else { // activeTab === 'closed'
      return item.voStatus === 'Fertig behandelt' || item.voStatus === 'Abgebrochen';
    }
  });

  const handleSelectAllChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelectedRows(filteredData.map(item => item.id));
    } else {
      setSelectedRows([]);
    }
  };

  const isAllSelected = filteredData.length > 0 && selectedRows.length === filteredData.length;

  const openAbbrechenModal = () => {
    if (selectedRows.length === 1) {
      const selectedPatient = patients.find(item => item.id === selectedRows[0]); 
      if (selectedPatient) {
        // Include id AND logs when setting modal data
        setModalPatientData({
          id: selectedPatient.id, 
          name: selectedPatient.name,
          aktVo: selectedPatient.aktVo,
          arzt: selectedPatient.arzt,
          voStatus: selectedPatient.voStatus,
          logs: selectedPatient.logs
        });
        setIsAbbrechenModalOpen(true);
      }
    }
  };
  
  const closeAbbrechenModal = () => {
    setIsAbbrechenModalOpen(false);
    setModalPatientData(null);
  };

  const handleAbbrechenConfirm = (reason: string) => {
    if (!modalPatientData) {
      console.error("Missing data for confirmation");
      closeAbbrechenModal();
      return;
    }

    const timestamp = new Date().toLocaleString();
    const logDescription = `VO Abgebrochen. Reason: ${reason}`;
    const updatedPatientData: Partial<PatientData> = {
      voStatus: 'Abgebrochen' as VOStatus,
      logs: [...modalPatientData.logs, { description: logDescription, timestamp }]
    };
    console.log(`Patient ${modalPatientData.id} VO status set to Abgebrochen.`);

    // Update the patient state
    setPatients(currentPatients => 
      currentPatients.map(p => 
        p.id === modalPatientData.id ? { ...p, ...updatedPatientData } : p
      )
    );
    
    closeAbbrechenModal();
    setSelectedRows([]); // Clear selection after confirmation
  };

  const openCancelRenewalModal = () => {
    if (selectedRows.length === 1) {
      const selectedPatient = patients.find(item => item.id === selectedRows[0]); 
      if (selectedPatient) {
        setModalPatientData({
          id: selectedPatient.id, 
          name: selectedPatient.name,
          aktVo: selectedPatient.aktVo,
          arzt: selectedPatient.arzt,
          voStatus: selectedPatient.voStatus,
          logs: selectedPatient.logs
        });
        setIsCancelRenewalModalOpen(true);
      }
    }
  };

  const closeCancelRenewalModal = () => {
    setIsCancelRenewalModalOpen(false);
    setModalPatientData(null);
  };

  const handleCancelRenewalConfirm = () => {
    if (!modalPatientData) {
      console.error("Missing data for Cancel Renewal confirmation");
      closeCancelRenewalModal();
      return;
    }

    const timestamp = new Date().toLocaleString();
    const logDescription = `Automatic renewal cancelled. Do not order Folge VO`; 
    const updatedPatientData: Partial<PatientData> = { 
      willNotAutoRenew: true, 
      logs: [...modalPatientData.logs, { description: logDescription, timestamp }]
      // voStatus remains the same ('Aktiv')
    };
    console.log(`Patient ${modalPatientData.id} marked as will not auto renew.`);

    // Update the patient state
    setPatients(currentPatients => 
      currentPatients.map(p => 
        p.id === modalPatientData.id ? { ...p, ...updatedPatientData } : p
      )
    );
    
    closeCancelRenewalModal();
    setSelectedRows([]); // Clear selection after confirmation
  };

  const isAnySelected = selectedRows.length > 0;

  // Function to handle tab change
  const handleTabChange = (tab: 'open' | 'closed') => {
    setActiveTab(tab);
    setSelectedRows([]); // Clear selection when tab changes
  };

  const openLogsModal = (patientId: number) => {
    const selectedPatient = patients.find(item => item.id === patientId);
    if (selectedPatient) {
      setLogsModalData({ patientName: selectedPatient.name, logs: selectedPatient.logs });
      setIsLogsModalOpen(true);
    }
  };

  const closeLogsModal = () => {
    setIsLogsModalOpen(false);
    setLogsModalData(null);
  };

  return (
    <WireframeLayout title="Therapist VO Renewal & Termination" username="User Therapist" userInitials="UT" showSidebar={false}>
      <div className="p-6 bg-white">
        <div className="flex justify-between items-start mb-6">
          <div>
            <p className="text-sm text-gray-600">Hello Super Admin, I hope you have a wonderful day.</p>
            <h1 className="text-3xl font-bold text-gray-800">Therapist Data Overview</h1>
          </div>
          <div className="flex items-center border border-gray-300 rounded px-3 py-1.5 text-sm bg-white shadow-sm cursor-pointer">
            <span>Andreas Rosky</span>
            <ChevronDown className="h-4 w-4 ml-2 text-gray-500" />
          </div>
        </div>
        <div className="mb-4 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => handleTabChange('open')}
              className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'open' 
                ? 'text-blue-600 border-blue-600' 
                : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'}`}
            >
              Open Prescription
            </button>
            <button
              onClick={() => handleTabChange('closed')}
              className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'closed' 
                ? 'text-blue-600 border-blue-600' 
                : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'}`}
            >
              Closed Prescription
            </button>
            <button
              className="whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300"
            >
              Calendar
            </button>
          </nav>
        </div>
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-2">
            <button className="flex items-center border border-gray-300 rounded px-3 py-1.5 text-sm bg-white shadow-sm text-gray-700 hover:bg-gray-50">
              <span>Show columns</span>
              <ChevronDown className="h-4 w-4 ml-2 text-gray-500" />
            </button>
            {activeTab === 'open' && isAnySelected && (
              <button className="px-3 py-1.5 border border-transparent rounded shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                Document Treatment
              </button>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {activeTab === 'open' && selectedRows.length === 1 && (
              <button 
                onClick={openCancelRenewalModal}
                className="px-3 py-1.5 border border-orange-500 rounded shadow-sm text-sm font-medium text-orange-600 bg-white hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-400"
              >
                Keine Folge-VO bestellen
              </button>
            )}
            {activeTab === 'open' && selectedRows.length === 1 && (
              <button 
                onClick={openAbbrechenModal}
                className="px-3 py-1.5 border border-transparent rounded shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Abbrechen
              </button>
            )}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search Patient"
                className="block w-64 pl-9 pr-3 py-1.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-4 py-2 text-left">
                  {activeTab === 'open' && (
                    <input 
                      type="checkbox" 
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      checked={isAllSelected}
                      onChange={handleSelectAllChange}
                    />
                  )}
                </th>
                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Einrichtung</th>
                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Organizer</th>
                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Akt. VO#</th>
                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Beh. Status (#/#)</th>
                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Arzt</th>
                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ausst. Datum</th>
                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">VO Status</th>
                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Logs</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredData.map((item) => (
                <tr key={item.id} className={`${selectedRows.includes(item.id) ? 'bg-blue-50' : ''}`}>
                  <td className="px-4 py-2 whitespace-nowrap">
                    {activeTab === 'open' && (
                      <input 
                        type="checkbox" 
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        checked={selectedRows.includes(item.id)}
                        onChange={() => handleCheckboxChange(item.id)}
                      />
                    )}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{item.einrichtung}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                    <div className="relative">
                      <select className="block appearance-none w-full bg-white border border-gray-300 hover:border-gray-400 px-3 py-1 pr-8 rounded shadow-sm leading-tight focus:outline-none focus:shadow-outline text-sm">
                        <option>Select</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                        <ChevronDown className="h-4 w-4" />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{item.aktVo}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{item.behStatus}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{item.arzt}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{item.ausstDatum}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 text-center">
                    <VOStatusBadge 
                      status={item.voStatus} 
                      willNotAutoRenew={item.willNotAutoRenew}
                    />
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 text-center">
                     <button 
                       onClick={() => openLogsModal(item.id)}
                       className="p-1 border border-gray-300 rounded bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                       disabled={!item.logs || item.logs.length === 0}
                     >
                        <Eye className="h-4 w-4 text-gray-600" />
                     </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isAbbrechenModalOpen && modalPatientData && (
        <AbbrechenVOModal
          isOpen={isAbbrechenModalOpen}
          onClose={closeAbbrechenModal}
          onConfirm={handleAbbrechenConfirm}
          patientData={modalPatientData}
        />
      )}

      {isCancelRenewalModalOpen && modalPatientData && (
        <CancelRenewalModal
          isOpen={isCancelRenewalModalOpen}
          onClose={closeCancelRenewalModal}
          onConfirm={handleCancelRenewalConfirm}
          patientData={modalPatientData}
        />
      )}

      {isLogsModalOpen && logsModalData && (
        <PrescriptionLogsModal
          isOpen={isLogsModalOpen}
          onClose={closeLogsModal}
          patientName={logsModalData.patientName}
          logs={logsModalData.logs}
        />
      )}
    </WireframeLayout>
  );
} 