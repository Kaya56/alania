// components/interactionFeed/groupChat/GroupList.jsx
import { useState } from 'react';
import SearchBar from '../../../bar/searchBar/SearchBar';
import GroupItem from './GroupItem';

function GroupList({ groups, onSelectGroup, selectedGroupId, loading, onOpenCreateGroup }) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredGroups = groups.filter((group) =>
    group.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full p-4 border border-gray-100 bg-gray-50">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900 tracking-tight">Groupes</h2>
        <button
          onClick={onOpenCreateGroup}
          className="flex items-center gap-1 text-sm font-medium text-blue-400 hover:text-blue-700 hover:bg-blue-50 px-2 py-1 rounded-md transition-all duration-200"
          title="Créer un groupe"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Créer
        </button>
      </div>
      <div className="mb-4">
        <SearchBar
          onSearch={setSearchQuery}
          value={searchQuery}
          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all duration-200 text-gray-700 placeholder-gray-400"
          placeholder="Rechercher un groupe..."
        />
      </div>
      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-500"></div>
        </div>
      ) : filteredGroups.length > 0 ? (
        <div className="overflow-y-auto mt-2 space-y-1 h-[calc(100vh-220px)] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          {filteredGroups.map((group) => (
            <GroupItem
              key={group.id}
              group={group}
              onClick={() => onSelectGroup(group.id, "group")}
              isSelected={group.id === selectedGroupId}
              className={`flex items-center p-3 rounded-lg transition-all duration-200 cursor-pointer ${
                group.id === selectedGroupId
                  ? 'bg-blue-50 text-blue-700'
                  : 'hover:bg-gray-50 text-gray-700'
              }`}
            />
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center h-32 text-gray-500 text-sm">
          Aucun groupe trouvé
        </div>
      )}
    </div>
  );
}

export default GroupList;