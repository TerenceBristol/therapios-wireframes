'use client';

import React, { useState } from 'react';
import { Users, Building2, Settings, BarChart3, HelpCircle, Lightbulb, CheckCircle } from 'lucide-react';
import TeamSection from './components/TeamSection';
import TeamTailorSection from './components/TeamTailorSection';
import ECHSection from './components/ECHSection';
import ECHDetailsSection from './components/ECHDetailsSection';
import UserDetailsSection from './components/UserDetailsSection';
import ResourceManagementSection from './components/ResourceManagementSection';

export default function ECHResourceManagementPage() {
  const [activeTab, setActiveTab] = useState('ech-overview');
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editingECHId, setEditingECHId] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [showTeamTailor, setShowTeamTailor] = useState(false);
  const [showMondayECHs, setShowMondayECHs] = useState(false);
  
  // Enhanced navigation state for cross-component integration
  const [navigationContext, setNavigationContext] = useState({
    highlightTherapistId: null as string | null,
    prefilledECH: null as string | null,
    prefilledTherapyType: null as string | null,
    showSuccessMessage: null as string | null
  });

  const tabs = [
    { id: 'ech-overview', label: 'ECH', icon: Building2, description: 'View and manage elderly care homes' },
    { id: 'team', label: 'Team', icon: Users, description: 'Manage therapist profiles and information' },
    { id: 'resource-management', label: 'Resource Allocation', icon: BarChart3, description: 'Find optimal therapist-ECH matches' },
  ];

  const handleEditUser = (userId: string) => {
    setEditingUserId(userId);
    setActiveTab('user-details');
  };

  const handleEditECH = (echId: string) => {
    setEditingECHId(echId);
    setActiveTab('ech-details');
  };

  const handleBackToTeam = () => {
    setEditingUserId(null);
    setActiveTab('team');
  };

  const handleShowTeamTailor = () => {
    setShowTeamTailor(true);
  };

  const handleBackFromTeamTailor = () => {
    setShowTeamTailor(false);
  };

  const handleShowMondayECHs = () => {
    setShowMondayECHs(true);
  };

  const handleBackFromMondayECHs = () => {
    setShowMondayECHs(false);
  };

  const handleBackToECH = () => {
    setEditingECHId(null);
    setActiveTab('ech-overview');
  };

  // Enhanced navigation handlers for cross-component integration
  const handleNavigateToTherapist = (therapistId: string, source: 'flow' | 'teamtailor' = 'flow') => {
    setNavigationContext({ 
      ...navigationContext, 
      highlightTherapistId: therapistId,
      showSuccessMessage: 'Therapist profile highlighted'
    });
    
    if (source === 'teamtailor') {
      setShowTeamTailor(true);
    } else {
      setShowTeamTailor(false);
    }
    
    setActiveTab('team');
    
    // Clear highlight after animation
    setTimeout(() => {
      setNavigationContext(prev => ({ ...prev, showSuccessMessage: null }));
    }, 3000);
  };

  const handleNavigateToResourceAllocation = (echId?: string, therapyType?: string) => {
    setNavigationContext({
      ...navigationContext,
      prefilledECH: echId || null,
      prefilledTherapyType: therapyType || null,
      showSuccessMessage: echId ? 'Search pre-populated with ECH selection' : 'Resource allocation opened'
    });
    
    setActiveTab('resource-management');
    
    // Clear message after animation
    setTimeout(() => {
      setNavigationContext(prev => ({ ...prev, showSuccessMessage: null }));
    }, 3000);
  };

  const handleFindTherapistsForECH = (echId: string, therapyTypes: string[]) => {
    // Set first therapy type as prefilled
    const primaryTherapyType = therapyTypes[0] || '';
    
    setNavigationContext({
      ...navigationContext,
      prefilledECH: echId,
      prefilledTherapyType: primaryTherapyType,
      showSuccessMessage: `Finding therapists for ${echId} - ${primaryTherapyType}`
    });
    
    setActiveTab('resource-management');
    
    setTimeout(() => {
      setNavigationContext(prev => ({ ...prev, showSuccessMessage: null }));
    }, 3000);
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'ech-overview':
        return <ECHSection 
          onEditECH={handleEditECH} 
          onFindTherapists={handleFindTherapistsForECH}
          showMondayECHs={showMondayECHs}
          onShowMondayECHs={handleShowMondayECHs}
          onBackFromMondayECHs={handleBackFromMondayECHs}
        />;
      case 'ech-details':
        return <ECHDetailsSection 
          echId={editingECHId || ''} 
          onBack={handleBackToECH}
          onFindTherapists={handleFindTherapistsForECH}
        />;
      case 'team':
        return showTeamTailor ? 
          <TeamTailorSection 
            onBack={handleBackFromTeamTailor}
            onFindMatches={handleNavigateToResourceAllocation}
            highlightTherapistId={navigationContext.highlightTherapistId}
          /> : 
          <TeamSection 
            onEditUser={handleEditUser} 
            onShowTeamTailor={handleShowTeamTailor}
            onFindMatches={handleNavigateToResourceAllocation}
            highlightTherapistId={navigationContext.highlightTherapistId}
          />;
      case 'user-details':
        return <UserDetailsSection 
          userId={editingUserId || undefined} 
          onBack={handleBackToTeam}
          onFindMatches={handleNavigateToResourceAllocation}
        />;
      case 'resource-management':
        return <ResourceManagementSection 
          onNavigateToTherapist={handleNavigateToTherapist}
          prefilledECH={navigationContext.prefilledECH}
          prefilledTherapyType={navigationContext.prefilledTherapyType}
        />;
      default:
        return <ECHSection 
          onEditECH={handleEditECH} 
          onFindTherapists={handleFindTherapistsForECH}
          showMondayECHs={showMondayECHs}
          onShowMondayECHs={handleShowMondayECHs}
          onBackFromMondayECHs={handleBackFromMondayECHs}
        />;
    }
  };

  const getCurrentTabInfo = () => {
    const currentTab = tabs.find(tab => tab.id === activeTab);
    if (activeTab === 'user-details') return { label: 'Edit Therapist', description: 'Update therapist information and settings' };
    if (activeTab === 'ech-details') return { label: 'Edit ECH', description: 'Update elderly care home information' };
    return currentTab || { label: 'ECH Overview', description: 'View and manage elderly care homes' };
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Navigation */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-[#0f2c59] rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">T</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-[#0f2c59]">Therapios</h1>
                  <p className="text-sm text-gray-600">ECH & Resource Management System</p>
                </div>
              </div>
              
              {/* Navigation in Header */}
              <nav className="flex space-x-8" aria-label="Tabs">
                {tabs.map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`
                        py-2 px-1 border-b-2 font-medium text-sm transition-colors relative
                        ${isActive
                          ? 'border-[#0f2c59] text-[#0f2c59]'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }
                      `}
                      title={tab.description}
                    >
                      <span>{tab.label}</span>
                      {/* Navigation indicator */}
                      {isActive && navigationContext.showSuccessMessage && (
                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-green-500 text-white text-xs px-2 py-1 rounded-md whitespace-nowrap animate-bounce">
                          ✓ Integrated
                        </div>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Success message display */}
              {navigationContext.showSuccessMessage && (
                <div className="flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1 rounded-lg text-sm animate-fade-in">
                  <CheckCircle size={16} />
                  <span>{navigationContext.showSuccessMessage}</span>
                </div>
              )}
              
              <button
                onClick={() => setShowHelp(!showHelp)}
                className="flex items-center gap-2 text-gray-600 hover:text-[#0f2c59] transition-colors"
                title="Show help and tips"
              >
                <HelpCircle size={20} />
                <span className="hidden sm:inline">Help</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Help Panel */}
      {showHelp && (
        <div className="bg-blue-50 border-b border-blue-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-start gap-3">
              <Lightbulb className="text-blue-600 mt-0.5" size={20} />
              <div>
                <h3 className="font-medium text-blue-900 mb-2">Phase 23: Final Integration Tips</h3>
                <div className="text-sm text-blue-800 space-y-1">
                  {activeTab === 'ech-overview' && (
                    <>
                      <p>• Click "Find Therapists" to pre-populate Resource Allocation with ECH needs</p>
                      <p>• View prescription analytics with color-coded therapy type breakdowns</p>
                    </>
                  )}
                  {activeTab === 'team' && (
                    <>
                      <p>• Use "Find Matches" buttons to search for compatible ECHs for each therapist</p>
                      <p>• Navigate seamlessly between Flow and Team Tailor candidates</p>
                    </>
                  )}
                  {activeTab === 'resource-management' && (
                    <>
                      <p>• Use "View Profile" buttons to navigate directly to therapist details</p>
                      <p>• Try Reverse Matching to find ECHs compatible with specific therapists</p>
                      <p>• Cross-navigation maintains context across all sections</p>
                    </>
                  )}
                  {(activeTab === 'user-details' || activeTab === 'ech-details') && (
                    <p>• Use "Find Matches" to discover optimal placement opportunities</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="transition-all duration-300 ease-in-out">
          {renderActiveTab()}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-600">
              © 2024 Therapios. Advanced ECH & Resource Management System v2.3 - Final Integration
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-600">
              <span>✅ Cross-Navigation Enabled</span>
              <span>📊 Real-time Integration</span>
              <span>🚀 Enhanced UX</span>
            </div>
          </div>
        </div>
      </footer>
      
      {/* Enhanced styles for animations */}
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
} 