const application = {
  invalid_type: '관련 역할을 가질 수 있는 것은 기계 대 기계 응용 프로그램만 가능합니다.',
  role_exists: '역할 ID {{roleId}} 가 이미이 응용 프로그램에 추가되었습니다.',
  invalid_role_type: '사용자 유형 역할을 기계 대 기계 응용 프로그램에 할당할 수 없습니다.',
  invalid_third_party_application_type:
    '전통적인 웹 응용 프로그램만 제 3자 앱으로 표시할 수 있습니다.',
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
};

export default Object.freeze(application);
