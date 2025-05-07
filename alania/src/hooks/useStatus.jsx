import { useState, useEffect, useCallback } from 'react';
import StatusService from '../services/status/StatusService';
import { validateEmail } from '../utils/validation';

export const useStatuses = (userEmail) => {
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStatuses = useCallback(async () => {
    console.log('useStatuses.fetchStatuses: Début', { userEmail });
    try {
      if (!userEmail) {
        console.warn('useStatuses.fetchStatuses: Aucun email utilisateur');
        setStatuses([]);
        setError('Utilisateur non connecté');
        return;
      }
      validateEmail(userEmail);
      console.log('useStatuses.fetchStatuses: Récupération pour', userEmail);
      const visibleStatuses = await StatusService.getVisibleStatuses(userEmail, userEmail);
      console.log('useStatuses.fetchStatuses: Statuts récupérés', visibleStatuses);
      setStatuses(visibleStatuses);
      setError(null);
    } catch (err) {
      console.error('useStatuses.fetchStatuses: Erreur', err.message, err.stack);
      setError('Erreur lors du chargement des statuts');
    } finally {
      setLoading(false);
      console.log('useStatuses.fetchStatuses: Fin', { loading: false });
    }
  }, [userEmail]);

  useEffect(() => {
    fetchStatuses();
  }, [fetchStatuses]);

  const createStatus = async (content, visibility, groupId, file) => {
    console.log('useStatuses.createStatus', { content, visibility, groupId, hasFile: !!file });
    try {
      if (!userEmail) {
        throw new Error('Utilisateur non connecté');
      }
      validateEmail(userEmail);
      const newStatus = await StatusService.createStatus(userEmail, content, visibility, groupId, file);
      console.log('useStatuses.createStatus: Statut créé', newStatus);
      setStatuses((prev) => [newStatus, ...prev]);
      return newStatus;
    } catch (err) {
      console.error('useStatuses.createStatus: Erreur', err.message, err.stack);
      throw new Error(`Erreur lors de la création du statut : ${err.message}`);
    }
  };

  return {
    statuses,
    loading,
    error,
    createStatus,
    refetch: fetchStatuses, // Ajout pour cohérence future
  };
};