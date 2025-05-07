import { useState } from 'react';
import { TrashIcon } from '@heroicons/react/24/outline';
import SearchBar from '../../bar/searchBar/SearchBar';
import CallItem from './CallItem';
import CallDetails from './CallDetails';

function CallHistoryList({ calls, loading, error, removeCall, clearHistory }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCallId, setSelectedCallId] = useState(null);

  // Filtrer les appels en fonction de la recherche (par participants)
  const filteredCalls = calls.filter((call) =>
    call.participants.some((participant) =>
      participant.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const handleBack = () => {
    setSelectedCallId(null);
  };

  if (selectedCallId) {
    return <CallDetails callId={selectedCallId} onBack={handleBack} />;
  }

  return (
    <div className="h-full p-4 bg-white rounded-lg shadow-sm border border-gray-100">
      {/* En-tête */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900 tracking-tight">
          Historique des appels
        </h2>
      </div>

      {/* SearchBar */}
      <div className="mb-4">
        <SearchBar
          onSearch={setSearchQuery}
          value={searchQuery}
          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all duration-200 text-gray-700 placeholder-gray-400"
          placeholder="Rechercher un appel..."
        />
      </div>

      {/* Liste des appels */}
      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center h-32 text-red-600 text-sm">
          {error}
        </div>
      ) : filteredCalls.length > 0 ? (
        <div className="overflow-y-auto mt-2 space-y-1 h-[calc(100vh-220px)] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          {filteredCalls.map((call) => (
            <div key={call.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-all duration-200">
              <CallItem
                call={call}
                onClick={() => setSelectedCallId(call.id)}
                className="flex-1 cursor-pointer"
              />
              <button
                onClick={() => removeCall(call.id)}
                className="p-2 text-red-500 hover:text-red-600"
                aria-label={`Supprimer l'appel avec ${call.participants.join(', ')}`}
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center h-32 text-gray-500 text-sm">
          Aucun appel trouvé
        </div>
      )}
    </div>
  );
}

export default CallHistoryList;