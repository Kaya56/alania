import { useState, useCallback, useEffect, useMemo } from "react";
import ContentList from "../common/contentList/ContentList";
import ChatArea from "../common/chatArea/ChatArea";
import logo from "../../../assets/images/logo.png";
import { NoSymbolIcon, UserPlusIcon, ArrowRightOnRectangleIcon, InformationCircleIcon, PhoneIcon as CallIcon } from "@heroicons/react/24/outline";
import { VideoIcon } from "lucide-react";

function ConversationManager({
  view,
  setView,
  contacts,
  groups,
  callHistory,
  contactsError,
  groupsError,
  callsError,
  refreshData,
  clearHistory,
  conversations,
  currentUser,
  isSidebarOpen,
  menuItemsTop,
  blockContact,
  deleteContact,
  addMember,
  removeMember,
  leaveGroup,
  updateGroup,
  setIsContactSelected,
  startCall,
  isCalling,
}) {
  const [selectedTargetId, setSelectedTargetId] = useState(null);
  const [receiverType, setReceiverType] = useState("user");

  useEffect(() => {
    setIsContactSelected(!!selectedTargetId);
  }, [selectedTargetId, setIsContactSelected]);

  const handleSelectTarget = useCallback((targetId, type) => {
    const validType = ["user", "group"].includes(type) ? type : "user";
    setSelectedTargetId(targetId);
    setReceiverType(validType);
  }, []);

  const handleBack = useCallback(() => {
    setSelectedTargetId(null);
    setReceiverType("user");
  }, []);

  const getReceiverEmail = useCallback(() => {
    if (!selectedTargetId) return null;
    if (receiverType === "user") {
      const contact = contacts.find((c) => c.id === selectedTargetId);
      return contact ? contact.email : null;
    } else if (receiverType === "group") {
      const group = groups.find((g) => g.id === selectedTargetId);
      return group ? group.id : null;
    }
    return null;
  }, [selectedTargetId, receiverType, contacts, groups]);

  const contactTools = useMemo(
    () => [
      {
        id: "vocal-call",
        label: "Appel vocal",
        action: () => startCall(false, selectedTargetId, receiverType),
        icon: <CallIcon className="h-5 w-5" />,
        disabled: isCalling || !selectedTargetId || receiverType !== "user",
      },
      {
        id: "video-call",
        label: "Appel vidéo",
        action: () => startCall(true, selectedTargetId, receiverType),
        icon: <VideoIcon className="h-5 w-5" />,
        disabled: isCalling || !selectedTargetId || receiverType !== "user",
      },
      {
        id: "block",
        label: "Bloquer",
        action: () => blockContact(selectedTargetId),
        icon: <NoSymbolIcon className="h-5 w-5" />,
        disabled: !selectedTargetId || receiverType !== "user",
      },
      {
        id: "info",
        label: "Infos",
        action: () => {},
        icon: <InformationCircleIcon className="h-5 w-5" />,
      },
    ],
    [blockContact, selectedTargetId, receiverType, startCall, isCalling]
  );

  const groupTools = useMemo(
    () => [
      {
        id: "addMember",
        label: "Ajouter membre",
        action: () => addMember(selectedTargetId, prompt("Entrez l’email du membre :")),
        icon: <UserPlusIcon className="h-5 w-5" />,
        disabled: !selectedTargetId || receiverType !== "group",
      },
      {
        id: "leave",
        label: "Quitter le groupe",
        action: () => leaveGroup(selectedTargetId),
        icon: <ArrowRightOnRectangleIcon className="h-5 w-5" />,
        disabled: !selectedTargetId || receiverType !== "group",
      },
      {
        id: "info",
        label: "Infos",
        action: () => {},
        icon: <InformationCircleIcon className="h-5 w-5" />,
      },
    ],
    [addMember, leaveGroup, selectedTargetId, receiverType]
  );

  return (
    <div className="w-full flex-1 flex">
      <div
        className={`w-full md:w-5/12 md:max-w-xs border-r border-gray-300 transition-all duration-300 ${
          selectedTargetId ? "hidden md:block" : "block"
        }`}
      >
        {(contactsError || groupsError || callsError) && (
          <div className="m-4 p-3 bg-red-100 text-red-700 rounded">
            {contactsError || groupsError || callsError}
          </div>
        )}
        <ContentList
          view={view}
          contacts={contacts}
          groups={groups}
          callHistory={callHistory}
          selectedTargetId={selectedTargetId}
          onSelectContact={handleSelectTarget}
          onSelectGroup={handleSelectTarget}
          contactsLoading={false}
          groupsLoading={false}
          callsLoading={false}
          callsError={callsError}
          removeCall={() => {}} // À implémenter si nécessaire
          clearHistory={clearHistory}
          menuItemsTop={menuItemsTop}
          setView={setView}
          isSidebarOpen={isSidebarOpen}
          currentUser={currentUser}
          onDataChanged={refreshData}
        />
      </div>
      <div
        className={`flex-1 transition-all duration-300 ${
          selectedTargetId ? "block" : "hidden md:block"
        }`}
      >
        {selectedTargetId ? (
          <div className="h-full relative">
            <button
              onClick={handleBack}
              className="md:hidden absolute top-4 left-4 p-3 bg-gray-300 text-gray-800 rounded-full hover:bg-gray-400 z-10"
              aria-label="Retour à la liste"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <ChatArea
              targetId={selectedTargetId}
              receiverType={receiverType}
              currentUser={currentUser}
              receiverEmail={getReceiverEmail()}
              onBlockContact={blockContact}
              onDeleteContact={deleteContact}
              onViewProfile={() => console.log("Voir le profil")}
              onViewInfo={() => console.log("handleViewInfo")}
              onAddMember={addMember}
              onRemoveMember={removeMember}
              onLeaveGroup={leaveGroup}
              onUpdateGroup={updateGroup}
              tools={receiverType === "user" ? contactTools : groupTools}
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full bg-white">
            <img src={logo} alt="Logo" className="w-30 h-30" />
            <p className="text-gray-600">
              {view === "chat"
                ? "Sélectionnez une discussion"
                : view === "groups"
                ? "Sélectionnez un groupe"
                : "Sélectionnez une option"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ConversationManager;