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
  order?: number;  // Added order field (replaces startTime/endTime)
  treated?: boolean;
  treatmentHistory?: TreatmentEntry[];
  totalTreatments: number;  // Maximum number of treatments prescribed
  completedTreatments: number;  // Number of treatments completed
};

// Type for a treatment history entry
type TreatmentEntry = {
  date: string;
  notes?: string;
  session?: string;
  order?: number;  // Added order field
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
  
  // State for calendar navigation
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => {
    // Start with a week in March 2025
    const march2025 = new Date(2025, 2, 15); // March 15, 2025
    // Go to Sunday of this week
    const sunday = new Date(march2025);
    sunday.setDate(march2025.getDate() - march2025.getDay());
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
      // This is a treatment
      const treatment = item;
      const dateStr = formatDateString(date);
      const historyEntry = treatment.treatmentHistory?.find(entry => entry.date === dateStr);
      
      return (
        <div 
          key={`treatment-${treatment.id}-${idx}`}
          onClick={() => onEditItem({ type: 'treatment', id: treatment.id, date: dateStr })}
          className={`mb-2 p-2 bg-white border border-gray-200 rounded-md shadow-sm cursor-pointer hover:bg-gray-50 ${
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
              <div className="font-medium text-sm">{treatment.name}</div>
              <div className="text-xs text-gray-600">
                {treatment.prescription} | {historyEntry?.session || treatment.session}
              </div>
            </div>
            <div className="text-xs px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded-full">
              #{historyEntry?.order || treatment.order || 0}
            </div>
          </div>
          
          {historyEntry?.notes && (
            <div className="text-xs text-gray-500 truncate">
              {historyEntry.notes}
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
  
  // State for toast notifications
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [nextToastId, setNextToastId] = useState(1);
  
  // Tab navigation state - new state for tracking active tab
  const [activeTab, setActiveTab] = useState<'patient-list' | 'calendar'>('patient-list');
  
  // State to track which patients' suggestions are visible (now an array)
  const [visibleSuggestions, setVisibleSuggestions] = useState<number[]>([]);
  
  const [treatmentDate, setTreatmentDate] = useState('15.03.2025');
  const [modalPatients, setModalPatients] = useState<ModalItem[]>([]);
  const [nextBreakId, setNextBreakId] = useState<number>(1000); // Use a different range for break IDs
  const [draggedPatientId, setDraggedPatientId] = useState<number | null>(null);
  const [activityDropdownOpen, setActivityDropdownOpen] = useState(false); // State for activity dropdown
  
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
  
  // State for selected patients
  const [patients, setPatients] = useState<Patient[]>([
    {
      id: 1,
      name: 'John Smith',
      facility: 'Main Hospital',
      lastTreatment: '18.03.2025',
      frequencyWTD: '2',
      organizer: 'Dr. Wilson',
      prescription: 'A1234',
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
      organizer: 'Dr. Miller',
      prescription: 'B5678',
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
      organizer: 'Dr. Brown',
      prescription: 'C9101',
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
      organizer: 'Dr. Taylor',
      prescription: 'D1122',
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
      organizer: 'Dr. Roberts',
      prescription: 'E3344',
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
      patient.id === id ? { ...patient, notes } : patient
    ));
    // Hide suggestions when user types
    if (visibleSuggestions.includes(id)) {
      setVisibleSuggestions(visibleSuggestions.filter(suggestionId => suggestionId !== id));
    }
  };

  // Check if any patient is selected to show the Document Treatment button
  const hasSelectedPatients = patients.some(patient => patient.selected);
  const selectedCount = modalPatients.length;

  // Function to toggle the modal
  const toggleModal = () => {
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
        
        // Prepare the modal with just this patient
        const modalPatient = {
          ...patient,
          notes: historyEntry?.notes || patient.notes,
          order: historyEntry?.order || patient.order
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
                // Update existing entry
                treatmentHistory[entryIndex] = {
                  ...treatmentHistory[entryIndex],
                  notes: modalPatient.notes,
                  order: modalPatient.order
                };
              }
              
              return {
                ...patient,
                notes: modalPatient.notes,
                order: modalPatient.order,
                treatmentHistory
              };
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
          const newCompletedTreatments = Math.min(patient.completedTreatments + 1, patient.totalTreatments);
          return {
            ...patient,
            treated: true,
            organizer: "Treated", // Set organizer to "Treated" when a patient is marked as treated
            lastTreatment: treatmentDate,
            notes: modalPatient.notes,
            order: modalPatient.order,
            selected: false,
            completedTreatments: newCompletedTreatments,
            treatmentHistory: [
              ...(patient.treatmentHistory || []),
              {
                date: treatmentDate,
                notes: modalPatient.notes,
                session: `${newCompletedTreatments}/${patient.totalTreatments}`,
                order: modalPatient.order
              }
            ]
          };
        }
        return patient;
      });

      setPatients(updatedPatients);
      
      // Show toast notification for treated patients
      if (treatedPatientCount > 0) {
        addToast(`${treatedPatientCount} patient${treatedPatientCount > 1 ? 's' : ''} marked as Treated`, "success");
      }
      
      // Switch to patient-list tab after marking patients as treated
      setActiveTab('patient-list');
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

            {/* Suggested Notes */}
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
            
            {/* Position indicator */}
            <div className="text-xs text-gray-500">
              {patient.order ? `Position: ${patient.order}` : 'Position not set'}
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

  return (
    <WireframeLayout title="Treatment Documentation V2" username="User Therapist" userInitials="UT" showSidebar={false}>
      <div className="max-w-full mx-auto bg-[#f8f9fa] rounded-lg shadow p-4">
        {/* Tab Navigation */}
        <div className="mb-4 border-b">
          <div className="flex">
            <button
              className={`py-3 px-4 font-medium ${
                activeTab === 'patient-list'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('patient-list')}
            >
              Patient List
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
        
        {/* Treatment Documentation Header - only show in patient list view */}
        {activeTab === 'patient-list' && (
          <div className="mb-4">
            <h1 className="text-2xl font-semibold">Treatment Documentation</h1>
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
              onDocumentTreatment={openPatientSelectModal} // Add the new prop
            />
          </div>
        )}
        
        {/* Patient List View */}
        {activeTab === 'patient-list' && (
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
                {/* Document Treatment button - kept but moved to the right */}
                {hasSelectedPatients && (
                  <WireframeButton variant="primary" onClick={toggleModal}>
                    Document Treatment
                  </WireframeButton>
                )}
              </div>
            </div>

            {/* Table Headers */}
            <div className="grid grid-cols-10 gap-4 py-3 px-4 bg-gray-100 text-gray-700 font-medium text-sm">
              <div className="col-span-1"></div>
              <div className="col-span-1">Name Patient</div>
              <div className="col-span-1">Facility</div>
              <div className="col-span-1">Last Treatment (Date)</div>
              <div className="col-span-1">Frequency WTD</div>
              <div className="col-span-1">Organizer</div>
              <div className="col-span-1">Prescription (Current)</div>
              <div className="col-span-1">Status VO (#/#)</div>
              <div className="col-span-1">Doctor</div>
              <div className="col-span-1">Dokumentation</div>
            </div>

            {/* Table Rows - with green background for treated patients */}
            {patients.map((patient) => (
              <div 
                key={patient.id} 
                className={`grid grid-cols-10 gap-4 py-3 px-4 border-t border-gray-200 items-center ${
                  patient.selected ? 'bg-blue-50' : (patient.treated && patient.organizer === "Treated") ? 'bg-green-50' : ''
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
                <div className="col-span-1">
                  <span className={`font-medium ${patient.completedTreatments === patient.totalTreatments ? 'text-green-600' : 'text-blue-600'}`}>
                    {patient.completedTreatments}/{patient.totalTreatments}
                  </span>
                </div>
                <div className="col-span-1">{patient.doctor}</div>
                <div className="col-span-1 flex justify-center">
                  {patient.treated && (
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
                    viewingPatient.treatmentHistory.map((entry, index) => (
                      <div key={index} className="grid grid-cols-9 gap-4 py-3 px-4 text-sm">
                        <div className="col-span-1">{index + 1}</div>
                        <div className="col-span-3">{entry.date}</div>
                        <div className="col-span-5">{entry.notes}</div>
                      </div>
                    ))
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
    </WireframeLayout>
  );
} 