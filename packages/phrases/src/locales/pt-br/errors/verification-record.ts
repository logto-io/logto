const verification_record = {
  not_found: 'Registro de verificação não encontrado.',
  permission_denied: 'Permissão negada, por favor, autentique-se novamente.',
  not_supported_for_google_one_tap: 'Esta API não suporta o Google One Tap.',
  social_verification: {
    /** UNTRANSLATED */
    invalid_target: 'Invalid verification record. Expected {{expected}} but got {{actual}}.',
    /** UNTRANSLATED */
    token_response_not_found:
      'Token response not found. Please check that token storage is supported and enabled for the social connector.',
  },
};

export default Object.freeze(verification_record);
