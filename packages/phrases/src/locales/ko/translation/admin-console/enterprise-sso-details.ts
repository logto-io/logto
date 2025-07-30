const enterprise_sso_details = {
  back_to_sso_connectors: '기업 SSO로 돌아가기',
  page_title: '기업 SSO 커넥터 세부 정보',
  readme_drawer_title: '기업 SSO',
  readme_drawer_subtitle: '엔드 유저 SSO를 활성화하려면 기업 SSO 커넥터를 설정하세요',
  tab_experience: 'SSO 경험',
  tab_connection: '연결',
  tab_idp_initiated_auth: 'IdP-initiated SSO',
  general_settings_title: '일반',
  general_settings_description:
    '엔드 유저 경험을 구성하고 SP-initiated SSO 흐름을 위해 기업 이메일 도메인을 연결하세요.',
  custom_branding_title: '표시',
  custom_branding_description:
    '엔드 유저의 단일 로그인 흐름에서 표시되는 이름 및 로고를 사용자 정의하세요. 비어 있으면 기본 사용됩니다.',
  email_domain_field_name: '기업 이메일 도메인',
  email_domain_field_description:
    '이 이메일 도메인을 가진 사용자는 SSO를 사용하여 인증할 수 있습니다. 도메인이 기업에 속해 있는지 확인해주세요.',
  email_domain_field_placeholder: '이메일 도메인',
  sync_profile_field_name: '아이디 공급자에서 프로필 정보 동기화',
  sync_profile_option: {
    register_only: '첫 번째 로그인 시에만 동기화',
    each_sign_in: '매 로그인 시 항상 동기화',
  },
  connector_name_field_name: '커넥터 이름',
  display_name_field_name: '표시 이름',
  connector_logo_field_name: '표시 로고',
  connector_logo_field_description: '각 이미지는 500KB 이하, SVG, PNG, JPG, JPEG 만 허용됩니다.',
  branding_logo_context: '로고 업로드',
  branding_logo_error: '로고 업로드 오류: {{error}}',
  branding_light_logo_context: '라이트 모드 로고 업로드',
  branding_light_logo_error: '라이트 모드 로고 업로드 오류: {{error}}',
  branding_logo_field_name: '로고',
  branding_logo_field_placeholder: 'https://your.domain/logo.png',
  branding_dark_logo_context: '다크 모드 로고 업로드',
  branding_dark_logo_error: '다크 모드 로고 업로드 오류: {{error}}',
  branding_dark_logo_field_name: '로고 (다크 모드)',
  branding_dark_logo_field_placeholder: 'https://your.domain/dark-mode-logo.png',
  check_connection_guide: '연결 가이드',
  enterprise_sso_deleted: '기업 SSO 커넥터가 성공적으로 삭제되었습니다',
  delete_confirm_modal_title: '기업 SSO 커넥터 삭제',
  delete_confirm_modal_content:
    '이 기업 커넥터를 삭제하시겠습니까? 신원 공급자의 사용자는 단일 로그인을 사용하지 않습니다.',
  upload_idp_metadata_title_saml: '메타데이터 업로드',
  upload_idp_metadata_description_saml: '신원 공급자에서 복사한 메타데이터를 구성하세요.',
  upload_idp_metadata_title_oidc: '자격 증명 업로드',
  upload_idp_metadata_description_oidc:
    '신원 공급자에서 복사한 자격 증명 및 OIDC 토큰 정보를 구성하세요.',
  upload_idp_metadata_button_text: '메타데이터 XML 파일 업로드',
  upload_signing_certificate_button_text: '서명 인증서 파일 업로드',
  configure_domain_field_info_text:
    '기업 사용자를 단일 로그인을 위해 신원 공급자로 안내하려면 이메일 도메인을 추가하세요.',
  email_domain_field_required: '기업 SSO를 활성화하려면 이메일 도메인이 필요합니다.',
  upload_saml_idp_metadata_info_text_url: '신원 공급자에서 메타데이터 URL을 붙여넣어 연결하세요.',
  upload_saml_idp_metadata_info_text_xml: '신원 공급자에서 메타데이터를 붙여넣어 연결하세요.',
  upload_saml_idp_metadata_info_text_manual: '신원 공급자에서 메타데이터를 작성하여 연결하세요.',
  upload_oidc_idp_info_text: '신원 공급자에서 정보를 작성하여 연결하세요.',
  service_provider_property_title: 'IdP에서 구성',
  service_provider_property_description:
    '신원 공급자에서 {{protocol}}를 사용하여 응용 프로그램 통합을 설정하세요. 로그토에서 제공한 세부 정보를 입력하세요.',
  attribute_mapping_title: '속성 매핑',
  attribute_mapping_description:
    '신원 공급자에서 사용자 속성 매핑을 구성하여 사용자 프로필을 Logto 쪽에서 동기화하세요.',
  saml_preview: {
    sign_on_url: '로그인 URL',
    entity_id: '발급자',
    x509_certificate: '서명 인증서',
    certificate_content: '만료일 {{date}}',
  },
  oidc_preview: {
    authorization_endpoint: '인증 엔드포인트',
    token_endpoint: '토큰 엔드포인트',
    userinfo_endpoint: '사용자 정보 엔드포인트',
    jwks_uri: 'JSON 웹 키 세트 엔드포인트',
    issuer: '발급자',
  },
  idp_initiated_auth_config: {
    card_title: 'IdP-initiated SSO',
    card_description:
      '사용자는 일반적으로 SP-initiated SSO 흐름을 사용하여 앱에서 인증 프로세스를 시작합니다. 이 기능을 반드시 필요하지 않으면 활성화하지 마십시오.',
    enable_idp_initiated_sso: 'IdP-initiated SSO 활성화',
    enable_idp_initiated_sso_description:
      '기업 사용자가 신원 공급자 포털에서 직접 인증 프로세스를 시작할 수 있도록 허용합니다. 이 기능을 활성화하기 전에 잠재적인 보안 위험을 이해하세요.',
    default_application: '기본 애플리케이션',
    default_application_tooltip: '사용자가 인증 후에 리디렉션될 대상 애플리케이션입니다.',
    empty_applications_error:
      '<a>애플리케이션</a> 섹션에 애플리케이션이 추가되지 않았습니다. 하나 추가하세요.',
    empty_applications_placeholder: '애플리케이션 없음',
    authentication_type: '인증 유형',
    auto_authentication_disabled_title: 'SP-initiated SSO를 위해 클라이언트로 리디렉션',
    auto_authentication_disabled_description:
      '추천. CSRF 공격을 방지하기 위해 보안이 강화된 SP-initiated OIDC 인증을 시작하기 위해 클라이언트 측 애플리케이션으로 사용자 리디렉션.',
    auto_authentication_enabled_title: 'IdP-initiated SSO를 사용하여 직접 로그인',
    auto_authentication_enabled_description:
      '성공적인 로그인 후, 사용자는 지정된 리디렉션 URI로 리디렉션되어 인증 코드(상태 및 PKCE 검증 없이)를 수신합니다.',
    auto_authentication_disabled_app: '전통적 웹 앱, 단일 페이지 앱(SPA) 용',
    auto_authentication_enabled_app: '전통적 웹 앱 용',
    idp_initiated_auth_callback_uri: '클라이언트 콜백 URI',
    idp_initiated_auth_callback_uri_tooltip:
      'SP-initiated SSO 인증 흐름을 시작하기 위한 클라이언트 콜백 URI입니다. ssoConnectorId는 쿼리 매개 변수로 URI에 추가됩니다. (예: https://your.domain/sso/callback?connectorId={{ssoConnectorId}})',
    redirect_uri: '로그인 후 리디렉션 URI',
    redirect_uri_tooltip:
      '성공적인 로그인 후 사용자 리디렉션에 사용할 리디렉션 URI입니다. Logto는 이 URI를 권한 요청에서 OIDC 리디렉션 URI로 사용합니다. 보안을 강화하기 위해 IdP-initiated SSO 인증 흐름을 위한 전용 URI를 사용하는 것이 좋습니다.',
    empty_redirect_uris_error:
      '애플리케이션에 대해 등록된 리디렉션 URI가 없습니다. 하나 추가하세요.',
    redirect_uri_placeholder: '로그인 후 리디렉션 URI 선택',
    auth_params: '추가 인증 매개 변수',
    auth_params_tooltip:
      '권한 요청에 전달할 추가 매개 변수입니다. 기본적으로 (openid profile) 범위만 요청되며, 여기에서 추가 범위 또는 독점 상태 값을 지정할 수 있습니다. (예: { "scope": "organizations email", "state": "secret_state" }).',
  },
  trust_unverified_email: '검증되지 않은 이메일 신뢰',
  trust_unverified_email_label:
    '신원 공급자로부터 반환된 검증되지 않은 이메일 주소를 항상 신뢰합니다',
  trust_unverified_email_tip:
    'Entra ID (OIDC) 커넥터는 `email_verified` 클레임을 반환하지 않으며, 이는 Azure의 이메일 주소가 검증되지 않았음을 의미합니다. 기본적으로 Logto는 검증되지 않은 이메일 주소를 사용자 프로필과 동기화하지 않습니다. Entra ID 디렉토리의 모든 이메일 주소를 신뢰하는 경우에만 이 옵션을 활성화하세요.',
  offline_access: {
    label: '액세스 토큰 갱신',
    description:
      'Google `offline` 액세스를 활성화하여 갱신 토큰을 요청함으로써 사용자 재인증 없이 앱에서 액세스 토큰을 갱신할 수 있도록 합니다.',
  },
};

export default Object.freeze(enterprise_sso_details);
