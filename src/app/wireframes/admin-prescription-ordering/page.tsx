'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import WireframeLayout from '@/components/WireframeLayout';

type PrescriptionOrder = {
  id: number;
  patientName: string;
  birthdate: string;
  facility: string;
  facilityAddress?: string;
  therapist: string;
  doctor: string;
  orderDate: string;
  status: string;
  treatmentType?: string;
  caseNumber?: string;
  notes?: string;
  actionStatus?: string;
  selected?: boolean;
  orderStatus?: 'ready' | 'OK' | 'Folge VO bestellen' | 'Folge VO Bestelt' | 'Folge VO Erhalten' | 'Closed';
};

type Toast = {
  id: number;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
};

type LogEntry = {
  id: number;
  prescriptionId: number;
  timestamp: Date;
  action: string;
  user: string;
  details?: string;
};

export default function AdminPrescriptionOrderingWireframe() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<PrescriptionOrder | null>(null);
  const [noteText, setNoteText] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(10);
  // Add state for order modal
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  // Add state for order selection in modal
  const [selectAllChecked, setSelectAllChecked] = useState(false);
  // Add state for modal search
  const [modalSearchQuery, setModalSearchQuery] = useState('');
  // Add state for toast notifications
  const [toasts, setToasts] = useState<Toast[]>([]);
  // Add state for PDF preview modal
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  // Add state for selected orders for PDF
  const [selectedOrdersForPdf, setSelectedOrdersForPdf] = useState<PrescriptionOrder[]>([]);
  // Add state for confirmation dialog
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  // Add state for doctor filter
  const [selectedDoctor, setSelectedDoctor] = useState('All');
  // Add state for order view in main table
  const [isOrderViewActive, setIsOrderViewActive] = useState(false);
  // Add state for main table select all checkbox
  const [mainTableSelectAllChecked, setMainTableSelectAllChecked] = useState(false);
  // Add state for main table doctor filter
  const [mainTableDoctorFilter, setMainTableDoctorFilter] = useState('');
  // Add state for logs
  const [logs, setLogs] = useState<LogEntry[]>([]);
  // Add state for logs modal
  const [showLogsModal, setShowLogsModal] = useState(false);
  const [selectedOrderLogs, setSelectedOrderLogs] = useState<LogEntry[]>([]);
  
  // Sample data for prescription orders
  const [prescriptionOrders, setPrescriptionOrders] = useState<PrescriptionOrder[]>([
    { 
      id: 1, 
      patientName: 'Christel Albrecht', 
      birthdate: '30.12.1931',
      facility: 'Alpenland Marzahn',
      therapist: 'J. Scheffler',
      doctor: 'Dr. Mueller',
      caseNumber: '[3022-3]',
      orderDate: '10.03.2025',
      status: '0 / 0',
      actionStatus: 'In Behandlung',
      orderStatus: 'Folge VO bestellen',
      selected: false
    },
    { 
      id: 2, 
      patientName: 'Knut Andersohn', 
      birthdate: '1.9.1934',
      facility: 'Alloheim Senioren-Residenz',
      therapist: 'I. Klutke',
      doctor: 'Dr. Weber',
      caseNumber: '[2669-4]',
      orderDate: '29.03.2025',
      status: '0 / 0',
      actionStatus: 'In Behandlung',
      orderStatus: 'OK',
      selected: false
    },
    { 
      id: 3, 
      patientName: 'Gisela Amlick', 
      birthdate: '16.12.1930',
      facility: 'Ev.Seniorenheim Albestraße',
      therapist: 'F. Becker',
      doctor: 'Dr. Mueller',
      caseNumber: '[1501-6]',
      orderDate: '29.03.2025',
      status: '0 / 0',
      actionStatus: 'In Behandlung',
      orderStatus: 'Folge VO bestellen',
      selected: false
    },
    { 
      id: 4, 
      patientName: 'Renate Baase', 
      birthdate: '21.4.1946',
      facility: 'Vitanas Senioren Centrum',
      therapist: 'H. Papaspanos',
      doctor: 'Dr. Schmidt',
      caseNumber: '[1997-22]',
      orderDate: '04.03.2025',
      status: '0 / 0',
      actionStatus: 'In Behandlung',
      orderStatus: 'Folge VO Bestelt',
      selected: false
    },
    { 
      id: 5, 
      patientName: 'Karin Bab', 
      birthdate: '4.10.1942',
      facility: 'Haus Sprechsaal Berlin',
      therapist: 'F. Javamis',
      doctor: 'Dr. Weber',
      caseNumber: '[3530-1]',
      orderDate: '28.02.2025',
      status: '0 / 0',
      actionStatus: 'In Behandlung',
      orderStatus: 'Folge VO bestellen',
      selected: false
    },
    { 
      id: 6, 
      patientName: 'Manfred Bach', 
      birthdate: '22.12.1939',
      facility: 'Pflegewohnstift Potsdam',
      therapist: 'K. Mischke',
      doctor: 'Dr. Schmidt',
      caseNumber: '[2414-5]',
      orderDate: '28.02.2025',
      status: '0 / 0',
      actionStatus: 'Abgeschloss...',
      orderStatus: 'Closed',
      selected: false
    },
    { 
      id: 7, 
      patientName: 'Margot Bahle', 
      birthdate: '17.3.1934',
      facility: 'FSE Pflegeeinrichtung',
      therapist: 'M. Seiz',
      doctor: 'Dr. Fischer',
      caseNumber: '[740-8]',
      orderDate: '13.03.2025',
      status: '0 / 0',
      actionStatus: 'In Behandlung',
      orderStatus: 'Folge VO bestellen',
      selected: false
    },
    { 
      id: 8, 
      patientName: 'Erika Ballach', 
      birthdate: '14.5.1928',
      facility: 'Alpenland Marzahn',
      therapist: 'J. Scheffler',
      doctor: 'Dr. Mueller',
      caseNumber: '[1668-12]',
      orderDate: '05.03.2025',
      status: '0 / 0',
      actionStatus: 'In Behandlung',
      orderStatus: 'OK',
      selected: false
    },
    { 
      id: 9, 
      patientName: 'Hans Meyer', 
      birthdate: '25.6.1945',
      facility: 'Seniorenresidenz Am Park',
      therapist: 'S. Müller',
      doctor: 'Dr. Fischer',
      caseNumber: '[2034-7]',
      orderDate: '15.03.2025',
      status: '0 / 0',
      actionStatus: 'In Behandlung',
      orderStatus: 'Folge VO bestellen',
      selected: false
    },
    { 
      id: 10, 
      patientName: 'Ursula Schmidt', 
      birthdate: '12.8.1938',
      facility: 'Seniorenheim Sonnenschein',
      therapist: 'L. Wagner',
      doctor: 'Dr. Weber',
      caseNumber: '[1922-4]',
      orderDate: '18.03.2025',
      status: '0 / 0',
      actionStatus: 'In Behandlung',
      orderStatus: 'Folge VO Bestelt',
      selected: false
    }
  ]);

  // Get counts for stats cards
  const toBeOrderedCount = prescriptionOrders.filter(order => order.actionStatus === 'Zu bestellen').length;
  const inProgressCount = prescriptionOrders.filter(order => order.actionStatus === 'Bestellt').length;
  const completedCount = prescriptionOrders.filter(order => order.actionStatus?.includes('Abgeschloss')).length;

  // Filter orders for the modal - now use orders with orderStatus 'Folge VO bestellen'
  const toBeOrderedPrescriptions = prescriptionOrders.filter(order => order.orderStatus === 'Folge VO bestellen');
  
  // Filter orders in modal based on selected doctor
  const filteredModalOrders = toBeOrderedPrescriptions.filter(order => {
    return selectedDoctor === 'All' || order.doctor === selectedDoctor;
  });

  // Handle opening and closing order modal
  const handleOpenOrderModal = () => {
    setIsOrderModalOpen(true);
    setModalSearchQuery('');
    setSelectedDoctor('All');
    // Reset any previous selections and pre-select all orders with "Folge VO bestellen" status
    setPrescriptionOrders(orders => 
      orders.map(order => ({
        ...order,
        selected: order.orderStatus === 'Folge VO bestellen'
      }))
    );
    setSelectAllChecked(true);
  };

  // Handle toggling the order view in main table
  const handleToggleOrderView = () => {
    // Toggle the view state
    const newState = !isOrderViewActive;
    setIsOrderViewActive(newState);
    
    if (newState) {
      // Entering order view - initialize all prescriptions with unchecked boxes
      setPrescriptionOrders(orders => 
        orders.map(order => ({
          ...order,
          selected: false
        }))
      );
      setMainTableSelectAllChecked(false);
      // Reset doctor filter
      setMainTableDoctorFilter('');
    } else {
      // Exiting order view - reset selections
      setPrescriptionOrders(orders => 
        orders.map(order => ({
          ...order,
          selected: false
        }))
      );
      setMainTableSelectAllChecked(false);
    }
  };

  const handleCloseOrderModal = () => {
    setIsOrderModalOpen(false);
  };

  // Handle checkbox selection in modal
  const handleSelectAllChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setSelectAllChecked(checked);
    setPrescriptionOrders(orders => 
      orders.map(order => 
        order.orderStatus === 'Folge VO bestellen' && 
        (selectedDoctor === 'All' || order.doctor === selectedDoctor)
          ? { ...order, selected: checked }
          : order
      )
    );
  };

  // Handle select all checkbox in main table
  const handleMainTableSelectAllChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setMainTableSelectAllChecked(checked);
    
    // Update selection for all visible orders
    setPrescriptionOrders(orders => 
      orders.map(order => {
        // Check if the order is currently visible in the filtered view
        const isVisible = filteredOrders.some(filteredOrder => filteredOrder.id === order.id);
        return isVisible ? { ...order, selected: checked } : order;
      })
    );
  };

  // Handle doctor filter change in main table
  const handleMainTableDoctorFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newDoctor = e.target.value;
    setMainTableDoctorFilter(newDoctor);
    
    // Reset selection when filter changes
    setPrescriptionOrders(orders => 
      orders.map(order => ({
        ...order,
        selected: false
      }))
    );
    setMainTableSelectAllChecked(false);
  };

  const handleSelectOrderChange = (id: number, checked: boolean) => {
    setPrescriptionOrders(orders => 
      orders.map(order => 
        order.id === id 
          ? { ...order, selected: checked }
          : order
      )
    );
    
    // Update the selectAll checkbox state based on all individual checkboxes
    const updatedOrders = prescriptionOrders.map(order => 
      order.id === id ? { ...order, selected: checked } : order
    );
    const toBeOrderedUpdated = updatedOrders.filter(order => order.actionStatus === 'Zu bestellen');
    const allSelected = toBeOrderedUpdated.every(order => order.selected);
    setSelectAllChecked(allSelected);
  };

  // Handle modal search input changes
  const handleModalSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setModalSearchQuery(e.target.value);
  };

  // Handle doctor filter changes
  const handleDoctorFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newDoctor = e.target.value;
    setSelectedDoctor(newDoctor);
    
    // Uncheck all prescriptions when filter changes
    setPrescriptionOrders(orders => 
      orders.map(order => ({
        ...order,
        selected: false
      }))
    );
    setSelectAllChecked(false);
  };

  // Handle search input changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Filter orders based on search query and status
  const filteredOrders = prescriptionOrders.filter(order => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = (
      order.patientName.toLowerCase().includes(searchLower) ||
      order.facility.toLowerCase().includes(searchLower) ||
      order.therapist.toLowerCase().includes(searchLower) ||
      order.doctor.toLowerCase().includes(searchLower)
    );
    
    // When in order view, only show prescriptions with orderStatus 'Folge VO bestellen'
    if (isOrderViewActive) {
      const matchesOrderStatus = order.orderStatus === 'Folge VO bestellen';
      const matchesDoctor = mainTableDoctorFilter === '' || order.doctor === mainTableDoctorFilter;
      return matchesSearch && matchesOrderStatus && matchesDoctor;
    }
    
    // In normal view, show all prescriptions that match search
    return matchesSearch;
  });

  // Handle opening a note modal
  const handleAddNote = (id: number) => {
    const order = prescriptionOrders.find(o => o.id === id);
    if (order) {
      setSelectedOrder(order);
      setNoteText(order.notes || '');
      setShowModal(true);
    }
  };

  // Handle saving a note
  const handleSaveNote = () => {
    if (selectedOrder) {
      setPrescriptionOrders(orders => 
        orders.map(order => 
          order.id === selectedOrder.id 
            ? { ...order, notes: noteText } 
            : order
        )
      );
      setShowModal(false);
    }
  };

  // Handle changing prescription status
  const handleStatusChange = (id: number, newStatus: string) => {
    // Get the current status
    const currentOrder = prescriptionOrders.find(order => order.id === id);
    const oldStatus = currentOrder?.actionStatus;
    
    // Update the prescription with new status
    if (newStatus === 'Bestellt') {
      // If status is being set to "Bestellt", update orderStatus to "Folge VO Bestelt"
      setPrescriptionOrders(orders => 
        orders.map(order => 
          order.id === id 
            ? { ...order, actionStatus: newStatus, orderStatus: 'Folge VO Bestelt' } 
            : order
        )
      );
      
      // Create log entry
      addLogEntry(
        id,
        'Status Changed',
        `Prescription order status updated to 'Folge VO Bestelt' by Admin Admin`
      );
    } else {
      // For other status changes, update only actionStatus
      setPrescriptionOrders(orders => 
        orders.map(order => 
          order.id === id 
            ? { ...order, actionStatus: newStatus } 
            : order
        )
      );
      
      // Create log entry
      addLogEntry(
        id,
        'Status Changed',
        `Prescription admin status changed to '${newStatus}' by Admin Admin`
      );
    }
  };

  // Handle bulk status change for selected orders
  const handleMarkAsOrdered = () => {
    setShowConfirmDialog(true);
  };

  // Handle confirmation dialog confirmation
  const handleConfirmStatusChange = () => {
    // Get selected orders
    const selectedOrders = prescriptionOrders.filter(order => order.selected);
    
    // Update all selected orders - don't change actionStatus, only update orderStatus to "Folge VO Bestelt"
    setPrescriptionOrders(orders => 
      orders.map(order => 
        order.selected
          ? { ...order, orderStatus: 'Folge VO Bestelt', selected: false }
          : order
      )
    );
    
    // Create log entries for orders that are marked as ordered
    selectedOrders.forEach(order => {
      addLogEntry(
        order.id,
        'Status Changed',
        `Prescription order status updated to 'Folge VO Bestelt' by Admin Admin (bulk action)`
      );
    });
    
    // Show success toast
    addToast(`${selectedOrders.length} prescription(s) updated to 'Folge VO Bestelt' status`, 'success');
    
    // Close all dialogs
    setShowConfirmDialog(false);
    setIsOrderModalOpen(false);
  };

  // Handle confirmation dialog cancel
  const handleCancelStatusChange = () => {
    setShowConfirmDialog(false);
  };

  // Get count of selected prescriptions
  const selectedCount = prescriptionOrders.filter(order => order.selected).length;

  // Toast notification functions
  const addToast = (message: string, type: 'success' | 'info' | 'warning' | 'error' = 'info') => {
    const id = Date.now();
    setToasts(prevToasts => [...prevToasts, { id, message, type }]);
    
    // Auto remove toast after 3 seconds
    setTimeout(() => {
      removeToast(id);
    }, 3000);
  };
  
  const removeToast = (id: number) => {
    setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
  };

  // Function to add a log entry
  const addLogEntry = (prescriptionId: number, action: string, details?: string) => {
    const newLog = {
      id: Date.now(),
      prescriptionId,
      timestamp: new Date(),
      action,
      user: 'Admin Admin', // Hardcoded for the wireframe
      details
    };
    setLogs(prevLogs => [...prevLogs, newLog]);
  };

  // PDF export function
  const handleExportPdf = () => {
    const selectedOrders = prescriptionOrders.filter(order => order.selected);
    if (selectedOrders.length === 0) return;
    
    // Show toast notification
    addToast(`Generating PDF for ${selectedOrders.length} prescription(s)`, 'info');
    
    // Store selected orders for PDF preview
    setSelectedOrdersForPdf(selectedOrders);
    
    // Simulate downloading after 1 second
    setTimeout(() => {
      setShowPdfPreview(true);
    }, 1000);
  };

  // Handle PDF preview close
  const handleClosePdfPreview = () => {
    setShowPdfPreview(false);
  };

  // Handle showing logs for a prescription
  const handleShowLogs = (id: number) => {
    const orderLogs = logs.filter(log => log.prescriptionId === id);
    setSelectedOrderLogs(orderLogs);
    setShowLogsModal(true);
  };

  // Handle closing logs modal
  const handleCloseLogsModal = () => {
    setShowLogsModal(false);
  };

  return (
    <WireframeLayout title="Therapios" username="Admin Admin" userInitials="AA" showSidebar={false}>
      <div className="max-w-full mx-auto p-6 relative">
        {/* Page Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Dashboard - Verwaltung</h1>
          <div className="flex items-center space-x-2">
            <div>
              <select className="border border-gray-300 rounded px-3 py-1 text-sm">
                <option>VO Status</option>
                <option>Zu bestellen</option>
                <option>In Behandlung</option>
                <option>Abgeschlossen</option>
              </select>
            </div>
            <div>
              <select className="border border-gray-300 rounded px-3 py-1 text-sm">
                <option>Therapist (Select)</option>
              </select>
            </div>
            <div>
              <div className="border border-gray-300 rounded px-3 py-1 text-sm flex items-center">
                Period: 01.03.2025 - 30.03.2025
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="mb-6">
          {/* Stats Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-4 border border-gray-200 rounded-md shadow-sm">
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-full bg-red-500 mr-2"></div>
                <span className="text-sm text-gray-600">VO zu bestellen</span>
              </div>
              <div className="text-3xl font-bold mt-2">{toBeOrderedCount}</div>
            </div>
            
            <div className="bg-white p-4 border border-gray-200 rounded-md shadow-sm">
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-full bg-amber-500 mr-2"></div>
                <span className="text-sm text-gray-600">VO bestellt</span>
              </div>
              <div className="text-3xl font-bold mt-2">{inProgressCount}</div>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white border border-gray-200 rounded-md shadow-sm mb-6">
          <div className="relative overflow-x-auto">
            {/* Search */}
            <div className="flex justify-between p-3">
              <div className="flex items-center space-x-2">
                {isOrderViewActive ? (
                  <select 
                    className="border border-gray-300 rounded px-3 py-1.5 text-sm"
                    value={mainTableDoctorFilter}
                    onChange={handleMainTableDoctorFilterChange}
                  >
                    <option value="">Filter by Doctor</option>
                    {Array.from(new Set(
                      prescriptionOrders
                        .filter(order => order.orderStatus === 'Folge VO bestellen')
                        .map(order => order.doctor)
                    )).map(doctor => (
                      <option key={doctor} value={doctor}>{doctor}</option>
                    ))}
                  </select>
                ) : (
                  <button className="border border-gray-300 rounded px-3 py-1.5 text-sm">
                    Show columns
                    <svg className="w-4 h-4 ml-1 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                )}
                
                <button 
                  onClick={handleToggleOrderView}
                  className={`flex items-center px-4 py-1.5 rounded text-sm transition-colors ${
                    isOrderViewActive 
                      ? 'bg-gray-100 text-gray-800 hover:bg-gray-200 border border-gray-300' 
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {isOrderViewActive ? (
                    <>
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                      </svg>
                      Back to Dashboard
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Order VOs
                    </>
                  )}
                </button>
              </div>
              
              <div className="flex items-center space-x-2">
                {!isOrderViewActive && (
                  <div className="relative">
                    <input 
                      type="text" 
                      className="pl-8 pr-3 py-1.5 border border-gray-300 rounded w-64 text-sm"
                      placeholder="Search"
                      value={searchQuery}
                      onChange={handleSearchChange}
                    />
                    <div className="absolute left-2 top-1/2 transform -translate-y-1/2">
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>
                )}
                
                {isOrderViewActive && (
                  <>
                    <button 
                      onClick={handleExportPdf}
                      className="px-4 py-1.5 border border-gray-300 rounded text-sm flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={selectedCount === 0}
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Export PDF
                    </button>
                    <button 
                      onClick={handleMarkAsOrdered}
                      className="px-4 py-1.5 bg-blue-600 text-white rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={selectedCount === 0}
                    >
                      Mark as Ordered
                    </button>
                  </>
                )}
              </div>
            </div>
            
            {/* Table */}
            <table className="w-full text-sm text-left text-gray-700">
              <thead className="text-xs text-gray-600 uppercase bg-gray-50">
                <tr>
                  {isOrderViewActive && (
                    <th className="px-4 py-3 border-b">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        checked={mainTableSelectAllChecked}
                        onChange={handleMainTableSelectAllChange}
                      />
                    </th>
                  )}
                  <th className="px-4 py-3 border-b">Patient</th>
                  <th className="px-4 py-3 border-b">Birthdate</th>
                  <th className="px-4 py-3 border-b">Facility</th>
                  <th className="px-4 py-3 border-b">Therapist</th>
                  <th className="px-4 py-3 border-b">VO #</th>
                  {!isOrderViewActive && <th className="px-4 py-3 border-b">VO Status #/#</th>}
                  <th className={`px-4 py-3 border-b ${isOrderViewActive ? 'bg-blue-50' : ''}`}>Doctor</th>
                  {!isOrderViewActive && <th className="px-4 py-3 border-b">Notes</th>}
                  <th className="px-4 py-3 border-b">Admin Status</th>
                  <th className="px-4 py-3 border-b">Order Status</th>
                  {!isOrderViewActive && <th className="px-4 py-3 border-b">Logs</th>}
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr 
                    key={order.id} 
                    className={`border-b hover:bg-gray-50 ${
                      isOrderViewActive && order.selected ? 'bg-blue-50' : 'bg-white'
                    }`}
                  >
                    {isOrderViewActive && (
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          checked={order.selected || false}
                          onChange={(e) => handleSelectOrderChange(order.id, e.target.checked)}
                        />
                      </td>
                    )}
                    <td className="px-4 py-3">{order.patientName}</td>
                    <td className="px-4 py-3">{order.birthdate}</td>
                    <td className="px-4 py-3">{order.facility}</td>
                    <td className="px-4 py-3">{order.therapist}</td>
                    <td className="px-4 py-3">{order.caseNumber}</td>
                    {!isOrderViewActive && <td className="px-4 py-3">{order.status}</td>}
                    <td className={`px-4 py-3 ${isOrderViewActive ? 'bg-blue-50' : ''}`}>{order.doctor}</td>
                    {!isOrderViewActive && (
                      <td className="px-4 py-3">
                        <button 
                          onClick={() => handleAddNote(order.id)}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                          <span className="ml-1">Add Note</span>
                        </button>
                      </td>
                    )}
                    <td className="px-4 py-3">
                      {isOrderViewActive ? (
                        <span className={`px-2 py-1 text-sm border rounded ${
                          order.actionStatus === 'Bestellt' ? 'bg-white border-red-500 text-red-700' : 
                          order.actionStatus === 'In Behandlung' ? 'bg-white border-orange-400 text-orange-700' :
                          order.actionStatus === 'In Behandlung...' ? 'bg-white border-orange-400 text-orange-700' :
                          order.actionStatus === 'Abgeschloss...' ? 'bg-white border-green-500 text-green-700' :
                          order.actionStatus === 'Abgelehnt' ? 'bg-white border-gray-400 text-gray-700' :
                          order.actionStatus === 'Zu bestellen' ? 'bg-white border-blue-800 text-blue-800' :
                          order.actionStatus === 'Neu ausstellen...' ? 'bg-white border-amber-400 text-amber-700' :
                          'bg-white border-gray-300 text-gray-700'
                        }`}>
                          {order.actionStatus}
                        </span>
                      ) : (
                        <select 
                          className={`border border-gray-300 rounded px-2 py-1 text-sm ${
                            order.actionStatus === 'Bestellt' ? 'bg-white border-red-500 text-red-700' : 
                            order.actionStatus === 'In Behandlung' ? 'bg-white border-orange-400 text-orange-700' :
                            order.actionStatus === 'In Behandlung...' ? 'bg-white border-orange-400 text-orange-700' :
                            order.actionStatus === 'Abgeschloss...' ? 'bg-white border-green-500 text-green-700' :
                            order.actionStatus === 'Abgelehnt' ? 'bg-white border-gray-400 text-gray-700' :
                            order.actionStatus === 'Zu bestellen' ? 'bg-white border-blue-800 text-blue-800' :
                            order.actionStatus === 'Neu ausstellen...' ? 'bg-white border-amber-400 text-amber-700' :
                            'bg-white'
                          }`}
                          value={order.actionStatus || ''}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        >
                          <option value="Select">Select</option>
                          <option value="Zu bestellen">Zu bestellen</option>
                          <option value="Bestellt">Bestellt</option>
                          <option value="In Behandlung">In Behandlung</option>
                          <option value="In Behandlung...">In Behandlung...</option>
                          <option value="Abgeschloss...">Abgeschloss...</option>
                          <option value="Abgelehnt">Abgelehnt</option>
                          <option value="Neu ausstellen...">Neu ausstellen...</option>
                        </select>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-sm border rounded ${
                        order.orderStatus === 'ready' ? 'bg-white border-blue-500 text-blue-700' : 
                        order.orderStatus === 'OK' ? 'bg-white border-green-500 text-green-700' :
                        order.orderStatus === 'Folge VO bestellen' ? 'bg-white border-amber-500 text-amber-700' :
                        order.orderStatus === 'Folge VO Bestelt' ? 'bg-white border-purple-500 text-purple-700' :
                        order.orderStatus === 'Folge VO Erhalten' ? 'bg-white border-teal-500 text-teal-700' :
                        order.orderStatus === 'Closed' ? 'bg-white border-gray-500 text-gray-700' :
                        'bg-white border-gray-300 text-gray-700'
                      }`}>
                        {order.orderStatus}
                      </span>
                    </td>
                    {!isOrderViewActive && (
                      <td className="px-4 py-3">
                        <button 
                          className="text-gray-600 hover:text-gray-900"
                          onClick={() => handleShowLogs(order.id)}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="flex justify-between items-center p-4 border-t border-gray-200">
              <div className="flex items-center">
                <span className="text-sm text-gray-700 mr-2">Rows per page</span>
                <select 
                  className="border border-gray-300 rounded p-1 text-sm"
                  value={rowsPerPage}
                  onChange={(e) => setRowsPerPage(Number(e.target.value))}
                >
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </select>
              </div>
              
              <div className="flex items-center">
                <span className="text-sm text-gray-700 mr-4">1-10 of 479</span>
                <div className="flex space-x-2">
                  <button className="p-1 rounded border border-gray-300">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                    </svg>
                  </button>
                  <button className="p-1 rounded border border-gray-300">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button className="p-1 rounded border border-gray-300">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                  <button className="p-1 rounded border border-gray-300">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Toast Notifications */}
        <div className="fixed top-4 right-4 z-50 flex flex-col space-y-2">
          {toasts.map(toast => (
            <div
              key={toast.id}
              className={`px-4 py-2 rounded shadow-lg text-white max-w-xs 
              ${toast.type === 'success' ? 'bg-green-500' : 
                toast.type === 'error' ? 'bg-red-500' : 
                toast.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'}`}
            >
              {toast.message}
            </div>
          ))}
        </div>
      </div>

      {/* Add Note Modal - updated with backdrop blur */}
      {showModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Add Note for {selectedOrder.patientName}</h3>
              <button 
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="mb-4">
              <textarea
                className="w-full border border-gray-300 rounded p-2 text-sm"
                rows={5}
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Enter notes here..."
              ></textarea>
            </div>
            <div className="flex justify-end space-x-2">
              <button 
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-gray-300 rounded text-sm"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveNote}
                className="px-4 py-2 bg-blue-600 text-white rounded text-sm"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Prescription Order Modal - updated with backdrop blur */}
      {isOrderModalOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-medium">Prescriptions to Order</h3>
                <p className="text-sm text-gray-600">{toBeOrderedCount} prescription(s)</p>
              </div>
              <button 
                onClick={handleCloseOrderModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Search in Modal */}
            <div className="mb-4 relative">
              <select 
                className="w-full border border-gray-300 rounded p-2 text-sm"
                value={selectedDoctor}
                onChange={handleDoctorFilterChange}
              >
                <option value="All">All Doctors</option>
                {Array.from(new Set(prescriptionOrders.map(order => order.doctor))).map(doctor => (
                  <option key={doctor} value={doctor}>{doctor}</option>
                ))}
              </select>
            </div>
            
            {/* Modal Table */}
            <div className="max-h-96 overflow-y-auto mb-4">
              <table className="w-full text-sm text-left text-gray-700">
                <thead className="text-xs text-gray-600 uppercase bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-3 py-3 border-b">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          checked={selectAllChecked}
                          onChange={handleSelectAllChange}
                        />
                      </div>
                    </th>
                    <th className="px-3 py-3 border-b">Patient</th>
                    <th className="px-3 py-3 border-b">Date of Birth</th>
                    <th className="px-3 py-3 border-b">Facility</th>
                    <th className="px-3 py-3 border-b">Therapist</th>
                    <th className="px-3 py-3 border-b">VO #</th>
                    <th className="px-3 py-3 border-b bg-blue-50">Doctor</th>
                    <th className="px-3 py-3 border-b">Order Status</th>
                    <th className="px-3 py-3 border-b">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredModalOrders.length > 0 ? (
                    filteredModalOrders.map((order) => (
                      <tr 
                        key={order.id} 
                        className={`border-b hover:bg-gray-50 ${order.selected ? 'bg-blue-50' : 'bg-white'}`}
                      >
                        <td className="px-3 py-3">
                          <input
                            type="checkbox"
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            checked={order.selected || false}
                            onChange={(e) => handleSelectOrderChange(order.id, e.target.checked)}
                          />
                        </td>
                        <td className="px-3 py-3">{order.patientName}</td>
                        <td className="px-3 py-3">{order.birthdate}</td>
                        <td className="px-3 py-3">{order.facility}</td>
                        <td className="px-3 py-3">{order.therapist}</td>
                        <td className="px-3 py-3">{order.caseNumber}</td>
                        <td className="px-3 py-3 bg-blue-50">{order.doctor}</td>
                        <td className="px-3 py-3">
                          <span className={`px-2 py-1 text-sm border rounded ${
                            order.orderStatus === 'ready' ? 'bg-white border-blue-500 text-blue-700' : 
                            order.orderStatus === 'OK' ? 'bg-white border-green-500 text-green-700' :
                            order.orderStatus === 'Folge VO bestellen' ? 'bg-white border-amber-500 text-amber-700' :
                            order.orderStatus === 'Folge VO Bestelt' ? 'bg-white border-purple-500 text-purple-700' :
                            order.orderStatus === 'Folge VO Erhalten' ? 'bg-white border-teal-500 text-teal-700' :
                            order.orderStatus === 'Closed' ? 'bg-white border-gray-500 text-gray-700' :
                            'bg-white border-gray-300 text-gray-700'
                          }`}>
                            {order.orderStatus}
                          </span>
                        </td>
                        <td className="px-3 py-3">{order.notes || '-'}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={9} className="px-3 py-4 text-center text-gray-500">
                        No prescriptions to order found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Modal Actions */}
            <div className="flex justify-end space-x-2 border-t pt-4">
              <button 
                onClick={handleCloseOrderModal}
                className="px-4 py-2 border border-gray-300 rounded text-sm"
              >
                Cancel
              </button>
              <button 
                onClick={handleExportPdf}
                className="px-4 py-2 border border-gray-300 rounded text-sm flex items-center"
                disabled={selectedCount === 0}
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export PDF
              </button>
              <button 
                onClick={handleMarkAsOrdered}
                className="px-4 py-2 bg-blue-600 text-white rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={selectedCount === 0}
              >
                Mark as Ordered
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PDF Preview Modal */}
      {showPdfPreview && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Prescription PDF Preview</h3>
              <button 
                onClick={handleClosePdfPreview}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* PDF Preview Content */}
            <div className="border border-gray-300 rounded-lg p-6 bg-white max-h-[70vh] overflow-y-auto">
              <div className="flex justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Therapios</h2>
                  <p className="text-sm text-gray-600">Prescription Order Form</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Date: {new Date().toLocaleDateString()}</p>
                  <p className="text-sm text-gray-600">Order ID: ORD-{Date.now().toString().slice(-6)}</p>
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="text-md font-medium border-b pb-2 mb-2">Selected Prescriptions:</h3>
                <table className="w-full text-sm">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                    <tr>
                      <th className="px-3 py-2 text-left">Patient</th>
                      <th className="px-3 py-2 text-left">DOB</th>
                      <th className="px-3 py-2 text-left">Facility</th>
                      <th className="px-3 py-2 text-left">Therapist</th>
                      <th className="px-3 py-2 text-left">Doctor</th>
                      <th className="px-3 py-2 text-left">Prescription #</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrdersForPdf.map((order) => (
                      <tr key={order.id} className="border-b">
                        <td className="px-3 py-2">{order.patientName}</td>
                        <td className="px-3 py-2">{order.birthdate}</td>
                        <td className="px-3 py-2">{order.facility}</td>
                        <td className="px-3 py-2">{order.therapist}</td>
                        <td className="px-3 py-2">{order.doctor}</td>
                        <td className="px-3 py-2">{order.caseNumber}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="mb-6">
                <h3 className="text-md font-medium border-b pb-2 mb-2">Order Information:</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm"><span className="font-medium">Ordered By:</span> Admin Admin</p>
                    <p className="text-sm"><span className="font-medium">Order Date:</span> {new Date().toLocaleDateString()}</p>
                    <p className="text-sm"><span className="font-medium">Total Prescriptions:</span> {selectedOrdersForPdf.length}</p>
                  </div>
                  <div>
                    <p className="text-sm"><span className="font-medium">Delivery Method:</span> Electronic</p>
                    <p className="text-sm"><span className="font-medium">Status:</span> Processing</p>
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="text-md font-medium border-b pb-2 mb-2">Additional Notes:</h3>
                <p className="text-sm text-gray-600">All prescriptions will be processed within 24-48 hours. Please contact support for any questions regarding this order.</p>
              </div>
              
              <div className="flex justify-between border-t pt-4">
                <div className="text-sm text-gray-600">
                  <p>Therapios GmbH</p>
                  <p>Health Provider ID: TH-123456</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">This is a simulated document for demonstration purposes only</p>
                </div>
              </div>
            </div>
            
            {/* PDF Actions */}
            <div className="flex justify-end space-x-2 mt-4">
              <button 
                onClick={handleClosePdfPreview}
                className="px-4 py-2 border border-gray-300 rounded text-sm"
              >
                Close
              </button>
              <button 
                onClick={() => {
                  addToast('PDF downloaded successfully', 'success');
                  setTimeout(() => {
                    handleClosePdfPreview();
                    handleCloseOrderModal();
                  }, 1000);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded text-sm flex items-center"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-[60]">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="mb-4">
              <h3 className="text-lg font-medium mb-2">Confirm Action</h3>
              <p className="text-sm text-gray-600">
                Are you sure you want to mark {prescriptionOrders.filter(order => order.selected).length} prescription(s) as ordered?
              </p>
            </div>
            <div className="flex justify-end space-x-2">
              <button 
                onClick={handleCancelStatusChange}
                className="px-4 py-2 border border-gray-300 rounded text-sm"
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirmStatusChange}
                className="px-4 py-2 bg-blue-600 text-white rounded text-sm"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logs Modal */}
      {showLogsModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Activity Logs</h3>
              <button 
                onClick={handleCloseLogsModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="mb-4 max-h-96 overflow-y-auto">
              {selectedOrderLogs.length > 0 ? (
                <div className="space-y-3">
                  {selectedOrderLogs.map(log => (
                    <div key={log.id} className="border-b border-gray-200 pb-3">
                      <div className="flex justify-between items-start">
                        <div className="font-medium">{log.action}</div>
                        <div className="text-xs text-gray-500">
                          {log.timestamp.toLocaleString()}
                        </div>
                      </div>
                      <div className="text-sm">{log.details}</div>
                      <div className="text-xs text-gray-500">By: {log.user}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500">
                  No logs available for this prescription.
                </div>
              )}
            </div>
            <div className="flex justify-end">
              <button 
                onClick={handleCloseLogsModal}
                className="px-4 py-2 bg-blue-600 text-white rounded text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </WireframeLayout>
  );
} 
