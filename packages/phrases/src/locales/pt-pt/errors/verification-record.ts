const verification_record = {
  not_found: 'Registo de verificação não encontrado.',
  permission_denied: 'Permissão negada, por favor reautentique-se.',
  not_supported_for_google_one_tap: 'Esta API não suporta o Google One Tap.',
  social_verification: {
    invalid_target:
      'Registo de verificação inválido. Esperava-se {{expected}} mas obteve-se {{actual}}.',
    token_response_not_found:
      'Resposta de token não encontrada. Por favor, verifique se o armazenamento de token é suportado e está ativado para o conector social.',
  },
};

export default Object.freeze(verification_record);
