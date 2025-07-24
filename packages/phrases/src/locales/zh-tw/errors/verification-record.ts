const verification_record = {
  not_found: '找不到驗證紀錄。',
  permission_denied: '權限被拒，請重新驗證身份。',
  not_supported_for_google_one_tap: '此 API 不支援 Google One Tap。',
  social_verification: {
    /** UNTRANSLATED */
    invalid_target: 'Invalid verification record. Expected {{expected}} but got {{actual}}.',
    /** UNTRANSLATED */
    token_response_not_found:
      'Token response not found. Please check that token storage is supported and enabled for the social connector.',
  },
};

export default Object.freeze(verification_record);
