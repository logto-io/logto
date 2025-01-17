const password = {
  unsupported_encryption_method: 'O método de encriptação {{name}} não é suportado.',
  pepper_not_found: 'pepper da Password não encontrada. Por favor, verifique os envs.',
  rejected: 'Senha rejeitada. Por favor, verifique se sua senha atende aos requisitos.',
  invalid_legacy_password_format: 'Formato de palavra-passe antiga inválido.',
  unsupported_legacy_hash_algorithm: 'Algoritmo de hash antigo não suportado: {{algorithm}}.',
};

export default Object.freeze(password);
