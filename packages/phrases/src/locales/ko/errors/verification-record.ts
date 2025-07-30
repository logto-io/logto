const verification_record = {
  not_found: '인증 기록을 찾을 수 없습니다.',
  permission_denied: '권한이 거부되었습니다. 다시 인증해 주세요.',
  not_supported_for_google_one_tap: '이 API 는 Google One Tap 을 지원하지 않습니다.',
  social_verification: {
    invalid_target: '잘못된 인증 기록입니다. {{actual}} 대신 {{expected}} 을(를) 예상했습니다.',
    token_response_not_found:
      '토큰 응답을 찾을 수 없습니다. 소셜 커넥터에 대해 토큰 저장이 지원되고 사용 설정되어 있는지 확인하세요.',
  },
};

export default Object.freeze(verification_record);
