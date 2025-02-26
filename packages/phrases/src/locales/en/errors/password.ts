const password = {
  unsupported_encryption_method: 'The encryption method {{name}} is not supported.',
  pepper_not_found: 'Password pepper not found. Please check your core envs.',
  rejected: 'Password rejected. Please check if your password meets the requirements.',
  invalid_legacy_password_format: 'Invalid legacy password format.',
  unsupported_legacy_hash_algorithm: 'Unsupported legacy hash algorithm: {{algorithm}}.',
};

export default Object.freeze(password);
