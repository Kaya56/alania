// components/interactionFeed/group/GroupItem.jsx
import { UsersIcon } from '@heroicons/react/24/outline';
import { useFileUrl } from '../../../../hooks/useFileUrl';

function formatRelativeDate(date) {
  const now = new Date();
  const diff = Math.floor((now - new Date(date)) / (1000 * 60 * 60 * 24));

  if (diff === 0) return 'Aujourd’hui';
  if (diff === 1) return 'Hier';
  if (diff < 7) return `Il y a ${diff} jours`;
  if (diff < 30) return `Il y a ${Math.ceil(diff / 7)} semaines`;
  return `Il y a ${Math.ceil(diff / 30)} mois`;
}

function GroupItem({ group, onClick, isSelected }) {
  const { name, photoPath, lastMessage, lastMessageDate, members, unreadCount } = group;
  const { fileUrl, metadata, error, ref } = useFileUrl(group.photoPath);


  return (
    <div
      onClick={onClick}
      className={`flex items-center p-3 cursor-pointer transition-all duration-200 ${
        isSelected ? 'bg-gray-200' : 'hover:bg-gray-100'
      }`}
    >

      <div ref={ref}>
        {fileUrl && metadata?.type.startsWith('image/') ? (
          <img
            src={fileUrl}
            alt={group.name}
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
            {/* <span className="text-gray-500">{group.name?.charAt(3) || '?'}</span> */}
            <UsersIcon className="w-14 h-14 text-gray-400" />
          </div>
        )}
      </div>

      
      <div className="ml-3 flex-1">
        <div className="flex items-center">
          <p className="text-base font-semibold text-gray-900">{name}</p>
          {unreadCount > 0 && (
            <span className="ml-2 bg-blue-500 text-white text-xs rounded-full px-2 py-1">
              {unreadCount}
            </span>
          )}
        </div>
        <p className="text-sm text-gray-600 truncate">{lastMessage || 'Aucun message'}</p>
        <p className="text-xs text-gray-500">{members.length} membres</p>
      </div>
      <div className="text-xs text-gray-400">
        <p>{formatRelativeDate(lastMessageDate)}</p>
      </div>
    </div>
  );
}

export default GroupItem;