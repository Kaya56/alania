// src/utils/apiBase.js

// Port par défaut, peut venir d’une env var si besoin
const DEFAULT_PORT = process.env.REACT_APP_API_PORT || 8080;

// Détermine si on est en prod (nom de domaine) ou dev (localhost/127.0.0.1)
const isLocal = ['localhost', '127.0.0.1'].includes(window.location.hostname);

// Choix de l’hôte
const host = isLocal ? 'localhost' : window.location.hostname;

// Choix du protocole HTTP / HTTPS
const httpProtocol = window.location.protocol; // 'http:' ou 'https:'

// Protocole WebSocket selon HTTP(s)
const wsProtocol = httpProtocol === 'https:' ? 'wss:' : 'ws:';

// Base URLs
export const API_BASE = `${httpProtocol}//${host}:${DEFAULT_PORT}`;
export const WS_BASE  = `${wsProtocol}//${host}:${DEFAULT_PORT}`;

export default API_BASE;
