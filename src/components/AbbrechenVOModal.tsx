import React, { useState } from 'react';

interface AbbrechenVOModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  patientData: {
    name: string;
    aktVo: string;
    arzt: string;
  } | null;
}

type ReasonOption = 
  | 'declined' 
  | 'no_longer_at_facility' 
  | 'goals_achieved' 
  | 'deceased' 
  | 'other';

const AbbrechenVOModal: React.FC<AbbrechenVOModalProps> = ({ isOpen, onClose, onConfirm, patientData }) => {
  const [selectedReason, setSelectedReason] = useState<ReasonOption>('other');
  const [otherReason, setOtherReason] = useState('');

  const reasonLabels: Record<ReasonOption, string> = {
    declined: 'Patient declined further treatment',
    no_longer_at_facility: 'Patient no longer at facility',
    goals_achieved: 'Treatment goals achieved',
    deceased: 'Patient deceased',
    other: 'Other'
  };

  const handleReasonChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedReason(event.target.value as ReasonOption);
  };

  const handleConfirmClick = () => {
    let finalReason = reasonLabels[selectedReason];
    if (selectedReason === 'other') {
      finalReason += `: ${otherReason}`;
    }
    console.log('Abbrechen Reason:', finalReason);
    onConfirm(finalReason);
  };

  if (!isOpen || !patientData) return null;

  return (
    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Abbrechen VO</h2>
        
        <div className="bg-gray-50 p-4 rounded border border-gray-200 mb-4">
          <div className="mb-2">
            <span className="text-xs font-medium text-gray-500 block">Patient</span>
            <span className="text-sm text-gray-900">{patientData.name}</span>
          </div>
          <div className="mb-2">
            <span className="text-xs font-medium text-gray-500 block">VO#</span>
            <span className="text-sm text-gray-900">{patientData.aktVo}</span>
          </div>
          <div>
            <span className="text-xs font-medium text-gray-500 block">Arzt</span>
            <span className="text-sm text-gray-900">{patientData.arzt}</span>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Reason for Abbrechen:</label>
          <div className="space-y-2">
            {[ 
              { value: 'declined', label: 'Patient declined further treatment' },
              { value: 'no_longer_at_facility', label: 'Patient no longer at facility' },
              { value: 'goals_achieved', label: 'Treatment goals achieved' },
              { value: 'deceased', label: 'Patient deceased' },
              { value: 'other', label: 'Other' },
            ].map(reason => (
              <div key={reason.value} className="flex items-center">
                <input
                  id={`reason-${reason.value}`}
                  name="nonRenewalReason"
                  type="radio"
                  value={reason.value}
                  checked={selectedReason === reason.value}
                  onChange={handleReasonChange}
                  className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <label htmlFor={`reason-${reason.value}`} className="ml-3 block text-sm text-gray-700">
                  {reason.label}
                </label>
              </div>
            ))}
          </div>
          {selectedReason === 'other' && (
            <textarea
              value={otherReason}
              onChange={(e) => setOtherReason(e.target.value)}
              placeholder="Please specify reason"
              rows={3}
              className="mt-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2"
            />
          )}
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button 
            onClick={onClose} 
            className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
          <button 
            onClick={handleConfirmClick}
            className="px-4 py-2 bg-red-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default AbbrechenVOModal; 