import { formatRelativeDate } from '../../../../utils/dateUtils';
import { UserIcon } from '@heroicons/react/24/outline';
import { useFileUrl } from '../../../../hooks/useFileUrl';

function ConversationPreview({ contact, currentUser, onClick, isSelected }) {
  const { username, photoPath, lastMessage, lastMessageDate, status, unreadCount } = contact;
  const { fileUrl, metadata, ref } = useFileUrl(photoPath);

  const statusColors = {
    online: 'text-green-500',
    offline: 'text-gray-400',
    busy: 'text-red-500',
    away: 'text-yellow-500',
  };

  return (
    <div
      onClick={onClick}
      className={`flex items-center p-3 cursor-pointer transition-all duration-200 ${
        isSelected ? 'bg-gray-200' : 'hover:bg-gray-100'
      }`}
    >
      <div className="flex-shrink-0" ref={ref}>
        {fileUrl && metadata?.type.startsWith('image/') ? (
          <img
            src={fileUrl}
            alt={username}
            className="w-14 h-14 rounded-full object-cover shadow-sm"
          />
        ) : (
          <UserIcon className="w-14 h-14 text-gray-400" />
        )}
      </div>
      <div className="ml-3 flex-1">
        <div className="flex items-center">
          <p className="text-base font-semibold text-gray-900">{username}</p>
          {unreadCount > 0 && (
            <span className="ml-2 bg-blue-500 text-white text-xs rounded-full px-2 py-1">
              {unreadCount}
            </span>
          )}
        </div>
        <p className="text-sm text-gray-600 truncate">{lastMessage || 'Aucun message'}</p>
      </div>
      <div className="text-right">
        {status && (
          <span className={`block mb-1 text-xs font-medium px-2 py-1 rounded-full ${statusColors[status]}`}>
            {status}
          </span>
        )}
        <p className="text-xs text-gray-400">
          {lastMessageDate ? formatRelativeDate(lastMessageDate) : ''}
        </p>
      </div>
    </div>
  );
}

export default ConversationPreview;