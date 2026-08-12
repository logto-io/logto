const applications = {
  page_title: '어플리케이션',
  title: '어플리케이션',
  subtitle:
    '인증에 Logto를 사용할 모바일, 단일 페이지, Machine-to-Machine 또는 기존 어플리케이션을 설정할 수 있어요.',
  subtitle_with_app_type: '내 {{name}} 어플리케이션에 대한 Logto 인증 설정',
  create_device_flow_description:
    'OAuth 2.0 디바이스 인증 부여를 사용하는 네이티브 애플리케이션을 생성합니다. 입력이 제한된 디바이스 또는 헤드리스 앱용입니다.',
  create: '어플리케이션 생성',
  create_third_party: '서드파티 어플리케이션 생성',
  create_thrid_party_modal_title: '서드파티 앱 생성 ({{type}})',
  application_name: '어플리케이션 이름',
  application_name_placeholder: '나의 앱',
  application_description: '어플리케이션 설명',
  application_description_placeholder: '어플리케이션 설명을 입력해주세요.',
  select_application_type: '어플리케이션 종류 선택',
  no_application_type_selected: '어플리케이션 종류를 선택하지 않았어요.',
  application_created: '어플리케이션이 성공적으로 생성되었어요.',
  tab: {
    my_applications: '내 어플리케이션',
    third_party_applications: '서드파티 앱',
  },
  app_id: '앱 식별자',
  type: {
    native: {
      title: '네이티브 앱',
      subtitle: '네이티브 환경에서 작동하는 어플리케이션',
      description: '예) iOS, Android, 데스크톱 앱, TV, CLI',
    },
    spa: {
      title: '싱글 페이지 앱',
      subtitle: '웹 브라우저에서 동작하며 한 페이지에서 유동적으로 업데이트되는 웹',
      description: '예) React DOM, Vue 앱',
    },
    traditional: {
      title: '전통적인 웹',
      subtitle: '서버를 통해 웹 페이지가 업데이트되는 앱',
      description: '예) JSP, PHP',
    },
    machine_to_machine: {
      title: '기계 간 앱',
      subtitle: '직접 리소스에 액세스하는 앱(서비스)',
      description: '예) 백엔드 서비스',
    },
    protected: {
      title: '보호된 앱',
      subtitle: 'Logto로 보호되는 앱',
      description: 'N/A',
    },
    saml: {
      title: 'SAML 앱',
      subtitle: 'SAML IdP 커넥터로 사용되는 앱',
      description: '예: SAML',
    },
    third_party: {
      title: '서드파티 앱',
      subtitle: '서드파티 IdP 커넥터로 사용되는 앱',
      description: '예: OIDC, SAML',
    },
  },
  authorization_flow: {
    title: '인증 플로우',
    tooltip: '애플리케이션의 인증 플로우를 선택하세요. 한 번 설정하면 변경할 수 없습니다.',
    authorization_code: {
      title: 'Authorization code',
      description:
        '가장 기본적이고 일반적인 인증 유형입니다. 사용자가 로그인 페이지로 리디렉션되어 직접 액세스를 인증합니다.',
    },
    device_flow: {
      title: 'Device flow',
      description:
        '입력이 제한된 장치나 헤드리스 앱(예: TV, CLI)을 위한 방식입니다. 사용자는 디바이스 코드를 입력하거나 QR 코드를 스캔하여 별도의 장치에서 로그인을 완료합니다.',
    },
  },
  placeholder_title: '어플리케이션 유형을 선택하여 계속하세요',
  placeholder_description:
    'Logto는 OIDC용 앱 엔티티를 사용하여 앱 식별, 로그인 관리 및 감사 로그 생성과 같은 작업을 지원합니다.',
  third_party_application_placeholder_description:
    'Logto를 아이덴티티 제공자로 사용하여 서드파티 서비스에 OAuth 권한 부여를 제공합니다. \n 리소스 접근을 위한 사전 제작된 사용자 동의 화면이 포함되어 있습니다. <a>더 알아보기</a>',
  dynamic_app: {
    title: '다이나믹 앱',
    subtitle: 'CIMD',
    description: '다이나믹 앱을 사용하면 OAuth 클라이언트가 사전 등록 없이 연결할 수 있습니다.',
    settings_description:
      '다이나믹 앱을 사용하면 OAuth 클라이언트가 사전 등록 없이 연결할 수 있습니다. OAuth Client ID Metadata Document (CIMD) 사양을 사용합니다.',
    app_id_placeholder: '각 클라이언트가 동적으로 제공',
    enable_confirm_modal: {
      title: '동적 클라이언트 접근을 활성화할까요?',
      content:
        '유효한 공개 HTTPS 클라이언트 ID URL을 가진 모든 OAuth 클라이언트는 사전 등록 없이 이 테넌트에 대한 인가를 시작할 수 있어요. 접근 범위는 설정한 최대 권한과 사용자 동의에 의해 계속 제한돼요.',
    },
    enabled: '다이나믹 앱을 활성화했어요.',
    disable_confirm_modal: {
      title: '다이나믹 앱을 비활성화할까요?',
      content:
        'CIMD 클라이언트는 더 이상 새로운 인증 요청을 시작할 수 없습니다. 기존 권한 부여는 유지되며, 이미 발급된 액세스 토큰은 만료될 때까지 유효할 수 있습니다.',
    },
    disabled: '다이나믹 앱이 성공적으로 비활성화되었습니다.',
    permissions: {
      user_title: '사용자',
      user_description:
        'OAuth 클라이언트가 특정 사용자 데이터에 액세스하기 위해 요청하는 권한을 선택하세요.',
      grant_user_level_permissions: '사용자 권한 부여',
      organization_title: '조직',
      organization_description:
        'OAuth 클라이언트가 특정 조직 데이터에 액세스하기 위해 요청하는 권한을 선택하세요.',
      grant_organization_level_permissions: '조직 권한 부여',
      permission_delete_confirm:
        '이 작업은 다이나믹 앱에서 해당 권한을 제거하여 OAuth 클라이언트가 이에 대한 사용자 승인을 요청할 수 없게 합니다. 계속 진행하시겠습니까?',
    },
  },
  guide: {
    third_party: {
      title: '서드파티 어플리케이션 통합',
      description:
        'Logto를 아이덴티티 제공자로 사용하여 서드파티 서비스에 OAuth 권한 부여를 제공합니다. 안전한 리소스 접근을 위한 사전 제작된 사용자 동의 화면이 포함되어 있습니다. <a>자세히 알아보기</a>',
    },
  },
};

export default Object.freeze(applications);
