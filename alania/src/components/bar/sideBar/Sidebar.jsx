import { useLocation } from 'react-router-dom';
import { useEffect, useRef, useState, useCallback } from 'react';
import SettingsPanel from '../../settings/SettingsPanel';

function Sidebar({
  menuItemsTop,
  menuItemsBottom,
  activeView,
  isSettingsPanelOpen,
  setIsSettingsPanelOpen,
  currentUser,
  onLogout,
}) {
  const location = useLocation();
  const containerRef = useRef(null);
  const [selectedOption, setSelectedOption] = useState('profile');

  // Gestion unifiée du clic en dehors (via capture)
  const handleClickOutside = useCallback(
    (event) => {
      // Les boutons 'Paramètres' et 'Profil' doivent être exclus
      const isSidebarButton = event.target.closest('[data-settings-button]') || event.target.closest('[data-profile-button]');
      if (isSidebarButton) return;

      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsSettingsPanelOpen(false);
      }
    },
    [setIsSettingsPanelOpen]
  );

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside, { capture: true });
    return () =>
      document.removeEventListener('mousedown', handleClickOutside, { capture: true });
  }, [handleClickOutside]);

  const openSettingsPanel = (option) => {
    setSelectedOption(option);
    setIsSettingsPanelOpen(true);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-12 md:w-20 bg-gray-200 border-r border-gray-200 flex flex-col justify-between p-3 h-full"
    >
      {/* Menu du haut avec animations et tooltips */}
      <div className="flex flex-col items-center space-y-4 p-4 bg-white rounded-lg border border-gray-200 shadow-[3px_3px_10px_0_rgba(0,0,0,0.25)]">
        {menuItemsTop.map((item, index) => {
          const isActive = activeView === item.viewName;
          return (
            <button
              key={index}
              onClick={item.action}
              className={`relative group py-1 text-gray-600 focus:outline-none transition-colors duration-200 ${
                isActive ? 'text-green-600' : 'hover:text-green-500'
              }`}
              aria-label={item.label}
            >
              <item.icon className="h-6 w-6 transition-transform duration-300 group-hover:scale-110" />
              <span
                className={`absolute bottom-0 left-0 w-full h-1 bg-green-500 transition-all duration-300 ${
                  isActive ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0'
                }`}
              ></span>
              <span className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Menu du bas */}
      <div className="flex flex-col items-center space-y-4 p-4 bg-white rounded-lg border border-gray-200 shadow-[3px_3px_10px_0_rgba(0,0,0,0.3)]">
        {menuItemsBottom.map((item, index) => {
          const isActive = location.pathname === item.path;
          const option = item.label === 'Paramètres' ? 'general' : item.label === 'Profil' ? 'profile' : null;
          return (
            <button
              key={index}
              onClick={() => (option ? openSettingsPanel(option) : item.action())}
              className={`relative group py-1 text-gray-600 focus:outline-none transition-colors duration-200 ${
                isActive ? 'text-green-600' : 'hover:text-green-500'
              }`}
              aria-label={item.label}
              data-settings-button={item.label === 'Paramètres' ? 'true' : undefined}
              data-profile-button={item.label === 'Profil' ? 'true' : undefined}
            >
              <item.icon className="h-6 w-6 transition-transform duration-300 group-hover:scale-110" />
              <span
                className={`absolute bottom-0 left-0 w-full h-1 bg-green-500 transition-all duration-300 ${
                  isActive ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0'
                }`}
              ></span>
              <span className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Panneau des paramètres */}
      <SettingsPanel
        isOpen={isSettingsPanelOpen}
        onClose={() => setIsSettingsPanelOpen(false)}
        selectedOption={selectedOption}
        setSelectedOption={setSelectedOption}
        currentUser={currentUser}
        onLogout={onLogout}
      />
    </div>
  );
}

export default Sidebar;
