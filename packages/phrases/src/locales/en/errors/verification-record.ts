const verification_record = {
  not_found: 'Verification record not found.',
  permission_denied: 'Permission denied, please re-authenticate.',
  not_supported_for_google_one_tap: 'This API does not support Google One Tap.',
  social_verification: {
    invalid_target: 'Invalid verification record. Expected {{expected}} but got {{actual}}.',
    token_response_not_found:
      'Token response not found. Please check that token storage is supported and enabled for the social connector.',
  },
};

export default Object.freeze(verification_record);
