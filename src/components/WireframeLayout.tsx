import React from 'react';
import Navbar from './Navbar';

type WireframeLayoutProps = {
  children: React.ReactNode;
  title?: string;
  showSidebar?: boolean;
  username?: string;
  userInitials?: string;
  customNavItems?: Array<{
    label: string;
    href: string;
    isActive?: boolean;
  }>;
};

const WireframeLayout: React.FC<WireframeLayoutProps> = ({ 
  children, 
  title = "Therapios", 
  showSidebar = false,
  username = "User Therapist",
  userInitials = "UT",
  customNavItems
}) => {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar title={title} username={username} userInitials={userInitials} customNavItems={customNavItems} />
      
      <div className="flex flex-1">
        {showSidebar && (
          <aside className="w-64 bg-white border-r border-gray-200 p-4">
            <h2 className="text-lg font-medium mb-4 text-[#0f2c59]">Navigation</h2>
            <ul className="space-y-1">
              <li className="px-3 py-2 bg-blue-50 text-[#0f2c59] rounded">Dashboard</li>
              <li className="px-3 py-2 hover:bg-gray-50 rounded text-gray-700">Patients</li>
              <li className="px-3 py-2 hover:bg-gray-50 rounded text-gray-700">Calendar</li>
              <li className="px-3 py-2 hover:bg-gray-50 rounded text-gray-700">Reports</li>
              <li className="px-3 py-2 hover:bg-gray-50 rounded text-gray-700">Settings</li>
            </ul>
          </aside>
        )}
        
        <main className="flex-1 p-6 bg-white">
          {children}
        </main>
      </div>
      
      <footer className="bg-white border-t border-gray-200 p-4 text-center text-sm text-gray-500">
        Therapios Wireframes - For presentation purposes only
      </footer>
    </div>
  );
};

export default WireframeLayout; 