// src/pages/sessions/SessionsPage.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

const SessionsPage = () => {
  const { listSessions, logout } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchSessions = async () => {
      const result = await listSessions();
      if (result.success) {
        setSessions(result.sessions);
      } else {
        setMessage(result.message);
      }
    };
    fetchSessions();
  }, [listSessions]);

  const handleLogout = async (refreshToken) => {
    await logout();
    setSessions(sessions.filter((session) => session.token !== refreshToken));
  };

  return (
    <div>
      <h2>Sessions actives</h2>
      {message && <p>{message}</p>}
      <ul>
        {sessions.map((session) => (
          <li key={session.token}>
            <p>Appareil: {session.userAgent || 'Inconnu'}</p>
            <p>IP: {session.ipAddress || 'Inconnu'}</p>
            <p>Connecté le: {new Date(session.createdAt).toLocaleString()}</p>
            <button onClick={() => handleLogout(session.token)}>Déconnexion</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SessionsPage;