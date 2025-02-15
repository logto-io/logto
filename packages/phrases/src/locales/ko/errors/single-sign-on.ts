const single_sign_on = {
  forbidden_domains: '공개 이메일 도메인은 허용되지 않습니다.',
  duplicated_domains: '중복된 도메인이 있습니다.',
  invalid_domain_format: '도메인 형식이 잘못되었습니다.',
  duplicate_connector_name: '커넥터 이름이 이미 존재합니다. 다른 이름을 선택해 주세요.',
  idp_initiated_authentication_not_supported: 'IdP 시작 인증은 SAML 커넥터에서만 지원됩니다.',
  idp_initiated_authentication_invalid_application_type:
    '잘못된 애플리케이션 유형입니다. {{type}} 애플리케이션만 허용됩니다.',
  idp_initiated_authentication_redirect_uri_not_registered:
    'redirect_uri가 등록되지 않았습니다. 애플리케이션 설정을 확인해 주세요.',
  idp_initiated_authentication_client_callback_uri_not_found:
    '클라이언트 IdP 시작 인증 콜백 URI를 찾을 수 없습니다. 커넥터 설정을 확인해 주세요.',
};

export default Object.freeze(single_sign_on);
