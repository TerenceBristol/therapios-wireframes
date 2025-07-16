'use client';

import React, { useState, useEffect, useRef } from 'react';
import WireframeLayout from '@/components/WireframeLayout';
import WireframeButton from '@/components/WireframeButton';
import WireframeFormControl from '@/components/WireframeFormControl';

// --- Utility Functions ---
const formatDateFn = (date: Date): string => {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
};

const getDaysInMonthFn = (month: number, year: number): number => {
  return new Date(year, month + 1, 0).getDate();
};
// --- End Utility Functions ---

// --- Heilmittel Data from CSV (Kind="treatment") ---
// Regular Heilmittel (BV=FALSE)
const REGULAR_HEILMITTEL = [
  'BGM',    // Bindegewebsmassage
  'HR',     // Heiße Rolle
  'KÄL',    // Kältetherapie bei einem/mehreren Körperteilen
  'KG-H',   // KG, auch auf neurophysiolog. Grundlage
  'KMT-H',  // Klassische Massagetherapie
  'KOMP',   // Kompressionsbandagierung
  'MLD30H', // Manuelle Lymphdrainage Teilbehandlung 30 Min
  'MLD45H', // Manuelle Lymphdrainage Großbehandlung 45 Min
  'MLD60H', // Manuelle Lymphdrainage Ganzbehandlung 60 Min
  'MT-H',   // Manuelle Therapie
  'PNF',    // Krankengymnastik nach PNF
  'VO-E',   // Krankengymnastik nach Vojta (Erwachsene)
  'VO-K',   // Krankengymnastik nach Vojta (Kinder)
  'BO-E-H', // Krankengymnastik nach Bobath (Erwachsene) Heim
  'BO-K',   // Krankengymnastik nach Bobath (Kinder)
  'KGM-H',  // KG Atemtherapie bei Mucoviscidose 60 Min
];

// Blanko VO Heilmittel (BV=TRUE, Bereich=ERGO only)
const BLANKO_VO_HEILMITTEL = [
  'AB-E-BV',    // Verwaltungsaufwand Arztbericht (BV)
  'AEB-BV',     // Analyse ergoth. Bedarf (BV)  
  'BD-BV',      // Bedarfsdiagnostik (BV)
  'HB-E-BV',    // Hausbesuch inkl. Wegegeld (BV)
  'HBH-E-BV',   // Hausbesuch im Heim inkl. Wegegeld (BV)
  'MFB-2-H-BV', // ZI Mot. fumkt. Beh. 2 Tn
  'MFB-G-H-BV', // Beh. bei motor. Störungen Gruppe (BV)
  'MFB-H-BV',   // ZI Einzelbehandl. bei motor. Störungen
  'NOB-2-H-BV', // Hirnleistungstraining 2 TN (BV)
  'NOB-G-H-BV', // Hirnleistungstraining Gruppe (BV)
  'NOB-H-BV',   // Ergoth. Hirnleistungstraining (BV)
  'PFB-2-H-BV', // Beh. bei psych. Störungen 2 TN (BV)
  'PFB-G-H-BV', // Beh. bei psych. Störungen Gruppe (BV)
  'PFB-H-BV',   // Einzelbeh. bei psych-fkt. Störungen (BV)
  'VBP-BV',     // Versorgungsbezogene Pauschale (BV)
];

// All treatment Heilmittel combined
const ALL_TREATMENT_HEILMITTEL = [...REGULAR_HEILMITTEL, ...BLANKO_VO_HEILMITTEL];
// --- End Heilmittel Data ---

// Define the patient data type
type Patient = {
  id: number;
  name: string;
  facility: string;
  lastTreatment: string;
  frequencyWTD: string;
  therapeut: string; // Changed from organizer to therapeut
  prescription: string;
  status: string;
  doctor: string;
  selected?: boolean;
  session?: string;
  notes?: string;
  order?: number;  // Added order field (replaces startTime/endTime)
  treated?: boolean;
  treatmentHistory?: TreatmentEntry[];
  totalTreatments: number;  // Maximum number of treatments prescribed
  completedTreatments: number;  // Number of treatments completed
  rejectedTreatment?: boolean; // New field for rejection status in modal
  signatureObtained?: boolean; // New field for tracking if signature obtained for rejected treatments
  fvoStatus?: string; // New field for F.VO Status
  voDisplayStatus?: string; // For "Aktiv", "Abgerechnet", "Abgebrochen"
  voCancellationReason?: string; // To store the reason for VO cancellation
  voRawCancellationReason?: string; // To store the raw enum/string value of the reason
  voLogs?: VOLog[]; // New field for VO logs
  treatmentStatus?: string; // Add a separate status field
  heilmittel: string;  // Kurzzeichen from CSV
  isBlankoVO: boolean; // Derived from BV=TRUE
  therapiebericht: "Ja" | "Nein" | "Created"; // New field for therapy report availability
};

// Type for a treatment history entry
type TreatmentEntry = {
  date: string;
  notes?: string;
  session?: string;
  order?: number;  // Added order field
  signatureObtained?: boolean; // New field to track if signature was obtained for rejected treatments
  heilmittel?: string; // Optional, for Blanko VO treatments
};

// Type for therapy report form data
type TherapyReportForm = {
  therapyType: "Physiotherapie" | "Ergotherapie" | "Logopädie" | "";
  startDate: Date | null;
  endDate: Date | null;
  currentFindings: string;
  specialFeatures: string;
  treatmentAccordingToPrescription: boolean;
  changeTherapyFrequency: boolean;
  changeIndividualTherapy: boolean;
  changeGroupTherapy: boolean;
  continuationOfTherapyRecommended: boolean;
};

// New type for VO logs
type VOLog = {
  id: number;
  type: 'StatusChange' | 'FolgeVO' | 'Cancellation'; // Log types
  timestamp: string; // ISO date string format (will be displayed in locale format)
  description: string; // e.g., "Abgerechnet to Aktiv" or "Keine Folge-VO bestellen"
  details?: string; // Additional details or reason
};

// Type for break activity
type BreakActivity = {
  id: number;
  isBreak: true;
  activity: string;
  durationMinutes: number; // Added duration in minutes
  order?: number;  // Added order field
  customActivity?: string;  // Add field for custom activity text
};

// Add a DayActivity type to represent activities for a specific day
type DayActivity = {
  id: number;
  date: string;
  activity: string;
  durationMinutes: number;
  order: number;
  customActivity?: string;
};

// Type for modal items (either patient or break)
type ModalItem = Patient | BreakActivity;

// Create a union type with type discriminator
type CalendarItem = 
  | (Patient & { itemType: 'treatment', displayOrder: number })
  | (DayActivity & { itemType: 'activity', displayOrder: number });

// Define a type for toast notifications
type Toast = {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
  duration?: number;
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

// Toast notification component
const ToastNotification = ({ toast, onClose }: { 
  toast: Toast; 
  onClose: (id: number) => void;
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(toast.id);
    }, toast.duration || 5000);

    return () => clearTimeout(timer);
  }, [toast, onClose]);

  return (
    <div 
      className={`p-4 rounded-md shadow-md flex items-center z-50 mb-4 animate-slide-up w-full
        ${toast.type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' : 
          toast.type === 'error' ? 'bg-red-100 text-red-800 border border-red-200' : 
          'bg-blue-100 text-blue-800 border border-blue-200'}`}
    >
      <div className="mr-3">
        {toast.type === 'success' && (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        )}
        {toast.type === 'error' && (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        )}
        {toast.type === 'info' && (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )}
      </div>
      <div className="flex-1 font-medium">{toast.message}</div>
      <button 
        onClick={() => onClose(toast.id)} 
        className="ml-4 text-gray-500 hover:text-gray-700"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

// Searchable Dropdown Component for Heilmittel selection
const SearchableDropdown = ({ 
  options, 
  value, 
  onChange, 
  placeholder = "Search and select...",
  hasError = false 
}: {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  hasError?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOptions, setFilteredOptions] = useState(options);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter options based on search term
  useEffect(() => {
    const filtered = options.filter(option =>
      option.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredOptions(filtered);
  }, [searchTerm, options]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm(''); // Clear search when closing
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setIsOpen(true);
  };

  const handleOptionSelect = (option: string) => {
    onChange(option);
    setIsOpen(false);
    setSearchTerm(''); // Clear search term after selection
  };

  const handleClearSelection = () => {
    onChange('');
    setSearchTerm('');
    setIsOpen(false);
  };

  const handleInputFocus = () => {
    setIsOpen(true);
    setSearchTerm(''); // Clear search when opening dropdown
  };

  return (
    <div className="relative" ref={dropdownRef} style={{ zIndex: 10000 }}>
      <div className="relative">
        <input
          type="text"
          className={`w-full px-3 py-2 border rounded-md bg-white ${
            hasError 
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
              : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
          } focus:ring-1 focus:outline-none`}
          placeholder={!isOpen && value ? "" : placeholder}
          value={isOpen ? searchTerm : (value || "")}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          readOnly={!isOpen}
        />
        
        {/* Clear button */}
        {value && (
          <button
            type="button"
            onClick={handleClearSelection}
            className="absolute inset-y-0 right-8 flex items-center px-2 text-gray-400 hover:text-gray-600"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
        
        {/* Dropdown arrow */}
        <button
          type="button"
          onClick={() => {
            setIsOpen(!isOpen);
            setSearchTerm('');
          }}
          className="absolute inset-y-0 right-0 flex items-center px-2 text-gray-400 hover:text-gray-600"
        >
          <svg 
            className={`w-4 h-4 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Dropdown list */}
      {isOpen && (
        <div className="absolute z-[9999] w-full mt-1 bg-white border border-gray-300 rounded-md shadow-2xl overflow-y-auto" style={{ top: '100%', left: 0, height: '320px', minHeight: '320px', maxHeight: '320px' }}>
          {filteredOptions.length > 0 ? (
            <>
              {filteredOptions.map((option, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleOptionSelect(option)}
                  className={`w-full text-left px-3 py-0.5 text-sm hover:bg-blue-50 focus:bg-blue-50 focus:outline-none ${
                    value === option ? 'bg-blue-100 text-blue-900 font-medium' : 'text-gray-900'
                  }`}
                >
                  {option}
                </button>
              ))}
            </>
          ) : (
            <div className="px-3 py-2 text-gray-500 text-sm">
              No options found for "{searchTerm}"
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Calendar component for treatment visualization
const CalendarView = ({ 
  treatments, 
  activities,
  treatmentDate,
  onViewDocumentation,
  setTreatments,
  setDayActivities,
  onEditItem,
  onDocumentTreatment // Add new prop for document treatment button
}: { 
  treatments: Patient[];
  activities: DayActivity[];
  treatmentDate: string;
  onViewDocumentation: (patient: Patient) => void;
  setTreatments: React.Dispatch<React.SetStateAction<Patient[]>>;
  setDayActivities: React.Dispatch<React.SetStateAction<DayActivity[]>>;
  onEditItem: (item: { type: 'treatment' | 'activity', id: number, date: string }) => void;
  onDocumentTreatment: () => void; // Add type for new prop
}) => {
  // State for drag and drop in the calendar
  const [draggedCalendarItem, setDraggedCalendarItem] = useState<{id: number, type: 'treatment' | 'activity', date: string} | null>(null);
  
  // State for calendar navigation - MODIFIED TO DEFAULT TO CURRENT DATE'S WEEK
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // Sunday - 0, Monday - 1, ..., Saturday - 6
    const sunday = new Date(today);
    sunday.setDate(today.getDate() - dayOfWeek);
    sunday.setHours(0, 0, 0, 0); // Normalize to start of the day
    return sunday;
  });
  
  // Generate array of dates for the week
  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(currentWeekStart);
    date.setDate(currentWeekStart.getDate() + i);
    return date;
  });
  
  // Check if a date is today
  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };
  
  // Navigate to previous week
  const goToPreviousWeek = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(currentWeekStart.getDate() - 7);
    setCurrentWeekStart(newDate);
  };
  
  // Navigate to next week
  const goToNextWeek = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(currentWeekStart.getDate() + 7);
    setCurrentWeekStart(newDate);
  };
  
  // Go to current week
  const goToToday = () => {
    const today = new Date();
    const sunday = new Date(today);
    sunday.setDate(today.getDate() - today.getDay());
    setCurrentWeekStart(sunday);
  };
  
  // Format date as DD
  const formatDate = (date: Date) => {
    return date.getDate().toString();
  };
  
  // Get day name
  const getDayName = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
  };
  
  // Format date as DD.MM.YYYY
  const formatDateString = (date: Date) => {
    return `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getFullYear()}`;
  };
  
  // Get treatments for a specific day
  const getTreatmentsForDay = (date: Date): Patient[] => {
    // Format date to DD.MM.YYYY for comparison (to match treatment history format)
    const dateStr = formatDateString(date);
    
    return treatments.filter(patient => {
      // Skip patients without treatment history
      if (!patient.treatmentHistory || patient.treatmentHistory.length === 0) {
        return false;
      }
      
      // Find treatments that happened on this date
      return patient.treatmentHistory.some(entry => entry.date === dateStr);
    });
  };

  // Sort treatments by their order field for a specific date
  const sortTreatmentsByOrder = (treatments: Patient[], date: Date): Patient[] => {
    // Format the date string in the same format as stored in treatment history
    const dateStr = formatDateString(date);
    
    return [...treatments].sort((a, b) => {
      // Get the treatment entry for the specific date for each patient
      const aEntry = a.treatmentHistory?.find(entry => entry.date === dateStr);
      const bEntry = b.treatmentHistory?.find(entry => entry.date === dateStr);
      
      // Compare by order from the treatment entries
      return (aEntry?.order || 0) - (bEntry?.order || 0);
    });
  };
  
  // Get activities for a specific day
  const getActivitiesForDay = (date: Date): DayActivity[] => {
    // Format date to DD.MM.YYYY for comparison
    const dateStr = formatDateString(date);
    
    return activities.filter(activity => activity.date === dateStr);
  };

  // Combine treatments and activities and sort by order
  const getOrderedItemsForDay = (date: Date): CalendarItem[] => {
    const dateStr = formatDateString(date);
    
    // Get treatments for this day
    const dayTreatments = getTreatmentsForDay(date);
    
    // Map treatments to a common structure with their order for this day
    const treatmentItems = dayTreatments.map(treatment => {
      const entry = treatment.treatmentHistory?.find(e => e.date === dateStr);
      return {
        ...treatment,
        itemType: 'treatment' as const,
        displayOrder: entry?.order || 0
      };
    });
    
    // Get activities for this day
    const dayActivities = getActivitiesForDay(date);
    
    // Map activities to a common structure
    const activityItems = dayActivities.map(activity => ({
      ...activity,
      itemType: 'activity' as const,
      displayOrder: activity.order
    }));
    
    // Combine and sort by order
    return [...treatmentItems, ...activityItems].sort((a, b) => 
      a.displayOrder - b.displayOrder
    );
  };

  // Function to handle calendar item drag start
  const handleCalendarDragStart = (item: CalendarItem, date: Date, e: React.DragEvent) => {
    setDraggedCalendarItem({
      id: item.id,
      type: item.itemType,
      date: formatDateString(date)
    });
    
    // Set the drag image and add visual feedback
    if (e.dataTransfer) {
      // Set the drag effect
      e.dataTransfer.effectAllowed = 'move';
      
      // Set a drag ghost image if the browser supports it
      const targetElement = e.currentTarget as HTMLElement;
      if (targetElement) {
        // Add a visual style to indicate dragging
        targetElement.classList.add('opacity-70', 'border-blue-400', 'border-2');
        
        // When using setDragImage, we need a delay to ensure styles are applied
        setTimeout(() => {
          targetElement.classList.remove('opacity-70', 'border-blue-400', 'border-2');
        }, 0);
      }
    }
  };

  // Function to handle calendar item drag over
  const handleCalendarDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // Function to handle calendar item drop
  const handleCalendarDrop = (targetItem: CalendarItem, date: Date) => {
    if (!draggedCalendarItem) return;
    
    const dateStr = formatDateString(date);
    
    // Only allow reordering within the same day
    if (draggedCalendarItem.date !== dateStr) {
      setDraggedCalendarItem(null);
      return;
    }
    
    if (draggedCalendarItem.id === targetItem.id && 
        draggedCalendarItem.type === targetItem.itemType) {
      setDraggedCalendarItem(null);
      return;
    }
    
    // Get all items for this day to update orders correctly
    const allItems = getOrderedItemsForDay(date);
    
    // Find the dragged item and target item in the ordered list
    const draggedIndex = allItems.findIndex(item => 
      item.itemType === draggedCalendarItem.type && item.id === draggedCalendarItem.id
    );
    
    const targetIndex = allItems.findIndex(item => 
      item.itemType === targetItem.itemType && item.id === targetItem.id
    );
    
    if (draggedIndex === -1 || targetIndex === -1) {
      setDraggedCalendarItem(null);
      return;
    }
    
    // Remove the dragged item
    const draggedItem = allItems[draggedIndex];
    const updatedItems = [...allItems];
    updatedItems.splice(draggedIndex, 1);
    
    // Insert the dragged item at the target position
    updatedItems.splice(targetIndex, 0, draggedItem);
    
    // Update the display orders sequentially
    const reorderedItems = updatedItems.map((item, index) => ({
      ...item,
      displayOrder: index + 1
    }));
    
    // Update treatments with new orders
    const updatedTreatments = [...treatments];
    const updatedActivities = [...activities];
    
    // Process each item in the new order and update accordingly
    reorderedItems.forEach(item => {
      if (item.itemType === 'treatment') {
        const treatmentIndex = updatedTreatments.findIndex(t => t.id === item.id);
        if (treatmentIndex !== -1) {
          const treatment = updatedTreatments[treatmentIndex];
          if (treatment.treatmentHistory) {
            const entryIndex = treatment.treatmentHistory.findIndex(entry => entry.date === dateStr);
            if (entryIndex !== -1) {
              // Create a new treatment history array to maintain immutability
              const updatedHistory = [...treatment.treatmentHistory];
              updatedHistory[entryIndex] = {
                ...updatedHistory[entryIndex],
                order: item.displayOrder
              };
              updatedTreatments[treatmentIndex] = {
                ...treatment,
                treatmentHistory: updatedHistory
              };
            }
          }
        }
      } else if (item.itemType === 'activity') {
        const activityIndex = updatedActivities.findIndex(a => a.id === item.id && a.date === dateStr);
        if (activityIndex !== -1) {
          updatedActivities[activityIndex] = {
            ...updatedActivities[activityIndex],
            order: item.displayOrder
          };
        }
      }
    });
    
    // Update state with a slight delay to ensure smooth rendering
    setTimeout(() => {
      setTreatments(updatedTreatments);
      setDayActivities(updatedActivities);
      setDraggedCalendarItem(null);
    }, 50);
  };

  // Function to handle drag end
  const handleCalendarDragEnd = () => {
    setDraggedCalendarItem(null);
  };

  // Render a calendar item (either treatment or activity)
  const renderCalendarItem = (item: CalendarItem, date: Date, idx: number) => {
    const isBeingDragged = draggedCalendarItem && 
                          draggedCalendarItem.id === item.id && 
                          draggedCalendarItem.type === item.itemType &&
                          draggedCalendarItem.date === formatDateString(date);
                              
    if (item.itemType === 'treatment') {
      const treatment = item as Patient & { itemType: 'treatment', displayOrder: number }; // More specific type
      const dateStr = formatDateString(date);
      const historyEntry = treatment.treatmentHistory?.find(entry => entry.date === dateStr);
      
      // Different rejection statuses
      const isRejectedWithSignature = historyEntry?.session?.startsWith('Rejected-') && 
                                     historyEntry.session !== 'Rejected-NoCount' && 
                                     historyEntry.signatureObtained;
                                     
      const isRejectedWithoutSignature = historyEntry?.session === 'Rejected-NoCount' || 
                                        (historyEntry?.session?.startsWith('Rejected-') && !historyEntry.signatureObtained);
                                        
      const isRejected = isRejectedWithSignature || isRejectedWithoutSignature;
      
      // Format notes for display
      let displayNotes = historyEntry?.notes || '';
      if (displayNotes.startsWith("Treatment Rejected:")) {
        displayNotes = displayNotes.replace("Treatment Rejected:", "").trim();
      }
      
      return (
        <div 
          key={`treatment-${treatment.id}-${idx}`}
          onClick={() => onEditItem({ type: 'treatment', id: treatment.id, date: dateStr })}
          className={`mb-2 p-2 border rounded-md shadow-sm cursor-pointer ${isBeingDragged ? 'opacity-50' : ''} ${
            isRejectedWithSignature 
              ? 'bg-orange-100 border-orange-300 hover:bg-orange-200' 
              : isRejectedWithoutSignature
              ? 'bg-red-100 border-red-300 hover:bg-red-200'
              : 'bg-white border-gray-200 hover:bg-gray-50'
          }`}
          draggable
          onDragStart={(e) => handleCalendarDragStart(item, date, e)}
          onDragOver={handleCalendarDragOver}
          onDrop={() => handleCalendarDrop(item, date)}
          onDragEnd={handleCalendarDragEnd}
        >
          <div className="flex justify-between items-start mb-1">
            <div>
              <div className={`font-medium text-sm ${
                isRejectedWithSignature ? 'text-orange-700' : 
                isRejectedWithoutSignature ? 'text-red-700' : 
                ''
              }`}>{treatment.name}</div>
              <div className={`text-xs ${
                isRejectedWithSignature ? 'text-orange-600' : 
                isRejectedWithoutSignature ? 'text-red-600' : 
                'text-gray-600'
              }`}>
                {treatment.prescription} | {historyEntry?.session || treatment.session}
                {isRejectedWithSignature && (
                  <span className="ml-1 px-1.5 py-0.5 text-xs font-semibold bg-orange-200 text-orange-800 rounded-full">
                    Rejected (✓)
                  </span>
                )}
                {isRejectedWithoutSignature && (
                  <span className="ml-1 px-1.5 py-0.5 text-xs font-semibold bg-red-200 text-red-800 rounded-full">
                    Rejected (✗)
                  </span>
                )}
              </div>
            </div>
            <div className={`text-xs px-1.5 py-0.5 rounded-full ${
              isRejectedWithSignature ? 'bg-orange-200 text-orange-800' : 
              isRejectedWithoutSignature ? 'bg-red-200 text-red-800' : 
              'bg-blue-100 text-blue-800'
            }`}>
              #{historyEntry?.order || treatment.order || 0}
            </div>
          </div>
          
          {historyEntry?.notes && (
            <div className={`text-xs truncate ${
              isRejectedWithSignature ? 'text-orange-500' : 
              isRejectedWithoutSignature ? 'text-red-500' : 
              'text-gray-500'
            }`}>
              {displayNotes}
            </div>
          )}
        </div>
      );
    } else {
      // This is an activity
      const activity = item;
      
      return (
        <div 
          key={`activity-${activity.id}-${idx}`}
          onClick={() => onEditItem({ type: 'activity', id: activity.id, date: formatDateString(date) })}
          className={`mb-2 p-2 bg-gray-50 border border-gray-200 rounded-md shadow-sm cursor-pointer ${
            isBeingDragged ? 'opacity-50' : ''
          }`}
          draggable
          onDragStart={(e) => handleCalendarDragStart(item, date, e)}
          onDragOver={handleCalendarDragOver}
          onDrop={() => handleCalendarDrop(item, date)}
          onDragEnd={handleCalendarDragEnd}
        >
          <div className="flex justify-between items-start mb-1">
            <div>
              <div className="font-medium text-sm">
                {activity.activity === "Other" ? activity.customActivity || "Other Activity" : activity.activity}
              </div>
              <div className="text-xs text-gray-600">
                Duration: {activity.durationMinutes} min
              </div>
            </div>
            <div className="text-xs px-1.5 py-0.5 bg-gray-200 text-gray-800 rounded-full">
              #{activity.order}
            </div>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Calendar Navigation */}
      <div className="flex justify-between items-center p-4 border-b">
        <div className="flex space-x-2">
          <button 
            onClick={goToPreviousWeek} 
            className="px-3 py-1 border rounded-md hover:bg-gray-50"
          >
            &lt; Prev
          </button>
          <button 
            onClick={goToToday} 
            className="px-3 py-1 border rounded-md hover:bg-gray-50"
          >
            Today
          </button>
          <button 
            onClick={goToNextWeek} 
            className="px-3 py-1 border rounded-md hover:bg-gray-50"
          >
            Next &gt;
          </button>
        </div>
        <div className="font-medium">
          {currentWeekStart.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </div>
        {/* Add Document Treatment button */}
        <button 
          onClick={onDocumentTreatment}
          className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md text-sm font-medium"
        >
          Document Treatment
        </button>
      </div>
      
      {/* Calendar Grid - Day Based */}
      <div className="overflow-auto" style={{ maxHeight: 'calc(100vh - 240px)' }}>
        <div className="grid grid-cols-7 min-w-full">
          {/* Day Headers */}
          {weekDates.map((date, index) => (
            <div
              key={index}
              className={`p-3 text-center border-r ${isToday(date) ? 'bg-blue-100' : ''}`}
            >
              <div className="text-xs font-medium text-gray-500">{getDayName(date)}</div>
              <div className={`text-xl font-semibold ${isToday(date) ? 'text-blue-600' : 'text-gray-800'}`}>
                {isToday(date) ? (
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center mx-auto">
                    {formatDate(date)}
                  </div>
                ) : (
                  formatDate(date)
                )}
              </div>
            </div>
          ))}
          
          {/* Treatment and activity cards for each day */}
          <div className="col-span-7 grid grid-cols-7">
            {weekDates.map((date, dateIndex) => {
              const orderedItems = getOrderedItemsForDay(date);
              
              return (
                <div key={dateIndex} className="min-h-[200px] border-r border-t p-2 overflow-y-auto">
                  {orderedItems.length > 0 ? (
                    orderedItems.map((item, idx) => renderCalendarItem(item, date, idx))
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                      No items
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function TreatmentDocumentationV2Wireframe() {
  // State for modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPatientId, setCurrentPatientId] = useState<number | null>(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isDocumentationModalOpen, setIsDocumentationModalOpen] = useState(false);
  const [viewingPatient, setViewingPatient] = useState<Patient | null>(null);
  const [collapsedCards, setCollapsedCards] = useState<number[]>([]);
  
  // State for logs modal
  const [isLogsModalOpen, setIsLogsModalOpen] = useState(false);
  const [patientForLogs, setPatientForLogs] = useState<Patient | null>(null);
  const [nextLogId, setNextLogId] = useState(1); // New state for generating log IDs
  
  // State for therapy report modal
  const [isTherapyReportModalOpen, setIsTherapyReportModalOpen] = useState(false);
  const [therapyReportPatient, setTherapyReportPatient] = useState<Patient | null>(null);
  const [therapyReportForm, setTherapyReportForm] = useState<TherapyReportForm>({
    therapyType: "",
    startDate: null,
    endDate: null,
    currentFindings: "",
    specialFeatures: "",
    treatmentAccordingToPrescription: true,
    changeTherapyFrequency: false,
    changeIndividualTherapy: false,
    changeGroupTherapy: false,
    continuationOfTherapyRecommended: true
  });
  
  // State for therapy report form calendar controls
  const [startDateCalendarOpen, setStartDateCalendarOpen] = useState(false);
  const [endDateCalendarOpen, setEndDateCalendarOpen] = useState(false);
  const [startDateCalendarMonth, setStartDateCalendarMonth] = useState(new Date().getMonth());
  const [startDateCalendarYear, setStartDateCalendarYear] = useState(new Date().getFullYear());
  const [endDateCalendarMonth, setEndDateCalendarMonth] = useState(new Date().getMonth());
  const [endDateCalendarYear, setEndDateCalendarYear] = useState(new Date().getFullYear());
  
  // State for toast notifications
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [nextToastId, setNextToastId] = useState(1);
  
  // Tab navigation state - new state for tracking active tab
  const [activeTab, setActiveTab] = useState<'active-patients' | 'inactive-patients' | 'calendar'>('active-patients');
  
  // State to track which patients' suggestions are visible (now an array) - This will be removed later if unused
  const [visibleSuggestions, setVisibleSuggestions] = useState<number[]>([]);
  
  const [treatmentDate, setTreatmentDate] = useState(formatDateFn(new Date())); // Use renamed function
  const [modalPatients, setModalPatients] = useState<ModalItem[]>([]);
  const [nextBreakId, setNextBreakId] = useState<number>(1000); // Use a different range for break IDs
  const [draggedPatientId, setDraggedPatientId] = useState<number | null>(null);
  const [activityDropdownOpen, setActivityDropdownOpen] = useState(false); // State for activity dropdown
  
  // Removed modal states for simplified prototype
  
  // State for selected patient IDs for batch actions
  const [selectedPatientIds, setSelectedPatientIds] = useState<number[]>([]);
  
  // State for Heilmittel selection and validation in treatment modal
  const [selectedHeilmittel, setSelectedHeilmittel] = useState<{[patientId: number]: string}>({});
  const [heilmittelErrors, setHeilmittelErrors] = useState<{[patientId: number]: boolean}>({});
  
  // State for duration selection for Blanko VO patients (in minutes)
  const [selectedDuration, setSelectedDuration] = useState<{[patientId: number]: number}>({});
  const [durationErrors, setDurationErrors] = useState<{[patientId: number]: boolean}>({});
  
  // Function to update Heilmittel selection for a patient
  const updatePatientHeilmittel = (patientId: number, heilmittel: string) => {
    setSelectedHeilmittel(prev => ({
      ...prev,
      [patientId]: heilmittel
    }));
    
    // Clear error when selection is made
    if (heilmittel) {
      setHeilmittelErrors(prev => ({
        ...prev,
        [patientId]: false
      }));
    }
  };
  
  // Function to update duration selection for a patient
  const updatePatientDuration = (patientId: number, duration: number) => {
    setSelectedDuration(prev => ({
      ...prev,
      [patientId]: duration
    }));
    
    // Clear error when selection is made
    if (duration) {
      setDurationErrors(prev => ({
        ...prev,
        [patientId]: false
      }));
    }
  };
  
  // Duration options in 15-minute intervals up to 180 minutes
  const durationOptions = [15, 30, 45, 60, 75, 90, 105, 120, 135, 150, 165, 180];
  
  // Function to validate required Heilmittel and Duration for Blanko VO patients
  const validateHeilmittelSelection = (patients: Patient[]): boolean => {
    const heilmittelErrors: {[patientId: number]: boolean} = {};
    const durationErrors: {[patientId: number]: boolean} = {};
    let hasErrors = false;
    
    patients.forEach(patient => {
      if (patient.isBlankoVO) {
        const hasHeilmittelSelection = selectedHeilmittel[patient.id] && selectedHeilmittel[patient.id].trim() !== '';
        const hasDurationSelection = selectedDuration[patient.id] && selectedDuration[patient.id] > 0;
        
        if (!hasHeilmittelSelection) {
          heilmittelErrors[patient.id] = true;
          hasErrors = true;
        }
        
        if (!hasDurationSelection) {
          durationErrors[patient.id] = true;
          hasErrors = true;
        }
      }
    });
    
    setHeilmittelErrors(heilmittelErrors);
    setDurationErrors(durationErrors);
    return !hasErrors;
  };
  
  // Function to add a toast notification
  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'success', duration = 5000) => {
    const newToast: Toast = {
      id: nextToastId,
      message,
      type,
      duration
    };
    
    setToasts(prev => [...prev, newToast]);
    setNextToastId(prev => prev + 1);
  };
  
  // Function to remove a toast
  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };
  
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
  
  // Predefined activity types
  const activityTypes = [
    "Pause",
    "Gespr. m. Pflege",
    "Gespr. m. Angeh.",
    "Langer Weg",
    "Doku",
    "Orga",
    "Other"
  ];
  
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

  // Function to get random therapiebericht value (60% "Ja", 40% "Nein")
  const getRandomTherapiebericht = (): "Ja" | "Nein" => {
    return Math.random() < 0.6 ? "Ja" : "Nein";
  };
  
  // State for selected patients
  const [patients, setPatients] = useState<Patient[]>([
    {
      id: 1,
      name: 'John Smith',
      facility: 'Main Hospital',
      lastTreatment: '18.03.2025',
      frequencyWTD: '2',
      therapeut: 'Therapist A',
      prescription: '1234-1',
      status: 'Active',
      doctor: 'Dr. Wilson',
      selected: false,
      totalTreatments: 0, // Blanko VO patient - totalTreatments = 0
      completedTreatments: 0, // Current treatments completed
      treated: false,
      heilmittel: 'MFB-H-BV', // Blanko VO Heilmittel (ERGO)
      isBlankoVO: true, // Blanko VO patient
      treatmentHistory: [],
      therapiebericht: "Ja" // Therapy report available
    },
    {
      id: 2,
      name: 'Emma Johnson',
      facility: 'Rehab Center',
      lastTreatment: '20.03.2025',
      frequencyWTD: '2',
      therapeut: 'Therapist B',
      prescription: '5678-2',
      status: 'Active',
      doctor: 'Dr. Miller',
      selected: false,
      totalTreatments: 0, // Blanko VO patient - totalTreatments = 0
      completedTreatments: 0, // Current treatments completed
      treated: false,
      heilmittel: 'NOB-H-BV', // Blanko VO Heilmittel (ERGO)
      isBlankoVO: true, // Blanko VO patient
      treatmentHistory: [],
      therapiebericht: "Nein" // Therapy report not available
    },
    {
      id: 3,
      name: 'Michael Williams',
      facility: 'Sports Clinic',
      lastTreatment: '19.03.2025',
      frequencyWTD: '2',
      therapeut: 'Therapist A',
      prescription: '9101-3',
      status: 'Active',
      doctor: 'Dr. Brown',
      selected: false,
      totalTreatments: 0, // Blanko VO patient - totalTreatments = 0
      completedTreatments: 0, // Current treatments completed
      treated: false,
      heilmittel: 'PFB-H-BV', // Blanko VO Heilmittel
      isBlankoVO: true, // Blanko VO patient
      treatmentHistory: [],
      therapiebericht: "Ja" // Therapy report available
    },
    {
      id: 4,
      name: 'Patricia Brown',
      facility: 'Elder Care',
      lastTreatment: '21.03.2025',
      frequencyWTD: '2',
      therapeut: 'Therapist B',
      prescription: '1122-4',
      status: 'Active',
      doctor: 'Dr. Taylor',
      selected: false,
      totalTreatments: 20,
      completedTreatments: 14,
      treated: true,
      heilmittel: 'BGM', // Regular Heilmittel
      isBlankoVO: false, // Regular patient
      treatmentHistory: [
        {
          date: '11.02.2025', // Tuesday - mid Feb
          notes: 'Initial evaluation of mobility and balance.',
          session: '1/20',
          order: 1
        },
        {
          date: '14.02.2025', // Friday - mid Feb
          notes: 'Started passive ROM exercises.',
          session: '2/20',
          order: 2
        },
        {
          date: '18.02.2025', // Tuesday - mid Feb
          notes: 'Progressed to active-assisted ROM.',
          session: '3/20',
          order: 3
        },
        {
          date: '21.02.2025', // Friday - mid Feb
          notes: 'Gentle strengthening initiated.',
          session: '4/20',
          order: 1
        },
        {
          date: '25.02.2025', // Tuesday - Last week of Feb
          notes: 'Transfer training from bed to chair.',
          session: '5/20',
          order: 2
        },
        {
          date: '28.02.2025', // Friday - Last week of Feb
          notes: 'Started seated balance exercises.',
          session: '6/20',
          order: 1
        },
        {
          date: '04.03.2025', // Tuesday - 1st week of March
          notes: 'Progressed to standing balance with support.',
          session: '7/20',
          order: 3
        },
        {
          date: '07.03.2025', // Friday - 1st week of March
          notes: 'Added gentle strength training for lower extremities.',
          session: '8/20',
          order: 1
        },
        {
          date: '11.03.2025', // Tuesday - 2nd week of March
          notes: 'Focus on transfer training and safety.',
          session: '9/20',
          order: 3
        },
        {
          date: '14.03.2025', // Friday - 2nd week of March
          notes: 'Gait training with assistive device.',
          session: '10/20',
          order: 2
        },
        {
          date: '18.03.2025', // Tuesday - 3rd week of March
          notes: 'Continued with balance and strength exercises.',
          session: '11/20',
          order: 1
        },
        {
          date: '21.03.2025', // Friday - 3rd week of March
          notes: 'Progressed to more challenging balance activities.',
          session: '12/20',
          order: 2
        },
        {
          date: '25.03.2025', // Tuesday - 4th week of March
          notes: 'Stair training with supervision.',
          session: '13/20',
          order: 3
        },
        {
          date: '28.03.2025', // Friday - 4th week of March
          notes: 'Home exercise program demonstration.',
          session: '14/20',
          order: 1
        }
      ],
      therapiebericht: "Ja" // Therapy report available
    },
    {
      id: 5,
      name: 'Thomas Miller',
      facility: 'Ortho Institute',
      lastTreatment: '20.03.2025',
      frequencyWTD: '2',
      therapeut: 'Therapist A',
      prescription: '3344-5',
      status: 'Active',
      doctor: 'Dr. Roberts',
      selected: false,
      totalTreatments: 15,
      completedTreatments: 10,
      treated: true,
      heilmittel: 'KMT-H', // Regular Heilmittel
      isBlankoVO: false, // Regular patient
      treatmentHistory: [
        {
          date: '04.02.2025', // Tuesday - early Feb
          notes: 'Post-operative evaluation of shoulder.',
          session: '1/15',
          order: 1
        },
        {
          date: '07.02.2025', // Friday - early Feb
          notes: 'PROM within safe limits.',
          session: '2/15',
          order: 2
        },
        {
          date: '24.02.2025', // Monday - Last week of Feb
          notes: 'Initial evaluation of shoulder ROM and strength.',
          session: '3/15',
          order: 2
        },
        {
          date: '27.02.2025', // Thursday - Last week of Feb
          notes: 'Gentle mobilizations and pendulum exercises.',
          session: '4/15',
          order: 1
        },
        {
          date: '03.03.2025', // Monday - 1st week of March
          notes: 'Progressed to active-assisted ROM.',
          session: '5/15',
          order: 3
        },
        {
          date: '06.03.2025', // Thursday - 1st week of March
          notes: 'Added isometric strengthening exercises.',
          session: '6/15',
          order: 2
        },
        {
          date: '10.03.2025', // Monday - 2nd week of March
          notes: 'Progressed to light resistance with theraband.',
          session: '7/15',
          order: 1
        },
        {
          date: '13.03.2025', // Thursday - 2nd week of March
          notes: 'Added scapular stabilization exercises.',
          session: '8/15',
          order: 3
        },
        {
          date: '17.03.2025', // Monday - 3rd week of March
          notes: 'Increased resistance for rotator cuff strengthening.',
          session: '9/15',
          order: 2
        },
        {
          date: '20.03.2025', // Thursday - 3rd week of March
          notes: 'Focus on functional reaching activities.',
          session: '10/15',
          order: 1
        }
      ],
      therapiebericht: "Nein" // Therapy report not available
    },
    {
      id: 9,
      name: 'Sarah Davis',
      facility: 'Pain Management Center',
      lastTreatment: '22.03.2025',
      frequencyWTD: '2',
      therapeut: 'Therapist B',
      prescription: '7788-6',
      status: 'Active',
      doctor: 'Dr. Anderson',
      selected: false,
      totalTreatments: 16,
      completedTreatments: 5,
      treated: true,
      heilmittel: 'MLD30H', // Regular Heilmittel
      isBlankoVO: false, // Regular patient
      treatmentHistory: [
        {
          date: '08.03.2025',
          notes: 'Initial chronic pain assessment.',
          session: '1/16',
          order: 1
        },
        {
          date: '12.03.2025',
          notes: 'Manual therapy for lower back pain.',
          session: '2/16',
          order: 2
        },
        {
          date: '15.03.2025',
          notes: 'Core strengthening exercises introduced.',
          session: '3/16',
          order: 1
        },
        {
          date: '19.03.2025',
          notes: 'Pain management education and exercises.',
          session: '4/16',
          order: 3
        },
        {
          date: '22.03.2025',
          notes: 'Progressed to functional movement training.',
          session: '5/16',
          order: 2
        }
      ],
      therapiebericht: "Ja" // Therapy report available
    },
    {
      id: 10,
      name: 'David Wilson',
      facility: 'Cardiac Rehab',
      lastTreatment: '21.03.2025',
      frequencyWTD: '2',
      therapeut: 'Therapist A',
      prescription: '4455-7',
      status: 'Active',
      doctor: 'Dr. Thompson',
      selected: false,
      totalTreatments: 24,
      completedTreatments: 8,
      treated: true,
      heilmittel: 'PNF', // Regular Heilmittel
      isBlankoVO: false, // Regular patient
      treatmentHistory: [
        {
          date: '01.03.2025',
          notes: 'Post-cardiac event evaluation.',
          session: '1/24',
          order: 1
        },
        {
          date: '05.03.2025',
          notes: 'Low-intensity cardiovascular training.',
          session: '2/24',
          order: 2
        },
        {
          date: '08.03.2025',
          notes: 'Breathing exercises and light activity.',
          session: '3/24',
          order: 1
        },
        {
          date: '12.03.2025',
          notes: 'Progressed exercise intensity gradually.',
          session: '4/24',
          order: 3
        },
        {
          date: '15.03.2025',
          notes: 'Education on heart-healthy lifestyle.',
          session: '5/24',
          order: 2
        },
        {
          date: '19.03.2025',
          notes: 'Resistance training with monitoring.',
          session: '6/24',
          order: 1
        },
        {
          date: '21.03.2025',
          notes: 'Continued cardiovascular conditioning.',
          session: '7/24',
          order: 3
        },
        {
          date: '21.03.2025',
          notes: 'Patient education on home exercise program.',
          session: '8/24',
          order: 1
        }
      ],
      therapiebericht: "Nein" // Therapy report not available
    },
    {
      id: 11,
      name: 'Lisa Martinez',
      facility: 'Neurological Center',
      lastTreatment: '20.03.2025',
      frequencyWTD: '2',
      therapeut: 'Therapist B',
      prescription: '6677-8',
      status: 'Active',
      doctor: 'Dr. Garcia',
      selected: false,
      totalTreatments: 30,
      completedTreatments: 12,
      treated: true,
      heilmittel: 'BO-E-H', // Regular Heilmittel
      isBlankoVO: false, // Regular patient
      treatmentHistory: [
        {
          date: '18.02.2025',
          notes: 'Post-stroke evaluation and assessment.',
          session: '1/30',
          order: 1
        },
        {
          date: '22.02.2025',
          notes: 'Passive range of motion exercises.',
          session: '2/30',
          order: 2
        },
        {
          date: '26.02.2025',
          notes: 'Balance training and gait work.',
          session: '3/30',
          order: 1
        },
        {
          date: '01.03.2025',
          notes: 'Progressed to active assisted exercises.',
          session: '4/30',
          order: 3
        },
        {
          date: '05.03.2025',
          notes: 'Functional mobility training.',
          session: '5/30',
          order: 2
        },
        {
          date: '08.03.2025',
          notes: 'Speech therapy coordination.',
          session: '6/30',
          order: 1
        },
        {
          date: '12.03.2025',
          notes: 'Activities of daily living practice.',
          session: '7/30',
          order: 3
        },
        {
          date: '15.03.2025',
          notes: 'Cognitive-motor task training.',
          session: '8/30',
          order: 2
        },
        {
          date: '19.03.2025',
          notes: 'Advanced balance and coordination.',
          session: '9/30',
          order: 1
        },
        {
          date: '20.03.2025',
          notes: 'Family education on home exercises.',
          session: '10/30',
          order: 3
        },
        {
          date: '20.03.2025',
          notes: 'Adaptive equipment evaluation.',
          session: '11/30',
          order: 2
        },
        {
          date: '20.03.2025',
          notes: 'Community reintegration planning.',
          session: '12/30',
          order: 1
        }
      ],
      therapiebericht: "Ja" // Therapy report available
    },
    {
      id: 12,
      name: 'Kevin Lee',
      facility: 'Industrial Rehab',
      lastTreatment: '19.03.2025',
      frequencyWTD: '2',
      therapeut: 'Therapist A',
      prescription: '9988-9',
      status: 'Active',
      doctor: 'Dr. Johnson',
      selected: false,
      totalTreatments: 14,
      completedTreatments: 7,
      treated: true,
      heilmittel: 'KOMP', // Regular Heilmittel
      isBlankoVO: false, // Regular patient
      treatmentHistory: [
        {
          date: '26.02.2025',
          notes: 'Work-related injury assessment.',
          session: '1/14',
          order: 1
        },
        {
          date: '01.03.2025',
          notes: 'Ergonomic evaluation and education.',
          session: '2/14',
          order: 2
        },
        {
          date: '05.03.2025',
          notes: 'Job-specific movement training.',
          session: '3/14',
          order: 1
        },
        {
          date: '08.03.2025',
          notes: 'Lifting mechanics and body mechanics.',
          session: '4/14',
          order: 3
        },
        {
          date: '12.03.2025',
          notes: 'Functional capacity evaluation.',
          session: '5/14',
          order: 2
        },
        {
          date: '15.03.2025',
          notes: 'Work hardening program initiation.',
          session: '6/14',
          order: 1
        },
        {
          date: '19.03.2025',
          notes: 'Return-to-work conditioning.',
          session: '7/14',
          order: 3
        }
      ],
      therapiebericht: "Nein" // Therapy report not available
    },
    {
      id: 13,
      name: 'Maria Rodriguez',
      facility: 'Women\'s Health Clinic',
      lastTreatment: '22.03.2025',
      frequencyWTD: '2',
      therapeut: 'Therapist B',
      prescription: '1357-0',
      status: 'Active',
      doctor: 'Dr. Williams',
      selected: false,
      totalTreatments: 8,
      completedTreatments: 4,
      treated: true,
      heilmittel: 'HR', // Regular Heilmittel  
      isBlankoVO: false, // Regular patient
      treatmentHistory: [
        {
          date: '08.03.2025',
          notes: 'Postpartum pelvic floor evaluation.',
          session: '1/8',
          order: 1
        },
        {
          date: '12.03.2025',
          notes: 'Pelvic floor strengthening exercises.',
          session: '2/8',
          order: 2
        },
        {
          date: '15.03.2025',
          notes: 'Core rehabilitation and diastasis recti.',
          session: '3/8',
          order: 1
        },
        {
          date: '22.03.2025',
          notes: 'Functional movement and posture correction.',
          session: '4/8',
          order: 3
        }
      ],
      therapiebericht: "Ja" // Therapy report available
    }
  ]);

  // State for inactive patients
  const [inactivePatients, setInactivePatients] = useState<Patient[]>([
    {
      id: 6, // Ensure unique IDs
      name: 'Sarah Davis',
      facility: 'Pain Management',
      lastTreatment: '19.03.2025',
      frequencyWTD: '2',
      therapeut: 'Therapist C',
      prescription: '5566-6',
      status: 'Active',
      doctor: 'Dr. Anderson',
      selected: false,
      totalTreatments: 12,
      completedTreatments: 7,
      treated: true,
      heilmittel: 'MLD30H', // Regular Heilmittel
      isBlankoVO: false, // Regular patient
      treatmentHistory: [
        { date: '10.01.2025', notes: 'Completed all sessions.', session: '10/10', order: 1 }
      ],
      therapiebericht: getRandomTherapiebericht()
    },
    {
      id: 7,
      name: 'David Wilson',
      facility: 'Cardiac Rehab',
      lastTreatment: '22.03.2025',
      frequencyWTD: '3',
      therapeut: 'Therapist D',
      prescription: '7788-7',
      status: 'Active',
      doctor: 'Dr. Thompson',
      selected: false,
      totalTreatments: 24,
      completedTreatments: 18,
      treated: true,
      heilmittel: 'PNF', // Regular Heilmittel
      isBlankoVO: false, // Regular patient
      treatmentHistory: [
        { date: '05.12.2024', notes: 'Treatment terminated by therapist.', session: '5/12', order: 1 }
      ],
      therapiebericht: getRandomTherapiebericht()
    },
    {
      id: 8,
      name: 'Lisa Martinez',
      facility: 'Neurological Center',
      lastTreatment: '17.03.2025',
      frequencyWTD: '2',
      therapeut: 'Therapist E',
      prescription: '9900-8',
      status: 'Active',
      doctor: 'Dr. Davis',
      selected: false,
      totalTreatments: 16,
      completedTreatments: 9,
      treated: true,
      heilmittel: 'BO-E-H', // Regular Heilmittel
      isBlankoVO: false, // Regular patient
      treatmentHistory: [
        { date: '15.11.2024', notes: 'Patient self-discharged.', session: '3/8', order: 1 }
      ],
      therapiebericht: getRandomTherapiebericht()
    },
    {
      id: 9,
      name: 'Kevin Lee',
      facility: 'Industrial Rehab',
      lastTreatment: '18.03.2025',
      frequencyWTD: '2',
      therapeut: 'Therapist F',
      prescription: '1133-9',
      status: 'Active',
      doctor: 'Dr. Garcia',
      selected: false,
      totalTreatments: 14,
      completedTreatments: 11,
      treated: true,
      heilmittel: 'KOMP', // Regular Heilmittel
      isBlankoVO: false, // Regular patient
      treatmentHistory: [
        { date: '18.03.2025', notes: 'Industrial rehab exercises.', session: '11/14', order: 1 }
      ],
      therapiebericht: getRandomTherapiebericht()
    },
    {
      id: 10,
      name: 'Maria Rodriguez',
      facility: 'Women\'s Health Clinic',
      lastTreatment: '20.03.2025',
      frequencyWTD: '2',
      therapeut: 'Therapist G',
      prescription: '2244-10',
      status: 'Active',
      doctor: 'Dr. Kim',
      selected: false,
      totalTreatments: 10,
      completedTreatments: 6,
      treated: true,
      heilmittel: 'HR', // Regular Heilmittel
      isBlankoVO: false, // Regular patient
      treatmentHistory: [
        { date: '20.03.2025', notes: 'Women\'s health therapy session.', session: '6/10', order: 1 }
      ],
      therapiebericht: getRandomTherapiebericht()
    }
  ]);

  // Modified function to assign order for all items including breaks
  const assignOrder = (itemsList: ModalItem[]) => {
    // Assign sequential order to all items
    return itemsList.map((item, index) => {
      const order = index + 1;
      
      if ('isBreak' in item) {
        // Ensure break has duration set
        const duration = item.durationMinutes || 20; // Default to 20 minutes
        return { ...item, order, durationMinutes: duration };
      } else {
        // Ensure patient has notes
        const notes = item.notes || getRandomNote();
        return { ...item, order, notes };
      }
    });
  };

  // Function to move a break or patient up in the list
  const moveItemUp = (itemId: number) => {
    const itemIndex = modalPatients.findIndex(item => item.id === itemId);
    
    // Can't move up if it's the first item
    if (itemIndex <= 0) return;
    
    const updatedItems = [...modalPatients];
    // Swap with the item above
    [updatedItems[itemIndex], updatedItems[itemIndex - 1]] = 
    [updatedItems[itemIndex - 1], updatedItems[itemIndex]];
    
    // Reassign order numbers
    const itemsWithNewOrder = assignOrder(updatedItems);
    setModalPatients(itemsWithNewOrder);
  };

  // Function to move a break or patient down in the list
  const moveItemDown = (itemId: number) => {
    const itemIndex = modalPatients.findIndex(item => item.id === itemId);
    
    // Can't move down if it's the last item
    if (itemIndex === -1 || itemIndex >= modalPatients.length - 1) return;
    
    const updatedItems = [...modalPatients];
    // Swap with the item below
    [updatedItems[itemIndex], updatedItems[itemIndex + 1]] = 
    [updatedItems[itemIndex + 1], updatedItems[itemIndex]];
    
    // Reassign order numbers
    const itemsWithNewOrder = assignOrder(updatedItems);
    setModalPatients(itemsWithNewOrder);
  };

  // Function to update modal patients when the modal opens
  useEffect(() => {
    if (isModalOpen) {
      const selected = patients.filter(patient => patient.selected);
      const newModalPatients = assignOrder(selected);
      setModalPatients(newModalPatients);
      
      // Set all cards as collapsed when the modal opens
      setCollapsedCards(newModalPatients.map(patient => patient.id));
      
      // Automatically show suggestions for all patients when the modal opens
      setVisibleSuggestions(newModalPatients.map(patient => patient.id));
    } else {
      // Clear visible suggestions and collapsed cards when the modal closes
      setVisibleSuggestions([]);
      setCollapsedCards([]);
    }
  }, [isModalOpen, patients]);

  // Function to handle drag start for drag and drop
  const handleDragStart = (patientId: number, e: React.DragEvent) => {
    setDraggedPatientId(patientId);
    
    // Set the drag image and add visual feedback
    if (e.dataTransfer) {
      // Set the drag effect
      e.dataTransfer.effectAllowed = 'move';
      
      // Set a drag ghost image if the browser supports it
      const targetElement = e.currentTarget as HTMLElement;
      if (targetElement) {
        // Add a visual style to indicate dragging
        targetElement.classList.add('opacity-70', 'border-blue-400', 'border-2');
        
        // When using setDragImage, we need a delay to ensure styles are applied
        setTimeout(() => {
          targetElement.classList.remove('opacity-70', 'border-blue-400', 'border-2');
        }, 0);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
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

      // Reassign order based on the new sequence
      const itemsWithNewOrder = assignOrder(updatedPatients);
      
      // Update modal patients with new order with a slight delay to ensure smooth rendering
      setTimeout(() => {
        setModalPatients(itemsWithNewOrder);
        setDraggedPatientId(null);
      }, 50);
    } else {
      setDraggedPatientId(null);
    }
  };

  // Function to handle drag end
  const handleDragEnd = () => {
    setDraggedPatientId(null);
  };

  // Function to toggle the documentation view modal
  const toggleDocumentationModal = (patient: Patient | null) => {
    setViewingPatient(patient);
    setIsDocumentationModalOpen(!isDocumentationModalOpen);
  };

  // Function to toggle the logs view modal
  const toggleLogsModal = (patient: Patient | null) => {
    setPatientForLogs(patient);
    setIsLogsModalOpen(!isLogsModalOpen);
  };

  // Function to open therapy report modal
  const openTherapyReportModal = (patient: Patient) => {
    setTherapyReportPatient(patient);
    setIsTherapyReportModalOpen(true);
    // Reset form to defaults
    setTherapyReportForm({
      therapyType: "",
      startDate: null,
      endDate: null,
      currentFindings: "",
      specialFeatures: "",
      treatmentAccordingToPrescription: true,
      changeTherapyFrequency: false,
      changeIndividualTherapy: false,
      changeGroupTherapy: false,
      continuationOfTherapyRecommended: true
    });
    setTherapyReportErrors({});
    setTherapyReportModalError("");
  };

  // Function to close therapy report modal
  const closeTherapyReportModal = () => {
    setIsTherapyReportModalOpen(false);
    setTherapyReportPatient(null);
    setTherapyReportErrors({});
    setTherapyReportModalError("");
    // Form state will be reset when modal opens again
  };

  // Function to update therapy report form fields
  const updateTherapyReportForm = (field: keyof TherapyReportForm, value: any) => {
    setTherapyReportForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Function to validate therapy report form
  const validateTherapyReportForm = (): boolean => {
    const { therapyType, startDate, endDate, currentFindings, specialFeatures } = therapyReportForm;
    
    // Check required fields
    if (!therapyType || !startDate || !endDate || !currentFindings.trim() || !specialFeatures.trim()) {
      return false;
    }
    
    // Check date range (end date should be after start date)
    if (endDate <= startDate) {
      return false;
    }
    
    return true;
  };

  // Function to toggle card collapse
  const toggleCardCollapse = (itemId: number) => {
    setCollapsedCards(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
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
      patient.id === id && !('isBreak' in patient) ? { ...patient, notes } : patient
    ) as ModalItem[]);
    // Hide suggestions when user types - This will be removed later if unused
    if (visibleSuggestions.includes(id)) {
      setVisibleSuggestions(visibleSuggestions.filter(suggestionId => suggestionId !== id));
    }
  };

  // Function to update patient rejection status
  const updatePatientRejection = (id: number, rejected: boolean) => {
    setModalPatients(modalPatients.map(patient =>
      patient.id === id && !('isBreak' in patient) ? { 
        ...patient, 
        rejectedTreatment: rejected,
        // If rejection is being turned off, also turn off signature obtained
        ...(rejected === false ? { signatureObtained: false } : {})
      } : patient
    ) as ModalItem[]);
  };

  // Function to update signature obtained status
  const updateSignatureObtained = (id: number, signatureObtained: boolean) => {
    setModalPatients(modalPatients.map(patient =>
      patient.id === id && !('isBreak' in patient) ? { ...patient, signatureObtained } : patient
    ) as ModalItem[]);
  };

  // Check if any patient is selected to show the Document Treatment button
  const hasSelectedPatients = patients.some(patient => patient.selected);
  const selectedPatientCount = patients.filter(patient => patient.selected).length; // Get count of selected patients
  const selectedCount = modalPatients.length;

  // Function to toggle the modal
  const toggleModal = () => {
    if (!isModalOpen && !editingItem) { // Only set to today if opening for new documentation
      setTreatmentDate(formatDateFn(new Date()));
    }
    setIsModalOpen(!isModalOpen);
  };

  // Function to add a treatment break with specific activity type
  const addActivity = () => {
    // Create a new break activity
    const newBreak: BreakActivity = {
      id: nextBreakId,
      isBreak: true,
      activity: "Pause", // Default activity
      durationMinutes: 20,
      order: modalPatients.length + 1
    };
    
    // Increment the break ID for next time
    setNextBreakId(prevId => prevId + 1);
    
    // Add the break to the modalPatients array
    // Insert at beginning for now, then reassign order
    const updatedModalItems = [newBreak, ...modalPatients];
    const itemsWithNewOrder = assignOrder(updatedModalItems);
    
    setModalPatients(itemsWithNewOrder);
  };

  // Function to remove a treatment break
  const removeBreakActivity = (breakId: number) => {
    const updatedItems = modalPatients.filter(item => item.id !== breakId);
    const itemsWithNewOrder = assignOrder(updatedItems);
    setModalPatients(itemsWithNewOrder);
  };

  // Function to update break activity text
  const updateBreakActivity = (breakId: number, activity: string) => {
    setModalPatients(prev => prev.map(item => 
      item.id === breakId ? { ...item, activity } as BreakActivity : item
    ));
  };

  // Function to update break activity duration
  const updateBreakDuration = (breakId: number, durationMinutes: number) => {
    setModalPatients(prev => prev.map(item => 
      item.id === breakId ? { ...item, durationMinutes } as BreakActivity : item
    ));
  };

  // New state for editing specific items
  const [editingItem, setEditingItem] = useState<{ type: 'treatment' | 'activity', id: number, date: string } | null>(null);

  // Function to handle editing treatment or activity from calendar
  const handleEditItem = (item: { type: 'treatment' | 'activity', id: number, date: string }) => {
    setEditingItem(item);
    
    // Set the treatment date to the date of the item being edited
    setTreatmentDate(item.date);
    
    if (item.type === 'treatment') {
      // For treatments, find the patient and prepare the modal with just this patient
      const patient = patients.find(p => p.id === item.id);
      if (patient) {
        // Set the selected patient
        setPatients(prevPatients => 
          prevPatients.map(p => ({
            ...p,
            selected: p.id === item.id
          }))
        );
        
        // Get the treatment history entry for this date
        const historyEntry = patient.treatmentHistory?.find(entry => entry.date === item.date);
        
        // Determine if the entry was rejected and get original notes
        let originalNotes = historyEntry?.notes || patient.notes || '';
        const wasRejected = historyEntry?.session === 'Rejected' || historyEntry?.notes?.startsWith("Treatment Rejected:");
        if (wasRejected && historyEntry?.notes?.startsWith("Treatment Rejected:")) {
          originalNotes = historyEntry.notes.replace("Treatment Rejected: ", "");
        }
        
        // Prepare the modal with just this patient
        const modalPatient: Patient = {
          ...patient,
          notes: originalNotes,
          order: historyEntry?.order || patient.order,
          rejectedTreatment: wasRejected // Set the checkbox state
        };
        
        setModalPatients([modalPatient]);
      }
    } else {
      // For activities, find the activity and prepare the modal with just this activity
      const activity = dayActivities.find(a => a.id === item.id && a.date === item.date);
      if (activity) {
        // Create a break activity for the modal
        const breakActivity: BreakActivity = {
          id: activity.id,
          isBreak: true,
          activity: activity.activity,
          durationMinutes: activity.durationMinutes,
          order: activity.order,
          customActivity: activity.customActivity
        };
        
        setModalPatients([breakActivity]);
      }
    }
    
    // Open the modal
    setIsModalOpen(true);
  };

  // Function to handle saving the form
  const handleSave = () => {
    // Validate Heilmittel selection for Blanko VO patients FIRST
    const modalPatientList = modalPatients.filter((item): item is Patient => !('isBreak' in item));
    const heilmittelValidation = validateHeilmittelSelection(modalPatientList);
    
    if (!heilmittelValidation) {
      // Focus on the first patient with an error (optional UX enhancement)
      const firstErrorPatient = modalPatientList.find(patient => 
        patient.isBlankoVO && heilmittelErrors[patient.id]
      );
      
      addToast(
        `Heilmittel selection required for ${firstErrorPatient?.name || 'Blanko VO patients'}. Please select a Heilmittel before saving.`,
        'error',
        7000
      );
      return; // Prevent saving
    }
    
    // Process break activities
    const breakActivities = modalPatients
      .filter((item): item is BreakActivity => 'isBreak' in item)
      .map(breakItem => ({
        id: breakItem.id,
        date: treatmentDate,
        activity: breakItem.activity,
        durationMinutes: breakItem.durationMinutes,
        order: breakItem.order || 0,
        customActivity: breakItem.customActivity
      }));
    
    if (editingItem) {
      // We're editing an existing item
      if (editingItem.type === 'treatment') {
        // Update a treatment
        const updatedPatients = patients.map(patient => {
          if (patient.id === editingItem.id) {
            // Find the matching patient in modalPatients
            const modalPatient = modalPatients.find(mp => !('isBreak' in mp) && mp.id === patient.id) as Patient | undefined;
            
            if (modalPatient) {
              // Update the treatment history for this specific date
              const treatmentHistory = [...(patient.treatmentHistory || [])];
              const entryIndex = treatmentHistory.findIndex(entry => entry.date === editingItem.date);
              
              if (entryIndex !== -1) {
                // Get the previous entry
                const previousEntry = treatmentHistory[entryIndex];
                
                // Determine if rejection or signature status has changed
                const wasRejected = previousEntry.session === 'Rejected' || 
                  previousEntry.session === 'Rejected-NoCount' || 
                  previousEntry.session?.startsWith('Rejected-');
                const wasSignatureObtained = previousEntry.signatureObtained;
                
                // Determine if treatment count should change
                const previouslyCounted = !wasRejected || (wasRejected && wasSignatureObtained);
                const shouldCountNow = !modalPatient.rejectedTreatment || 
                  (modalPatient.rejectedTreatment && modalPatient.signatureObtained);
                
                // Determine session display based on current state
                let sessionDisplay;
                if (!modalPatient.rejectedTreatment) {
                  // Regular treatment, use existing session or create new one
                  sessionDisplay = previousEntry.session?.includes('/') 
                    ? previousEntry.session 
                    : `${patient.completedTreatments}/${patient.totalTreatments}`;
                } else if (modalPatient.rejectedTreatment && modalPatient.signatureObtained) {
                  // Rejected with signature, keep count
                  sessionDisplay = previousEntry.session?.includes('/') 
                    ? `Rejected-${previousEntry.session?.split('/')[0]}/${patient.totalTreatments}`
                    : `Rejected-${patient.completedTreatments}/${patient.totalTreatments}`;
                } else {
                  // Rejected without signature, no count
                  sessionDisplay = 'Rejected-NoCount';
                }
                
                // Format notes for Blanko VO patients: "Heilmittel (Duration): Notes"
                let formattedNotes = modalPatient.notes;
                if (modalPatient.isBlankoVO) {
                  const duration = selectedDuration[modalPatient.id] || '';
                  if (duration) {
                    formattedNotes = `(${duration} min): ${modalPatient.notes}`;
                  }
                }
                
                // Update existing entry
                treatmentHistory[entryIndex] = {
                  ...treatmentHistory[entryIndex],
                  notes: formattedNotes,
                  order: modalPatient.order,
                  session: sessionDisplay,
                  signatureObtained: modalPatient.rejectedTreatment ? modalPatient.signatureObtained : undefined,
                  heilmittel: modalPatient.isBlankoVO ? selectedHeilmittel[modalPatient.id] : undefined, // Include Heilmittel for Blanko VO patients
                };
                
                // Update completedTreatments count if needed
                let newCompletedTreatments = patient.completedTreatments;
                
                if (previouslyCounted && !shouldCountNow) {
                  // If it was previously counted but shouldn't be now, decrement
                  newCompletedTreatments = Math.max(0, newCompletedTreatments - 1);
                } else if (!previouslyCounted && shouldCountNow) {
                  // If it wasn't previously counted but should be now, increment
                  newCompletedTreatments = patient.isBlankoVO 
                    ? newCompletedTreatments + 1  // For Blanko VOs, just increment
                    : Math.min(patient.totalTreatments, newCompletedTreatments + 1);  // For regular VOs, respect limit
                }
                
                return {
                  ...patient,
                  notes: modalPatient.notes,
                  order: modalPatient.order,
                  completedTreatments: newCompletedTreatments,
                  treatmentHistory
                };
              }
            }
          }
          return patient;
        });
        
        setPatients(updatedPatients);
        addToast("Treatment updated successfully", "success");
      } else {
        // Update an activity
        const updatedActivities = dayActivities.map(activity => {
          if (activity.id === editingItem.id && activity.date === editingItem.date) {
            // Find the matching break activity in modalPatients
            const modalBreak = modalPatients.find(mp => 'isBreak' in mp && mp.id === activity.id) as BreakActivity | undefined;
            
            if (modalBreak) {
              return {
                ...activity,
                activity: modalBreak.activity,
                durationMinutes: modalBreak.durationMinutes,
                order: modalBreak.order || activity.order,
                customActivity: modalBreak.customActivity
              };
            }
          }
          return activity;
        });
        
        setDayActivities(updatedActivities);
        addToast("Activity updated successfully", "success");
      }
      
      // Clear editing state
      setEditingItem(null);
    } else {
      // Count how many patients are being treated
      const treatedPatientCount = modalPatients.filter(item => !('isBreak' in item)).length;
      
      // Regular save (existing code)
      // Merge with existing day activities, replacing any for the same date
      const existingOtherDaysActivities = dayActivities.filter(activity => 
        activity.date !== treatmentDate
      );
      
      setDayActivities([...existingOtherDaysActivities, ...breakActivities]);
      
      // Update the patients list with the new treatment information
      const updatedPatients = patients.map(patient => {
        // Find the matching patient in modalPatients (excluding break items)
        const modalPatient = modalPatients.find(mp => !('isBreak' in mp) && mp.id === patient.id) as Patient | undefined;
        if (modalPatient) {
          // Determine if we should increment the count
          // Increment IF treatment was NOT rejected OR (it was rejected AND signature was obtained)
          const shouldIncrementCount = !modalPatient.rejectedTreatment || (modalPatient.rejectedTreatment && modalPatient.signatureObtained);
          
          // Only increment completedTreatments if we should count this treatment
          const newCompletedTreatments = shouldIncrementCount 
            ? (patient.isBlankoVO 
                ? patient.completedTreatments + 1  // For Blanko VOs, just increment (no max limit)
                : Math.min(patient.completedTreatments + 1, patient.totalTreatments))  // For regular VOs, respect the limit
            : patient.completedTreatments;
          
          // Create session display string based on whether treatment counts
          let sessionDisplay;
          const denominator = patient.isBlankoVO ? '0' : patient.totalTreatments.toString();
          
          if (!modalPatient.rejectedTreatment) {
            // Regular treatment
            sessionDisplay = `${newCompletedTreatments}/${denominator}`;
          } else if (modalPatient.rejectedTreatment && modalPatient.signatureObtained) {
            // Rejected but signature obtained (counts toward total)
            sessionDisplay = `Rejected-${newCompletedTreatments}/${denominator}`;
          } else {
            // Rejected without signature (doesn't count)
            sessionDisplay = 'Rejected-NoCount';
          }
          
          return {
            ...patient,
            treated: !modalPatient.rejectedTreatment, // Mark as not treated if rejected
            treatmentStatus: modalPatient.rejectedTreatment ? "Rejected" : "Treated", // Add a separate status field
            therapeut: patient.therapeut, // Maintain original therapist
            lastTreatment: treatmentDate,
            notes: modalPatient.notes, // Store original notes here
            order: modalPatient.order, // Keep order if it exists from modal
            selected: false,
            completedTreatments: newCompletedTreatments, // Conditionally increment based on rejection/signature
            treatmentHistory: [
              ...(patient.treatmentHistory || []),
              (() => {
                // Format notes for Blanko VO patients: "Heilmittel (Duration): Notes"
                let formattedNotes = modalPatient.notes;
                if (modalPatient.isBlankoVO) {
                  const duration = selectedDuration[modalPatient.id] || '';
                  if (duration) {
                    formattedNotes = `(${duration} min): ${modalPatient.notes}`;
                  }
                }
                
                const finalNotes = modalPatient.rejectedTreatment ? `Treatment Rejected: ${formattedNotes}` : formattedNotes;
                
                return {
                  date: treatmentDate,
                  notes: finalNotes,
                  session: sessionDisplay,
                  order: modalPatient.order,
                  signatureObtained: modalPatient.rejectedTreatment ? modalPatient.signatureObtained : undefined, // Only set for rejected treatments
                  heilmittel: modalPatient.isBlankoVO ? selectedHeilmittel[modalPatient.id] : undefined, // Include Heilmittel for Blanko VO patients
                };
              })()
            ]
          };
        }
        return patient;
      });

      setPatients(updatedPatients);
      
      // Show toast notification with more detailed feedback
      const treatedSuccessfullyCount = modalPatients.filter(p => !('isBreak' in p) && !(p as Patient).rejectedTreatment).length;
      const rejectedWithSignatureCount = modalPatients.filter(p => 
        !('isBreak' in p) && (p as Patient).rejectedTreatment && (p as Patient).signatureObtained
      ).length;
      const rejectedWithoutSignatureCount = modalPatients.filter(p => 
        !('isBreak' in p) && (p as Patient).rejectedTreatment && !(p as Patient).signatureObtained
      ).length;
      const totalRejectedCount = rejectedWithSignatureCount + rejectedWithoutSignatureCount;

      // Create a detailed message
      if (treatedSuccessfullyCount > 0 || totalRejectedCount > 0) {
        let message = '';
        const parts = [];
        
        if (treatedSuccessfullyCount > 0) {
          parts.push(`${treatedSuccessfullyCount} successful treatment${treatedSuccessfullyCount > 1 ? 's' : ''}`);
        }
        
        if (rejectedWithSignatureCount > 0) {
          parts.push(`${rejectedWithSignatureCount} rejected with signature (counted)`);
        }
        
        if (rejectedWithoutSignatureCount > 0) {
          parts.push(`${rejectedWithoutSignatureCount} rejected without signature (not counted)`);
        }
        
        message = `Treatments updated: ${parts.join(', ')}.`;
        addToast(message, "info");
      }
      
      // Switch to active-patients tab after marking patients as treated
      setActiveTab('active-patients');
    }
    
    setModalPatients([]);
    setIsModalOpen(false);
  };

  // Update the modal title to reflect editing or adding
  const getModalTitle = () => {
    if (editingItem) {
      return editingItem.type === 'treatment' 
        ? "Edit Treatment" 
        : "Edit Activity";
    }
    return `Mark as Treated (${modalPatients.length})`;
  };

  // Function to close the modal
  const closeModal = () => {
    setModalPatients([]);
    setIsModalOpen(false);
    setEditingItem(null);
  };

  // Add state for day activities
  const [dayActivities, setDayActivities] = useState<DayActivity[]>([
    {
      id: 2001,
      date: '04.03.2025', // Tuesday - 1st week of March (John and Patricia)
      activity: 'Team Meeting',
      durationMinutes: 30,
      order: 2
    },
    {
      id: 2002,
      date: '06.03.2025', // Thursday - 1st week of March (Emma and Thomas)
      activity: 'Documentation',
      durationMinutes: 20,
      order: 3
    },
    {
      id: 2003,
      date: '10.03.2025', // Monday - 2nd week of March (Emma and Thomas)
      activity: 'Lunch Break',
      durationMinutes: 45,
      order: 2
    },
    {
      id: 2004,
      date: '11.03.2025', // Tuesday - 2nd week of March (John and Patricia)
      activity: 'Staff Meeting',
      durationMinutes: 25,
      order: 2
    },
    {
      id: 2005,
      date: '13.03.2025', // Thursday - 2nd week of March (Emma and Thomas)
      activity: 'Patient Call',
      durationMinutes: 15,
      order: 1
    },
    {
      id: 2006,
      date: '14.03.2025', // Friday - 2nd week of March (John and Patricia)
      activity: 'Care Planning',
      durationMinutes: 30,
      order: 1
    },
    {
      id: 2007,
      date: '17.03.2025', // Monday - 3rd week of March (Emma and Thomas)
      activity: 'Equipment Setup',
      durationMinutes: 20,
      order: 3
    },
    {
      id: 2008,
      date: '19.03.2025', // Wednesday - 3rd week of March (Michael)
      activity: 'Documentation',
      durationMinutes: 25,
      order: 1
    },
    {
      id: 2009,
      date: '21.03.2025', // Friday - 3rd week of March (John and Patricia)
      activity: 'Team Huddle',
      durationMinutes: 15,
      order: 3
    }
  ]);

  // Add function to remove a patient from the modal
  const removePatientFromModal = (patientId: number) => {
    const updatedItems = modalPatients.filter(item => item.id !== patientId);
    const itemsWithNewOrder = assignOrder(updatedItems);
    setModalPatients(itemsWithNewOrder);
    
    // Also unselect the patient in the patients list
    setPatients(patients.map(patient => 
      patient.id === patientId ? { ...patient, selected: false } : patient
    ));
  };

  // Add back the renderPatientCard function that was deleted
  const renderPatientCard = (patient: Patient) => {
    return (
      <div 
        key={patient.id} 
        className={`mb-4 bg-white border border-gray-200 rounded-md shadow-sm overflow-hidden ${
          draggedPatientId === patient.id ? 'opacity-50' : ''
        }`}
        draggable
        onDragStart={(e) => handleDragStart(patient.id, e)}
        onDragOver={handleDragOver}
        onDrop={() => handleDrop(patient.id)}
        onDragEnd={handleDragEnd}
      >
        {/* Card Header - Always visible */}
        <div 
          className="flex justify-between items-center p-4 bg-gray-50"
        >
          <div className="flex items-center gap-4">
            {/* Drag Handle */}
            <svg
              className="w-5 h-5 text-gray-400 cursor-grab active:cursor-grabbing"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
            </svg>
            <div>
              <h3 className="font-medium">{patient.name}</h3>
              <div className="text-sm text-gray-600">
                {patient.order ? `Position #${patient.order}` : 'Unordered'}
                {!collapsedCards.includes(patient.id) && (
                  <>
                    <span className="mx-2">•</span>
                    <span>Prescription {patient.prescription}</span>
                    <span className="mx-2">•</span>
                    <span>Treatment {patient.completedTreatments + 1}/{patient.totalTreatments}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center">
            {/* Remove Button */}
            <button 
              onClick={() => removePatientFromModal(patient.id)}
              className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded mr-1"
              title="Remove Patient"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Collapse/Expand Icon */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleCardCollapse(patient.id);
              }}
              className="text-gray-400 hover:text-gray-600"
              title="Expand/Collapse"
            >
              <svg 
                className={`w-5 h-5 transform transition-transform ${collapsedCards.includes(patient.id) ? '' : 'rotate-180'}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Card Content - Collapsible */}
        {!collapsedCards.includes(patient.id) && (
          <div className="p-4 border-t border-gray-200">
            {/* Notes field - Treatment notes */}
            <div className="mb-4">
              <label className="text-sm text-gray-600 block mb-1">Notes</label>
              <AutoResizeTextarea
                value={patient.notes || ''}
                onChange={(e) => updatePatientNotes(patient.id, e.target.value)}
                placeholder="Enter treatment notes..."
                className="text-sm"
              />
            </div>

            {/* Heilmittel and Duration - Only for Blanko VO patients */}
            {patient.isBlankoVO && (
              <div className="mb-4 grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600 block mb-1">
                    Heilmittel <span className="text-red-500">*</span>
                    <span className="text-xs text-orange-600 ml-2">(Required for Blanko VO)</span>
                  </label>
                  <SearchableDropdown
                    options={BLANKO_VO_HEILMITTEL}
                    value={selectedHeilmittel[patient.id] || ''}
                    onChange={(value) => updatePatientHeilmittel(patient.id, value)}
                    placeholder="Search and select Heilmittel..."
                    hasError={heilmittelErrors[patient.id] || false}
                  />
                  {heilmittelErrors[patient.id] && (
                    <p className="text-red-500 text-xs mt-1">
                      Heilmittel selection is required for Blanko VO patients
                    </p>
                  )}
                </div>
                
                <div>
                  <label className="text-sm text-gray-600 block mb-1">
                    Duration <span className="text-red-500">*</span>
                    <span className="text-xs text-orange-600 ml-2">(Required for Blanko VO)</span>
                  </label>
                  <select
                    value={selectedDuration[patient.id] || ''}
                    onChange={(e) => updatePatientDuration(patient.id, Number(e.target.value))}
                    className={`border rounded-md py-2 px-4 w-full text-sm focus:outline-none focus:ring-2 ${
                      durationErrors[patient.id] 
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                    } focus:border-transparent`}
                  >
                    <option value="">Select Duration...</option>
                    {durationOptions.map(duration => (
                      <option key={duration} value={duration}>
                        {duration} minutes
                      </option>
                    ))}
                  </select>
                  {durationErrors[patient.id] && (
                    <p className="text-red-500 text-xs mt-1">
                      Duration selection is required for Blanko VO patients
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Suggested Notes - REMOVED */}
            {/* 
            <div className="mb-4">
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs text-gray-500">Suggested Notes</label>
                <button
                  onClick={() => toggleSuggestions(patient.id)}
                  className="text-xs text-blue-500 hover:text-blue-700"
                >
                  {visibleSuggestions.includes(patient.id) ? 'Hide' : 'Show'}
                </button>
              </div>
              
              {visibleSuggestions.includes(patient.id) && (
                <div className="bg-gray-50 p-2 rounded-md text-sm">
                  <div className="grid grid-cols-1 gap-2">
                    {suggestedNotes.map((note, index) => (
                      <button
                        key={index}
                        onClick={() => selectSuggestedNote(patient.id, note)}
                        className="text-left p-2 bg-white border border-gray-200 rounded hover:bg-gray-100 text-gray-700 text-xs"
                      >
                        {note}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            */}
            
            {/* Patient Rejected Treatment Checkbox */}
            <div className="mt-4">
              <label className="flex items-center text-sm text-gray-700">
                <input 
                  type="checkbox"
                  checked={!!patient.rejectedTreatment}
                  onChange={(e) => updatePatientRejection(patient.id, e.target.checked)}
                  className="mr-2 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                Patient Rejected Treatment
              </label>
              
              {/* Signature Obtained Checkbox - only visible when rejection is checked */}
              {!!patient.rejectedTreatment && (
                <label className="flex items-center text-sm text-gray-700 mt-2 ml-6">
                  <input 
                    type="checkbox"
                    checked={!!patient.signatureObtained}
                    onChange={(e) => updateSignatureObtained(patient.id, e.target.checked)}
                    className="mr-2 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  wurde so viel Zeit investiert, dass eine Unterschrift auf der VO eingeholt wird?
                </label>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Add back the renderBreakActivityCard function that was deleted
  const renderBreakActivityCard = (breakItem: BreakActivity) => {
    return (
      <div 
        key={breakItem.id} 
        className="mb-4 bg-white border border-gray-200 rounded-md shadow-sm overflow-hidden"
        draggable
        onDragStart={(e) => handleDragStart(breakItem.id, e)}
        onDragOver={handleDragOver}
        onDrop={() => handleDrop(breakItem.id)}
        onDragEnd={handleDragEnd}
      >
        <div className="bg-gray-50 p-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            {/* Drag Handle */}
            <svg
              className="w-5 h-5 text-gray-400 cursor-grab active:cursor-grabbing"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
            </svg>
            <div>
              <h3 className="font-medium">
                {breakItem.activity === "Other" ? breakItem.customActivity || "Other Activity" : breakItem.activity}
              </h3>
              <div className="text-sm text-gray-600">
                {breakItem.order ? `Position #${breakItem.order}` : 'Unordered'} • Duration: {breakItem.durationMinutes} min
              </div>
            </div>
          </div>
          
          <div className="flex items-center">
            {/* Remove Button */}
            <button 
              onClick={() => removeBreakActivity(breakItem.id)}
              className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded mr-1"
              title="Remove Activity"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            {/* Collapse/Expand Icon */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleCardCollapse(breakItem.id);
              }}
              className="text-gray-400 hover:text-gray-600"
              title="Expand/Collapse"
            >
              <svg 
                className={`w-5 h-5 transform transition-transform ${collapsedCards.includes(breakItem.id) ? '' : 'rotate-180'}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Activity Card Content - Collapsible */}
        {!collapsedCards.includes(breakItem.id) && (
          <div className="p-4 border-t border-gray-200">
            {/* Activity Type Selector */}
            <div className="mb-4">
              <label className="text-sm text-gray-600 block mb-1">Activity Type</label>
              <select
                value={breakItem.activity}
                onChange={(e) => {
                  const selectedActivity = e.target.value;
                  updateBreakActivity(breakItem.id, selectedActivity);
                  // Reset custom activity when switching away from "Other"
                  if (selectedActivity !== "Other") {
                    setModalPatients(prev => prev.map(item => 
                      item.id === breakItem.id ? { ...item, activity: selectedActivity, customActivity: undefined } as BreakActivity : item
                    ));
                  }
                }}
                className="border border-gray-300 rounded-md py-2 px-4 w-full text-sm"
              >
                {activityTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Custom Activity Input - Only shown when "Other" is selected */}
            {breakItem.activity === "Other" && (
              <div className="mb-4">
                <label className="text-sm text-gray-600 block mb-1">Custom Activity</label>
                <input
                  type="text"
                  value={breakItem.customActivity || ''}
                  onChange={(e) => {
                    setModalPatients(prev => prev.map(item => 
                      item.id === breakItem.id ? { ...item, customActivity: e.target.value } as BreakActivity : item
                    ));
                  }}
                  className="border border-gray-300 rounded-md py-2 px-4 w-full text-sm"
                  placeholder="Enter custom activity..."
                />
              </div>
            )}

            {/* Duration Field */}
            <div className="mb-4">
              <label className="text-sm text-gray-600 block mb-1">Duration (minutes)</label>
              <input 
                type="number"
                value={breakItem.durationMinutes}
                onChange={(e) => updateBreakDuration(breakItem.id, parseInt(e.target.value) || 20)}
                className="border border-gray-300 rounded-md py-1.5 px-3 w-full text-sm"
                min="1"
                max="480"
              />
            </div>
          </div>
        )}
      </div>
    );
  };

  // Add back the togglePatientSelection function
  const togglePatientSelection = (id: number) => {
    setPatients(patients.map(patient => 
      patient.id === id ? { ...patient, selected: !patient.selected } : patient
    ));
  };

  // Add new state for patient selection modal
  const [isPatientSelectModalOpen, setIsPatientSelectModalOpen] = useState(false);
  
  // Update the patient selection modal state to track selected patients
  const [selectedPatientsInModal, setSelectedPatientsInModal] = useState<number[]>([]);
  
  // Function to handle opening the patient selection modal
  const openPatientSelectModal = () => {
    // Reset selected patients when opening the modal
    setSelectedPatientsInModal([]);
    // Default treatment date to today when initiating from calendar's document treatment button
    if (!editingItem) {
      setTreatmentDate(formatDateFn(new Date())); 
    }
    setIsPatientSelectModalOpen(true);
  };

  // Function to toggle a patient's selection in the modal
  const togglePatientInSelectionModal = (patientId: number) => {
    setSelectedPatientsInModal(current => 
      current.includes(patientId)
        ? current.filter(id => id !== patientId)
        : [...current, patientId]
    );
  };

  // Function to proceed with selected patients
  const proceedWithSelectedPatients = () => {
    // Update the selected state for the chosen patients
    setPatients(prevPatients => 
      prevPatients.map(patient => ({
        ...patient,
        selected: selectedPatientsInModal.includes(patient.id)
      }))
    );
    
    // Close the patient selection modal
    setIsPatientSelectModalOpen(false);
    
    // Only open the treatment documentation modal if patients were selected
    if (selectedPatientsInModal.length > 0) {
      setIsModalOpen(true);
    }
  };

  // Update the patient selection modal UI
  {isPatientSelectModalOpen && (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 overflow-hidden">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="bg-white text-gray-800 py-4 px-6 rounded-t-lg flex justify-between items-center border-b">
          <h2 className="text-xl font-semibold">Select Patient{selectedPatientsInModal.length > 0 ? `s (${selectedPatientsInModal.length})` : ''}</h2>
          <button 
            onClick={() => setIsPatientSelectModalOpen(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Body - Scrollable */}
        <div className="p-6 overflow-y-auto flex-grow">
          <div className="grid grid-cols-1 gap-4">
            {patients.map((patient) => (
              <div 
                key={patient.id} 
                className="p-4 border border-gray-200 rounded-md hover:bg-gray-50 flex justify-between items-center"
              >
                <div className="flex items-center gap-3 flex-1">
                  <input
                    type="checkbox"
                    checked={selectedPatientsInModal.includes(patient.id)}
                    onChange={() => togglePatientInSelectionModal(patient.id)}
                    className="h-5 w-5 text-blue-500 rounded border-gray-300"
                  />
                  <div>
                    <div className="font-medium">{patient.name}</div>
                    <div className="text-sm text-gray-600">
                      Prescription: {patient.prescription} | Treatment: {patient.isBlankoVO ? <>{patient.completedTreatments}/<span className="font-bold">BV</span></> : `${patient.completedTreatments}/${patient.totalTreatments}`}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Modal Footer with Proceed Button */}
        <div className="flex justify-end gap-3 p-4 border-t border-gray-200">
          <button 
            onClick={() => setIsPatientSelectModalOpen(false)}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md text-sm font-medium"
          >
            Cancel
          </button>
          <button 
            onClick={proceedWithSelectedPatients}
            disabled={selectedPatientsInModal.length === 0}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              selectedPatientsInModal.length > 0 
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'bg-blue-300 text-white cursor-not-allowed'
            }`}
          >
            Proceed with {selectedPatientsInModal.length} {selectedPatientsInModal.length === 1 ? 'Patient' : 'Patients'}
          </button>
        </div>
      </div>
    </div>
  )}

  // Removed modal functions for simplified prototype

  // Helper function to add a log entry to a patient
  const addLogToPatient = (
    patientId: number, 
    logType: 'StatusChange' | 'FolgeVO' | 'Cancellation', 
    description: string, 
    details?: string,
    isInactive: boolean = false
  ): void => {
    // Create the new log entry
    const newLog: VOLog = {
      id: nextLogId,
      type: logType,
      timestamp: new Date().toISOString(), // Current timestamp
      description,
      details
    };

    // Increment the log ID for next time
    setNextLogId(prev => prev + 1);

    if (isInactive) {
      // Update inactive patients
      setInactivePatients(prevPatients => 
        prevPatients.map(patient => {
          if (patient.id === patientId) {
            const updatedLogs = patient.voLogs ? [...patient.voLogs, newLog] : [newLog];
            return {
              ...patient,
              voLogs: updatedLogs
            };
          }
          return patient;
        })
      );
    } else {
      // Update active patients
      setPatients(prevPatients => 
        prevPatients.map(patient => {
          if (patient.id === patientId) {
            // Create a new array of logs or append to existing
            const updatedLogs = patient.voLogs ? [...patient.voLogs, newLog] : [newLog];
            return {
              ...patient,
              voLogs: updatedLogs
            };
          }
          return patient;
        })
      );
    }
  };

  // Helper function to log a VO status change
  const logVoStatusChange = (patientId: number, fromStatus: string, toStatus: string, isInactive: boolean = false) => {
    addLogToPatient(
      patientId,
      'StatusChange',
      `${fromStatus} to ${toStatus}`,
      undefined,
      isInactive
    );
  };

  // Removed all modal functions for simplified prototype

  // Function to open PDF preview
  const openPdfPreview = (patient: Patient, formData: TherapyReportForm) => {
    setPdfData({ patient, formData });
    setIsPdfPreviewOpen(true);
  };

  // Function to close PDF preview
  const closePdfPreview = () => {
    setIsPdfPreviewOpen(false);
    setPdfData(null);
    setPdfViewMode('save');
  };

  // Function to view saved PDF
  const viewSavedPdf = (patient: Patient) => {
    const savedReport = savedTherapyReports[patient.id];
    if (savedReport) {
      setPdfData(savedReport);
      setPdfViewMode('view');
      setIsPdfPreviewOpen(true);
    }
  };

  // Function to handle PDF save
  const handlePdfSave = () => {
    if (!pdfData) return;
    
    const { patient, formData } = pdfData;
    
    // Save the therapy report data
    setSavedTherapyReports(prev => ({
      ...prev,
      [patient.id]: { patient, formData }
    }));
    
    // Update patient's therapiebericht status to "Created"
    setPatients(prev => prev.map(p => 
      p.id === patient.id 
        ? { ...p, therapiebericht: "Created" as const }
        : p
    ));
    
    // Also update inactive patients if needed
    setInactivePatients(prev => prev.map(p => 
      p.id === patient.id 
        ? { ...p, therapiebericht: "Created" as const }
        : p
    ));
    
    const fileName = `Therapiebericht_${patient.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
    addToast(`Report for VO ${patient.prescription} has been created and sent to Admin`, 'success');
    closePdfPreview();
  };

  // Function to handle therapy report form submission
  const handleTherapyReportSubmit = () => {
    // Clear previous errors
    setTherapyReportErrors({});
    setTherapyReportModalError("");
    
    // Validate form
    const { therapyType, startDate, endDate, currentFindings, specialFeatures } = therapyReportForm;
    const errors: {[key: string]: string} = {};
    
    // Check required fields
    if (!therapyType) errors.therapyType = "Therapy type is required";
    if (!startDate) errors.startDate = "Start date is required";
    if (!endDate) errors.endDate = "End date is required";
    if (!currentFindings.trim()) errors.currentFindings = "Current therapy status is required";
    if (!specialFeatures.trim()) errors.specialFeatures = "Special features are required";
    
    // Check date range (end date should be after start date)
    if (startDate && endDate && endDate <= startDate) {
      errors.endDate = "End date must be after start date";
    }
    
    // If there are errors, show them
    if (Object.keys(errors).length > 0) {
      setTherapyReportErrors(errors);
      setTherapyReportModalError("Please fix the highlighted fields above");
      return;
    }
    
    // Form is valid - proceed with PDF generation
    if (therapyReportPatient) {
      // Open PDF preview in save mode
      setPdfViewMode('save');
      openPdfPreview(therapyReportPatient, therapyReportForm);
      
      // Reset form and close modal
      setTherapyReportForm({
        therapyType: "",
        startDate: null,
        endDate: null,
        currentFindings: "",
        specialFeatures: "",
        treatmentAccordingToPrescription: true,
        changeTherapyFrequency: false,
        changeIndividualTherapy: false,
        changeGroupTherapy: false,
        continuationOfTherapyRecommended: true
      });
      closeTherapyReportModal();
    }
  };

  // State for therapy report form validation
  const [therapyReportErrors, setTherapyReportErrors] = useState<{[key: string]: string}>({});
  const [therapyReportModalError, setTherapyReportModalError] = useState<string>("");
  
  // State for PDF preview modal
  const [isPdfPreviewOpen, setIsPdfPreviewOpen] = useState(false);
  const [pdfData, setPdfData] = useState<{patient: Patient, formData: TherapyReportForm} | null>(null);
  const [showAnnotations, setShowAnnotations] = useState(true);
  const [pdfViewMode, setPdfViewMode] = useState<'save' | 'view'>('save');
  
  // State for saved therapy reports
  const [savedTherapyReports, setSavedTherapyReports] = useState<{[patientId: number]: {patient: Patient, formData: TherapyReportForm}}>({});

  return (
    <WireframeLayout title="Blanko VOs + Arztbericht (Therapist)" username="User Therapist" userInitials="UT" showSidebar={false}>
      <div className="max-w-full mx-auto bg-[#f8f9fa] rounded-lg shadow p-4">
        {/* Tab Navigation */}
        <div className="mb-4 border-b">
          <div className="flex">
            <button
              className={`py-3 px-4 font-medium ${
                activeTab === 'active-patients'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('active-patients')}
            >
              Open Prescriptions
            </button>
            <button
              className={`py-3 px-4 font-medium ${
                activeTab === 'inactive-patients'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('inactive-patients')}
            >
              Closed Prescriptions
            </button>
            <button
              className={`py-3 px-4 font-medium ${
                activeTab === 'calendar'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('calendar')}
            >
              Calendar
            </button>
          </div>
        </div>
        
        {/* Treatment Documentation Header - shows active tab name */}
        <div className="mb-4">
          <h1 className="text-2xl font-semibold">
            {activeTab === 'active-patients' ? 'Open Prescriptions' : activeTab === 'inactive-patients' ? 'Closed Prescriptions' : 'Calendar'}
          </h1>
        </div>
        
        {/* Patient List View - Conditional rendering based on activeTab */}
        {(activeTab === 'active-patients' || activeTab === 'inactive-patients') && (
          <div className="bg-white rounded-lg shadow-sm mb-4">
            {/* Toast Container */}
            <div className="px-4 pt-4">
              {toasts.map(toast => (
                <ToastNotification
                  key={toast.id}
                  toast={toast}
                  onClose={removeToast}
                />
              ))}
            </div>
            
            <div className="flex items-center justify-between p-4 border-b">
              <div className="relative flex items-center space-x-3">
                {/* Document Treatment button */}
                {activeTab === 'active-patients' && selectedPatientCount >= 1 && (
                  <WireframeButton variant="primary" onClick={toggleModal}>
                    Document Treatment
                  </WireframeButton>
                )}
              </div>
              {/* Visual Indicator Buttons - No functionality for prototype */}
              {activeTab === 'active-patients' && selectedPatientCount >= 1 && (
                <div className="flex items-center space-x-3">
                  <button
                    className="px-4 py-2 border border-orange-500 text-orange-500 bg-white hover:bg-orange-50 rounded-md text-sm font-medium"
                    disabled
                  >
                    Keine Folge-VO bestellen
                  </button>
                  <button
                    className="px-4 py-2 border border-red-600 bg-red-600 text-white hover:bg-red-700 rounded-md text-sm font-medium"
                    disabled
                  >
                    Abbrechen VO
                  </button>
                  <button
                    className="px-4 py-2 border border-blue-600 bg-blue-600 text-white hover:bg-blue-700 rounded-md text-sm font-medium"
                    disabled
                  >
                    Transfer Patient
                  </button>
                </div>
              )}
            </div>

            {/* Table Headers */}
            <div className="grid grid-cols-12 gap-4 py-3 px-4 bg-gray-100 text-gray-700 font-medium text-sm">
              <div className="col-span-1"></div>
              <div className="col-span-1">Name Patient</div>
              <div className="col-span-1">Facility</div>
              <div className="col-span-1">Heilmittel</div> {/* New Heilmittel column */}
              <div className="col-span-1">VO Nr.</div>
              <div className="col-span-1">VO Status</div> {/* New Column Header */}
              <div className="col-span-1">Status VO (#/#)</div>
              <div className="col-span-1">Therapiebericht</div> {/* NEW: Therapy Report Column */}
              <div className="col-span-1">Doctor</div>
              <div className="col-span-1">F.VO Status</div> 
              <div className="col-span-1">Logs</div> {/* New Logs column */}
              <div className="col-span-1">Dokumentation</div>
            </div>

            {/* Table Rows - with green background for treated patients */}
            {(activeTab === 'active-patients' ? patients : inactivePatients).map((patient) => (
              <div 
                key={patient.id} 
                className={`grid grid-cols-12 gap-4 py-3 px-4 border-t border-gray-200 items-center ${
                  patient.selected ? 'bg-blue-50' 
                    : patient.treatmentStatus === "Treated" ? 'bg-green-50' 
                    : patient.treatmentStatus === "Rejected" ? 'bg-red-50' 
                    : ''
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
                  {/* Heilmittel column */}
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-black">
                      {patient.isBlankoVO && patient.heilmittel.includes('-BV') ? (
                        <>
                          {patient.heilmittel.replace('-BV', '-')}
                          <span className="font-bold">BV</span>
                        </>
                      ) : (
                        patient.heilmittel
                      )}
                    </span>
                  </div>
                </div>
                <div className="col-span-1">
                  {patient.prescription}
                </div>
                <div className="col-span-1">
                  {/* VO Status Column Updated Logic */}
                  {(patient.voDisplayStatus === 'Abgebrochen') ? (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 border border-red-300">
                      Abgebrochen
                    </span>
                  ) : activeTab === 'active-patients' && (patient.voDisplayStatus === 'Aktiv' || !patient.voDisplayStatus) ? (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 border border-green-300">
                      Aktiv
                    </span>
                  ) : activeTab === 'inactive-patients' && patient.voDisplayStatus !== 'Abgebrochen' ? (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 border border-blue-300">
                      Abgerechnet
                    </span>
                  ) : null /* Default case */}
                </div>
                <div className="col-span-1">
                  <span className="font-medium text-black">
                    {patient.isBlankoVO 
                      ? <>{patient.completedTreatments}/<span className="font-bold">BV</span></> 
                      : `${patient.completedTreatments}/${patient.totalTreatments}`
                    }
                  </span>
                </div>
                <div className="col-span-1">
                  {/* NEW: Therapiebericht Column */}
                  {patient.therapiebericht ? (
                    patient.therapiebericht === "Ja" ? (
                      <button 
                        className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                        onClick={() => openTherapyReportModal(patient)}
                      >
                        Ja
                      </button>
                    ) : patient.therapiebericht === "Created" ? (
                      <div className="flex items-center gap-2">
                        <span className="text-blue-600 font-medium">Created</span>
                        <button 
                          className="text-blue-600 hover:text-blue-800"
                          onClick={() => viewSavedPdf(patient)}
                          title="View saved PDF"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <span className="text-gray-500">Nein</span>
                    )
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </div>
                <div className="col-span-1">{patient.doctor}</div>
                <div className="col-span-1">
                  {patient.fvoStatus === "Keine Folge-VO" && (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                      Keine Folge-VO
                    </span>
                  )}
                  {patient.fvoStatus === "Bestellen" && (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      Bestellen
                    </span>
                  )}
                </div> 
                <div className="col-span-1 flex justify-center">
                  {/* Logs button - only show if patient has logs */}
                  {(patient.voLogs && patient.voLogs.length > 0) && (
                    <button 
                      onClick={() => toggleLogsModal(patient)}
                      className="text-blue-600 hover:text-blue-800"
                      title="View logs"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                  )}
                </div>
                <div className="col-span-1 flex justify-center">
                  {(patient.treatmentHistory && patient.treatmentHistory.length > 0) && (
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
        )}

        {/* Calendar View */}
        {activeTab === 'calendar' && (
          <div>
            {/* Toast Container for Calendar View */}
            <div className="mb-4">
              {toasts.map(toast => (
                <ToastNotification
                  key={toast.id}
                  toast={toast}
                  onClose={removeToast}
                />
              ))}
            </div>
            
            <CalendarView
              treatments={patients}
              activities={dayActivities}
              treatmentDate={treatmentDate}
              onViewDocumentation={toggleDocumentationModal}
              setTreatments={setPatients}
              setDayActivities={setDayActivities}
              onEditItem={handleEditItem}
              onDocumentTreatment={openPatientSelectModal} 
            />
          </div>
        )}
      </div>

      {/* Treatment Documentation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 overflow-hidden">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="bg-white text-gray-800 py-4 px-6 rounded-t-lg flex justify-between items-center border-b">
              <h2 className="text-xl font-semibold">{getModalTitle()}</h2>
              <button 
                onClick={closeModal}
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
              <div className="mb-6 flex items-end justify-between">
                <div className="flex items-end gap-2">
                  <div>
                    <label className="text-gray-700 text-sm font-medium mb-2 block">Treatment Date</label>
                    <div className="relative flex items-center">
                      <input 
                        type="text" 
                        value={treatmentDate}
                        onChange={(e) => setTreatmentDate(e.target.value)}
                        className="border border-gray-300 rounded-md py-2 px-4 w-48"
                      />
                      <button 
                        className="ml-2 text-gray-500 hover:text-gray-700 border border-gray-300 rounded p-2"
                        onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  {/* Calendar Dropdown */}
                  {isCalendarOpen && (
                    <div className="absolute mt-2 ml-48 w-64 bg-white border border-gray-200 rounded-md shadow-lg z-10">
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
                        
                        {Array.from({ length: getDaysInMonthFn(calendarMonth, calendarYear) }).map((_, index) => {
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

                {/* Activity Button */}
                <div className="relative">
                  <button 
                    onClick={addActivity}
                    className="px-3 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-md text-sm"
                  >
                    Add Activity
                  </button>
                </div>
              </div>

              {/* Patient Cards and Break Activities */}
              {modalPatients.map((item) => {
                if ('isBreak' in item) {
                  // This is a break activity
                  const breakItem = item as BreakActivity;
                  return renderBreakActivityCard(breakItem);
                } else {
                  // This is a regular patient card
                  const patient = item as Patient;
                  return renderPatientCard(patient);
                }
              })}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 p-4 border-t border-gray-200">
              <button 
                onClick={closeModal}
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
                <div className="grid gap-4 py-3 px-4 bg-gray-50 text-sm font-medium text-gray-600 grid-cols-9">
                  <div className="col-span-1">Treatment #</div>
                  <div className="col-span-3">Treatment Date</div>
                  <div className="col-span-5">Notes</div>
                </div>

                {/* Table Content */}
                <div className="divide-y divide-gray-200">
                  {viewingPatient.treatmentHistory ? (
                    viewingPatient.treatmentHistory.map((entry, index) => {
                      // Different rejection statuses
                      const isRejectedWithSignature = entry.session?.startsWith('Rejected-') && entry.session !== 'Rejected-NoCount' && entry.signatureObtained;
                      const isRejectedWithoutSignature = entry.session === 'Rejected-NoCount' || (entry.session?.startsWith('Rejected-') && !entry.signatureObtained);
                      const isRejected = isRejectedWithSignature || isRejectedWithoutSignature;
                      
                      // Note formatting
                      let displayNotes = entry.notes || '';
                      if (displayNotes.startsWith("Treatment Rejected:")) {
                        displayNotes = displayNotes.replace("Treatment Rejected:", "").trim();
                      }
                      
                      // Session display formatting
                      let sessionDisplay = entry.session || '';
                      if (sessionDisplay.startsWith('Rejected-') && sessionDisplay !== 'Rejected-NoCount') {
                        sessionDisplay = sessionDisplay.replace('Rejected-', '');
                      }
                      
                      return (
                        <div 
                          key={index} 
                          className={`grid gap-4 py-3 px-4 text-sm grid-cols-9 ${
                            isRejectedWithSignature ? 'bg-orange-50 hover:bg-orange-100' : 
                            isRejectedWithoutSignature ? 'bg-red-50 hover:bg-red-100' : 
                            'hover:bg-gray-50'
                          }`}
                        >
                          <div className={`col-span-1 ${
                            isRejectedWithSignature ? 'text-orange-700 font-semibold' : 
                            isRejectedWithoutSignature ? 'text-red-700 font-semibold' : 
                            ''
                          }`}>
                            {isRejectedWithoutSignature ? "-" : index + 1}
                          </div>
                          <div className={`col-span-3 ${
                            isRejectedWithSignature ? 'text-orange-700' : 
                            isRejectedWithoutSignature ? 'text-red-700' : 
                            ''
                          }`}>
                            <div>{entry.date}</div>
                            {isRejectedWithSignature && (
                              <div className="mt-1">
                                <span className="px-2 py-0.5 text-xs font-semibold bg-orange-200 text-orange-800 rounded-full">
                                  Rejected (Counted)
                                </span>
                              </div>
                            )}
                            {isRejectedWithoutSignature && (
                              <div className="mt-1">
                                <span className="px-2 py-0.5 text-xs font-semibold bg-red-200 text-red-800 rounded-full">
                                  Rejected (Not Counted)
                                </span>
                              </div>
                            )}
                          </div>

                          <div className={`col-span-5 ${
                            isRejectedWithSignature ? 'text-orange-700' : 
                            isRejectedWithoutSignature ? 'text-red-700' : 
                            ''
                          }`}>
                            {isRejected ? (
                              <>
                                <div className="font-medium mb-1">Treatment was rejected by patient</div>
                                {displayNotes && (
                                  <div>
                                    {viewingPatient.isBlankoVO && entry.heilmittel ? (
                                      <>
                                        <span className="font-bold">{entry.heilmittel}</span>: {displayNotes}
                                      </>
                                    ) : (
                                      displayNotes
                                    )}
                                  </div>
                                )}
                                {isRejectedWithSignature && (
                                  <div className="mt-1 text-xs bg-orange-100 px-2 py-1 rounded inline-block">
                                    ✓ Signature was obtained - Session {sessionDisplay}
                                  </div>
                                )}
                                {isRejectedWithoutSignature && (
                                  <div className="mt-1 text-xs bg-red-100 px-2 py-1 rounded inline-block">
                                    ✗ No signature obtained - Not counted towards total
                                  </div>
                                )}
                              </>
                            ) : (
                              viewingPatient.isBlankoVO && entry.heilmittel ? (
                                <>
                                  <span className="font-bold">{entry.heilmittel}</span>: {displayNotes}
                                </>
                              ) : (
                                displayNotes
                              )
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="grid gap-4 py-3 px-4 text-sm grid-cols-9">
                      <div className="col-span-1">1</div>
                      <div className="col-span-3">{viewingPatient.lastTreatment}</div>
                      <div className="col-span-5">
                        {viewingPatient.isBlankoVO && viewingPatient.heilmittel ? (
                          <>
                            <span className="font-bold">{viewingPatient.heilmittel}</span>: {viewingPatient.notes}
                          </>
                        ) : (
                          viewingPatient.notes
                        )}
                      </div>
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

      {/* Add Patient Selection Modal */}
      {isPatientSelectModalOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 overflow-hidden">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="bg-white text-gray-800 py-4 px-6 rounded-t-lg flex justify-between items-center border-b">
              <h2 className="text-xl font-semibold">Select Patient{selectedPatientsInModal.length > 0 ? `s (${selectedPatientsInModal.length})` : ''}</h2>
              <button 
                onClick={() => setIsPatientSelectModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body - Scrollable */}
            <div className="p-6 overflow-y-auto flex-grow">
              <div className="grid grid-cols-1 gap-4">
                {patients.map((patient) => (
                  <div 
                    key={patient.id} 
                    className="p-4 border border-gray-200 rounded-md hover:bg-gray-50 flex justify-between items-center"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <input
                        type="checkbox"
                        checked={selectedPatientsInModal.includes(patient.id)}
                        onChange={() => togglePatientInSelectionModal(patient.id)}
                        className="h-5 w-5 text-blue-500 rounded border-gray-300"
                      />
                      <div>
                        <div className="font-medium">{patient.name}</div>
                        <div className="text-sm text-gray-600">
                          Prescription: {patient.prescription} | Treatment: {patient.isBlankoVO ? <>{patient.completedTreatments}/<span className="font-bold">BV</span></> : `${patient.completedTreatments}/${patient.totalTreatments}`}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Modal Footer with Proceed Button */}
            <div className="flex justify-end gap-3 p-4 border-t border-gray-200">
              <button 
                onClick={() => setIsPatientSelectModalOpen(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md text-sm font-medium"
              >
                Cancel
              </button>
              <button 
                onClick={proceedWithSelectedPatients}
                disabled={selectedPatientsInModal.length === 0}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  selectedPatientsInModal.length > 0 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'bg-blue-300 text-white cursor-not-allowed'
                }`}
              >
                Proceed with {selectedPatientsInModal.length} {selectedPatientsInModal.length === 1 ? 'Patient' : 'Patients'}
              </button>
            </div>
          </div>
        </div>
      )}

              {/* PDF Preview Modal */}
        {isPdfPreviewOpen && pdfData && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
              {/* Modal Header */}
              <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {pdfViewMode === 'save' ? 'PDF Vorschau - Therapiebericht' : 'Gespeicherter Therapiebericht'}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Patient: {pdfData.patient.name}
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
                      <p className="text-sm text-black">{pdfData.patient.doctor}</p>
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
                      Therapy Report to {showAnnotations && <span className="bg-yellow-100 px-1 rounded text-xs">📋 DEV: Doctor from Prescription Form</span>} {pdfData.patient.doctor} from {new Date().toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                    </h2>
                  </div>

                  {/* Patient Information */}
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-black">for the patient:</p>
                    <p className="text-sm text-black">
                      {showAnnotations && <span className="bg-yellow-100 px-1 rounded text-xs">📋 DEV: Patient Name from Prescription Form</span>} {pdfData.patient.name}, born: 
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
                      The treatment was conducted from {showAnnotations && <span className="bg-yellow-100 px-1 rounded text-xs">📋 DEV: Start Date from Prescription Form</span>} {pdfData.formData.startDate?.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })} to {showAnnotations && <span className="bg-yellow-100 px-1 rounded text-xs">📋 DEV: End Date from Prescription Form</span>} {pdfData.formData.endDate?.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })}.
                    </p>
                  </div>

                  {/* Current Therapy Status */}
                  <div className="space-y-2 py-4">
                    <p className="text-sm font-semibold text-black">Current therapy status (current findings)</p>
                    <p className="text-sm text-black whitespace-pre-wrap">{showAnnotations && <span className="bg-yellow-100 px-1 rounded text-xs">📋 DEV: Current Findings from Prescription Form</span>} {pdfData.formData.currentFindings}</p>
                  </div>

                  {/* Special Features */}
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-black">Special features during the treatment course</p>
                    <p className="text-sm text-black whitespace-pre-wrap">{showAnnotations && <span className="bg-yellow-100 px-1 rounded text-xs">📋 DEV: Special Features from Prescription Form</span>} {pdfData.formData.specialFeatures}</p>
                  </div>

                  {/* Treatment according to prescription */}
                  <div className="space-y-1 py-2">
                    <p className="text-sm font-semibold text-black">
                      {showAnnotations && <span className="bg-yellow-100 px-1 rounded text-xs">📋 DEV: Treatment Requirements from Prescription Form</span>} Treatment according to prescription: {pdfData.formData.treatmentAccordingToPrescription ? 'yes' : 'no'}
                    </p>
                  </div>

                  {/* Continuation of therapy */}
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-black">
                      {showAnnotations && <span className="bg-yellow-100 px-1 rounded text-xs">📋 DEV: Continuation Recommendation from Prescription Form</span>} Continuation of therapy recommended: {pdfData.formData.continuationOfTherapyRecommended ? 'yes' : 'no'}
                    </p>
                  </div>

                  {/* Change therapy frequency */}
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-black">
                      {showAnnotations && <span className="bg-yellow-100 px-1 rounded text-xs">📋 DEV: Change Therapy Frequency from Prescription Form</span>} Change therapy frequency: {pdfData.formData.changeTherapyFrequency ? 'yes' : 'no'}
                    </p>
                  </div>

                  {/* Change to individual therapy */}
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-black">
                      {showAnnotations && <span className="bg-yellow-100 px-1 rounded text-xs">📋 DEV: Change Individual Therapy from Prescription Form</span>} Change to individual therapy: {pdfData.formData.changeIndividualTherapy ? 'yes' : 'no'}
                    </p>
                  </div>

                  {/* Change to group therapy */}
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-black">
                      {showAnnotations && <span className="bg-yellow-100 px-1 rounded text-xs">📋 DEV: Change Group Therapy from Prescription Form</span>} Change to group therapy: {pdfData.formData.changeGroupTherapy ? 'yes' : 'no'}
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
                  onClick={closePdfPreview}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Close
                </button>
                {pdfViewMode === 'save' && (
                  <button
                    type="button"
                    onClick={handlePdfSave}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Complete Report
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Therapy Report Modal */}
        {isTherapyReportModalOpen && therapyReportPatient && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 overflow-hidden">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl mx-4 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="bg-white text-gray-800 py-4 px-6 rounded-t-lg flex justify-between items-center border-b">
              <h2 className="text-xl font-semibold">
                Therapiebericht - {therapyReportPatient.name}
              </h2>
              <button 
                onClick={closeTherapyReportModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

                            {/* Modal Body - Scrollable */}
            <div className="p-6 overflow-y-auto flex-grow">
              {/* Error Message Display */}
              {therapyReportModalError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-red-800 text-sm">{therapyReportModalError}</p>
                </div>
              )}
              
              <div className="space-y-6">
                {/* Patient Information (Read-only) */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Patient Information</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Name:</span>
                      <span className="ml-2 font-medium">{therapyReportPatient.name}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Facility:</span>
                      <span className="ml-2 font-medium">{therapyReportPatient.facility}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Prescription:</span>
                      <span className="ml-2 font-medium">{therapyReportPatient.prescription}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Doctor:</span>
                      <span className="ml-2 font-medium">{therapyReportPatient.doctor}</span>
                    </div>
                  </div>
                </div>

                {/* Therapy Type Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Therapy Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={therapyReportForm.therapyType}
                    onChange={(e) => updateTherapyReportForm('therapyType', e.target.value)}
                    className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 ${
                      therapyReportErrors.therapyType 
                        ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                        : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                    }`}
                    required
                  >
                    <option value="">-- Select Therapy Type --</option>
                    <option value="Physiotherapie">Physiotherapie</option>
                    <option value="Ergotherapie">Ergotherapie</option>
                    <option value="Logopädie">Logopädie</option>
                  </select>
                </div>

                {/* Date Range Selection */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Start Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Treatment Start Date <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input 
                        type="text" 
                        value={therapyReportForm.startDate ? formatDate(therapyReportForm.startDate) : ''}
                        readOnly
                        placeholder="Select start date"
                        className={`w-full border rounded-md py-2 px-3 bg-white cursor-pointer ${
                          therapyReportErrors.startDate 
                            ? 'border-red-500' 
                            : 'border-gray-300'
                        }`}
                        onClick={() => {
                          setStartDateCalendarOpen(!startDateCalendarOpen);
                          setEndDateCalendarOpen(false);
                        }}
                      />
                      <button 
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        onClick={() => {
                          setStartDateCalendarOpen(!startDateCalendarOpen);
                          setEndDateCalendarOpen(false);
                        }}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </button>
                      
                      {/* Start Date Calendar */}
                      {startDateCalendarOpen && (
                        <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-md shadow-lg z-20">
                          <div className="p-2 flex justify-between items-center border-b border-gray-200">
                            <button 
                              onClick={() => {
                                const newMonth = startDateCalendarMonth === 0 ? 11 : startDateCalendarMonth - 1;
                                const newYear = startDateCalendarMonth === 0 ? startDateCalendarYear - 1 : startDateCalendarYear;
                                setStartDateCalendarMonth(newMonth);
                                setStartDateCalendarYear(newYear);
                              }}
                              className="p-1 hover:bg-gray-100 rounded"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                              </svg>
                            </button>
                            <div className="font-medium">
                              {new Date(startDateCalendarYear, startDateCalendarMonth).toLocaleString('default', { month: 'long' })} {startDateCalendarYear}
                            </div>
                            <button 
                              onClick={() => {
                                const newMonth = startDateCalendarMonth === 11 ? 0 : startDateCalendarMonth + 1;
                                const newYear = startDateCalendarMonth === 11 ? startDateCalendarYear + 1 : startDateCalendarYear;
                                setStartDateCalendarMonth(newMonth);
                                setStartDateCalendarYear(newYear);
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
                            
                            {Array.from({ length: new Date(startDateCalendarYear, startDateCalendarMonth, 1).getDay() }).map((_, index) => (
                              <div key={`empty-start-${index}`} className="p-1"></div>
                            ))}
                            
                            {Array.from({ length: getDaysInMonthFn(startDateCalendarMonth, startDateCalendarYear) }).map((_, index) => {
                              const day = index + 1;
                              const currentDate = new Date();
                              const isToday = 
                                day === currentDate.getDate() && 
                                startDateCalendarMonth === currentDate.getMonth() && 
                                startDateCalendarYear === currentDate.getFullYear();
                                
                              return (
                                <div 
                                  key={`day-${day}`} 
                                  onClick={() => {
                                    const selectedDate = new Date(startDateCalendarYear, startDateCalendarMonth, day);
                                    updateTherapyReportForm('startDate', selectedDate);
                                    setStartDateCalendarOpen(false);
                                  }}
                                  className={`
                                    text-center py-1 cursor-pointer hover:bg-blue-100 rounded text-sm
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

                  {/* End Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Treatment End Date <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input 
                        type="text" 
                        value={therapyReportForm.endDate ? formatDate(therapyReportForm.endDate) : ''}
                        readOnly
                        placeholder="Select end date"
                        className={`w-full border rounded-md py-2 px-3 bg-white cursor-pointer ${
                          therapyReportErrors.endDate 
                            ? 'border-red-500' 
                            : 'border-gray-300'
                        }`}
                        onClick={() => {
                          setEndDateCalendarOpen(!endDateCalendarOpen);
                          setStartDateCalendarOpen(false);
                        }}
                      />
                      <button 
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        onClick={() => {
                          setEndDateCalendarOpen(!endDateCalendarOpen);
                          setStartDateCalendarOpen(false);
                        }}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </button>
                      
                      {/* End Date Calendar */}
                      {endDateCalendarOpen && (
                        <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-md shadow-lg z-20">
                          <div className="p-2 flex justify-between items-center border-b border-gray-200">
                            <button 
                              onClick={() => {
                                const newMonth = endDateCalendarMonth === 0 ? 11 : endDateCalendarMonth - 1;
                                const newYear = endDateCalendarMonth === 0 ? endDateCalendarYear - 1 : endDateCalendarYear;
                                setEndDateCalendarMonth(newMonth);
                                setEndDateCalendarYear(newYear);
                              }}
                              className="p-1 hover:bg-gray-100 rounded"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                              </svg>
                            </button>
                            <div className="font-medium">
                              {new Date(endDateCalendarYear, endDateCalendarMonth).toLocaleString('default', { month: 'long' })} {endDateCalendarYear}
                            </div>
                            <button 
                              onClick={() => {
                                const newMonth = endDateCalendarMonth === 11 ? 0 : endDateCalendarMonth + 1;
                                const newYear = endDateCalendarMonth === 11 ? endDateCalendarYear + 1 : endDateCalendarYear;
                                setEndDateCalendarMonth(newMonth);
                                setEndDateCalendarYear(newYear);
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
                            
                            {Array.from({ length: new Date(endDateCalendarYear, endDateCalendarMonth, 1).getDay() }).map((_, index) => (
                              <div key={`empty-end-${index}`} className="p-1"></div>
                            ))}
                            
                            {Array.from({ length: getDaysInMonthFn(endDateCalendarMonth, endDateCalendarYear) }).map((_, index) => {
                              const day = index + 1;
                              const currentDate = new Date();
                              const isToday = 
                                day === currentDate.getDate() && 
                                endDateCalendarMonth === currentDate.getMonth() && 
                                endDateCalendarYear === currentDate.getFullYear();
                                
                              return (
                                <div 
                                  key={`day-${day}`} 
                                  onClick={() => {
                                    const selectedDate = new Date(endDateCalendarYear, endDateCalendarMonth, day);
                                    updateTherapyReportForm('endDate', selectedDate);
                                    setEndDateCalendarOpen(false);
                                  }}
                                  className={`
                                    text-center py-1 cursor-pointer hover:bg-blue-100 rounded text-sm
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
                </div>

                {/* Current Therapy Status (current findings) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Therapy Status (current findings) <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={therapyReportForm.currentFindings}
                    onChange={(e) => updateTherapyReportForm('currentFindings', e.target.value)}
                    rows={6}
                    className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 resize-vertical ${
                      therapyReportErrors.currentFindings 
                        ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                        : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                    }`}
                    placeholder="Describe the current therapy status and findings..."
                    required
                  />
                </div>

                {/* Special features during treatment course */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={therapyReportForm.specialFeatures}
                    onChange={(e) => updateTherapyReportForm('specialFeatures', e.target.value)}
                    rows={6}
                    className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 resize-vertical ${
                      therapyReportErrors.specialFeatures 
                        ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                        : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                    }`}
                    placeholder="Describe any special features observed during the treatment course..."
                    required
                  />
                </div>

                {/* Execution/Modification of Treatment */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Execution/Modification of Treatment</h3>
                  
                  {/* Treatment according to prescription */}
                  <div className="mb-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={therapyReportForm.treatmentAccordingToPrescription}
                        onChange={(e) => updateTherapyReportForm('treatmentAccordingToPrescription', e.target.checked)}
                        className="mr-2 h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700">Treatment according to prescription</span>
                    </label>
                  </div>

                  {/* Continuation of therapy recommended */}
                  <div className="mb-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={therapyReportForm.continuationOfTherapyRecommended}
                        onChange={(e) => updateTherapyReportForm('continuationOfTherapyRecommended', e.target.checked)}
                        className="mr-2 h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700">Continuation of therapy recommended</span>
                    </label>
                  </div>

                  {/* Change options */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Change</h4>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={therapyReportForm.changeTherapyFrequency}
                          onChange={(e) => updateTherapyReportForm('changeTherapyFrequency', e.target.checked)}
                          className="mr-2 h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Therapy frequency</span>
                      </label>
                      
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={therapyReportForm.changeIndividualTherapy}
                          onChange={(e) => updateTherapyReportForm('changeIndividualTherapy', e.target.checked)}
                          className="mr-2 h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Individual therapy</span>
                      </label>
                      
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={therapyReportForm.changeGroupTherapy}
                          onChange={(e) => updateTherapyReportForm('changeGroupTherapy', e.target.checked)}
                          className="mr-2 h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Group therapy</span>
                      </label>
                    </div>
                    
                    <p className="text-xs text-gray-600 italic mt-3">
                      after consultation with the prescribing doctor
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 p-4 border-t border-gray-200">
              <button 
                onClick={closeTherapyReportModal}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md text-sm font-medium"
              >
                Cancel
              </button>
              <button 
                onClick={handleTherapyReportSubmit}
                className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md text-sm font-medium"
              >
                Create Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Removed modals for simplified prototype */}
    </WireframeLayout>
  );
} 