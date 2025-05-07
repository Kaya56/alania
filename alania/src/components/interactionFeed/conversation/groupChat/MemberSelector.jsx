import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import ContactService from "../../../../services/contact/ContactService";
import { UserIcon } from "@heroicons/react/24/outline";

function MemberSelector({ currentUser, onMembersChange, selectedMembers }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const searchContacts = async () => {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        return;
      }
      setLoading(true);
      try {
        const results = await ContactService.searchUserByEmailOrName(currentUser.email, searchQuery);
        const filteredResults = results.filter(
          (contact) => !selectedMembers.some((m) => m.email === contact.email)
        );
        setSearchResults(filteredResults);
      } catch (err) {
        console.error("Erreur lors de la recherche de contacts:", err);
      } finally {
        setLoading(false);
      }
    };
    const timeout = setTimeout(searchContacts, 300);
    return () => clearTimeout(timeout);
  }, [searchQuery, currentUser.email, selectedMembers]);

  const handleAddMember = (contact) => {
    onMembersChange([...selectedMembers, contact]);
    setSearchQuery("");
    setSearchResults([]);
  };

  const handleRemoveMember = (email) => {
    onMembersChange(selectedMembers.filter((m) => m.email !== email));
  };

  const handleAddMultiple = (contacts) => {
    onMembersChange([...selectedMembers, ...contacts]);
    setSearchQuery("");
    setSearchResults([]);
  };

  return (
    <div className="space-y-3">
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Rechercher un contact par nom ou email..."
        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all duration-200 text-gray-700 placeholder-gray-400"
      />
      {searchQuery && (
        <div className="max-h-40 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-sm">
          {loading ? (
            <div className="p-3 text-center text-gray-500">Chargement...</div>
          ) : searchResults.length > 0 ? (
            <ul className="divide-y divide-gray-100">
              {searchResults.map((contact) => (
                <li
                  key={contact.email}
                  onClick={() => handleAddMember(contact)}
                  className="flex items-center p-2 hover:bg-gray-50 cursor-pointer"
                >
                  <div className="flex-shrink-0">
                    {contact.photoUrl ? (
                      <img
                        src={contact.photoUrl}
                        alt={contact.username}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <UserIcon className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                  <div className="ml-2">
                    <p className="text-sm font-medium text-gray-900">{contact.username}</p>
                    <p className="text-xs text-gray-500">{contact.email}</p>
                  </div>
                </li>
              ))}
              {searchResults.length > 1 && (
                <li
                  onClick={() => handleAddMultiple(searchResults)}
                  className="p-2 text-center text-blue-600 hover:bg-blue-50 cursor-pointer text-sm"
                >
                  Ajouter tous les résultats
                </li>
              )}
            </ul>
          ) : (
            <div className="p-3 text-center text-gray-500">Aucun contact trouvé</div>
          )}
        </div>
      )}
      {selectedMembers.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedMembers.map((member) => (
            <div
              key={member.email}
              className="flex items-center bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded-full"
            >
              <span>{member.username}</span>
              <button
                onClick={() => handleRemoveMember(member.email)}
                className="ml-1 text-blue-600 hover:text-blue-800"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

MemberSelector.propTypes = {
  currentUser: PropTypes.shape({
    email: PropTypes.string.isRequired,
  }).isRequired,
  onMembersChange: PropTypes.func.isRequired,
  selectedMembers: PropTypes.arrayOf(
    PropTypes.shape({
      email: PropTypes.string.isRequired,
      username: PropTypes.string.isRequired,
      photoUrl: PropTypes.string,
    })
  ).isRequired,
};

export default MemberSelector;