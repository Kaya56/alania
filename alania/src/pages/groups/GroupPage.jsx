// pages/group/GroupPage.jsx
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useGroups } from '../../hooks/useGroups';
import GroupList from '../../components/interactionFeed/groupChat/GroupList';
import { Link } from 'react-router-dom';

function GroupPage() {
  const { currentUser } = useAuth();
  const { groups, loading, error } = useGroups(currentUser?.email);
  const [selectedGroupId, setSelectedGroupId] = useState(null);

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-lg text-gray-600">Connectez-vous pour voir vos groupes</p>
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

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-4">
      <div className="w-full max-w-lg">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Groupes</h1>
          <Link
            to="/groups/create"
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Créer un groupe
          </Link>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>
        )}

        <GroupList
          groups={groups}
          onSelectGroup={setSelectedGroupId}
          selectedGroupId={selectedGroupId}
        />
      </div>
    </div>
  );
}

export default GroupPage;