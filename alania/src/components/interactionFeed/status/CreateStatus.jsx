// components/interactionFeed/status/CreateStatus.jsx
import { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";
import { groupService } from "../../../services/groups/groupService";

function CreateStatus({ onCreate }) {
  const { currentUser } = useAuth();
  const [components, setComponents] = useState({ text: "", image: "", video: "" });
  const [visibility, setVisibility] = useState("contacts");
  const [groupId, setGroupId] = useState("");
  const [groups, setGroups] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGroups = async () => {
      if (currentUser) {
        try {
          const userGroups = await groupService.getGroupsByCreator(currentUser.id);
          setGroups(userGroups);
        } catch (err) {
          setError("Erreur lors du chargement des groupes");
        }
      }
    };
    fetchGroups();
  }, [currentUser]);

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file); // Simuler un upload local
      setComponents((prev) => ({ ...prev, [type]: url }));
    }
  };

  const handleSubmit = () => {
    const hasContent = components.text.trim() || components.image || components.video;
    if (!hasContent) {
      setError("Veuillez ajouter du contenu au statut");
      return;
    }
    try {
      onCreate(
        {
          text: components.text || undefined,
          image: components.image || undefined,
          video: components.video || undefined,
        },
        visibility,
        visibility === "group" ? parseInt(groupId) : null
      );
      setComponents({ text: "", image: "", video: "" });
      setVisibility("contacts");
      setGroupId("");
      setError(null);
    } catch (err) {
      setError("Erreur lors de la création du statut");
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-lg font-bold mb-4 text-gray-800">Créer un statut</h2>
      {error && (
        <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">{error}</div>
      )}
      <textarea
        value={components.text}
        onChange={(e) => setComponents((prev) => ({ ...prev, text: e.target.value }))}
        placeholder="Entrez votre statut..."
        className="w-full p-2 border rounded-lg mb-4"
      />
      <div className="mb-4">
        <label className="block text-sm text-gray-600 mb-1">Image</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => handleFileChange(e, "image")}
          className="w-full p-2 border rounded-lg"
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm text-gray-600 mb-1">Vidéo</label>
        <input
          type="file"
          accept="video/*"
          onChange={(e) => handleFileChange(e, "video")}
          className="w-full p-2 border rounded-lg"
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm text-gray-600 mb-1">Visibilité</label>
        <select
          value={visibility}
          onChange={(e) => setVisibility(e.target.value)}
          className="w-full p-2 border rounded-lg"
        >
          <option value="public">Public</option>
          <option value="contacts">Mes contacts</option>
          <option value="group">Groupe</option>
        </select>
      </div>
      {visibility === "group" && (
        <div className="mb-4">
          <label className="block text-sm text-gray-600 mb-1">Sélectionner un groupe</label>
          <select
            value={groupId}
            onChange={(e) => setGroupId(e.target.value)}
            className="w-full p-2 border rounded-lg"
          >
            <option value="">Choisir un groupe</option>
            {groups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
        </div>
      )}
      <div className="flex space-x-4">
        <button
          onClick={handleSubmit}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Publier
        </button>
      </div>
    </div>
  );
}

export default CreateStatus;