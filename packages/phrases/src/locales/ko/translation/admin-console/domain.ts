const domain = {
  status: {
    connecting: '연결 중',
    in_used: '사용 중',
    failed_to_connect: '연결 실패',
  },
  update_endpoint_alert: {
    description:
      '사용자 지정 도메인이 성공적으로 구성되었습니다. 이전에 아래 리소스를 구성했다면 {{domain}}으로 사용한 도메인을 업데이트하지 않고는 저장할 수 없습니다.',
    endpoint_url: '<a>{{link}}</a>의 엔드포인트 URL',
    application_settings_link_text: '애플리케이션 설정',
    callback_url: '<a>{{link}}</a>의 콜백 URL',
    social_connector_link_text: '소셜 커넥터',
    api_identifier: '<a>{{link}}</a>의 API 식별자',
    uri_management_api_link_text: 'URI 관리 API',
    tip: '설정을 변경한 후에는 <a>{{link}}</a>의 로그인 경험에서 테스트할 수 있습니다.',
  },
  custom: {
    custom_domain: '사용자 지정 도메인',
    custom_domain_description:
      '기본 도메인을 사용자 고유 도메인으로 대체하여 브랜드 일관성을 유지하고 사용자에게 맞춤형 로그인 경험을 제공합니다.',
    custom_domain_field: '사용자 지정 도메인',
    custom_domain_placeholder: 'yourdomain.com',
    add_domain: '도메인 추가',
    invalid_domain_format: '유효하지 않은 도메인 형식',
    steps: {
      add_records: {
        title: '다음 DNS 레코드를 DNS 공급업체에 추가합니다.',
        generating_dns_records: 'DNS 레코드 생성 중...',
        table: {
          type_field: '유형',
          name_field: '이름',
          value_field: '값',
        },
        finish_and_continue: '완료 및 계속',
      },
      verify_domain: {
        title: 'DNS 레코드 연결을 자동으로 확인합니다.',
        description:
          '프로세스는 자동으로 수행되며 몇 분(최대 24 시간) 소요될 수 있습니다. 진행 중인 동안 이 인터페이스를 종료할 수 있습니다.',
        error_message: '확인에 실패했습니다. 도메인 이름이나 DNS 레코드를 확인하십시오.',
      },
      generate_ssl_cert: {
        title: 'SSL 인증서를 자동으로 생성합니다.',
        description:
          '프로세스는 자동으로 수행되며 몇 분(최대 24 시간) 소요될 수 있습니다. 진행 중인 동안 이 인터페이스를 종료할 수 있습니다.',
        error_message: 'SSL 인증서 생성에 실패했습니다.',
      },
      enable_domain: '사용자 지정 도메인을 자동으로 활성화합니다.',
    },
    deletion: {
      delete_domain: '도메인 삭제',
      reminder: '사용자 지정 도메인 삭제',
      description: '이 사용자 지정 도메인을 삭제하시겠습니까?',
      in_used_description: '이 사용자 지정 도메인 "{{domain}}"을 (를) 삭제하시겠습니까?',
      in_used_tip:
        '이전에 소셜 연결 공급자나 애플리케이션 엔드포인트에서 이 사용자 지정 도메인을 설정한 경우, 소셜 로그인 버튼이 올바르게 작동하려면 Logto 사용자 지정 도메인 "{{domain}}"으로 URI를 수정해야 합니다.',
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
