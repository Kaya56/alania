import PropTypes from 'prop-types';
import { UserIcon } from '@heroicons/react/24/outline';
import { useFileUrl } from '../../../../hooks/useFileUrl';

function ContactInfo({ contact, currentUser, onBlockContact, onDeleteContact, onViewProfile }) {
  const { username, email, photoPath, status, createdAt, isBlocked } = contact;
  const { fileUrl, metadata } = useFileUrl(photoPath, { lazy: false });

  // Gestion des valeurs par défaut
  const displayName = username || email.split('@')[0] || 'Inconnu';
  const formattedDate = new Date(createdAt).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const statusColors = {
    online: 'bg-green-500',
    offline: 'bg-gray-400',
    busy: 'bg-red-500',
    away: 'bg-yellow-500',
  };

  return (
    <div className="relative flex flex-col p-6 transform transition-all duration-300 group">
      <div
        className="absolute inset-0 rounded-xl opacity-20 group-hover:opacity-30 transition-opacity duration-500 pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at 70% 200%, #ff2079, transparent 60%), radial-gradient(circle at 30% 80%, #00f0ff, transparent 40%)',
        }}
      />

      <div className="flex justify-end gap-3 mb-6">
        <button
          onClick={onViewProfile}
          className="px-4 py-2 bg-transparent border-2 border-[#00c3d9] text-[#00c3d9] rounded-lg hover:bg-[#00c3d9] hover:text-[#0a0a0a] font-mono font-bold tracking-wider transition-all duration-200"
        >
          PROFILE
        </button>
        <button
          onClick={() => onBlockContact(contact.id)}
          className={`px-4 py-2 border-2 rounded-lg font-mono font-bold tracking-wider transition-all duration-200 hover:shadow-[0_0_5px_${isBlocked ? '#00cc80' : '#ff2079'}] ${
            isBlocked
              ? 'border-[#00cc80] text-[#00cc80] hover:bg-[#00cc80] hover:text-[#0a0a0a]'
              : 'border-[#ff2079] text-[#ff2079] hover:bg-[#ff2079] hover:text-[#0a0a0a]'
          }`}
        >
          {isBlocked ? 'UNBLOCK' : 'BLOCK'}
        </button>
        <button
          onClick={() => onDeleteContact(contact.id)}
          className="px-4 py-2 bg-transparent border-2 border-[#cc1e57] text-[#cc1e57] rounded-lg hover:bg-[#cc1e57] hover:text-[#0a0a0a] font-mono font-bold tracking-wider transition-all duration-200"
        >
          DELETE
        </button>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex-shrink-0 relative">
          <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-[#ff2079] to-[#00f0ff] opacity-20 blur-sm group-hover:opacity-15 transition-opacity duration-300"></div>
          {fileUrl && metadata?.type.startsWith('image/') ? (
            <img
              src={fileUrl}
              alt={displayName}
              className="relative z-10 w-24 h-24 rounded-full object-cover border-2 border-[#0a0a0a]"
            />
          ) : (
            <UserIcon className="relative z-10 w-24 h-24 p-2 text-gray-400 bg-gray-100 rounded-full border-2 border-[#0a0a0a]" />
          )}
        </div>

        <div className="flex-1 space-y-2">
          <h3
            className={`text-2xl font-bold font-mono tracking-wide ${
              displayName
                ? 'text-transparent bg-clip-text bg-gradient-to-r from-[#00f0ff] to-[#00cc80]'
                : 'text-gray-400'
            }`}
          >
            {displayName.toUpperCase()}
          </h3>
          <p className="text-sm text-gray-500 font-mono truncate">{email}</p>

          <div className="flex items-center gap-3 mt-3">
            <span
              className={`w-4 h-4 rounded-full ${statusColors[status]} shadow-[0_0_8px_${statusColors[status]?.replace('bg-', '')}]`}
            ></span>
            <p className="text-sm font-mono text-gray-500 uppercase tracking-widest">
              {status || 'offline'}
            </p>
          </div>

          <p className="text-xs text-gray-400 font-mono mt-3">
            AJOUTÉ LE : {formattedDate.toUpperCase()}
          </p>
        </div>
      </div>
    </div>
  );
}

ContactInfo.propTypes = {
  contact: PropTypes.shape({
    id: PropTypes.string.isRequired,
    username: PropTypes.string,
    email: PropTypes.string.isRequired,
    photoPath: PropTypes.string,
    status: PropTypes.string,
    createdAt: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    isBlocked: PropTypes.bool,
  }).isRequired,
  currentUser: PropTypes.shape({
    email: PropTypes.string.isRequired,
  }).isRequired,
  onBlockContact: PropTypes.func.isRequired,
  onDeleteContact: PropTypes.func.isRequired,
  onViewProfile: PropTypes.func.isRequired,
};

export default ContactInfo;