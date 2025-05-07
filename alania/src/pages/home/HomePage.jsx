// src/pages/HomePage.jsx

import React from 'react';

const HomePage = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-gray-100 to-blue-100 p-6">
            <h1 className="text-4xl font-extrabold text-gray-800 mb-8 drop-shadow-md">Bienvenue sur Alania</h1>
            <p className="text-lg text-gray-600 mb-6">Choisissez une option ci-dessous pour continuer</p>
            <div className="flex flex-col sm:flex-row sm:space-x-6 w-full max-w-md">
                <a 
                    href="/login" 
                    className="w-full sm:w-1/2 flex items-center justify-center bg-blue-600 text-white text-lg font-semibold py-3 rounded-lg shadow-lg hover:bg-blue-700 hover:scale-105 transition duration-300 ease-in-out transform space-x-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m2-4h.01M12 4.5A8.5 8.5 0 1012 21a8.5 8.5 0 000-16.5z" />
                    </svg>
                    <span>Se connecter</span>
                </a>
                <a 
                    href="/register" 
                    className="w-full sm:w-1/2 flex items-center justify-center bg-green-500 text-white text-lg font-semibold py-3 rounded-lg shadow-lg hover:bg-green-600 hover:scale-105 transition duration-300 ease-in-out transform space-x-2 mt-4 sm:mt-0"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 21v-2a4 4 0 00-8 0v2m8 0H8m8-8V7a4 4 0 10-8 0v6m8 0H8" />
                    </svg>
                    <span>S'inscrire</span>
                </a>
            </div>
        </div>
    );
};

export default HomePage;
