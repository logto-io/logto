const enterprise_sso = {
  page_title: '기업 SSO',
  title: '기업 SSO',
  subtitle: '엔터프라이즈 신원 공급자를 연결하고 SSO를 활성화합니다.',
  create: '기업 커넥터 추가',
  col_connector_name: '커넥터 이름',
  col_type: '유형',
  col_email_domain: '이메일 도메인',
  placeholder_title: '기업 커넥터',
  placeholder_description:
    'Logto는 많은 기본 제공 기업 신원 공급자를 제공했으며, 동시에 SAML 및 OIDC 프로토콜을 사용하여 사용자 지정할 수 있습니다.',
  create_modal: {
    title: '기업 커넥터 추가',
    text_divider: '또는 표준 프로토콜을 사용하여 커넥터를 사용자 정의할 수 있습니다.',
    connector_name_field_title: '커넥터 이름',
    connector_name_field_placeholder: '예: {corp. name} - {identity provider name}',
    create_button_text: '커넥터 생성',
  },
  guide: {
    subtitle: '기업 신원 공급자를 연결할 수 있는 단계별 가이드',
    finish_button_text: '계속',
  },
  basic_info: {
    title: 'IdP에서 서비스 구성',
    description:
      'SAML 2.0을 사용하여 {{name}} 신원 공급자에서 새로운 응용 프로그램 통합을 만듭니다. 그런 다음 다음 값을 붙여 넣습니다.',
    saml: {
      acs_url_field_name: '단언 소비자 서비스 URL (응답 URL)',
      audience_uri_field_name: '대상 URI (SP 엔터티 ID)',
      entity_id_field_name: '서비스 제공자 (SP) 엔터티 ID',
      entity_id_field_tooltip:
        'SP 엔터티 ID는 URI 형식이나 URL 형식을 식별자로 사용하는 것이 일반적이지만, 반드시 그런 것은 아닙니다.',
      acs_url_field_placeholder: 'https://your-domain.com/api/saml/callback',
      entity_id_field_placeholder: 'urn:your-domain.com:sp:saml:{serviceProviderId}',
    },
    oidc: {
      redirect_uri_field_name: '리디렉션 URI (콜백 URL)',
      redirect_uri_field_description:
        '리디렉션 URI는 SSO 인증 이후 사용자가 다시 이동하는 위치입니다. 이 URI를 IdP 구성에 추가하세요.',
      redirect_uri_field_custom_domain_description:
        'Logto에서 여러 <a>사용자 지정 도메인</a>을 사용하는 경우 각 도메인에서 SSO가 동작하도록 모든 해당 콜백 URI를 IdP에 반드시 추가하세요.\n\n기본 Logto 도메인 (*.logto.app)은 항상 유효하므로 해당 도메인에서 SSO를 지원하려는 경우에만 포함하세요.',
    },
  },
  attribute_mapping: {
    title: '속성 매핑',
    description:
      '`id` 및 `이메일`은 IdP에서 사용자 프로필을 동기화하는 데 필요합니다. IdP에 다음 클레임 이름과 값을 입력합니다.',
    col_sp_claims: '서비스 제공자 (Logto)의 값',
    col_idp_claims: '신원 공급자의 클레임 이름',
    idp_claim_tooltip: '신원 공급자의 클레임 이름',
  },
  metadata: {
    title: 'IdP 메타데이터 구성',
    description: '신원 공급자의 메타데이터 구성',
    dropdown_trigger_text: '다른 구성 방법 사용',
    dropdown_title: '구성 방법 선택',
    metadata_format_url: '메타데이터 URL 입력',
    metadata_format_xml: '메타데이터 XML 파일 업로드',
    metadata_format_manual: '메타데이터 세부 정보 수동 입력',
    saml: {
      metadata_url_field_name: '메타데이터 URL',
      metadata_url_description:
        '메타데이터 URL에서 데이터를 동적으로 가져와 인증서를 최신 상태로 유지합니다.',
      metadata_xml_field_name: 'IdP 메타데이터 XML 파일',
      metadata_xml_uploader_text: '메타데이터 XML 파일 업로드',
      sign_in_endpoint_field_name: '로그인 URL',
      idp_entity_id_field_name: 'IdP 엔터티 ID (발급자)',
      certificate_field_name: '서명 인증서',
      certificate_placeholder: 'x509 인증서를 복사하여 붙여넣기',
      certificate_required: '서명 인증서는 필수입니다.',
    },
    oidc: {
      client_id_field_name: '클라이언트 ID',
      client_secret_field_name: '클라이언트 비밀',
      issuer_field_name: '발급자',
      scope_field_name: '범위',
      scope_field_placeholder: '범위를 입력하세요 (공백으로 구분)',
    },
  },
};

export default Object.freeze(enterprise_sso);
