import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useSwipeable } from "react-swipeable";
import Sidebar from "../../components/bar/sideBar/Sidebar";
import TopBar from "../../components/bar/topBar/TopBar";
import logo from "../../assets/images/logo.png";
import useChatData from "../../hooks/useChatData";
import useWebRTC from "../../hooks/useWebRTC";
import ConversationManager from "../../components/interactionFeed/conversation/ConversationManager";
import CallHandler from "../../components/call/CallHandler";
import { menuItemsTop, menuItemsBottom } from "../../components/bar/sideBar/components/menuItems";

function ChatPage() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [view, setView] = useState("chat");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSettingsPanelOpen, setIsSettingsPanelOpen] = useState(false);
  const [isContactSelected, setIsContactSelected] = useState(false);
  const [callActions, setCallActions] = useState({ startCall: () => {}, isCalling: false });

  const {
    contacts,
    groups,
    callHistory,
    contactsLoading,
    groupsLoading,
    callsLoading,
    contactsError,
    groupsError,
    callsError,
    refreshData,
    blockContact,
    deleteContact,
    addMember,
    removeMember,
    leaveGroup,
    updateGroup,
    clearHistory,
  } = useChatData(currentUser);

  const { conversations, isWebSocketInitialized, incomingCall, setIncomingCall } =
    useWebRTC(currentUser, contacts, groups);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const swipeHandlers = useSwipeable({
    onSwipedRight: (eventData) => {
      if (eventData.initial[0] < 20) setIsSidebarOpen(true);
    },
    onSwipedLeft: () => {
      if (isSidebarOpen) setIsSidebarOpen(false);
    },
    delta: 10,
    preventDefaultTouchmoveEvent: true,
    trackTouch: true,
  });

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-lg text-gray-600">Connectez-vous pour voir vos discussions</p>
      </div>
    );
  }

  if (contactsLoading || groupsLoading || callsLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <img src={logo} alt="Logo" className="w-32 h-32 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-200 flex flex-col">
      {!isContactSelected && <TopBar />}
      <div className="flex flex-1 relative" {...swipeHandlers}>
        <div
          className={`${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          } md:translate-x-0 fixed md:static top-0 left-0 h-[calc(100vh-64px)] z-50 bg-white transition-transform duration-300 ease-in-out`}
        >
          <Sidebar
            menuItemsTop={menuItemsTop}
            menuItemsBottom={menuItemsBottom}
            activeView={view}
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            isSettingsPanelOpen={isSettingsPanelOpen}
            setIsSettingsPanelOpen={setIsSettingsPanelOpen}
            currentUser={currentUser}
            onLogout={handleLogout}
          />
        </div>
        <ConversationManager
          view={view}
          setView={setView}
          contacts={contacts}
          groups={groups}
          callHistory={callHistory}
          contactsError={contactsError}
          groupsError={groupsError}
          callsError={callsError}
          refreshData={refreshData}
          clearHistory={clearHistory}
          conversations={conversations}
          currentUser={currentUser}
          isSidebarOpen={isSidebarOpen}
          menuItemsTop={menuItemsTop}
          blockContact={blockContact}
          deleteContact={deleteContact}
          addMember={addMember}
          removeMember={removeMember}
          leaveGroup={leaveGroup}
          updateGroup={updateGroup}
          setIsContactSelected={setIsContactSelected}
          startCall={callActions.startCall}
          isCalling={callActions.isCalling}
        />
      </div>
      <CallHandler
        currentUser={currentUser}
        contacts={contacts}
        incomingCall={incomingCall}
        setIncomingCall={setIncomingCall}
        conversations={conversations}
        onCallActions={setCallActions}
      />
    </div>
  );
}

export default ChatPage;