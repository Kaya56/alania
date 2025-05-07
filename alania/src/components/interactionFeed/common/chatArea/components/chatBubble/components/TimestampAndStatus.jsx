import React from 'react';
import { CheckCircleIcon } from '@heroicons/react/24/outline';

// Enum pour les statuts
const MessageStatus = Object.freeze({
  SENT: 'sent',
  DELIVERED: 'delivered',
  READ: 'read',
});

const TimestampAndStatus = ({ time, status, displayMode }) => {
  const tickStyles = {
    [MessageStatus.SENT]: '✓',
    [MessageStatus.DELIVERED]: '✓✓',
    [MessageStatus.READ]: <CheckCircleIcon className="w-4 h-4 text-blue-500" aria-hidden="true" />,
  };

  const textStyles = {
    [MessageStatus.SENT]: 'Envoyé',
    [MessageStatus.DELIVERED]: 'Reçu',
    [MessageStatus.READ]: 'Lu',
  };

  // Gère les statuts inconnus
  const display = tickStyles[status] || 'Statut non défini';

  return (
    <div className="flex justify-end text-xs text-gray-400 mt-1" role="status">
      <span>
        {new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </span>
      <span className="ml-1" aria-label={`Statut du message : ${textStyles[status] || 'Inconnu'}`}>
        {displayMode === 'ticks' ? display : textStyles[status] || 'Inconnu'}
      </span>
    </div>
  );
};

export default TimestampAndStatus;
