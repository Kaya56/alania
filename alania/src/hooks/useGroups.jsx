import { useState, useEffect, useCallback } from 'react';
import GroupService from '../services/group/GroupService';
import MessageService from '../services/message/MessageService';
import { validateEmail } from '../utils/validatation/validation';

export const useGroups = (userEmail) => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchGroups = useCallback(async () => {
    // console.log('useGroups.fetchGroups: Début', { userEmail });
    try {
      if (!userEmail) {
        // console.warn('useGroups.fetchGroups: Aucun email utilisateur');
        setGroups([]);
        setError('Utilisateur non connecté');
        return;
      }
      validateEmail(userEmail);
      // console.log('useGroups.fetchGroups: Récupération pour', userEmail);
      const userGroups = await GroupService.getGroupsByUser(userEmail);
      // console.log('useGroups.fetchGroups: Groupes récupérés', userGroups);
      setGroups(userGroups);
      setError(null);
    } catch (err) {
      // console.error('useGroups.fetchGroups: Erreur', err.message, err.stack);
      setError('Erreur lors du chargement des groupes');
    } finally {
      setLoading(false);
      // console.log('useGroups.fetchGroups: Fin', { loading: false });
    }
  }, [userEmail]);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  const createGroup = async (name, description, photo) => {
    // console.log('useGroups.createGroup', { name, description, hasPhoto: !!photo });
    try {
      if (!userEmail) {
        throw new Error('Utilisateur non connecté');
      }
      validateEmail(userEmail);
      const newGroup = await GroupService.createGroup(userEmail, { name, description, photo });
      // console.log('useGroups.createGroup: Nouveau groupe', newGroup);
      setGroups((prev) => [
        {
          ...newGroup,
          lastMessage: null,
          lastMessageDate: newGroup.createdAt,
          members: [{ groupId: newGroup.id, userId: userEmail, joinedAt: newGroup.createdAt }],
          unreadCount: 0,
        },
        ...prev,
      ]);
      return newGroup;
    } catch (err) {
      // console.error('useGroups.createGroup: Erreur', err.message, err.stack);
      throw new Error(`Erreur lors de la création du groupe : ${err.message}`);
    }
  };

  const addMember = async (groupId, memberEmail) => {
    // console.log('useGroups.addMember', { groupId, memberEmail });
    try {
      if (!userEmail || !memberEmail) {
        throw new Error('Email utilisateur ou membre manquant');
      }
      validateEmail(userEmail);
      validateEmail(memberEmail);
      const member = await GroupService.addMember(userEmail, groupId, memberEmail);
      // console.log('useGroups.addMember: Membre ajouté', member);
      setGroups((prev) =>
        prev.map((g) =>
          g.id === groupId ? { ...g, members: [...g.members, member] } : g
        )
      );
      return member;
    } catch (err) {
      // console.error('useGroups.addMember: Erreur', err.message, err.stack);
      throw new Error(`Erreur lors de l'ajout du membre : ${err.message}`);
    }
  };

  const removeMember = async (groupId, memberEmail) => {
    // console.log('useGroups.removeMember', { groupId, memberEmail });
    try {
      if (!userEmail || !memberEmail) {
        throw new Error('Email utilisateur ou membre manquant');
      }
      validateEmail(userEmail);
      validateEmail(memberEmail);
      await GroupService.removeMember(userEmail, groupId, memberEmail);
      // console.log('useGroups.removeMember: Membre supprimé');
      setGroups((prev) =>
        prev.map((g) =>
          g.id === groupId
            ? { ...g, members: g.members.filter((m) => m.userId !== memberEmail) }
            : g
        )
      );
    } catch (err) {
      // console.error('useGroups.removeMember: Erreur', err.message, err.stack);
      throw new Error(`Erreur lors de la suppression du membre : ${err.message}`);
    }
  };

  const leaveGroup = async (groupId) => {
    // console.log('useGroups.leaveGroup', { groupId });
    try {
      if (!userEmail) {
        throw new Error('Utilisateur non connecté');
      }
      validateEmail(userEmail);
      await GroupService.removeMember(userEmail, groupId, userEmail);
      // console.log('useGroups.leaveGroup: Groupe quitté');
      setGroups((prev) => prev.filter((g) => g.id !== groupId));
    } catch (err) {
      // console.error('useGroups.leaveGroup: Erreur', err.message, err.stack);
      throw new Error(`Erreur lors de la sortie du groupe : ${err.message}`);
    }
  };

  const updateGroup = async (groupId, updates) => {
    // console.log('useGroups.updateGroup', { groupId, updates });
    try {
      if (!userEmail) {
        throw new Error('Utilisateur non connecté');
      }
      validateEmail(userEmail);
      const updatedGroup = await GroupService.updateGroup(userEmail, groupId, updates);
      // console.log('useGroups.updateGroup: Groupe mis à jour', updatedGroup);
      setGroups((prev) =>
        prev.map((g) => (g.id === groupId ? { ...g, ...updatedGroup } : g))
      );
      return updatedGroup;
    } catch (err) {
      // console.error('useGroups.updateGroup: Erreur', err.message, err.stack);
      throw new Error(`Erreur lors de la mise à jour du groupe : ${err.message}`);
    }
  };

  const getGroupById = useCallback(async (groupId) => {
    // console.log('useGroups.getGroupById', { groupId });
    try {
      if (!userEmail) {
        throw new Error('Utilisateur non connecté');
      }
      validateEmail(userEmail);
      const group = await GroupService.getGroupById(userEmail, groupId);
      const members = await GroupService.getMembers(userEmail, groupId);
      const messages = await MessageService.getMessages(userEmail, {
        targetId: group.id,
        receiverType: 'group',
      });
      const lastMessage = messages.sort((a, b) => b.sentAt - a.sentAt)[0];
      const unreadCount = await MessageService.getUnreadCount(userEmail, {
        targetId: group.id,
        receiverType: 'group',
      });
      const result = {
        ...group,
        lastMessage: lastMessage ? lastMessage.content.text : null,
        lastMessageDate: lastMessage ? lastMessage.sentAt : group.createdAt,
        members,
        unreadCount,
      };
      // console.log('useGroups.getGroupById: Groupe récupéré', result);
      return result;
    } catch (err) {
      // console.error('useGroups.getGroupById: Erreur', err.message, err.stack);
      throw new Error(`Erreur lors de la récupération du groupe : ${err.message}`);
    }
  }, [userEmail]);

  return {
    groups,
    loading,
    error,
    createGroup,
    addMember,
    removeMember,
    leaveGroup,
    updateGroup,
    getGroupById,
    refetch: fetchGroups, // Ajout pour ChatPage
  };
};