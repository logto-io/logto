const organizations = {
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
  guide: {
    title: '가이드로 시작',
    subtitle: '가이드와 함께 앱 개발 프로세스 시작하기',
    introduction: {
      section_1: {
        title: '먼저 Logto에서 조직이 작동하는 방식을 이해해 봅시다',
        description:
          '멀티 테넌트 SaaS 앱에서 우리는 종종 같은 권한과 역할을 가진 다양한 조직을 만들지만, 조직 컨텍스트에서는 액세스의 다양한 수준을 제어하는 데 중요한 역할을 할 수 있습니다. 각 테넌트는 로그토 조직과 같으며 그들은 자연스럽게 동일한 액세스 제어 "템플릿"을 공유합니다. 우리는 이것을 "조직 템플릿"이라고 합니다.',
      },
      section_2: {
        title: '조직 템플릿은 두 부분으로 구성됩니다',
        organization_permission_description:
          '조직 권한은 조직 컨텍스트에서 리소스에 액세스하기 위한 권한을 나타냅니다. 조직 권한은 의미 있는 문자열로 표현되어야 하며 이름 및 고유 식별자로도 작동해야 합니다.',
        organization_role_description:
          '조직 역할은 사용자에 할당할 수 있는 권한의 그룹화입니다. 권한은 미리 정의된 조직 권한에서 가져와야 합니다.',
      },
      section_3: {
        title: '일러스트를 상호 작용하여 연결되는 방식 확인',
        description:
          '예를 들어서 이해해 봅시다. 존, 사라 및 토니는 서로 다른 조직에서 서로 다른 역할을 가지고 있습니다. 각각의 모듈을 가리키고 그에 따르는 결과를 확인하세요.',
      },
    },
    step_1: '단계 1: 조직 권한 정의',
    step_2: '단계 2: 조직 역할 정의',
    step_2_description:
      '"조직 역할"은 각 조직에 제공된 일련의 역할을 나타냅니다. 이러한 역할은 이전 화면에서 설정한 전역 권한에 따라 결정됩니다. 조직 권한과 유사하게, 처음으로 이 설정을 완료하면 새로운 조직을 만들 때마다 이것을 매번 수행할 필요가 없게 됩니다.',
    step_3: '단계 3: 첫 번째 조직 생성하기',
    step_3_description:
      '첫 번째 조직을 만들어 보겠습니다. 이것은 고유한 ID가 포함되어 있으며 파트너, 고객 및 그들의 액세스 제어와 같은 다양한 비즈니스 관향 신원을 처리하는 컨테이너로 사용됩니다.',
    more_next_steps: '추가 다음 단계',
    add_members: '조직에 회원 추가',
    add_members_action: '회원을 일괄 추가 및 역할 할당',
    add_enterprise_connector: '기업 SSO 추가',
    add_enterprise_connector_action: '기업 SSO 설정',
    organization_permissions: '조직 권한',
    permission_name: '권한 이름',
    permissions: '권한',
    organization_roles: '조직 역할',
    role_name: '역할 이름',
    organization_name: '조직 이름',
    admin: '관리자',
    admin_description: '권한 "관리자"은 다른 조직 간에 동일한 조직 템플릿을 공유합니다.',
    member: '구성원',
    member_description: '권한 "구성원"은 다른 조직 간에 동일한 조직 템플릿을 공유합니다.',
    guest: '손님',
    guest_description: '권한 "손님"은 다른 조직 간에 동일한 조직 템플릿을 공유합니다.',
    create_more_roles:
      '조직 템플릿 설정에서 더 많은 역할을 생성할 수 있습니다. 이러한 조직 역할은 다른 조직에 적용됩니다.',
    read_resource: 'read:resource',
    edit_resource: 'edit:resource',
    delete_resource: 'delete:resource',
    ellipsis: '……',
    johnny:
      '존은 "john@email.com"이라는 이메일 주소로 두 조직에 속해 있습니다. 그는 조직 A의 관리자이자 조직 B의 손님입니다.',
    sarah:
      '사라는 "sarah@email.com"이라는 이메일 주소로 한 조직에 속해 있습니다. 그녀는 조직 B의 관리자입니다.',
    tony: '토니는 "tony@email.com"이라는 이메일 주소로 한 조직에 속해 있습니다. 그는 조직 C의 구성원입니다.',
  },
};

export default Object.freeze(organizations);
