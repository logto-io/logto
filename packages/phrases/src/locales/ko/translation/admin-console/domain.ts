const domain = {
  status: {
    connecting: '연결 중',
    in_used: '사용 중',
    failed_to_connect: '연결 실패',
  },
  update_endpoint_alert: {
    description:
      '사용자 지정 도메인이 성공적으로 구성되었습니다. 이전에 아래 리소스를 구성했다면 <span>{{domain}}</span> 으로 사용한 도메인을 업데이트하지 않고는 저장할 수 없습니다.',
    endpoint_url: '엔드포인트 URL의 <a>{{link}}</a>',
    application_settings_link_text: '애플리케이션 설정',
    callback_url: '콜백 URL의 <a>{{link}}</a>',
    social_connector_link_text: '소셜 커넥터',
    api_identifier: 'API 식별자의 <a>{{link}}</a>',
    uri_management_api_link_text: 'URI 관리 API',
    tip: '설정을 변경한 후에는 <a>{{link}}</a>의 로그인 경험에서 테스트할 수 있습니다.',
  },
  custom: {
    custom_domain: '사용자 지정 도메인',
    custom_domain_description:
      '기본 도메인을 사용자 고유 도메인으로 대체하여 브랜드 일관성을 유지하고 사용자에게 맞춤형 로그인 경험을 제공합니다.',
    custom_domain_field: '사용자 지정 도메인',
    custom_domain_placeholder: 'your.domain.com',
    add_domain: '도메인 추가',
    invalid_domain_format:
      '잘못된 하위 도메인 형식입니다. 적어도 세 부분으로 된 하위 도메인을 입력하세요.',
    verify_domain: '도메인 확인',
    enable_ssl: 'SSL 사용',
    checking_dns_tip:
      'DNS 레코드를 구성한 후에는 프로세스가 자동으로 실행되며 최대 24시간이 걸릴 수 있습니다. 진행 중인 동안 이 인터페이스를 나갈 수 있습니다.',
    generating_dns_records: 'DNS 레코드 생성 중...',
    add_dns_records: 'DNS 공급자에 이 DNS 레코드를 추가하세요.',
    dns_table: {
      type_field: '유형',
      name_field: '이름',
      value_field: '값',
    },
    deletion: {
      delete_domain: '도메인 삭제',
      reminder: '사용자 지정 도메인 삭제',
      description: '이 사용자 지정 도메인을 삭제하시겠습니까?',
      in_used_description:
        '이 사용자 지정 도메인 "<span>{{domain}}</span>"을 (를) 삭제하시겠습니까?',
      in_used_tip:
        '이전에 소셜 커넥터 공급자나 애플리케이션 엔드포인트에 이 사용자 지정 도메인을 설정한 경우 로그인 버튼이 올바르게 작동하도록 먼저 Logto 기본 도메인 "<span>{{domain}}</span>"의 URI를 수정해야 합니다.',
      deleted: '사용자 지정 도메인이 성공적으로 삭제되었습니다!',
    },
  },
  default: {
    default_domain: '기본 도메인',
    default_domain_description:
      '온라인에서 직접 사용할 수 있는 기본 도메인 이름을 제공합니다. 언제나 사용 가능하여 사용자 지정 도메인으로 변경해도 로그인을 위해 항상 애플리케이션에 액세스할 수 있습니다.',
    default_domain_field: 'Logto 기본 도메인',
  },
};

export default domain;
