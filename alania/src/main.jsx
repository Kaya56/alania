console.log('App initialisée');
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

console.log('main.jsx: démarrage');

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
);