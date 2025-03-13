import React from 'react';
import Link from 'next/link';
import WireframeLayout from '@/components/WireframeLayout';
import WireframeButton from '@/components/WireframeButton';

export default function DashboardWireframe() {
  // Sample patient data
  const patients = [
    { id: 1, name: '[Name]', facility: '[Name]', sessions: '[1 / 2 / 3]', organizer: 'Geplant', sessionsNumber: '[#]', status: '[# / #]', doctor: '[Name]' },
    { id: 2, name: '[Name]', facility: '[Name]', sessions: '[1 / 2 / 3]', organizer: 'Therapiert', sessionsNumber: '[#]', status: '[# / #]', doctor: '[Name]' },
    { id: 3, name: '[Name]', facility: '[Name]', sessions: '[1 / 2 / 3]', organizer: 'Geplant', sessionsNumber: '[#]', status: '[# / #]', doctor: '[Name]' },
    { id: 4, name: '[Name]', facility: '[Name]', sessions: '[1 / 2 / 3]', organizer: 'Therapiert', sessionsNumber: '[#]', status: '[# / #]', doctor: '[Name]' },
    { id: 5, name: '[Name]', facility: '[Name]', sessions: '[1 / 2 / 3]', organizer: 'Select', sessionsNumber: '[#]', status: '[# / #]', doctor: '[Name]' },
    { id: 6, name: '[Name]', facility: '[Name]', sessions: '[1 / 2 / 3]', organizer: 'Select', sessionsNumber: '[#]', status: '[# / #]', doctor: '[Name]' },
    { id: 7, name: '[Name]', facility: '[Name]', sessions: '[1 / 2 / 3]', organizer: 'Select', sessionsNumber: '[#]', status: '[# / #]', doctor: '[Name]' },
    { id: 8, name: '[Name]', facility: '[Name]', sessions: '[1 / 2 / 3]', organizer: 'Select', sessionsNumber: '[#]', status: '[# / #]', doctor: '[Name]' },
    { id: 9, name: '[Name]', facility: '[Name]', sessions: '[1 / 2 / 3]', organizer: 'Select', sessionsNumber: '[#]', status: '[# / #]', doctor: '[Name]' },
    { id: 10, name: '[Name]', facility: '[Name]', sessions: '[1 / 2 / 3]', organizer: 'Select', sessionsNumber: '[#]', status: '[# / #]', doctor: '[Name]' },
  ];

  return (
    <WireframeLayout title="Therapios" username="User Therapist" userInitials="UT">
      <div className="max-w-full mx-auto">
        <div className="mb-6">
          <p className="text-gray-600 mb-1">Hallo [NAME], ich hoffe, du hast einen wundervollen Tag.</p>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Dashboard</h1>
          
          <div className="flex justify-between items-center mb-6">
            <div>
              <div className="flex items-center space-x-2">
                <label className="text-sm text-gray-600">Zeitraum:</label>
                <div className="relative">
                  <input 
                    type="text" 
                    className="pl-3 pr-10 py-1.5 border border-gray-300 rounded text-sm bg-white"
                    value="01.01.2025 - 01.07.2025"
                    readOnly
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M8 2V5M16 2V5M3.5 9.09H20.5M21 8.5V17C21 20 19.5 22 16 22H8C4.5 22 3 20 3 17V8.5C3 5.5 4.5 3.5 8 3.5H16C19.5 3.5 21 5.5 21 8.5Z" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="flex justify-between p-4 border-b border-gray-200">
              <div className="relative">
                <button className="flex items-center space-x-1 px-3 py-1.5 border border-gray-300 rounded bg-white text-sm">
                  <span>Anzeigen</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 9L12 15L18 9" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
              
              <div className="relative">
                <div className="flex items-center border border-gray-300 rounded overflow-hidden">
                  <input 
                    type="text" 
                    className="pl-10 pr-3 py-1.5 w-64 text-sm focus:outline-none"
                    placeholder="Search"
                  />
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M21 21L17 17" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="therapios-table">
                <thead>
                  <tr>
                    <th className="w-1/6">
                      <div className="flex items-center">
                        Name Patient
                        <svg className="ml-1 w-4 h-4 text-gray-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M7 15L12 20L17 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M7 9L12 4L17 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    </th>
                    <th className="w-1/6">
                      <div className="flex items-center">
                        Einrichtung
                        <svg className="ml-1 w-4 h-4 text-gray-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    </th>
                    <th className="w-1/8">
                      <div className="flex items-center">
                        Tage s.l. Beh.
                        <svg className="ml-1 w-4 h-4 text-gray-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M7 15L12 20L17 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M7 9L12 4L17 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    </th>
                    <th className="w-1/8">
                      <div className="flex items-center">
                        # Beh. d Woche
                        <svg className="ml-1 w-4 h-4 text-gray-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M7 15L12 20L17 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M7 9L12 4L17 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    </th>
                    <th className="w-1/8">
                      <div className="flex items-center">
                        Organizer
                        <svg className="ml-1 w-4 h-4 text-gray-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    </th>
                    <th className="w-1/8">
                      <div className="flex items-center">
                        Aktuelle VO (Nr)
                        <svg className="ml-1 w-4 h-4 text-gray-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M7 15L12 20L17 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M7 9L12 4L17 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    </th>
                    <th className="w-1/8">
                      <div className="flex items-center">
                        Status VO (#/#)
                        <svg className="ml-1 w-4 h-4 text-gray-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M7 15L12 20L17 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M7 9L12 4L17 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    </th>
                    <th className="w-1/8">
                      <div className="flex items-center">
                        Arzt
                        <svg className="ml-1 w-4 h-4 text-gray-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M7 15L12 20L17 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M7 9L12 4L17 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {patients.map((patient, index) => (
                    <tr key={patient.id} className={index % 2 === 1 ? "bg-[#f5f7fa]" : ""}>
                      <td>{patient.name}</td>
                      <td>
                        {index < 2 ? (
                          <div className="flex items-center">
                            <span className="mr-2">{patient.facility}</span>
                            <svg className="w-4 h-4 text-gray-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                        ) : patient.facility}
                      </td>
                      <td>{patient.sessions}</td>
                      <td>{patient.sessionsNumber}</td>
                      <td>
                        <select className="w-full border-0 bg-transparent therapios-select focus:ring-0 text-sm px-0">
                          <option>{patient.organizer}</option>
                          <option>Geplant</option>
                          <option>Therapiert</option>
                        </select>
                      </td>
                      <td>{patient.sessionsNumber}</td>
                      <td>{patient.status}</td>
                      <td>{patient.doctor}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200">
              <div className="flex-1 flex justify-end">
                <nav className="inline-flex rounded-md shadow-sm">
                  <button className="relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-l-md border border-gray-300 bg-white hover:bg-gray-50">
                    Vorige
                  </button>
                  <button className="relative inline-flex items-center px-4 py-2 text-sm font-medium border border-gray-300 bg-white hover:bg-gray-50 text-blue-700">
                    1
                  </button>
                  <button className="relative inline-flex items-center px-4 py-2 text-sm font-medium border border-gray-300 bg-white hover:bg-gray-50">
                    2
                  </button>
                  <button className="relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-r-md border border-gray-300 bg-white hover:bg-gray-50">
                    Nächste
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <Link href="/wireframes" className="text-sm text-blue-600 hover:underline">
            Back to Wireframes
          </Link>
        </div>
      </div>
    </WireframeLayout>
  );
} 