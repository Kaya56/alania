// components/chatArea/components/CallMessage.jsx
import { Phone, Video, XCircle, CheckCircle, Loader2 } from "lucide-react";

const CallMessage = ({ type, status, duration, sentAt }) => {
  const isVideo = type === "video";

  const getStatusIcon = () => {
    switch (status) {
      case "missed":
        return <XCircle className="text-red-600" size={18} />;
      case "declined":
        return <XCircle className="text-red-600" size={18} />;
      case "unreachable":
        return <XCircle className="text-gray-600" size={18} />;
      case "completed":
        return <CheckCircle className="text-green-600" size={18} />;
      default:
        return null;
    }
  };

  const getStatusLabel = () => {
    switch (status) {
      case "missed":
        return "Manqué";
      case "declined":
        return "Refusé";
      case "unreachable":
        return "Injoignable";
      case "completed":
        return "Terminé";
      default:
        return "";
    }
  };

  const callLabel = isVideo ? "Appel vidéo" : "Appel vocal";

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-gray-900 shadow-md w-fit max-w-xs">
      <div className="p-2 rounded-full bg-gray-200 dark:bg-gray-700">
        {isVideo ? (
          <Video className="text-blue-600" size={22} />
        ) : (
          <Phone className="text-green-600" size={22} />
        )}
      </div>
      <div className="flex flex-col flex-grow">
        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{callLabel}</span>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {getStatusLabel()}
          {duration ? ` - ${Math.floor(duration / 60)} min` : ""}
        </span>
      </div>
      <div className="flex flex-col items-end text-xs text-gray-500 dark:text-gray-400">
        <div>{getStatusIcon()}</div>
        <div>{new Date(sentAt).toLocaleDateString()}</div>
      </div>
    </div>
  );
};

export default CallMessage;