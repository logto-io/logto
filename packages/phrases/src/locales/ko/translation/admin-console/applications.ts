const applications = {
  page_title: '어플리케이션',
  title: '어플리케이션',
  subtitle:
    '인증에 Logto를 사용할 모바일, 단일 페이지, Machine-to-Machine 또는 기존 어플리케이션을 설정할 수 있어요.',
  subtitle_with_app_type: '내 {{name}} 어플리케이션에 대한 Logto 인증 설정',
  create: '어플리케이션 생성',
  create_subtitle_third_party:
    'Logto를 사용하여 쉽게 서드파티 앱과 통합할 수 있는 식별 공급자(IdP)로 사용하세요',
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
      description: '예) iOS, Android 앱',
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
    third_party: {
      title: '서드파티 앱',
      subtitle: '서드파티 IdP 커넥터로 사용되는 앱',
      description: '예: OIDC, SAML',
    },
  },
  placeholder_title: '어플리케이션 유형을 선택하여 계속하세요',
  placeholder_description:
    'Logto는 OIDC용 앱 엔티티를 사용하여 앱 식별, 로그인 관리 및 감사 로그 생성과 같은 작업을 지원합니다.',
};

export default Object.freeze(applications);
