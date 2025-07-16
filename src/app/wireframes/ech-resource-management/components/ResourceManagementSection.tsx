'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Search, Filter, MapPin, Clock, Phone, Car, Bike, Bus, AlertTriangle, CheckCircle, SlidersHorizontal, ArrowLeftRight, Loader2 } from 'lucide-react';
import { mondayECHs } from '../data/mondayECHs';

// Sample ECH data (simplified, removed capacity/occupancy)
const sampleECHs = [
  { id: 'E3', name: 'Alpenland Marzahn', location: 'Berlin' },
  { id: 'E5', name: 'Caritas Hospitz Katarinhaus', location: 'Berlin' },
  { id: 'E8', name: 'FSE Pflegeeinrichtung Treptow', location: 'Berlin' },
  { id: 'E9', name: 'Haus am ZernseeSenioren', location: 'Berlin' },
  { id: 'E11', name: 'Haus El Joie de Vivre Wildau', location: 'Berlin' },
  { id: 'E12', name: 'WG Zeuthen', location: 'Berlin' },
  { id: 'E13', name: 'Haus Fontanehof', location: 'Berlin' },
  { id: 'E18', name: 'Korian Haus am Wiesengrund', location: 'Munich' },
  { id: 'E20', name: 'DOMICIL Seniorenpflegeheim', location: 'Frankfurt' },
  { id: 'E21', name: 'Theodorus Senioren Centrum', location: 'Berlin' }
];



// Updated Flow therapists data (from TeamSection)
const flowTherapists = [
  {
    id: 1,
    name: 'Anna Schmidt',
    email: 'anna.schmidt@therapios.com',
    phone: '+49 30 1234567',
    role: 'THERAPIST',
    location: 'Berlin',
    address: 'Unter den Linden 45, 10117 Berlin-Mitte',
    type: 'Physiotherapy',
    transport: ['Public transport', 'Own car'],
    status: 'Active',
    utilization: 45,
    source: 'Flow'
  },
  {
    id: 2,
    name: 'Michael Weber',
    email: 'michael.weber@therapios.com',
    phone: '+49 89 2345678',
    role: 'THERAPIST',
    location: 'Munich',
    address: 'Marienplatz 12, 80331 München-Altstadt',
    type: 'Occupational Therapy',
    transport: ['Public transport'],
    status: 'Active',
    utilization: 72,
    source: 'Flow'
  },
  {
    id: 3,
    name: 'Sarah Klein',
    email: 'sarah.klein@therapios.com',
    phone: '+49 40 3456789',
    role: 'THERAPIST',
    location: 'Hamburg',
    address: 'Reeperbahn 89, 20359 Hamburg-St. Pauli',
    type: 'Speech Therapy',
    transport: ['Public transport', 'Motorcycle'],
    status: 'Active',
    utilization: 83,
    source: 'Flow'
  },
  {
    id: 4,
    name: 'Thomas Müller',
    email: 'thomas.mueller@therapios.com',
    phone: '+49 69 4567890',
    role: 'THERAPIST',
    location: 'Frankfurt',
    address: 'Zeil 67, 60313 Frankfurt am Main-Innenstadt',
    type: 'Physiotherapy',
    transport: ['Public transport', 'Own car'],
    status: 'Active',
    utilization: 28,
    source: 'Flow'
  },
  {
    id: 5,
    name: 'Julia Hoffmann',
    email: 'julia.hoffmann@therapios.com',
    phone: '+49 221 5678901',
    role: 'THERAPIST',
    location: 'Cologne',
    address: 'Schildergasse 23, 50667 Köln-Innenstadt',
    type: 'Occupational Therapy',
    transport: ['Public transport'],
    status: 'Inactive',
    utilization: 0,
    source: 'Flow'
  },
  {
    id: 6,
    name: 'Lars Becker',
    email: 'lars.becker@therapios.com',
    phone: '+49 30 6789012',
    role: 'THERAPIST',
    location: 'Berlin',
    address: 'Friedrichstraße 156, 10117 Berlin-Mitte',
    type: 'Physiotherapy',
    transport: ['Public transport', 'Motorcycle'],
    status: 'Active',
    utilization: 91,
    source: 'Flow'
  },
  {
    id: 7,
    name: 'Emma Richter',
    email: 'emma.richter@therapios.com',
    phone: '+49 89 7890123',
    role: 'THERAPIST',
    location: 'Munich',
    address: 'Leopoldstraße 78, 80802 München-Schwabing',
    type: 'Speech Therapy',
    transport: ['Public transport', 'Own car'],
    status: 'Active',
    utilization: 56,
    source: 'Flow'
  },
  {
    id: 8,
    name: 'Felix Wagner',
    email: 'felix.wagner@therapios.com',
    phone: '+49 40 8901234',
    role: 'THERAPIST',
    location: 'Hamburg',
    address: 'Mönckebergstraße 34, 20095 Hamburg-Altstadt',
    type: 'Physiotherapy',
    transport: ['Public transport'],
    status: 'Active',
    utilization: 67,
    source: 'Flow'
  },
  {
    id: 9,
    name: 'Sophie Fischer',
    email: 'sophie.fischer@therapios.com',
    phone: '+49 69 9012345',
    role: 'THERAPIST',
    location: 'Frankfurt',
    address: 'Goethestraße 91, 60313 Frankfurt am Main-Innenstadt',
    type: 'Occupational Therapy',
    transport: ['Public transport', 'Own car'],
    status: 'Active',
    utilization: 38,
    source: 'Flow'
  },
  {
    id: 10,
    name: 'Leon Zimmermann',
    email: 'leon.zimmermann@therapios.com',
    phone: '+49 221 0123456',
    role: 'THERAPIST',
    location: 'Cologne',
    address: 'Hohe Straße 145, 50667 Köln-Innenstadt',
    type: 'Speech Therapy',
    transport: ['Public transport', 'Motorcycle'],
    status: 'Active',
    utilization: 79,
    source: 'Flow'
  }
];

// Team Tailor therapists data (from TeamTailorSection)
const teamTailorTherapists = [
  {
    id: 19,
    name: 'Maximilian Hoffmann',
    email: 'maximilian.hoffmann@teamtailor.com',
    phone: '+49 30 1112233',
    role: 'THERAPIST',
    location: 'Berlin',
    address: 'Alexanderplatz 5, 10178 Berlin-Mitte',
    type: 'Physiotherapy',
    transport: ['Public transport', 'Own car'],
    status: 'Active',
    utilization: 28,
    source: 'Team Tailor'
  },
  {
    id: 20,
    name: 'Sophia Becker',
    email: 'sophia.becker@teamtailor.com',
    phone: '+49 89 2223344',
    role: 'THERAPIST',
    location: 'Munich',
    address: 'Viktualienmarkt 15, 80331 München-Altstadt',
    type: 'Occupational Therapy',
    transport: ['Public transport', 'Motorcycle'],
    status: 'Active',
    utilization: 32,
    source: 'Team Tailor'
  },
  {
    id: 21,
    name: 'Alexander Müller',
    email: 'alexander.mueller@teamtailor.com',
    phone: '+49 40 3334455',
    role: 'THERAPIST',
    location: 'Hamburg',
    address: 'Hafencity 25, 20457 Hamburg-Hafencity',
    type: 'Speech Therapy',
    transport: ['Public transport'],
    status: 'Active',
    utilization: 26,
    source: 'Team Tailor'
  },
  {
    id: 22,
    name: 'Isabella Weber',
    email: 'isabella.weber@teamtailor.com',
    phone: '+49 69 4445566',
    role: 'THERAPIST',
    location: 'Frankfurt',
    address: 'Römerberg 8, 60311 Frankfurt am Main-Altstadt',
    type: 'Physiotherapy',
    transport: ['Public transport', 'Own car'],
    status: 'Active',
    utilization: 35,
    source: 'Team Tailor'
  },
  {
    id: 23,
    name: 'Sebastian Klein',
    email: 'sebastian.klein@teamtailor.com',
    phone: '+49 221 5556677',
    role: 'THERAPIST',
    location: 'Cologne',
    address: 'Dom Platz 12, 50667 Köln-Innenstadt',
    type: 'Occupational Therapy',
    transport: ['Public transport', 'Motorcycle'],
    status: 'Active',
    utilization: 29,
    source: 'Team Tailor'
  }
];

interface ResourceManagementSectionProps {
  onNavigateToTherapist?: (therapistId: string, source?: 'flow' | 'teamtailor') => void;
  prefilledECH?: string | null;
  prefilledTherapyType?: string | null;
}

export default function ResourceManagementSection({ 
  onNavigateToTherapist,
  prefilledECH,
  prefilledTherapyType 
}: ResourceManagementSectionProps) {
  // Tab state - now only 2 tabs: find-therapists and find-ech
  const [activeTab, setActiveTab] = useState<'find-therapists' | 'find-ech'>('find-therapists');
  
  // Therapist source selection for Find Therapists tab
  const [therapistSource, setTherapistSource] = useState<'flow' | 'team-tailor'>('flow');
  
  // Search configuration
  const [searchMode, setSearchMode] = useState<'ech' | 'address'>('ech');
  const [echSource, setEchSource] = useState<'regular' | 'monday'>('regular');
  const [selectedECH, setSelectedECH] = useState('');
  const [manualAddress, setManualAddress] = useState('');
  const [selectedTherapyType, setSelectedTherapyType] = useState('');
  const [showResults, setShowResults] = useState(false);
  
  // Reverse matching state (for Find ECH tab)
  const [selectedTherapist, setSelectedTherapist] = useState('');
  const [reverseTherapistSource, setReverseTherapistSource] = useState<'flow' | 'team-tailor'>('flow');
  const [reverseSelectedTherapyType, setReverseSelectedTherapyType] = useState('');
  const [includeMondayECHs, setIncludeMondayECHs] = useState(true); // Include Monday.com ECHs in reverse matching
  
  // Travel duration filter (simplified)
  const [maxTravelTime, setMaxTravelTime] = useState(45); // minutes
  
  // Loading state for search operations
  const [isSearching, setIsSearching] = useState(false);

  // Effect to handle prefilled values from cross-navigation
  useEffect(() => {
    if (prefilledECH) {
      setSelectedECH(prefilledECH);
      setSearchMode('ech');
    }
    if (prefilledTherapyType) {
      setSelectedTherapyType(prefilledTherapyType);
    }
    // Auto-search if both values are prefilled
    if (prefilledECH && prefilledTherapyType) {
      setTimeout(() => {
        setShowResults(true);
      }, 500);
    }
  }, [prefilledECH, prefilledTherapyType]);

  // Effect to reset selected therapist when therapy type or source changes in reverse search
  useEffect(() => {
    setSelectedTherapist('');
  }, [reverseSelectedTherapyType, reverseTherapistSource]);

  // Effect to reset selected ECH when ECH source changes
  useEffect(() => {
    setSelectedECH('');
  }, [echSource]);

  const therapyTypes = ['Physiotherapy', 'Occupational Therapy', 'Speech Therapy'];

  // Get current ECH pool based on ECH source
  const currentECHs = echSource === 'monday' ? mondayECHs : sampleECHs;

  // Get current therapist pool based on therapist source or reverse source
  const currentTherapists = activeTab === 'find-ech' 
    ? (reverseTherapistSource === 'flow' ? flowTherapists : teamTailorTherapists)
    : (therapistSource === 'flow' ? flowTherapists : teamTailorTherapists);

  // Get all therapists for reverse matching dropdown
  const allTherapists = [...flowTherapists, ...teamTailorTherapists];

  // Get available therapy types for reverse search
  const availableReverseTherapyTypes = useMemo(() => {
    const currentPool = reverseTherapistSource === 'flow' ? flowTherapists : teamTailorTherapists;
    const types = [...new Set(currentPool.filter(t => t.status === 'Active').map(t => t.type))];
    return types.sort();
  }, [reverseTherapistSource]);

  // Get filtered therapists for reverse search based on therapy type
  const filteredReverseTherapists = useMemo(() => {
    const currentPool = reverseTherapistSource === 'flow' ? flowTherapists : teamTailorTherapists;
    return currentPool.filter(t => 
      t.status === 'Active' && 
      (reverseSelectedTherapyType === '' || t.type === reverseSelectedTherapyType)
    );
  }, [reverseTherapistSource, reverseSelectedTherapyType]);

  // Simplified Matching Algorithm with travel time consideration
  const calculateMatchScore = (therapist: any) => {
    let score = 0;

    // Transportation Score (0-40 points)
    if (therapist.transport.includes('Own car')) score += 40;
    else if (therapist.transport.includes('Motorcycle')) score += 35;
    else if (therapist.transport.includes('Public transport')) score += 25;

    // Utilization/Availability Score (0-40 points)
    if (therapist.utilization <= 50) score += 40;
    else if (therapist.utilization <= 70) score += 30;
    else if (therapist.utilization <= 85) score += 20;
    else score += 10;

    // Travel time bonus (0-20 points)
    // Simulate travel time based on same city vs different city
    const targetLocation = searchMode === 'ech' 
      ? currentECHs.find(ech => ech.id === selectedECH)?.location 
      : 'Berlin'; // Default for manual address
    
    if (therapist.location === targetLocation) {
      score += 20; // Same city
    } else {
      score += 5; // Different city
    }

    return Math.min(score, 100);
  };

  // Reverse matching: calculate ECH compatibility score
  const calculateECHMatchScore = (ech: any, therapist: any) => {
    let score = 0;

    // Location compatibility (0-50 points)
    if (ech.location === therapist.location) {
      score += 50; // Same city is ideal
    } else {
      score += 20; // Different city but still possible
    }

    // Transportation suitability (0-30 points)
    if (therapist.transport.includes('Own car')) score += 30;
    else if (therapist.transport.includes('Motorcycle')) score += 25;
    else if (therapist.transport.includes('Public transport')) score += 20;

    // Utilization factor (0-20 points)
    if (therapist.utilization <= 50) score += 20;
    else if (therapist.utilization <= 70) score += 15;
    else if (therapist.utilization <= 85) score += 10;
    else score += 5;

    return Math.min(score, 100);
  };

  // Enhanced ECH matching score for Monday.com ECHs (includes therapy type compatibility)
  const calculateMondayECHMatchScore = (ech: any, therapist: any) => {
    let score = 0;

    // Therapy type compatibility (0-30 points)
    if (ech.interestedTherapyTypes && ech.interestedTherapyTypes.includes(therapist.type)) {
      score += 30; // Perfect therapy type match
    } else {
      return 0; // No match if therapy type doesn't align
    }

    // Location compatibility (0-40 points) 
    if (ech.location === therapist.location) {
      score += 40; // Same city is ideal
    } else {
      score += 15; // Different city but still possible
    }

    // Transportation suitability (0-20 points)
    if (therapist.transport.includes('Own car')) score += 20;
    else if (therapist.transport.includes('Motorcycle')) score += 17;
    else if (therapist.transport.includes('Public transport')) score += 14;

    // Utilization factor (0-10 points)
    if (therapist.utilization <= 50) score += 10;
    else if (therapist.utilization <= 70) score += 8;
    else if (therapist.utilization <= 85) score += 5;
    else score += 2;

    return Math.min(score, 100);
  };

  // Get match quality label
  const getMatchQuality = (score: number) => {
    if (score >= 80) return { label: 'Excellent', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' };
    if (score >= 65) return { label: 'Good', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' };
    if (score >= 50) return { label: 'Fair', color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' };
    return { label: 'Poor', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' };
  };

  // Simple hash function for deterministic "random" numbers
  const hashString = (str: string): number => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  };

  // Calculate travel times for each transportation method (deterministic)
  const calculateTravelTimes = (therapist: any, targetLocation: string, echId?: string) => {
    // Create deterministic seed from therapist location + target location
    const locationSeed = hashString(therapist.location + targetLocation + (echId || 'manual'));
    const variation = (locationSeed % 30); // 0-29 variation
    
    const baseTime = therapist.location === targetLocation ? 
      15 + variation : // 15-44 min for same city
      45 + (locationSeed % 60); // 45-104 min for different city

    const travelTimes: { [key: string]: number } = {};
    
    therapist.transport.forEach((method: string) => {
      // Add method-specific deterministic variation
      const methodSeed = hashString(therapist.id + method + targetLocation + (echId || ''));
      const methodVariation = (methodSeed % 10) - 5; // -5 to +4 minute variation
      
      let baseTimeForMethod = baseTime;
      switch (method) {
        case 'Own car':
          baseTimeForMethod = Math.round(baseTime * 1.0); // 1x multiplier
          break;
        case 'Motorcycle':
          baseTimeForMethod = Math.round(baseTime * 0.8); // 0.8x multiplier
          break;
        case 'Public transport':
          baseTimeForMethod = Math.round(baseTime * 1.5); // 1.5x multiplier
          break;
        default:
          baseTimeForMethod = baseTime;
      }
      
      travelTimes[method] = Math.max(5, baseTimeForMethod + methodVariation); // Minimum 5 minutes
    });

    return travelTimes;
  };

  // Filter and rank therapists (for normal matching)
  const matchedTherapists = useMemo(() => {
    if (activeTab === 'find-ech') return [];
    if ((!selectedECH && !manualAddress) || !selectedTherapyType) return [];

    const targetLocation = searchMode === 'ech' 
      ? currentECHs.find(ech => ech.id === selectedECH)?.location || ''
      : 'Berlin'; // Default location for manual address

    return currentTherapists
      .filter(therapist => (
        therapist.type === selectedTherapyType && // Strict therapy type filter
        therapist.status === 'Active'
      ))
      .map(therapist => {
        const travelTimes = calculateTravelTimes(therapist, targetLocation, selectedECH);
        const fastestTime = Math.min(...Object.values(travelTimes));
        
        return {
          ...therapist,
          matchScore: calculateMatchScore(therapist),
          travelTimes,
          fastestTravelTime: fastestTime
        };
      })
      .filter(therapist => therapist.fastestTravelTime <= maxTravelTime)
      .sort((a, b) => b.matchScore - a.matchScore);
  }, [activeTab, searchMode, selectedECH, manualAddress, selectedTherapyType, maxTravelTime, currentTherapists]);

  // Filter and rank ECHs (for reverse matching)
  const matchedECHs = useMemo(() => {
    if (activeTab !== 'find-ech' || !selectedTherapist) return [];

    const therapist = allTherapists.find(t => t.id.toString() === selectedTherapist);
    if (!therapist) return [];

    // Combine Flow ECHs and Monday.com ECHs based on toggle
    const echsToSearch = [];
    
    // Always include Flow ECHs
    const flowECHs = sampleECHs.map(ech => ({
      ...ech,
      source: 'flow' as const
    }));
    echsToSearch.push(...flowECHs);
    
    // Include Monday.com ECHs if toggle is enabled
    if (includeMondayECHs) {
      const mondayECHsWithSource = mondayECHs.map(ech => ({
        ...ech,
        source: 'monday' as const
      }));
      echsToSearch.push(...mondayECHsWithSource);
    }

    return echsToSearch
      .map(ech => {
        // Calculate deterministic travel time for fastest transportation method
        const travelTimes = calculateTravelTimes(therapist, ech.location, ech.id);
        const fastestTime = Math.min(...Object.values(travelTimes));
        
        // Use appropriate matching algorithm based on ECH source
        const matchScore = ech.source === 'monday' 
          ? calculateMondayECHMatchScore(ech, therapist)
          : calculateECHMatchScore(ech, therapist);
        
        return {
          ...ech,
          matchScore,
          travelTime: fastestTime
        };
      })
      .filter(ech => ech.travelTime <= maxTravelTime && ech.matchScore > 0) // Filter out 0-score matches (no therapy type match for Monday ECHs)
      .sort((a, b) => b.matchScore - a.matchScore);
  }, [selectedTherapist, maxTravelTime, allTherapists, includeMondayECHs]);

  const handleSearch = () => {
    setIsSearching(true);
    // Simulate search delay for better UX
    setTimeout(() => {
      setIsSearching(false);
      setShowResults(true);
    }, 1000);
  };



  const getTransportIcons = (transports: string[]) => {
    return transports.map((transport, index) => {
      let icon;
      switch (transport) {
        case 'Own car': icon = <Car size={14} key={index} />; break;
        case 'Motorcycle': icon = <Bike size={14} key={index} />; break;
        case 'Public transport': icon = <Bus size={14} key={index} />; break;
        default: icon = <Car size={14} key={index} />;
      }
      return <span key={index} className="text-gray-600 mr-1">{icon}</span>;
    });
  };

  const getUtilizationBadge = (utilization: number) => {
    if (utilization >= 85) return 'bg-red-100 text-red-800';
    if (utilization >= 70) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  // Helper function to extract city from address
  const extractCity = (address: string) => {
    const parts = address.split(',');
    if (parts.length >= 2) {
      // Extract city from "Street, City" or "Street, City-District"
      const cityPart = parts[1].trim();
      return cityPart.split('-')[0].trim();
    }
    return address.split(' ')[0]; // Fallback
  };

  // Helper function to render transport methods with times
  const getTransportWithTimes = (therapist: any) => {
    const transportMethods = therapist.transport.map((method: string) => ({
      method,
      time: therapist.travelTimes[method],
      icon: method === 'Own car' ? <Car size={14} /> : 
            method === 'Motorcycle' ? <Bike size={14} /> : <Bus size={14} />
    })).sort((a: any, b: any) => a.time - b.time);

    return (
      <div className="flex flex-wrap items-center gap-2">
        {transportMethods.map((transport: any, index: number) => {
          const isFastest = index === 0;
          return (
            <span
              key={transport.method}
              className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${
                isFastest 
                  ? 'bg-green-100 text-green-800 font-bold' 
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              <span className={isFastest ? 'text-green-600' : 'text-gray-500'}>
                {transport.icon}
              </span>
              <span>{transport.time}m</span>
            </span>
          );
        })}
      </div>
    );
  };

  // Helper function to get ECH source badge
  const getECHSourceBadge = (source: 'flow' | 'monday') => {
    return source === 'monday' ? (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
        Monday.com
      </span>
    ) : (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
        Flow
      </span>
    );
  };

  // Helper function to get sales status badge for Monday.com ECHs
  const getSalesStatusBadge = (status: string) => {
    const statusStyles: { [key: string]: string } = {
      'Interessiert': 'bg-purple-100 text-purple-800',
      'IP Meeting': 'bg-blue-100 text-blue-800',
      'Onboarding (Therapeutensuche)': 'bg-green-100 text-green-800',
      'Onboarding': 'bg-yellow-100 text-yellow-800',
      'Aktiv (Therapeutensuche)': 'bg-blue-100 text-blue-800',
      'Aktiv': 'bg-green-100 text-green-800',
      'Nicht interessiert': 'bg-amber-100 text-amber-800',
      'Lost': 'bg-purple-100 text-purple-800',
      'Inaktiv (Lost)': 'bg-pink-100 text-pink-800',
      'Von uns abgelehnt': 'bg-pink-100 text-pink-800',
    };

    const style = statusStyles[status] || 'bg-gray-100 text-gray-800';
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${style}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-[#0f2c59]">Smart Therapist Matching</h2>
          <p className="text-gray-600">Find compatible therapists for elderly care homes</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg border">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('find-therapists')}
            className={`flex-1 py-3 px-4 text-sm font-medium text-center border-b-2 transition-colors ${
              activeTab === 'find-therapists'
                ? 'border-[#0f2c59] text-[#0f2c59] bg-blue-50'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              Find Therapists
            </div>
          </button>
          <button
            onClick={() => setActiveTab('find-ech')}
            className={`flex-1 py-3 px-4 text-sm font-medium text-center border-b-2 transition-colors ${
              activeTab === 'find-ech'
                ? 'border-[#C2AC72] text-[#C2AC72] bg-[#C2AC72]/10'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <ArrowLeftRight size={14} className="text-[#C2AC72]" />
              Find ECH
            </div>
          </button>
        </div>

        {/* Search Configuration */}
        <div className="p-6">
          {activeTab === 'find-ech' ? (
            // Reverse Matching Configuration
            <>
              <h3 className="text-lg font-semibold text-[#0f2c59] mb-4">Reverse Search Configuration</h3>
              <p className="text-sm text-gray-600 mb-4">Select a therapist to find compatible ECH facilities</p>
              
              {/* Therapy Type Selection First */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Required Therapy Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={reverseSelectedTherapyType}
                  onChange={(e) => setReverseSelectedTherapyType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0f2c59] focus:border-transparent"
                >
                  <option value="">Choose therapy type...</option>
                  {availableReverseTherapyTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              {/* Therapist Source Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Therapist Source</label>
                <div className="flex gap-4">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      value="flow"
                      checked={reverseTherapistSource === 'flow'}
                      onChange={() => setReverseTherapistSource('flow')}
                      className="mr-2 text-[#0f2c59] focus:ring-[#0f2c59]"
                    />
                    <span className="text-sm font-medium text-gray-700">Flow Therapists</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      value="team-tailor"
                      checked={reverseTherapistSource === 'team-tailor'}
                      onChange={() => setReverseTherapistSource('team-tailor')}
                      className="mr-2 text-[#0f2c59] focus:ring-[#0f2c59]"
                    />
                    <span className="text-sm font-medium text-gray-700">Team Tailor Candidates</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 mb-6">
                {/* Therapist Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Therapist <span className="text-red-500">*</span>
                  </label>
                  {reverseSelectedTherapyType === '' ? (
                    <select
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                    >
                      <option value="">Please select therapy type first...</option>
                    </select>
                  ) : filteredReverseTherapists.length === 0 ? (
                    <select
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                    >
                      <option value="">No therapists available for {reverseSelectedTherapyType}</option>
                    </select>
                  ) : (
                    <select
                      value={selectedTherapist}
                      onChange={(e) => setSelectedTherapist(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0f2c59] focus:border-transparent"
                    >
                      <option value="">Choose a therapist...</option>
                      {filteredReverseTherapists.map(therapist => (
                        <option key={therapist.id} value={therapist.id.toString()}>
                          {therapist.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              {/* Therapist Info Panel */}
              {selectedTherapist && reverseSelectedTherapyType && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-6">
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Therapy Type:</span>
                      <span className="px-2 py-1 bg-[#C2AC72] text-white text-xs font-medium rounded-full">
                        {reverseSelectedTherapyType}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Utilization:</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {filteredReverseTherapists.find(t => t.id.toString() === selectedTherapist)?.utilization}%
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* ECH Source Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">ECH Sources to Include</label>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-4">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includeMondayECHs}
                        onChange={(e) => setIncludeMondayECHs(e.target.checked)}
                        className="mr-2 text-purple-600 focus:ring-purple-600 rounded"
                      />
                      <span className="text-sm font-medium text-gray-700">Include Monday.com ECHs</span>
                      <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
                        {mondayECHs.length} ECHs
                      </span>
                    </label>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    Flow ECHs are always included ({sampleECHs.length} ECHs). Toggle Monday.com ECHs to expand search coverage.
                  </div>
                </div>
              </div>

              {/* Travel Duration Slider */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Maximum Travel Time to ECH: {maxTravelTime} minutes
                </label>
                <div className="px-3">
                  <input
                    type="range"
                    min="15"
                    max="120"
                    step="15"
                    value={maxTravelTime}
                    onChange={(e) => setMaxTravelTime(Number(e.target.value))}
                    className="w-full accent-[#C2AC72]"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>15 min</span>
                    <span>30 min</span>
                    <span>45 min</span>
                    <span>60 min</span>
                    <span>90 min</span>
                    <span>120 min</span>
                  </div>
                </div>
              </div>

              {/* Search Button */}
              <div className="flex justify-start">
                <button
                  onClick={handleSearch}
                  disabled={!reverseSelectedTherapyType || !selectedTherapist || isSearching}
                  className="bg-[#C2AC72] text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-[#B09B65] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSearching ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                  {isSearching ? 'Searching...' : 'Find Compatible ECHs'}
                </button>
              </div>
            </>
                      ) : (
            // Normal Matching Configuration
            <>
              <h3 className="text-lg font-semibold text-[#0f2c59] mb-4">Search Configuration</h3>
              
              {/* Address Input Options */}
              <div className="mb-4">
                <div className="flex gap-4">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      value="ech"
                      checked={searchMode === 'ech' && echSource === 'regular'}
                      onChange={() => {
                        setSearchMode('ech');
                        setEchSource('regular');
                      }}
                      className="mr-2 text-[#0f2c59] focus:ring-[#0f2c59]"
                    />
                    <span className="text-sm font-medium text-gray-700">Select from ECH List</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      value="monday"
                      checked={searchMode === 'ech' && echSource === 'monday'}
                      onChange={() => {
                        setSearchMode('ech');
                        setEchSource('monday');
                      }}
                      className="mr-2 text-orange-600 focus:ring-orange-600"
                    />
                    <span className="text-sm font-medium text-gray-700">Select from Monday.com ECH List</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      value="address"
                      checked={searchMode === 'address'}
                      onChange={() => setSearchMode('address')}
                      className="mr-2 text-[#0f2c59] focus:ring-[#0f2c59]"
                    />
                    <span className="text-sm font-medium text-gray-700">Enter Custom Address</span>
                  </label>
                </div>
              </div>

              <div className="mb-4">
                {/* Location Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {searchMode === 'ech' ? `Select ECH${echSource === 'monday' ? ' (Monday.com)' : ''}` : 'Enter Address'} <span className="text-red-500">*</span>
                  </label>
                  {searchMode === 'ech' ? (
                    <select
                      value={selectedECH}
                      onChange={(e) => setSelectedECH(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0f2c59] focus:border-transparent"
                    >
                      <option value="">Choose an ECH...</option>
                      {currentECHs.map(ech => (
                        <option key={ech.id} value={ech.id}>
                          {ech.id}: {ech.name} ({ech.location})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={manualAddress}
                      onChange={(e) => setManualAddress(e.target.value)}
                      placeholder="e.g., Unter den Linden 1, 10117 Berlin"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0f2c59] focus:border-transparent"
                    />
                  )}
                </div>
              </div>

              {/* Therapy Type Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Required Therapy Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedTherapyType}
                  onChange={(e) => setSelectedTherapyType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0f2c59] focus:border-transparent"
                >
                  <option value="">Choose therapy type...</option>
                  {therapyTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              {/* Therapist Source Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">Therapist Source</label>
                <div className="flex gap-6">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      value="flow"
                      checked={therapistSource === 'flow'}
                      onChange={() => setTherapistSource('flow')}
                      className="mr-2 text-[#0f2c59] focus:ring-[#0f2c59]"
                    />
                    <span className="text-sm font-medium text-gray-700">Flow Therapists</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      value="team-tailor"
                      checked={therapistSource === 'team-tailor'}
                      onChange={() => setTherapistSource('team-tailor')}
                      className="mr-2 text-orange-600 focus:ring-orange-600"
                    />
                    <span className="text-sm font-medium text-gray-700">Team Tailor Candidates</span>
                  </label>
                </div>
              </div>

              {/* Travel Duration Slider */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Maximum Travel Time: {maxTravelTime} minutes
                </label>
                <div className="px-3">
                  <input
                    type="range"
                    min="15"
                    max="120"
                    step="15"
                    value={maxTravelTime}
                    onChange={(e) => setMaxTravelTime(Number(e.target.value))}
                    className="w-full accent-[#0f2c59]"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>15 min</span>
                    <span>30 min</span>
                    <span>45 min</span>
                    <span>60 min</span>
                    <span>90 min</span>
                    <span>120 min</span>
                  </div>
                </div>
              </div>

              {/* Search Button */}
              <div className="flex justify-start">
                <button
                  onClick={handleSearch}
                  disabled={(!selectedECH && !manualAddress) || !selectedTherapyType || isSearching}
                  className="bg-[#0f2c59] text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-[#1a3a6b] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSearching ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                  {isSearching ? 'Searching...' : 'Find Compatible Therapists'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Search Summary */}
      {activeTab === 'find-ech' && selectedTherapist && showResults && (
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <ArrowLeftRight size={16} className="text-[#C2AC72]" />
            <span>
              <strong className="text-[#C2AC72]">Reverse Matching:</strong> Finding ECHs for {allTherapists.find(t => t.id.toString() === selectedTherapist)?.name} 
              ({allTherapists.find(t => t.id.toString() === selectedTherapist)?.type}) • <strong>Max travel:</strong> {maxTravelTime} min • <strong>Source:</strong> {reverseTherapistSource === 'flow' ? 'Flow Employed' : 'Team Tailor Candidate'}
            </span>
          </div>
        </div>
      )}

      {activeTab !== 'find-ech' && ((selectedECH && searchMode === 'ech') || (manualAddress && searchMode === 'address')) && selectedTherapyType && (
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <MapPin size={16} className="text-[#0f2c59]" />
            <span>
              <strong className="text-[#0f2c59]">Searching for:</strong> {selectedTherapyType} therapists
              {searchMode === 'ech' 
                ? ` near ${currentECHs.find(e => e.id === selectedECH)?.name} (${currentECHs.find(e => e.id === selectedECH)?.location})`
                : ` near ${manualAddress}`
              } • <strong>Max travel:</strong> {maxTravelTime} min • <strong>Source:</strong> {therapistSource === 'flow' ? 'Flow Employed' : 'Team Tailor Candidates'}
            </span>
          </div>
        </div>
      )}

      {/* Results Section */}
      {showResults && (
        <div className="bg-white rounded-lg border">
          {/* Reverse Matching Results */}
          {activeTab === 'find-ech' && selectedTherapist ? (
            <>
              {/* Results Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-[#C2AC72]">
                    Compatible ECH Matches
                  </h3>
                  <div className="text-sm text-gray-600">
                    {matchedECHs.length} ECHs within {maxTravelTime} minutes
                  </div>
                </div>
              </div>

              {/* ECH Results Content */}
              <div className="p-6">
                {matchedECHs.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <AlertTriangle size={48} className="mx-auto mb-4 text-gray-400" />
                    <p className="text-lg font-medium mb-2">No Compatible ECHs Found</p>
                    <p>Try increasing the travel time or selecting a different therapist.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto shadow-sm rounded-lg">
                    <table className="min-w-full bg-white border border-gray-200 rounded-lg overflow-hidden">
                      <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                            ECH ID
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48">
                            ECH Name
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                            Location
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                            Travel Time
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                            Needs
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28">
                            Source
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                            Sales Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {matchedECHs.map((ech, index) => {
                          const quality = getMatchQuality(ech.matchScore);
                          const selectedTherapistData = allTherapists.find(t => t.id.toString() === selectedTherapist);
                          
                          return (
                            <tr 
                              key={ech.id} 
                              className={`hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}
                            >
                              {/* ECH ID */}
                              <td className="px-4 py-3">
                                <span className="text-sm font-medium text-gray-900">{ech.id}</span>
                              </td>
                              
                              {/* ECH Name */}
                              <td className="px-4 py-3">
                                <div className="font-medium text-gray-900">{ech.name}</div>
                              </td>
                              
                              {/* Location */}
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-gray-700">{ech.location}</span>
                                  {ech.location === selectedTherapistData?.location && (
                                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                                      Same city
                                    </span>
                                  )}
                                </div>
                              </td>
                              
                              {/* Travel Time */}
                              <td className="px-4 py-3">
                                <span className="text-sm font-medium text-gray-900">{ech.travelTime} min</span>
                              </td>
                              
                              {/* Needs */}
                              <td className="px-4 py-3">
                                <span className="text-sm font-medium text-[#C2AC72]">
                                  {selectedTherapistData?.type}
                                </span>
                              </td>
                              
                              {/* Source */}
                              <td className="px-4 py-3">
                                {getECHSourceBadge(ech.source)}
                              </td>
                              
                              {/* Sales Status */}
                              <td className="px-4 py-3">
                                {ech.source === 'monday' && (ech as any).salesStatus ? (
                                  getSalesStatusBadge((ech as any).salesStatus)
                                ) : (
                                  <span className="text-xs text-gray-400">N/A</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          ) : (
            // Normal Therapist Matching Results
            ((selectedECH && searchMode === 'ech') || (manualAddress && searchMode === 'address')) && selectedTherapyType && (
              <>
                {/* Results Header */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-[#0f2c59]">
                      {therapistSource === 'flow' ? 'Flow' : 'Team Tailor'} Therapist Matches
                    </h3>
                    <div className="text-sm text-gray-600">
                      {matchedTherapists.length} therapists within {maxTravelTime} minutes
                    </div>
                  </div>
                </div>

                {/* Therapist Results Content */}
                <div className="p-6">
                  {matchedTherapists.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <AlertTriangle size={48} className="mx-auto mb-4 text-gray-400" />
                      <p className="text-lg font-medium mb-2">No Matches Found</p>
                      <p>Try increasing the travel time or switch to {therapistSource === 'flow' ? 'Team Tailor' : 'Flow'} therapists.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto shadow-sm rounded-lg">
                      <table className="min-w-full bg-white border border-gray-200 rounded-lg overflow-hidden">
                        <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48">
                              Name
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                              Type
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28">
                              Location
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                              Utilization
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-44">
                              Transport & Times
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28">
                              Source
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {matchedTherapists.map((therapist, index) => {
                            const quality = getMatchQuality(therapist.matchScore);

                            
                            return (
                              <tr 
                                key={therapist.id} 
                                className={`hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}
                              >
                                {/* Name */}
                                <td className="px-4 py-3">
                                  <div className="font-medium text-gray-900">{therapist.name}</div>
                                  <div className="text-sm text-gray-500">{therapist.email}</div>
                                </td>
                                
                                {/* Type */}
                                <td className="px-4 py-3">
                                  <span className="text-sm font-medium text-gray-700">{therapist.type}</span>
                                </td>
                                
                                {/* Location */}
                                <td className="px-4 py-3" title={therapist.address}>
                                  <span className="text-sm text-gray-700">{extractCity(therapist.address)}</span>
                                </td>
                                
                                {/* Utilization */}
                                <td className="px-4 py-3">
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUtilizationBadge(therapist.utilization)}`}>
                                    {therapist.utilization}%
                                  </span>
                                </td>
                                
                                {/* Transport & Times */}
                                <td className="px-4 py-3">
                                  {getTransportWithTimes(therapist)}
                                </td>
                                
                                {/* Source */}
                                <td className="px-4 py-3">
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${therapistSource === 'flow' ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'}`}>
                                    {therapistSource === 'flow' ? 'Flow' : 'Team Tailor'}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </>
            )
          )}
        </div>
      )}

      {/* Instructions */}
      {(!showResults || (activeTab === 'find-ech' && (!reverseSelectedTherapyType || !selectedTherapist)) || (activeTab !== 'find-ech' && (((!selectedECH && searchMode === 'ech') || (!manualAddress && searchMode === 'address')) || !selectedTherapyType))) && (
        <div className="bg-gray-50 p-4 rounded-lg border">
          <h3 className="text-base font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <CheckCircle size={16} />
            Quick Start
          </h3>
          {activeTab === 'find-ech' ? (
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
              <li>Select therapist source (Flow or Team Tailor)</li>
              <li>Choose required therapy type</li>
              <li>Select a therapist from the filtered list</li>
              <li>Adjust maximum travel time to ECH (default: 45 minutes)</li>
              <li>Click "Find Compatible ECHs" to see matching facilities</li>
            </ol>
          ) : (
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
              <li>Choose between Flow therapists or Team Tailor candidates</li>
              <li>Select ECH from list or enter custom address</li>
              <li>Choose required therapy type</li>
              <li>Adjust maximum travel time (default: 45 minutes)</li>
              <li>Click "Find Compatible Therapists"</li>
            </ol>
          )}
        </div>
      )}
    </div>
  );
} 