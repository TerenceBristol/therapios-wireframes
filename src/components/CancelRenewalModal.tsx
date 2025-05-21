import React from 'react';

interface CancelRenewalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  patientData: {
    name: string;
    aktVo: string;
    arzt: string;
  } | null;
}

const CancelRenewalModal: React.FC<CancelRenewalModalProps> = ({ isOpen, onClose, onConfirm, patientData }) => {
  if (!isOpen || !patientData) return null;

  return (
    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Keine Folge-VO bestellen Bestätigen</h2>
        
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

        <p className="text-sm text-gray-700 mb-6">
          Automatic renewal for this prescription will be cancelled and no follow-up prescription will be ordered.
          <br />
          <br />
          The current prescription will remain active until completion.
        </p>

        <div className="flex justify-end space-x-3 mt-6">
          <button 
            onClick={onClose} 
            className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm}
            className="px-4 py-2 bg-blue-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default CancelRenewalModal; 