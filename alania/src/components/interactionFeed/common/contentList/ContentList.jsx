import PropTypes from "prop-types";
import { useState, useRef, useMemo, useCallback, useEffect } from "react";
import ContactList from "../../conversation/priveChat/ContactList";
import GroupList from "../../conversation/groupChat/GroupList";
import CallHistoryList from "../../callHistory/CallHistoryList";
import HorizontalSidebar from "./components/HorizontalSidebar";
import CreateGroup from "../../conversation/groupChat/CreateGroup";
import AddContact from "../../conversation/priveChat/AddContact";
import ConfirmationModal from "../../modal/ConfirmationModal";
import { useSwipeable } from "react-swipeable";

function ContentList({
  view,
  contacts,
  groups,
  callHistory,
  selectedTargetId,
  onSelectContact,
  onSelectGroup,
  contactsLoading,
  groupsLoading,
  callsLoading,
  callsError,
  removeCall,
  clearHistory,
  menuItemsTop,
  setView,
  isSidebarOpen,
  currentUser,
  onDataChanged, // Nouvelle prop générique
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showAddContact, setShowAddContact] = useState(false);
  const [showClearHistoryConfirm, setShowClearHistoryConfirm] = useState(false);
  const scrollRef = useRef(null);
  const menuRef = useRef(null);

  const handleOpenProfile = useCallback((entity, type) => {
    console.log("handleOpenProfile appelé:", { entity, type });
  }, []);

  const menuOptions = useMemo(
    () => ({
      chat: [
        {
          label: "Ajouter un contact",
          action: () => setShowAddContact(true),
          dataType: "contacts",
        },
      ],
      groups: [
        {
          label: "Créer un groupe",
          action: () => setShowCreateGroup(true),
          dataType: "groups",
        },
      ],
      calls: [
        {
          label: "Effacer l'historique",
          action: () => setShowClearHistoryConfirm(true),
          dataType: "calls",
        },
      ],
      status: [],
    }),
    []
  );

  const currentOptions = useMemo(() => menuOptions[view] || [], [menuOptions, view]);

  const scrollByAmount = useCallback((amount) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: amount, behavior: "smooth" });
    }
  }, []);

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => scrollByAmount(100),
    onSwipedRight: () => scrollByAmount(-100),
    delta: 10,
    preventDefaultTouchmoveEvent: true,
    trackTouch: true,
  });

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="bg-white w-full h-full overflow-y-auto relative min-w-0" {...swipeHandlers}>
      <div className="md:hidden">
        <HorizontalSidebar menuItemsTop={menuItemsTop} view={view} setView={setView} />
      </div>
      {view === "chat" && (
        <ContactList
          contacts={contacts}
          currentUser={currentUser}
          onSelectContact={(targetId, type) => {
            console.log('onSelectContact appelé:', { targetId, type });
            alert('onSelectContact appelé:', { targetId, type });
            onSelectContact(targetId, type);
          }}
          selectedContactId={selectedTargetId}
          loading={contactsLoading}
          onOpenAddContact={() => setShowAddContact(true)}
        />
      )}
      {view === "groups" && (
        <GroupList
          groups={groups}
          currentUser={currentUser}
          onSelectGroup={onSelectGroup}
          selectedGroupId={selectedTargetId}
          loading={groupsLoading}
          onOpenProfile={handleOpenProfile}
        />
      )}
      {view === "calls" && (
        <CallHistoryList
          calls={callHistory}
          loading={callsLoading}
          error={callsError}
          removeCall={removeCall}
          clearHistory={clearHistory}
        />
      )}
      {view === "status" && (
        <div className="p-4 text-gray-500">Vue des statuts non implémentée</div>
      )}

      {/* Bouton d'action flottant */}
      <div className="fixed bottom-4 right-4 md:absolute md:bottom-4 md:right-4 z-20">
        <button
          onClick={() => setIsMenuOpen((prev) => !prev)}
          className="w-12 h-12 flex items-center justify-center bg-teal-600 text-white rounded-full shadow-lg hover:bg-teal-700 transition-all"
          aria-label="Ouvrir le menu d'actions"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 4v16m8-8H4"
            />
          </svg>
        </button>
        {isMenuOpen && (
          <div
            ref={menuRef}
            className="absolute bottom-14 right-0 w-48 bg-white border border-gray-200 rounded-lg shadow-lg animate-slide-up z-30"
          >
            {currentOptions.length > 0 ? (
              currentOptions.map((option, index) => (
                <button
                  key={index}
                  onClick={() => {
                    option.action();
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-teal-50 hover:text-teal-600 transition"
                >
                  {option.label}
                </button>
              ))
            ) : (
              <div className="px-4 py-2 text-sm text-gray-500">Aucune action disponible</div>
            )}
          </div>
        )}
      </div>

      {/* Modales */}
      <AddContact
        isOpen={showAddContact}
        onClose={() => setShowAddContact(false)}
        onDataChanged={() => onDataChanged("contacts")}
      />
      <CreateGroup
        isOpen={showCreateGroup}
        onClose={() => setShowCreateGroup(false)}
        onDataChanged={() => onDataChanged("groups")}
      />
      <ConfirmationModal
        isOpen={showClearHistoryConfirm}
        onClose={() => setShowClearHistoryConfirm(false)}
        onConfirm={clearHistory}
        onDataChanged={() => onDataChanged("calls")}
        title="Effacer l'historique"
        message="Êtes-vous sûr de vouloir effacer tout l'historique des appels ?"
      />
    </div>
  );
}

ContentList.propTypes = {
  view: PropTypes.oneOf(["chat", "groups", "calls", "status"]).isRequired,
  contacts: PropTypes.array.isRequired,
  groups: PropTypes.array.isRequired,
  callHistory: PropTypes.array.isRequired,
  selectedTargetId: PropTypes.string,
  onSelectContact: PropTypes.func.isRequired,
  onSelectGroup: PropTypes.func.isRequired,
  contactsLoading: PropTypes.bool,
  groupsLoading: PropTypes.bool,
  callsLoading: PropTypes.bool,
  callsError: PropTypes.string,
  removeCall: PropTypes.func.isRequired,
  clearHistory: PropTypes.func.isRequired,
  menuItemsTop: PropTypes.array.isRequired,
  setView: PropTypes.func.isRequired,
  isSidebarOpen: PropTypes.bool,
  currentUser: PropTypes.object,
  onDataChanged: PropTypes.func, // Nouvelle prop
};

export default ContentList;