const verification_record = {
  not_found: 'Verifizierungsdatensatz nicht gefunden.',
  permission_denied: 'Zugriff verweigert, bitte erneut authentifizieren.',
  not_supported_for_google_one_tap: 'Diese API unterstützt Google One Tap nicht.',
  social_verification: {
    /** UNTRANSLATED */
    invalid_target: 'Invalid verification record. Expected {{expected}} but got {{actual}}.',
    /** UNTRANSLATED */
    token_response_not_found:
      'Token response not found. Please check that token storage is supported and enabled for the social connector.',
  },
};

export default Object.freeze(verification_record);
