import { useState } from 'react';

function Menu({ options }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="absolute top-2 right-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-2xl hover:text-blue-500 focus:outline-none"
      >
        ⋯
      </button>
      {isOpen && (
        <ul className="absolute right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg">
          {options.map((option, index) => (
            <li
              key={index}
              onClick={() => { option.action(); setIsOpen(false); }}
              className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Menu;