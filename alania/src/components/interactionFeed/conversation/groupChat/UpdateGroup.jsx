import { useState } from "react";
import PropTypes from "prop-types";
import { useAuth } from "../../../../context/AuthContext";
import { useGroups } from "../../../../hooks/useGroups";
import MemberSelector from "./MemberSelector";

function UpdateGroup({ isOpen, onClose, group }) {
  const { currentUser } = useAuth();
  const { updateGroup } = useGroups(currentUser?.email);
  const [name, setName] = useState(group?.name || "");
  const [description, setDescription] = useState(group?.description || "");
  const [selectedMembers, setSelectedMembers] = useState(group?.members || []);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Le nom du groupe est requis");
      return;
    }
    try {
      await updateGroup(group.id, {
        name,
        description,
        members: selectedMembers.map((m) => m.email),
      });
      setSuccess("Groupe mis à jour avec succès !");
      setTimeout(() => {
        onClose();
        setSuccess(null);
      }, 1500);
    } catch (err) {
      setError("Erreur lors de la mise à jour du groupe");
    }
  };

  if (!isOpen || !currentUser || !group) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-lg w-full shadow-lg animate-slide-up">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Modifier le groupe</h2>
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>
        )}
        {success && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">{success}</div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Nom du groupe</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 p-2 w-full border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Entrez le nom du groupe"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 p-2 w-full border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Entrez une description (optionnel)"
              rows="4"
            />
          </div>
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-800 mb-2">Membres</h3>
            <MemberSelector
              currentUser={currentUser}
              selectedMembers={selectedMembers}
              onMembersChange={setSelectedMembers}
            />
          </div>
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 focus:ring-2 focus:ring-offset-1 focus:ring-gray-300"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:ring-2 focus:ring-offset-1 focus:ring-blue-300"
            >
              Mettre à jour
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

UpdateGroup.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  group: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string,
    description: PropTypes.string,
    members: PropTypes.array,
  }).isRequired,
};

export default UpdateGroup;