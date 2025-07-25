const verification_record = {
  not_found: '検証レコードが見つかりません。',
  permission_denied: '許可が拒否されましたので、再認証してください。',
  not_supported_for_google_one_tap: 'この API は Google One Tap をサポートしていません。',
  social_verification: {
    /** UNTRANSLATED */
    invalid_target: 'Invalid verification record. Expected {{expected}} but got {{actual}}.',
    /** UNTRANSLATED */
    token_response_not_found:
      'Token response not found. Please check that token storage is supported and enabled for the social connector.',
  },
};

export default Object.freeze(verification_record);
