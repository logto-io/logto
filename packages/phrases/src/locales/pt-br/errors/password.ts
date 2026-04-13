const password = {
  unsupported_encryption_method: 'O método de criptografia {{name}} não é suportado.',
  pepper_not_found: 'Password pepper não encontrada. Por favor, verifique seus envs principais.',
  rejected: 'Senha rejeitada. Por favor, verifique se sua senha atende aos requisitos.',
  invalid_legacy_password_format: 'Formato de senha legada inválido.',
  unsupported_legacy_hash_algorithm: 'Algoritmo de hash legado não suportado: {{algorithm}}.',
  expired: 'Sua senha expirou. Por favor, redefina sua senha para continuar.',
  expiration_reminder:
    'Sua senha expirará em {{daysUntilExpiration}} dia(s). Por favor, considere redefini-la.',
};

export default Object.freeze(password);
