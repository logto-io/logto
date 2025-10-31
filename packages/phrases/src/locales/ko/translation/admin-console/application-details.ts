const application_details = {
  page_title: '애플리케이션 세부 정보',
  back_to_applications: '어플리케이션으로 돌아가기',
  check_guide: '가이드 확인',
  settings: '설정',
  settings_description:
    '애플리케이션은 사용자 정보를 조회하거나 사용자를 대신해 동작할 수 있도록 등록된 소프트웨어나 서비스입니다. 애플리케이션은 Logto가 누가 무엇을 요청하는지 파악하고, 로그인과 권한 부여를 처리하도록 돕습니다. 인증을 위해 필수 필드를 모두 입력하세요.',
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
  machine_logs: '기계 로그',
  application_name: '어플리케이션 이름',
  application_name_placeholder: '나의 앱',
  description: '설명',
  description_placeholder: '어플리케이션 설명을 적어주세요.',
  config_endpoint: 'OpenID Provider 구성 엔드포인트',
  issuer_endpoint: '발급자 엔드포인트',
  jwks_uri: 'JWKS URI',
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
  application_secret_other: '앱 시크릿',
  redirect_uri: '리디렉트 URI',
  redirect_uris: '리디렉트 URIs',
  redirect_uri_placeholder: 'https://your.website.com/app',
  redirect_uri_placeholder_native: 'io.logto://callback',
  redirect_uri_tip:
    '사용자 로그인 후 리디렉트될 URI 경로입니다. 더 자세한 정보는 OpenID Connect <a>인증 요청</a>을 참조하세요.',
  mixed_redirect_uri_warning:
    '어플리케이션 유형이 적어도 하나의 리디렉트 URI 와 호환되지 않습니다. 이는 모범 사례를 따르지 않으며, 리디렉트 URI 들을 일관되게 유지할 것을 강력히 권장합니다.',
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
  rotate_refresh_token_label_for_public_clients:
    '활성화되면, Logto 는 각 토큰 요청에 대해 새로운 refresh 토큰을 발행합니다. <a>자세히 보기</a>',
  backchannel_logout: '백채널 로그아웃',
  backchannel_logout_description:
    '애플리케이션에 세션이 필요한 경우 OpenID Connect 백채널 로그아웃 엔드포인트를 구성하세요.',
  backchannel_logout_uri: '백채널 로그아웃 URI',
  backchannel_logout_uri_session_required: '세션이 필요합니까?',
  backchannel_logout_uri_session_required_description:
    '활성화되면, RP는 `sid` (세션 ID) 클레임이 로그아웃 토큰에 포함되어 `backchannel_logout_uri` 사용 시 OP와 RP 세션을 식별하도록 요구합니다.',
  delete_description:
    '이 행동은 취소할 수 없습니다. 애플리케이션을 영구적으로 삭제할 것입니다. 삭제를 진행하려면 <span>{{name}}</span>를 입력하세요.',
  enter_your_application_name: '어플리케이션 이름을 입력하세요.',
  application_deleted: '{{name}} 애플리케이션이 성공적으로 삭제되었습니다.',
  redirect_uri_required: '최소 하나의 리디렉트 URI를 반드시 입력해야 합니다.',
  app_domain_description_1:
    'Logto 에 의해 구동되는 {{domain}} 와 함께 도메인을 자유롭게 사용하세요. 이것은 영구적으로 유효합니다.',
  app_domain_description_2:
    '도메인 <domain>{{domain}}</domain> 을 자유롭게 활용하세요. 이것은 영구적으로 유효합니다.',
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
  third_party_settings_description:
    'OIDC / OAuth 2.0 을 사용하여 Logto 를 당신의 ID 공급자 (IdP) 로 활용하여 제3자 애플리케이션을 통합하고 사용자의 권한 승인을 위한 동의 화면을 제공합니다.',
  session_duration: '세션 기간 (일)',
  try_it: '해보기',
  no_organization_placeholder: '조직을 찾을 수 없습니다. <a>조직으로 이동</a>',
  field_custom_data: '사용자 지정 데이터',
  field_custom_data_tip:
    '사전 정의된 애플리케이션 속성에 나열되지 않은 추가 사용자 지정 애플리케이션 정보, 비즈니스 관련 설정 및 구성과 같은 항목들.',
  custom_data_invalid: '사용자 지정 데이터는 유효한 JSON 객체여야 합니다',
  branding: {
    name: '브랜딩',
    description: '동의 화면에서 앱의 표시 이름과 로고를 사용자 정의하세요.',
    description_third_party: '동의 화면에서 애플리케이션의 표시 이름과 로고를 사용자 정의하세요.',
    app_logo: '앱 로고',
    app_level_sie: '앱 수준 로그인 경험',
    app_level_sie_switch:
      '앱 수준 로그인 경험을 활성화하고 앱별 브랜딩을 설정하세요. 비활성화되면 전체 로그인 경험이 사용됩니다.',
    more_info: '추가 정보',
    more_info_description: '동의 화면에서 사용자에게 앱에 대한 자세한 정보를 제공하세요.',
    display_name: '표시 이름',
    application_logo: '애플리케이션 로고',
    application_logo_dark: '애플리케이션 로고 (다크)',
    brand_color: '브랜드 색상',
    brand_color_dark: '브랜드 색상 (다크)',
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
    assign_button: '머신 간 역할 할당',
    delete_description:
      '이 작업은 이 장치 간 앱에서이 역할을 제거합니다. 역할 자체는 여전히 존재하지만 이 장치 간 앱과 관련이 없어집니다.',
    deleted: '{{name}} 가 성공적으로 삭제되었습니다.',
    assign_title: '{{name}}에게 머신 간 역할 할당',
    assign_subtitle:
      '머신 간 애플리케이션은 관련 API 리소스에 액세스하기 위해 머신 간 유형의 역할을 가져야 합니다.',
    assign_role_field: '머신 간 역할 할당',
    role_search_placeholder: '역할 이름으로 검색',
    added_text: '{{value, number}} 추가됨',
    assigned_app_count: '{{value, number}} 개의 애플리케이션',
    confirm_assign: '머신 간 역할 할당',
    role_assigned: '역할이 성공적으로 할당되었습니다.',
    search: '역할 이름, 설명 또는 ID로 검색',
    empty: '사용 가능한 역할이 없습니다.',
  },
  secrets: {
    value: '값',
    empty: '애플리케이션에 비밀이 없습니다.',
    created_at: '생성 시간',
    expires_at: '만료 시간',
    never: '만료되지 않음',
    create_new_secret: '새 시크릿 생성',
    delete_confirmation: '이 작업은 되돌릴 수 없습니다. 이 시크릿을 삭제하시겠습니까?',
    deleted: '시크릿이 성공적으로 삭제되었습니다.',
    activated: '시크릿이 성공적으로 활성화되었습니다.',
    deactivated: '시크릿이 성공적으로 비활성화되었습니다.',
    legacy_secret: '레거시 시크릿',
    expired: '만료됨',
    expired_tooltip: '이 시크릿은 {{date}} 에 만료되었습니다.',
    create_modal: {
      title: '애플리케이션 시크릿 생성',
      expiration: '만료',
      expiration_description: '이 시크릿은 {{date}}에 만료됩니다.',
      expiration_description_never:
        '이 시크릿은 만료되지 않을 것입니다. 보안을 강화하기 위해 만료 날짜를 설정하는 것을 권장합니다.',
      days: '{{count}} 일',
      days_other: '{{count}} 일',
      years: '{{count}} 년',
      years_other: '{{count}} 년',
      created: '시크릿 {{name}} 이(가) 성공적으로 생성되었습니다.',
    },
    edit_modal: {
      title: '애플리케이션 시크릿 편집',
      edited: '시크릿 {{name}} 이(가) 성공적으로 편집되었습니다.',
    },
  },
  saml_idp_config: {
    title: 'SAML IdP 메타데이터',
    description: '다음 메타데이터와 인증서를 사용하여 애플리케이션에서 SAML IdP 를 구성하세요.',
    metadata_url_label: 'IdP 메타데이터 URL',
    single_sign_on_service_url_label: '단일 로그인 서비스 URL',
    idp_entity_id_label: 'IdP 엔티티 ID',
  },
  saml_idp_certificates: {
    title: 'SAML 서명 인증서',
    expires_at: '만료 시간',
    finger_print: '지문',
    status: '상태',
    active: '활성',
    inactive: '비활성',
  },
  saml_idp_name_id_format: {
    title: '이름 ID 형식',
    description: 'SAML IdP의 이름 ID 형식을 선택하세요.',
    persistent: '영구',
    persistent_description: 'Logto 사용자 ID 를 이름 ID 로 사용',
    transient: '일시적',
    transient_description: '일회용 사용자 ID 를 이름 ID 로 사용',
    unspecified: '지정되지 않음',
    unspecified_description: 'Logto 사용자 ID 를 이름 ID 로 사용',
    email_address: '이메일 주소',
    email_address_description: '이메일 주소를 이름 ID 로 사용',
  },
  saml_encryption_config: {
    encrypt_assertion: 'SAML 주장을 암호화',
    encrypt_assertion_description: '이 옵션을 활성화하면 SAML 주장이 암호화됩니다.',
    encrypt_then_sign: '먼저 암호화 후 서명',
    encrypt_then_sign_description:
      '이 옵션을 활성화하면 SAML 주장을 암호화한 다음 서명합니다; 그렇지 않으면 SAML 주장은 서명한 다음 암호화됩니다.',
    certificate: '인증서',
    certificate_tooltip:
      'SAML 주장을 암호화하기 위해 서비스 제공자로부터 받은 x509 인증서를 복사하여 붙여넣으세요.',
    certificate_placeholder:
      '-----BEGIN CERTIFICATE-----\nMIICYDCCAcmgAwIBA...\n-----END CERTIFICATE-----\n',
    certificate_missing_error: '인증서가 필요합니다.',
    certificate_invalid_format_error:
      '잘못된 인증서 형식이 감지되었습니다. 인증서 형식을 확인하고 다시 시도하세요.',
  },
  saml_app_attribute_mapping: {
    name: '속성 매핑',
    title: '기본 속성 매핑',
    description:
      'Logto에서 애플리케이션으로 사용자 프로필을 동기화하기 위해 속성 매핑을 추가하세요.',
    col_logto_claims: 'Logto 값',
    col_sp_claims: '애플리케이션의 값 이름',
    add_button: '다른 추가',
  },
};

export default Object.freeze(application_details);
