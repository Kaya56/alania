// components/interactionFeed/status/StatusItem.jsx
import { useState, useEffect } from "react";
import { userService } from "../../../services/users/userService";

function StatusItem({ status, onView }) {
  const [username, setUsername] = useState(status.userId);

  useEffect(() => {
    const fetchUsername = async () => {
      try {
        const user = await userService.getUserById(status.userId);
        setUsername(user?.username || `Utilisateur ${status.userId}`);
      } catch (err) {
        console.error("Erreur lors de la récupération du nom d'utilisateur :", err.message);
      }
    };
    fetchUsername();
  }, [status.userId]);

  return (
    <li
      className="p-4 border rounded-lg cursor-pointer hover:bg-gray-100"
      onClick={() => onView(status)}
    >
      <p className="text-sm text-gray-500">Publié par : {username}</p>
      {status.components.text && (
        <p className="text-gray-800 mt-1">{status.components.text}</p>
      )}
      {status.components.image && (
        <img
          src={status.components.image}
          alt="Statut"
          className="w-full h-auto rounded-lg mt-2"
        />
      )}
      {status.components.video && (
        <video
          src={status.components.video}
          controls
          className="w-full h-auto rounded-lg mt-2"
        />
      )}
    </li>
  );
}

export default StatusItem;