const application_details = {
  page_title: '애플리케이션 세부 정보',
  back_to_applications: '어플리케이션으로 돌아가기',
  check_guide: '가이드 확인',
  settings: '설정',
  settings_description:
    'An "Application" is a registered software or service that can access user info or act for a user. Applications help recognize who’s asking for what from Logto and handle the sign-in and permission. Fill in the required fields for authentication.',
  integration: '통합',
  integration_description:
    '로그토에서 클라우드플레어의 엣지 네트워크로 구동되는 안전한 워커를 사용하여 세계적인 최고 수준의 성능 및 전 세계 0ms의 차가운 시작을 구동합니다.',
  service_configuration: '서비스 구성',
  service_configuration_description: '서비스에서 필요한 구성을 완료하세요.',
  session: '세션',
  endpoints_and_credentials: '엔드포인트 및 자격증명',
  endpoints_and_credentials_description:
    '이 어플리케이션에서 OIDC 연결 설정을 위해 다음 엔드포인트 및 자격증명을 사용하세요.',
  refresh_token_settings: 'Refresh 토큰',
  refresh_token_settings_description: '이 어플리케이션을 위한 Refresh 토큰 규칙을 관리하세요.',
  application_roles: '역할',
  machine_logs: '기계 로그',
  application_name: '어플리케이션 이름',
  application_name_placeholder: '나의 앱',
  description: '설명',
  description_placeholder: '어플리케이션 설명을 적어주세요.',
  config_endpoint: 'OpenID Provider 구성 엔드포인트',
  authorization_endpoint: '인증 엔드포인트',
  authorization_endpoint_tip:
    '인증 및 권한 부여를 진행할 엔드포인트입니다. OpenID Connect <a>인증</a>에서 사용되었던 값입니다.',
  show_endpoint_details: '엔드포인트 세부 정보 표시',
  hide_endpoint_details: '엔드포인트 세부 정보 숨기기',
  logto_endpoint: '로그토 엔드포인트',
  application_id: '앱 ID',
  application_id_tip:
    '일반적으로 로그토에서 생성되는 고유한 애플리케이션 식별자입니다. OpenID Connect에서 "<a>client_id</a>"의 약어입니다.',
  application_secret: '앱 시크릿',
  redirect_uri: '리디렉트 URI',
  redirect_uris: '리디렉트 URIs',
  redirect_uri_placeholder: 'https://your.website.com/app',
  redirect_uri_placeholder_native: 'io.logto://callback',
  redirect_uri_tip:
    '사용자 로그인 후 리디렉트될 URI 경로입니다. 더 자세한 정보는 OpenID Connect <a>인증 요청</a>을 참조하세요.',
  post_sign_out_redirect_uri: '로그아웃 후 리디렉트 URI',
  post_sign_out_redirect_uris: '로그아웃 후 리디렉트 URIs',
  post_sign_out_redirect_uri_placeholder: 'https://your.website.com/home',
  post_sign_out_redirect_uri_tip:
    '로그아웃 후 리디렉트될 URI 경로입니다 (선택 사항). 일부 앱에서는 실제로 작동하지 않을 수 있습니다.',
  cors_allowed_origins: 'CORS 허용 오리진',
  cors_allowed_origins_placeholder: 'https://your.website.com',
  cors_allowed_origins_tip:
    '기본적으로 모든 리디렉트 오리진들이 허용됩니다. 일반적으로 이 값을 변경할 필요가 없습니다. 더 자세한 정보는 <a>MDN 문서</a>를 확인하세요.',
  token_endpoint: '토큰 엔드포인트',
  user_info_endpoint: '사용자 정보 엔드포인트',
  enable_admin_access: '관리자 접근 활성화',
  enable_admin_access_label:
    '관리 API에 대한 접근을 활성화 또는 비활성화할 수 있습니다. 활성화하면, 이 애플리케이션에서 Access 토큰을 통해 관리 API를 사용할 수 있습니다.',
  always_issue_refresh_token: '항상 Refresh 토큰 발급',
  always_issue_refresh_token_label:
    '다음 구성을 활성화하면 Logto가 인증 요청에 `prompt=consent`가 제시되었는지 여부와 상관없이 항상 Refresh 토큰을 발급할 수 있게 됩니다. 그러나 OpenID Connect와 호환되지 않을 수 있으므로 필요하지 않은 경우에는 이 방식을 권장하지 않습니다.',
  refresh_token_ttl: 'Refresh 토큰 수명 (일)',
  refresh_token_ttl_tip:
    '새로운 Access 토큰을 요청할 수 있는 Refresh 토큰의 기간입니다. 토큰 요청 시 Refresh 토큰의 수명이 이 값으로 연장됩니다.',
  rotate_refresh_token: 'Refresh 토큰 회전',
  rotate_refresh_token_label:
    '활성화하면, 원래 TTL 중 70%가 지난 후 또는 특정 조건이 충족되면 Refresh 토큰 요청에 대해 새로운 Refresh 토큰을 발행합니다. <a>자세히 보기</a>',
  delete_description:
    '이 행동은 취소할 수 없습니다. 애플리케이션을 영구적으로 삭제할 것입니다. 삭제를 진행하려면 <span>{{name}}</span>를 입력하세요.',
  enter_your_application_name: '어플리케이션 이름을 입력하세요.',
  application_deleted: '{{name}} 애플리케이션이 성공적으로 삭제되었습니다.',
  redirect_uri_required: '최소 하나의 리디렉트 URI를 반드시 입력해야 합니다.',
  app_domain_description_1:
    'Feel free to use your domain with {{domain}} powered by Logto, which is permanently valid.',
  app_domain_description_2:
    'Feel free to utilize your domain <domain>{{domain}}</domain> which is permanently valid.',
  custom_rules: '사용자 인증규칙',
  custom_rules_placeholder: '^/(admin|privacy)/.+$',
  custom_rules_description:
    '사용자 인증이 필요한 라우트에 대한 정규 표현식 규칙을 설정하세요. 기본값: 비어있을 경우 전체 사이트 보호.',
  authentication_routes: '인증 라우트',
  custom_rules_tip:
    "다음의 두 가지 케이스를 보여드립니다:<ol><li>'/admin' 및 '/privacy' 라우트만 사용자 인증으로 보호하는 경우: ^/(admin|privacy)/.*</li><li>JPG 이미지를 제외한 경우: ^(?!.*\\.jpg$).*$</li></ol>",
  authentication_routes_description:
    '지정된 라우트를 사용하여 인증 버튼을 리디렉션합니다. 참고: 이 라우트들은 변경할 수 없습니다.',
  protect_origin_server: '원본 서버 보호',
  protect_origin_server_description:
    '원본 서버를 직접 액세스로부터 보호하세요. 더 많은 <a>자세한 지침</a>을 위해 안내서를 참조하세요.',
  session_duration: '세션 기간 (일)',
  try_it: '해보기',
  branding: {
    name: '브랜딩',
    description: '동의 화면에서 앱의 표시 이름과 로고를 사용자 정의하세요.',
    more_info: '추가 정보',
    more_info_description: '동의 화면에서 사용자에게 앱에 대한 자세한 정보를 제공하세요.',
    display_name: '표시 이름',
    display_logo: '표시 로고',
    display_logo_dark: '표시 로고 (어두운 버전)',
    terms_of_use_url: '애플리케이션 이용 약관 URL',
    privacy_policy_url: '애플리케이션 개인정보 보호정책 URL',
  },
  permissions: {
    name: '권한',
    description:
      '제3자 애플리케이션이 사용자 인증 특정 데이터 유형에 액세스하기 위해 필요한 권한을 선택하세요.',
    user_permissions: '개인 사용자 데이터',
    organization_permissions: '조직 액세스',
    table_name: '권한 부여',
    field_name: '권한',
    field_description: '동의 화면에서 표시됨',
    delete_text: '권한 제거',
    permission_delete_confirm:
      '이 작업은 제3자 앱에 부여된 권한을 취소하여 특정 데이터 유형에 대한 사용자 권한 요청을 막습니다. 계속 진행하시겠습니까?',
    permissions_assignment_description:
      '제3자 애플리케이션이 특정 데이터 유형에 액세스하기 위해 사용자에게 요청하는 권한을 선택하세요.',
    user_profile: '사용자 데이터',
    api_permissions: 'API 권한',
    organization: '조직 권한',
    user_permissions_assignment_form_title: '사용자 프로필 권한 추가',
    organization_permissions_assignment_form_title: '조직 권한 추가',
    api_resource_permissions_assignment_form_title: 'API 리소스 권한 추가',
    user_data_permission_description_tips:
      '개인 사용자 데이터 권한에 대한 설명을 "사용자 경험 > 콘텐츠 > 언어 관리"를 통해 수정할 수 있습니다.',
    permission_description_tips:
      'Logto가 제3자 앱의 인증을 위해 Identity Provider (IdP)로 사용되고 사용자가 권한을 요청하면, 이 설명이 동의 화면에 나타납니다.',
    user_title: '사용자',
    user_description: '제3자 앱에서 특정 사용자 데이터에 액세스하려는 권한을 선택하세요.',
    grant_user_level_permissions: '사용자 데이터의 권한 부여',
    organization_title: '조직',
    organization_description: '제3자 앱에서 특정 조직 데이터에 액세스하려는 권한을 선택하세요.',
    grant_organization_level_permissions: '조직 데이터의 권한 부여',
  },
  roles: {
    name_column: '역할',
    description_column: '설명',
    assign_button: '역할 할당',
    delete_description:
      '이 작업은 이 장치 간 앱에서이 역할을 제거합니다. 역할 자체는 여전히 존재하지만 이 장치 간 앱과 관련이 없어집니다.',
    deleted: '{{name}} 가 성공적으로 삭제되었습니다.',
    assign_title: '{{name}} 에 역할 할당',
    assign_subtitle: '{{name}} 에게 하나 이상의 역할을 할당하세요.',
    assign_role_field: '역할 할당',
    role_search_placeholder: '역할 이름으로 검색',
    added_text: '{{value, number}} 추가됨',
    assigned_app_count: '{{value, number}} 개의 애플리케이션',
    confirm_assign: '역할 할당',
    role_assigned: '역할이 성공적으로 할당되었습니다.',
    search: '역할 이름, 설명 또는 ID로 검색',
    empty: '사용 가능한 역할이 없습니다.',
  },
};

export default Object.freeze(application_details);
