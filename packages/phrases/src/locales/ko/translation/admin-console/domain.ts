const domain = {
  status: {
    connecting: '연결 중...',
    in_use: '사용 중',
    failed_to_connect: '연결 실패',
  },
  update_endpoint_notice:
    '사용자 지정 도메인을 사용하려면 애플리케이션에서 소셜 커넥터 콜백 URI 및 Logto 엔드포인트의 도메인을 업데이트해야합니다. <a>{{link}}</a>',
  error_hint: 'DNS 레코드를 업데이트해야합니다. {{value}}초마다 체크하도록 계속합니다.',
  custom: {
    custom_domain: '사용자 지정 도메인',
    custom_domain_description:
      '브랜딩을 개선하고 사용자 지정 도메인을 활용하세요. 이 도메인은 로그인 경험에서 사용됩니다.',
    custom_domain_field: '사용자 지정 도메인',
    custom_domain_placeholder: 'your.domain.com',
    add_domain: '도메인 추가',
    invalid_domain_format:
      '유효한 도메인 URL을 제공해야합니다. 최소 세 부분으로 구성되어야 하며 예를 들어 "your.domain.com."이어야 합니다.',
    verify_domain: '도메인 확인',
    enable_ssl: 'SSL 사용',
    checking_dns_tip:
      'DNS 레코드를 구성한 후 자동 프로세스가 실행되며 최대 24시간이 걸릴 수 있습니다. 인터페이스에서 이 작업을 나갈 수 있습니다.',
    enable_ssl_tip:
      'SSL 사용은 자동으로 실행되며 최대 24시간이 걸릴 수 있습니다. 이 인터페이스를 나갈 수 있습니다.',
    generating_dns_records: 'DNS 레코드 생성 중...',
    add_dns_records: '이 DNS 레코드를 DNS 공급자에 추가하세요.',
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
        '이 사용자 지정 도메인 "<span>{{domain}}</span>"이 현재 사용 중입니다. 삭제하시겠습니까?',
      in_used_tip:
        '이전에 소셜 커넥터 공급자나 애플리케이션 엔드포인트에 이 사용자 지정 도메인을 설정한 경우 로그인 버튼이 작동하도록 먼저 Logto 기본 도메인의 "<span>{{domain}}</span>" URI를 수정해야합니다.',
      deleted: '사용자 지정 도메인을 성공적으로 삭제했습니다!',
    },
  },
  default: {
    default_domain: '기본 도메인',
    default_domain_description:
      'Logto는 추가 구성 없이 사용할 수 있는 미리 구성된 기본 도메인을 제공합니다. 이 기본 도메인은 사용자 지정 도메인을 사용하지 않더라도 백업 옵션으로 사용됩니다.',
    default_domain_field: 'Logto 기본 도메인',
  },
  custom_endpoint_note:
    '이 엔드포인트의 도메인 이름을 필요에 따라 사용자 정의할 수 있습니다. "{{custom}}" 또는 "{{default}}" 중 하나를 선택하세요.',
  custom_social_callback_url_note:
    '이 URI의 도메인 이름을 애플리케이션 엔드포인트와 일치하도록 사용자 정의할 수 있습니다. "{{custom}}" 또는 "{{default}}" 중 하나를 선택하세요.',
  custom_acs_url_note:
    '이 URI의 도메인명을 사용자의 ID 공급자 Assertion Consumer 서비스 URL과 일치하도록 사용자 정의할 수 있습니다. "{{custom}}" 또는 "{{default}}" 중 하나를 선택하세요.',
};

export default Object.freeze(domain);
