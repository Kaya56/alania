import React from 'react';

function HorizontalSidebar({ menuItemsTop, view, setView }) {
  return (
    <div className="flex w-full bg-gray-100 border-b border-gray-200 px-2">
      {menuItemsTop.map((item, index) => {
        const isActive = view === item.viewName;
        return (
          <button
            key={index}
            onClick={item.action}
            className={`relative flex-1 py-2 text-gray-600 focus:outline-none group transition-all duration-300 ease-in-out ${
              isActive ? 'text-green-600' : 'hover:text-green-500'
            }`}
            aria-label={item.label}
          >
            {/* Icône avec animation de survol et transition douce */}
            <item.icon
              className={`h-6 w-6 mx-auto transition-transform duration-300 ease-in-out ${
                isActive ? 'scale-110' : 'group-hover:scale-110'
              }`}
            />
            {/* Texte avec transition douce */}
            <span
              className={`text-xs mt-1 block transition-opacity duration-300 ease-in-out ${
                isActive ? 'opacity-100' : 'opacity-75 group-hover:opacity-100'
              }`}
            >
              {item.label}
            </span>
            {/* Bordure inférieure animée */}
            <span
              className={`absolute bottom-0 left-0 w-full h-0.5 bg-green-600 transition-transform duration-300 ease-in-out origin-center ${
                isActive ? 'scale-x-100' : 'scale-x-0'
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}

export default HorizontalSidebar;