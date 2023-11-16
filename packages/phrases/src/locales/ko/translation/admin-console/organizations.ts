const organizations = {
  /** UNTRANSLATED */
  organization: 'Organization',
  page_title: '조직',
  title: '조직',
  subtitle:
    '팀, 비즈니스 고객 및 파트너 기업을 해당 조직으로 접근하는 애플리케이션에 대해 표현합니다.',
  organization_id: '조직 ID',
  members: '회원',
  create_organization: '조직 만들기',
  setup_organization: '조직 설정',
  organization_list_placeholder_title: '조직',
  organization_list_placeholder_text:
    '조직은 일반적으로 SaaS 또는 SaaS와 유사한 멀티 테넌시 앱에서 사용됩니다. 조직 기능을 사용하면 B2B 고객이 파트너 및 고객을 효과적으로 관리하고 최종 사용자가 응용 프로그램에 액세스하는 방식을 사용자 정의할 수 있게 됩니다.',
  organization_name_placeholder: '내 조직',
  organization_description_placeholder: '조직에 대한 간략한 설명',
  organization_permission: '조직 권한',
  organization_permission_other: '조직 권한',
  organization_permission_description:
    '조직 권한은 조직 컨텍스트에서 리소스에 액세스하기 위한 권한을 나타냅니다. 조직 권한은 의미 있는 문자열로 표현되어야 하며 이름 및 고유 식별자로도 작동해야 합니다.',
  organization_permission_delete_confirm:
    '이 권한이 삭제되면 이 권한을 포함하는 모든 조직 역할은 이 권한을 상실하고 이 권한이 부여한 액세스도 상실합니다.',
  create_permission_placeholder: '약속 내역 읽기',
  permission: '권한',
  permission_other: '권한',
  organization_role: '조직 역할',
  organization_role_other: '조직 역할',
  organization_role_description:
    '조직 역할은 사용자에 할당할 수 있는 권한의 그룹화입니다. 권한은 미리 정의된 조직 권한에서 가져와야 합니다.',
  organization_role_delete_confirm:
    '이렇게 하면 영향을 받는 사용자에서 이 역할과 관련된 권한이 제거되고 조직 역할, 조직 구성원 및 조직 권한 간의 관계가 삭제됩니다.',
  role: '역할',
  create_role_placeholder: '보기 전용 권한을 가진 사용자',
  search_placeholder: '조직 이름 또는 ID로 검색',
  search_permission_placeholder: '검색하여 권한 선택',
  search_role_placeholder: '검색하여 역할 선택',
  empty_placeholder: '🤔 You don’t have any {{entity}} set up yet.',
  /** UNTRANSLATED */
  organization_and_member: 'Organization and member',
  /** UNTRANSLATED */
  organization_and_member_description:
    'Organization is a group of users and can represent the teams, business customers, and partner companies, with each user being a "Member". Those can be fundamental entities to handle your multi-tenant requirements.',
  guide: {
    title: '가이드로 시작',
    subtitle: '가이드와 함께 앱 개발 프로세스 시작하기',
    introduction: {
      /** UNTRANSLATED */
      title: "Let's understand how organization works in Logto",
      section_1: {
        /** UNTRANSLATED */
        title: 'An organization is a group of users (identities)',
      },
      section_2: {
        /** UNTRANSLATED */
        title: 'Organization template is designed for multi-tenant apps access control',
        /** UNTRANSLATED */
        description:
          'In multi-tenant SaaS applications, multiple organizations often share the same access control template, which includes permissions and roles. In Logto, we call it "organization template."',
        /** UNTRANSLATED */
        permission_description:
          'Organization permission refers to the authorization to access a resource in the context of organization.',
        /** UNTRANSLATED */
        role_description:
          'Organization role is a grouping of organization permissions that can be assigned to members.',
      },
      section_3: {
        title: '일러스트를 상호 작용하여 연결되는 방식 확인',
        description:
          "Let's take an example. John, Sarah are in different organizations with different roles in the context of different organizations. Hover over the different modules and see what happens.",
      },
    },
    step_1: '단계 1: 조직 권한 정의',
    step_2: '단계 2: 조직 역할 정의',
    step_2_description:
      '"조직 역할"은 각 조직에 제공된 일련의 역할을 나타냅니다. 이러한 역할은 이전 화면에서 설정한 전역 권한에 따라 결정됩니다. 조직 권한과 유사하게, 처음으로 이 설정을 완료하면 새로운 조직을 만들 때마다 이것을 매번 수행할 필요가 없게 됩니다.',
    step_3: '단계 3: 첫 번째 조직 생성하기',
    step_3_description:
      "Let's create your first organization. It comes with a unique ID and serves as a container for handling various more business-toward identities, such as partners, customers, and their access control.",
    /** UNTRANSLATED */
    more_next_steps: 'More next steps',
    /** UNTRANSLATED */
    add_members: 'Add members to your organization',
    /** UNTRANSLATED */
    add_members_action: 'Bulk add members and assign roles',
    /** UNTRANSLATED */
    add_enterprise_connector: 'Add enterprise SSO',
    /** UNTRANSLATED */
    add_enterprise_connector_action: 'Set up enterprise SSO',
    /** UNTRANSLATED */
    organization_permissions: 'Organization permissions',
    /** UNTRANSLATED */
    permission_name: 'Permission name',
    /** UNTRANSLATED */
    permissions: 'Permissions',
    /** UNTRANSLATED */
    organization_roles: 'Organization roles',
    /** UNTRANSLATED */
    role_name: 'Role name',
    /** UNTRANSLATED */
    organization_name: 'Organization name',
    /** UNTRANSLATED */
    admin: 'Admin',
    /** UNTRANSLATED */
    member: 'Member',
    /** UNTRANSLATED */
    guest: 'Guest',
    /** UNTRANSLATED */
    role_description:
      'Role "{{role}}" shares the same organization template across different organizations.',
    /** UNTRANSLATED */
    john: 'John',
    /** UNTRANSLATED */
    john_tip:
      'John belongs to two organizations with the email "john@email.com" as the single identifier. He is the admin of organization A as well as the guest of organization B.',
    /** UNTRANSLATED */
    sarah: 'Sarah',
    /** UNTRANSLATED */
    sarah_tip:
      'Sarah belongs to one organization with the email "sarah@email.com" as the single identifier. She is the admin of organization B.',
  },
};

export default Object.freeze(organizations);
