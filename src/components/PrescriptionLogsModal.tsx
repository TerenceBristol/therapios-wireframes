import React from 'react';

interface LogEntry {
  description: string;
  timestamp: string;
}

interface PrescriptionLogsModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientName: string | undefined; // Can be undefined if data is not ready
  logs: LogEntry[];
}

const PrescriptionLogsModal: React.FC<PrescriptionLogsModalProps> = ({ isOpen, onClose, patientName, logs }) => {
  if (!isOpen) return null;

  // Handle potential multi-line descriptions
  const formatDescription = (description: string) => {
    return description.split('\n').map((line, index) => (
      <span key={index} className="block">{line}</span>
    ));
  };

  return (
    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg"> {/* Increased max-width */}
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          Prescription Logs - {patientName || 'Loading...'} 
        </h2>
        
        <div className="bg-gray-50 p-4 rounded border border-gray-200 mb-4 max-h-60 overflow-y-auto"> {/* Added max-height and scroll */}
          {logs && logs.length > 0 ? (
            logs.map((log, index) => (
              <div key={index} className={`py-2 ${index < logs.length - 1 ? 'border-b border-gray-200' : ''}`}>
                <div className="text-sm text-gray-800 font-medium whitespace-pre-wrap"> {/* Allow wrapping */}
                  {formatDescription(log.description)}
                </div>
                <div className="text-xs text-gray-500 text-right">
                  {log.timestamp}
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500 italic">No logs available.</p>
          )}
        </div>

        <div className="flex justify-end mt-6">
          <button 
            onClick={onClose} 
            className="px-4 py-2 bg-gray-700 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrescriptionLogsModal; 