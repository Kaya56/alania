import React, { useState } from "react";
import { CheckCircleIcon, PhoneIcon, VideoCameraIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import { DocumentIcon, PaperClipIcon } from "@heroicons/react/24/outline";
import { useFileUrl } from "../../../../../../hooks/useFileUrl";
import { useSettings } from "../../../../../../hooks/useSettings";
import { useAuth } from "../../../../../../context/AuthContext";
import MessageService from "../../../../../../services/message/MessageService";
import ErrorIndicator from "./components/ErrorIndicator";
import CallMessage from "./components/CallMessage";

const MessageOptionsMenu = ({ options, isMine }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className={`absolute ${isMine ? 'right-full' : 'left-full'} top-1/2 transform -translate-y-1/2 group-hover:opacity-100 opacity-0 transition-opacity mx-2`}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-1 rounded-2xl hover:border border-gray-700
          ${isMine ? 'hover : hover:bg-teal-500' : 'hover:bg-gray-200'} 
          transition-all duration-200
        `}
      >
        <ChevronDownIcon className="h-5 w-5 text-black" />
      </button>
      {isOpen && (
        <div className={`absolute ${isMine ? 'left-full ml-1' : 'right-full mr-1'} mt-1 w-32 bg-white border border-gray-200 rounded-md z-10`}>
          {options.map((option, index) => (
            <button
              key={index}
              onClick={() => {
                option.onClick();
                setIsOpen(false);
              }}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-teal-50"
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

function ChatBubble({ message, isMine, isFirst, isLast, status, onReply, messages, deleteMessage }) {
  const { content, senderId, sentAt } = message;
  const { text, file, voice, call, replyTo } = content;
  const { messageStatusMode } = useSettings();
  const { currentUser } = useAuth();
  const replyMessage = replyTo ? messages.find((m) => m.id === replyTo) : null;

  const baseStyles =
    "max-w-[80%] p-3 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200 relative";
  const mineStyles = isMine
    ? "bg-teal-600 text-white"
    : "bg-gray-200 border border-gray-400 text-gray-900 mb-1";
  const positionStyles = isMine ? "ml-auto" : "mr-auto";
  const cornerStyles = isMine
    ? isLast
      ? "rounded-br-none"
      : ""
    : isFirst
      ? "rounded-tl-none"
      : "";
  const tailStyles = isMine
    ? isLast
      ? 'after:content-[""] after:absolute after:bottom-0 after:right-[-8px] after:border-r-[10px] after:border-b-[10px] after:border-r-transparent after:border-b-teal-600'
      : ""
    : isFirst
      ? `
        before:content-[""] before:absolute before:top-[-0.9px] before:left-[-12px]
        before:border-l-[12px] before:border-t-[12px]
        before:border-l-transparent before:border-t-gray-400
    
        after:content-[""] after:absolute after:top-[-0.1px] after:left-[-10px]
        after:border-l-[10px] after:border-t-[10px]
        after:border-l-transparent after:border-t-gray-200
      `
      : ""    

  const renderStatus = () => {
    if (isMine && messageStatusMode) {
      switch (status) {
        case "sent":
          return <span className="ml-1 text-teal-100">✓</span>;
        case "delivered":
          return <span className="ml-1 text-teal-100">✓✓</span>;
        case "read":
          return (
            <CheckCircleIcon
              className="ml-1 w-4 h-4 text-teal-200 inline pb-0.5"
              aria-hidden="true"
            />
          );
        case "error":
          return null;
        default:
          return null;
      }
    } else if (!isMine) {
      switch (status) {
        case "delivered":
          return <span className="ml-1 text-gray-500">Non lu</span>;
        case "read":
          return null;
        default:
          return null;
      }
    }
    return null;
  };

  const handleResend = async () => {
    try {
      await MessageService.resendMessage(message.id);
    } catch (err) {
      console.error("Erreur lors du renvoi du message:", err);
    }
  };

  const handleCallAgain = () => {
    console.log(`Relancer un appel ${call?.type} avec ${senderId}`);
  };

  const options = [
    {
      label: "Supprimer",
      onClick: () => deleteMessage(message.id),
    },
    !call && {
      label: "Répondre",
      onClick: () => onReply(message),
    },
    call && {
      label: "Rappeler",
      onClick: handleCallAgain,
    },
  ].filter(Boolean);

  return (
    <div className="flex mb-1 relative group">
      <div
        className={`min-w-0 ${positionStyles} ${baseStyles} ${mineStyles} ${cornerStyles} ${tailStyles}`}
      >
        {!isMine && isFirst && (
          <p className="text-sm font-medium text-gray-600 mb-2">
            {message.sender?.username || `${senderId}`}
          </p>
        )}
        {replyMessage && (
          <div
            className={`p-2 rounded-lg mb-2 text-sm border-l-4 ${
              isMine
                ? "bg-teal-700/50 border-teal-400 text-teal-100"
                : "bg-gray-100 border-teal-500 text-gray-800"
            }`}
          >
            <span className="font-medium">
              {replyMessage.senderId}:
            </span>{" "}
            {replyMessage.text || "Message"}
          </div>
        )}
        {call && (
          <div className="flex items-center space-x-2">
            <CallMessage
              type={call.type}
              status={call.status}
              duration={
                call.duration
                  ? `${Math.floor(call.duration / 60)} min`
                  : undefined
              }
              sentAt={sentAt}
            />
            {call.status !== "completed" && (
              <button
                onClick={handleCallAgain}
                className="p-2 text-teal-300 hover:text-teal-400 transition-colors"
                aria-label={`Rappeler ${
                  call.type === "audio" ? "vocal" : "vidéo"
                }`}
              >
                {call.type === "audio" ? (
                  <PhoneIcon className="h-5 w-5" />
                ) : (
                  <VideoCameraIcon className="h-5 w-5" />
                )}
              </button>
            )}
          </div>
        )}
        {file && file.length > 0 && (
          <div className="mt-3 space-y-2">
            {file.map((f) => (
              <FileDisplay key={f.id} fileId={f.id} isMine={isMine} />
            ))}
          </div>
        )}
        {voice && voice.length > 0 && (
          <div className="mt-3 space-y-2">
            {voice.map((v) => (
              <VoiceDisplay key={v.id} fileId={v.id} isMine={isMine} />
            ))}
          </div>
        )}
        {isMine && status === "error" && (
          <ErrorIndicator
            onResend={handleResend}
            message="Une erreur est survenue lors de l'envoi de votre message."
          />
        )}
        <div
          className={`w-full flex justify-space text-xs ${isFirst ? "mt-2" : ""} ${
            isMine ? "text-teal-100" : "text-gray-800"
          }`}
        >
          <div className="w-full text-base break-words leading-relaxed">
            {text}
            <span className="float-right text-xs p-2">
              {new Date(sentAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
              {renderStatus()}
            </span>
          </div>
        </div>
        <MessageOptionsMenu options={options} isMine={isMine} />
      </div>
    </div>
  );
}

function FileDisplay({ fileId, isMine }) {
  const { fileUrl, metadata, error } = useFileUrl(fileId);
  if (error)
    return <p className="text-red-500 text-sm">Erreur de chargement du fichier</p>;
  if (!fileUrl || !metadata) return null;

  return (
    <div className="flex items-center space-x-2">
      {metadata.type.startsWith("image/") ? (
        <img
          src={fileUrl}
          alt={metadata.name}
          className="h-16 w-16 object-cover shadow-sm"
        />
      ) : metadata.type.startsWith("application/pdf") ? (
        <DocumentIcon className="h-8 w-8 text-red-900" />
      ) : (
        <PaperClipIcon className="h-8 w-8 text-gray-500" />
      )}
      <a
        href={fileUrl}
        download={metadata.name}
        className={`transition-colors text-sm ${isMine ? "text-white" : "text-gray-900"}`}
      >
        {metadata.name} ({(metadata.size / 1024).toFixed(1)} KB)
      </a>
    </div>
  );
}

function VoiceDisplay({ fileId, isMine }) {
  console.clear();
  console.log("VoiceDisplay", fileId, isMine);
  const { fileUrl, metadata, error } = useFileUrl(fileId);
  console.log("VoiceDisplay", fileUrl, metadata, error);
  if (error)
    return (
      <p className="text-red-500 text-sm">
        Erreur de chargement de l'enregistrement
      </p>
    );
  if (!fileUrl || !metadata) return null;

  return (
    <div className="flex items-center space-x-2">
      <button
        className={`transition-colors ${isMine ? "text-white" : "text-gray-900"}`}
        aria-label="Écouter le message vocal"
      >
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 5v14l8-7z"
          />
        </svg>
      </button>
      <audio controls className="max-w-full h-8">
        <source src={fileUrl} type={metadata.type} />
        Votre navigateur ne supporte pas l'élément audio.
      </audio>
      <span className={`text-xs ${isMine ? "text-teal-100" : "text-gray-500"}`}>
        Durée: {metadata.duration || "0:12"}
      </span>
    </div>
  );
}

export default ChatBubble;