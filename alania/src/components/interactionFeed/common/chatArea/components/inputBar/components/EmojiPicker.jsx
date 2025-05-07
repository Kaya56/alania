import { useState } from "react";
import PropTypes from "prop-types";
import { FaceSmileIcon, XMarkIcon } from "@heroicons/react/24/outline";

function EmojiPicker({ onEmojiSelect }) {
  const [isOpen, setIsOpen] = useState(false);
  const emojis = ["😊", "😂", "👍", "😍", "😎", "🥳", "😭", "🙃", "❤️", "🔥"];

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="cursor-pointer hover:bg-gray-200 rounded-full p-2"
        aria-label="Ouvrir le picker d'emoji"
      >
        <FaceSmileIcon className="h-6 w-6 text-gray-600 hover:text-blue-500" />
      </button>
      {isOpen && (
        <>
          <div className="absolute bottom-full left-0 w-52 bg-gray-50 border border-gray-200 rounded-lg p-4 shadow-lg grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 z-30 box-border transform -translate-y-2">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-1 right-1 p-1 bg-white rounded-full text-gray-500 hover:text-gray-700"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
            {emojis.map((emoji) => (
              <button
                key={emoji}
                onClick={() => {
                  onEmojiSelect(emoji);
                  setIsOpen(false);
                }}
                className="text-xl p-1.5 rounded hover:bg-gray-200 transition-all duration-200"
                role="button"
                aria-label={`Insérer l'emoji ${emoji}`}
              >
                {emoji}
              </button>
            ))}
          </div>
          <div onClick={() => setIsOpen(false)} className="fixed inset-0 z-25" />
        </>
      )}
    </div>
  );
}

EmojiPicker.propTypes = {
  onEmojiSelect: PropTypes.func.isRequired,
};

export default EmojiPicker;