'use client';

import React, { useState } from 'react';
import { format, addDays, isPast, isFuture, differenceInDays, parseISO, startOfDay } from 'date-fns'; // Using date-fns for date calculations
import { Info, ArrowUpDown, Search as SearchIcon } from 'lucide-react'; // Added SearchIcon

// Define the structure for table data
interface TableRowData {
  voNr: string;
  patName: string;
  einrichtung: string | null; // Allow null for missing ECH
  therapeut: string;
  ausstDatum: Date;
  fachbereich: 'Physiotherapy' | 'Ergotherapie' | 'Logopädie';
  behStatusNumerator: number;
  behStatusDenominator: number;
  geburtsdatum?: string; // Added
  heilmittel?: string;   // Added
  arzt?: string;         // Added
}

// Helper to create Date objects from dd.mm.yyyy strings
const parseDate = (dateStr: string): Date => {
  const [day, month, year] = dateStr.split('.').map(Number);
  return new Date(year, month - 1, day);
};

// Function to generate Exp. Datum
const calculateExpDatum = (ausstDatum: Date): Date => {
  return addDays(ausstDatum, 28);
};

// Function to calculate VO expiry date based on treatment count
const calculateVoExpiryDate = (ausstDatum: Date, behStatusDenominator: number): Date => {
  const daysToAdd = behStatusDenominator > 6 ? 180 : 90;
  return addDays(ausstDatum, daysToAdd);
};

// Function to format Beh. Status
const formatBehStatus = (num: number, den: number): string => `${num} / ${den}`;

// Use the actual current date, reset to start of day for consistent comparisons
const TODAY = startOfDay(new Date()); 

// Calculate 90 days before TODAY for validity check
const VALIDITY_EXPIRED_DATE_THRESHOLD = addDays(TODAY, -90);

// --- Helper functions for dynamic date generation ---
const daysAgo = (days: number) => addDays(TODAY, -days);
const daysFromNow = (days: number) => addDays(TODAY, days);

export default function CleanUpDashboardPage() {
  // --- State Hooks ---
  // Dropdown visibility (already exists)
  const [isTherapistOpen, setIsTherapistOpen] = useState(false);
  // Selected filter values
  const [selectedTherapist, setSelectedTherapist] = useState<string | null>(null);
  const [selectedFachbereich, setSelectedFachbereich] = useState<string | null>(null);
  // Active KPI filter
  const [activeKpiFilter, setActiveKpiFilter] = useState<string | null>(null);
  
  // --- Centralized Dummy Data --- 
  // Adjusted Ausst. Datum to be relative to the actual TODAY
  // Ensured all entries have a heilmittel value
  const dummyTableData: TableRowData[] = [
    { voNr: '1101-1', patName: 'Klara Altmann', einrichtung: 'Seniorenresidenz Sonnenschein', therapeut: 'Weber, Laura', ausstDatum: daysAgo(85), fachbereich: 'Physiotherapy', behStatusNumerator: 0, behStatusDenominator: 6, geburtsdatum: '11.05.1943', heilmittel: 'KG-H', arzt: 'P. Laudahn' }, // 90-day expiry, close to expiry
    { voNr: '1102-3', patName: 'Bernd Greif', einrichtung: 'Pflegeheim Abendrot', therapeut: 'Müller, Anna', ausstDatum: daysAgo(60), fachbereich: 'Ergotherapie', behStatusNumerator: 0, behStatusDenominator: 12, geburtsdatum: '02.03.1955', heilmittel: 'ET-Default', arzt: 'N/A' }, 
    { voNr: '2201-2', patName: 'Franz Abitz', einrichtung: 'FSE Pflegeeinrichtung Treptow / Johannisthal', therapeut: 'S. Zeibig', ausstDatum: daysAgo(170), fachbereich: 'Physiotherapy', behStatusNumerator: 0, behStatusDenominator: 20, geburtsdatum: '20.01.1952', heilmittel: 'BO-E-H', arzt: 'M. von Brevern' }, // 180-day expiry, close to expiry
    { voNr: '2202-10', patName: 'Gundula Achter', einrichtung: 'Vivantes HSP Haus Ernst Hoppe', therapeut: 'A. Rosky', ausstDatum: daysAgo(80), fachbereich: 'Ergotherapie', behStatusNumerator: 0, behStatusDenominator: 4, geburtsdatum: '19.05.1959', heilmittel: 'KG-H', arzt: 'U. Vivantes Spandau' }, // 90-day expiry, close to expiry 
    { voNr: '2203-5', patName: 'Dieter Vogel', einrichtung: 'Seniorenresidenz Sonnenschein', therapeut: 'Weber, Laura', ausstDatum: daysAgo(25), fachbereich: 'Logopädie', behStatusNumerator: 0, behStatusDenominator: 5, geburtsdatum: '15.08.1963', heilmittel: 'Logo-Default', arzt: 'N/A' }, // 90-day expiry, not close yet   
    { voNr: '3301-1', patName: 'Ingeborg Achterberg', einrichtung: 'E71 - No name', therapeut: 'P. Sandra', ausstDatum: daysAgo(5), fachbereich: 'Logopädie', behStatusNumerator: 0, behStatusDenominator: 10, geburtsdatum: '22.11.1940', heilmittel: 'NOB-E-HB', arzt: 'J. Sloboda' },    
    { voNr: '3302-8', patName: 'Ingrid Ackermann', einrichtung: 'Alpenland Marzahn', therapeut: 'J. Scheffler', ausstDatum: daysFromNow(10), fachbereich: 'Physiotherapy', behStatusNumerator: 0, behStatusDenominator: 3, geburtsdatum: '14.11.1932', heilmittel: 'KG-H', arzt: 'S. Dulce 3' }, // 90-day expiry, future date
    { voNr: '3303-4', patName: 'Elfriede Adam', einrichtung: 'Pflegewohnstift Potsdam Waldstadt', therapeut: 'K. Mischke', ausstDatum: daysFromNow(30), fachbereich: 'Ergotherapie', behStatusNumerator: 0, behStatusDenominator: 10, geburtsdatum: '03.07.1948', heilmittel: 'ET-Sensory', arzt: 'N/A' }, 
    { voNr: '4401-6', patName: 'Walter Ernst', einrichtung: 'Haus Evergreen', therapeut: 'Fischer, Michael', ausstDatum: daysAgo(50), fachbereich: 'Physiotherapy', behStatusNumerator: 0, behStatusDenominator: 6, geburtsdatum: '10.12.1935', heilmittel: 'KG-Atem', arzt: 'N/A' }, // 90-day expiry, not close yet
    { voNr: '4402-11', patName: 'Monika Lang', einrichtung: 'Haus Evergreen', therapeut: 'Schmidt, Klaus', ausstDatum: daysAgo(22), fachbereich: 'Physiotherapy', behStatusNumerator: 0, behStatusDenominator: 10, geburtsdatum: '25.04.1971', heilmittel: 'MT-Extremities', arzt: 'N/A' }, 
    { voNr: '4403-7', patName: 'Wolfgang Kurz', einrichtung: null, therapeut: 'Schneider, Sabine', ausstDatum: daysAgo(10), fachbereich: 'Ergotherapie', behStatusNumerator: 0, behStatusDenominator: 2, geburtsdatum: '08.09.1960', heilmittel: 'ET-Motor', arzt: 'N/A' }, // 90-day expiry, not close yet
    { voNr: '4404-1', patName: 'Karin Neumann', einrichtung: 'Pflegeheim Abendrot', therapeut: 'Fischer, Michael', ausstDatum: daysFromNow(45), fachbereich: 'Physiotherapy', behStatusNumerator: 0, behStatusDenominator: 10, geburtsdatum: '12.06.1953', heilmittel: 'KG-ZNS-Bobath', arzt: 'N/A' }, 
    { voNr: '5501-9', patName: 'Helmut Schmidt', einrichtung: 'Seniorenresidenz Sonnenschein', therapeut: 'Weber, Laura', ausstDatum: daysAgo(100), fachbereich: 'Physiotherapy', behStatusNumerator: 0, behStatusDenominator: 10, geburtsdatum: '05.02.1929', heilmittel: 'KG-Default', arzt: 'N/A' }, 
    { voNr: '5502-12', patName: 'Ingrid Berger', einrichtung: 'Alpenland Marzahn', therapeut: 'J. Scheffler', ausstDatum: daysAgo(95), fachbereich: 'Ergotherapie', behStatusNumerator: 0, behStatusDenominator: 12, geburtsdatum: '30.11.1938', heilmittel: 'ET-Cognitive', arzt: 'N/A' }, 
  ];

  // --- Dynamically generate filter options --- 
  const uniqueTherapistOptions = Array.from(new Set(dummyTableData.map(row => row.therapeut)));
  const fachbereichOptions = ['Physiotherapy', 'Ergotherapie', 'Logopädie'];

  // --- Filtering Logic --- 
  // 1. Apply dropdown filters first
  let intermediateFilteredData = dummyTableData;
  if (selectedTherapist) {
    intermediateFilteredData = intermediateFilteredData.filter(row => row.therapeut === selectedTherapist);
  }
  if (selectedFachbereich) {
    intermediateFilteredData = intermediateFilteredData.filter(row => row.fachbereich === selectedFachbereich);
  }

  // Helper function to get VO status
  const getVoStatus = (index: number) => {
    const voStatuses = ['Aktiv', 'Bereit', 'Abgerechnet', 'Expired'];
    return voStatuses[index % 4];
  };

  // 2. Calculate KPI counts based on intermediate data
  const noTreatmentsCount = intermediateFilteredData.filter(row => row.behStatusNumerator === 0).length;
  const noEchCount = intermediateFilteredData.filter(row => !row.einrichtung).length;
  const expiringCount = intermediateFilteredData.filter(row => {
    const expDatum = calculateExpDatum(row.ausstDatum);
    const isExpired = expDatum < TODAY; // Use TODAY
    const daysUntilExpiry = differenceInDays(expDatum, TODAY); // Use TODAY
    const isExpiringSoon = !isExpired && daysUntilExpiry >= 0 && daysUntilExpiry <= 14;
    return isExpiringSoon;
  }).length;
  const expiredCount = intermediateFilteredData.filter((row, index) => {
    const voStatus = getVoStatus(dummyTableData.findIndex(originalRow => originalRow.voNr === row.voNr));
    return voStatus === 'Expired';
  }).length;
  const approachingExpiryCount = intermediateFilteredData.filter((row, index) => {
    const voStatus = getVoStatus(dummyTableData.findIndex(originalRow => originalRow.voNr === row.voNr));
    const voExpiryDate = calculateVoExpiryDate(row.ausstDatum, row.behStatusDenominator);
    const daysUntilExpiry = differenceInDays(voExpiryDate, TODAY);
    
    return (voStatus === 'Aktiv' || voStatus === 'Bereit') && 
           daysUntilExpiry >= 0 && 
           daysUntilExpiry <= 14;
  }).length;
  // vosNotStartedCount is defined after noTreatmentsCount is calculated
  const vosNotStartedCount = noTreatmentsCount; 

  // 3. Apply active KPI filter (if any) for the final table data
  let filteredData = intermediateFilteredData;
  if (activeKpiFilter) {
    switch (activeKpiFilter) {
      case 'vosNotStarted':
        // Use the already calculated condition
        filteredData = filteredData.filter(row => row.behStatusNumerator === 0);
        break;
      case 'noEch':
        filteredData = filteredData.filter(row => !row.einrichtung);
        break;
      case 'expiring':
        // Use the already calculated condition
        filteredData = filteredData.filter(row => {
          const expDatum = calculateExpDatum(row.ausstDatum);
          const isExpired = expDatum < TODAY; // Use TODAY
          const daysUntilExpiry = differenceInDays(expDatum, TODAY); // Use TODAY
          return !isExpired && daysUntilExpiry >= 0 && daysUntilExpiry <= 14;
        });
        break;
      case 'approachingExpiry':
        // Filter by VOs approaching expiry (14 days or less) with status Aktiv or Bereit
        filteredData = filteredData.filter((row, index) => {
          const voStatus = getVoStatus(dummyTableData.findIndex(originalRow => originalRow.voNr === row.voNr));
          const voExpiryDate = calculateVoExpiryDate(row.ausstDatum, row.behStatusDenominator);
          const daysUntilExpiry = differenceInDays(voExpiryDate, TODAY);
          
          return (voStatus === 'Aktiv' || voStatus === 'Bereit') && 
                 daysUntilExpiry >= 0 && 
                 daysUntilExpiry <= 14;
        });
        break;
      case 'expired':
         // Filter by VO status "Expired"
        filteredData = filteredData.filter((row, index) => {
          const voStatus = getVoStatus(dummyTableData.findIndex(originalRow => originalRow.voNr === row.voNr));
          return voStatus === 'Expired';
        });
        break;
    }
  }

  // --- Event Handlers ---
  const handleTherapistSelect = (therapist: string | null) => {
    setSelectedTherapist(therapist);
    setIsTherapistOpen(false);
  };

  const handleFachbereichSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedFachbereich(value === 'All' ? null : value);
  };

  const handleKpiClick = (filterType: string) => {
    setActiveKpiFilter(prev => (prev === filterType ? null : filterType));
  };

  const handleClearAllFilters = () => {
    setSelectedTherapist(null);
    setSelectedFachbereich(null);
    setActiveKpiFilter(null);
    setIsTherapistOpen(false);
  };

  // The existing content (filters, KPIs, table) will be referred to as "CleanUpDashboardContent"
  // and will be integrated into a tab in a later step.
  const CleanUpDashboardContent = (
    <div className="space-y-6"> {/* Simplified container, using space-y for internal spacing */}
      {/* Filters Section - REMOVED */}
      {/* <div className="p-4 bg-white shadow rounded-lg"> ... Fachbereich filter was here ... </div> */}

      {/* KPIs Section - Copied from original wireframe, kept as is for now */}
      <div className="p-4 bg-white shadow rounded-lg">  {/* Added bg-white and shadow to group KPIs */}
        <h3 className="text-lg font-medium text-gray-700 mb-4">VO Status Overview (KPIs)</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">

          {/* No ECH KPI */}
          <div 
            onClick={() => handleKpiClick('noEch')}
            className={`border rounded-lg p-4 bg-white shadow-sm cursor-pointer transition-all ${activeKpiFilter === 'noEch' ? 'border-blue-500 border-2 ring-2 ring-blue-200' : 'border-gray-300'}`}
          >
            <h3 className="text-lg font-medium text-gray-800 mb-2">No ECH</h3>
            <p className="text-3xl font-bold text-[#5bc0de]">{noEchCount}</p> {/* Dynamic Count */}
          </div>
          {/* VOs Not Started KPI - Moved after No ECH */}
          <div 
            onClick={() => handleKpiClick('vosNotStarted')}
            className={`border rounded-lg p-4 bg-white shadow-sm cursor-pointer transition-all ${activeKpiFilter === 'vosNotStarted' ? 'border-blue-500 border-2 ring-2 ring-blue-200' : 'border-gray-300'}`}
          >
            <h3 className="text-lg font-medium text-gray-800 mb-2">VOs Not Started</h3>
            <p className="text-3xl font-bold text-[#777]">{vosNotStartedCount}</p> {/* Dynamic Count */}
          </div>
          {/* VOs Approaching Start Deadline KPI */}
          <div 
            onClick={() => handleKpiClick('expiring')}
            className={`relative border rounded-lg p-4 bg-white shadow-sm cursor-pointer transition-all ${activeKpiFilter === 'expiring' ? 'border-blue-500 border-2 ring-2 ring-blue-200' : 'border-gray-300'}`}
          >
            <div className="flex items-center mb-2">
              <h3 className="text-lg font-medium text-gray-800 mr-1">VOs Approaching Start Deadline</h3> 
              <span title="VOs <14 days away from start deadline. Start deadline is 28 days from Ausst. Datum">
                <Info className="h-4 w-4 text-gray-400 hover:text-gray-600" />
              </span>
            </div>
            <p className="text-3xl font-bold text-[#f0ad4e]">{expiringCount}</p> 
          </div>
          {/* VOs Approaching Expiry KPI - New card */}
          <div 
            onClick={() => handleKpiClick('approachingExpiry')}
            className={`relative border rounded-lg p-4 bg-white shadow-sm cursor-pointer transition-all ${activeKpiFilter === 'approachingExpiry' ? 'border-blue-500 border-2 ring-2 ring-blue-200' : 'border-gray-300'}`}
          >
            <div className="flex items-center mb-2">
              <h3 className="text-lg font-medium text-gray-800 mr-1">VOs Approaching Expiry</h3> 
              <span title="VOs approaching their expiration date">
                <Info className="h-4 w-4 text-gray-400 hover:text-gray-600" />
              </span>
            </div>
            <p className="text-3xl font-bold text-[#ff7f50]">{approachingExpiryCount}</p> 
          </div>
          {/* VOs Validity Expired KPI */}
          <div 
            onClick={() => handleKpiClick('expired')}
            className={`relative border rounded-lg p-4 bg-white shadow-sm cursor-pointer transition-all ${activeKpiFilter === 'expired' ? 'border-blue-500 border-2 ring-2 ring-blue-200' : 'border-gray-300'}`}
          >
            <div className="flex items-center mb-2">
               <h3 className="text-lg font-medium text-gray-800 mr-1">VOs Validity Expired</h3>
               <span title="VOs not started and past 90 days from Ausst. Datum">
                <Info className="h-4 w-4 text-gray-400 hover:text-gray-600" />
               </span>
            </div>
            <p className="text-3xl font-bold text-[#d9534f]">{expiredCount}</p> 
          </div>
        </div>
      </div>

      {/* Table Section Area */}
      <div className="bg-white shadow rounded-lg p-6"> {/* Main container for table and its controls */}
        {/* Table Controls: Show Columns Dropdown and Search Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
          <div className="relative">
            <button 
              // onClick={() => setIsColumnSelectorOpen(!isColumnSelectorOpen)} // Assuming a state for this dropdown
              className="h-10 min-w-[180px] border border-gray-300 rounded bg-white flex items-center justify-between px-3 text-left text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              Show columns 
              <span className="text-xs ml-2">▼</span>
            </button>
            {/* {isColumnSelectorOpen && ( ... Dropdown content ... )} */}
          </div>
          <div className="relative w-full md:w-auto md:min-w-[300px]">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
        </div>

        {/* Table itself */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>

                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pat. Name {/* <ArrowUpDown size={14} className="inline ml-1" /> */}
                </th>
                {/* Added Heilmittel based on image - needs data */}
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Heilmittel</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Einrichtung {/* <ArrowUpDown size={14} className="inline ml-1" /> */}
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Therapeut {/* <ArrowUpDown size={14} className="inline ml-1" /> */}
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  VO-Nr. {/* <ArrowUpDown size={14} className="inline ml-1" /> */}
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ausst. Datum {/* <ArrowUpDown size={14} className="inline ml-1" /> */}
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Beh. Status (#/#) {/* <ArrowUpDown size={14} className="inline ml-1" /> */}
                </th>
                {/* Removed Exp. Datum, Days Left, Actions for now to match image better. Added Arzt */}
                {/* <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Exp. Datum</th> */}
                {/* <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Days Left</th> */}
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Arzt</th> {/* Added Arzt */}
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">VO Status</th>
                {/* <th scope="col" className="relative px-4 py-3">
                  <span className="sr-only">Actions</span>
                </th> */}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 text-sm">
              {filteredData.map((row, index) => {
                const expDatum = calculateExpDatum(row.ausstDatum);
                // const daysLeft = differenceInDays(expDatum, new Date());
                // const statusColor = getStatusColor(expDatum, row.behStatusNumerator > 0, row.ausstDatum);

                // Generate VO Status with color coding
                const originalIndex = dummyTableData.findIndex(originalRow => originalRow.voNr === row.voNr);
                const voStatus = getVoStatus(originalIndex);
                
                const getStatusColor = (status: string) => {
                  switch (status) {
                    case 'Aktiv': return 'bg-green-100 text-green-800';
                    case 'Bereit': return 'bg-yellow-100 text-yellow-800';
                    case 'Abgerechnet': return 'bg-blue-100 text-blue-800';
                    case 'Expired': return 'bg-orange-100 text-orange-800';
                    default: return 'bg-gray-100 text-gray-800';
                  }
                };

                return (
                  <tr key={`${row.voNr}-${index}`} className="hover:bg-gray-50"> 
                    <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-900">{row.patName}</td> 
                    {/* Added Heilmittel cell - needs data */}
                    <td className="px-4 py-3 whitespace-nowrap text-gray-500">{row.heilmittel ?? 'N/A'}</td> 
                    <td className="px-4 py-3 whitespace-nowrap text-gray-500">{row.einrichtung ?? 'N/A'}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-500">{row.therapeut}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-500">{row.voNr}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-500">{format(row.ausstDatum, 'dd.MM.yyyy')}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-500">{formatBehStatus(row.behStatusNumerator, row.behStatusDenominator)}</td>
                    {/* Removed Exp. Datum, Days Left, Actions cells. Added Arzt cell */}
                    {/* <td className="px-4 py-3 whitespace-nowrap text-gray-500">{format(expDatum, 'dd.MM.yyyy')}</td> */}                  
                    {/* <td className={`px-4 py-3 whitespace-nowrap font-medium ${statusColor}`}>{daysLeft}</td> */}
                    <td className="px-4 py-3 whitespace-nowrap text-gray-500">{row.arzt ?? 'N/A'}</td> {/* Added Arzt cell - needs data */} 
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(voStatus)}`}>
                        {voStatus}
                      </span>
                    </td>
                    {/* <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-800">Edit</button>
                      <button className="text-red-600 hover:text-red-800 ml-2">Delete</button>
                    </td> */}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const tabLabelsOriginal = {
    'FVO_BESTELLEN': 'F.-VO Bestellen',
    'FVO_BESTELLT': 'F.-VO Bestellt',
    'FVO_ERHALTEN': 'F.-VO Erhalten',
    'FERTIG_BEHANDELT': 'Fertig Behandelt',
    'ALL_VOS': 'All VOs',
    'CLEAN_UP': 'Clean Up',
  };

  // Generate counts for tabs (using full dummyTableData before any UI filters are applied for these specific tab counts)
  const fvoBestellenCount = 123; // Dummy
  const fvoBestelltCount = 245;  // Dummy
  const fvoErhaltenCount = 381; // Dummy
  const fertigBehandeltCount = 176; // Dummy
  const allVosTotalCount = dummyTableData.length; // Actual count for All VOs tab
  const cleanUpNotStartedCount = dummyTableData.filter(row => row.behStatusNumerator === 0).length;

  const tabDisplayNames = [
    `${tabLabelsOriginal.FVO_BESTELLEN} (${fvoBestellenCount})`,
    `${tabLabelsOriginal.FVO_BESTELLT} (${fvoBestelltCount})`,
    `${tabLabelsOriginal.FVO_ERHALTEN} (${fvoErhaltenCount})`,
    `${tabLabelsOriginal.FERTIG_BEHANDELT} (${fertigBehandeltCount})`,
    `${tabLabelsOriginal.ALL_VOS} (${allVosTotalCount})`,
    `${tabLabelsOriginal.CLEAN_UP} (${cleanUpNotStartedCount})`,
  ];

  // Use the Clean Up tab label with its count as the initial active tab identifier
  const initialActiveTabLabel = `${tabLabelsOriginal.CLEAN_UP} (${cleanUpNotStartedCount})`;
  const [activeTab, setActiveTab] = useState<string>(initialActiveTabLabel);

  return (
    <div className="p-6 md:p-8 bg-[#f7f8fa] min-h-screen font-sans">
      {/* Header Section */}
      <header className="mb-6">
        <p className="text-sm text-gray-500">Hello Super Admin, I hope you have a wonderful day.</p>
        <h1 className="text-3xl font-bold text-[#1d2d3a]">Dashboard - Verwaltung</h1>
      </header>

      {/* New Top Filters Row - MOVED ECH, Therapist, Clear All Filters here + VO Status */}
      <div className="flex flex-wrap items-center justify-end space-x-3 gap-2 mb-6">
        {/* VO Status (Static Placeholder) */}
        <div className="bg-white px-4 py-2 rounded-md border border-gray-300 text-sm text-gray-700 whitespace-nowrap h-10 flex items-center">
          VO Status <span className="ml-1">▼</span>
        </div>



        {/* Therapist Filter */}
        <div className="relative">
          <button
            onClick={() => setIsTherapistOpen(!isTherapistOpen)}
            className="h-10 min-w-[180px] border border-gray-300 rounded bg-white flex items-center justify-between px-3 text-left text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          >
            {selectedTherapist ?? 'Select therapist...'}
            <span className="text-xs ml-2">▼</span>
          </button>
          {isTherapistOpen && (
            <div className="absolute z-20 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
               <input type="text" placeholder="Search Therapist..." className="w-full px-2 py-1 border-b border-gray-200 focus:outline-none text-xs"/>
               <ul className="overflow-auto py-1 max-h-48">
                <li onClick={() => handleTherapistSelect(null)} className="text-gray-500 italic cursor-pointer select-none relative py-1 pl-3 pr-9 hover:bg-gray-100 text-xs">All Therapists</li>
                {uniqueTherapistOptions.map(therapist => (
                  <li key={therapist} onClick={() => handleTherapistSelect(therapist)} className="text-gray-900 cursor-pointer select-none relative py-1 pl-3 pr-9 hover:bg-gray-100 text-xs">
                    {therapist}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        {/* Clear All Filters Button */}
        <button 
          onClick={handleClearAllFilters}
          className="px-3 py-2 text-xs font-medium text-gray-600 bg-gray-200 rounded hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-500 h-10 flex items-center"
        >
          Clear All Filters
        </button>
      </div>

      {/* KPI Cards Container - REMOVED */}
      {/* <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full mb-6"> ... KPI cards were here ... </div> */}

      {/* Tab Navigation Container */}
      <div className="mb-6">
        <nav className="flex space-x-1 border-b border-gray-300">
          {tabDisplayNames.map((label) => { // Iterate over tabDisplayNames
            const isActive = label === activeTab;
            // No longer need isAllVOs special check for styling here, treat all inactive tabs the same
            return (
              <button
                key={label}
                onClick={() => {
                  // Only allow switching to the "Clean Up" tab for demo purposes
                  if (label === initialActiveTabLabel) { 
                    setActiveTab(label);
                  }
                }}
                className={`pb-3 px-6 -mb-px text-sm focus:outline-none font-medium
                  ${
                    isActive
                      ? 'border-b-2 border-[#007bff] text-[#007bff]'
                      // All inactive tabs now get the same styling
                      : 'text-gray-500 border-b-2 border-transparent hover:text-gray-700 hover:border-gray-400 font-normal'
                  }
                  ${label !== initialActiveTabLabel ? 'cursor-not-allowed opacity-70' : ''} // Style for disabled appearance
                `}
                disabled={label !== initialActiveTabLabel} // Disable all tabs except Clean Up
              >
                {label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content Area */}
      <div className="mt-6">
        {activeTab === initialActiveTabLabel && CleanUpDashboardContent} 
      </div>
    </div>
  );
} 