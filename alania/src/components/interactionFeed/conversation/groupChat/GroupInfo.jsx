import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import ContactService from '../../../../services/contact/contactService';
import { UsersIcon } from '@heroicons/react/24/outline';
import { useFileUrl } from '../../../../hooks/useFileUrl';
import MemberSelector from './MemberSelector';

function GroupInfo({ group, currentUser, onAddMember, onRemoveMember, onLeaveGroup, onUpdateGroup }) {
  const { name, description, photoPath, members, id } = group;
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMembers, setNewMembers] = useState([]);
  const [enrichedMembers, setEnrichedMembers] = useState([]);
  const { fileUrl: groupPhotoUrl, metadata: groupPhotoMetadata } = useFileUrl(photoPath, { lazy: false });

  useEffect(() => {
    const contactCache = new Map();

    const enrichMembers = async () => {
      try {
        const enriched = await Promise.all(
          members.map(async (member) => {
            if (contactCache.has(member.userId)) {
              return contactCache.get(member.userId);
            }
            const contact = await ContactService.getContactByEmail(currentUser.email, member.userId);
            const enrichedMember = {
              email: member.userId,
              username: contact?.name || member.userId,
              photoPath: contact?.photoPath,
              joinedAt: member.joinedAt,
            };
            contactCache.set(member.userId, enrichedMember);
            return enrichedMember;
          })
        );
        setEnrichedMembers(enriched);
      } catch (err) {
        console.error('Erreur lors de l\'enrichissement des membres:', err);
      }
    };
    enrichMembers();
  }, [members, currentUser.email]);

  const handleAddMembers = async () => {
    try {
      for (const member of newMembers) {
        await onAddMember(id, member.email);
      }
      setNewMembers([]);
      setShowAddMember(false);
    } catch (err) {
      console.error('Erreur lors de l\'ajout des membres:', err);
    }
  };

  return (
    <div className="flex flex-col p-4 bg-white rounded-lg shadow-sm border border-gray-100">
      <div className="flex justify-end gap-2 mb-4">
        <button
          onClick={() => setShowAddMember(true)}
          className="text-sm text-blue-600 hover:text-blue-700 px-2 py-1 rounded-md hover:bg-blue-50"
        >
          Ajouter des membres
        </button>
        <button
          onClick={() => onUpdateGroup(id, { name, description, photoPath })}
          className="text-sm text-blue-600 hover:text-blue-700 px-2 py-1 rounded-md hover:bg-blue-50"
        >
          Modifier
        </button>
        <button
          onClick={() => onLeaveGroup(id)}
          className="text-sm text-red-600 hover:text-red-700 px-2 py-1 rounded-md hover:bg-red-50"
        >
          Quitter le groupe
        </button>
      </div>
      <div className="flex items-center gap-4 mb-4">
        <div className="flex-shrink-0">
          {groupPhotoUrl && groupPhotoMetadata?.type.startsWith('image/') ? (
            <img
              src={groupPhotoUrl}
              alt={name}
              className="w-20 h-20 rounded-full object-cover shadow-sm"
            />
          ) : (
            <UsersIcon className="w-20 h-20 text-gray-400" />
          )}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">{name}</h3>
          <p className="text-sm text-gray-600">{description || 'Aucune description'}</p>
          <p className="text-sm text-gray-400 mt-1">{enrichedMembers.length} membres</p>
        </div>
      </div>
      <div>
        <h4 className="text-md font-medium text-gray-800 mb-2">Membres</h4>
        <ul className="space-y-2">
          {enrichedMembers.map((member) => {
            const { fileUrl: memberPhotoUrl, metadata: memberPhotoMetadata, ref: memberPhotoRef } = useFileUrl(member.photoPath);
            return (
              <li key={member.email} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div ref={memberPhotoRef}>
                    {memberPhotoUrl && memberPhotoMetadata?.type.startsWith('image/') ? (
                      <img
                        src={memberPhotoUrl}
                        alt={member.username}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <UsersIcon className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{member.username}</p>
                    <p className="text-xs text-gray-500">{member.email}</p>
                  </div>
                </div>
                {member.email !== currentUser.email && (
                  <button
                    onClick={() => onRemoveMember(id, member.email)}
                    className="text-sm text-red-600 hover:text-red-700"
                  >
                    Supprimer
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </div>
      {showAddMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Ajouter des membres</h3>
            <MemberSelector
              currentUser={currentUser}
              selectedMembers={newMembers}
              onMembersChange={setNewMembers}
            />
            <div className="flex justify-end gap-4 mt-4">
              <button
                onClick={() => setShowAddMember(false)}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400"
              >
                Annuler
              </button>
              <button
                onClick={handleAddMembers}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Ajouter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

GroupInfo.propTypes = {
  group: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string,
    photoPath: PropTypes.string,
    members: PropTypes.arrayOf(
      PropTypes.shape({
        userId: PropTypes.string.isRequired,
        joinedAt: PropTypes.number.isRequired,
      })
    ).isRequired,
  }).isRequired,
  currentUser: PropTypes.shape({
    email: PropTypes.string.isRequired,
  }).isRequired,
  onAddMember: PropTypes.func.isRequired,
  onRemoveMember: PropTypes.func.isRequired,
  onLeaveGroup: PropTypes.func.isRequired,
  onUpdateGroup: PropTypes.func.isRequired,
};

export default GroupInfo;