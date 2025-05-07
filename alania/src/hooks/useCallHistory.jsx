import { useState, useEffect, useCallback } from 'react';
import CallService from '../services/call/CallService';
import { validateEmail } from '../utils/validatation/validation';

export function useCallHistory(email, conversationId = null) {
  const [callHistory, setCallHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCalls = useCallback(async () => {
    // console.log('useCallHistory.fetchCalls: Début', { email, conversationId });
    try {
      if (!email) {
        // console.warn('useCallHistory.fetchCalls: Aucun email utilisateur');
        setCallHistory([]);
        setError('Utilisateur non connecté');
        return;
      }
      validateEmail(email);
      // console.log('useCallHistory.fetchCalls: Récupération pour', email);
      setLoading(true);
      const calls = conversationId
        ? await CallService.getCallsByConversation(email, conversationId)
        : await CallService.getAllCalls(email);
      const enrichedCalls = await Promise.all(
        calls.map((call) => CallService.enrichCall(email, call))
      );
      // console.log('useCallHistory.fetchCalls: Appels récupérés', enrichedCalls);
      setCallHistory(enrichedCalls);
      setError(null);
    } catch (err) {
      // console.error('useCallHistory.fetchCalls: Erreur', err.message, err.stack);
      setError('Erreur lors du chargement de l\'historique des appels');
    } finally {
      setLoading(false);
      // console.log('useCallHistory.fetchCalls: Fin', { loading: false });
    }
  }, [email, conversationId]);

  useEffect(() => {
    fetchCalls();
  }, [fetchCalls]);

  const addCall = async (call) => {
    // console.log('useCallHistory.addCall', { call });
    try {
      if (!email) {
        throw new Error('Utilisateur non connecté');
      }
      validateEmail(email);
      const newCall = await CallService.addCall(email, call);
      const enrichedCall = await CallService.enrichCall(email, newCall);
      // console.log('useCallHistory.addCall: Appel ajouté', enrichedCall);
      setCallHistory((prev) => [enrichedCall, ...prev]);
    } catch (err) {
      // console.error('useCallHistory.addCall: Erreur', err.message, err.stack);
      setError('Erreur lors de l\'ajout de l\'appel');
      throw new Error(`Erreur lors de l'ajout de l'appel : ${err.message}`);
    }
  };

  const removeCall = async (callId) => {
    // console.log('useCallHistory.removeCall', { callId });
    try {
      if (!email) {
        throw new Error('Utilisateur non connecté');
      }
      validateEmail(email);
      await CallService.removeCall(email, callId);
      // console.log('useCallHistory.removeCall: Appel supprimé');
      setCallHistory((prev) => prev.filter((call) => call.id !== callId));
    } catch (err) {
      // console.error('useCallHistory.removeCall: Erreur', err.message, err.stack);
      setError('Erreur lors de la suppression de l\'appel');
      throw new Error(`Erreur lors de la suppression de l'appel : ${err.message}`);
    }
  };

  const clearHistory = async () => {
    // console.log('useCallHistory.clearHistory');
    try {
      if (!email) {
        throw new Error('Utilisateur non connecté');
      }
      validateEmail(email);
      await CallService.clearHistory(email);
      // console.log('useCallHistory.clearHistory: Historique vidé');
      setCallHistory([]);
    } catch (err) {
      // console.error('useCallHistory.clearHistory: Erreur', err.message, err.stack);
      setError('Erreur lors du vidage de l\'historique');
      throw new Error(`Erreur lors du vidage de l'historique : ${err.message}`);
    }
  };

  return {
    callHistory,
    addCall,
    removeCall,
    clearHistory,
    loading,
    error,
    refetch: fetchCalls, // Ajout pour ChatPage
  };
}