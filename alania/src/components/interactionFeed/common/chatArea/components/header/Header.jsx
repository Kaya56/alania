import PropTypes from 'prop-types';
import ConversationHeader from '../../../../conversation/priveChat/ConversationHeader';
import GroupHeader from '../../../../conversation/groupChat/GroupHeader';

function Header({ type, contact, group, currentUser, onViewInfo, onBlockContact, onDeleteContact, onViewProfile, tools = [] }) {
  if (type === 'contact' && contact) {
    return (
      <ConversationHeader
        contact={contact}
        currentUser={currentUser}
        onViewContactInfo={onViewInfo}
        onBlockContact={onBlockContact}
        onDeleteContact={onDeleteContact}
        onViewProfile={onViewProfile}
        tools={tools}
      />
    );
  }

  if (type === 'group' && group) {
    return (
      <GroupHeader
        group={group}
        currentUser={currentUser}
        onViewGroupInfo={onViewInfo}
        onAddMember={group.onAddMember}
        onRemoveMember={group.onRemoveMember}
        onLeaveGroup={group.onLeaveGroup}
        onUpdateGroup={group.onUpdateGroup}
        tools={tools}
      />
    );
  }

  return (
    <div className="bg-gray-100 border-b border-gray-200 flex items-center justify-between px-4 py-2">
      <p className="text-sm text-gray-500">Aucune conversation sélectionnée</p>
    </div>
  );
}

Header.propTypes = {
  type: PropTypes.oneOf(['contact', 'group']).isRequired,
  contact: PropTypes.shape({
    username: PropTypes.string,
    photoPath: PropTypes.string,
    status: PropTypes.string,
    lastSeen: PropTypes.number,
  }),
  group: PropTypes.shape({
    name: PropTypes.string,
    photoPath: PropTypes.string,
    members: PropTypes.array,
    onAddMember: PropTypes.func,
    onRemoveMember: PropTypes.func,
    onLeaveGroup: PropTypes.func,
    onUpdateGroup: PropTypes.func,
  }),
  currentUser: PropTypes.shape({
    email: PropTypes.string.isRequired,
  }).isRequired,
  onViewInfo: PropTypes.func.isRequired,
  onBlockContact: PropTypes.func,
  onDeleteContact: PropTypes.func,
  onViewProfile: PropTypes.func,
  tools: PropTypes.array,
};

export default Header;