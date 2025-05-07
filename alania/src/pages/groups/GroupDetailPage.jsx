// src/pages/groups/GroupDetailPage.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';
import GroupService from '../../services/group/GroupService';
import MessageService from '../../services/message/MessageService';
import ContactService from '../../services/contact/ContactService';

function GroupDetailPage() {
  const { currentUser } = useAuth();
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGroup = async () => {
      try {
        const groupData = await GroupService.getGroupById(currentUser.email, groupId);
        const groupMembers = await GroupService.getMembers(currentUser.email, groupId);
        const groupMessages = await MessageService.getMessages(currentUser.email, {
          targetId: groupId,
          receiverType: 'group',
        });
        const userContacts = await ContactService.getContacts(currentUser.email);
        setGroup(groupData);
        setMembers(groupMembers);
        setMessages(groupMessages);
        setContacts(userContacts);
      } catch (err) {
        setError('Erreur lors du chargement du groupe');
      } finally {
        setLoading(false);
      }
    };
    if (currentUser) fetchGroup();
  }, [currentUser, groupId]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    try {
      const message = {
        id: `msg-${Date.now()}`,
        senderId: currentUser.email,
        content: JSON.stringify({ text: newMessage }),
        status: 'sent',
        sentAt: Date.now(),
      };
      await MessageService.saveMessage(currentUser.email, {
        targetId: groupId,
        receiverType: 'group',
        message,
      });
      setMessages((prev) => [...prev, { ...message, type: 'message' }]);
      setNewMessage('');
    } catch (err) {
      setError("Erreur lors de l'envoi du message");
    }
  };

  const handleAddMembers = async () => {
    try {
      for (const memberEmail of selectedMembers) {
        await GroupService.addMember(currentUser.email, groupId, memberEmail);
      }
      const updatedMembers = await GroupService.getMembers(currentUser.email, groupId);
      setMembers(updatedMembers);
      setSelectedMembers([]);
    } catch (err) {
      setError("Erreur lors de l'ajout des membres");
    }
  };

  const handleMemberToggle = (email) => {
    setSelectedMembers((prev) =>
      prev.includes(email) ? prev.filter((id) => id !== email) : [...prev, email]
    );
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-lg text-gray-600">Connectez-vous pour voir le groupe</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-lg text-gray-600">Chargement...</p>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-lg text-gray-600">Groupe non trouvé</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-4">
      <div className="w-full max-w-lg">
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate('/groups')}
            className="mr-4 text-gray-600 hover:text-gray-800"
          >
            ← Retour
          </button>
          <h1 className="text-2xl font-bold text-gray-900">{group.name}</h1>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>
        )}

        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Détails</h2>
          <p className="text-gray-600">{group.description || 'Aucune description'}</p>
          {group.photoPath && (
            <img
              src={`file://${group.photoPath}`}
              alt={group.name}
              className="w-20 h-20 rounded-full mt-4"
            />
          )}
          <p className="text-sm text-gray-500 mt-2">{members.length} membres</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Membres</h2>
          <ul className="space-y-2">
            {members.map((member) => (
              <li key={member.userId} className="text-gray-800">
                {member.userId}
              </li>
            ))}
          </ul>
          <div className="mt-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Ajouter des membres</h3>
            <ul className="space-y-2">
              {contacts.map((contact) => (
                <li key={contact.email} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedMembers.includes(contact.email)}
                    onChange={() => handleMemberToggle(contact.email)}
                    className="mr-2"
                  />
                  <span className="text-gray-800">{contact.name}</span>
                </li>
              ))}
            </ul>
            <button
              onClick={handleAddMembers}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Ajouter
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Messages</h2>
          <ul className="space-y-2 max-h-96 overflow-y-auto">
            {messages.map((msg) => (
              <li
                key={msg.id}
                className={`p-2 rounded-lg ${
                  msg.senderId === currentUser.email ? 'bg-blue-50 ml-8' : 'bg-gray-50 mr-8'
                }`}
              >
                <p className="text-sm text-gray-600">
                  {msg.senderId} : {JSON.parse(msg.content).text}
                </p>
                <p className="text-xs text-gray-400">
                  {new Date(msg.sentAt).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1 p-2 border rounded-lg mr-2"
              placeholder="Écrire un message..."
            />
            <button
              onClick={handleSendMessage}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Envoyer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GroupDetailPage;