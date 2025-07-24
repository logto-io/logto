const verification_record = {
  not_found: '未能找到驗證記錄。',
  permission_denied: '沒有權限，請重新驗證。',
  not_supported_for_google_one_tap: '此 API 不支持 Google One Tap。',
  social_verification: {
    /** UNTRANSLATED */
    invalid_target: 'Invalid verification record. Expected {{expected}} but got {{actual}}.',
    /** UNTRANSLATED */
    token_response_not_found:
      'Token response not found. Please check that token storage is supported and enabled for the social connector.',
  },
};

export default Object.freeze(verification_record);
