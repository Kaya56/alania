import { useContacts } from "./useContacts";
import { useGroups } from "./useGroups";
import { useCallHistory } from "./useCallHistory";

function useChatData(currentUser) {
  const {
    contacts, loading: contactsLoading, error: contactsError, refetch: refetchContacts,
    blockContact, deleteContact,
  } = useContacts(currentUser);
  const {
    groups, loading: groupsLoading, error: groupsError, refetch: refetchGroups,
    addMember, removeMember, leaveGroup, updateGroup,
  } = useGroups(currentUser?.email);
  const {
    callHistory, loading: callsLoading, error: callsError, removeCall, clearHistory,
    refetch: refetchCallHistory,
  } = useCallHistory(currentUser?.email);

  const refreshData = async (dataType) => {
    console.log("Rafraîchissement des données pour:", dataType);
    switch (dataType) {
      case "contacts":
        await refetchContacts();
        break;
      case "groups":
        await refetchGroups();
        break;
      case "calls":
        await refetchCallHistory();
        break;
      default:
        console.warn("Type de données inconnu:", dataType);
    }
  };

  return {
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
    removeCall,
    clearHistory,
  };
}

export default useChatData;