import SearchBar from '../../../components/searchBar/SearchBar';
import GroupList from '../../../components/interactionFeed/groupChat/GroupList';
import ContactList from '../../../components/interactionFeed/priveChat/ContactList';
import CallHistory from '../../../components/interactionFeed/callHistory/CallHistory';

function Entree({ type, data, onSelect, loading }) {
  return (
    <div className="h-full p-4 bg-gray-50 rounded-lg shadow-md">
      {/* Barre de recherche */}
      <SearchBar onSearch={(query) => console.log('Recherche :', query)} />

      {/* Contenu dynamique */}
      <div className="mt-4 overflow-y-auto space-y-2">
        {type === 'group' && (
          <GroupList groups={data} onSelectGroup={onSelect} />
        )}
        {type === 'contact' && (
          <ContactList contacts={data} onSelectContact={onSelect} loading={loading} />
        )}
        {type === 'call' && (
          <CallHistory calls={data} onSelectCall={onSelect} />
        )}
      </div>
    </div>
  );
}

export default Entree;