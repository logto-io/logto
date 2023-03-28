const auth = {
  authorization_header_missing: '인증 헤더가 존재하지 않아요.',
  authorization_token_type_not_supported: '해당 인증 방법을 지원하지 않아요.',
  unauthorized: '인증되지 않았어요. 로그인 정보와 범위를 확인해 주세요.',
  forbidden: '접근이 금지되었어요. 로그인 권한과 역할을 확인해 주세요.',
  expected_role_not_found:
    '예상되는 역할을 찾을 수 없어요. 해당 사용자의 권한 또는 역할을 확인해 주세요.',
  jwt_sub_missing: 'JWT에서 `sub`를 찾을 수 없어요.',
  require_re_authentication: '보호된 작업을 수행하려면 재인증이 필요해요.',
};

export default auth;
