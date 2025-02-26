const password = {
  unsupported_encryption_method: 'Il metodo di crittografia {{name}} non è supportato.',
  pepper_not_found: 'Pepper password non trovato. Per favore controlla le tue env di core.',
  rejected:
    'La password è stata rifiutata. Per favore verifica se la tua password soddisfa i requisiti.',
  invalid_legacy_password_format: 'Formato password legacy non valido.',
  unsupported_legacy_hash_algorithm: 'Algoritmo hash legacy non supportato: {{algorithm}}.',
};

export default Object.freeze(password);
