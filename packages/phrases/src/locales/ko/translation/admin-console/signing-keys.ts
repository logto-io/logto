const signing_keys = {
  title: '서명 키',
  description: '애플리케이션에서 사용되는 서명 키를 안전하게 관리합니다.',
  private_key: 'OIDC 개인 키',
  private_keys_description: 'OIDC 개인 키는 JWT 토큰을 서명하는 데 사용됩니다.',
  cookie_key: 'OIDC 쿠키 키',
  cookie_keys_description: 'OIDC 쿠키 키는 쿠키를 서명하는 데 사용됩니다.',
  private_keys_in_use: '사용 중인 개인 키',
  cookie_keys_in_use: '사용 중인 쿠키 키',
  rotate_private_keys: '개인 키 회전',
  rotate_cookie_keys: '쿠키 키 회전',
  rotate_private_keys_description:
    '이 작업은 새로운 개인 서명 키를 생성하고 현재 키를 회전시키고 이전 키를 삭제합니다. 현재 키로 서명 된 JWT 토큰은 삭제하거나 다른 회전할 때까지 유효합니다.',
  rotate_cookie_keys_description:
    '이 작업은 새 쿠키 키를 생성하고 현재 키를 회전하며 이전 키를 삭제합니다. 현재 키로 서명 된 쿠키는 삭제하거나 다른 회전할 때까지 유효합니다.',
  select_private_key_algorithm: '새 개인 키의 서명 키 알고리즘 선택',
  rotate_button: '회전',
  table_column: {
    id: 'ID',
    status: '상태',
    algorithm: '서명 키 알고리즘',
  },
  status: {
    current: '현재',
    previous: '이전',
  },
  reminder: {
    rotate_private_key:
      '정말 <strong>OIDC 개인 키</strong>를 회전하시겠습니까? 새로 발급 된 JWT 토큰은 새 키로 서명됩니다. 기존 JWT 토큰은 회전할 때까지 유효합니다.',
    rotate_cookie_key:
      '정말 <strong>OIDC 쿠키 키</strong>를 회전하시겠습니까? 로그인 세션에서 생성 된 새로운 쿠키는 새 쿠키 키로 서명됩니다. 기존 쿠키는 회전할 때까지 유효합니다.',
    delete_private_key:
      '정말 <strong>OIDC 개인 키</strong>를 삭제하시겠습니까? 이전에 개인 서명 키로 서명 된 기존 JWT 토큰은 더 이상 유효하지 않게 됩니다.',
    delete_cookie_key:
      '정말 <strong>OIDC 쿠키 키</strong>를 삭제하시겠습니까? 이전에 이 쿠키 키로 서명 된 로그인 세션은 더 이상 유효하지 않게 될 것입니다. 이 사용자들에게는 다시 인증이 필요합니다.',
  },
  messages: {
    rotate_key_success: '서명 키가 성공적으로 회전되었습니다.',
    delete_key_success: '키가 성공적으로 삭제되었습니다.',
  },
};

export default Object.freeze(signing_keys);
