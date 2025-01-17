const enterprise_sso_details = {
  back_to_sso_connectors: '기업 SSO로 돌아가기',
  page_title: '기업 SSO 커넥터 세부 정보',
  readme_drawer_title: '기업 SSO',
  readme_drawer_subtitle: '엔드 유저 SSO를 활성화하려면 기업 SSO 커넥터를 설정하세요',
  tab_experience: 'SSO 경험',
  tab_connection: '연결',
  /** UNTRANSLATED */
  tab_idp_initiated_auth: 'IdP-initiated SSO',
  general_settings_title: '일반',
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
    /** UNTRANSLATED */
    card_title: 'IdP-initiated SSO',
    /** UNTRANSLATED */
    card_description:
      'User typically start the authentication process from your app using the SP-initiated SSO flow. DO NOT enable this feature unless absolutely necessary.',
    /** UNTRANSLATED */
    enable_idp_initiated_sso: 'Enable IdP-initiated SSO',
    /** UNTRANSLATED */
    enable_idp_initiated_sso_description:
      "Allow enterprise users to start the authentication process directly from the identity provider's portal. Please understand the potential security risks before enabling this feature.",
    /** UNTRANSLATED */
    default_application: 'Default application',
    /** UNTRANSLATED */
    default_application_tooltip:
      'Target application the user will be redirected to after authentication.',
    /** UNTRANSLATED */
    empty_applications_error:
      'No applications found. Please add one in the <a>Applications</a> section.',
    /** UNTRANSLATED */
    empty_applications_placeholder: 'No applications',
    /** UNTRANSLATED */
    authentication_type: 'Authentication type',
    /** UNTRANSLATED */
    auto_authentication_disabled_title: 'Redirect to client for SP-initiated SSO',
    /** UNTRANSLATED */
    auto_authentication_disabled_description:
      'Recommended. Redirect users to the client-side application to initiate a secure SP-initiated OIDC authentication.  This will prevent the CSRF attacks.',
    /** UNTRANSLATED */
    auto_authentication_enabled_title: 'Directly sign in using the IdP-initiated SSO',
    /** UNTRANSLATED */
    auto_authentication_enabled_description:
      'After successful sign-in, users will be redirected to the specified Redirect URI with the authorization code (Without state and PKCE validation).',
    /** UNTRANSLATED */
    auto_authentication_disabled_app: 'For traditional web app, single-page app (SPA)',
    /** UNTRANSLATED */
    auto_authentication_enabled_app: 'For traditional web app',
    /** UNTRANSLATED */
    idp_initiated_auth_callback_uri: 'Client callback URI',
    /** UNTRANSLATED */
    idp_initiated_auth_callback_uri_tooltip:
      'The client callback URI to initiate a SP-initiated SSO authentication flow. An ssoConnectorId will be appended to the URI as a query parameter. (e.g., https://your.domain/sso/callback?connectorId={{ssoConnectorId}})',
    /** UNTRANSLATED */
    redirect_uri: 'Post sign-in redirect URI',
    /** UNTRANSLATED */
    redirect_uri_tooltip:
      'The redirect URI to redirect users after successful sign-in. Logto will use this URI as the OIDC redirect URI in the authorization request. Use a dedicated URI for the IdP-initiated SSO authentication flow for better security.',
    /** UNTRANSLATED */
    empty_redirect_uris_error:
      'No redirect URI has been registered for the application. Please add one first.',
    /** UNTRANSLATED */
    redirect_uri_placeholder: 'Select a post sign-in redirect URI',
    /** UNTRANSLATED */
    auth_params: 'Additional authentication parameters',
    /** UNTRANSLATED */
    auth_params_tooltip:
      'Additional parameters to be passed in the authorization request. By default only (openid profile) scopes will be requested, you can specify additional scopes or a exclusive state value here. (e.g., { "scope": "organizations email", "state": "secret_state" }).',
  },
  /** UNTRANSLATED */
  trust_unverified_email: 'Trust unverified email',
  /** UNTRANSLATED */
  trust_unverified_email_label:
    'Always trust the unverified email addresses returned from the identity provider',
  /** UNTRANSLATED */
  trust_unverified_email_tip:
    'The Entra ID (OIDC) connector does not return the `email_verified` claim, meaning that email addresses from Azure are not guaranteed to be verified. By default, Logto will not sync unverified email addresses to the user profile. Enable this option only if you trust all the email addresses from the Entra ID directory.',
};

export default Object.freeze(enterprise_sso_details);
