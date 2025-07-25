const verification_record = {
  not_found: 'Запись подтверждения не найдена.',
  permission_denied: 'Доступ запрещён, пожалуйста, повторно пройдите аутентификацию.',
  not_supported_for_google_one_tap: 'Этот API не поддерживает Google One Tap.',
  social_verification: {
    /** UNTRANSLATED */
    invalid_target: 'Invalid verification record. Expected {{expected}} but got {{actual}}.',
    /** UNTRANSLATED */
    token_response_not_found:
      'Token response not found. Please check that token storage is supported and enabled for the social connector.',
  },
};

export default Object.freeze(verification_record);
