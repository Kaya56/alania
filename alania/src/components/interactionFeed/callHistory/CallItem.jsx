import { PhoneIcon, VideoCameraIcon, UserGroupIcon } from "@heroicons/react/24/outline";
import { useAuth } from "../../../context/AuthContext";
import UserService from "../../../services/users/UserService";
import { useState, useEffect } from "react";

function CallItem({ call, onClick }) {
  const { type, timestamp, duration, participants, status } = call;
  const { currentUser } = useAuth();
  const [participantNames, setParticipantNames] = useState([]);
  const isGroupCall = participants.length > 2;

  useEffect(() => {
    const fetchNames = async () => {
      const names = await Promise.all(
        participants.map(async (userId) => {
          const user = await UserService.getUserById(userId);
          return user?.username || `Utilisateur ${userId}`;
        })
      );
      setParticipantNames(names);
    };
    fetchNames();
  }, [participants]);

  const displayName = isGroupCall
    ? "Appel de groupe"
    : participantNames.filter((name, idx) => participants[idx] !== currentUser.id).join(", ");

  return (
    <div
      onClick={onClick}
      className="flex items-center p-3 cursor-pointer rounded-md hover:bg-gray-100 transition-all"
      aria-label={`Détails de l'appel ${isGroupCall ? "de groupe" : type}`}
    >
      {/* Icône d'appel */}
      <div className="w-10 h-10 flex items-center justify-center bg-blue-100 rounded-full">
        {isGroupCall ? (
          <UserGroupIcon className="w-6 h-6 text-blue-500" />
        ) : type === "audio" ? (
          <PhoneIcon className="w-6 h-6 text-blue-500" />
        ) : (
          <VideoCameraIcon className="w-6 h-6 text-blue-500" />
        )}
      </div>

      {/* Informations principales */}
      <div className="ml-3 flex-1">
        <p className="text-sm font-medium text-gray-900">{displayName}</p>
        <p className="text-xs text-gray-500">
          {new Date(timestamp).toLocaleString()} {status === "missed" ? "(Manqué)" : ""}
        </p>
      </div>

      {/* Durée */}
      <div className="text-xs text-gray-400">
        {duration ? `${Math.floor(duration / 60)} min` : "Non connecté"}
      </div>
    </div>
  );
}

export default CallItem;