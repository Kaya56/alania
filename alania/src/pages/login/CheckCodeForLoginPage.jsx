import React, { useState, useRef, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';

const CheckCodeForLoginPage = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isFocused, setIsFocused] = useState(false);
  const inputRefs = useRef([]);
  const hasSentRef = useRef(false);
  const navigate = useNavigate();
  const { verifyLogin, startLogin } = useAuth();

  // Redirect to /login if email is missing
  useEffect(() => {
    if (!email) {
      setError('Aucun email fourni. Veuillez recommencer la connexion.');
      setTimeout(() => navigate('/login'), 3000);
    }
  }, [email, navigate]);

  // Handle resend cooldown and send code when it reaches 0
  useEffect(() => {
    let intervalId;
    if (resendCooldown > 0) {
      intervalId = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            if (!hasSentRef.current && email) {
              hasSentRef.current = true;
              setIsLoading(true);
              startLogin(email)
                .then((result) => {
                  if (result.success) {
                    setMessage('Nouveau code envoyé à votre email.');
                  } else {
                    throw new Error(result.message);
                  }
                })
                .catch((err) => {
                  setError(err.message || 'Erreur lors de l\'envoi du code');
                })
                .finally(() => {
                  setIsLoading(false);
                });
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalId);
  }, [resendCooldown, email, startLogin]);

  const handleChange = (index, value) => {
    if (value.length > 1) return;
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    if (value && index < code.length - 1) {
      inputRefs.current[index + 1]?.focus();
    } else if (!value && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'Enter' && index === code.length - 1 && !code.includes('')) {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    if (!email) {
      setError('Email manquant. Veuillez recommencer.');
      return;
    }
    const fullCode = code.join('');
    if (fullCode.length !== 6) {
      setError('Veuillez entrer un code complet.');
      return;
    }
    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      const result = await verifyLogin(email, fullCode);
      console.log('verifyLogin result:', result, 'currentUser:', result.success ? 'set' : 'not set');
      if (result.success) {
        setMessage('Connexion réussie ! Redirection en cours...');
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      alert(err);
      setError(err.message || 'Code incorrect ou expiré');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = () => {
    if (resendCooldown > 0 || isLoading || !email) return;
    setError('');
    setMessage('Un nouveau code sera envoyé dans 30 secondes.');
    setResendCooldown(30);
    hasSentRef.current = false;
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-gray-100 to-blue-100 p-6"
    >
      <h1 className="text-4xl font-extrabold text-gray-800 mb-8 drop-shadow-md">Vérification du code</h1>
      <p className="text-lg text-gray-600 mb-6">
        Code envoyé à <strong>{email || 'votre email'}</strong>
      </p>
      <div className="w-full max-w-md flex flex-col items-center space-y-6">
        <div
          className="flex justify-center space-x-2"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        >
          {code.map((digit, index) => (
            <input
              key={index}
              type="text"
              maxLength="1"
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              ref={(el) => (inputRefs.current[index] = el)}
              className="w-12 h-12 text-center text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent text-gray-700 shadow-md"
              aria-label={`Caractère ${index + 1} du code de vérification`}
              aria-describedby="code-error code-message"
            />
          ))}
        </div>
        <div aria-live="polite" className="w-full">
          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-500 text-center font-medium"
              id="code-error"
            >
              {error}
            </motion.p>
          )}
          {message && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-green-500 text-center font-medium"
              id="code-message"
            >
              {message}
            </motion.p>
          )}
        </div>
        {isLoading && (
          <div className="flex justify-center items-center">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 border-4 border-green-200 rounded-full animate-pulse"></div>
              <div className="absolute inset-0 border-4 border-t-green-600 border-r-green-600 rounded-full animate-spin"></div>
              <div className="absolute inset-2 border-2 border-green-400 rounded-full animate-spin-reverse"></div>
            </div>
          </div>
        )}
        <div className="flex flex-col sm:flex-row sm:space-x-6 w-full">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSubmit}
            disabled={code.includes('') || isLoading || !email}
            className={`w-full sm:w-1/2 flex items-center justify-center text-white text-lg font-semibold py-3 rounded-lg shadow-lg ${
              code.includes('') || isLoading || !email
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-green-500 hover:bg-green-600 animate-pulse-slow'
            } transition duration-300 ease-in-out transform`}
            transition={{ delay: 0.1 }}
          >
            {isLoading ? 'Traitement...' : 'Valider'}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleBack}
            className="w-full sm:w-1/2 flex items-center justify-center bg-gray-600 text-white text-lg font-semibold py-3 rounded-lg shadow-lg hover:bg-gray-700 transition duration-300 ease-in-out transform mt-4 sm:mt-0"
            transition={{ delay: 0.2 }}
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
          </motion.button>
        </div>
        <div className="text-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleResendCode}
            disabled={resendCooldown > 0 || isLoading || !email}
            className={`text-blue-500 hover:text-blue-700 font-medium transition duration-300 ${
              resendCooldown > 0 || isLoading || !email ? 'opacity-50 cursor-not-allowed' : 'underline'
            }`}
          >
            {resendCooldown > 0
              ? `Renvoyer le code (${resendCooldown}s)`
              : 'Renvoyer le code'}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default CheckCodeForLoginPage;