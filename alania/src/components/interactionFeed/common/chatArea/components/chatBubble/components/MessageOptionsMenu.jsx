// components/chatArea/components/notifications/MessageOptionsMenu.jsx
import React, { useState } from "react";
import { EllipsisVerticalIcon } from "@heroicons/react/24/outline";

const MessageOptionsMenu = ({ options }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggleMenu = () => {
    setIsOpen((prev) => !prev);
  };

  const handleOptionClick = (option) => {
    option.onClick();
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={handleToggleMenu}
        className="absolute right-0 top-0 opacity-100 cursor-pointer"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <EllipsisVerticalIcon className="w-5 h-5 text-gray-600" />
      </button>
      {isOpen && options.length > 0 && (
        <div className="absolute right-0 mt-2 w-48 bg-white border rounded-md shadow-lg z-10">
          <ul className="py-1">
            {options.map((option, index) => (
              <li key={index}>
                <button
                  onClick={() => handleOptionClick(option)}
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                >
                  {option.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default MessageOptionsMenu;