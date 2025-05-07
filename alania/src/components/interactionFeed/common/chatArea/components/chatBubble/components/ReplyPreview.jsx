import React from 'react';

const ReplyPreview = ({ repliedMessage }) => {
  if (!repliedMessage) return null; // Retourne rien si aucune réponse n'est présente

  const { sender, text } = repliedMessage;
  const displayText = text.length > 50 ? `${text.substring(0, 50)}...` : text; // Affiche le texte, avec ou sans "..."

  return (
    <div className="bg-gray-200 p-2 rounded mb-2 text-xs text-gray-700" aria-label={`Répond à ${sender.username}: ${text}`}>
      <p className="font-medium">{sender.username}</p>
      <p>{displayText}</p>
    </div>
  );
};

export default ReplyPreview;
