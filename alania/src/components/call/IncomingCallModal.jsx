import React from "react";

function IncomingCallModal({ caller, isVideo, onAccept, onReject }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
        <h2 className="text-xl font-bold mb-4">
          Appel {isVideo ? "vidéo" : "audio"} entrant
        </h2>
        <p className="text-lg mb-4">De : {caller.email}</p>
        <div className="flex justify-between">
          <button
            onClick={onAccept}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Accepter
          </button>
          <button
            onClick={onReject}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Refuser
          </button>
        </div>
      </div>
    </div>
  );
}

export default IncomingCallModal;