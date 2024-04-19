const organizations = {
  organization: '조직',
  page_title: '조직',
  title: '조직',
  /** UNTRANSLATED */
  subtitle:
    'Organizations are usually used in SaaS or similar multi-tenant apps and represent your clients which are teams, organizations, or entire companies. Organizations work as a foundational element for B2B authentication and authorization.',
  organization_template: '조직 템플릿',
  organization_id: '조직 ID',
  members: '회원',
  create_organization: '조직 만들기',
  setup_organization: '조직 설정',
  organization_list_placeholder_title: '조직',
  /** UNTRANSLATED */
  organization_list_placeholder_text:
    'Organizations are often used in SaaS or similar multi-tenant apps as a best practice. They enable you to develop apps that allow clients to create and manage organizations, invite members, and assign roles.',
  organization_name_placeholder: '내 조직',
  organization_description_placeholder: '조직에 대한 간략한 설명',
  organization_permission: '조직 권한',
  organization_permission_other: '조직 권한',
  create_permission_placeholder: '약속 내역 읽기',
  organization_role: '조직 역할',
  organization_role_other: '조직 역할',
  organization_role_description:
    '조직 역할은 사용자에 할당할 수 있는 권한의 그룹화입니다. 권한은 미리 정의된 조직 권한에서 가져와야 합니다.',
  role: '역할',
  search_placeholder: '조직 이름 또는 ID로 검색',
  search_role_placeholder: '검색하여 역할 선택',
  empty_placeholder: '🤔 You don’t have any {{entity}} set up yet.',
  organization_and_member: '조직 및 구성원',
  organization_and_member_description:
    '조직은 사용자 그룹이며 팀, 비즈니스 고객 및 파트너 업체를 나타낼 수 있으며 각 사용자는 "구성원"입니다. 이러한 것들은 여러분의 멀티 테넌트 요구사항을 처리하는 데 기본적인 엔터티일 수 있습니다.',
  guide: {
    title: '가이드로 시작',
    subtitle: '우리의 안내서를 통해 조직 설정의 시작을 빠르게 해보세요',
    introduction: {
      title: '로그토에서 조직이 작동하는 방식을 이해해봅시다',
      section_1: {
        title: '조직은 사용자(아이덴티티) 그룹입니다',
      },
      section_2: {
        title: '조직 템플릿은 멀티 테넌트 앱 액세스 제어를 위해 설계되었습니다',
        description:
          '멀티 테넌트 SaaS 애플리케이션에서는 여러 조직이 종종 권한 및 역할을 포함한 동일한 액세스 제어 템플릿을 공유합니다. 로그토에서는 이를 "조직 템플릿"이라고 합니다.',
        permission_description: '조직 권한은 조직의 컨텍스트에서 리소스에 대한 권한을 나타냅니다.',
        role_description_deprecated:
          '조직 역할은 구성원에게 할당할 수 있는 조직 권한의 그룹화입니다.',
        role_description:
          '조직 역할은 구성원에게 할당할 수 있는 조직 권한 또는 API 권한의 그룹입니다.',
      },
      section_3: {
        title: '조직 역할에 API 권한을 할당할 수 있나요?',
        description:
          '네, 조직 역할에 API 권한을 할당할 수 있습니다. Logto는 조직의 역할을 효과적으로 관리할 수 있는 유연성을 제공하며, 해당 역할 내에 조직 권한 및 API 권한을 모두 포함할 수 있습니다.',
      },
      section_4: {
        title: '일러스트를 상호 작용하여 연결되는 방식 확인',
        description:
          '예를 들어 존과 사라가 서로 다른 조직에서 서로 다른 역할을 가진 채로 있습니다. 각 모듈 위로 마우스를 올려보세요.',
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
      '존은 두 개의 조직에 속하며 단일 식별자로 "john@email.com"을 가지고 있습니다. 그는 조직 A의 관리자이자 조직 B의 게스트입니다.',
    sarah: '사라',
    sarah_tip:
      '사라는 단일 식별자로 "sarah@email.com"을 가지고 있는 하나의 조직에 속합니다. 그녀는 조직 B의 관리자입니다.',
  },
};

export default Object.freeze(organizations);
