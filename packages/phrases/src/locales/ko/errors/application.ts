const application = {
  invalid_type: '관련 역할을 가질 수 있는 것은 기계 대 기계 응용 프로그램만 가능합니다.',
  role_exists: '역할 ID {{roleId}} 가 이미이 응용 프로그램에 추가되었습니다.',
  invalid_role_type: '사용자 유형 역할을 기계 대 기계 응용 프로그램에 할당할 수 없습니다.',
  invalid_third_party_application_type:
    '전통적인 웹 응용 프로그램, 단일 페이지 응용 프로그램 및 네이티브 응용 프로그램만 제 3자 앱으로 표시할 수 있습니다.',
  third_party_application_only: '해당 기능은 제 3자 응용프로그램에만 사용할 수 있습니다.',
  user_consent_scopes_not_found: '유효하지 않은 사용자 동의 범위입니다.',
  consent_management_api_scopes_not_allowed: '管理 API 범위 허용되지 않습니다.',
  protected_app_metadata_is_required: '보호된 응용 프로그램 메타데이터가 필요합니다.',
  protected_app_not_configured:
    '보호된 앱 제공자가 구성되지 않았습니다. 이 기능은 오픈 소스 버전에는 사용할 수 없습니다.',
  cloudflare_unknown_error: 'Cloudflare API를 요청할 때 알 수없는 오류가 발생했습니다',
  protected_application_only: '해당 기능은 보호된 응용 프로그램에만 사용할 수 있습니다.',
  protected_application_misconfigured: '보호된 응용 프로그램이 잘못 구성되었습니다.',
  protected_application_subdomain_exists:
    '보호된 응용 프로그램의 하위 도메인이 이미 사용 중입니다.',
  invalid_subdomain: '잘못된 하위 도메인입니다.',
  custom_domain_not_found: '사용자 정의 도메인을 찾을 수 없습니다.',
  should_delete_custom_domains_first: '먼저 사용자 정의 도메인을 삭제해야 합니다.',
  no_legacy_secret_found: '응용 프로그램에 레거시 비밀이 없습니다.',
  secret_name_exists: '비밀 이름이 이미 존재합니다.',
  saml: {
    use_saml_app_api:
      'SAML 앱을 운영하려면 `[METHOD] /saml-applications(/.*)?` API 를 사용하십시오.',
    saml_application_only: '이 API 는 SAML 응용 프로그램에만 사용할 수 있습니다.',
    reach_oss_limit: '{{limit}} 개의 제한에 도달했기 때문에 더 이상 SAML 앱을 만들 수 없습니다.',
    acs_url_binding_not_supported: 'SAML 어설션을 받기 위해서는 HTTP-POST 바인딩만 지원됩니다.',
    can_not_delete_active_secret: '활성 비밀을 삭제할 수 없습니다.',
    no_active_secret: '활성 비밀을 찾을 수 없습니다.',
    entity_id_required: '메타데이터 생성을 위해 엔터티 ID 가 필요합니다.',
    name_id_format_required: 'Name ID 형식이 필요합니다.',
    unsupported_name_id_format: '지원되지 않는 Name ID 형식입니다.',
    missing_email_address: '사용자에게 이메일 주소가 없습니다.',
    email_address_unverified: '사용자 이메일 주소가 인증되지 않았습니다.',
    invalid_certificate_pem_format: '잘못된 PEM 인증서 형식입니다.',
    acs_url_required: 'Assertion Consumer Service URL 이 필요합니다.',
    private_key_required: '개인 키가 필요합니다.',
    certificate_required: '인증서가 필요합니다.',
    invalid_saml_request: '잘못된 SAML 인증 요청입니다.',
    auth_request_issuer_not_match:
      'SAML 인증 요청의 발급자가 서비스 제공자 엔터티 ID 와 일치하지 않습니다.',
    sp_initiated_saml_sso_session_not_found_in_cookies:
      '서비스 제공자가 시작한 SAML SSO 세션 ID 를 쿠키에서 찾을 수 없습니다.',
    sp_initiated_saml_sso_session_not_found:
      '서비스 제공자가 시작한 SAML SSO 세션을 찾을 수 없습니다.',
    state_mismatch: '`state` 가 일치하지 않습니다.',
  },
};

export default Object.freeze(application);
