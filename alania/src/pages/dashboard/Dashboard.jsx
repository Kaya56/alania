import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  console.log('Dashboard: rendu, currentUser:', currentUser);

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>Tableau de bord</h1>
      <p>Bienvenue, {currentUser?.email || 'Utilisateur'} !</p>
      <button onClick={() => navigate('/chat')}>Aller au chat</button>
      <button onClick={logout}>Déconnexion</button>
    </div>
  );
};

export default Dashboard;