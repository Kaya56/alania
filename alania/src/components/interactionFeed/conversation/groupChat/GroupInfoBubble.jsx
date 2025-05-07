// components/interactionFeed/groupChat/GroupInfoBubble.jsx
import PropTypes from 'prop-types';
import { useFileUrl } from '../../../../hooks/useFileUrl';
import { UsersIcon, PhoneIcon, VideoCameraIcon, BellIcon } from '@heroicons/react/24/outline';

function GroupInfoBubble({ group, currentUser, onViewGroupInfo, onClose }) {
  const { name, photoPath } = group;
  const { fileUrl, metadata } = useFileUrl(photoPath, { lazy: false });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 shadow-lg transform transition-all scale-100 animate-fadeIn"
        onClick={(e) => e.stopPropagation()} // Empêche la fermeture lors d'un clic à l'intérieur
      >
        <div className="flex justify-center mb-4">
          {fileUrl && metadata?.type.startsWith('image/') ? (
            <img
              src={fileUrl}
              alt={name}
              className="w-32 h-32 rounded-full object-cover shadow-md"
            />
          ) : (
            <UsersIcon className="w-32 h-32 text-gray-400" />
          )}
        </div>
        <h3 className="text-lg font-semibold text-gray-900 text-center truncate">{name}</h3>
        <div className="mt-4 flex justify-around">
          <button
            onClick={onViewGroupInfo}
            className="flex flex-col items-center text-gray-600 hover:text-blue-600"
            title="Voir les informations"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs mt-1">Infos</span>
          </button>
          <button
            className="flex flex-col items-center text-gray-600 hover:text-blue-600"
            title="Appel vocal"
          >
            <PhoneIcon className="w-6 h-6" />
            <span className="text-xs mt-1">Appel</span>
          </button>
          <button
            className="flex flex-col items-center text-gray-600 hover:text-blue-600"
            title="Appel vidéo"
          >
            <VideoCameraIcon className="w-6 h-6" />
            <span className="text-xs mt-1">Vidéo</span>
          </button>
          <button
            className="flex flex-col items-center text-gray-600 hover:text-blue-600"
            title="Notifications"
          >
            <BellIcon className="w-6 h-6" />
            <span className="text-xs mt-1">Notifs</span>
          </button>
        </div>
        <button
          onClick={onClose}
          className="mt-6 w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
        >
          Fermer
        </button>
      </div>
    </div>
  );
}

GroupInfoBubble.propTypes = {
  group: PropTypes.shape({
    name: PropTypes.string.isRequired,
    photoPath: PropTypes.string,
  }).isRequired,
  currentUser: PropTypes.shape({
    email: PropTypes.string.isRequired,
  }).isRequired,
  onViewGroupInfo: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default GroupInfoBubble;