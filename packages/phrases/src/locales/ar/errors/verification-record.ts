const verification_record = {
  not_found: 'لم يتم العثور على سجل التحقق.',
  permission_denied: 'تم رفض الإذن، يرجى إعادة التحقق.',
  not_supported_for_google_one_tap: 'هذا الـ API لا يدعم Google One Tap.',
  social_verification: {
    /** UNTRANSLATED */
    invalid_target: 'Invalid verification record. Expected {{expected}} but got {{actual}}.',
    /** UNTRANSLATED */
    token_response_not_found:
      'Token response not found. Please check that token storage is supported and enabled for the social connector.',
  },
};

export default Object.freeze(verification_record);
