import React from 'react';

function MenuButton({ onClick }) {
  return (
    <button onClick={onClick} className="p-2 bg-gray-800 text-white">
      ☰
    </button>
  );
}

export default MenuButton;