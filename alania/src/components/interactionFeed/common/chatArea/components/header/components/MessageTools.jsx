import { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import {
  EllipsisVerticalIcon,
  InformationCircleIcon
} from "@heroicons/react/24/outline";

function MessageTools({ tools = [] }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Fermer le menu déroulant si clic à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Afficher des boutons directs si ≤ 4 outils, sinon un menu déroulant
  const renderTools = () => {
    if (tools.length <= 4) {
      return (
        <div className="flex items-center gap-2">
          {tools.map((tool) => (
            <button
              key={tool.id}
              onClick={tool.action}
              className="p-1 text-teal-900 hover:text-teal-700 hover:bg-teal-50 rounded-md"
              aria-label={tool.label}
              title={tool.label}
            >
              {tool.icon || <InformationCircleIcon className="h-5 w-5" />}
            </button>
          ))}
        </div>
      );
    }

    return (
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-1 text-teal-600 hover:text-teal-700 hover:bg-teal-50 rounded-md"
          aria-label="Plus d'options"
          title="Plus d'options"
        >
          <EllipsisVerticalIcon className="h-5 w-5" />
        </button>
        {isOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
            <ul className="py-1">
              {tools.map((tool) => (
                <li
                  key={tool.id}
                  onClick={() => {
                    tool.action();
                    setIsOpen(false);
                  }}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-teal-50 cursor-pointer"
                >
                  {tool.icon || <InformationCircleIcon className="h-5 w-5" />}
                  {tool.label}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  return <div className="flex-shrink-0">{renderTools()}</div>;
}

MessageTools.propTypes = {
  tools: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      action: PropTypes.func.isRequired,
      icon: PropTypes.element,
    })
  ),
};

export default MessageTools;