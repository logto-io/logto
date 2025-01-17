const password = {
  unsupported_encryption_method: 'Die Verschlüsselungsmethode {{name}} wird nicht unterstützt.',
  pepper_not_found: 'Password pepper not found. Please check your core envs.',
  rejected:
    'Das Passwort wurde abgelehnt. Bitte überprüfen Sie, ob Ihr Passwort den Anforderungen entspricht.',
  invalid_legacy_password_format: 'Ungültiges Legacy-Passwortformat.',
  unsupported_legacy_hash_algorithm: 'Nicht unterstützter Legacy-Hash-Algorithmus: {{algorithm}}.',
};

export default Object.freeze(password);
