const enterprise_sso = {
  page_title: '기업 SSO',
  title: '기업 SSO',
  subtitle: '기업 신원 공급자를 연결하고 SP-initiated 단일 로그인을 활성화합니다.',
  create: '기업 커넥터 추가',
  col_connector_name: '커넥터 이름',
  col_type: '유형',
  col_email_domain: '이메일 도메인',
  col_status: '상태',
  col_status_in_use: '사용 중',
  col_status_invalid: '유효하지 않음',
  placeholder_title: '기업 커넥터',
  placeholder_description:
    'Logto는 많은 내장 기업 신원 공급자를 제공했으며, 동시에 표준 프로토콜로 사용자 정의할 수 있습니다.',
  create_modal: {
    title: '기업 커넥터 추가',
    text_divider: '또는 표준 프로토콜을 사용하여 커넥터를 사용자 정의할 수 있습니다.',
    connector_name_field_title: '커넥터 이름',
    connector_name_field_placeholder: '기업 신원 공급자의 이름',
    create_button_text: '커넥터 생성',
  },
  guide: {
    subtitle: '기업 신원 공급자를 연결하기 위한 단계별 안내서',
    finish_button_text: '계속',
  },
  basic_info: {
    title: 'IdP에서 서비스 구성',
    description:
      '귀하의 {{name}} 신원 제공자에서 SAML 2.0으로 새 응용 프로그램 통합을 생성합니다. 그런 다음 다음 값을 붙여넣습니다.',
    saml: {
      acs_url_field_name: '단언 소비자 서비스 URL (응답 URL)',
      audience_uri_field_name: '수용 체계 URI (SP 엔터티 ID)',
    },
    oidc: {
      redirect_uri_field_name: '리디렉트 URI (콜백 URL)',
    },
  },
  attribute_mapping: {
    title: '속성 매핑',
    description:
      'ID 및 이메일은 IdP에서 사용자 프로필 동기화에 필요합니다. IdP에서 다음 클레임 이름과 값을 입력합니다.',
    col_sp_claims: 'Logto의 클레임 이름',
    col_idp_claims: '신원 제공자의 클레임 이름',
    idp_claim_tooltip: '신원 공급자의 클레임 이름',
  },
  metadata: {
    title: 'IdP 메타데이터 구성',
    description: '신원 공급자의 메타데이터를 구성합니다',
    dropdown_trigger_text: '다른 구성 방법 사용',
    dropdown_title: '구성 방법 선택',
    metadata_format_url: '메타데이터 URL 입력',
    metadata_format_xml: '메타데이터 XML 파일 업로드',
    metadata_format_manual: '메타데이터 세부 정보 수동 입력',
    saml: {
      metadata_url_field_name: '메타데이터 URL',
      metadata_url_description:
        '메타데이터 URL에서 데이터를 동적으로 가져와 인증서를 최신 상태로 유지합니다.',
      metadata_xml_field_name: '메타데이터 XML 파일',
      metadata_xml_uploader_text: '메타데이터 XML 파일 업로드',
      sign_in_endpoint_field_name: '로그인 URL',
      idp_entity_id_field_name: 'IdP 엔터티 ID (발급자)',
      certificate_field_name: '서명 인증서',
      certificate_placeholder: 'x509 인증서를 복사하여 붙여넣기',
    },
    oidc: {
      client_id_field_name: '클라이언트 ID',
      client_secret_field_name: '클라이언트 비밀',
      issuer_field_name: '발급자',
      scope_field_name: '범위',
    },
  },
};

export default Object.freeze(enterprise_sso);
