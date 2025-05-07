import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const SessionSelector = () => {
  const { sessions, selectSession } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="max-w-md mx-auto mt-12 text-center">
      <h2 className="text-2xl font-bold mb-6">Qui êtes-vous ?</h2>
      {sessions.length > 0 ? (
        <>
          <p className="text-gray-600 mb-4">Sélectionnez votre compte :</p>
          <ul className="list-none">
            {sessions.map((session) => (
              <li key={session.email} className="mb-2">
                <button
                  onClick={() => selectSession(session.email)}
                  className={`w-full py-2 px-4 rounded-md text-white font-medium transition-colors ${
                    session.isActive
                      ? 'bg-blue-500 hover:bg-blue-600'
                      : 'bg-gray-500 hover:bg-gray-600'
                  }`}
                >
                  {session.email} {session.isActive && '(Dernière active)'}
                </button>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p className="text-gray-600">Aucun compte trouvé.</p>
      )}
      <div className="mt-6">
        <p className="text-gray-600 mb-4">Pas votre compte ?</p>
        <button
          onClick={() => navigate('/login')}
          className="mr-2 py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          Se connecter
        </button>
        <button
          onClick={() => navigate('/register')}
          className="py-2 px-4 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
        >
          S'inscrire
        </button>
      </div>
    </div>
  );
};

export default SessionSelector;
