// components/chatArea/components/ErrorIndicator.jsx
import React from "react";

const ErrorIndicator = ({ onResend, message }) => {
  return (
    <div className="flex items-center bg-red-100 text-red-700 p-2 rounded-md mt-2">
      <span className="material-icons mr-2">close</span>
      <span className="flex-grow">{message}</span>
      <button
        onClick={onResend}
        className="ml-2 bg-red-600 text-white px-2 py-1 rounded-md hover:bg-red-500 transition duration-200"
      >
        Renvoyer
      </button>
    </div>
  );
};

export default ErrorIndicator;