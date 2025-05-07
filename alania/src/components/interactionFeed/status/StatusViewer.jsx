// components/interactionFeed/status/StatusViewer.jsx
import { useEffect } from "react";
import PropTypes from "prop-types";
import { userService } from "../../../services/users/userService";

function StatusViewer({ status, views, isOwnStatus, onClose, onViewStatus }) {
  useEffect(() => {
    if (!isOwnStatus) {
      // Enregistrer la vue à l'ouverture si ce n'est pas son propre statut
      onViewStatus(status.id).catch((err) =>
        console.error("Erreur lors de l'enregistrement de la vue :", err.message)
      );
    }
  }, [status.id, isOwnStatus, onViewStatus]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded-lg shadow-lg max-w-lg w-full relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-800 text-lg"
        >
          ✕
        </button>
        <div className="mt-4">
          {status.components.text && (
            <p className="text-gray-800 text-lg">{status.components.text}</p>
          )}
          {status.components.image && (
            <img
              src={status.components.image}
              alt="Statut"
              className="w-full h-auto rounded-lg mt-2"
            />
          )}
          {status.components.video && (
            <video
              src={status.components.video}
              controls
              className="w-full h-auto rounded-lg mt-2"
            />
          )}
        </div>
        {isOwnStatus && (
          <div className="mt-4">
            <h3 className="text-sm font-semibold text-gray-700">Vu par :</h3>
            {views.length > 0 ? (
              <ul className="mt-2 space-y-1">
                {views.map((view) => (
                  <li key={view.id} className="text-sm text-gray-600">
                    Utilisateur {view.userId} à{" "}
                    {new Date(view.viewedAt).toLocaleTimeString()}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">Aucune vue pour le moment</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

StatusViewer.propTypes = {
  status: PropTypes.shape({
    id: PropTypes.number.isRequired,
    userId: PropTypes.number.isRequired,
    components: PropTypes.shape({
      text: PropTypes.string,
      image: PropTypes.string,
      video: PropTypes.string,
    }).isRequired,
  }).isRequired,
  views: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      userId: PropTypes.number.isRequired,
      viewedAt: PropTypes.number.isRequired,
    })
  ).isRequired,
  isOwnStatus: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onViewStatus: PropTypes.func.isRequired,
};

export default StatusViewer;