import {
  PaperClipIcon,
  DocumentIcon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import PropTypes from 'prop-types';
import { useState, useEffect, useRef, useCallback } from 'react';

// Constantes de validation
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 Mo
const MAX_FILES = 5;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];

function FileUploader({ email, onFileSelect, className }) {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [savedFiles, setSavedFiles] = useState([]);
  const [error, setError] = useState(null);
  const [scrollIndex, setScrollIndex] = useState(0);
  const [renamingIndex, setRenamingIndex] = useState(null);
  const [newFileName, setNewFileName] = useState('');

  const previewRef = useRef(null);
  const fileInputRef = useRef(null);

  // Nettoyage des URLs temporaires lors du démontage
  useEffect(() => {
    return () => {
      savedFiles.forEach((file) => URL.revokeObjectURL(file.url));
    };
  }, [savedFiles]);

  // Gestion du scroll par glisser-déposer et tactile
  useEffect(() => {
    const previewContainer = previewRef.current;
    if (!previewContainer) return;

    let isDragging = false;
    let startX = 0;
    let scrollLeft = 0;

    const handleStart = (e) => {
      isDragging = true;
      startX = (e.pageX || e.touches[0].pageX) - previewContainer.offsetLeft;
      scrollLeft = previewContainer.scrollLeft;
    };

    const handleEnd = () => {
      isDragging = false;
    };

    const handleMove = (e) => {
      if (!isDragging) return;
      e.preventDefault();
      const x = (e.pageX || e.touches[0].pageX) - previewContainer.offsetLeft;
      const walk = (x - startX) * 2;
      previewContainer.scrollLeft = scrollLeft - walk;
    };

    previewContainer.addEventListener('mousedown', handleStart);
    previewContainer.addEventListener('touchstart', handleStart);
    previewContainer.addEventListener('mouseleave', handleEnd);
    previewContainer.addEventListener('mouseup', handleEnd);
    previewContainer.addEventListener('touchend', handleEnd);
    previewContainer.addEventListener('mousemove', handleMove);
    previewContainer.addEventListener('touchmove', handleMove);

    return () => {
      previewContainer.removeEventListener('mousedown', handleStart);
      previewContainer.removeEventListener('touchstart', handleStart);
      previewContainer.removeEventListener('mouseleave', handleEnd);
      previewContainer.removeEventListener('mouseup', handleEnd);
      previewContainer.removeEventListener('touchend', handleEnd);
      previewContainer.removeEventListener('mousemove', handleMove);
      previewContainer.removeEventListener('touchmove', handleMove);
    };
  }, []);

  // Validation des fichiers
  const validateFiles = (files) => {
    if (selectedFiles.length + files.length > MAX_FILES) {
      return `Maximum ${MAX_FILES} fichiers autorisés`;
    }

    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        return 'Seuls les fichiers JPEG, PNG, GIF et PDF sont autorisés';
      }
      if (file.size > MAX_FILE_SIZE) {
        return `Le fichier ${file.name} dépasse 10 Mo`;
      }
    }
    return null;
  };

  // Gestion du changement du champ input (upload des fichiers)
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const validationError = validateFiles(files);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    const newSavedFiles = [...savedFiles];

    for (const file of files) {
      try {
        const url = URL.createObjectURL(file);
        newSavedFiles.push({
          id: `temp-${Date.now()}-${Math.random()}`, // ID temporaire
          name: file.name,
          type: file.type,
          size: file.size,
          url,
          blob: file, // Conserver le Blob
        });
      } catch (err) {
        console.error('Erreur lors de la gestion du fichier:', err);
        setError('Erreur lors de la gestion du fichier');
        return;
      }
    }

    setSelectedFiles((prev) => [...prev, ...files]);
    setSavedFiles(newSavedFiles);
    onFileSelect(newSavedFiles);
  };

  // Suppression d'un fichier
  const removeFile = useCallback(
    (index) => {
      const newSelectedFiles = selectedFiles.filter((_, i) => i !== index);
      const newSavedFiles = savedFiles.filter((_, i) => i !== index);

      // Libère l'URL temporaire
      URL.revokeObjectURL(savedFiles[index].url);
      setSelectedFiles(newSelectedFiles);
      setSavedFiles(newSavedFiles);
      onFileSelect(newSavedFiles);

      if (scrollIndex > newSavedFiles.length - 3) {
        setScrollIndex(Math.max(0, newSavedFiles.length - 3));
      }
    },
    [selectedFiles, savedFiles, scrollIndex, onFileSelect]
  );

  // Démarrer le renommage d'un fichier
  const startRenaming = (index) => {
    setRenamingIndex(index);
    setNewFileName(savedFiles[index].name);
  };

  // Soumission du nouveau nom
  const handleRenameSubmit = (index) => {
    if (!newFileName.trim()) {
      setError('Le nom du fichier ne peut pas être vide');
      return;
    }

    const newSavedFiles = [...savedFiles];
    newSavedFiles[index] = { ...newSavedFiles[index], name: newFileName };
    setSavedFiles(newSavedFiles);
    onFileSelect(newSavedFiles);
    setRenamingIndex(null);
    setNewFileName('');
  };

  // Gestion du scroll (gauche/droite)
  const handleScroll = (direction) => {
    if (direction === 'left' && scrollIndex > 0) {
      setScrollIndex(scrollIndex - 1);
    } else if (direction === 'right' && scrollIndex < savedFiles.length - 3) {
      setScrollIndex(scrollIndex + 1);
    }
  };

  // Rendu de la prévisualisation d'un fichier
  const renderFilePreview = (file, index) => {
    const { type, name, url } = savedFiles[index] || {};
    return (
      <div className="relative flex flex-col items-center bg-gray-50 border border-gray-300 shadow-md p-3 my-10 w-24 sm:w-28 md:w-32 transition-transform duration-200 hover:scale-105">
        {type?.startsWith('image/') ? (
          <img src={url} alt={name} className="h-20 w-20 object-cover rounded-md" />
        ) : type === 'application/pdf' ? (
          <DocumentIcon className="h-20 w-20 text-red-500" />
        ) : (
          <DocumentIcon className="h-20 w-20 text-gray-500" />
        )}
        {renamingIndex === index ? (
          <input
            type="text"
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
            onBlur={() => handleRenameSubmit(index)}
            onKeyPress={(e) => e.key === 'Enter' && handleRenameSubmit(index)}
            className="mt-2 text-xs text-gray-600 w-full text-center border rounded px-1 focus:outline-none focus:ring-2 focus:ring-teal-400"
            autoFocus
          />
        ) : (
          <p
            className="mt-2 text-xs text-gray-600 truncate w-full text-center cursor-pointer"
            onClick={() => startRenaming(index)}
          >
            {name}
          </p>
        )}
        <button
          onClick={() => removeFile(index)}
          className="absolute -top-1 -right-1 p-1 bg-red-500 rounded-full hover:bg-red-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-400"
          aria-label={`Supprimer ${name}`}
        >
          <XMarkIcon className="h-3 w-3 text-white" />
        </button>
      </div>
    );
  };

  return (
    <div className="relative">
      <label
        htmlFor="file-upload"
        className={`p-2 rounded-full cursor-pointer transition-colors duration-200 ${className}`}
      >
        <PaperClipIcon className="h-6 w-6 text-gray-600" />
      </label>
      <input
        id="file-upload"
        type="file"
        className="hidden"
        onChange={handleFileChange}
        multiple
        accept="image/jpeg,image/png,image/gif,application/pdf"
        aria-label="Télécharger des fichiers"
        aria-describedby={error ? 'file-error' : undefined}
        ref={fileInputRef}
      />
      {error && (
        <p id="file-error" className="mt-1 text-xs text-red-600" role="alert">
          {error}
        </p>
      )}
      {savedFiles.length > 0 && (
        <div className="absolute bottom-full left-0 w-80 border border-gray-300 bg-white rounded-lg shadow-lg p-4 transform -translate-y-2 z-10">
          <div className="relative">
            <div
              ref={previewRef}
              className="flex overflow-x-auto scroll-smooth gap-4"
            >
              {savedFiles.map((file, index) => (
                <div key={index} className="flex-shrink-0">
                  {renderFilePreview(file, index)}
                </div>
              ))}
            </div>
            {savedFiles.length > 3 && (
              <>
                <button
                  onClick={() => handleScroll('left')}
                  className="absolute left-0 top-1/2 transform -translate-y-1/2 p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors duration-200 hidden sm:block"
                  aria-label="Défiler à gauche"
                  disabled={scrollIndex === 0}
                >
                  <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
                </button>
                <button
                  onClick={() => handleScroll('right')}
                  className="absolute right-0 top-1/2 transform -translate-y-1/2 p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors duration-200 hidden sm:block"
                  aria-label="Défiler à droite"
                  disabled={scrollIndex >= savedFiles.length - 3}
                >
                  <ChevronRightIcon className="h-5 w-5 text-gray-600" />
                </button>
              </>
            )}
            <label
              htmlFor="file-upload"
              className="absolute bottom-2 right-2 p-2 bg-teal-600 text-white rounded-full cursor-pointer hover:bg-teal-600 transition-colors duration-200"
            >
              <PlusIcon className="h-5 w-5" />
            </label>
            <button
              onClick={() => {
                savedFiles.forEach((file) => URL.revokeObjectURL(file.url));
                setSelectedFiles([]);
                setSavedFiles([]);
                onFileSelect([]);
              }}
              className="absolute top-2 right-2 p-1 text-gray-500 hover:text-gray-700"
              aria-label="Supprimer tous les fichiers"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

FileUploader.propTypes = {
  email: PropTypes.string.isRequired,
  onFileSelect: PropTypes.func.isRequired,
  className: PropTypes.string,
};

export default FileUploader;