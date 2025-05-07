import React from 'react';

const MediaDisplay = ({ media }) => {
  return (
    <div className="mt-2">
      {media.map((file, index) => (
        <div key={index} className="text-xs text-blue-500 underline cursor-pointer">
          <span>{file.name} ({(file.size / 1024).toFixed(1)} KB)</span>
          {/* Affichage d'un aperçu si c'est une image */}
          {file.type.startsWith('image/') && (
            <img src={URL.createObjectURL(file)} alt={file.name} className="mt-1 w-20 h-20 object-cover rounded" />
          )}
          {/* Ajoute d'autres types de fichiers si nécessaire (audio, vidéo, etc.) */}
        </div>
      ))}
    </div>
  );
};

export default MediaDisplay;
