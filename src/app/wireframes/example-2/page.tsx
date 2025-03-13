import React from 'react';
import Link from 'next/link';
import WireframeLayout from '@/components/WireframeLayout';
import WireframeButton from '@/components/WireframeButton';
import WireframeFormControl from '@/components/WireframeFormControl';

export default function FormWireframePage() {
  return (
    <WireframeLayout title="Example Wireframe 2">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Form Interface Example</h1>
          <p className="text-gray-600 mb-4">
            This wireframe demonstrates a form-based interface with various input controls.
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
                <h2 className="text-xl font-semibold">User Registration Form</h2>
                <p className="text-sm text-gray-500">Enter your details to create an account</p>
              </div>
            </div>
          </div>

          {/* Form Section */}
          <div className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <WireframeFormControl 
                label="First Name" 
                type="text" 
                placeholder="Enter your first name"
              />
              
              <WireframeFormControl 
                label="Last Name" 
                type="text" 
                placeholder="Enter your last name"
              />
            </div>
            
            <WireframeFormControl 
              label="Email Address" 
              type="email" 
              placeholder="you@example.com"
            />
            
            <WireframeFormControl 
              label="Password" 
              type="password" 
              placeholder="Create a secure password"
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <WireframeFormControl 
                label="Phone Number" 
                type="text" 
                placeholder="(123) 456-7890"
              />
              
              <WireframeFormControl 
                label="Date of Birth" 
                type="text" 
                placeholder="MM/DD/YYYY"
              />
            </div>
            
            <WireframeFormControl 
              label="Address" 
              type="textarea" 
              placeholder="Enter your full address"
            />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <WireframeFormControl 
                label="City" 
                type="text" 
                placeholder="City"
              />
              
              <WireframeFormControl 
                label="State/Province" 
                type="select" 
                placeholder="Select state"
                options={["California", "New York", "Texas", "Florida"]}
              />
              
              <WireframeFormControl 
                label="Zip/Postal Code" 
                type="text" 
                placeholder="Zip code"
              />
            </div>
            
            <WireframeFormControl 
              label="How did you hear about us?" 
              type="select" 
              placeholder="Select an option"
              options={["Search Engine", "Social Media", "Friend/Referral", "Advertisement"]}
            />
            
            <WireframeFormControl 
              label="Interests" 
              type="checkbox" 
              options={["Technology", "Health & Wellness", "Business", "Education", "Entertainment"]}
            />
            
            <WireframeFormControl 
              label="Communication Preferences" 
              type="radio" 
              options={["Email", "SMS", "Phone Call", "No communication"]}
            />
            
            <div className="border-t border-gray-200 pt-4 mt-6">
              <div className="flex items-center mb-4">
                <input 
                  type="checkbox" 
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label className="ml-2 block text-sm text-gray-700">
                  I agree to the Terms of Service and Privacy Policy
                </label>
              </div>
              
              <div className="flex flex-col sm:flex-row justify-end gap-2">
                <WireframeButton variant="outline">Cancel</WireframeButton>
                <WireframeButton>Create Account</WireframeButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </WireframeLayout>
  );
} 