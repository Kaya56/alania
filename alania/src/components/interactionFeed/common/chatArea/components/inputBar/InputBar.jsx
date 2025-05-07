import { PaperAirplaneIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { useState } from 'react';
import FileUploader from './components/FileUploader';
import VoiceRecorder from './components/VoiceRecorder';
import EmojiPicker from './components/EmojiPicker';

function InputBar({ email, newMessage, setNewMessage, onSend, onKeyPress, replyTo, setReplyTo }) {
  const [files, setFiles] = useState([]);
  const [voice, setVoice] = useState([]);

  const handleVoiceRecord = (voiceData) => {
    setVoice((prev) => {
      const filtered = prev.filter((v) => v.id !== voiceData.id);
      return [...filtered, voiceData];
    });
  };

  const handleVoiceRemove = (id) => {
    setVoice((prev) => prev.filter((v) => v.id !== id));
  };

  const removeFile = (id) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleSend = () => {
    if (newMessage.trim() || files.length || voice.length) {
      onSend({ text: newMessage.trim(), files, voice, replyTo: replyTo?.id || null });
      setNewMessage('');
      setFiles([]);
      setVoice([]);
      setReplyTo(null);
    }
  };

  return (
    <div className="flex flex-col pl-1 pr-4 border-t border-gray-400 bg-gray-100 shadow-lg">
      {/* Prévisualisation des fichiers */}
      {files.length > 0 && (
        <div className="flex overflow-x-auto gap-2 mb-2 px-1">
          {files.map((file) => (
            <div key={file.id} className="flex-shrink-0 bg-gray-200 p-2 rounded">
              {file.type.startsWith('image/') ? (
                <img src={file.url} alt={file.name} className="h-10 w-10 object-cover rounded" />
              ) : (
                <div className="text-sm text-gray-600 truncate max-w-[6rem]">{file.name}</div>
              )}
              <button onClick={() => removeFile(file.id)} className="ml-2 text-red-500">
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
      {/* Prévisualisation vocal */}
      {voice.length > 0 && (
        <div className="flex overflow-x-auto gap-2 mb-2 px-1">
          {voice.map((v) => (
            <div key={v.id} className="flex-shrink-0 bg-gray-200 p-2 rounded">
              <div className="text-sm text-gray-600 truncate max-w-[8rem]">Audio: {v.name}</div>
              <button onClick={() => handleVoiceRemove(v.id)} className="ml-2 text-red-500">
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
      {/* Réponse en cours */}
      {replyTo && (
        <div className="flex items-center bg-gray-400 p-2 rounded-lg mb-2 px-1">
          <span className="text-sm text-gray-600 mr-2">Réponse à :</span>
          <p className="text-sm text-gray-800 truncate flex-1">{replyTo.components.text}</p>
          <button onClick={() => setReplyTo(null)} className="ml-2 p-1 text-gray-500 hover:text-gray-700" aria-label="Annuler la réponse">
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      )}
      {/* Barre d'entrée responsive */}
      <div className="flex flex-wrap items-center py-2">
        <div className="flex space-x-2 items-center mb-2 sm:mb-0">
          <EmojiPicker onEmojiSelect={(emoji) => setNewMessage(newMessage + emoji)} className="cursor-pointer hover:bg-gray-200 rounded-full p-2" aria-label="Ajouter un emoji" />
          <FileUploader email={email} onFileSelect={(fd) => setFiles(fd)} className="cursor-pointer hover:bg-gray-200 rounded-full p-2" aria-label="Télécharger un fichier" />
        </div>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => (e.key === 'Enter' ? handleSend() : onKeyPress(e))}
          placeholder="Tapez votre message..."
          className="flex-1 w-full sm:w-auto mx-2 px-4 py-3 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-300"
          aria-label="Saisir un message"
        />
        <VoiceRecorder onVoiceRecord={handleVoiceRecord} onVoiceRemove={handleVoiceRemove} className="cursor-pointer hover:bg-gray-200 rounded-full p-2 mb-2 sm:mb-0" aria-label="Enregistrer un message vocal" />
        <button
          onClick={handleSend}
          className="ml-auto sm:ml-0 p-3 bg-teal-600 text-white rounded-full shadow hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-400"
          aria-label="Envoyer le message"
        >
          <PaperAirplaneIcon className="h-6 w-6 transition-transform duration-300 filter drop-shadow-md hover:scale-110 hover:rotate-3" />
        </button>
      </div>
    </div>
  );
}

export default InputBar;
