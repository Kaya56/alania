// polyfill-randomBytes.js
// Importer tout le module 'buffer' et en extraire Buffer
import * as buffer from 'buffer';
const { Buffer } = buffer;

// Importer tout le module crypto (via l'alias configuré dans Vite, par exemple crypto-browserify)
import * as crypto from 'crypto';

// Vérifier si randomBytes n'existe pas et définir une version adaptée
if (typeof crypto.randomBytes !== 'function') {
  crypto.randomBytes = function (size, callback) {
    // Utilise l'API native du navigateur pour obtenir des valeurs aléatoires
    const arr = new Uint8Array(size);
    window.crypto.getRandomValues(arr);
    const buf = Buffer.from(arr);
    if (typeof callback === 'function') {
      callback(null, buf);
    }
    return buf;
  };
}

export { crypto };
