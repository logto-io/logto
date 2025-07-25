const verification_record = {
  not_found: 'No se encontró el registro de verificación.',
  permission_denied: 'Permiso denegado, por favor vuelve a autenticarte.',
  not_supported_for_google_one_tap: 'Esta API no es compatible con Google One Tap.',
  social_verification: {
    /** UNTRANSLATED */
    invalid_target: 'Invalid verification record. Expected {{expected}} but got {{actual}}.',
    /** UNTRANSLATED */
    token_response_not_found:
      'Token response not found. Please check that token storage is supported and enabled for the social connector.',
  },
};

export default Object.freeze(verification_record);
