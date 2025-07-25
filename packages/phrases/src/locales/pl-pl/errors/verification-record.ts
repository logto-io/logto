const verification_record = {
  not_found: 'Nie znaleziono rekordu weryfikacyjnego.',
  permission_denied: 'Odmowa dostępu, proszę ponownie się uwierzytelnić.',
  not_supported_for_google_one_tap: 'Ta API nie obsługuje Google One Tap.',
  social_verification: {
    /** UNTRANSLATED */
    invalid_target: 'Invalid verification record. Expected {{expected}} but got {{actual}}.',
    /** UNTRANSLATED */
    token_response_not_found:
      'Token response not found. Please check that token storage is supported and enabled for the social connector.',
  },
};

export default Object.freeze(verification_record);
