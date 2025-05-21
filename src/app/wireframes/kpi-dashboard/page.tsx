'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import WireframeLayout from '@/components/WireframeLayout';
import WireframeButton from '@/components/WireframeButton';
import { format, add, startOfWeek, startOfMonth } from 'date-fns';

// MultiSelect Dropdown Component
type MultiSelectProps = {
  options: {id: number; label: string}[];
  selectedValues: number[];
  onChange: (selected: number[]) => void;
  placeholder?: string;
  className?: string;
  maxHeight?: string;
};

const MultiSelectDropdown: React.FC<MultiSelectProps> = ({
  options,
  selectedValues,
  onChange,
  placeholder = "Select options",
  className = "",
  maxHeight = "12rem"
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Toggle selection
  const toggleOption = (id: number) => {
    if (selectedValues.includes(id)) {
      onChange(selectedValues.filter(v => v !== id));
    } else {
      onChange([...selectedValues, id]);
    }
  };
  
  // Select all options
  const selectAll = () => {
    onChange(options.map(option => option.id));
  };
  
  // Clear all selections
  const clearAll = () => {
    onChange([]);
  };
  
  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div 
        className="flex items-center justify-between bg-white border border-gray-300 rounded px-3 py-1.5 text-sm cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex-1 truncate">
          {selectedValues.length === 0 
            ? placeholder 
            : selectedValues.length === 1 
              ? options.find(opt => opt.id === selectedValues[0])?.label 
              : `${selectedValues.length} selected`}
        </div>
        <svg className="w-4 h-4 ml-2" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </div>
      
      {isOpen && (
        <div className="absolute mt-1 min-w-full w-60 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-50">
          <div className="p-2 border-b border-gray-200 flex justify-between">
            <button 
              className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded border border-gray-300"
              onClick={(e) => {e.stopPropagation(); selectAll();}}
            >
              Select All
            </button>
            <button 
              className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded border border-gray-300"
              onClick={(e) => {e.stopPropagation(); clearAll();}}
            >
              Clear All
            </button>
          </div>
          
          <div className="overflow-y-auto" style={{maxHeight}}>
            {options.map(option => (
              <div
                key={option.id}
                className="flex items-center px-3 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={(e) => {e.stopPropagation(); toggleOption(option.id);}}
              >
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  checked={selectedValues.includes(option.id)}
                  onChange={() => {}} // Handled by div click
                  onClick={(e) => e.stopPropagation()}
                />
                <label className="ml-2 text-sm text-gray-700 cursor-pointer">
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Define therapist data type
type Therapist = {
  id: number;
  name: string;
  // Store data for each KPI type separately
  data: {
    [kpiType in KpiType]: {
      dailyData: {
        [key: string]: number | null;
      };
      weeklyData: {
        [key: string]: number | null;
      };
      monthlyData: {
        [key: string]: number | null;
      };
    }
  };
  // Stats for the currently active KPI
  average: number;
  change: number;
  total: number;
};

// Define basic therapist data type without calculated fields
type BasicTherapist = {
  id: number;
  name: string;
  // Store data for each KPI type separately
  data: {
    [kpiType in KpiType]: {
      dailyData: {
        [key: string]: number | null;
      };
      weeklyData: {
        [key: string]: number | null;
      };
      monthlyData: {
        [key: string]: number | null;
      };
    }
  };
};

// Define date range type
type DateRange = {
  start: string;
  end: string;
  label: string;
};

// Define KPI type for stronger typing
type KpiType = 'Revenue' | 'Time Spent in Treatments' | 'Revenue/Hour' | 'Number of Treatments';

// Define filtered data type
interface FilteredData {
  therapists: Therapist[];
  allTherapists: Therapist[];
  dailyDates: string[];
  weeklyDates: string[];
  monthlyDates: string[];
}

// Define table data type
interface TableData {
  dates: string[];
  average: string;
  highest: {
    value: string;
    date: string;
  };
  lowest: {
    value: string;
    date: string;
  };
  total: string;
  summary: {
    values: (number | null)[];
    average: number;
    change: number;
    total: number;
  };
}

// Helper function to get week range string (Sun-Sat) from a date
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

  // Handle cases where week spans across year end/start if needed (simplified for now)
  return `${sundayStr} - ${saturdayStr}`;
};

// Helper function to calculate "nice" tick values for an axis
const calculateAxisTicks = (minValue: number, maxValue: number, numTicks: number = 5): number[] => {
  if (minValue === maxValue) {
    // Handle case with no range: maybe center the value or show +/- range
    return [minValue];
  }
  const range = maxValue - minValue;
  if (range === 0) return [minValue]; // Or handle as above

  const roughTickSize = range / (numTicks - 1);
  const exponent = Math.floor(Math.log10(roughTickSize));
  const magnitude = Math.pow(10, exponent);
  const normalizedTickSize = roughTickSize / magnitude;

  let niceTickSize;
  if (normalizedTickSize > 5) {
    niceTickSize = 10 * magnitude;
  } else if (normalizedTickSize > 2) {
    niceTickSize = 5 * magnitude;
  } else if (normalizedTickSize > 1) {
    niceTickSize = 2 * magnitude;
  } else {
    niceTickSize = magnitude;
  }

  const startTick = Math.floor(minValue / niceTickSize) * niceTickSize;
  const endTick = Math.ceil(maxValue / niceTickSize) * niceTickSize;

  const ticks: number[] = [];
  for (let currentTick = startTick; currentTick <= endTick; currentTick += niceTickSize) {
    // Fix potential floating point issues
    ticks.push(parseFloat(currentTick.toPrecision(12)));
  }
  // Ensure min and max are somewhat represented if ticks are sparse
  // This logic could be refined for edge cases
  return ticks;
};

// Helper to format tick values (similar to tooltip)
const formatAxisTickValue = (value: number, kpi: KpiType): string => {
  switch(kpi) {
    case 'Revenue':
      return `€${value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
    case 'Time Spent in Treatments':
      return `${value} hrs`;
    case 'Revenue/Hour':
      return `€${value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}/h`;
    case 'Number of Treatments':
      return `${value}`;
    default:
      return `${value}`;
  }
};

export default function KpiDashboardWireframe() {
  // State hooks for filters and data
  const [view, setView] = useState<'Daily' | 'Weekly' | 'Monthly'>('Daily');
  const [overTimeView, setOverTimeView] = useState<'Daily' | 'Weekly' | 'Monthly'>('Daily');
  const [activeKpi, setActiveKpi] = useState<KpiType>('Revenue');
  const [selectedTableTherapists, setSelectedTableTherapists] = useState<number[]>([]);
  const [selectedChartTherapists, setSelectedChartTherapists] = useState<number[]>([]);
  const [chart1XAxis, setChart1XAxis] = useState<KpiType>('Revenue');
  const [chart1YAxis, setChart1YAxis] = useState<KpiType>('Time Spent in Treatments');
  const [chart2YAxis, setChart2YAxis] = useState<KpiType>('Number of Treatments');
  const [leftChartType, setLeftChartType] = useState<'scatter' | 'bar'>('scatter');
  const [overTimeKpi, setOverTimeKpi] = useState<KpiType>('Revenue');
  const [overTimeChartType, setOverTimeChartType] = useState<'Bar Chart' | 'Line Chart'>('Bar Chart');
  const [selectedOverTimeTherapist, setSelectedOverTimeTherapist] = useState<number | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [startDate, setStartDate] = useState('2025-03-01');
  const [endDate, setEndDate] = useState('2025-03-31');
  const [selectedDateRange, setSelectedDateRange] = useState<DateRange>({
    start: '2025-03-01',
    end: '2025-03-31',
    label: 'Mar 1, 2025 - Mar 31, 2025'
  });

  // Format date for display
  const formatDateForDisplay = (dateString: string) => {
    const date = new Date(dateString);
    const month = date.toLocaleString('en-US', { month: 'short' });
    const day = date.getDate();
    const year = date.getFullYear();
    return `${month} ${day}, ${year}`;
  };

  // Apply custom date range
  const applyDateRange = () => {
    if (new Date(startDate) > new Date(endDate)) {
      // Swap dates if start is after end
      const temp = startDate;
      setStartDate(endDate);
      setEndDate(temp);
    }
    
    setSelectedDateRange({
      start: startDate,
      end: endDate,
      label: `${formatDateForDisplay(startDate)} - ${formatDateForDisplay(endDate)}`
    });
    setShowDatePicker(false);
  };

  // Set a quick date range
  const setQuickDateRange = (days: number) => {
    // Use March 31, 2025 as the reference "current" date for the simulation
    const end = new Date(2025, 2, 31); // March 31, 2025
    
    const start = new Date(end);
    start.setDate(end.getDate() - days + 1); // +1 to include the current day
    
    const formattedStart = start.toISOString().split('T')[0];
    const formattedEnd = end.toISOString().split('T')[0];
    
    setStartDate(formattedStart);
    setEndDate(formattedEnd);
    
    setSelectedDateRange({
      start: formattedStart,
      end: formattedEnd,
      label: `${formatDateForDisplay(formattedStart)} - ${formatDateForDisplay(formattedEnd)}`
    });
    
    setShowDatePicker(false);
  };

  // Set month date range
  const setMonthDateRange = (monthIndex: number, year = 2025) => {
    // Create dates for the first and last day of the month
    const start = new Date(year, monthIndex, 1);
    const end = new Date(year, monthIndex + 1, 0); // Last day of the month
    
    // Format dates in a timezone-safe way using direct string formatting
    const formattedStart = `${year}-${String(monthIndex + 1).padStart(2, '0')}-01`;
    const formattedEnd = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(end.getDate()).padStart(2, '0')}`;
    
    setStartDate(formattedStart);
    setEndDate(formattedEnd);
    
    setSelectedDateRange({
      start: formattedStart,
      end: formattedEnd,
      label: `${formatDateForDisplay(formattedStart)} - ${formatDateForDisplay(formattedEnd)}`
    });
    
    setShowDatePicker(false);
  };

  // Generate all possible dates from Jan 1 to Mar 31
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

    // --- REVISED WEEKLY DATE GENERATION ---
    const weekMap = new Map<string, Date>(); // To store first date (Sunday) per week for sorting
    const weekSet = new Set<string>();

    dailyDates.forEach((dateStr: string) => {
      const [month, day] = dateStr.split(' ');
      const monthIndex = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].indexOf(month);
      if (monthIndex !== -1) {
        const date = new Date(2025, monthIndex, parseInt(day));
        const weekString = getWeekRangeString(date); // Use the RENAMED helper
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
      // Handle cases where dates might be undefined (shouldn't happen)
      if (!dateA || !dateB) return 0;
      return dateA.getTime() - dateB.getTime();
    });
    // --- END REVISED WEEKLY DATE GENERATION ---

    return { dailyDates, weeklyDates, monthlyDates };
  };
  
  const { dailyDates: allDailyDates, weeklyDates: allWeeklyDates, monthlyDates: allMonthlyDates } = generateAllDates();

  // Mock data generator for therapists
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
      const kpiTypes: KpiType[] = ['Revenue', 'Time Spent in Treatments', 'Revenue/Hour', 'Number of Treatments'];
      
      kpiTypes.forEach(kpiType => {
        // Fill daily data
        allDailyDates.forEach((date: string) => {
          data[kpiType].dailyData[date] = generateValue(date, kpiType, 'daily');
        });
        
        // Fill weekly data
        allWeeklyDates.forEach((week: string) => {
          data[kpiType].weeklyData[week] = generateValue(week, kpiType, 'weekly');
        });
        
        // Fill monthly data
        allMonthlyDates.forEach((month: string) => {
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
  
  // Generate all therapist data - only when component mounts, not dependent on activeKpi
  const allTherapistData = useMemo(() => generateTherapistData(), []);

  // Helper functions for calculations - MOVED UP before they are used
  const calculateAverage = (values: number[]): number => {
    return values.length > 0 ? parseFloat((values.reduce((sum, val) => sum + val, 0) / values.length).toFixed(1)) : 0;
  };

  const calculateChange = (values: number[]): number => {
    if (values.length >= 2) {
      const firstValue = values[0];
      const lastValue = values[values.length - 1];
      return parseFloat((((lastValue - firstValue) / firstValue) * 100).toFixed(1));
    }
    return 0;
  };

  const calculateTotal = (values: number[]): number => {
    return values.reduce((sum, val) => sum + val, 0);
  };

  // Function to calculate values for a therapist - MOVED UP before it's used
  const getValuesForTherapist = (therapist: BasicTherapist | Therapist, dates: string[]): number[] => {
    const dataMap = view === 'Daily' ? therapist.data[activeKpi].dailyData : view === 'Weekly' ? therapist.data[activeKpi].weeklyData : therapist.data[activeKpi].monthlyData;
    return dates.map(date => dataMap[date]).filter(value => value !== null) as number[];
  };

  // Define a temporary version of getValuesForTherapistForKpi for use before filtered dates are available
  const getTempValuesForTherapistForKpi = (therapist: BasicTherapist | Therapist, kpi: KpiType): number[] => {
    const dataMap = view === 'Daily' 
      ? therapist.data[kpi].dailyData 
      : view === 'Weekly' 
        ? therapist.data[kpi].weeklyData 
        : therapist.data[kpi].monthlyData;
        
    // Use all dates since filtered ones aren't available yet
    const dates = view === 'Daily' 
      ? allDailyDates 
      : view === 'Weekly' 
        ? allWeeklyDates 
        : allMonthlyDates;
        
    return dates.map(date => dataMap[date]).filter(value => value !== null) as number[];
  };

  // Filter data by date range
  const filterDataByDateRange = (): FilteredData => {
    // Filter dates based on selected date range
    // Set time to start of day for startDate and end of day for endDate to ensure full day inclusion
    const startDate = new Date(selectedDateRange.start);
    startDate.setHours(0, 0, 0, 0); // Set to start of day
    
    const endDate = new Date(selectedDateRange.end);
    endDate.setHours(23, 59, 59, 999); // Set to end of day
    
    // For daily data
    const filteredDailyDates = allDailyDates.filter((dateStr) => {
      // Extract month and day
      const [month, day] = dateStr.split(' ');
      
      // Create a date object for comparison (using 2025 as the year)
      const monthIndex = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].indexOf(month);
      // Add a check for valid monthIndex
      if (monthIndex === -1) return false;
      
      // Create the date at noon to avoid timezone issues
      const date = new Date(2025, monthIndex, parseInt(day), 12, 0, 0); 
      
      // Check if the date is within range
      return date >= startDate && date <= endDate;
    });
    
    // --- IMPROVED LOGIC FOR WEEKLY DATES ---
    // A week is included if any day of the week falls within the selected date range
    const filteredWeeklyDates = allWeeklyDates.filter(weekStr => {
      // Extract date ranges from the week string (e.g., "Jan 5 - Jan 11")
      const [startStr, endStr] = weekStr.split(' - ');
      
      // Parse start date of the week
      const [startMonth, startDay] = startStr.split(' ');
      const startMonthIndex = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].indexOf(startMonth);
      
      // Parse end date of the week
      const [endMonth, endDay] = endStr.split(' ');
      const endMonthIndex = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].indexOf(endMonth);
      
      if (startMonthIndex === -1 || endMonthIndex === -1) return false;
      
      // Set time to noon to avoid timezone issues
      const weekStart = new Date(2025, startMonthIndex, parseInt(startDay), 12, 0, 0);
      const weekEnd = new Date(2025, endMonthIndex, parseInt(endDay), 12, 0, 0);
      
      // Check if the week overlaps with selected date range
      // (weekStart <= endDate) && (weekEnd >= startDate)
      return weekStart <= endDate && weekEnd >= startDate;
    });
    // --- END IMPROVED LOGIC ---
    
    // For monthly data
    const filteredMonthlyDates = allMonthlyDates.filter((dateStr) => {
      const [month, year] = dateStr.split(' ');
      const monthIndex = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].indexOf(month);
      
      // Create date objects for the start and end of the month with noon time to avoid timezone issues
      const monthStart = new Date(parseInt(year), monthIndex, 1, 12, 0, 0);
      const monthEnd = new Date(parseInt(year), monthIndex + 1, 0, 12, 0, 0); // Last day of the month
      
      // Check if any part of the month overlaps with the date range
      return (monthStart <= endDate && monthEnd >= startDate);
    });
    
    // Calculate statistics for all therapists (for executive summary and charts)
    const allTherapistsWithStats = allTherapistData.map(therapist => {
      const values = getTempValuesForTherapistForKpi(therapist, activeKpi);
      return {
        ...therapist,
        average: calculateAverage(values),
        change: calculateChange(values),
        total: calculateTotal(values)
      };
    });
    
    // Filter therapists based on selectedTherapist (only for detailed table view)
    let filteredTherapistsForTable = allTherapistsWithStats;
    if (selectedTableTherapists.length > 0) {
      filteredTherapistsForTable = allTherapistsWithStats.filter(therapist => selectedTableTherapists.includes(therapist.id));
    }
    
    return {
      therapists: filteredTherapistsForTable as Therapist[],
      allTherapists: allTherapistsWithStats as Therapist[],
      dailyDates: filteredDailyDates,
      weeklyDates: filteredWeeklyDates,
      monthlyDates: filteredMonthlyDates
    };
  };
  
  // Get filtered data
  const { therapists, allTherapists, dailyDates, weeklyDates, monthlyDates } = filterDataByDateRange();
  
  // Function to calculate values for a therapist for a specific KPI
  const getValuesForTherapistForKpi = (therapist: BasicTherapist | Therapist, kpi: KpiType): number[] => {
    const dataMap = view === 'Daily' 
      ? therapist.data[kpi].dailyData 
      : view === 'Weekly' 
        ? therapist.data[kpi].weeklyData 
        : therapist.data[kpi].monthlyData;
        
    // Use filtered dates based on the selected date range
    const dates = view === 'Daily' 
      ? dailyDates 
      : view === 'Weekly' 
        ? weeklyDates 
        : monthlyDates;
        
    return dates.map(date => dataMap[date]).filter(value => value !== null) as number[];
  };

  // Special version for charts that uses the same view as the rest of the dashboard and respects date range
  const getChartValuesForTherapistForKpi = (therapist: BasicTherapist | Therapist, kpi: KpiType): number[] => {
    const dataMap = view === 'Daily' 
      ? therapist.data[kpi].dailyData 
      : view === 'Weekly' 
        ? therapist.data[kpi].weeklyData 
        : therapist.data[kpi].monthlyData;
    
    // Use filtered dates based on the selected date range
    const dates = view === 'Daily' 
      ? dailyDates 
      : view === 'Weekly' 
        ? weeklyDates 
        : monthlyDates;
    
    return dates.map(date => dataMap[date]).filter(value => value !== null) as number[];
  };
  
  // New function that returns KPI data for charts independent of the selected view
  const getChartValuesIndependentOfView = (therapist: BasicTherapist | Therapist, kpi: KpiType): number[] => {
    // Always use daily data for maximum granularity in charts
    const dataMap = therapist.data[kpi].dailyData;
    
    // Use daily dates from the filtered date range
    return dailyDates.map(date => dataMap[date]).filter(value => value !== null) as number[];
  };
  
  // New function to get daily values for executive summary calculations
  // This ensures executive summary is always calculated at daily granularity regardless of selected view
  const getDailyValuesForTherapistForKpi = (therapist: BasicTherapist | Therapist, kpi: KpiType): number[] => {
    // Always use daily data for executive summary
    const dataMap = therapist.data[kpi].dailyData;
    
    // Use daily dates from the filtered date range
    return dailyDates.map(date => dataMap[date]).filter(value => value !== null) as number[];
  };
  
  // Calculate summary data
  const calculateSummaryData = () => {
    // If no therapists are selected, return empty data
    if (therapists.length === 0) {
      return {
        values: [],
        average: 0,
        change: 0,
        total: 0
      };
    }
    
    // Get dates for the current view
    const dates = view === 'Daily' ? dailyDates : view === 'Weekly' ? weeklyDates : monthlyDates;
    
    // Calculate sum for each date across all therapists
    const summaryValues = dates.map(date => {
      const values = therapists.map(therapist => {
        const dataMap = view === 'Daily' 
          ? therapist.data[activeKpi].dailyData 
          : view === 'Weekly' 
            ? therapist.data[activeKpi].weeklyData 
            : therapist.data[activeKpi].monthlyData;
        return dataMap[date] || null;
      }).filter(v => v !== null) as number[];
      
      return values.length > 0 ? values.reduce((sum, val) => sum + val, 0) : null;
    });
    
    const nonNullValues = summaryValues.filter(v => v !== null) as number[];
    
    // Calculate the daily average (average of daily sums)
    const dailyAverage = calculateAverage(nonNullValues);
    
    // Calculate total (sum of all values)
    const total = calculateTotal(nonNullValues);
    
    // For the summary average, we need the SUM of all therapist averages
    // This is different from the average of the daily sums
    const therapistAverages = therapists.map(therapist => {
      const therapistValues = getValuesForTherapistForKpi(therapist, activeKpi);
      return calculateAverage(therapistValues);
    }).filter(avg => !isNaN(avg) && avg !== 0);
    
    // Sum of all therapist averages
    const summaryAverage = therapistAverages.length > 0 
      ? therapistAverages.reduce((sum, avg) => sum + avg, 0) 
      : 0;
    
    const change = calculateChange(nonNullValues);
    
    return { 
      values: summaryValues, 
      average: summaryAverage,
      change, 
      total 
    };
  };
  
  const summaryData = calculateSummaryData();

  // Format value based on KPI type
  const formatValue = (value: number | null) => {
    if (value === null) return '—';
    
    switch (activeKpi) {
      case 'Revenue':
        return `€${value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
      case 'Time Spent in Treatments':
        return `${value} hrs`;
      case 'Revenue/Hour':
        return `€${value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}/h`;
      case 'Number of Treatments':
        return `${value}`;
      default:
        return `${value}`;
    }
  };

  // Format summary value based on KPI type
  const formatSummaryValue = (value: number | null) => {
    if (value === null) return '-';
    
    switch (activeKpi) {
      case 'Revenue':
        return `€${value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
      case 'Time Spent in Treatments':
        return `${value} hrs`;
      case 'Revenue/Hour':
        return `€${value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}/h`;
      case 'Number of Treatments':
        return `${value}`;
      default:
        return `${value}`;
    }
  };

  // Calculate overview data
  const calculateOverviewData = () => {
    // Get all non-null values for the current view and date range
    const allValues: number[] = [];
    
    allTherapists.forEach(therapist => {
      const dates = view === 'Daily' ? dailyDates : view === 'Weekly' ? weeklyDates : monthlyDates;
      const dataMap = view === 'Daily' 
        ? therapist.data[activeKpi].dailyData 
        : view === 'Weekly' 
          ? therapist.data[activeKpi].weeklyData 
          : therapist.data[activeKpi].monthlyData;
      
      dates.forEach(date => {
        const value = dataMap[date];
        if (value !== null) {
          allValues.push(value);
        }
      });
    });
    
    // Calculate average, highest, lowest, and total
    const average = allValues.length > 0 
      ? allValues.reduce((sum, val) => sum + val, 0) / allValues.length
      : 0;
    
    // Find highest and lowest with their dates
    let highest = { value: 0, date: '' };
    let lowest = { value: Infinity, date: '' };
    
    if (allValues.length > 0) {
      const dates = view === 'Daily' ? dailyDates : view === 'Weekly' ? weeklyDates : monthlyDates;
      
      dates.forEach(date => {
        allTherapists.forEach(therapist => {
          const dataMap = view === 'Daily' 
            ? therapist.data[activeKpi].dailyData 
            : view === 'Weekly' 
              ? therapist.data[activeKpi].weeklyData 
              : therapist.data[activeKpi].monthlyData;
          const value = dataMap[date];
          
          if (value !== null) {
            if (value > highest.value) {
              highest = { value, date };
            }
            if (value < lowest.value) {
              lowest = { value, date };
            }
          }
        });
      });
    }
    
    // If no values found, set lowest to 0
    if (lowest.value === Infinity) {
      lowest = { value: 0, date: '' };
    }
    
    // Calculate total
    const total = allValues.reduce((sum, val) => sum + val, 0);
    
    // Format values based on KPI type
    const formatOverviewValue = (value: number) => {
      switch (activeKpi) {
        case 'Revenue':
          return `€${value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
        case 'Time Spent in Treatments':
          return `${Math.round(value)} hrs`;
        case 'Revenue/Hour':
          return `€${value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}/h`;
        case 'Number of Treatments':
          return `${Math.round(value)}`;
        default:
          return `${value}`;
      }
    };
    
    return {
      average: formatOverviewValue(average),
      highest: { 
        value: formatOverviewValue(highest.value), 
        date: highest.date 
      },
      lowest: { 
        value: formatOverviewValue(lowest.value), 
        date: lowest.date 
      },
      total: formatOverviewValue(total)
    };
  };
  
  const overviewData = calculateOverviewData();

  // Get table data based on current view
  const getTableData = () => {
    return {
      dates: view === 'Daily' ? dailyDates : view === 'Weekly' ? weeklyDates : monthlyDates,
      average: overviewData.average,
      highest: overviewData.highest,
      lowest: overviewData.lowest,
      total: overviewData.total,
      summary: summaryData
    };
  };

  const tableData = getTableData();

  // Calculate KPI values for executive summary using useMemo to make it reactive to date range changes
  const executiveSummary = useMemo(() => {
    // Create a function to get total/average value for each KPI type based on the current date range and view
    const getKpiTotal = (kpiType: KpiType, useAverage: boolean = false): string => {
      // Temporarily switch activeKpi to desired KPI to use existing calculation logic
      const originalKpi = activeKpi;
      const kpiValues: {[key in KpiType]: string} = {} as {[key in KpiType]: string};
      
      // For each KPI, calculate the appropriate value and format it
      (['Revenue', 'Time Spent in Treatments', 'Revenue/Hour', 'Number of Treatments'] as KpiType[]).forEach(kpi => {
        // Get values for all therapists for this KPI type
        let totalValue = 0;
        allTherapists.forEach(therapist => {
          // Use the new function that always calculates based on daily data
          const values = getDailyValuesForTherapistForKpi(therapist, kpi);
          if (useAverage || kpi === 'Revenue/Hour') {
            // Use average for certain KPI types
            totalValue += calculateAverage(values);
          } else {
            // Use sum for other KPI types
            totalValue += calculateTotal(values);
          }
        });
        
        // If calculating average across therapists
        if (useAverage) {
          totalValue = allTherapists.length > 0 ? totalValue / allTherapists.length : 0;
        }
        
        // Format according to KPI type
        switch(kpi) {
          case 'Revenue':
            kpiValues[kpi] = `€${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
            break;
          case 'Revenue/Hour':
            kpiValues[kpi] = `€${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/h`;
            break;
          case 'Time Spent in Treatments':
            kpiValues[kpi] = `${Math.round(totalValue)} hrs`;
            break;
          default:
            kpiValues[kpi] = `${Math.round(totalValue)}`;
        }
      });
      
      return kpiValues[kpiType];
    };
    
    return {
      revenue: getKpiTotal('Revenue'),
      revenuePerHour: getKpiTotal('Revenue/Hour', true), // Use average for Revenue/Hour
      treatments: getKpiTotal('Number of Treatments'),
      timeSpent: getKpiTotal('Time Spent in Treatments')
    };
  }, [allTherapists, selectedDateRange, dailyDates]); // Update dependencies to include dailyDates instead of view
  
  // Remove the old implementation
  // const calculateExecutiveSummaryData = () => { ... };
  // const executiveSummary = calculateExecutiveSummaryData();

  // Memoize chart therapist data calculations to avoid recalculating when activeKpi changes
  const chart1Data = useMemo(() => {
    // Filter therapists based on selection
    const therapistsToDisplay = selectedChartTherapists.length > 0
      ? allTherapists.filter(t => selectedChartTherapists.includes(t.id))
      : allTherapists;
    
    const getKpiValue = (therapist: Therapist, kpi: KpiType): number => {
      switch(kpi) {
        case 'Revenue': 
          return calculateTotal(getChartValuesIndependentOfView(therapist, kpi));
        case 'Time Spent in Treatments': 
          return calculateTotal(getChartValuesIndependentOfView(therapist, kpi));
        case 'Revenue/Hour': 
          return calculateAverage(getChartValuesIndependentOfView(therapist, kpi));
        case 'Number of Treatments': 
          return calculateTotal(getChartValuesIndependentOfView(therapist, kpi));
        default: 
          return 0;
      }
    };

    // Calculate values for X and Y axes using filtered therapists
    const allXValues = therapistsToDisplay.map(t => getKpiValue(t, chart1XAxis));
    const allYValues = therapistsToDisplay.map(t => getKpiValue(t, chart1YAxis));

    // Calculate min, max, and range
    const minX = Math.min(...allXValues);
    const maxX = Math.max(...allXValues);
    const minY = Math.min(...allYValues);
    const maxY = Math.max(...allYValues);
    const rangeX = maxX - minX;
    const rangeY = maxY - minY;

    // Calculate ticks
    const xTicks = calculateAxisTicks(minX, maxX);
    const yTicks = calculateAxisTicks(minY, maxY);

    // Format values for tooltip
    const formatTooltipValue = (value: number, kpi: KpiType) => {
      switch(kpi) {
        case 'Revenue':
          return `€${value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
        case 'Time Spent in Treatments':
          return `${value} hrs`;
        case 'Revenue/Hour':
          return `€${value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}/h`;
        case 'Number of Treatments':
          return `${value}`;
        default:
          return `${value}`;
      }
    };

    // Calculate point data for each therapist
    const points = therapistsToDisplay.map((therapist, index) => {
      const xValue = getKpiValue(therapist, chart1XAxis);
      const yValue = getKpiValue(therapist, chart1YAxis);
      
      // Calculate position percentages
      const xPercent = rangeX === 0 ? 50 : ((xValue - minX) / rangeX) * 100;
      const yPercent = rangeY === 0 ? 50 : ((yValue - minY) / rangeY) * 100;
      
      // Check if point is valid
      if (isNaN(xPercent) || isNaN(yPercent) || !isFinite(xPercent) || !isFinite(yPercent)) {
        return null; // Don't render invalid points
      }
      
      return {
        therapist,
        xValue,
        yValue,
        xPercent,
        yPercent,
        tooltip: `${therapist.name}\n${chart1XAxis}: ${formatTooltipValue(xValue, chart1XAxis)}\n${chart1YAxis}: ${formatTooltipValue(yValue, chart1YAxis)}`
      };
    }).filter(point => point !== null);
    
    return {
      minX, maxX, minY, maxY, rangeX, rangeY,
      xTicks, yTicks,
      points,
      formatTooltipValue
    };
  }, [allTherapists, chart1XAxis, chart1YAxis, 
      selectedChartTherapists, selectedDateRange]); // Remove view from dependencies

  // Memoize bar chart data calculations
  const chart2Data = useMemo(() => {
    // Filter therapists based on selection
    const therapistsToDisplay = selectedChartTherapists.length > 0
      ? allTherapists.filter(t => selectedChartTherapists.includes(t.id))
      : allTherapists;
    
    // Function to get a single KPI value from a therapist
    const getKpiValue = (therapist: Therapist, kpi: KpiType): number => {
      const values = getChartValuesIndependentOfView(therapist, kpi);
      
      switch(kpi) {
        case 'Revenue':
          return calculateTotal(values);
        case 'Time Spent in Treatments':
          return calculateTotal(values);
        case 'Revenue/Hour':
          return calculateAverage(values);
        case 'Number of Treatments':
          return calculateTotal(values);
        default:
          return 0;
      }
    };
    
    // Function to format tooltip values based on KPI type
    const formatTooltipValue = (value: number, kpiType: KpiType): string => {
      switch (kpiType) {
        case 'Revenue':
          return `${value.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}`;
        case 'Time Spent in Treatments':
          const hours = Math.floor(value);
          const minutes = Math.round((value - hours) * 60);
          return `${hours}h ${minutes}m`;
        case 'Revenue/Hour':
          return `${value.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}/h`;
        case 'Number of Treatments':
          return `${value.toLocaleString('de-DE')}`;
        default:
          return `${value}`;
      }
    };
    
    // Generate bar data for each therapist
    const bars = therapistsToDisplay.map(therapist => {
      const value = getKpiValue(therapist, chart2YAxis);
      
      return {
        therapist,
        value,
        heightPercent: 0, // Will be calculated after finding max value
        firstName: therapist.name.split(' ')[0],
        tooltip: formatTooltipValue(value, chart2YAxis)
      };
    });
    
    // Calculate max value for scaling bar heights
    const maxValue = Math.max(...bars.map(bar => bar.value), 1); // Avoid division by zero
    
    // Update bars with height percentages
    bars.forEach(bar => {
      bar.heightPercent = (bar.value / maxValue) * 100;
    });
    
    // Calculate ticks for Y axis
    const yTicks = calculateAxisTicks(0, maxValue);
    
    return {
      bars,
      formatTooltipValue,
      maxValue,
      yTicks
    };
  }, [allTherapists, chart2YAxis, selectedChartTherapists, selectedDateRange, leftChartType]); // Includes leftChartType to trigger recalc on chart type change

  // Calculate over time chart data
  const overTimeData = useMemo(() => {
    // Filter therapists based on selection
    let filteredTherapists = selectedTableTherapists.length > 0
      ? therapists.filter(t => selectedTableTherapists.includes(t.id))
      : therapists;
    
    // If a specific therapist is selected for the over time chart, filter to only that therapist
    if (selectedOverTimeTherapist !== null) {
      filteredTherapists = allTherapists.filter(t => t.id === selectedOverTimeTherapist);
    }
    
    // Get dates within selected range
    const datePoints: string[] = [];
    
    // Generate dates based on selected view type
    if (selectedDateRange) {
      const start = new Date(selectedDateRange.start);
      const end = new Date(selectedDateRange.end);
      
      if (overTimeView === 'Daily') {
        // Daily view - generate a point for each day
        let current = new Date(start);
        while (current <= end) {
          datePoints.push(format(current, 'MMM d, yyyy'));
          current = add(current, { days: 1 });
        }
      } 
      else if (overTimeView === 'Weekly') {
        // Weekly view - generate a point for each week
        // Start from the beginning of the week containing the start date
        let current = startOfWeek(start, { weekStartsOn: 0 }); // 0 = Sunday
        while (current <= end) {
          datePoints.push(`Week of ${format(current, 'MMM d')}`);
          current = add(current, { weeks: 1 });
        }
      } 
      else if (overTimeView === 'Monthly') {
        // Monthly view - generate a point for each month
        // Start from the beginning of the month containing the start date
        let current = startOfMonth(start);
        while (current <= end) {
          datePoints.push(format(current, 'MMM yyyy'));
          current = add(current, { months: 1 });
        }
      }
    }
    
    // Helper function to get KPI value for a given date
    const getKpiValueForDate = (therapist: Therapist, kpiType: KpiType, dateStr: string): number => {
      // For simplicity, we'll use a random but deterministic value
      // In a real implementation, this would pull from actual therapist data
      // Add view type to seed to ensure different views get different values
      const seed = `${therapist.id}-${dateStr}-${kpiType}-${overTimeView}`;
      
      // Helper function to generate deterministic random values based on a string
      function hashStringToFloat(str: string): number {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
          hash = ((hash << 5) - hash) + str.charCodeAt(i);
          hash |= 0; // Convert to 32bit integer
        }
        // Get a value between 0 and 1
        return Math.abs((hash % 1000) / 1000);
      }
      
      const baseValue = hashStringToFloat(seed);
      
      // Scale based on KPI type
      switch (kpiType) {
        case 'Revenue':
          return Math.round(baseValue * 2000 + 500); // 500-2500
        case 'Time Spent in Treatments':
          return Math.round(baseValue * 8 + 2); // 2-10 hours
        case 'Revenue/Hour':
          return Math.round(baseValue * 50 + 75); // 75-125
        case 'Number of Treatments':
          return Math.round(baseValue * 20 + 5); // 5-25
        default:
          return baseValue * 100;
      }
    };
    
    // Calculate values for each date point
    const values = datePoints.map(date => {
      let total = 0;
      
      filteredTherapists.forEach(therapist => {
        // Each therapist contributes a value based on the KPI type
        const therapistValue = getKpiValueForDate(therapist, overTimeKpi, date);
        total += therapistValue;
      });
      
      return { date, value: total };
    });
    
    // Find min and max for scaling
    let minValue = values.length > 0 ? Math.min(...values.map(v => v.value)) : 0;
    let maxValue = values.length > 0 ? Math.max(...values.map(v => v.value)) : 100;
    
    // Adjust min/max for better visualization
    // Round down min to nearest appropriate unit
    if (overTimeKpi === 'Revenue' || overTimeKpi === 'Revenue/Hour') {
      minValue = Math.floor(minValue / 100) * 100;
      maxValue = Math.ceil(maxValue / 100) * 100;
    } else {
      minValue = Math.floor(minValue);
      maxValue = Math.ceil(maxValue);
    }
    
    // Ensure a minimum range for better visualization
    const minRange = overTimeKpi === 'Revenue' ? 1000 : 
                     overTimeKpi === 'Revenue/Hour' ? 50 : 5;
                     
    // If range is too small, extend the max value
    const valueRange = maxValue - minValue;
    if (valueRange < minRange) {
      maxValue = minValue + minRange;
    }
    
    // Format tooltip value based on KPI type - MOVED UP before it's used
    const formatTooltipValue = (value: number, kpi: KpiType) => {
      switch(kpi) {
        case 'Revenue':
          return `€${value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
        case 'Time Spent in Treatments':
          return `${value} hrs`;
        case 'Revenue/Hour':
          return `€${value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}/h`;
        case 'Number of Treatments':
          return `${value}`;
        default:
          return `${value}`;
      }
    };
    
    // Generate normalized heights based on min/max
    const bars = values.map(({ date, value }) => {
      const heightPercent = valueRange !== 0 
        ? ((value - minValue) / valueRange) * 100
        : value > 0 ? 100 : 0;
        
      return {
        date,
        value,
        heightPercent,
      };
    });
    
    // Generate points for line chart
    const points = values.map(({ date, value }, index) => {
      const xPercent = (index / Math.max(values.length - 1, 1)) * 100;
      const yPercent = valueRange !== 0 
        ? 100 - ((value - minValue) / valueRange) * 100
        : value > 0 ? 0 : 100;
      
      return {
        date,
        value,
        xPercent,
        yPercent,
      };
    });
    
    // Generate line segments for line chart
    const lineSegments = [];
    if (points.length >= 2) {
      for (let i = 0; i < points.length - 1; i++) {
        lineSegments.push({
          x1: points[i].xPercent,
          y1: points[i].yPercent,
          x2: points[i + 1].xPercent,
          y2: points[i + 1].yPercent,
          startPoint: points[i],
          endPoint: points[i + 1],
        });
      }
    }
    
    // Generate y-axis ticks
    const numTicks = 5;
    const yAxisTicks = Array.from({ length: numTicks }, (_, i) => {
      const tickValue = minValue + (valueRange / (numTicks - 1)) * i;
      return {
        value: tickValue,
        label: formatTooltipValue(tickValue, overTimeKpi),
        position: i / (numTicks - 1) * 100,
      };
    });
    
    return {
      bars,
      points,
      lineSegments,
      yAxisTicks,
      minValue,
      maxValue,
      valueRange,
      formatTooltipValue,
    };
  }, [overTimeKpi, selectedDateRange, selectedTableTherapists, therapists, overTimeView, overTimeChartType, selectedOverTimeTherapist, allTherapists]);

  return (
    <WireframeLayout title="Therapios" username="User Therapist" userInitials="SA">
      {/* Fixed width container for entire dashboard with max width enforced */}
      <div className="max-w-[1200px] mx-auto">
        {/* Fixed content section (blue box) */}
        <div className="p-6 pb-0">
          {/* Page Header */}
          <div className="flex justify-between items-center mb-6">
            <div></div>
            <div className="flex items-center space-x-4 relative">
              <div 
                className="flex items-center bg-white border border-gray-300 rounded px-3 py-1.5 text-sm cursor-pointer"
                onClick={() => setShowDatePicker(!showDatePicker)}
              >
                <span>Date Range:</span>
                <span className="ml-2 font-medium">{selectedDateRange.label}</span>
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              
              {/* Date Range Picker */}
              {showDatePicker && (
                <div className="absolute top-10 right-0 mt-1 w-80 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                  <div className="p-4">
                    <div className="text-sm font-medium text-gray-700 mb-2">Select Date Range</div>
                    
                    {/* Quick Selection Buttons */}
                    <div className="mb-3 flex flex-wrap gap-1">
                      <button 
                        className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded border border-gray-300"
                        onClick={() => setQuickDateRange(7)}
                      >
                        Last 7 Days
                      </button>
                      <button 
                        className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded border border-gray-300"
                        onClick={() => setQuickDateRange(30)}
                      >
                        Last 30 Days
                      </button>
                      <button 
                        className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded border border-gray-300"
                        onClick={() => setMonthDateRange(0)}
                      >
                        Jan 2025
                      </button>
                      <button 
                        className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded border border-gray-300"
                        onClick={() => setMonthDateRange(1)}
                      >
                        Feb 2025
                      </button>
                      <button 
                        className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded border border-gray-300"
                        onClick={() => setMonthDateRange(2)}
                      >
                        Mar 2025
                      </button>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Start Date</label>
                        <input 
                          type="date" 
                          className="w-full border border-gray-300 rounded py-1.5 px-3 text-sm"
                          value={startDate}
                          min="2025-01-01" 
                          max="2025-03-31"
                          onChange={(e) => setStartDate(e.target.value)}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">End Date</label>
                        <input 
                          type="date" 
                          className="w-full border border-gray-300 rounded py-1.5 px-3 text-sm"
                          value={endDate}
                          min="2025-01-01" 
                          max="2025-03-31"
                          onChange={(e) => setEndDate(e.target.value)}
                        />
                      </div>
                      
                      <div className="pt-2 flex justify-between">
                        <button 
                          className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50"
                          onClick={() => setShowDatePicker(false)}
                        >
                          Cancel
                        </button>
                        <button 
                          className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                          onClick={applyDateRange}
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Executive Summary Section */}
          <div className="mb-6 bg-white border border-gray-200 rounded-lg shadow-sm p-4">
            <h2 className="text-lg font-semibold mb-3 text-gray-800">Executive Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Card 1: Total Revenue - restore dynamic calculation */}
              <div className="bg-white p-4 rounded-md border border-gray-200">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Total Revenue</div>
                  <div className="text-2xl font-bold text-gray-900">{executiveSummary.revenue}</div>
                </div>
              </div>
              
              {/* Card 2: Avg. Revenue/Hour - restore dynamic calculation */}
              <div className="bg-white p-4 rounded-md border border-gray-200">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Avg. Revenue/Hour</div>
                  <div className="text-2xl font-bold text-gray-900">{executiveSummary.revenuePerHour}</div>
                </div>
              </div>
              
              {/* Card 3: % Low performers - removing color coding */}
              <div className="bg-white p-4 rounded-md border border-gray-200">
                <div>
                  <div className="text-sm text-gray-600 mb-1">% Low performers</div>
                  <div className="text-2xl font-bold text-gray-900">5%</div>
                </div>
              </div>
              
              {/* Card 4: Time Spent in Treatments - removing color coding */}
              <div className="bg-white p-4 rounded-md border border-gray-200">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Time Spent in Treatments</div>
                  <div className="text-2xl font-bold text-gray-900">95%</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Charts Section */}
          <div className="mb-8">
            {/* Removing the header div that contains the "Performance Charts" title and therapist filter */}
            <div className="grid grid-cols-1 gap-6">
              {/* Left chart - Performance Chart */}
              <div className="bg-white p-4 border border-gray-200 rounded-md shadow-sm">
                <div className="mb-4">
                  {/* First row - Chart title and chart type selector */}
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-md font-medium">Performance Chart</h3>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Chart Type</label>
                      <select 
                        className="w-40 border border-gray-300 rounded px-2 py-1 text-sm"
                        value={leftChartType}
                        onChange={(e) => setLeftChartType(e.target.value as 'scatter' | 'bar')}
                      >
                        <option value="scatter">Scatter Plot</option>
                        <option value="bar">Bar Chart</option>
                      </select>
                    </div>
                  </div>
                  
                  {/* Second row - Axis/KPI selection - Moving therapist filter here and restructuring it */}
                  <div className="flex justify-end gap-4">
                    {/* Therapist filter - restructured with label on top */}
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Therapist Filter</label>
                      <MultiSelectDropdown
                        options={allTherapistData.map(therapist => ({ id: therapist.id, label: therapist.name }))}
                        selectedValues={selectedChartTherapists}
                        onChange={setSelectedChartTherapists}
                        placeholder="All Therapists"
                        className="w-40"
                        maxHeight="12rem"
                      />
                    </div>
                    
                    {leftChartType === 'scatter' ? (
                      <>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">X-Axis</label>
                          <select 
                            className="w-40 border border-gray-300 rounded px-2 py-1 text-sm"
                            value={chart1XAxis}
                            onChange={(e) => setChart1XAxis(e.target.value as KpiType)}
                          >
                            <option value="Revenue">Revenue</option>
                            <option value="Time Spent in Treatments">Time Spent in Treatments</option>
                            <option value="Revenue/Hour">Revenue/Hour</option>
                            <option value="Number of Treatments">Number of Treatments</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Y-Axis</label>
                          <select 
                            className="w-40 border border-gray-300 rounded px-2 py-1 text-sm"
                            value={chart1YAxis}
                            onChange={(e) => setChart1YAxis(e.target.value as KpiType)}
                          >
                            <option value="Revenue">Revenue</option>
                            <option value="Time Spent in Treatments">Time Spent in Treatments</option>
                            <option value="Revenue/Hour">Revenue/Hour</option>
                            <option value="Number of Treatments">Number of Treatments</option>
                          </select>
                        </div>
                      </>
                    ) : (
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">KPI Selection</label>
                        <select 
                          className="w-40 border border-gray-300 rounded px-2 py-1 text-sm"
                          value={chart2YAxis}
                          onChange={(e) => setChart2YAxis(e.target.value as KpiType)}
                        >
                          <option value="Revenue">Revenue</option>
                          <option value="Time Spent in Treatments">Time Spent in Treatments</option>
                          <option value="Revenue/Hour">Revenue/Hour</option>
                          <option value="Number of Treatments">Number of Treatments</option>
                        </select>
                      </div>
                    )}
                  </div>
                </div>
                <div className="h-96 bg-gray-50 border border-gray-200 rounded overflow-hidden">
                  {/* Left chart implementation */}
                  {leftChartType === 'scatter' ? (
                    // Scatter Plot Implementation
                    <div className="w-full h-full relative">
                      {/* Y-axis label */}
                      <div className="absolute right-5 top-1/2 transform -translate-y-1/2 rotate-90 text-[10px] font-medium text-gray-500 bg-white/80 py-0.5 px-1 border border-gray-200 shadow-sm" style={{transformOrigin: 'right center', whiteSpace: 'nowrap', zIndex: 50}}>
                        {chart1YAxis}
                      </div>
                      
                      {/* X-axis label */}
                      <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 text-[10px] font-medium text-gray-500" style={{width: '100px', textAlign: 'center', whiteSpace: 'nowrap'}}>
                        {chart1XAxis}
                      </div>
                      
                      {/* Actual chart area with proper padding for axis labels */}
                      <div className="absolute inset-0 p-12">
                        {/* Chart border and background */}
                        <div className="w-full h-full border border-gray-300 bg-white relative">
                          {/* Grid lines and Axis Scales Container */}
                          <div className="absolute inset-0 z-0">
                            {/* X and Y axes lines */}
                            <div className="absolute bottom-0 left-0 right-0 h-px bg-gray-400"></div> {/* x-axis */}
                            <div className="absolute top-0 bottom-0 left-0 w-px bg-gray-400"></div> {/* y-axis */}
                            
                            {/* X-Axis Ticks and Grid Lines */}
                            {chart1Data.xTicks.map((tick, i) => {
                              const xPercent = chart1Data.rangeX === 0 ? 50 : ((tick - chart1Data.minX) / chart1Data.rangeX) * 100;
                              // Skip ticks outside the visible area or the first/last tick if too close to edge
                              if (xPercent < 5 || xPercent > 95) return null; 
                              return (
                                <div key={`x-tick-${i}`} className="absolute top-0 bottom-0" style={{ left: `${xPercent}%` }}>
                                  {/* Grid Line */}
                                  <div className="absolute top-0 bottom-0 w-px bg-gray-200"></div>
                                  {/* Tick mark */}
                                  <div className="absolute bottom-0 w-px h-2 bg-gray-400"></div>
                                  {/* Label */}
                                  <span className="absolute bottom-[-20px] left-1/2 -translate-x-1/2 text-xs text-gray-600 font-medium bg-white bg-opacity-80 px-1 rounded whitespace-nowrap">
                                    {formatAxisTickValue(tick, chart1XAxis)}
                                  </span>
                                </div>
                              );
                            })}
                            
                            {/* Y-Axis Ticks and Grid Lines */}
                            {chart1Data.yTicks.map((tick, i) => {
                              const yPercent = chart1Data.rangeY === 0 ? 50 : ((tick - chart1Data.minY) / chart1Data.rangeY) * 100;
                              // Skip ticks outside the visible area or the first/last tick if too close to edge
                              if (yPercent < 5 || yPercent > 95) return null;
                              return (
                                <div key={`y-tick-${i}`} className="absolute left-0 right-0" style={{ bottom: `${yPercent}%` }}>
                                  {/* Grid Line */}
                                  <div className="absolute left-0 right-0 h-px bg-gray-200"></div>
                                  {/* Tick mark */}
                                  <div className="absolute left-0 h-px w-2 bg-gray-400"></div>
                                  {/* Label */}
                                  <span className="absolute left-[-40px] top-1/2 -translate-y-1/2 text-xs text-gray-600 font-medium whitespace-nowrap text-right bg-white bg-opacity-80 px-1 rounded" style={{width: '35px'}}>
                                    {formatAxisTickValue(tick, chart1YAxis)}
                                  </span>
                                </div>
                              );
                            })}
                          </div>

                          {/* Scatter points Container */}
                          <div className="absolute inset-4 z-10">
                            {chart1Data.points.map((point, index) => {
                              // Use blue color for all dots
                              const dotColor = 'bg-blue-400';
                              
                              // Calculate safe boundaries for data points with more padding to avoid overlapping with axis labels
                              // We use 10% inset from edges instead of 5% to avoid overlapping with labels
                              const safeLeft = Math.min(Math.max(point.xPercent, 10), 90);
                              const safeBottom = Math.min(Math.max(point.yPercent, 10), 90);
                              
                              // Determine optimal label position to avoid overlaps and stay within chart
                              let labelPos = 'bottom';
                              if (safeBottom < 20) labelPos = 'top'; // If near bottom, place above
                              
                              return (
                                <div
                                  key={`scatter-${index}`}
                                  className={`absolute w-3 h-3 rounded-full ${dotColor} 
                                    transform -translate-x-1/2 -translate-y-1/2 cursor-pointer
                                    transition-all duration-200 hover:w-4 hover:h-4 hover:ring-2 ring-gray-200 z-20
                                    shadow-sm group`}
                                  style={{
                                    left: `${safeLeft}%`,
                                    bottom: `${safeBottom}%`,
                                  }}
                                >
                                  {/* Therapist Name Label - only visible on hover */}
                                  <div 
                                    className="absolute opacity-0 group-hover:opacity-100 transition-opacity duration-200
                                    bg-white px-2 py-1 rounded shadow-md border border-gray-200 whitespace-nowrap 
                                    text-xs text-gray-800 font-medium z-30 pointer-events-none"
                                    style={{
                                      left: '50%',
                                      [labelPos === 'bottom' ? 'bottom' : 'top']: labelPos === 'bottom' ? '-28px' : '18px',
                                      transform: 'translateX(-50%)',
                                    }}
                                  >
                                    <div className="flex flex-col">
                                      <span className="font-bold">{point.therapist.name}</span>
                                      <span>{chart1XAxis}: {chart1Data.formatTooltipValue(point.xValue, chart1XAxis)}</span>
                                      <span>{chart1YAxis}: {chart1Data.formatTooltipValue(point.yValue, chart1YAxis)}</span>
                                    </div>
                                  </div>
                                  
                                  {/* Always visible therapist name below point */}
                                  <span 
                                    className="absolute text-xs text-gray-700 font-medium whitespace-nowrap bg-white bg-opacity-70 px-1 rounded"
                                    style={{
                                      left: 0,
                                      bottom: `-18px`,
                                      transform: 'translateX(-50%)',
                                      pointerEvents: 'none',
                                      maxWidth: '80px',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      whiteSpace: 'nowrap',
                                      textAlign: 'center',
                                    }}
                                  >
                                    {point.therapist.name.split(' ')[0]}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Bar Chart Implementation
                    <div className="w-full h-full relative">
                      {/* Y-axis label */}
                      <div className="absolute right-7 top-1/2 transform -translate-y-1/2 rotate-90 text-[10px] font-medium text-gray-500 bg-white/80 py-0.5 px-1 border border-gray-200 shadow-sm" style={{transformOrigin: 'right center', whiteSpace: 'nowrap', zIndex: 50}}>
                        {chart2YAxis}
                      </div>
                      
                      {/* X-axis label */}
                      <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 text-[10px] font-medium text-gray-500 bg-white/80 py-0.5 px-1" style={{width: '100px', textAlign: 'center', whiteSpace: 'nowrap'}}>
                        Therapists
                      </div>
                      
                      {/* Chart grid area */}
                      <div className="absolute inset-10 flex">
                        {/* Y-axis ticks */}
                        <div className="relative h-full pr-1" style={{width: '40px'}}>
                          {chart2Data.yTicks.map((tick, i) => {
                            const tickPercent = chart2Data.maxValue === 0 ? 0 : (tick / chart2Data.maxValue) * 100;
                            return (
                              <div 
                                key={i}
                                className="absolute right-0 transform -translate-y-1/2 flex items-center"
                                style={{top: `${100 - tickPercent}%`}}
                              >
                                <div className="h-px w-2 bg-gray-300 mr-1"></div>
                                <span className="text-[10px] text-gray-500">
                                  {formatAxisTickValue(tick, chart2YAxis)}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                        
                        {/* Bar chart container */}
                        <div className="flex-1 relative">
                          {/* Horizontal grid lines */}
                          <div className="absolute inset-0 pointer-events-none">
                            {chart2Data.yTicks.map((tick, i) => {
                              const tickPercent = chart2Data.maxValue === 0 ? 0 : (tick / chart2Data.maxValue) * 100;
                              return (
                                <div 
                                  key={i}
                                  className="absolute left-0 right-0 h-px bg-gray-200"
                                  style={{top: `${100 - tickPercent}%`}}
                                ></div>
                              );
                            })}
                          </div>
                          
                          {/* Bar container */}
                          <div className="absolute inset-0 flex h-full justify-around items-end">
                            {chart2Data.bars.map((bar, index) => {
                              // Use blue color for all bars
                              const barColor = 'bg-blue-400';
                              const hoverColor = 'group-hover:bg-blue-300';
                              
                              const barWidth = `${Math.min(80, 240 / chart2Data.bars.length)}px`;
                              return (
                                <div key={index} className="relative flex flex-col items-center justify-end h-full group" style={{width: barWidth}}>
                                  {/* Bar value - always visible */}
                                  <div className="text-[10px] text-gray-500 mb-1 transition-all duration-200 group-hover:font-bold">
                                    {bar.tooltip}
                                  </div>
                                  
                                  {/* The bar */}
                                  <div 
                                    className={`${barColor} ${hoverColor} w-full rounded-t transition-all duration-200 shadow-sm group-hover:shadow`}
                                    style={{
                                      height: `${bar.heightPercent}%`,
                                      minHeight: '2px'
                                    }}
                                  ></div>
                                  
                                  {/* Therapist name */}
                                  <div className="mt-1 text-[10px] text-gray-500 truncate group-hover:font-medium transition-all duration-200" style={{width: barWidth, textAlign: 'center'}}>
                                    {bar.firstName}
                                  </div>
                                  
                                  {/* Tooltip */}
                                  <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none" style={{width: 'auto', zIndex: 50}}>
                                    <div className="font-medium">{bar.therapist.name}</div>
                                    <div className="flex items-center gap-1">
                                      <span className={`w-2 h-2 rounded-full inline-block ${barColor}`}></span>
                                      <span>{chart2YAxis}: {bar.tooltip}</span>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Right chart - Placeholder for Over Time Chart (will be implemented later) */}
              <div className="bg-white p-4 border border-gray-200 rounded-md shadow-sm">
                <div className="mb-4">
                  {/* First row - Chart title and view selector */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-md font-medium">Over Time Chart</h3>
                      <div>
                        <select 
                          className="border border-gray-300 rounded px-2 py-1 text-sm"
                          value={overTimeChartType}
                          onChange={(e) => setOverTimeChartType(e.target.value as 'Bar Chart' | 'Line Chart')}
                        >
                          <option value="Bar Chart">Bar Chart</option>
                          <option value="Line Chart">Line Chart</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex border-b border-gray-200">
                      <button 
                        className={`py-1 px-3 font-medium text-xs ${overTimeView === 'Daily' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                        onClick={() => setOverTimeView('Daily')}
                      >
                        Daily
                      </button>
                      <button 
                        className={`py-1 px-3 font-medium text-xs ${overTimeView === 'Weekly' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                        onClick={() => setOverTimeView('Weekly')}
                      >
                        Weekly
                      </button>
                      <button 
                        className={`py-1 px-3 font-medium text-xs ${overTimeView === 'Monthly' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                        onClick={() => setOverTimeView('Monthly')}
                      >
                        Monthly
                      </button>
                    </div>
                  </div>
                  
                  {/* Second row - KPI Selection */}
                  <div className="flex justify-end gap-4">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Therapist Selection</label>
                      <select 
                        className="w-44 border border-gray-300 rounded px-2 py-1 text-sm"
                        value={selectedOverTimeTherapist === null ? "" : selectedOverTimeTherapist}
                        onChange={(e) => setSelectedOverTimeTherapist(e.target.value === "" ? null : Number(e.target.value))}
                      >
                        <option value="">All Therapists</option>
                        {allTherapists.map(therapist => (
                          <option key={therapist.id} value={therapist.id}>
                            {therapist.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">KPI Selection</label>
                      <select 
                        className="w-44 border border-gray-300 rounded px-2 py-1 text-sm"
                        value={overTimeKpi}
                        onChange={(e) => setOverTimeKpi(e.target.value as KpiType)}
                      >
                        <option value="Revenue">Revenue</option>
                        <option value="Time Spent in Treatments">Time Spent in Treatments</option>
                        <option value="Revenue/Hour">Revenue/Hour</option>
                        <option value="Number of Treatments">Number of Treatments</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="h-96 bg-gray-50 border border-gray-200 rounded overflow-hidden">
                  {/* Over Time Chart Implementation */}
                  <div className="w-full h-full relative">
                    {/* Chart title and axis labels container - removing Y-axis label from here */}
                    <div className="absolute inset-0 pointer-events-none">
                      {/* X-axis label - keeping this as is */}
                      <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 text-[10px] font-medium text-gray-500" style={{width: '100px', textAlign: 'center', whiteSpace: 'nowrap'}}>
                        {overTimeView === 'Daily' ? 'Days' : overTimeView === 'Weekly' ? 'Weeks' : 'Months'}
                      </div>
                    </div>
                    
                    {/* Actual chart area with optimized padding for better space usage */}
                    <div className="absolute inset-0 pt-8 pb-12 px-3">
                      {/* Chart border and background - Modified to support horizontal scrolling with improved layout */}
                      <div className="w-full h-full border border-gray-300 bg-white relative flex">
                        {/* Fixed Y-axis section - reduced width for better space utilization */}
                        <div className="relative flex-shrink-0" style={{ width: '40px' }}>
                          {/* Y-Axis line */}
                          <div className="absolute top-0 bottom-0 right-0 w-px bg-gray-400 z-10"></div>
                          
                          {/* Y-Axis ticks with actual KPI values - optimized positioning */}
                          <div className="absolute top-0 bottom-0 right-0">
                            {(() => {
                              return overTimeData.yAxisTicks.map((tick, i) => {
                                const fraction = overTimeData.valueRange === 0 
                                  ? 0 
                                  : (tick.value - overTimeData.minValue) / overTimeData.valueRange;
                                return (
                                  <div key={`y-tick-${i}`} className="absolute right-0" style={{ bottom: `${fraction * 100}%` }}>
                                    <div className="h-2 w-px bg-gray-400"></div> {/* Tick mark */}
                                    <span className="absolute right-[4px] left-0 top-1/2 -translate-y-1/2 text-xs text-gray-600 font-medium whitespace-nowrap text-right bg-white bg-opacity-80 pr-1 rounded">
                                      {overTimeData.formatTooltipValue(tick.value, overTimeKpi)}
                                    </span>
                                  </div>
                                );
                              });
                            })()}
                          </div>
                        </div>
                        
                        {/* Scrollable chart content - improved container */}
                        <div className="flex-grow overflow-x-auto">
                          <div className="relative h-full w-full" style={{ 
                            minWidth: `${Math.max(100, overTimeData.bars.length * (
                              overTimeView === 'Daily' ? 30 : 
                              overTimeView === 'Weekly' ? 40 : 60
                            ))}px` 
                          }}>
                            {/* Horizontal grid lines - ensuring full width */}
                            <div className="absolute inset-0 pointer-events-none">
                              {overTimeData.yAxisTicks.map((tick, i) => {
                                const fraction = overTimeData.valueRange === 0 
                                  ? 0 
                                  : (tick.value - overTimeData.minValue) / overTimeData.valueRange;
                                return (
                                  <div 
                                    key={`grid-line-${i}`}
                                    className="absolute left-0 right-0 h-px bg-gray-200"
                                    style={{ bottom: `${fraction * 100}%` }}
                                  ></div>
                                );
                              })}
                            </div>
                          
                            {/* X-axis line */}
                            <div className="absolute bottom-0 left-0 right-0 h-px bg-gray-400"></div>
                            
                            {/* X-Axis labels (dates) - optimized spacing based on view type */}
                            <div className="absolute bottom-0 left-0 right-0">
                              {(() => {
                                return overTimeData.bars.map((bar, index) => {
                                  const totalBars = overTimeData.bars.length;
                                  
                                  // Conditional styling based on view type
                                  const labelStyles = {
                                    Daily: {
                                      textSize: 'text-[9px]',
                                      bottom: '-20px',
                                      rotation: 'rotate(-90deg)',
                                      marginBottom: '10px'
                                    },
                                    Weekly: {
                                      textSize: 'text-[8px]',
                                      bottom: '-25px',
                                      rotation: 'rotate(-90deg)',
                                      marginBottom: '12px'
                                    },
                                    Monthly: {
                                      textSize: 'text-[10px]',
                                      bottom: '-16px',
                                      rotation: 'rotate(-45deg)',
                                      marginBottom: '8px'
                                    }
                                  };
                                  
                                  const currentStyle = labelStyles[overTimeView];
                                  
                                  return (
                                    <div key={`x-label-${index}`} className="absolute" style={{ 
                                      left: `${(index / (totalBars - 1 || 1)) * 100}%`,
                                      bottom: 0,
                                      transform: 'translateX(-50%)'
                                    }}>
                                      <div className="h-2 w-px bg-gray-400"></div> {/* Tick mark */}
                                      {/* Vertical label for each bar - conditional styling based on view type */}
                                      <span className={`absolute ${currentStyle.textSize} text-gray-600`} style={{
                                        bottom: currentStyle.bottom,
                                        left: '50%',
                                        transform: `translateX(-50%) ${currentStyle.rotation}`,
                                        transformOrigin: 'center bottom',
                                        whiteSpace: 'nowrap',
                                        marginBottom: currentStyle.marginBottom,
                                        height: 'auto',
                                        width: 'auto'
                                      }}>
                                        {bar.date}
                                      </span>
                                    </div>
                                  );
                                });
                              })()}
                            </div>
                            
                            {/* Over Time Chart - Conditional Rendering with improved alignment */}
                            <div className={`absolute inset-x-0 ${
                              overTimeView === 'Daily' ? 'bottom-5' :
                              overTimeView === 'Weekly' ? 'bottom-6' : 'bottom-4'
                            } top-1 flex items-end`}>
                              {overTimeData.bars.length > 0 ? (
                                <>
                                  {overTimeChartType === 'Bar Chart' ? (
                                    // Bar Chart Implementation - optimized spacing based on view type
                                    <div className="w-full h-full flex items-end justify-around">
                                      {overTimeData.bars.map((bar, index) => {
                                        // Use blue color for all bars
                                        const barColor = 'bg-blue-400';
                                        const barHoverColor = 'hover:bg-blue-300';
                                        
                                        // Bar width based on view type
                                        const barWidthClass = overTimeView === 'Daily' ? "w-5" : 
                                                             overTimeView === 'Weekly' ? "w-6" : "w-10";
                                        
                                        return (
                                          <div 
                                            key={`over-time-bar-${index}`}
                                            className="h-full flex flex-col justify-end relative group"
                                            style={{ flexGrow: 1, flexBasis: 0 }}
                                          >
                                            {/* Value label above bar */}
                                            {bar.heightPercent > 15 && (
                                              <div className="absolute bottom-full mb-1 left-1/2 transform -translate-x-1/2 text-[9px] font-medium text-gray-600 whitespace-nowrap">
                                                {overTimeData.formatTooltipValue(bar.value, overTimeKpi)}
                                              </div>
                                            )}
                                            
                                            {/* The bar */}
                                            <div 
                                              className={`${barColor} ${barHoverColor} ${barWidthClass} rounded-t cursor-pointer transition-all duration-300 ease-in-out mx-auto`}
                                              style={{ height: `${bar.heightPercent}%` }}
                                            >
                                              {/* Tooltip - improved positioning */}
                                              <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity duration-200
                                                bottom-full left-1/2 transform -translate-x-1/2 mb-2
                                                bg-white px-2 py-1.5 rounded shadow-md border border-gray-200 whitespace-nowrap 
                                                text-xs text-gray-800 font-medium z-30 pointer-events-none min-w-[120px]">
                                                <div className="flex flex-col gap-1">
                                                  <span className="font-medium">{bar.date}</span>
                                                  <div className="flex items-center gap-1.5">
                                                    <span className={`w-2 h-2 rounded-full inline-block ${barColor}`}></span>
                                                    <span>{overTimeKpi}: {overTimeData.formatTooltipValue(bar.value, overTimeKpi)}</span>
                                                  </div>
                                                  
                                                  {/* Show percentage of max value */}
                                                  <div className="text-[10px] text-gray-500 pt-0.5 border-t border-gray-100">
                                                    {overTimeData.valueRange !== 0 
                                                      ? `${Math.round(((bar.value - overTimeData.minValue) / overTimeData.valueRange) * 100)}% of max`
                                                      : '100% of max'}
                                                  </div>
                                                </div>
                                                <div className="absolute bottom-[-5px] left-1/2 transform -translate-x-1/2 w-2 h-2 rotate-45 bg-white border-r border-b border-gray-200"></div>
                                              </div>
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  ) : (
                                    // Line Chart Implementation - improved positioning for all view types
                                    <div className="absolute inset-0 -ml-0.5"> {/* Small negative margin to align with y-axis */}
                                      {/* Line segments connecting the points */}
                                      <svg className="w-full h-full absolute top-0 left-0 overflow-visible">
                                        {overTimeData.lineSegments.map((segment, index) => {
                                          // Use blue color for all lines
                                          const lineColor = 'stroke-blue-400';
                                          
                                          // Line thickness based on view type
                                          const strokeWidth = overTimeView === 'Monthly' ? 'stroke-[2.5px]' : 'stroke-2';
                                          
                                          return (
                                            <line 
                                              key={`line-segment-${index}`}
                                              x1={`${segment.x1}%`} 
                                              y1={`${segment.y1}%`} 
                                              x2={`${segment.x2}%`} 
                                              y2={`${segment.y2}%`}
                                              className={`${lineColor} ${strokeWidth}`}
                                              strokeLinecap="round"
                                            />
                                          );
                                        })}
                                      </svg>
                                      
                                      {/* Data points */}
                                      {overTimeData.points.map((point, index) => {
                                        // Use blue color for all points
                                        const pointColor = 'bg-blue-400';
                                        const pointHoverColor = 'hover:bg-blue-300';
                                        const pointBorderColor = 'border-blue-200';
                                        
                                        // Point size based on view type
                                        const pointSize = overTimeView === 'Daily' ? 'w-3 h-3' : 
                                                         overTimeView === 'Weekly' ? 'w-3.5 h-3.5' : 'w-4 h-4';
                                        
                                        const hoverSize = overTimeView === 'Daily' ? 'hover:w-4 hover:h-4' : 
                                                         overTimeView === 'Weekly' ? 'hover:w-5 hover:h-5' : 'hover:w-6 hover:h-6';
                                        
                                        return (
                                          <div 
                                            key={`line-point-${index}`}
                                            className={`absolute ${pointSize} rounded-full ${pointColor} ${pointHoverColor} cursor-pointer
                                              transform -translate-x-1/2 -translate-y-1/2 
                                              border-2 ${pointBorderColor} shadow-sm group
                                              transition-all duration-200 ${hoverSize}`}
                                            style={{
                                              left: `${point.xPercent}%`,
                                              top: `${point.yPercent}%`
                                            }}
                                          >
                                            {/* Value label - visible on hover */}
                                            {point.value > 0 && (
                                              <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity duration-200
                                                bottom-full left-1/2 transform -translate-x-1/2 mb-2
                                                bg-white px-2 py-1.5 rounded shadow-md border border-gray-200 whitespace-nowrap 
                                                text-xs text-gray-800 font-medium z-30 pointer-events-none min-w-[120px]">
                                                <div className="flex flex-col gap-1">
                                                  <span className="font-medium">{point.date}</span>
                                                  <div className="flex items-center gap-1.5">
                                                    <span className={`w-2 h-2 rounded-full inline-block ${pointColor}`}></span>
                                                    <span>{overTimeKpi}: {overTimeData.formatTooltipValue(point.value, overTimeKpi)}</span>
                                                  </div>
                                                  
                                                  {/* Show percentage of max value */}
                                                  <div className="text-[10px] text-gray-500 pt-0.5 border-t border-gray-100">
                                                    {overTimeData.valueRange !== 0 
                                                      ? `${Math.round(((point.value - overTimeData.minValue) / overTimeData.valueRange) * 100)}% of max`
                                                      : '100% of max'}
                                                  </div>
                                                </div>
                                                <div className="absolute bottom-[-5px] left-1/2 transform -translate-x-1/2 w-2 h-2 rotate-45 bg-white border-r border-b border-gray-200"></div>
                                              </div>
                                            )}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
                                </>
                              ) : (
                                // No data state
                                <div className="w-full h-full flex items-center justify-center">
                                  <div className="text-center">
                                    <svg className="w-10 h-10 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2z" />
                                    </svg>
                                    <p className="text-gray-500 text-sm mb-1">No data available for {overTimeKpi}</p>
                                    <p className="text-gray-400 text-xs">Try selecting a different date range or KPI</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Y-axis label - Moved to the blue box area */}
                    <div className="absolute right-2 bottom-3 text-[10px] font-medium text-gray-500 bg-white/80 py-0.5 px-1 border border-gray-200 shadow-sm">
                      {overTimeKpi}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* View Selector */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold">KPI Overview Tables</h2>
              <div className="flex border-b border-gray-200">
                <button 
                  className={`py-2 px-4 font-medium text-sm ${view === 'Daily' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                  onClick={() => setView('Daily')}
                >
                  Daily
                </button>
                <button 
                  className={`py-2 px-4 font-medium text-sm ${view === 'Weekly' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                  onClick={() => setView('Weekly')}
                >
                  Weekly
                </button>
                <button 
                  className={`py-2 px-4 font-medium text-sm ${view === 'Monthly' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                  onClick={() => setView('Monthly')}
                >
                  Monthly
                </button>
              </div>
            </div>
            {/* Therapist Filter - Table */}
            <div className="ml-auto flex items-center">
              <div className="flex items-center">
                <label className="text-sm text-gray-600 mr-2">Therapist Filter:</label>
                <MultiSelectDropdown
                  options={allTherapistData.map(therapist => ({ id: therapist.id, label: therapist.name }))}
                  selectedValues={selectedTableTherapists}
                  onChange={setSelectedTableTherapists}
                  placeholder="All Therapists"
                  className="w-60"
                  maxHeight="12rem"
                />
              </div>
            </div>
          </div>
          
          {/* KPI Selector */}
          <div className="grid grid-cols-4 gap-2 mb-6">
            <button 
              className={`py-2 px-4 text-center text-sm font-medium rounded ${activeKpi === 'Revenue' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              onClick={() => setActiveKpi('Revenue')}
            >
              Revenue
            </button>
            <button 
              className={`py-2 px-4 text-center text-sm font-medium rounded ${activeKpi === 'Revenue/Hour' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              onClick={() => setActiveKpi('Revenue/Hour')}
            >
              Revenue/Hour
            </button>
            <button 
              className={`py-2 px-4 text-center text-sm font-medium rounded ${activeKpi === 'Number of Treatments' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              onClick={() => setActiveKpi('Number of Treatments')}
            >
              Number of Treatments
            </button>
            <button 
              className={`py-2 px-4 text-center text-sm font-medium rounded ${activeKpi === 'Time Spent in Treatments' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              onClick={() => setActiveKpi('Time Spent in Treatments')}
            >
              Time Spent in Treatments
            </button>
          </div>

          {/* KPI Overview Section */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3">{activeKpi} Overview - {view} Performance</h2>
            {/* Removed the grid container and four card elements as requested */}
          </div>
        </div>

        {/* Scrollable Table Container (red box) */}
        <div className="px-6 mb-6">
          <div className="relative bg-white border border-gray-200 rounded-md shadow-sm">
            {/* Table Container with scrolling enabled */}
            <div style={{ overflowX: 'auto', width: '100%', overflowY: 'auto', maxHeight: 'calc(100vh - 215px)' }}>
              <table className="w-full border-separate border-spacing-0">
                <thead>
                  <tr>
                    <th 
                      className="sticky left-0 top-0 z-40 bg-gray-50 border-b border-r border-gray-200 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      style={{ width: '160px', minWidth: '160px' }}
                    >
                      <div className="flex items-center">
                        Therapist
                        <svg className="ml-1 w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                        </svg>
                      </div>
                    </th>
                    
                    {tableData.dates.map((date, index) => (
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
                      <div className="flex items-center">
                        Average
                        <svg className="ml-1 w-4 h-4 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                        </svg>
                      </div>
                    </th>
                    
                    <th 
                      className="sticky top-0 z-30 bg-green-50 border-b border-green-200 px-4 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider whitespace-nowrap min-w-[112px]"
                    >
                      <div className="flex items-center">
                        Total
                        <svg className="ml-1 w-4 h-4 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                        </svg>
                      </div>
                    </th>
                  </tr>
                </thead>
                
                <tbody>
                  {therapists.map((therapist, index) => {
                    const bgColor = index % 2 === 1 ? 'bg-gray-50' : 'bg-white';
                    
                    return (
                      <tr key={`data-${therapist.id}`} className={bgColor}>
                        <td 
                          className={`sticky left-0 z-20 ${bgColor} px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 border-r border-gray-200 border-b border-gray-200`}
                        >
                          {therapist.name}
                        </td>
                        
                        {tableData.dates.map((date, dateIndex) => {
                          const dataMap = view === 'Daily' 
                            ? therapist.data[activeKpi].dailyData 
                            : view === 'Weekly' 
                              ? therapist.data[activeKpi].weeklyData 
                              : therapist.data[activeKpi].monthlyData;
                          const value = dataMap[date];
                          
                          return (
                            <td 
                              key={`cell-${dateIndex}`}
                              className={`
                                border-b border-gray-200 px-4 py-3 text-sm
                                ${value === null ? 'text-gray-400 italic' : 'text-gray-900'}
                              `}
                            >
                              {formatValue(value)}
                            </td>
                          );
                        })}
                        
                        <td className="border-b border-blue-200 bg-blue-50 text-blue-700 px-4 py-3 text-right text-sm font-medium whitespace-nowrap">
                          {view === 'Daily' ? formatSummaryValue(calculateAverage(getValuesForTherapistForKpi(therapist, activeKpi))) : formatSummaryValue(calculateAverage(getValuesForTherapistForKpi(therapist, activeKpi)))}
                        </td>
                        
                        <td className="border-b border-green-200 bg-green-50 text-green-700 px-4 py-3 text-right text-sm font-medium whitespace-nowrap">
                          {view === 'Daily' ? formatSummaryValue(calculateTotal(getValuesForTherapistForKpi(therapist, activeKpi))) : formatSummaryValue(calculateTotal(getValuesForTherapistForKpi(therapist, activeKpi)))}
                        </td>
                      </tr>
                    );
                  })}
                  
                  {/* Summary Row */}
                  <tr className="bg-gray-700 text-white">
                    <td className="sticky left-0 z-20 px-4 py-3 whitespace-nowrap text-sm font-medium bg-gray-700 text-white border-r border-gray-600">
                      Summe/Durchschnitt
                    </td>
                    
                    {tableData.summary.values.map((value, valueIndex) => (
                      <td key={valueIndex} className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                        {formatSummaryValue(value)}
                      </td>
                    ))}
                    
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium bg-blue-600">
                      {formatSummaryValue(tableData.summary.average)}
                    </td>
                    
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium bg-green-600">
                      {formatSummaryValue(tableData.summary.total)}
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