// utils/validation/validation.js

/**
 * Valide un email.
 * @param {string} email - L'email à valider.
 * @returns {void}
 * @throws {Error} Si l'email est invalide ou manquant.
 */
export function validateEmail(email) {
    // console.log('Validation: Vérification de l\'email', email);
    
    if (!email || typeof email !== 'string' || email.trim() === '') {
      // console.error('Validation: Email manquant ou vide', email);
      throw new Error('L\'email est requis et doit être une chaîne non vide');
    }
  
    // Regex simple pour valider le format d'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      // console.error('Validation: Format d\'email invalide', email);
      throw new Error(`L'email "${email}" n'est pas valide`);
    }
  
    // console.log('Validation: Email valide', email);
  }