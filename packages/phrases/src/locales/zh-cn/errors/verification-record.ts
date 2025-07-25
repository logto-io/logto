const verification_record = {
  not_found: '未找到验证记录。',
  permission_denied: '权限被拒绝，请重新验证。',
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
