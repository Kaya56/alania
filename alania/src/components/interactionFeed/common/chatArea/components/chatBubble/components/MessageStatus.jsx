import React from 'react';

const MessageStatus = ({ status, displayMode, onHover }) => {
  const tickStyles = {
    sent: '✓',
    delivered: '✓✓',
    read: <span className="text-blue-500">✓✓</span>,
  };

  const textStyles = {
    sent: 'Envoyé',
    delivered: 'Reçu',
    read: 'Lu',
  };

  const display = displayMode === 'ticks' ? tickStyles[status] : textStyles[status];
  
  // Gérer les statuts non définis
  const displayText = display || 'Statut inconnu';

  return (
    <span onMouseEnter={onHover} className="text-xs text-gray-500" aria-label={displayText}>
      {displayText}
    </span>
  );
};

export default MessageStatus;
