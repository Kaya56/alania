import { useState } from 'react';
import SearchBar from '../../../bar/searchBar/SearchBar';
import ConversationPreview from './ConversationPreview';

function ContactList({ contacts, currentUser, onSelectContact, selectedContactId, loading, onOpenAddContact }) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredContacts = contacts.filter((contact) => {
    if (!contact.id) {
      console.warn('Contact sans ID détecté:', contact);
      return null;
    }
    if (!contact.username && contact.email) {
      contact.username = contact.email.split('@')[0];
    }
    return contact.username.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="h-full p-4 border border-gray-100 bg-gray-50">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900 tracking-tight">Discussions</h2>
        <button
          onClick={onOpenAddContact}
          className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-2 py-1 rounded-md transition-all duration-200"
          title="Ajouter un contact"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Ajouter
        </button>
      </div>
      <div className="mb-4">
        <SearchBar
          onSearch={setSearchQuery}
          value={searchQuery}
          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all duration-200 text-gray-700 placeholder-gray-400"
        />
      </div>
      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-500"></div>
        </div>
      ) : filteredContacts.length > 0 ? (
        <div className="overflow-y-auto mt-2 space-y-1 h-[calc(100vh-220px)] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          {filteredContacts.map((contact) => (
            <ConversationPreview
              key={contact.id}
              contact={contact}
              currentUser={currentUser}
              onClick={() => onSelectContact(contact.id, 'user')}
              isSelected={contact.id === selectedContactId}
            />
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center h-32 text-gray-500 text-sm">
          Aucun contact trouvé
        </div>
      )}
    </div>
  );
}

export default ContactList;