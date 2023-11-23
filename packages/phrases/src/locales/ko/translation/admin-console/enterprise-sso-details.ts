const enterprise_sso_details = {
  back_to_sso_connectors: '기업 SSO로 돌아가기',
  page_title: '기업 SSO 커넥터 세부정보',
  readme_drawer_title: '기업 SSO',
  readme_drawer_subtitle: '사용자 SSO를 활성화하려면 기업 SSO 커넥터를 설정합니다',
  tab_settings: '설정',
  tab_connection: '연결',
  general_settings_title: '일반 설정',
  custom_branding_title: '맞춤 브랜딩',
  custom_branding_description:
    '로그인 버튼 및 기타 시나리오의 기업 IdP 디스플레이 정보를 사용자 정의합니다.',
  email_domain_field_name: '기업 이메일 도메인',
  email_domain_field_description:
    '이 이메일 도메인을 가진 사용자는 SSO를 통해 인증을 사용할 수 있습니다. 도메인이 기업에 속하는지 확인하십시오.',
  email_domain_field_placeholder: '이메일 도메인',
  sync_profile_field_name: '신원 제공자에서 프로필 정보 동기화',
  sync_profile_option: {
    register_only: '첫 로그인만 동기화',
    each_sign_in: '매 로그인마다 항상 동기화',
  },
  connector_name_field_name: '커넥터 이름',
  connector_logo_field_name: '커넥터 로고',
  branding_logo_context: '로고 업로드',
  branding_logo_error: '로고 업로드 오류: {{error}}',
  branding_logo_field_name: '로고',
  branding_logo_field_placeholder: 'https://your.domain/logo.png',
  branding_dark_logo_context: '다크 모드 로고 업로드',
  branding_dark_logo_error: '다크 모드 로고 업로드 오류: {{error}}',
  branding_dark_logo_field_name: '로고 (다크 모드)',
  branding_dark_logo_field_placeholder: 'https://your.domain/dark-mode-logo.png',
  check_readme: 'README 확인',
  enterprise_sso_deleted: '기업 SSO 커넥터가 성공적으로 삭제되었습니다',
  delete_confirm_modal_title: '기업 SSO 커넥터 삭제',
  delete_confirm_modal_content:
    '이 기업 커넥터를 삭제하시겠습니까? 신원 제공자의 사용자는 Single Sign-On을 활용할 수 없게 됩니다.',
  upload_idp_metadata_title: 'IdP 메타데이터 업로드',
  upload_idp_metadata_description: '신원 제공자에서 복사한 메타데이터를 구성합니다.',
  upload_saml_idp_metadata_info_text_url: '신원 제공자에서 메타데이터 URL을 복사하여 연결합니다.',
  upload_saml_idp_metadata_info_text_xml: '신원 제공자에서 메타데이터를 복사하여 연결합니다.',
  upload_saml_idp_metadata_info_text_manual: '신원 제공자에서 메타데이터를 입력하여 연결합니다.',
  upload_oidc_idp_info_text: '신원 제공자에서 정보를 입력하여 연결합니다.',
  service_provider_property_title: 'IdP에서 서비스 구성',
  service_provider_property_description:
    '당신의 {{name}}에서 {{protocol}}를 통해 새로운 앱 통합을 생성하십시오. 그런 다음 아래의 서비스 제공자 세부정보를 붙여넣어 {{protocol}}를 구성합니다.',
  attribute_mapping_title: '속성 매핑',
  attribute_mapping_description:
    '사용자의 `id`와 `email`은 IdP에서 사용자 프로필 동기화에 필요합니다. {{name}}에 다음 이름과 값을 입력하십시오.',
  saml_preview: {
    sign_on_url: '로그인 URL',
    entity_id: '발행자',
    x509_certificate: '서명용 인증서',
  },
  oidc_preview: {
    authorization_endpoint: '인증 엔드포인트',
    token_endpoint: '토큰 엔드포인트',
    userinfo_endpoint: '사용자 정보 엔드포인트',
    jwks_uri: 'JSON 웹 키 세트 엔드포인트',
    issuer: '발행자',
  },
};

export default Object.freeze(enterprise_sso_details);
