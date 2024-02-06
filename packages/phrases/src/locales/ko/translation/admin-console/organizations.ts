const organizations = {
  organization: '조직',
  page_title: '조직',
  title: '조직',
  subtitle:
    '조직은 팀, 비즈니스 고객 및 파트너 업체가 응용 프로그램을 사용하는 사용자의 집합입니다.',
  organization_template: '조직 템플릿',
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
        role_description: '조직 역할은 구성원에게 할당할 수 있는 조직 권한의 그룹화입니다.',
      },
      section_3: {
        title: '일러스트를 상호 작용하여 연결되는 방식 확인',
        description:
          '예를 들어 존과 사라가 서로 다른 조직에서 서로 다른 역할을 가진 채로 있습니다. 각 모듈 위로 마우스를 올려보세요.',
      },
    },
    step_1: '단계 1: 조직 권한 정의',
    step_2: '단계 2: 조직 역할 정의',
    step_3: '단계 3: 첫 번째 조직 생성하기',
    step_3_description:
      '첫 번째 조직을 만들어보세요. 고유 ID가 포함되어 다양한 비즈니스 관련 식별자를 처리하는 컨테이너 역할을 합니다.',
    more_next_steps: '추가 다음 단계',
    add_members: '조직에 구성원 추가',
    /** UNTRANSLATED */
    config_organization: 'Configure organization',
    organization_permissions: '조직 권한',
    permission_name: '권한 이름',
    permissions: '권한',
    organization_roles: '조직 역할',
    role_name: '역할 이름',
    organization_name: '조직 이름',
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
