const application = {
  invalid_type: '관련 역할을 가질 수 있는 것은 기계 대 기계 응용 프로그램만 가능합니다.',
  role_exists: '역할 ID {{roleId}} 가 이미이 응용 프로그램에 추가되었습니다.',
  invalid_role_type: '사용자 유형 역할을 기계 대 기계 응용 프로그램에 할당할 수 없습니다.',
  invalid_third_party_application_type:
    '전통적인 웹 응용 프로그램만 제 3자 앱으로 표시할 수 있습니다.',
  third_party_application_only: '해당 기능은 제 3자 응용 프로그램에만 사용할 수 있습니다.',
  user_consent_scopes_not_found: '유효하지 않은 사용자 동의 범위입니다.',
  /** UNTRANSLATED */
  consent_management_api_scopes_not_allowed: 'Management API scopes are not allowed.',
  protected_app_metadata_is_required: '보호된 응용 프로그램 메타데이터가 필요합니다.',
  /** UNTRANSLATED */
  protected_app_not_configured:
    'Protected app provider is not configured. This feature is not available for open source version.',
  /** UNTRANSLATED */
  cloudflare_unknown_error: 'Got unknown error when requesting Cloudflare API',
  /** UNTRANSLATED */
  protected_application_only: 'The feature is only available for protected applications.',
  /** UNTRANSLATED */
  protected_application_misconfigured: 'Protected application is misconfigured.',
  /** UNTRANSLATED */
  protected_application_subdomain_exists:
    'The subdomain of Protected application is already in use.',
  /** UNTRANSLATED */
  invalid_subdomain: 'Invalid subdomain.',
  /** UNTRANSLATED */
  custom_domain_not_found: 'Custom domain not found.',
  /** UNTRANSLATED */
  should_delete_custom_domains_first: 'Should delete custom domains first.',
};

export default Object.freeze(application);
