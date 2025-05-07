import { useState, useEffect } from "react";
import { PhoneIcon, VideoCameraIcon, UserGroupIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import CallService from "../../../services/call/CallService";
import UserService from "../../../services/users/UserService";

function CallDetails({ callId, onBack }) {
  const [call, setCall] = useState(null);
  const [participantsData, setParticipantsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCall = async () => {
      try {
        const callData = await CallService.getAllCalls().then(calls => calls.find(c => c.id === callId));
        if (!callData) throw new Error("Appel non trouvé");
        
        const participantsInfo = await Promise.all(
          callData.participants.map(async (userId) => {
            const user = await UserService.getUserById(userId);
            return { id: userId, username: user?.username || `Utilisateur ${userId}`, photoUrl: user?.photoUrl };
          })
        );

        setCall({
          ...callData,
          isGroupCall: callData.participants.length > 2,
        });
        setParticipantsData(participantsInfo);
        setLoading(false);
      } catch (err) {
        setError("Erreur lors du chargement des détails de l'appel");
        setLoading(false);
      }
    };
    fetchCall();
  }, [callId]);

  if (loading) {
    return <div className="p-4 text-gray-500">Chargement...</div>;
  }

  if (error || !call) {
    return <div className="p-4 text-red-600">{error || "Appel non trouvé"}</div>;
  }

  const getStatusLabel = () => {
    switch (call.status) {
      case "completed": return "Terminé";
      case "missed": return "Manqué";
      case "declined": return "Refusé";
      case "unreachable": return "Injoignable";
      default: return "Inconnu";
    }
  };

  const getStatusColor = () => {
    switch (call.status) {
      case "completed": return "text-green-600";
      case "missed": return "text-red-600";
      case "declined": return "text-red-600";
      case "unreachable": return "text-gray-600";
      default: return "text-gray-500";
    }
  };

  return (
    <div className="p-4 h-full flex flex-col bg-white rounded-lg shadow-md">
      {/* Bouton retour */}
      <button
        onClick={onBack}
        className="mb-4 text-blue-500 hover:underline flex items-center"
        aria-label="Retour à l'historique des appels"
      >
        ← Retour
      </button>

      {/* Détails de l'appel */}
      <div className="flex items-center mb-6">
        <div className="w-12 h-12 flex items-center justify-center bg-blue-100 rounded-full">
          {call.isGroupCall ? (
            <UserGroupIcon className="w-6 h-6 text-blue-500" />
          ) : call.type === "audio" ? (
            <PhoneIcon className="w-6 h-6 text-blue-500" />
          ) : (
            <VideoCameraIcon className="w-6 h-6 text-blue-500" />
          )}
        </div>
        <div className="ml-4">
          <p className="text-lg font-semibold">
            {call.isGroupCall
              ? "Appel de groupe"
              : call.type === "audio"
              ? "Appel audio"
              : "Appel vidéo"}
          </p>
          <p className="text-sm text-gray-500">
            {new Date(call.timestamp).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Participants */}
      <div className="mb-4">
        <h3 className="text-md font-semibold mb-2">Participants</h3>
        <ul className="space-y-2">
          {participantsData.map((participant) => (
            <li
              key={participant.id}
              className="flex items-center p-2 rounded-md hover:bg-gray-100 cursor-pointer transition-all"
              onClick={() => navigate(`/contacts/${participant.id}`)}
              aria-label={`Voir le profil de ${participant.username}`}
            >
              {participant.photoUrl ? (
                <img
                  src={participant.photoUrl}
                  alt={participant.username}
                  className="w-8 h-8 rounded-full object-cover mr-2"
                />
              ) : (
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-2">
                  <span className="text-gray-500 text-xs">{participant.username[0]}</span>
                </div>
              )}
              <span className="text-gray-700">{participant.username}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Statut et durée */}
      <div>
        <p className="text-sm text-gray-500">
          <span className="font-semibold">Statut :</span>{" "}
          <span className={getStatusColor()}>{getStatusLabel()}</span>
        </p>
        <p className="text-sm text-gray-500">
          <span className="font-semibold">Durée :</span>{" "}
          {call.duration ? `${Math.floor(call.duration / 60)} min` : "Non connecté"}
        </p>
      </div>
    </div>
  );
}

export default CallDetails;