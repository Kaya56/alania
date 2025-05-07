import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion'; // Pour les animations

const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

const RegisterPage = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false); // Pour l'icône dynamique

  const navigate = useNavigate();
  const location = useLocation();
  const { startRegister } = useAuth();

  const from = location.state?.from?.pathname || '/chat';

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!validateEmail(email)) {
      setError('Veuillez entrer une adresse email valide.');
      setMessage('');
      return;
    }
    setError('');
    setIsLoading(true);

    try {
      const result = await startRegister(email);
      if (result.success) {
        setMessage(result.message);
        navigate(`/check-code-for-registration?email=${encodeURIComponent(email)}&redirect=${encodeURIComponent(from)}`);
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      setError(err.message || 'Erreur lors de l\'inscription.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-gray-100 to-blue-100 p-6"
    >
      <h1 className="text-4xl font-extrabold text-gray-800 mb-8 drop-shadow-md">Inscription</h1>
      <p className="text-lg text-gray-600 mb-6">Créez un compte en entrant votre email</p>
      <div className="w-full max-w-md flex flex-col items-center space-y-6">
        <div className="relative w-full">
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            required
            className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent text-gray-700 shadow-md"
            placeholder="exemple@mail.com"
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 transition-colors duration-300 ${
              isFocused ? 'text-green-500' : 'text-gray-400'
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>
        {error && <p className="text-red-500 text-center font-medium">{error}</p>}
        {message && <p className="text-green-500 text-center font-medium">{message}</p>}
        {isLoading && (
          <div className="flex justify-center items-center">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 border-4 border-green-200 rounded-full animate-pulse"></div>
              <div className="absolute inset-0 border-4 border-t-green-600 border-r-green-600 rounded-full animate-spin"></div>
              <div className="absolute inset-2 border-2 border-green-400 rounded-full animate-spin-reverse"></div>
            </div>
          </div>
        )}
        <div className="text-center">
          <p className="text-gray-600">
            Déjà inscrit ?{' '}
            <a
              href="/login"
              className="text-blue-500 hover:text-blue-700 font-medium underline transition duration-300"
            >
              Se connecter
            </a>
          </p>
        </div>
        <div className="flex flex-col sm:flex-row sm:space-x-6 w-full">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            onClick={handleRegister}
            disabled={!validateEmail(email) || isLoading}
            className={`w-full sm:w-1/2 flex items-center justify-center text-white text-lg font-semibold py-3 rounded-lg shadow-lg ${
              validateEmail(email) && !isLoading
                ? 'bg-green-500 hover:bg-green-600 animate-pulse-slow'
                : 'bg-gray-400 cursor-not-allowed'
            } transition duration-300 ease-in-out transform`}
          >
            {isLoading ? 'Traitement...' : 'S\'inscrire'}
          </motion.button>
          <motion.a
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            href="/"
            className="w-full sm:w-1/2 flex items-center justify-center bg-gray-600 text-white text-lg font-semibold py-3 rounded-lg shadow-lg hover:bg-gray-700 transition duration-300 ease-in-out transform mt-4 sm:mt-0"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Retour
          </motion.a>
        </div>
      </div>
    </motion.div>
  );
};

export default RegisterPage;