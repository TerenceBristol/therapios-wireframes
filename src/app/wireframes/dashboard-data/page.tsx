'use client';

import React, { useState, useMemo } from 'react';
import WireframeLayout from '@/components/WireframeLayout';

// Use the same type definitions as the KPI dashboard
type KpiType = 'Revenue' | 'Currently Active VOs' | 'Time Spent in Treatments' | 'Revenue/Hour' | 'Number of Treatments';
type ViewType = 'Daily' | 'Weekly' | 'Monthly';

type BasicTherapist = {
  id: number;
  name: string;
  data: {
    [kpiType in KpiType]: {
      dailyData: { [key: string]: number | null };
      weeklyData: { [key: string]: number | null };
      monthlyData: { [key: string]: number | null };
    }
  };
};

// Helper function to get week range string (Sun-Sat) from a date - copied from KPI dashboard
const getWeekRangeString = (date: Date): string => {
  const currentDay = date.getDay(); // 0 for Sunday, 6 for Saturday
  const diffToSunday = currentDay; // Days to subtract to get Sunday
  const diffToSaturday = 6 - currentDay; // Days to add to get Saturday

  const sunday = new Date(date);
  sunday.setDate(date.getDate() - diffToSunday);

  const saturday = new Date(date);
  saturday.setDate(date.getDate() + diffToSaturday);

  const formatOptions: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  const sundayStr = sunday.toLocaleDateString('en-US', formatOptions);
  const saturdayStr = saturday.toLocaleDateString('en-US', formatOptions);

  return `${sundayStr} - ${saturdayStr}`;
};

export default function DashboardDataPage() {
  // State for filtering
  const [selectedView, setSelectedView] = useState<ViewType>('Monthly');
  const [selectedKpi, setSelectedKpi] = useState<KpiType>('Revenue');
  const [selectedTherapistId, setSelectedTherapistId] = useState<number | null>(null);

  // Generate all possible dates from Jan 1 to Mar 31 - copied and adapted from KPI dashboard
  const generateAllDates = (): { dailyDates: string[], weeklyDates: string[], monthlyDates: string[] } => {
    const dailyDates: string[] = [];
    const monthlyDates: string[] = ['Jan 2025', 'Feb 2025', 'Mar 2025'];

    // Generate daily dates
    const startDate = new Date('2025-01-01');
    const endDate = new Date('2025-03-31');

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const month = d.toLocaleString('en-US', { month: 'short' });
      const day = d.getDate();
      dailyDates.push(`${month} ${day}`);
    }

    // Weekly date generation
    const weekMap = new Map<string, Date>(); // To store first date (Sunday) per week for sorting
    const weekSet = new Set<string>();

    dailyDates.forEach((dateStr: string) => {
      const [month, day] = dateStr.split(' ');
      const monthIndex = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].indexOf(month);
      if (monthIndex !== -1) {
        const date = new Date(2025, monthIndex, parseInt(day));
        const weekString = getWeekRangeString(date);
        if (!weekMap.has(weekString)) {
          // Store the Sunday date for sorting
          const currentDay = date.getDay();
          const sundayDate = new Date(date);
          sundayDate.setDate(date.getDate() - currentDay);
          weekMap.set(weekString, sundayDate);
        }
        weekSet.add(weekString);
      }
    });

    // Convert set to array and sort chronologically using the Sunday date of each week
    const weeklyDates = Array.from(weekSet).sort((a, b) => {
      const dateA = weekMap.get(a);
      const dateB = weekMap.get(b);
      if (!dateA || !dateB) return 0;
      return dateA.getTime() - dateB.getTime();
    });

    return { dailyDates, weeklyDates, monthlyDates };
  };
  
  const { dailyDates, weeklyDates, monthlyDates } = generateAllDates();

  // Generate therapist data - copied and adapted from KPI dashboard
  const generateTherapistData = (): BasicTherapist[] => {
    const names = [
      'Andreas Rosky', 
      'Anika Keupp', 
      'Anne Portier', 
      'Christian Latzke', 
      'Dinah-Marie Kirchhoff', 
      'Fiona Becker', 
      'Franziska Sommer'
    ];
    
    return names.map((name, idx) => {
      // Initialize data structure for all KPI types
      const data: {
        [kpiType in KpiType]: {
          dailyData: { [key: string]: number | null };
          weeklyData: { [key: string]: number | null };
          monthlyData: { [key: string]: number | null };
        }
      } = {
        'Revenue': {
          dailyData: {},
          weeklyData: {},
          monthlyData: {}
        },
        'Currently Active VOs': {
          dailyData: {},
          weeklyData: {},
          monthlyData: {}
        },
        'Time Spent in Treatments': {
          dailyData: {},
          weeklyData: {},
          monthlyData: {}
        },
        'Revenue/Hour': {
          dailyData: {},
          weeklyData: {},
          monthlyData: {}
        },
        'Number of Treatments': {
          dailyData: {},
          weeklyData: {},
          monthlyData: {}
        }
      };
      
      // Generate data based on KPI type
      const generateValue = (date: string, kpiType: KpiType, viewType: 'daily' | 'weekly' | 'monthly') => {
        // Use a deterministic seed based on therapist, date and KPI for consistency
        const seed = `${name}-${date}-${kpiType}-${viewType}`;
        const randomValue = hashStringToFloat(seed);
        
        // 20% chance of null (day off)
        if (randomValue < 0.2) return null;
        
        // Scale factors for different view types
        const dayScaleFactor = viewType === 'daily' ? 1 : 
                            viewType === 'weekly' ? 5 : 
                            22; // monthly (average business days in a month)
        
        // Base calculations for a therapist's daily work
        // Each therapist does 6-12 treatments per day (30 min each)
        const baseTreatmentsPerDay = Math.floor(hashStringToFloat(seed + '1') * 7) + 6; 
        const baseTreatmentHours = baseTreatmentsPerDay * 0.5; // 3-6 hours of treatments
        const baseRevenue = baseTreatmentHours * 100; // 100€ per hour
        
        // Add some variation (±15%)
        const randomFactor = 0.85 + (hashStringToFloat(seed + '2') * 0.3); // 0.85 to 1.15
        
        switch (kpiType) {
          case 'Revenue':
            // Daily: €300-600, Weekly: €1500-3000, Monthly: €6600-13200
            return Math.round(baseRevenue * dayScaleFactor * randomFactor);
          case 'Currently Active VOs':
            // Active cases per therapist (not directly tied to treatments)
            return Math.floor(hashStringToFloat(seed + '3') * 3) + 8; // 8-10 active cases
          case 'Time Spent in Treatments':
            // Daily: 3-6 hours, Weekly: 15-30 hours, Monthly: 66-132 hours
            return Math.round(baseTreatmentHours * dayScaleFactor * randomFactor);
          case 'Revenue/Hour':
            // Should be close to 100€/hour with some variation
            return Math.round((90 + hashStringToFloat(seed + '4') * 20)); // 90-110€/hour
          case 'Number of Treatments':
            // Daily: 6-12, Weekly: 30-60, Monthly: 132-264
            return Math.round(baseTreatmentsPerDay * dayScaleFactor * randomFactor);
          default:
            return Math.round(baseRevenue * dayScaleFactor * randomFactor);
        }
      };
      
      // Helper function to generate deterministic "random" values based on a string
      function hashStringToFloat(str: string): number {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
          hash = ((hash << 5) - hash) + str.charCodeAt(i);
          hash |= 0; // Convert to 32bit integer
        }
        // Get a value between 0 and 1
        return Math.abs((hash % 1000) / 1000);
      }
      
      // Generate data for all KPI types
      const kpiTypes: KpiType[] = ['Revenue', 'Currently Active VOs', 'Time Spent in Treatments', 'Revenue/Hour', 'Number of Treatments'];
      
      kpiTypes.forEach(kpiType => {
        // Fill daily data
        dailyDates.forEach((date: string) => {
          data[kpiType].dailyData[date] = generateValue(date, kpiType, 'daily');
        });
        
        // Fill weekly data
        weeklyDates.forEach((week: string) => {
          data[kpiType].weeklyData[week] = generateValue(week, kpiType, 'weekly');
        });
        
        // Fill monthly data
        monthlyDates.forEach((month: string) => {
          data[kpiType].monthlyData[month] = generateValue(month, kpiType, 'monthly');
        });
      });
      
      return {
        id: idx + 1,
        name,
        data
      };
    });
  };

  // Generate therapist data - memoize to maintain consistent data
  const therapists = useMemo(() => generateTherapistData(), []);
  
  // Format value based on KPI type
  const formatValue = (value: number | null, kpiType: KpiType): string => {
    if (value === null) return '-';
    
    switch (kpiType) {
      case 'Revenue':
        return `€${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      case 'Currently Active VOs':
        return `${value}`;
      case 'Time Spent in Treatments':
        return `${value} hrs`;
      case 'Revenue/Hour':
        return `€${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/h`;
      case 'Number of Treatments':
        return `${value}`;
      default:
        return `${value}`;
    }
  };
  
  // Get the dates to display based on the selected view
  const getDates = (): string[] => {
    switch (selectedView) {
      case 'Daily':
        return dailyDates;
      case 'Weekly':
        return weeklyDates;
      case 'Monthly':
        return monthlyDates;
      default:
        return [];
    }
  };
  
  // Get the therapists to display
  const getTherapistsToDisplay = (): BasicTherapist[] => {
    if (selectedTherapistId === null) {
      return therapists;
    }
    return therapists.filter(t => t.id === selectedTherapistId);
  };
  
  // Calculate sums for each column
  const calculateSums = (): (number | null)[] => {
    const dates = getDates();
    
    return dates.map(date => {
      const values = getTherapistsToDisplay().map(therapist => {
        const dataMap = selectedView === 'Daily' 
          ? therapist.data[selectedKpi].dailyData 
          : selectedView === 'Weekly' 
            ? therapist.data[selectedKpi].weeklyData 
            : therapist.data[selectedKpi].monthlyData;
        return dataMap[date];
      }).filter(v => v !== null) as number[];
      
      return values.length > 0 ? values.reduce((sum, val) => sum + val, 0) : null;
    });
  };
  
  const dates = getDates();
  const therapistsToDisplay = getTherapistsToDisplay();
  const columnSums = calculateSums();
  
  // Calculate average for each therapist
  const calculateTherapistAverage = (therapist: BasicTherapist): number => {
    const dataMap = selectedView === 'Daily' 
      ? therapist.data[selectedKpi].dailyData 
      : selectedView === 'Weekly' 
        ? therapist.data[selectedKpi].weeklyData 
        : therapist.data[selectedKpi].monthlyData;
    
    const values = dates.map(date => dataMap[date]).filter(v => v !== null) as number[];
    return values.length > 0 ? parseFloat((values.reduce((sum, val) => sum + val, 0) / values.length).toFixed(1)) : 0;
  };
  
  // Calculate total for each therapist
  const calculateTherapistTotal = (therapist: BasicTherapist): number => {
    const dataMap = selectedView === 'Daily' 
      ? therapist.data[selectedKpi].dailyData 
      : selectedView === 'Weekly' 
        ? therapist.data[selectedKpi].weeklyData 
        : therapist.data[selectedKpi].monthlyData;
    
    const values = dates.map(date => dataMap[date]).filter(v => v !== null) as number[];
    return values.reduce((sum, val) => sum + val, 0);
  };

  return (
    <WireframeLayout title="Therapios" username="User Therapist" userInitials="UT">
      <div className="max-w-[1200px] mx-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Dashboard Raw Data</h1>
            <a href="/wireframes/kpi-dashboard" className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to KPI Dashboard
            </a>
          </div>
          
          <div className="mb-6 bg-white p-4 border border-gray-200 rounded-lg shadow-sm">
            <p className="text-gray-700 mb-4">
              This page shows the raw data used to generate the KPI Dashboard visualizations. 
              Use the filters below to view specific KPIs, time granularity, and therapists.
            </p>
            
            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {/* KPI Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">KPI Type</label>
                <select 
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                  value={selectedKpi}
                  onChange={(e) => setSelectedKpi(e.target.value as KpiType)}
                >
                  <option value="Revenue">Revenue</option>
                  <option value="Currently Active VOs">Currently Active VOs</option>
                  <option value="Time Spent in Treatments">Time Spent in Treatments</option>
                  <option value="Revenue/Hour">Revenue/Hour</option>
                  <option value="Number of Treatments">Number of Treatments</option>
                </select>
              </div>
              
              {/* View Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time Granularity</label>
                <div className="flex space-x-2">
                  <button 
                    className={`flex-1 py-2 px-3 text-sm font-medium rounded-md ${selectedView === 'Daily' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
                    onClick={() => setSelectedView('Daily')}
                  >
                    Daily
                  </button>
                  <button 
                    className={`flex-1 py-2 px-3 text-sm font-medium rounded-md ${selectedView === 'Weekly' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
                    onClick={() => setSelectedView('Weekly')}
                  >
                    Weekly
                  </button>
                  <button 
                    className={`flex-1 py-2 px-3 text-sm font-medium rounded-md ${selectedView === 'Monthly' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
                    onClick={() => setSelectedView('Monthly')}
                  >
                    Monthly
                  </button>
                </div>
              </div>
              
              {/* Therapist Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Therapist</label>
                <select 
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                  value={selectedTherapistId || ''}
                  onChange={(e) => setSelectedTherapistId(e.target.value ? parseInt(e.target.value) : null)}
                >
                  <option value="">All Therapists</option>
                  {therapists.map(therapist => (
                    <option key={therapist.id} value={therapist.id}>
                      {therapist.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          
          {/* Data Table */}
          <div className="bg-white border border-gray-200 rounded-md shadow-sm overflow-hidden">
            <div style={{ overflowX: 'auto', width: '100%', overflowY: 'auto', maxHeight: 'calc(100vh - 280px)' }}>
              <table className="w-full border-separate border-spacing-0">
                <thead>
                  <tr>
                    <th 
                      className="sticky left-0 top-0 z-40 bg-gray-50 border-b border-r border-gray-200 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      style={{ width: '160px', minWidth: '160px' }}
                    >
                      Therapist
                    </th>
                    
                    {dates.map((date, index) => (
                      <th 
                        key={index} 
                        className="sticky top-0 z-30 bg-gray-50 border-b border-gray-200 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap min-w-[96px]"
                      >
                        {date}
                      </th>
                    ))}
                    
                    <th 
                      className="sticky top-0 z-30 bg-blue-50 border-b border-blue-200 px-4 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider whitespace-nowrap min-w-[112px]"
                    >
                      Average
                    </th>
                    
                    <th 
                      className="sticky top-0 z-30 bg-green-50 border-b border-green-200 px-4 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider whitespace-nowrap min-w-[112px]"
                    >
                      Total
                    </th>
                  </tr>
                </thead>
                
                <tbody>
                  {therapistsToDisplay.map((therapist, index) => {
                    const bgColor = index % 2 === 1 ? 'bg-gray-50' : 'bg-white';
                    
                    return (
                      <tr key={`data-${therapist.id}`} className={bgColor}>
                        <td 
                          className={`sticky left-0 z-20 ${bgColor} px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 border-r border-gray-200 border-b border-gray-200`}
                        >
                          {therapist.name}
                        </td>
                        
                        {dates.map((date, dateIndex) => {
                          const dataMap = selectedView === 'Daily' 
                            ? therapist.data[selectedKpi].dailyData 
                            : selectedView === 'Weekly' 
                              ? therapist.data[selectedKpi].weeklyData 
                              : therapist.data[selectedKpi].monthlyData;
                          const value = dataMap[date];
                          
                          return (
                            <td 
                              key={`cell-${dateIndex}`}
                              className={`
                                border-b border-gray-200 px-4 py-3 text-sm
                                ${value === null ? 'text-gray-400 italic' : 'text-gray-900'}
                              `}
                            >
                              {formatValue(value, selectedKpi)}
                            </td>
                          );
                        })}
                        
                        <td className="border-b border-blue-200 bg-blue-50 text-blue-700 px-4 py-3 text-right text-sm font-medium whitespace-nowrap">
                          {formatValue(calculateTherapistAverage(therapist), selectedKpi)}
                        </td>
                        
                        <td className="border-b border-green-200 bg-green-50 text-green-700 px-4 py-3 text-right text-sm font-medium whitespace-nowrap">
                          {formatValue(calculateTherapistTotal(therapist), selectedKpi)}
                        </td>
                      </tr>
                    );
                  })}
                  
                  {/* Summary Row */}
                  <tr className="bg-gray-700 text-white">
                    <td className="sticky left-0 z-20 px-4 py-3 whitespace-nowrap text-sm font-medium bg-gray-700 text-white border-r border-gray-600">
                      Sum
                    </td>
                    
                    {columnSums.map((value, valueIndex) => (
                      <td key={valueIndex} className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                        {formatValue(value, selectedKpi)}
                      </td>
                    ))}
                    
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium bg-blue-600">
                      {formatValue(
                        columnSums.filter(v => v !== null).length > 0 
                          ? parseFloat((columnSums.filter(v => v !== null).reduce((sum, val) => sum! + val!, 0)! / columnSums.filter(v => v !== null).length).toFixed(1)) 
                          : null, 
                        selectedKpi
                      )}
                    </td>
                    
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium bg-green-600">
                      {formatValue(
                        columnSums.filter(v => v !== null).reduce((sum, val) => sum! + val!, 0),
                        selectedKpi
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </WireframeLayout>
  );
} 