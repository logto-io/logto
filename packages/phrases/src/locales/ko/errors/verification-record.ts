const verification_record = {
  not_found: '인증 기록을 찾을 수 없습니다.',
  permission_denied: '권한이 거부되었습니다. 다시 인증해 주세요.',
  not_supported_for_google_one_tap: '이 API 는 Google One Tap 을 지원하지 않습니다.',
  social_verification: {
    /** UNTRANSLATED */
    invalid_target: 'Invalid verification record. Expected {{expected}} but got {{actual}}.',
    /** UNTRANSLATED */
    token_response_not_found:
      'Token response not found. Please check that token storage is supported and enabled for the social connector.',
  },
};

export default Object.freeze(verification_record);
