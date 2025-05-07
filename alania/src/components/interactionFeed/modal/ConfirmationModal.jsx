import PropTypes from "prop-types";

function ConfirmationModal({ isOpen, onClose, onConfirm, onDataChanged, title, message }) {
  if (!isOpen) return null;

  const handleConfirm = async () => {
    try {
      await onConfirm();
      onDataChanged("calls"); // Notifier le changement
      onClose();
    } catch (error) {
      console.error("Erreur lors de la confirmation:", error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4 sm:px-6 transition-opacity duration-300">
      <div className="bg-white w-full max-w-md rounded-3xl p-6 sm:p-8 shadow-2xl transform animate-fade-in-up">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4">{title}</h2>
        <p className="text-sm sm:text-base text-gray-600 mb-6 leading-relaxed">{message}</p>
        <div className="flex flex-col sm:flex-row justify-end gap-3">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
          >
            Annuler
          </button>
          <button
            onClick={handleConfirm}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-red-500 text-white hover:bg-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-400"
          >
            Confirmer
          </button>
        </div>
      </div>
    </div>
  );
}

ConfirmationModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onDataChanged: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
};

export default ConfirmationModal;