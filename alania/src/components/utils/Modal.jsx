// components/utils/Modal.jsx
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useEffect, useRef } from 'react';

function Modal({ isOpen, onClose, title, children }) {
  const modalRef = useRef(null);
  const closeButtonRef = useRef(null);

  // Fermer avec la touche Échap
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Définir le focus sur le bouton de fermeture
      closeButtonRef.current?.focus();
    }
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Fermer en cliquant en dehors
  const handleBackdropClick = (event) => {
    if (modalRef.current && !modalRef.current.contains(event.target)) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 supports-[backdrop-filter]:backdrop-blur-sm transition-opacity duration-300 ${
        isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className={`bg-white rounded-lg shadow-xl w-full max-w-md mx-4 sm:mx-0 transform transition-transform duration-300 ${
          isOpen ? 'scale-100' : 'scale-95'
        }`}
      >
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 id="modal-title" className="text-xl font-semibold text-gray-900">
            {title}
          </h2>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            className="text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full p-1 transition-all focus:ring-2 focus:ring-offset-1 focus:ring-gray-300"
            aria-label="Fermer"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        <div className="p-6 max-h-[80vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

export default Modal;