import React from 'react';

type VOStatus = 'Aktiv' | 'In Behandlung' | 'Fertig behandelt' | 'Abgebrochen';

interface VOStatusBadgeProps {
  status: VOStatus;
  willNotAutoRenew?: boolean;
}

const VOStatusBadge: React.FC<VOStatusBadgeProps> = ({ status, willNotAutoRenew }) => {
  let badgeClasses = 'inline-block px-3 py-1 text-xs font-medium rounded-md';
  let showSubtext = status === 'Aktiv' && willNotAutoRenew;

  switch (status) {
    case 'Aktiv':
      badgeClasses += ' bg-blue-100 text-blue-800';
      break;
    case 'In Behandlung':
      badgeClasses += ' bg-gray-100 text-gray-800';
      break;
    case 'Fertig behandelt':
      badgeClasses += ' bg-green-700 text-white'; // Dark green background, white text
      break;
    case 'Abgebrochen':
      badgeClasses += ' bg-red-600 text-white'; // Red background, white text
      break;
    default:
      badgeClasses += ' bg-gray-200 text-gray-800'; // Default fallback
  }

  return (
    <div>
      <span className={badgeClasses}>
        {status}
      </span>
      {showSubtext && (
        <span className="block text-[10px] text-red-600 mt-0.5">
          (Will not auto renew)
        </span>
      )}
    </div>
  );
};

export default VOStatusBadge; 