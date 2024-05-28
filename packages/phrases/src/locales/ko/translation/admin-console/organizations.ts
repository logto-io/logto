const organizations = {
  organization: '조직',
  page_title: '조직',
  title: '조직',
  subtitle:
    '조직은 일반적으로 SaaS 또는 유사한 멀티 테넌트 앱에서 사용되며 팀, 조직 또는 전체 회사를 나타내는 것으로 클라이언트로서 역할을 하게 됩니다. 조직은 B2B 인증 및 권한 부여를 위한 기본 요소로 작용합니다.',
  organization_template: '조직 템플릿',
  organization_id: '조직 ID',
  members: '회원',
  create_organization: '조직 만들기',
  setup_organization: '조직 설정',
  organization_list_placeholder_title: '조직',
  organization_list_placeholder_text:
    '조직은 보통 SaaS 또는 유사한 멀티 테넌트 앱에서 모법 사례로 사용됩니다. 이를 통해 클라이언트가 조직을 만들고 관리하며 구성원을 초대하고 역할을 할당할 수 있는 앱을 개발할 수 있습니다.',
  organization_name_placeholder: '내 조직',
  organization_description_placeholder: '조직에 대한 간단한 설명',
  organization_permission: '조직 권한',
  organization_permission_other: '조직 권한',
  create_permission_placeholder: '약속 내용 읽기',
  organization_role: '조직 역할',
  organization_role_other: '조직 역할',
  organization_role_description:
    '조직 역할은 사용자에게 할당할 수 있는 권한을 그룹화하는 것입니다. 권한은 미리 정의된 조직 권한에서 가져와야 합니다.',
  role: '역할',
  search_placeholder: '조직 이름 또는 ID로 검색',
  search_role_placeholder: '검색하여 역할 선택',
  empty_placeholder: '🤔 {{entity}}를 아직 설정하지 않았습니다.',
  organization_and_member: '조직 및 구성원',
  organization_and_member_description:
    '조직은 사용자 그룹으로써 팀, 비즈니스 고객 및 파트너 기업을 나타내며 각 사용자가 "구성원"입니다. 이러한 것들은 B2B 요청 및 권한을 처리하는 데 주요 요소일 수 있습니다.',
  guide: {
    title: '가이드로 시작',
    subtitle: '조직 설정을 빠르게 시작해 보세요.',
    introduction: {
      title: '로그토에서 조직이 작동하는 방식 이해하기',
      section_1: {
        title: '조직은 사용자(아이덴티티) 그룹입니다',
      },
      section_2: {
        title: '조직 템플릿은 멀티 테넌트 앱 액세스 제어에 사용됩니다',
        description:
          '멀티 테넌트 SaaS 애플리케이션에서 여러 조직이 종종 동일한 액세스 제어 템플릿을 공유합니다. 이를 로그토에서는 "조직 템플릿"이라고 합니다.',
        permission_description: '조직 권한은 리소스에 대한 권한을 나타냅니다.',
        role_description_deprecated:
          '조직 역할은 구성원에게 할당할 수 있는 조직 권한의 그룹화입니다.',
        role_description:
          '조직 역할은 구성원에게 할당할 수 있는 조직 권한이나 API 권한의 그룹입니다.',
      },
      section_3: {
        title: '조직 역할에 API 권한을 할당할 수 있나요?',
        description:
          '네, 조직 역할에 API 권한을 할당할 수 있습니다. Logto는 조직 역할에 효과적으로 API 권한을 관리할 수 있는 유연성을 제공합니다.',
      },
      section_4: {
        title: '일러스트로 상호 연결 방식 확인하기',
        description:
          '예를 들어, 존과 사라는 서로 다른 조직에 속하고 각기 다른 역할을 가지고 있습니다. 모듈 위로 마우스를 올려보세요.',
      },
    },
    organization_permissions: '조직 권한',
    organization_roles: '조직 역할',
    admin: '관리자',
    member: '구성원',
    guest: '손님',
    role_description: '역할 "{{role}}"은 다른 조직에서도 동일한 조직 템플릿을 공유합니다.',
    john: '존',
    john_tip:
      '존은 두 조직에 속하며 "john@email.com"라는 단일 식별자를 가지고 있습니다. 그는 조직 A의 관리자이자 조직 B의 게스트입니다.',
    sarah: '사라',
    sarah_tip:
      '사라는 "sarah@email.com"라는 단일 식별자를 가지고 하나의 조직에 속해 있습니다. 그녀는 조직 B의 관리자입니다.',
  },
};

export default Object.freeze(organizations);
