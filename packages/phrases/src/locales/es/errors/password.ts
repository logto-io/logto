const password = {
  unsupported_encryption_method: 'El método de encriptación {{name}} no es compatible.',
  pepper_not_found: 'No se encontró el password pepper. Por favor revisa tus variables de entorno.',
  rejected: 'Contraseña rechazada. Por favor verifica que tu contraseña cumpla con los requisitos.',
  invalid_legacy_password_format: 'Formato de contraseña heredada no válido.',
  unsupported_legacy_hash_algorithm: 'Algoritmo hash heredado no compatible: {{algorithm}}.',
};

export default Object.freeze(password);
