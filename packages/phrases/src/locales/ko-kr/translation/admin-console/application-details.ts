const application_details = {
  back_to_applications: '어플리케이션으로 돌아가기',
  check_guide: '가이드 확인',
  advanced_settings: '고급 설정',
  application_name: '어플리케이션 이름',
  application_name_placeholder: '나의 앱',
  description: '설명',
  description_placeholder: '어플리케이션 설명을 적어주세요.',
  authorization_endpoint: '인증 End-Point',
  authorization_endpoint_tip:
    '인증 및 권한 부여를 진행할 End-Point예요. OpenID Connect 인증에서 사용되던 값 이에요.',
  application_id: 'App ID',
  application_secret: 'App Secret',
  redirect_uri: 'Redirect URI',
  redirect_uris: 'Redirect URIs',
  redirect_uri_placeholder: 'https://your.website.com/app',
  redirect_uri_placeholder_native: 'io.logto://callback',
  redirect_uri_tip:
    '사용자 로그인 이후, 리다이렉트 될 URI 경로예요. 더욱 자세한 정보는 OpenID Connect AuthRequest를 참고해주세요.',
  post_sign_out_redirect_uri: '로그아웃 이후 Redirect URI',
  post_sign_out_redirect_uris: '로그아웃 이후 Redirect URIs',
  post_sign_out_redirect_uri_placeholder: 'https://your.website.com/home',
  post_sign_out_redirect_uri_tip:
    '로그아웃 이후, 리다이렉트 될 URI 경로예요 (선택). 일부 앱에서는 실제 효과가 없을 수 있어요.',
  cors_allowed_origins: 'CORS Allow Origins',
  cors_allowed_origins_placeholder: 'https://your.website.com',
  cors_allowed_origins_tip:
    '기본으로 모든 리다이렉트의 오리진들은 허용되요. 대체적으로 이 값을 건들 필요는 없어요.',
  add_another: '새로 추가',
  id_token_expiration: 'ID 토큰 만료',
  refresh_token_expiration: 'Refresh 토큰 만료',
  token_endpoint: '토큰 End-Point',
  user_info_endpoint: '사용자 정보 End-Point',
  enable_admin_access: 'Enable admin access', // UNTRANSLATED
  enable_admin_access_label:
    'Enable or disable the access to Management API. Once enabled, you can use access tokens to call Management API on behalf on this application.', // UNTRANSLATED
  delete_description:
    '이 행동은 취소될 수 없어요. 어플리케이션을 영원히 삭제할 거에요. 삭제를 진행하기 위해 <span>{{name}}</span> 를 입력해주세요.',
  enter_your_application_name: '어플리케이션 이름을 입력해주세요.',
  application_deleted: '{{name}} 어플리케이션이 성공적으로 삭제되었어요.',
  redirect_uri_required: '반드시 최소 하나의 Redirect URI를 입력해야되요.',
};

export default application_details;
