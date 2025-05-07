import React from "react";

const NotificationMessage = ({ text, type, onAction }) => {
  const typeStyles = {
    date: "text-gray-600 text-sm font-medium",
    unread: "text-teal-600 text-sm font-medium",
    system: "text-green-600 text-sm font-medium",
  };

  return (
    <div className="text-center py-2 px-4 max-w-full">
      <div
        className={`flex items-center justify-center space-x-3 w-full ${
          typeStyles[type] || typeStyles.date
        }`}
      >
        <hr className="flex-grow border-t border-gray-300" />
        <span className="whitespace-nowrap">{text}</span>
        <hr className="flex-grow border-t border-gray-300" />
      </div>
      {type === "unread" && onAction && (
        <button
          onClick={onAction}
          className="mt-1 text-teal-500 hover:text-teal-600 text-xs font-medium transition-colors"
        >
          Marquer comme lu
        </button>
      )}
    </div>
  );
};

export default NotificationMessage;