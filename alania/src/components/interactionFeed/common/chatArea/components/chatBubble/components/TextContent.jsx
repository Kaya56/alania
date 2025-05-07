import React from 'react';

const TextContent = ({ content, isMine, isFirst, isLast }) => {
  // Vérifie si le contenu est vide
  if (!content) return null;

  const cornerStyles = isMine
    ? `${isFirst ? 'rounded-tl-2xl' : 'rounded-tl-md'} ${isLast ? 'rounded-br-2xl' : 'rounded-br-md'} rounded-tr-md rounded-bl-md`
    : `${isFirst ? 'rounded-tr-2xl' : 'rounded-tr-md'} ${isLast ? 'rounded-bl-2xl' : 'rounded-bl-md'} rounded-tl-md rounded-br-md`;

  return (
    <p className={`${cornerStyles} p-2 ${isMine ? 'bg-green-100 text-black' : 'bg-gray-200 text-gray-800'}`} aria-label="Contenu du message">
      {content}
    </p>
  );
};

export default TextContent;
