const one_time_token = {
  token_not_found: 'Token {{token}} não encontrado.',
  email_mismatch: 'O e-mail não corresponde ao token fornecido.',
  token_expired: 'O token expirou.',
  token_consumed: 'O token já foi utilizado.',
  token_revoked: 'O token foi revogado.',
  cannot_reactivate_token: 'Não é possível reativar o token.',
};

export default Object.freeze(one_time_token);
