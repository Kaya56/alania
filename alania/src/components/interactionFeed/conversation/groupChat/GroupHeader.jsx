import PropTypes from 'prop-types';
import { useState } from 'react';
import { useMediaQuery } from 'react-responsive';
import { UsersIcon } from '@heroicons/react/24/outline';
import { useFileUrl } from '../../../../hooks/useFileUrl';
import MessageTools from '../../common/chatArea/components/header/components/MessageTools';
import GroupInfo from './GroupInfo';
import GroupInfoBubble from './GroupInfoBubble';

function GroupHeader({ group, currentUser, onViewGroupInfo, onAddMember, onRemoveMember, onLeaveGroup, onUpdateGroup, tools = [] }) {
  const { name, photoPath, members } = group;
  const { fileUrl, metadata } = useFileUrl(photoPath, { lazy: false });
  const [showInfo, setShowInfo] = useState(false);
  const isMobile = useMediaQuery({ maxWidth: 640 });

  const handleToggleInfo = () => {
    setShowInfo(!showInfo);
  };

  const handleCloseInfo = () => {
    setShowInfo(false);
  };

  return (
    <>
      <div
        className="bg-gray-100 border-b border-gray-200 flex items-center justify-between px-4 py-2 cursor-pointer"
        onClick={handleToggleInfo}
      >
        <div className="flex items-center space-x-2 min-w-0">
          {fileUrl && metadata?.type.startsWith('image/') ? (
            <img
              src={fileUrl}
              alt={name}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <UsersIcon className="w-8 h-8 text-gray-400" />
          )}
          <div className="truncate">
            <p className="text-sm font-medium text-gray-900 truncate">{name}</p>
            <p className="text-xs text-gray-500 truncate">{members.length} membres</p>
          </div>
        </div>
        <div className="ml-2 flex items-center gap-2 flex-shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewGroupInfo();
            }}
            className="text-sm text-teal-600 hover:text-teal-700 px-2 py-1 rounded-md hover:bg-teal-50"
          >
            Infos
          </button>
          <MessageTools tools={tools} />
        </div>
      </div>

      {showInfo && isMobile && (
        <GroupInfoBubble
          group={group}
          currentUser={currentUser}
          onViewGroupInfo={() => {
            handleCloseInfo();
            onViewGroupInfo();
          }}
          onClose={handleCloseInfo}
        />
      )}

      {showInfo && !isMobile && (
        <div className="fixed inset-y-0 right-0 w-full sm:w-96 bg-white shadow-lg z-50 overflow-y-auto transition-transform transform translate-x-0">
          <div className="flex justify-between items-center p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Informations du groupe</h2>
            <button
              onClick={handleCloseInfo}
              className="text-gray-600 hover:text-gray-800"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <GroupInfo
            group={group}
            currentUser={currentUser}
            onAddMember={onAddMember}
            onRemoveMember={onRemoveMember}
            onLeaveGroup={onLeaveGroup}
            onUpdateGroup={onUpdateGroup}
          />
        </div>
      )}
    </>
  );
}

GroupHeader.propTypes = {
  group: PropTypes.shape({
    name: PropTypes.string.isRequired,
    photoPath: PropTypes.string,
    members: PropTypes.array.isRequired,
  }).isRequired,
  currentUser: PropTypes.shape({
    email: PropTypes.string.isRequired,
  }).isRequired,
  onViewGroupInfo: PropTypes.func.isRequired,
  onAddMember: PropTypes.func.isRequired,
  onRemoveMember: PropTypes.func.isRequired,
  onLeaveGroup: PropTypes.func.isRequired,
  onUpdateGroup: PropTypes.func.isRequired,
  tools: PropTypes.array,
};

export default GroupHeader;