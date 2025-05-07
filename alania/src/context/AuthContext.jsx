import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api/api';
import axiosAuthInstance from '../services/api/axiosAuthInstance';
import { useNavigate, useLocation } from 'react-router-dom';
import storageService from '../services/storage/storageService';
import DatabaseService from '../services/db/DatabaseService';
import UserService from '../services/users/userService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [state, setState] = useState({
    currentUser: null,
    isLoading: true,
    sessions: [],
    showSessionSelector: false,
  });
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // console.log('AuthProvider: loadSessions déclenché');
    let isSessionLoaded = false;
    let isMounted = true;

    const loadSessions = async () => {
      if (!isMounted) return;
      try {
        await DatabaseService.initializeExistingDbs();
        const allSessions = await storageService.getAllSessions();
        // console.log("AuthContext: allsessions", allSessions);
        const uniqueSessions = Array.from(
          new Map(allSessions.map((session) => [session.email, session])).values()
        );
        
        // console.log("AuthContext: Unique Sessions", uniqueSessions);

        const stateUpdates = {
          sessions: uniqueSessions,
          currentUser: null,
          showSessionSelector: false,
          isLoading: false,
        };

        if (isSessionLoaded) {
          // console.log('loadSessions: session déjà chargée, ignoré');
          setState((prev) => ({ ...prev, ...stateUpdates }));
          return;
        }

        if (uniqueSessions.length === 0) {
          // Pas de sessions
        } else if (uniqueSessions.length === 1 && uniqueSessions[0].isActive) {
          isSessionLoaded = true;
          const session = uniqueSessions[0];
          const { email, accessToken, refreshToken } = session;
          // console.log('loadSession: Début de la session pour', email);
          const user = await UserService.getUserByEmail(email);
          // console.log('AuthContext loadSession: utilisateur récupéré:', user);
          if (!user) {
            // console.warn('loadSession: utilisateur non trouvé, suppression session');
            await storageService.deleteSession(email);
          } else {
            // console.log('a - loadSession: utilisateur trouvé:', user);
            const { data } = await axiosAuthInstance.post('/api/access-token/verify');
            // console.log('b - loadSession: vérification du token:', data);
            // console.log(data, accessToken);

            if (data.success) {
              stateUpdates.currentUser = { ...user, token: accessToken, refreshToken };
              // console.log('loadSession: currentUser défini:', stateUpdates.currentUser);
              await storageService.saveSession(user, { accessToken, refreshToken, isActive: true });
            } else {
              // console.log('loadSession: accessToken invalide, tentative de rafraîchissement');
              const refreshResult = await api.post('/api/refresh-token/refresh', { refreshToken });
              // console.log(refreshResult);
              if (refreshResult.data.success) {
                const { accessToken: newAccessToken, refreshToken: newRefreshToken } = refreshResult.data.data;
                stateUpdates.currentUser = { ...user, token: newAccessToken, refreshToken: newRefreshToken };
                // console.log('loadSession: currentUser défini après rafraîchissement:', stateUpdates.currentUser);
                // console.warn('loadSession: rafraîchissement réussi, mise à jour de la session', email, { accessToken: newAccessToken, refreshToken: newRefreshToken, isActive: true }, user);
                await storageService.saveSession(user, { accessToken: newAccessToken, refreshToken: newRefreshToken, isActive: true });
              } else {
                // console.warn('loadSession: rafraîchissement échoué, suppression session');
                await storageService.deleteSession(email);
              }
            }
          }
        } else {
          stateUpdates.showSessionSelector = true;
        }

        // Mise à jour unique de tous les états
        setState((prev) => ({
          ...prev,
          ...stateUpdates,
          currentUser:
            stateUpdates.currentUser && JSON.stringify(stateUpdates.currentUser) !== JSON.stringify(prev.currentUser)
              ? stateUpdates.currentUser
              : prev.currentUser,
        }));
      } catch (error) {
        // console.error('loadSessions: Erreur:', error.message, error.stack);
        setState((prev) => ({
          ...prev,
          currentUser: null,
          showSessionSelector: false,
          isLoading: false,
        }));
      }
    };

    loadSessions();
    return () => {
      isMounted = false;
    };
  }, []);

  const loadSession = async (session) => {
    // console.log('loadSession: Début de la session pour', session.email);
    try {
      const { email, accessToken, refreshToken } = session;
      // console.log('loadSession: tentative pour', email);
      let user = await UserService.getUserByEmail(email);
      if (!user) {
        // console.warn('loadSession: utilisateur non trouvé, suppression session');
        await storageService.deleteSession(email);
        setState((prev) => ({ ...prev, currentUser: null }));
        return;
      }

      const { data } = await axiosAuthInstance.post('/api/access-token/verify');
      if (data.success) {
        const newUser = { ...user, token: accessToken, refreshToken };
        setState((prev) => {
          if (JSON.stringify(newUser) !== JSON.stringify(prev.currentUser)) {
            // console.log('loadSession: currentUser défini:', newUser);
            return { ...prev, currentUser: newUser };
          }
          return prev;
        });
        await storageService.saveSession(user, { accessToken, refreshToken, isActive: true });
      } else {
        // console.log('loadSession: accessToken invalide, tentative de rafraîchissement');
        const refreshResult = await api.post('/api/refresh-token/refresh', { refreshToken });
        if (refreshResult.data.success) {
          const { accessToken: newAccessToken, refreshToken: newRefreshToken } = refreshResult.data.data;
          const newUser = { ...user, token: newAccessToken, refreshToken: newRefreshToken };
          setState((prev) => {
            if (JSON.stringify(newUser) !== JSON.stringify(prev.currentUser)) {
              // console.log('loadSession: currentUser défini après rafraîchissement:', newUser);
              return { ...prev, currentUser: newUser };
            }
            return prev;
          });
          await storageService.saveSession(user, { accessToken: newAccessToken, refreshToken: newRefreshToken, isActive: true });
        } else {
          // console.warn('loadSession: rafraîchissement échoué, suppression session');
          await storageService.deleteSession(email);
          setState((prev) => ({ ...prev, currentUser: null }));
        }
      }
    } catch (error) {
      // console.error('loadSession: erreur:', error.response?.status, error.message);
      await storageService.deleteSession(session.email);
      setState((prev) => ({ ...prev, currentUser: null }));
    }
  };

  const selectSession = async (email) => {
    const session = state.sessions.find((s) => s.email === email);
    if (session) {
      await loadSession(session);
      setState((prev) => ({ ...prev, showSessionSelector: false }));
    }
  };

  const startRegister = async (email, username) => {
    try {
      console.log("AuthContext" + email + username);
      const { data } = await api.post('/api/register/start', { email });
      console.log(data);
      if (data.success) {
        return { success: true, message: data.message, email, username };
      }
      return { success: false, message: data.message };
    } catch (error) {
      alert(error);
      return { success: false, message: 'Erreur lors de l\'inscription.' };
    }
  };

  const resendVerificationCode = async (email) => {
    try {
      const { data } = await api.post('/api/register/resend', { email });
      if (data.success) {
        return { success: true, message: data.message, email };
      }
      return { success: false, message: data.message };
    } catch (error) {
      return { success: false, message: 'Erreur lors du renvoi du code' };
    }
  };

  const verifyRegister = async (email, code, username) => {
    try {
      const { data } = await api.post('/api/register/verify', { email, code });
  
      if (!data || !data.success || !data.data?.accessToken || !data.data?.refreshToken) {
        // console.error('Réponse API invalide:', data);
        return { success: false, message: 'Réponse API invalide.' };
      }
  
      const { accessToken, refreshToken } = data.data;
  
      // Vérifier si l'utilisateur existe, sinon l'initialiser
      // console.log('a - Vérification de l\'existence de l\'utilisateur pour', email);
      let user = await UserService.getUserByEmail(email);
      if (!user) {
        user = await UserService.initUser({ email, username });
      }
  
      // Sauvegarder la session
      // console.log('b - Vérification de l\'existence de l\'utilisateur pour', email);
      await storageService.saveSession(user, { accessToken, refreshToken, isActive: true });
  
      // Mettre à jour l'état
      // console.log('c - Vérification de l\'existence de l\'utilisateur pour', email);
      setState((prev) => ({
        ...prev,
        currentUser: { ...user, token: accessToken, refreshToken },
      }));
      // console.log("AuthContext: currentUser mis à jour:", { ...user, token: accessToken, refreshToken });
  
      // Rediriger
      const redirectTo = location.state?.from?.pathname || '/chat';
      navigate(redirectTo, { replace: true });
  
      return { success: true, message: data.message };
    } catch (error) {
      // console.error('Erreur lors de la vérification:', error.message);
      return { success: false, message: error.message || 'Erreur lors de la vérification.' };
    }
  };

  const startLogin = async (email) => {
    try {
      const { data } = await api.post('/api/login/start', { email });
      if (data.success) {
        return { success: true, message: data.message, email };
      }
      return { success: false, message: data.message };
    } catch (error) {
      return { success: false, message: 'Erreur lors de la connexion.' };
    }
  };

  const verifyLogin = async (email, code) => {
    try {
      console.log("📩 Début de la procédure de vérification : " + email + " " + code);
  
      console.log("[verifyLogin] Envoi de la requête à /api/login/verify avec :", { email, code });
  
      const { data } = await api.post('/api/login/verify', { email, code });
  
      console.log("✅ Réponse reçue depuis le backend\n", data);
  
      if (data.success) {
        const { accessToken, refreshToken } = data.data;
  
        console.log("Recherche user");
        const userData = {
          email: email,
          username: null,
          name: null,
          phone: null
        };
        
        let user = await UserService.initUser(userData);
        console.log(user);
        console.log("[verifyLogin] Utilisateur récupéré :", user);
  
        await storageService.initUserStorage(email);
        await storageService.saveSession(user, { accessToken, refreshToken, isActive: true });
  
        if (!user) {
          console.log("[verifyLogin] Utilisateur non trouvé, initialisation en cours...");
          await UserService.initUser({ email, username: email.split('@')[0] });
          user = await UserService.getUserByEmail(email);
        }
  
        setState((prev) => ({
          ...prev,
          currentUser: { ...user, token: accessToken, refreshToken },
        }));
  
        const redirectTo = location.state?.from?.pathname || '/chat';
        navigate(redirectTo, { replace: true });
  
        return { success: true, message: data.message };
      }
  
      console.warn("[verifyLogin] Échec : ", data.message);
      return { success: false, message: data.message };
  
    } catch (error) {
      console.error("[verifyLogin] ❌ Erreur attrapée :", error);
  
      // Si c'est une erreur Axios, loggons les détails utiles
      if (error.isAxiosError) {
        console.error("[AxiosError] Message :", error.message);
        console.error("[AxiosError] Config :", error.config);
        console.error("[AxiosError] Code :", error.code);
        if (error.response) {
          console.error("[AxiosError] Status :", error.response.status);
          console.error("[AxiosError] Data :", error.response.data);
        } else {
          console.error("[AxiosError] Aucune réponse reçue du serveur.");
        }
      }
  
      return { success: false, message: 'Erreur lors de la vérification.' };
    }
  };
  

  const updateCurrentUser = async () => {
    if (state.currentUser) {
      const user = await UserService.getUserByEmail(state.currentUser.email);
      if (user) {
        setState((prev) => ({
          ...prev,
          currentUser: { ...user, token: prev.currentUser.token, refreshToken: prev.currentUser.refreshToken },
        }));
      }
    }
  };

  const loginWithPassword = async (email, password) => {
    try {
      const user = await UserService.verifyPassword(email, password);
      if (!user) {
        return { success: false, message: 'Email ou mot de passe incorrect' };
      }
      const { data } = await api.post('/api/login/password', { email, password });
      if (data.success) {
        const { accessToken, refreshToken } = data.data;
        await storageService.initUserStorage(user);
        await storageService.saveSession(user, { accessToken, refreshToken, password, isActive: true });
        setState((prev) => ({
          ...prev,
          currentUser: { ...user, token: accessToken, refreshToken },
        }));
        const redirectTo = location.state?.from?.pathname || '/chat';
        navigate(redirectTo, { replace: true });
        return { success: true, message: 'Connexion réussie' };
      }
      return { success: false, message: data.message };
    } catch (error) {
      return { success: false, message: 'Erreur lors de la connexion.' };
    }
  };

  const logout = async () => {
    try {
      if (state.currentUser) {
        await api.post('/api/logout', { refreshToken: state.currentUser.refreshToken }, {
          headers: { Authorization: `Bearer ${state.currentUser.token}` },
        });
        await storageService.deactivateSession(state.currentUser.email);
        setState((prev) => ({
          ...prev,
          currentUser: null,
          showSessionSelector: true,
        }));
      }
    } catch (error) {
      // console.error('Erreur logout:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser: state.currentUser,
        isLoading: state.isLoading,
        sessions: state.sessions,
        showSessionSelector: state.showSessionSelector,
        selectSession,
        startRegister,
        resendVerificationCode,
        verifyRegister,
        startLogin,
        verifyLogin,
        loginWithPassword,
        logout,
        updateCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  return context;
};