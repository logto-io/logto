const verification_record = {
  not_found: 'Registro de verificação não encontrado.',
  permission_denied: 'Permissão negada, por favor, autentique-se novamente.',
  not_supported_for_google_one_tap: 'Esta API não suporta o Google One Tap.',
  social_verification: {
    invalid_target:
      'Registro de verificação inválido. Esperado {{expected}}, mas recebido {{actual}}.',
    token_response_not_found:
      'Resposta do token não encontrada. Verifique se o armazenamento de token é compatível e está habilitado para o conector social.',
  },
};

export default Object.freeze(verification_record);
