'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
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

// Define the patient data type
type Patient = {
  id: number;
  name: string;
  facility: string;
  lastTreatment: string;
  frequencyWTD: string;
  therapeut: string; // Changed from organizer to therapeut (legacy field)
  primaryTherapist: string; // Primary therapist responsible for the VO
  sharedTherapists: string[]; // Array of therapists who have shared access
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
  transferStatus?: 'Temporary' | 'Permanent (Pending)' | 'Permanent (Confirmed)' | ''; // New field for transfer tracking
};

// Type for a treatment history entry
type TreatmentEntry = {
  date: string;
  notes?: string;
  session?: string;
  order?: number;  // Added order field
  signatureObtained?: boolean; // New field to track if signature was obtained for rejected treatments
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

// Temporary Transfer Badge component
const TemporaryTransferBadge = () => {
  return (
    <span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 mt-1">
      Temporary
    </span>
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

export default function VOSharingWireframe() {
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
  
  // State for toast notifications
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [nextToastId, setNextToastId] = useState(1);
  
  // Tab navigation state - new state for tracking active tab
  const [activeTab, setActiveTab] = useState<'open-prescriptions' | 'shared-prescriptions' | 'inactive-patients' | 'calendar'>('open-prescriptions');
  
  // State to track which patients' suggestions are visible (now an array) - This will be removed later if unused
  const [visibleSuggestions, setVisibleSuggestions] = useState<number[]>([]);
  
  const [treatmentDate, setTreatmentDate] = useState(formatDateFn(new Date())); // Use renamed function
  const [modalPatients, setModalPatients] = useState<ModalItem[]>([]);
  const [nextBreakId, setNextBreakId] = useState<number>(1000); // Use a different range for break IDs
  const [draggedPatientId, setDraggedPatientId] = useState<number | null>(null);
  const [activityDropdownOpen, setActivityDropdownOpen] = useState(false); // State for activity dropdown
  
  // State for "Keine Folge-VO bestellen" modal
  const [isKeineFolgeVoModalOpen, setIsKeineFolgeVoModalOpen] = useState(false);
  const [selectedPatientForFolgeVo, setSelectedPatientForFolgeVo] = useState<Patient | null>(null);
  const [keineFolgeVoReason, setKeineFolgeVoReason] = useState(''); // New state variable for reason
  
  // State for "Abbrechen VO" modal
  const [isAbbrechenVoModalOpen, setIsAbbrechenVoModalOpen] = useState(false);
  const [selectedPatientForAbbrechenVo, setSelectedPatientForAbbrechenVo] = useState<Patient | null>(null);
  const [abbrechenReason, setAbbrechenReason] = useState('');
  const [customAbbrechenReason, setCustomAbbrechenReason] = useState('');
  
  // State for "Share VO" modal
  const [isShareVOModalOpen, setIsShareVOModalOpen] = useState(false);
  const [selectedPatientsForTransfer, setSelectedPatientsForTransfer] = useState<Patient[]>([]);
  const [shareAction, setShareAction] = useState<'add' | 'remove'>('add');
  const [selectedShareTherapists, setSelectedShareTherapists] = useState<string[]>([]);
  const [isShareDropdownOpen, setIsShareDropdownOpen] = useState<boolean>(false);
  const [selectedTherapist, setSelectedTherapist] = useState<string>('');
  const [isTransferring, setIsTransferring] = useState(false);
  const [transferType, setTransferType] = useState<'temporary' | 'permanent' | null>('permanent');
  
  // State for transfer therapist searchable dropdown
  const [isTransferDropdownOpen, setIsTransferDropdownOpen] = useState<boolean>(false);
  const [transferSearchTerm, setTransferSearchTerm] = useState<string>('');
  
  // State for selected patient IDs for batch actions
  const [selectedPatientIds, setSelectedPatientIds] = useState<number[]>([]);
  
  // State for "Transfer Patient" modal (separate from Share VO)
  const [isTransferPatientModalOpen, setIsTransferPatientModalOpen] = useState(false);
  const [selectedPatientsForTransferPatient, setSelectedPatientsForTransferPatient] = useState<Patient[]>([]);
  const [selectedTransferTherapist, setSelectedTransferTherapist] = useState<string>('');
  const [isTransferPatientInProgress, setIsTransferPatientInProgress] = useState(false);
  const [transferPatientType, setTransferPatientType] = useState<'temporary' | 'permanent' | null>('permanent');
  
  // State for transfer patient therapist searchable dropdown
  const [isTransferPatientDropdownOpen, setIsTransferPatientDropdownOpen] = useState<boolean>(false);
  const [transferPatientSearchTerm, setTransferPatientSearchTerm] = useState<string>('');
  
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
  const removeToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);
  
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
  const getRandomNote = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * additionalNotes.length);
    return additionalNotes[randomIndex];
  }, []);
  
  // State for selected therapist filter
  const [selectedTherapistFilter, setSelectedTherapistFilter] = useState<string>('Sarah Miller');
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('Sarah Miller');
  
  // Current logged-in user (dynamic based on therapist filter)
  const currentUser = selectedTherapistFilter;
  
  // Therapist list
  const therapists = ['Sarah Miller', 'John Schmidt', 'Lisa Johnson', 'Michael Chen', 'Dr. Emma Wilson'];
  
  // Filter therapists based on search term
  const filteredTherapists = therapists.filter(therapist =>
    therapist.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Handle therapist selection
  const handleTherapistSelect = (therapist: string) => {
    setSelectedTherapistFilter(therapist);
    setSearchTerm(therapist);
    setIsDropdownOpen(false);
  };
  
  // Handle input focus
  const handleInputFocus = () => {
    setIsDropdownOpen(true);
  };
  
  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setIsDropdownOpen(true);
    
    // If the typed value exactly matches a therapist, update the filter
    const exactMatch = therapists.find(therapist => 
      therapist.toLowerCase() === value.toLowerCase()
    );
    if (exactMatch) {
      setSelectedTherapistFilter(exactMatch);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const dropdownElement = document.getElementById('therapist-dropdown');
      if (dropdownElement && !dropdownElement.contains(event.target as Node)) {
        setIsDropdownOpen(false);
        // Reset to selected therapist if search doesn't match exactly
        const exactMatch = therapists.find(therapist => 
          therapist.toLowerCase() === searchTerm.toLowerCase()
        );
        if (!exactMatch) {
          setSearchTerm(selectedTherapistFilter);
        }
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen, searchTerm, selectedTherapistFilter, therapists]);

  // Transfer modal therapist list (includes Therapist C and removes "Therapist C" text)
  const transferTherapists = ['Sarah Miller', 'John Schmidt', 'Lisa Johnson', 'Michael Chen', 'Dr. Emma Wilson'];
  
  // Filter transfer therapists based on search term
  const filteredTransferTherapists = transferTherapists.filter(therapist =>
    therapist.toLowerCase().includes(transferSearchTerm.toLowerCase())
  );
  
  // Handle transfer therapist selection
  const handleTransferTherapistSelect = (therapist: string) => {
    setSelectedTherapist(therapist);
    setTransferSearchTerm(therapist);
    setIsTransferDropdownOpen(false);
  };
  
  // Handle transfer input focus
  const handleTransferInputFocus = () => {
    setIsTransferDropdownOpen(true);
  };
  
  // Handle transfer input change
  const handleTransferInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTransferSearchTerm(value);
    setIsTransferDropdownOpen(true);
    
    // If the typed value exactly matches a therapist, update the selection
    const exactMatch = transferTherapists.find(therapist => 
      therapist.toLowerCase() === value.toLowerCase()
    );
    if (exactMatch) {
      setSelectedTherapist(exactMatch);
    }
  };

  // Close transfer dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const dropdownElement = document.getElementById('transfer-therapist-dropdown');
      if (dropdownElement && !dropdownElement.contains(event.target as Node)) {
        setIsTransferDropdownOpen(false);
        // Reset to selected therapist if search doesn't match exactly
        const exactMatch = transferTherapists.find(therapist => 
          therapist.toLowerCase() === transferSearchTerm.toLowerCase()
        );
        if (!exactMatch) {
          setTransferSearchTerm(selectedTherapist);
        }
      }
    };

    if (isTransferDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isTransferDropdownOpen, transferSearchTerm, selectedTherapist, transferTherapists]);

  // Close share dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.share-dropdown-container')) {
        setIsShareDropdownOpen(false);
      }
    };

    if (isShareDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isShareDropdownOpen]);

  // State for all patients (now with 10 patients)
  const [allPatients, setAllPatients] = useState<Patient[]>([
    {
      id: 1,
      name: 'John Smith',
      facility: 'Main Hospital',
      lastTreatment: '18.03.2025',
      frequencyWTD: '2',
      therapeut: 'Sarah Miller',
      primaryTherapist: 'Sarah Miller',
      sharedTherapists: [],
      prescription: '1234-1',
      status: 'Active',
      doctor: 'Dr. Wilson',
      selected: false,
      totalTreatments: 12,
      completedTreatments: 8,
      treated: true,
      treatmentHistory: [
        {
          date: '25.02.2025', // Tuesday - Last week of Feb
          notes: 'Initial assessment and range of motion exercises.',
          session: '1/12',
          order: 1
        },
        {
          date: '28.02.2025', // Friday - Last week of Feb
          notes: 'Continued with ROM exercises, added light resistance.',
          session: '2/12',
          order: 2
        },
        {
          date: '04.03.2025', // Tuesday - 1st week of March
          notes: 'Progressed to moderate resistance exercises.',
          session: '3/12',
          order: 1
        },
        {
          date: '07.03.2025', // Friday - 1st week of March
          notes: 'Added functional movement patterns.',
          session: '4/12',
          order: 2
        },
        {
          date: '11.03.2025', // Tuesday - 2nd week of March
          notes: 'Increased resistance, patient tolerating well.',
          session: '5/12',
          order: 1
        },
        {
          date: '14.03.2025', // Friday - 2nd week of March
          notes: 'Focus on gait training and balance exercises.',
          session: '6/12',
          order: 3
        },
        {
          date: '18.03.2025', // Tuesday - 3rd week of March
          notes: 'Continued progress with strength training.',
          session: '7/12',
          order: 2
        },
        {
          date: '21.03.2025', // Friday - 3rd week of March
          notes: 'Added proprioceptive exercises.',
          session: '8/12',
          order: 1
        }
      ]
    },
    {
      id: 2,
      name: 'Emma Johnson',
      facility: 'Rehab Center',
      lastTreatment: '20.03.2025',
      frequencyWTD: '2',
      therapeut: 'John Schmidt',
      primaryTherapist: 'John Schmidt',
      sharedTherapists: ['Sarah Miller'],
      prescription: '5678-2',
      status: 'Active',
      doctor: 'Dr. Miller',
      selected: false,
      totalTreatments: 10,
      completedTreatments: 6,
      treated: true,
      treatmentHistory: [
        {
          date: '24.02.2025', // Monday - Last week of Feb
          notes: 'Initial evaluation of cervical spine mobility.',
          session: '1/10',
          order: 1
        },
        {
          date: '27.02.2025', // Thursday - Last week of Feb
          notes: 'Gentle manual therapy for cervical spine.',
          session: '2/10',
          order: 3
        },
        {
          date: '03.03.2025', // Monday - 1st week of March
          notes: 'Progressed to active ROM exercises.',
          session: '3/10',
          order: 2
        },
        {
          date: '06.03.2025', // Thursday - 1st week of March
          notes: 'Added isometric neck strengthening.',
          session: '4/10',
          order: 1
        },
        {
          date: '10.03.2025', // Monday - 2nd week of March
          notes: 'Continued with manual therapy and exercises.',
          session: '5/10',
          order: 3
        },
        {
          date: '13.03.2025', // Thursday - 2nd week of March
          notes: 'Focus on posture education and ergonomics.',
          session: '6/10',
          order: 2
        }
      ]
    },
    {
      id: 3,
      name: 'Michael Williams',
      facility: 'Sports Clinic',
      lastTreatment: '19.03.2025',
      frequencyWTD: '2',
      therapeut: 'Sarah Miller',
      primaryTherapist: 'Sarah Miller',
      sharedTherapists: [],
      prescription: '9101-3',
      status: 'Active',
      doctor: 'Dr. Brown',
      selected: false,
      totalTreatments: 18,
      completedTreatments: 10,
      treated: true,
      treatmentHistory: [
        {
          date: '22.02.2025', // Saturday - Before Last week of Feb
          notes: 'Initial evaluation post-surgery.',
          session: '1/18',
          order: 1
        },
        {
          date: '24.02.2025', // Monday - Last week of Feb
          notes: 'Wound check and gentle movements.',
          session: '2/18',
          order: 2
        },
        {
          date: '26.02.2025', // Wednesday - Last week of Feb
          notes: 'Post-surgery assessment and light mobility work.',
          session: '3/18',
          order: 2
        },
        {
          date: '01.03.2025', // Saturday - Last week of Feb/1st week March
          notes: 'Gentle ROM exercises, wound healing progressing well.',
          session: '4/18',
          order: 1
        },
        {
          date: '05.03.2025', // Wednesday - 1st week of March
          notes: 'Progressed to weight-bearing exercises as tolerated.',
          session: '5/18',
          order: 2
        },
        {
          date: '08.03.2025', // Saturday - 1st week of March
          notes: 'Increased mobility work, started light resistance.',
          session: '6/18',
          order: 3
        },
        {
          date: '12.03.2025', // Wednesday - 2nd week of March
          notes: 'Functional movement patterns introduced.',
          session: '7/18',
          order: 1
        },
        {
          date: '15.03.2025', // Saturday - 2nd week of March
          notes: 'Progressed resistance training, good tolerance.',
          session: '8/18',
          order: 2
        },
        {
          date: '19.03.2025', // Wednesday - 3rd week of March
          notes: 'Sport-specific movement patterns introduced.',
          session: '9/18',
          order: 3
        },
        {
          date: '22.03.2025', // Saturday - 3rd week of March
          notes: 'Added plyometric training components.',
          session: '10/18',
          order: 1
        }
      ]
    },
    {
      id: 4,
      name: 'Patricia Brown',
      facility: 'Elder Care',
      lastTreatment: '21.03.2025',
      frequencyWTD: '2',
      therapeut: 'John Schmidt',
      primaryTherapist: 'John Schmidt',
      sharedTherapists: ['Sarah Miller'],
      prescription: '1122-4',
      status: 'Active',
      doctor: 'Dr. Taylor',
      selected: false,
      totalTreatments: 20,
      completedTreatments: 14,
      treated: true,
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
      ]
    },
    {
      id: 5,
      name: 'Thomas Miller',
      facility: 'Ortho Institute',
      lastTreatment: '20.03.2025',
      frequencyWTD: '2',
      therapeut: 'Sarah Miller',
      primaryTherapist: 'Sarah Miller',
      sharedTherapists: [],
      prescription: '3344-5',
      status: 'Active',
      doctor: 'Dr. Roberts',
      selected: false,
      totalTreatments: 15,
      completedTreatments: 10,
      treated: true,
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
      ]
    },
    // Adding 5 new patients for a total of 10
    {
      id: 6,
      name: 'Sarah Davis',
      facility: 'Wellness Center',
      lastTreatment: '22.03.2025',
      frequencyWTD: '2',
      therapeut: 'Sarah Miller',
      primaryTherapist: 'Sarah Miller',
      sharedTherapists: [],
      prescription: '4455-6',
      status: 'Active',
      doctor: 'Dr. Anderson',
      selected: false,
      totalTreatments: 14,
      completedTreatments: 9,
      treated: true,
      treatmentHistory: [
        {
          date: '26.02.2025', // Wednesday - Last week of Feb
          notes: 'Initial assessment for lower back pain.',
          session: '1/14',
          order: 1
        },
        {
          date: '01.03.2025', // Saturday - 1st week of March
          notes: 'Started core stabilization exercises.',
          session: '2/14',
          order: 2
        },
        {
          date: '05.03.2025', // Wednesday - 1st week of March
          notes: 'Added lumbar mobility work.',
          session: '3/14',
          order: 1
        },
        {
          date: '08.03.2025', // Saturday - 1st week of March
          notes: 'Progressed to functional movements.',
          session: '4/14',
          order: 3
        },
        {
          date: '12.03.2025', // Wednesday - 2nd week of March
          notes: 'Added strengthening for hip flexors.',
          session: '5/14',
          order: 2
        },
        {
          date: '15.03.2025', // Saturday - 2nd week of March
          notes: 'Focus on postural correction techniques.',
          session: '6/14',
          order: 1
        },
        {
          date: '19.03.2025', // Wednesday - 3rd week of March
          notes: 'Increased resistance in core exercises.',
          session: '7/14',
          order: 3
        },
        {
          date: '22.03.2025', // Saturday - 3rd week of March
          notes: 'Added dynamic stability training.',
          session: '8/14',
          order: 2
        },
        {
          date: '26.03.2025', // Wednesday - 4th week of March
          notes: 'Sport-specific movement preparation.',
          session: '9/14',
          order: 1
        }
      ]
    },
    {
      id: 7,
      name: 'Robert Garcia',
      facility: 'Medical Center',
      lastTreatment: '23.03.2025',
      frequencyWTD: '2',
      therapeut: 'John Schmidt',
      primaryTherapist: 'John Schmidt',
      sharedTherapists: [],
      prescription: '6677-7',
      status: 'Active',
      doctor: 'Dr. Martinez',
      selected: false,
      totalTreatments: 16,
      completedTreatments: 11,
      treated: true,
      treatmentHistory: [
        {
          date: '23.02.2025', // Sunday - Last week of Feb
          notes: 'Post-stroke evaluation and assessment.',
          session: '1/16',
          order: 1
        },
        {
          date: '26.02.2025', // Wednesday - Last week of Feb
          notes: 'Started passive range of motion exercises.',
          session: '2/16',
          order: 2
        },
        {
          date: '02.03.2025', // Sunday - 1st week of March
          notes: 'Progressed to active-assisted movements.',
          session: '3/16',
          order: 1
        },
        {
          date: '05.03.2025', // Wednesday - 1st week of March
          notes: 'Added standing balance training.',
          session: '4/16',
          order: 3
        },
        {
          date: '09.03.2025', // Sunday - 2nd week of March
          notes: 'Gait training with assistive device.',
          session: '5/16',
          order: 2
        },
        {
          date: '12.03.2025', // Wednesday - 2nd week of March
          notes: 'Fine motor skills rehabilitation.',
          session: '6/16',
          order: 1
        },
        {
          date: '16.03.2025', // Sunday - 3rd week of March
          notes: 'Coordination and proprioception exercises.',
          session: '7/16',
          order: 3
        },
        {
          date: '19.03.2025', // Wednesday - 3rd week of March
          notes: 'Advanced balance and stability training.',
          session: '8/16',
          order: 2
        },
        {
          date: '23.03.2025', // Sunday - 3rd week of March
          notes: 'Functional task training.',
          session: '9/16',
          order: 1
        },
        {
          date: '26.03.2025', // Wednesday - 4th week of March
          notes: 'Independent mobility assessment.',
          session: '10/16',
          order: 3
        },
        {
          date: '30.03.2025', // Sunday - 5th week of March
          notes: 'Community mobility preparation.',
          session: '11/16',
          order: 2
        }
      ]
    },
    {
      id: 8,
      name: 'Linda Rodriguez',
      facility: 'Physical Therapy Clinic',
      lastTreatment: '24.03.2025',
      frequencyWTD: '2',
      therapeut: 'Sarah Miller',
      primaryTherapist: 'Sarah Miller',
      sharedTherapists: [],
      prescription: '7788-8',
      status: 'Active',
      doctor: 'Dr. Thompson',
      selected: false,
      totalTreatments: 12,
      completedTreatments: 7,
      treated: true,
      treatmentHistory: [
        {
          date: '28.02.2025', // Friday - Last week of Feb
          notes: 'Knee replacement post-operative evaluation.',
          session: '1/12',
          order: 1
        },
        {
          date: '04.03.2025', // Tuesday - 1st week of March
          notes: 'Started gentle knee flexion exercises.',
          session: '2/12',
          order: 2
        },
        {
          date: '07.03.2025', // Friday - 1st week of March
          notes: 'Added quadriceps strengthening.',
          session: '3/12',
          order: 1
        },
        {
          date: '11.03.2025', // Tuesday - 2nd week of March
          notes: 'Progressed to partial weight bearing.',
          session: '4/12',
          order: 3
        },
        {
          date: '14.03.2025', // Friday - 2nd week of March
          notes: 'Gait training with walker assistance.',
          session: '5/12',
          order: 2
        },
        {
          date: '18.03.2025', // Tuesday - 3rd week of March
          notes: 'Increased knee range of motion targets.',
          session: '6/12',
          order: 1
        },
        {
          date: '21.03.2025', // Friday - 3rd week of March
          notes: 'Advanced strengthening exercises.',
          session: '7/12',
          order: 3
        }
      ]
    },
    {
      id: 9,
      name: 'James Wilson',
      facility: 'Therapy Associates',
      lastTreatment: '25.03.2025',
      frequencyWTD: '2',
      therapeut: 'John Schmidt',
      primaryTherapist: 'John Schmidt',
      sharedTherapists: [],
      prescription: '8899-9',
      status: 'Active',
      doctor: 'Dr. Lee',
      selected: false,
      totalTreatments: 13,
      completedTreatments: 8,
      treated: true,
      treatmentHistory: [
        {
          date: '03.03.2025', // Monday - 1st week of March
          notes: 'Shoulder impingement syndrome evaluation.',
          session: '1/13',
          order: 1
        },
        {
          date: '06.03.2025', // Thursday - 1st week of March
          notes: 'Started gentle pendulum exercises.',
          session: '2/13',
          order: 2
        },
        {
          date: '10.03.2025', // Monday - 2nd week of March
          notes: 'Added passive range of motion.',
          session: '3/13',
          order: 3
        },
        {
          date: '13.03.2025', // Thursday - 2nd week of March
          notes: 'Progressed to active-assisted ROM.',
          session: '4/13',
          order: 1
        },
        {
          date: '17.03.2025', // Monday - 3rd week of March
          notes: 'Scapular stabilization exercises.',
          session: '5/13',
          order: 2
        },
        {
          date: '20.03.2025', // Thursday - 3rd week of March
          notes: 'Added rotator cuff strengthening.',
          session: '6/13',
          order: 3
        },
        {
          date: '24.03.2025', // Monday - 4th week of March
          notes: 'Functional shoulder movements.',
          session: '7/13',
          order: 1
        },
        {
          date: '27.03.2025', // Thursday - 4th week of March
          notes: 'Activity-specific training.',
          session: '8/13',
          order: 2
        }
      ]
    },
    {
      id: 10,
      name: 'Maria Gonzalez',
      facility: 'Rehabilitation Center',
      lastTreatment: '26.03.2025',
      frequencyWTD: '2',
      therapeut: 'John Schmidt',
      primaryTherapist: 'John Schmidt',
      sharedTherapists: ['Sarah Miller'],
      prescription: '9900-10',
      status: 'Active',
      doctor: 'Dr. White',
      selected: false,
      totalTreatments: 11,
      completedTreatments: 6,
      treated: true,
      treatmentHistory: [
        {
          date: '05.03.2025', // Wednesday - 1st week of March
          notes: 'Ankle sprain rehabilitation assessment.',
          session: '1/11',
          order: 1
        },
        {
          date: '08.03.2025', // Saturday - 1st week of March
          notes: 'Started with RICE protocol and gentle ROM.',
          session: '2/11',
          order: 2
        },
        {
          date: '12.03.2025', // Wednesday - 2nd week of March
          notes: 'Progressed to weight-bearing as tolerated.',
          session: '3/11',
          order: 3
        },
        {
          date: '15.03.2025', // Saturday - 2nd week of March
          notes: 'Added proprioception and balance training.',
          session: '4/11',
          order: 1
        },
        {
          date: '19.03.2025', // Wednesday - 3rd week of March
          notes: 'Strengthening exercises for ankle stability.',
          session: '5/11',
          order: 2
        },
        {
          date: '22.03.2025', // Saturday - 3rd week of March
          notes: 'Sport-specific movement preparation.',
          session: '6/11',
          order: 3
        }
      ]
    },
    // Lisa Johnson's VOs
    {
      id: 14,
      name: 'Thomas Anderson',
      facility: 'Sports Medicine Center',
      lastTreatment: '25.03.2025',
      frequencyWTD: '3',
      therapeut: 'Lisa Johnson',
      primaryTherapist: 'Lisa Johnson',
      sharedTherapists: [],
      prescription: '9901-1',
      status: 'Active',
      doctor: 'Dr. Martinez',
      selected: false,
      totalTreatments: 15,
      completedTreatments: 5,
      treated: false,
      treatmentHistory: [
        {
          date: '18.03.2025',
          notes: 'Initial knee rehabilitation assessment.',
          session: '1/15',
          order: 1
        }
      ]
    },
    {
      id: 15,
      name: 'Maria Santos',
      facility: 'Recovery Center',
      lastTreatment: '24.03.2025',
      frequencyWTD: '2',
      therapeut: 'Lisa Johnson',
      primaryTherapist: 'Lisa Johnson',
      sharedTherapists: [],
      prescription: '9902-2',
      status: 'Active',
      doctor: 'Dr. Kim',
      selected: false,
      totalTreatments: 10,
      completedTreatments: 3,
      treated: false,
      treatmentHistory: [
        {
          date: '20.03.2025',
          notes: 'Shoulder mobility exercises.',
          session: '1/10',
          order: 1
        }
      ]
    },
    // Michael Chen's VOs
    {
      id: 16,
      name: 'Anna Petrov',
      facility: 'Wellness Clinic',
      lastTreatment: '26.03.2025',
      frequencyWTD: '2',
      therapeut: 'Michael Chen',
      primaryTherapist: 'Michael Chen',
      sharedTherapists: [],
      prescription: '9903-3',
      status: 'Active',
      doctor: 'Dr. Zhang',
      selected: false,
      totalTreatments: 8,
      completedTreatments: 2,
      treated: false,
      treatmentHistory: [
        {
          date: '19.03.2025',
          notes: 'Back pain management session.',
          session: '1/8',
          order: 1
        }
      ]
    },
    {
      id: 17,
      name: 'Carlos Rodriguez',
      facility: 'Therapy Center',
      lastTreatment: '25.03.2025',
      frequencyWTD: '3',
      therapeut: 'Michael Chen',
      primaryTherapist: 'Michael Chen',
      sharedTherapists: [],
      prescription: '9904-4',
      status: 'Active',
      doctor: 'Dr. Lopez',
      selected: false,
      totalTreatments: 12,
      completedTreatments: 4,
      treated: false,
      treatmentHistory: [
        {
          date: '21.03.2025',
          notes: 'Post-surgery rehabilitation.',
          session: '1/12',
          order: 1
        }
      ]
    },
    // Dr. Emma Wilson's VOs
    {
      id: 18,
      name: 'James Thompson',
      facility: 'Medical Center',
      lastTreatment: '27.03.2025',
      frequencyWTD: '2',
      therapeut: 'Dr. Emma Wilson',
      primaryTherapist: 'Dr. Emma Wilson',
      sharedTherapists: [],
      prescription: '9905-5',
      status: 'Active',
      doctor: 'Dr. Taylor',
      selected: false,
      totalTreatments: 14,
      completedTreatments: 6,
      treated: false,
      treatmentHistory: [
        {
          date: '23.03.2025',
          notes: 'Neurological rehabilitation assessment.',
          session: '1/14',
          order: 1
        }
      ]
    },
    {
      id: 19,
      name: 'Sophie Mueller',
      facility: 'Rehabilitation Institute',
      lastTreatment: '26.03.2025',
      frequencyWTD: '3',
      therapeut: 'Dr. Emma Wilson',
      primaryTherapist: 'Dr. Emma Wilson',
      sharedTherapists: [],
      prescription: '9906-6',
      status: 'Active',
      doctor: 'Dr. Johnson',
      selected: false,
      totalTreatments: 9,
      completedTreatments: 3,
      treated: false,
      treatmentHistory: [
        {
          date: '22.03.2025',
          notes: 'Balance and coordination training.',
          session: '1/9',
          order: 1
        }
      ]
    }
  ]);

  // Filter patients based on tab and current user
  const getFilteredPatients = () => {
    if (activeTab === 'open-prescriptions') {
      // Show VOs where current user is primary therapist
      const primaryVOs = allPatients.filter(patient => patient.primaryTherapist === currentUser);
      return primaryVOs;
    } else if (activeTab === 'shared-prescriptions') {
      // Show VOs where current user is in shared therapists
      const sharedVOs = allPatients.filter(patient => patient.sharedTherapists.includes(currentUser));
      return sharedVOs;
    } else {
      // For inactive-patients, use existing logic
      return allPatients.filter(patient => patient.primaryTherapist === currentUser);
    }
  };
  
  const patients = getFilteredPatients();

  // State for inactive patients
  const [inactivePatients, setInactivePatients] = useState<Patient[]>([
    {
      id: 6, // Ensure unique IDs
      name: 'Alice Brown',
      facility: 'Community Clinic',
      lastTreatment: '10.01.2025',
      frequencyWTD: '0',
      therapeut: 'John Schmidt',
      primaryTherapist: 'John Schmidt',
      sharedTherapists: [],
      prescription: '9876-6',
      status: 'Inactive',
      doctor: 'Dr. Davis',
      selected: false,
      totalTreatments: 10,
      completedTreatments: 10,
      treated: true, // or false if never treated
      treatmentHistory: [
        { date: '10.01.2025', notes: 'Completed all sessions.', session: '10/10', order: 1 }
      ]
    },
    {
      id: 7,
      name: 'Robert Green',
      facility: 'Wellness Center',
      lastTreatment: '05.12.2024',
      frequencyWTD: '0',
      therapeut: 'Sarah Miller',
      primaryTherapist: 'Sarah Miller',
      sharedTherapists: [],
      prescription: '5432-7',
      status: 'Inactive',
      doctor: 'Dr. Evans',
      selected: false,
      totalTreatments: 12,
      completedTreatments: 5, // Terminated early
      treated: true,
      treatmentHistory: [
        { date: '05.12.2024', notes: 'Treatment terminated by therapist.', session: '5/12', order: 1 }
      ]
    },
    {
      id: 8,
      name: 'Julia White',
      facility: 'Home Care',
      lastTreatment: '15.11.2024',
      frequencyWTD: '0',
      therapeut: 'John Schmidt',
      primaryTherapist: 'John Schmidt',
      sharedTherapists: [],
      prescription: 'H1209',
      status: 'Inactive',
      doctor: 'Dr. King',
      selected: false,
      totalTreatments: 8,
      completedTreatments: 3,
      treated: true,
      treatmentHistory: [
        { date: '15.11.2024', notes: 'Patient self-discharged.', session: '3/8', order: 1 }
      ]
    }
  ]);

  // Modified function to assign order for all items including breaks
  const assignOrder = useCallback((itemsList: ModalItem[]) => {
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
  }, [getRandomNote]);

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
  }, [isModalOpen]); // Removed 'patients' dependency to prevent infinite loop

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

  // Function to handle patient click (placeholder for wireframe)
  const handlePatientClick = (patient: Patient) => {
    console.log('Patient clicked:', patient.name);
    // This is a placeholder function for the wireframe
    // In a real application, this could navigate to patient details or show a modal
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
        setAllPatients(prevPatients => 
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
                
                // Update existing entry
                treatmentHistory[entryIndex] = {
                  ...treatmentHistory[entryIndex],
                  notes: modalPatient.notes,
                  order: modalPatient.order,
                  session: sessionDisplay,
                  signatureObtained: modalPatient.rejectedTreatment ? modalPatient.signatureObtained : undefined
                };
                
                // Update completedTreatments count if needed
                let newCompletedTreatments = patient.completedTreatments;
                
                if (previouslyCounted && !shouldCountNow) {
                  // If it was previously counted but shouldn't be now, decrement
                  newCompletedTreatments = Math.max(0, newCompletedTreatments - 1);
                } else if (!previouslyCounted && shouldCountNow) {
                  // If it wasn't previously counted but should be now, increment
                  newCompletedTreatments = Math.min(patient.totalTreatments, newCompletedTreatments + 1);
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
        
        setAllPatients(updatedPatients);
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
            ? Math.min(patient.completedTreatments + 1, patient.totalTreatments)
            : patient.completedTreatments;
          
          // Create session display string based on whether treatment counts
          let sessionDisplay;
          if (!modalPatient.rejectedTreatment) {
            // Regular treatment
            sessionDisplay = `${newCompletedTreatments}/${patient.totalTreatments}`;
          } else if (modalPatient.rejectedTreatment && modalPatient.signatureObtained) {
            // Rejected but signature obtained (counts toward total)
            sessionDisplay = `Rejected-${newCompletedTreatments}/${patient.totalTreatments}`;
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
              {
                date: treatmentDate,
                notes: modalPatient.rejectedTreatment ? `Treatment Rejected: ${modalPatient.notes}` : modalPatient.notes, // Add prefix for logs if rejected
                session: sessionDisplay,
                order: modalPatient.order,
                signatureObtained: modalPatient.rejectedTreatment ? modalPatient.signatureObtained : undefined, // Only set for rejected treatments
              }
            ]
          };
        }
        return patient;
      });

      setAllPatients(updatedPatients);
      
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
      
      // Switch to open-prescriptions tab after marking patients as treated
      setActiveTab('open-prescriptions');
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
    setAllPatients(allPatients.map(patient => 
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
    setAllPatients(allPatients.map(patient => 
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
    setAllPatients(prevPatients => 
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
                      Prescription: {patient.prescription} | Treatment: {patient.completedTreatments}/{patient.totalTreatments}
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

  // Function to handle opening "Keine Folge-VO bestellen" modal
  const openKeineFolgeVoModal = (patient: Patient) => {
    setSelectedPatientForFolgeVo(patient);
    setKeineFolgeVoReason(''); // Reset reason when opening modal
    setIsKeineFolgeVoModalOpen(true);
  };

  // Function to handle closing "Keine Folge-VO bestellen" modal
  const closeKeineFolgeVoModal = () => {
    setSelectedPatientForFolgeVo(null);
    setIsKeineFolgeVoModalOpen(false);
    setKeineFolgeVoReason(''); // Clear reason when closing
  };

  // Function to handle confirming "Keine Folge-VO bestellen"
  const confirmKeineFolgeVo = () => {
    if (selectedPatientForFolgeVo) {
      const updatedPatients = patients.map(p =>
        p.id === selectedPatientForFolgeVo.id ? { 
          ...p, 
          fvoStatus: "Keine Folge-VO", // Set F.VO Status to "Keine Folge-VO"
          voDisplayStatus: "Aktiv", // Explicitly set VO Status to "Aktiv" to ensure it remains visible
          voRawCancellationReason: keineFolgeVoReason // Store reason
        } : p
      );
      setAllPatients(updatedPatients);

      // Add a log entry for this action
      addLogToPatient(
        selectedPatientForFolgeVo.id,
        'FolgeVO',
        'Keine Folge-VO bestellen',
        keineFolgeVoReason || undefined
      );
      
      const reasonText = keineFolgeVoReason ? ` Grund: ${keineFolgeVoReason}` : '';
      addToast(`${selectedPatientForFolgeVo.name}: Folgerezept-Bestellung storniert.${reasonText}`, 'info');
      closeKeineFolgeVoModal();
    }
  };

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
      setAllPatients((prevPatients: Patient[]) => 
        prevPatients.map((patient: Patient) => {
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

  // Function to handle opening "Abbrechen VO" modal
  const openAbbrechenVoModal = (patient: Patient) => {
    setSelectedPatientForAbbrechenVo(patient);
    setAbbrechenReason(''); // Reset reason
    setCustomAbbrechenReason(''); // Reset custom reason
    setIsAbbrechenVoModalOpen(true);
  };

  // Function to handle closing "Abbrechen VO" modal
  const closeAbbrechenVoModal = () => {
    setIsAbbrechenVoModalOpen(false);
    setSelectedPatientForAbbrechenVo(null);
    setAbbrechenReason('');
    setCustomAbbrechenReason('');
  };

  // Function to handle confirming "Abbrechen VO"
  const confirmAbbrechenVo = () => {
    if (selectedPatientForAbbrechenVo) {
      let fullReason = abbrechenReason;
      if (abbrechenReason === 'Sonstiges') {
        fullReason = `Sonstiges: ${customAbbrechenReason}`;
      }

      // Update patient details
      const updatedPatient = {
        ...selectedPatientForAbbrechenVo,
        voDisplayStatus: 'Abgebrochen',
        voCancellationReason: fullReason,
        voRawCancellationReason: abbrechenReason, // Store the raw selected reason
        fvoStatus: 'Keine Folge-VO', // Always set F.VO Status to 'Keine Folge-VO' as no new VO will be ordered
        status: "Inactive", // Set overall patient status to Inactive
        selected: false,
      };

      // Add the log entry to the updated patient
      const logId = nextLogId;
      const newLog: VOLog = {
        id: logId,
        type: 'Cancellation',
        timestamp: new Date().toISOString(),
        description: 'Verordnung Abbrechen',
        details: `${fullReason}`
      };
      
      // Include the log in the updated patient
      const patientWithLog = {
        ...updatedPatient,
        voLogs: updatedPatient.voLogs ? [...updatedPatient.voLogs, newLog] : [newLog]
      };
      
      // Increment the log ID for next time
      setNextLogId(prev => prev + 1);

      // Remove from active patients
      setAllPatients((prevPatients: Patient[]) => prevPatients.filter((p: Patient) => p.id !== selectedPatientForAbbrechenVo.id));
      
      // Add to inactive patients
      setInactivePatients(prevInactive => [patientWithLog, ...prevInactive].sort((a, b) => a.name.localeCompare(b.name)));
      
      addToast(`${selectedPatientForAbbrechenVo.name}: Verordnung wurde abgebrochen (${fullReason}). Patient zu Inaktive verschoben.`, 'info');
      closeAbbrechenVoModal();
      // Reset selection count as the patient is moved
      setSelectedPatientIds([]); 
    }
  };

  // Function to handle opening "Share VO" modal
  const openShareVOModal = () => {
    // Collect all selected patients from main list
    const selectedPatients = allPatients.filter(p => p.selected);
    setSelectedPatientsForTransfer(selectedPatients);
    setSelectedTherapist(''); // Reset selected therapist
    setIsShareVOModalOpen(true);
  };

  // Function to handle closing "Share VO" modal
  const closeShareVOModal = () => {
    setIsShareVOModalOpen(false);
    setSelectedPatientsForTransfer([]);
    setSelectedTherapist('');
    setIsTransferring(false);
    setTransferType(null);
    setSelectedShareTherapists([]);
    setShareAction('add');
  };

  // Function to handle opening "Transfer Patient" modal (separate from Share VO)
  const openTransferPatientModal = () => {
    // Collect all selected patients from main list
    const selectedPatients = allPatients.filter(p => p.selected);
    setSelectedPatientsForTransferPatient(selectedPatients);
    setSelectedTransferTherapist(''); // Reset selected therapist
    setIsTransferPatientModalOpen(true);
  };

  // Function to handle closing "Transfer Patient" modal
  const closeTransferPatientModal = () => {
    setIsTransferPatientModalOpen(false);
    setSelectedPatientsForTransferPatient([]);
    setSelectedTransferTherapist('');
    setIsTransferPatientInProgress(false);
    setTransferPatientType(null);
  };

  // Function to handle confirming patient transfer
  const confirmTransferPatient = async () => {
    // Validation checks
    if (selectedPatientsForTransferPatient.length === 0) {
      addToast('No patients selected for transfer.', 'error');
      return;
    }

    if (!selectedTransferTherapist) {
      addToast('Please select a therapist to transfer patients to.', 'error');
      return;
    }



    // Set loading state
    setIsTransferPatientInProgress(true);

    try {
      // Add slight delay to simulate real transfer process
      await new Promise(resolve => setTimeout(resolve, 500));
      // Track successful and failed transfers
      const successfulTransfers: Patient[] = [];
      const failedTransfers: Patient[] = [];
      const originalTherapists: string[] = [];

      // Update all selected patients' therapeut (for ownership transfer)
      const selectedPatientIds = selectedPatientsForTransferPatient.map(p => p.id);
      const updatedPatients = allPatients.map(p => {
        if (selectedPatientIds.includes(p.id)) {
          try {
            // Check if patient already has the target therapist
            if (p.primaryTherapist === selectedTransferTherapist) {
              console.warn(`Patient ${p.name} is already assigned to ${selectedTransferTherapist}`);
              failedTransfers.push(p);
              return p; // No change needed
            }
            
            // Store original therapist before update
            originalTherapists.push(p.primaryTherapist);
            
            // Successfully update patient - transfer ownership
            const updatedPatient = { 
              ...p, 
              therapeut: selectedTransferTherapist, // Update legacy field
              primaryTherapist: selectedTransferTherapist, // Update primary therapist (ownership)
              transferStatus: (transferPatientType === 'temporary' ? 'Temporary' : 'Permanent (Pending)') as 'Temporary' | 'Permanent (Pending)' | 'Permanent (Confirmed)' | '' // Set transfer status
            };
            
            successfulTransfers.push(updatedPatient);
            return updatedPatient;
          } catch (error) {
            console.error(`Failed to transfer patient ${p.name}:`, error);
            failedTransfers.push(p);
            return p; // Keep original data on error
          }
        }
        return p;
      });

      // Only update state if there were successful transfers
      if (successfulTransfers.length > 0) {
        setAllPatients(updatedPatients);

        // Deselect all successfully transferred patients from main list
        const successfulTransferIds = successfulTransfers.map(p => p.id);
        setAllPatients(prev => prev.map(p => 
          successfulTransferIds.includes(p.id) ? { ...p, selected: false } : p
        ));
      }

      // Generate appropriate success/error messages
      if (successfulTransfers.length > 0 && failedTransfers.length === 0) {
        // All transfers successful
        const transferTypeText = transferPatientType === 'temporary' ? 'temporarily' : 'permanently';
        addToast(
          `${successfulTransfers.length} patient${successfulTransfers.length > 1 ? 's' : ''} successfully ${transferTypeText} transferred to ${selectedTransferTherapist}.`, 
          'success'
        );
      } else if (successfulTransfers.length > 0 && failedTransfers.length > 0) {
        // Partial success
        addToast(
          `${successfulTransfers.length} patient${successfulTransfers.length > 1 ? 's' : ''} transferred successfully. ${failedTransfers.length} transfer${failedTransfers.length > 1 ? 's' : ''} failed.`, 
          'info'
        );
      } else {
        // All transfers failed
        addToast(
          `Transfer failed for all ${failedTransfers.length} patient${failedTransfers.length > 1 ? 's' : ''}. Please try again.`, 
          'error'
        );
      }

      // Close the modal regardless of outcome
      closeTransferPatientModal();

    } catch (error) {
      console.error('Critical error during patient transfer:', error);
      addToast('A critical error occurred during the transfer process. Please try again.', 'error');
      // Don't close modal on critical error to allow retry
    } finally {
      // Always reset loading state
      setIsTransferPatientInProgress(false);
    }
  };

  // Helper function to convert Patient to VOTransferPatient for admin dashboard
  const convertPatientToVOTransfer = (patient: Patient, originalTherapist: string): any => {
    return {
      id: patient.id,
      name: patient.name,
      geburtsdatum: '01.01.1970', // Default birthday since we don't have this data
      heilmittel: patient.prescription || 'Physiotherapie',
      einrichtung: patient.facility,
      therapeut: patient.therapeut,
      originalTherapist: originalTherapist,
      voNr: `VO-2024-${patient.id.toString().padStart(3, '0')}`,
      ausstDatum: new Date().toLocaleDateString('de-DE'),
      behStatus: `${patient.completedTreatments}/${patient.totalTreatments}`,
      arzt: patient.doctor,
      fvoStatus: patient.fvoStatus || 'Aktiv',
      transferStatus: patient.transferStatus,
      selected: false
    };
  };

  // Helper function to save transfers to localStorage
  const saveTransfersToLocalStorage = (transferredPatients: Patient[], originalTherapists: string[]) => {
    try {
      // Load existing transfers from localStorage
      const existingTransfers = JSON.parse(localStorage.getItem('voTransfers') || '[]');
      
      // Convert transferred patients to VOTransferPatient format
      const newTransfers = transferredPatients.map((patient, index) => 
        convertPatientToVOTransfer(patient, originalTherapists[index])
      );
      
      // Create a map of existing transfers for easier lookup
      const existingTransfersMap = new Map<number, any>();
      existingTransfers.forEach((transfer: any) => {
        existingTransfersMap.set(transfer.id, transfer);
      });
      
      // Update or add new transfers
      newTransfers.forEach(newTransfer => {
        existingTransfersMap.set(newTransfer.id, newTransfer);
      });
      
      // Convert back to array
      const allTransfers = Array.from(existingTransfersMap.values());
      
      // Save back to localStorage
      localStorage.setItem('voTransfers', JSON.stringify(allTransfers));
      console.log('=== Transfer Save Debug ===');
      console.log('Existing transfers before update:', existingTransfers);
      console.log('New transfers being added/updated:', newTransfers);
      console.log('Final transfers saved to localStorage:', allTransfers);
      console.log('=== End Debug ===');
    } catch (error) {
      console.error('Error saving transfers to localStorage:', error);
    }
  };

  // Function to handle confirming VO sharing
  const confirmShare = async () => {
    // Validation checks
    if (selectedPatientsForTransfer.length === 0) {
      addToast('No VOs selected for sharing.', 'error');
      return;
    }

    if (selectedShareTherapists.length === 0) {
      addToast('Please select at least one therapist.', 'error');
      return;
    }

    // Set loading state
    setIsTransferring(true);

    try {
      // Add slight delay to simulate real process
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update all selected patients' shared therapists
      const selectedPatientIds = selectedPatientsForTransfer.map(p => p.id);
      const updatedPatients = allPatients.map(p => {
        if (selectedPatientIds.includes(p.id)) {
          let updatedSharedTherapists = [...p.sharedTherapists];
          
          if (shareAction === 'add') {
            // Add selected therapists to shared list (avoid duplicates and primary conflicts)
            selectedShareTherapists.forEach(therapist => {
              if (!updatedSharedTherapists.includes(therapist) && therapist !== p.primaryTherapist) {
                updatedSharedTherapists.push(therapist);
              }
            });
          } else {
            // Remove selected therapists from shared list
            updatedSharedTherapists = updatedSharedTherapists.filter(
              therapist => !selectedShareTherapists.includes(therapist)
            );
          }
          
          return { 
            ...p, 
            sharedTherapists: updatedSharedTherapists
          };
        }
        return p;
      });

      // Update the state
      setAllPatients(updatedPatients);

      // Show success message
      const actionText = shareAction === 'add' ? 'shared with' : 'removed from';
      const therapistText = selectedShareTherapists.length > 1 ? 
        `${selectedShareTherapists.length} therapists` : 
        selectedShareTherapists[0];
      
      addToast(
        `Successfully ${actionText} ${therapistText} for ${selectedPatientsForTransfer.length} VO${selectedPatientsForTransfer.length > 1 ? 's' : ''}.`, 
        'success'
      );

      // Close modal and reset state
      closeShareVOModal();
      
    } catch (error) {
      console.error('Critical error during VO sharing:', error);
      addToast('An error occurred while updating shares. Please try again.', 'error');
    } finally {
      setIsTransferring(false);
    }
  };

  const confirmTransfer = async () => {
    // Validation checks
    if (selectedPatientsForTransfer.length === 0) {
      addToast('No patients selected for transfer.', 'error');
      return;
    }

    if (!selectedTherapist) {
      addToast('Please select a therapist to share VOs with.', 'error');
      return;
    }



    // Set loading state
    setIsTransferring(true);

    try {
      // Add slight delay to simulate real transfer process
      await new Promise(resolve => setTimeout(resolve, 500));
      // Track successful and failed transfers
      const successfulTransfers: Patient[] = [];
      const failedTransfers: Patient[] = [];
      const originalTherapists: string[] = [];

      // Update all selected patients' therapeut
      const selectedPatientIds = selectedPatientsForTransfer.map(p => p.id);
      const updatedPatients = allPatients.map(p => {
        if (selectedPatientIds.includes(p.id)) {
          try {
            // Check if patient already has the target therapist
            if (p.therapeut === selectedTherapist) {
              console.warn(`Patient ${p.name} is already assigned to ${selectedTherapist}`);
              failedTransfers.push(p);
              return p; // No change needed
            }
            
            // Store original therapist before update
            originalTherapists.push(p.therapeut);
            
            // Successfully update patient
            const updatedPatient = { 
              ...p, 
              therapeut: selectedTherapist, // Update to the new therapist
              transferStatus: (transferType === 'temporary' ? 'Temporary' : 'Permanent (Pending)') as 'Temporary' | 'Permanent (Pending)' | 'Permanent (Confirmed)' | '' // Set transfer status
            };
            
            successfulTransfers.push(updatedPatient);
            return updatedPatient;
          } catch (error) {
            console.error(`Failed to share VO for patient ${p.name}:`, error);
            failedTransfers.push(p);
            return p; // Keep original data on error
          }
        }
        return p;
      });

      // Only update state if there were successful transfers
      if (successfulTransfers.length > 0) {
        setAllPatients(updatedPatients);
        
        // Save transfers to localStorage for admin dashboard
        saveTransfersToLocalStorage(successfulTransfers, originalTherapists);

        // Add log entries for successful transfers only
        successfulTransfers.forEach(patient => {
          const previousTherapist = patient.therapeut;
          try {
            addLogToPatient(
              patient.id,
              'StatusChange', // Using StatusChange type for the transfer
              'VO Sharing',
              `Transferred from ${previousTherapist} to ${selectedTherapist}`
            );
          } catch (error) {
            console.error(`Failed to log transfer for patient ${patient.name}:`, error);
          }
        });

        // Deselect all successfully transferred patients from main list
        const successfulTransferIds = successfulTransfers.map(p => p.id);
        setAllPatients(prev => prev.map(p => 
          successfulTransferIds.includes(p.id) ? { ...p, selected: false } : p
        ));
      }

      // Generate appropriate success/error messages
      if (successfulTransfers.length > 0 && failedTransfers.length === 0) {
        // All transfers successful
        const transferTypeText = transferType === 'temporary' ? 'temporarily' : 'permanently';
        addToast(
          `${successfulTransfers.length} patient${successfulTransfers.length > 1 ? 's' : ''} successfully ${transferTypeText} transferred to ${selectedTherapist}.`, 
          'success'
        );
      } else if (successfulTransfers.length > 0 && failedTransfers.length > 0) {
        // Partial success
        addToast(
          `${successfulTransfers.length} patient${successfulTransfers.length > 1 ? 's' : ''} transferred successfully. ${failedTransfers.length} transfer${failedTransfers.length > 1 ? 's' : ''} failed.`, 
          'info'
        );
      } else {
        // All transfers failed
        addToast(
          `Transfer failed for all ${failedTransfers.length} patient${failedTransfers.length > 1 ? 's' : ''}. Please try again.`, 
          'error'
        );
      }

      // Close the modal regardless of outcome
      closeShareVOModal();

    } catch (error) {
      console.error('Critical error during VO sharing:', error);
      addToast('A critical error occurred during the transfer process. Please try again.', 'error');
      // Don't close modal on critical error to allow retry
    } finally {
      // Always reset loading state
      setIsTransferring(false);
    }
  };

  return (
    <WireframeLayout title="VO Sharing" username="User Therapist" userInitials="UT" showSidebar={false}>
      <div className="max-w-full mx-auto bg-[#f8f9fa] rounded-lg shadow p-4">
        {/* Therapist Filter Dropdown - only show for active and inactive patients tabs */}
        {(activeTab === 'open-prescriptions' || activeTab === 'inactive-patients') && (
          <div className="mb-4 flex justify-end">
            <div className="flex items-center space-x-2">
              <label htmlFor="therapist-filter" className="text-sm font-medium text-gray-700">
                Therapist:
              </label>
              <div className="relative" id="therapist-dropdown">
                <div className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={handleInputChange}
                    onFocus={handleInputFocus}
                    placeholder="Search therapists..."
                    className="border border-gray-300 rounded-md px-3 py-2 pr-8 text-sm bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[150px] w-full"
                  />
                  <svg
                    className={`absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 transition-transform pointer-events-none ${isDropdownOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                
                {isDropdownOpen && (
                  <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg z-50">
                    <div className="max-h-48 overflow-y-auto">
                      {filteredTherapists.length > 0 ? (
                        // Show filtered results
                        filteredTherapists.map((therapist) => (
                          <div
                            key={therapist}
                            onClick={() => handleTherapistSelect(therapist)}
                            className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 ${
                              selectedTherapistFilter === therapist ? 'bg-blue-50 text-blue-600' : ''
                            }`}
                          >
                            {therapist}
                          </div>
                        ))
                      ) : (
                        // Show "no results" when search has no matches
                        <div className="px-3 py-2 text-sm text-gray-500">
                          No therapists found
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="mb-4 border-b">
          <div className="flex">
            <button
              className={`py-3 px-4 font-medium ${
                activeTab === 'open-prescriptions'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('open-prescriptions')}
            >
              Open Prescriptions
            </button>
            <button
              className={`py-3 px-4 font-medium ${
                activeTab === 'shared-prescriptions'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('shared-prescriptions')}
            >
              Shared Prescriptions
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
        <div className="mb-4 flex justify-between items-center">
          <h1 className="text-2xl font-semibold">
            {activeTab === 'open-prescriptions' ? 'Open Prescriptions' : activeTab === 'shared-prescriptions' ? 'Shared Prescriptions' : activeTab === 'inactive-patients' ? 'Closed Prescriptions' : 'Calendar'}
          </h1>
        </div>
        
        {/* Patient List View - Conditional rendering based on activeTab */}
        {(activeTab === 'open-prescriptions' || activeTab === 'inactive-patients') && (
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
                {activeTab === 'open-prescriptions' && selectedPatientCount >= 1 && (
                  <WireframeButton variant="primary" onClick={toggleModal}>
                    Document Treatment
                  </WireframeButton>
                )}
              </div>
              {/* New Buttons: Keine Folge-VO bestellen and Abbrechen */}
              {activeTab === 'open-prescriptions' && selectedPatientCount >= 1 && (
                <div className="flex items-center space-x-3">
                  <button
                    className="px-4 py-2 border border-orange-500 text-orange-500 bg-white hover:bg-orange-50 rounded-md text-sm font-medium"
                  >
                    Keine Folge-VO bestellen
                  </button>
                  <button
                    className="px-4 py-2 border border-red-600 bg-red-600 text-white hover:bg-red-700 rounded-md text-sm font-medium"
                  >
                    Abbrechen VO
                  </button>
                  <button
                    className="px-4 py-2 border border-green-600 bg-green-600 text-white hover:bg-green-700 rounded-md text-sm font-medium"
                    onClick={() => {
                        openShareVOModal();
                    }}
                  >
                    Share VO
                  </button>
                  <button
                    className="px-4 py-2 border border-blue-600 bg-blue-600 text-white hover:bg-blue-700 rounded-md text-sm font-medium"
                    onClick={() => {
                        openTransferPatientModal();
                    }}
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
              <div className="col-span-1">Last Treatment (Date)</div>
              <div className="col-span-1">Treatments WTD</div>
              <div className="col-span-1">Primary Therapeut</div>
              <div className="col-span-1">Shared Therapeut</div>
              <div className="col-span-1">VO Nr.</div>
              <div className="col-span-1">VO Status</div> {/* New Column Header */}
              <div className="col-span-1">Status VO (#/#)</div>
              <div className="col-span-1">Doctor</div>
              <div className="col-span-1">Transfer Status</div> {/* New Transfer Status Column - moved to last */}
            </div>

            {/* Table Rows for Open Prescriptions */}
            {activeTab === 'open-prescriptions' && patients.map((patient) => (
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
                  <span className={patient.treated ? 'font-bold' : ''}>
                    {patient.lastTreatment}
                  </span>
                </div>
                <div className="col-span-1">{patient.frequencyWTD}</div>
                <div className="col-span-1 flex flex-col">
                  <span>{patient.primaryTherapist}</span>
                </div>
                <div className="col-span-1 flex flex-col">
                  <span>{patient.sharedTherapists.length > 0 ? patient.sharedTherapists.join(', ') : '-'}</span>
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
                  ) : (patient.voDisplayStatus === 'Aktiv' || !patient.voDisplayStatus) ? (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 border border-green-300">
                      Aktiv
                    </span>
                  ) : null}
                </div>
                <div className="col-span-1">
                  <span className={`font-medium ${patient.completedTreatments === patient.totalTreatments ? 'text-green-600' : 'text-blue-600'}`}>
                    {patient.completedTreatments}/{patient.totalTreatments}
                  </span>
                </div>
                <div className="col-span-1">{patient.doctor}</div>
                <div className="col-span-1">
                  {/* Transfer Status Column - moved to last */}
                  {patient.transferStatus ? (
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      patient.transferStatus === 'Temporary' 
                        ? 'bg-orange-100 text-orange-800 border border-orange-300'
                        : patient.transferStatus === 'Permanent (Pending)'
                        ? 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                        : patient.transferStatus === 'Permanent (Confirmed)'
                        ? 'bg-green-100 text-green-800 border border-green-300'
                        : ''
                    }`}>
                      {patient.transferStatus}
                    </span>
                  ) : (
                    <span className="text-gray-400 text-xs">-</span>
                  )}
                </div>
              </div>
            ))}

            {/* Table Rows for Inactive Patients */}
            {activeTab === 'inactive-patients' && inactivePatients.map((patient) => (
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
                  <span className={patient.treated ? 'font-bold' : ''}>
                    {patient.lastTreatment}
                  </span>
                </div>
                <div className="col-span-1">{patient.frequencyWTD}</div>
                <div className="col-span-1 flex flex-col">
                  <span>{patient.primaryTherapist}</span>
                </div>
                <div className="col-span-1 flex flex-col">
                  <span>{patient.sharedTherapists.length > 0 ? patient.sharedTherapists.join(', ') : '-'}</span>
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
                  ) : patient.voDisplayStatus !== 'Abgebrochen' ? (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 border border-blue-300">
                      Abgerechnet
                    </span>
                  ) : null}
                </div>
                <div className="col-span-1">
                  <span className={`font-medium ${patient.completedTreatments === patient.totalTreatments ? 'text-green-600' : 'text-blue-600'}`}>
                    {patient.completedTreatments}/{patient.totalTreatments}
                  </span>
                </div>
                <div className="col-span-1">{patient.doctor}</div>
                <div className="col-span-1">
                  {/* Transfer Status Column - moved to last */}
                  {patient.transferStatus ? (
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      patient.transferStatus === 'Temporary' 
                        ? 'bg-orange-100 text-orange-800 border border-orange-300'
                        : patient.transferStatus === 'Permanent (Pending)'
                        ? 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                        : patient.transferStatus === 'Permanent (Confirmed)'
                        ? 'bg-green-100 text-green-800 border border-green-300'
                        : ''
                    }`}>
                      {patient.transferStatus}
                    </span>
                  ) : (
                    <span className="text-gray-400 text-xs">-</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Shared Prescriptions View */}
        {activeTab === 'shared-prescriptions' && (
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
                {/* Document Treatment button - available for shared prescriptions */}
                {selectedPatientCount >= 1 && (
                  <WireframeButton variant="primary" onClick={toggleModal}>
                    Document Treatment
                  </WireframeButton>
                )}
              </div>
              {/* No Share VO or Transfer Patient buttons in shared prescriptions */}
            </div>

            {/* Table Headers */}
            <div className="grid grid-cols-12 gap-4 py-3 px-4 bg-gray-100 text-gray-700 font-medium text-sm">
              <div className="col-span-1"></div>
              <div className="col-span-1">Name Patient</div>
              <div className="col-span-1">Facility</div>
              <div className="col-span-1">Last Treatment (Date)</div>
              <div className="col-span-1">Treatments WTD</div>
              <div className="col-span-1">Primary Therapeut</div>
              <div className="col-span-1">Shared Therapeut</div>
              <div className="col-span-1">VO Nr.</div>
              <div className="col-span-1">VO Status</div>
              <div className="col-span-1">Status VO (#/#)</div>
              <div className="col-span-1">Doctor</div>
              <div className="col-span-1">Transfer Status</div>
            </div>

            {/* Table Rows for Shared Prescriptions */}
            {patients.map((patient) => (
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
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>
                <div className="col-span-1 font-medium">
                  <span className="text-blue-600 hover:text-blue-800 cursor-pointer" onClick={() => handlePatientClick(patient)}>
                    {patient.name}
                  </span>
                </div>
                <div className="col-span-1">{patient.facility}</div>
                <div className="col-span-1 flex flex-col">
                  <span>
                    {patient.lastTreatment}
                  </span>
                </div>
                <div className="col-span-1">{patient.frequencyWTD}</div>
                <div className="col-span-1 flex flex-col">
                  <span>{patient.primaryTherapist}</span>
                </div>
                <div className="col-span-1 flex flex-col">
                  <span>{patient.sharedTherapists.length > 0 ? patient.sharedTherapists.join(', ') : '-'}</span>
                </div>
                <div className="col-span-1">
                  {patient.prescription}
                </div>
                <div className="col-span-1">
                  {/* VO Status Column */}
                  {(patient.voDisplayStatus === 'Abgebrochen') ? (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 border border-red-300">
                      Abgebrochen
                    </span>
                  ) : (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 border border-green-300">
                      {patient.voDisplayStatus || 'Aktiv'}
                    </span>
                  )}
                </div>
                <div className="col-span-1">
                  <span className="text-sm">
                    {patient.completedTreatments}/{patient.totalTreatments}
                  </span>
                </div>
                <div className="col-span-1">{patient.doctor}</div>
                <div className="col-span-1">
                  {patient.transferStatus && (
                    <span className={`px-2 py-1 text-xs font-medium rounded ${
                      patient.transferStatus === 'Temporary' ? 'bg-yellow-100 text-yellow-800' :
                      patient.transferStatus === 'Permanent (Pending)' ? 'bg-orange-100 text-orange-800' :
                      patient.transferStatus === 'Permanent (Confirmed)' ? 'bg-green-100 text-green-800' :
                      ''
                    }`}>
                      {patient.transferStatus}
                    </span>
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
              setTreatments={setAllPatients}
              setDayActivities={setDayActivities}
              onEditItem={handleEditItem}
              onDocumentTreatment={openPatientSelectModal} 
            />
          </div>
        )}
        
        {/* View Admin Dashboard Button - Fixed position at bottom right */}
        <div className="fixed bottom-6 right-6 z-40">
          <button 
            onClick={() => window.open('/wireframes/drafts/admin-vo-transfers', '_blank')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-lg"
          >
            View Admin Dashboard
          </button>
        </div>
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
                <div className="grid grid-cols-9 gap-4 py-3 px-4 bg-gray-50 text-sm font-medium text-gray-600">
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
                          className={`grid grid-cols-9 gap-4 py-3 px-4 text-sm ${
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
                                {displayNotes && <div>{displayNotes}</div>}
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
                              displayNotes
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="grid grid-cols-9 gap-4 py-3 px-4 text-sm">
                      <div className="col-span-1">1</div>
                      <div className="col-span-3">{viewingPatient.lastTreatment}</div>
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
                          Prescription: {patient.prescription} | Treatment: {patient.completedTreatments}/{patient.totalTreatments}
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

      {/* "Keine Folge-VO bestellen" Confirmation Modal */}
      {isKeineFolgeVoModalOpen && selectedPatientForFolgeVo && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-auto">
            {/* Modal Header */}
            <div className="py-4 px-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">Keine Folge-VO bestellen Bestätigen</h2>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <div className="bg-gray-50 p-4 rounded-md mb-4">
                <div className="mb-2">
                  <span className="text-sm font-medium text-gray-700">Patient:</span>
                  <p className="text-sm text-gray-900">{selectedPatientForFolgeVo.name}</p>
                </div>
                <div className="mb-2">
                  <span className="text-sm font-medium text-gray-700">VO#:</span>
                  <p className="text-sm text-gray-900">{selectedPatientForFolgeVo.prescription}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Arzt:</span>
                  <p className="text-sm text-gray-900">{selectedPatientForFolgeVo.doctor}</p>
                </div>
              </div>
              
              {/* New Reason Input Field */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Keine Folge-VO Reason:
                </label>
                <AutoResizeTextarea
                  value={keineFolgeVoReason}
                  onChange={(e) => setKeineFolgeVoReason(e.target.value)}
                  placeholder="Enter reason for no follow-up prescription..."
                  className="w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                />
              </div>
              
              <p className="text-sm text-gray-600 mb-2">
                Automatic renewal for this prescription will be cancelled and no follow-up prescription will be ordered.
              </p>
              <p className="text-sm text-gray-600">
                The current prescription will remain active until completion.
              </p>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 p-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
              <button 
                onClick={() => {
                  setIsKeineFolgeVoModalOpen(false);
                  setSelectedPatientForFolgeVo(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  confirmKeineFolgeVo();
                  setIsKeineFolgeVoModalOpen(false);
                  setSelectedPatientForFolgeVo(null);
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* "Abbrechen VO" Confirmation Modal - THIS IS THE NEW MODAL JSX */}
      {isAbbrechenVoModalOpen && selectedPatientForAbbrechenVo && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-auto flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="py-4 px-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">Verordnung Abbrechen</h2>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto">
              <div className="bg-gray-50 p-4 rounded-md mb-6 border border-gray-200">
                <div className="mb-2">
                  <span className="text-sm font-medium text-gray-700">Patient:</span>
                  <p className="text-base text-gray-900 font-semibold">{selectedPatientForAbbrechenVo.name}</p>
                </div>
                <div className="mb-2">
                  <span className="text-sm font-medium text-gray-700">Einrichtung:</span>
                  <p className="text-sm text-gray-900">{selectedPatientForAbbrechenVo.facility}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Aktuelle VO #:</span>
                  <p className="text-sm text-gray-900">{selectedPatientForAbbrechenVo.prescription}</p>
                </div>
                 <div>
                  <span className="text-sm font-medium text-gray-700">Arzt:</span>
                  <p className="text-sm text-gray-900">{selectedPatientForAbbrechenVo.doctor}</p>
                </div>
              </div>
              
              <div className="space-y-3 mb-4">
                <p className="font-medium text-gray-700">Reason for Termination:</p>
                {[
                  "Patient declined further treatment",
                  "Patient no longer at facility",
                  "Treatment goals achieved",
                  "Patient deceased",
                  "Other"
                ].map(reason => {
                  // Original German reasons for logic, English for display
                  const germanReasonMap: { [key: string]: string } = {
                    "Patient declined further treatment": "Patient hat weitere Behandlung abgelehnt",
                    "Patient no longer at facility": "Patient nicht mehr in Einrichtung",
                    "Treatment goals achieved": "Behandlungsziele erreicht",
                    "Patient deceased": "Patient verstorben",
                    "Other": "Sonstiges"
                  };
                  const valueForRadio = germanReasonMap[reason] || reason; // Fallback to English if somehow not mapped

                  return (
                    <label key={reason} className="flex items-center space-x-2 cursor-pointer p-2 hover:bg-gray-50 rounded-md">
                      <input
                        type="radio"
                        name="abbrechenReason"
                        value={valueForRadio} // Use original German value for state
                        checked={abbrechenReason === valueForRadio}
                        onChange={(e) => setAbbrechenReason(e.target.value)}
                        className="form-radio h-4 w-4 text-blue-600 transition duration-150 ease-in-out focus:ring-blue-500 border-gray-300"
                      />
                      <span className="text-gray-700 text-sm">{reason}</span> {/* Display English reason */}
                    </label>
                  );
                })}
                {abbrechenReason === "Sonstiges" && (
                  <div className="pl-6 pt-2">
                    <AutoResizeTextarea
                      value={customAbbrechenReason}
                      onChange={(e) => setCustomAbbrechenReason(e.target.value)}
                      placeholder="Please specify other reason..." // Translated placeholder
                      className="mt-1 border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 rounded-md shadow-sm w-full text-sm min-h-[60px]"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 p-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
              <WireframeButton variant="secondary" onClick={closeAbbrechenVoModal}>Close</WireframeButton> {/* Translated button text */}
              <WireframeButton 
                variant="primary" 
                onClick={confirmAbbrechenVo}
                disabled={!abbrechenReason || (abbrechenReason === 'Sonstiges' && !customAbbrechenReason.trim())}
                className="bg-red-600 hover:bg-red-700 focus:ring-red-500 text-white"
              >
                Cancel Prescription & Move Patient to Inactive {/* Translated button text */}
              </WireframeButton>
            </div>
          </div>
        </div>
      )}

      {/* Prescription Logs Modal */}
      {isLogsModalOpen && patientForLogs && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-auto flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="py-4 px-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">Prescription Logs - {patientForLogs.name}</h2>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto">
              {patientForLogs.voLogs && patientForLogs.voLogs.length > 0 ? (
                <div className="space-y-4">
                  {patientForLogs.voLogs.map((log, index) => {
                    // Format timestamp for display
                    const logDate = new Date(log.timestamp);
                    const formattedDate = logDate.toLocaleString('en-US', {
                      month: 'numeric',
                      day: 'numeric',
                      year: 'numeric',
                      hour: 'numeric',
                      minute: 'numeric',
                      second: 'numeric',
                      hour12: true
                    });

                    return (
                      <div key={log.id} className="bg-gray-50 rounded-lg p-4 shadow-sm">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium">
                              {log.type === 'StatusChange' && 'Statusänderung'}
                              {log.type === 'FolgeVO' && 'Keine Folge-VO'}
                              {log.type === 'Cancellation' && 'Verordnung Abbrechen'}
                            </div>
                            <div className="mt-1 text-gray-700">{log.description}</div>
                            {log.details && (
                              <div className="mt-1 text-gray-600 text-sm">{log.details}</div>
                            )}
                          </div>
                          <div className="text-gray-500 text-sm">{formattedDate}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No logs available for this patient.
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end p-4 border-t border-gray-200">
              <button 
                onClick={() => toggleLogsModal(null)}
                className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share VO Modal */}
      {isShareVOModalOpen && selectedPatientsForTransfer.length > 0 && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-auto max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="py-4 px-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">
                Share VO{selectedPatientsForTransfer.length > 1 ? 's' : ''} ({selectedPatientsForTransfer.length})
              </h2>
            </div>

            {/* Modal Body */}
            <div className="p-6 flex-1 overflow-y-auto">
              {/* Action Selection */}
              <div className="mb-6">
                <label className="block text-lg font-medium text-gray-900 mb-3">
                  Share Action
                </label>
                <select
                  value={shareAction}
                  onChange={(e) => {
                    setShareAction(e.target.value as 'add' | 'remove');
                    setSelectedShareTherapists([]); // Reset selection when action changes
                  }}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full max-w-xs"
                >
                  <option value="add">Add Share</option>
                  <option value="remove">Remove Share</option>
                </select>
              </div>

              {/* Patient Table */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Selected VOs</h3>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  {/* Table Header */}
                  <div className="grid grid-cols-6 gap-4 py-3 px-4 bg-gray-100 text-gray-700 font-medium text-sm">
                    <div className="col-span-1">Patient Name</div>
                    <div className="col-span-1">Facility</div>
                    <div className="col-span-1">VO Nr.</div>
                    <div className="col-span-1">Doctor</div>
                    <div className="col-span-1">Primary Therapist</div>
                    <div className="col-span-1">Currently Shared With</div>
                  </div>
                  
                  {/* Table Rows */}
                  {selectedPatientsForTransfer.map((patient, index) => (
                    <div 
                      key={patient.id} 
                      className={`grid grid-cols-6 gap-4 py-3 px-4 border-t border-gray-200 items-center ${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                      }`}
                    >
                      <div className="col-span-1 font-medium text-gray-900">{patient.name}</div>
                      <div className="col-span-1 text-gray-700">{patient.facility}</div>
                      <div className="col-span-1 text-gray-700">{patient.prescription}</div>
                      <div className="col-span-1 text-gray-700">{patient.doctor}</div>
                      <div className="col-span-1">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                          {patient.primaryTherapist}
                        </span>
                      </div>
                      <div className="col-span-1">
                        {patient.sharedTherapists && patient.sharedTherapists.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {patient.sharedTherapists.map((therapist, idx) => (
                              <span key={idx} className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                                {therapist}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">None</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Therapist Selection */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3">
                  {shareAction === 'add' ? 'Select Therapists to Add Share' : 'Select Therapists to Remove Share'}
                </h3>
                <div className="relative share-dropdown-container">
                  {/* Multi-select button */}
                  <button
                    type="button"
                    onClick={() => setIsShareDropdownOpen(!isShareDropdownOpen)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-left flex justify-between items-center"
                  >
                    <span className="text-gray-700">
                      {selectedShareTherapists.length === 0 
                        ? 'Select therapists...' 
                        : `${selectedShareTherapists.length} therapist${selectedShareTherapists.length > 1 ? 's' : ''} selected`
                      }
                    </span>
                    <svg
                      className={`w-5 h-5 text-gray-400 transition-transform ${isShareDropdownOpen ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Dropdown menu */}
                  {isShareDropdownOpen && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {(() => {
                        // Get available therapists based on action
                        const availableTherapists = shareAction === 'add' 
                          ? therapists.filter(therapist => 
                              therapist !== currentUser && // Exclude current user
                              !selectedPatientsForTransfer.every(patient => 
                                patient.primaryTherapist === therapist || 
                                patient.sharedTherapists?.includes(therapist)
                              )
                            )
                          : therapists.filter(therapist => 
                              selectedPatientsForTransfer.some(patient => 
                                patient.sharedTherapists?.includes(therapist)
                              )
                            );

                        return availableTherapists.length > 0 ? (
                          availableTherapists.map((therapist) => (
                            <div
                              key={therapist}
                              onClick={() => {
                                if (selectedShareTherapists.includes(therapist)) {
                                  setSelectedShareTherapists(selectedShareTherapists.filter(t => t !== therapist));
                                } else {
                                  setSelectedShareTherapists([...selectedShareTherapists, therapist]);
                                }
                              }}
                              className="px-3 py-2 hover:bg-gray-100 cursor-pointer flex items-center space-x-2"
                            >
                              <input
                                type="checkbox"
                                checked={selectedShareTherapists.includes(therapist)}
                                onChange={() => {}} // Handled by parent div onClick
                                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                              />
                              <span className="text-sm">
                                {therapist}
                                {shareAction === 'remove' && 
                                  <span className="text-gray-500 text-xs ml-1">
                                    (Shared on {selectedPatientsForTransfer.filter(p => p.sharedTherapists?.includes(therapist)).length} VOs)
                                  </span>
                                }
                              </span>
                            </div>
                          ))
                        ) : (
                          <div className="px-3 py-2 text-sm text-gray-500">
                            {shareAction === 'add' 
                              ? 'No available therapists to add shares for selected VOs'
                              : 'No shared therapists to remove from selected VOs'
                            }
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              </div>

              {/* Selection Summary */}
              {selectedShareTherapists.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-md font-medium text-gray-900 mb-2">Selected Therapists</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedShareTherapists.map((therapist) => (
                      <span 
                        key={therapist}
                        className="px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800 flex items-center gap-2"
                      >
                        {therapist}
                        <button
                          onClick={() => setSelectedShareTherapists(selectedShareTherapists.filter(t => t !== therapist))}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Summary Info Box */}
              <div className={`border rounded-md p-4 ${
                shareAction === 'add' ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'
              }`}>
                <div className="flex items-start">
                  <svg className={`w-5 h-5 mt-0.5 mr-3 ${
                    shareAction === 'add' ? 'text-green-400' : 'text-orange-400'
                  }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className={`text-sm font-medium ${
                      shareAction === 'add' ? 'text-green-800' : 'text-orange-800'
                    }`}>
                      {shareAction === 'add' ? 'Add Share Summary' : 'Remove Share Summary'}
                    </p>
                    <p className={`text-sm mt-1 ${
                      shareAction === 'add' ? 'text-green-700' : 'text-orange-700'
                    }`}>
                      {shareAction === 'add' 
                        ? `Selected therapists will gain shared access to ${selectedPatientsForTransfer.length} VO${selectedPatientsForTransfer.length > 1 ? 's' : ''}. They will be able to view and treat these patients.`
                        : `Selected therapists will lose shared access to ${selectedPatientsForTransfer.length} VO${selectedPatientsForTransfer.length > 1 ? 's' : ''}. They will no longer be able to view or treat these patients.`
                      }
                      {selectedShareTherapists.length > 0 && (
                        <span className="block mt-1 font-medium">
                          {selectedShareTherapists.length} therapist{selectedShareTherapists.length > 1 ? 's' : ''} selected.
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 p-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
              <button 
                onClick={closeShareVOModal}
                disabled={isTransferring}
                className={`px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md text-sm font-medium ${
                  isTransferring 
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                }`}
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  // Handle share action
                  if (selectedShareTherapists.length === 0) return;
                  
                  setIsTransferring(true);
                  
                  // Simulate API call
                  setTimeout(() => {
                    // Update patients with new share data
                    const updatedPatients = allPatients.map(patient => {
                      if (selectedPatientsForTransfer.some(p => p.id === patient.id)) {
                        const currentSharedTherapists = patient.sharedTherapists || [];
                        let newSharedTherapists;
                        
                        if (shareAction === 'add') {
                          // Add new therapists to shared list
                          newSharedTherapists = [...new Set([...currentSharedTherapists, ...selectedShareTherapists])];
                        } else {
                          // Remove therapists from shared list
                          newSharedTherapists = currentSharedTherapists.filter(t => !selectedShareTherapists.includes(t));
                        }
                        
                        return {
                          ...patient,
                          sharedTherapists: newSharedTherapists
                        };
                      }
                      return patient;
                    });
                    
                    setAllPatients(updatedPatients);
                    setIsTransferring(false);
                    
                    // Show success toast
                    const actionText = shareAction === 'add' ? 'added to' : 'removed from';
                    const toastMessage = `Share access ${actionText} ${selectedPatientsForTransfer.length} VO${selectedPatientsForTransfer.length > 1 ? 's' : ''} for ${selectedShareTherapists.length} therapist${selectedShareTherapists.length > 1 ? 's' : ''}`;
                    
                    setToasts(prev => [...prev, {
                      id: nextToastId,
                      message: toastMessage,
                      type: 'success'
                    }]);
                    setNextToastId(prev => prev + 1);
                    
                    // Close modal and reset state
                    closeShareVOModal();
                  }, 1500);
                }}
                disabled={selectedShareTherapists.length === 0 || isTransferring}
                className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 ${
                  selectedShareTherapists.length > 0 && !isTransferring
                    ? `${shareAction === 'add' ? 'bg-green-600 hover:bg-green-700' : 'bg-orange-600 hover:bg-orange-700'} text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500` 
                    : 'bg-gray-300 text-white cursor-not-allowed'
                }`}
              >
                {isTransferring && (
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {isTransferring 
                  ? `${shareAction === 'add' ? 'Adding' : 'Removing'} Share...` 
                  : `Confirm ${shareAction === 'add' ? 'Add' : 'Remove'} Share`
                }
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transfer Patient Modal */}
      {isTransferPatientModalOpen && selectedPatientsForTransferPatient.length > 0 && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-auto max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="py-4 px-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">
                Transfer Patient{selectedPatientsForTransferPatient.length > 1 ? 's' : ''} ({selectedPatientsForTransferPatient.length})
              </h2>
            </div>

            {/* Modal Body */}
            <div className="p-6 flex-1 overflow-y-auto">
              {/* Transfer Type Selection */}
              <div className="mb-6">
                <label className="block text-lg font-medium text-gray-900 mb-3">
                  Permanent Transfer
                </label>
                
                {/* Helper Text */}
                <div className="mt-3 p-3 rounded-md bg-gray-50 border border-gray-200">
                  <p className="text-sm text-gray-700">
                    <strong>Permanent Transfer:</strong> Ownership of the VO in TheOrg is transferred to the new therapist. This is a permanent change in responsibility.
                  </p>
                </div>
              </div>

              {/* Patient Table */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Selected Patient/s - VO/s</h3>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  {/* Table Header */}
                  <div className="grid grid-cols-5 gap-4 py-3 px-4 bg-gray-100 text-gray-700 font-medium text-sm">
                    <div className="col-span-1">Patient Name</div>
                    <div className="col-span-1">Facility</div>
                    <div className="col-span-1">VO Nr.</div>
                    <div className="col-span-1">Doctor</div>
                    <div className="col-span-1">Current Therapist</div>
                  </div>
                  
                  {/* Table Rows */}
                  {selectedPatientsForTransferPatient.map((patient, index) => (
                    <div 
                      key={patient.id} 
                      className={`grid grid-cols-5 gap-4 py-3 px-4 border-t border-gray-200 items-center ${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                      }`}
                    >
                      <div className="col-span-1 font-medium text-gray-900">{patient.name}</div>
                      <div className="col-span-1 text-gray-700">{patient.facility}</div>
                      <div className="col-span-1 text-gray-700">{patient.prescription}</div>
                      <div className="col-span-1 text-gray-700">{patient.doctor}</div>
                      <div className="col-span-1">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                          {patient.primaryTherapist}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Therapist Selection Dropdown */}
              <div className="mb-4">
                <div className="max-w-md">
                  <label className="block text-lg font-medium text-gray-900 mb-3">
                    Transfer to Therapist:
                  </label>
                  <div className="relative" id="transfer-patient-therapist-dropdown">
                    <div className="relative">
                      <input
                        type="text"
                        value={transferPatientSearchTerm}
                        onChange={(e) => setTransferPatientSearchTerm(e.target.value)}
                        onFocus={() => setIsTransferPatientDropdownOpen(true)}
                        disabled={isTransferPatientInProgress}
                        placeholder="Search therapists..."
                        className={`w-full border border-gray-300 rounded-md py-2 px-4 pr-8 ${
                          isTransferPatientInProgress 
                            ? 'bg-gray-100 cursor-not-allowed opacity-50' 
                            : 'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setIsTransferPatientDropdownOpen(!isTransferPatientDropdownOpen)}
                        disabled={isTransferPatientInProgress}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        <svg 
                          className={`h-4 w-4 text-gray-400 transition-transform ${isTransferPatientDropdownOpen ? 'rotate-180' : ''}`} 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </div>
                    
                    {/* Dropdown Options */}
                    {isTransferPatientDropdownOpen && (
                      <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                        {therapists
                          .filter(therapist => therapist !== currentUser) // Exclude current user for transfers
                          .filter(therapist => therapist.toLowerCase().includes(transferPatientSearchTerm.toLowerCase()))
                          .map((therapist) => (
                            <button
                              key={therapist}
                              type="button"
                              onClick={() => {
                                setSelectedTransferTherapist(therapist);
                                setTransferPatientSearchTerm(therapist);
                                setIsTransferPatientDropdownOpen(false);
                              }}
                              disabled={isTransferPatientInProgress}
                              className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 focus:outline-none focus:bg-gray-100 ${
                                selectedTransferTherapist === therapist ? 'bg-blue-50 text-blue-600' : 'text-gray-900'
                              }`}
                            >
                              {therapist}
                            </button>
                          ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Currently selected therapist */}
                  {selectedTransferTherapist && (
                    <div className="mt-2">
                      <span className="text-sm text-gray-600">Selected: </span>
                      <span className="text-sm font-medium text-blue-600">{selectedTransferTherapist}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 p-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
              <button 
                onClick={closeTransferPatientModal}
                disabled={isTransferPatientInProgress}
                className={`px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md text-sm font-medium ${
                  isTransferPatientInProgress 
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={confirmTransferPatient}
                disabled={!selectedTransferTherapist || isTransferPatientInProgress}
                className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 ${
                  selectedTransferTherapist && !isTransferPatientInProgress
                    ? 'bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500' 
                    : 'bg-blue-300 text-white cursor-not-allowed'
                }`}
              >
                {isTransferPatientInProgress && (
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {isTransferPatientInProgress ? 'Transferring...' : 'Confirm Permanent Transfer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </WireframeLayout>
  );
} 