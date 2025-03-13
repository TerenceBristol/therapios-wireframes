import React from 'react';
import Link from 'next/link';
import WireframeLayout from '@/components/WireframeLayout';
import WireframeBox from '@/components/WireframeBox';
import WireframeImage from '@/components/WireframeImage';
import WireframeButton from '@/components/WireframeButton';
import WireframeFormControl from '@/components/WireframeFormControl';

export default function ExampleWireframePage() {
  return (
    <WireframeLayout title="Example Wireframe 1">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Dashboard Layout Example</h1>
          <p className="text-gray-600 mb-4">
            This wireframe demonstrates a basic dashboard layout with various components.
          </p>
          <div className="flex gap-2 mb-6">
            <Link href="/wireframes">
              <WireframeButton variant="outline" size="sm">
                Back to Wireframes
              </WireframeButton>
            </Link>
          </div>
        </div>

        {/* Main Wireframe Content */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
          {/* Header Section */}
          <div className="border-b border-gray-200 pb-4 mb-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold">Dashboard Overview</h2>
                <p className="text-sm text-gray-500">Welcome back, User</p>
              </div>
              <div className="flex gap-2">
                <WireframeButton variant="outline" size="sm">Profile</WireframeButton>
                <WireframeButton variant="primary" size="sm">New Item</WireframeButton>
              </div>
            </div>
          </div>

          {/* Statistics Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <WireframeBox height="h-24" label="Statistic 1">
              <div className="text-center">
                <div className="text-2xl font-bold">128</div>
                <div className="text-sm text-gray-500">Total Items</div>
              </div>
            </WireframeBox>
            
            <WireframeBox height="h-24" label="Statistic 2">
              <div className="text-center">
                <div className="text-2xl font-bold">$4,256</div>
                <div className="text-sm text-gray-500">Revenue</div>
              </div>
            </WireframeBox>
            
            <WireframeBox height="h-24" label="Statistic 3">
              <div className="text-center">
                <div className="text-2xl font-bold">24</div>
                <div className="text-sm text-gray-500">New Users</div>
              </div>
            </WireframeBox>
          </div>

          {/* Main Content Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Sidebar */}
            <div className="md:col-span-1">
              <div className="border border-gray-200 rounded-lg">
                <div className="bg-gray-50 p-3 border-b border-gray-200">
                  <h3 className="font-medium">Navigation</h3>
                </div>
                <div className="p-3">
                  <ul className="space-y-2">
                    <li className="p-2 bg-blue-50 text-blue-700 rounded">Dashboard</li>
                    <li className="p-2 hover:bg-gray-50 rounded">Analytics</li>
                    <li className="p-2 hover:bg-gray-50 rounded">Reports</li>
                    <li className="p-2 hover:bg-gray-50 rounded">Settings</li>
                  </ul>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg mt-4">
                <div className="bg-gray-50 p-3 border-b border-gray-200">
                  <h3 className="font-medium">Filters</h3>
                </div>
                <div className="p-3">
                  <WireframeFormControl 
                    label="Date Range" 
                    type="select" 
                    options={["Last 7 days", "Last 30 days", "Last 90 days"]}
                  />
                  <WireframeFormControl 
                    label="Category" 
                    type="checkbox" 
                    options={["Products", "Services", "Users"]}
                  />
                  <div className="mt-3">
                    <WireframeButton size="sm" fullWidth>Apply Filters</WireframeButton>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="md:col-span-2">
              <div className="border border-gray-200 rounded-lg">
                <div className="bg-gray-50 p-3 border-b border-gray-200">
                  <h3 className="font-medium">Recent Activity</h3>
                </div>
                <div className="p-3">
                  <WireframeImage height="h-48" label="Activity Chart" />
                  
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Recent Items</h4>
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          <tr>
                            <td className="px-4 py-2">Item 1</td>
                            <td className="px-4 py-2">
                              <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Active</span>
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-500">2023-03-01</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-2">Item 2</td>
                            <td className="px-4 py-2">
                              <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Pending</span>
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-500">2023-02-28</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-2">Item 3</td>
                            <td className="px-4 py-2">
                              <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">Inactive</span>
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-500">2023-02-25</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    
                    <div className="mt-4 flex justify-end">
                      <WireframeButton variant="outline" size="sm">View All</WireframeButton>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </WireframeLayout>
  );
} 