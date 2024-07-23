const organization_details = {
  page_title: '조직 세부 정보',
  delete_confirmation:
    '삭제하면 모든 회원이 이 조직에서 멤버십과 역할을 잃게 됩니다. 이 작업은 취소할 수 없습니다.',
  organization_id: '조직 ID',
  settings_description:
    '조직은 귀하의 응용 프로그램에 액세스할 수 있는 팀, 비즈니스 고객 및 협력업체를 나타냅니다.',
  name_placeholder: '조직의 이름, 고유할 필요는 없습니다.',
  description_placeholder: '조직에 대한 설명입니다.',
  member: '멤버',
  member_other: '멤버',
  add_members_to_organization: '조직 {{name}}에 멤버 추가',
  add_members_to_organization_description:
    '이름, 이메일, 전화 또는 사용자 ID를 검색하여 적절한 사용자를 찾습니다. 기존 멤버는 검색 결과에 표시되지 않습니다.',
  add_with_organization_role: '조직 역할로 추가',
  user: '사용자',
  application: '응용 프로그램',
  application_other: '응용 프로그램들',
  add_applications_to_organization: '조직 {{name}}에 응용 프로그램 추가',
  add_applications_to_organization_description:
    '앱 ID, 이름 또는 설명을 검색하여 적절한 응용 프로그램을 찾습니다. 기존 응용 프로그램은 검색 결과에 표시되지 않습니다.',
  at_least_one_application: '최소한 하나의 응용 프로그램이 필요합니다.',
  remove_application_from_organization: '조직에서 응용 프로그램 제거',
  remove_application_from_organization_description:
    '제거하면 응용 프로그램은 이 조직에서의 연관성과 역할을 잃게 됩니다. 이 작업은 취소할 수 없습니다.',
  search_application_placeholder: '앱 ID, 이름 또는 설명으로 검색',
  roles: '조직 역할',
  authorize_to_roles: '{{name}}에게 다음 역할에 대한 액세스 권한 부여:',
  edit_organization_roles: '조직 역할 편집',
  edit_organization_roles_title: '{{name}} 의 조직 역할 편집',
  remove_user_from_organization: '사용자를 조직에서 제거',
  remove_user_from_organization_description:
    '제거하면 사용자가 이 조직에서 멤버십과 역할을 잃습니다. 이 작업은 취소할 수 없습니다.',
  search_user_placeholder: '이름, 이메일, 전화 또는 사용자 ID로 검색',
  at_least_one_user: '최소한 한 명의 사용자가 필요합니다.',
  organization_roles_tooltip: '이 조직 내의 {{type}} 에 할당된 역할입니다.',
  custom_data: '사용자 정의 데이터',
  custom_data_tip:
    '사용자 정의 데이터는 조직과 관련된 추가 데이터를 저장하는 데 사용할 수 있는 JSON 객체입니다.',
  invalid_json_object: '잘못된 JSON 객체입니다.',
  branding: {
    logo: '조직 로고',
    logo_tooltip:
      '조직 ID를 전달하여 로그인 경험에서 이 로고를 표시할 수 있습니다. 어두운 모드가 활성화되어 있는 경우 어두운 버전의 로고가 필요합니다. <a>자세히 알아보기</a>',
  },
  jit: {
    title: '즉시 프로비저닝',
    description:
      '일부 인증 방법을 통해 처음으로 로그인할 때 사용자가 자동으로 조직에 가입되고 역할이 할당될 수 있습니다. 즉시 프로비저닝을 위한 요구 사항을 설정할 수 있습니다.',
    email_domain: '이메일 도메인 프로비저닝',
    email_domain_description:
      '확인된 이메일 주소를 사용하여 회원가입하거나 확인된 이메일 주소를 사용하여 소셜 로그인을 하는 신규 사용자는 자동으로 조직에 가입됩니다. <a>자세히 알아보기</a>',
    email_domain_placeholder: '즉시 프로비저닝을 위한 이메일 도메인을 입력하세요',
    invalid_domain: '잘못된 도메인',
    domain_already_added: '도메인이 이미 추가되었습니다',
    sso_enabled_domain_warning:
      '엔터프라이즈 SSO와 연관된 하나 이상의 이메일 도메인을 입력했습니다. 이 이메일을 가진 사용자는 표준 SSO 흐름을 따르게 되며, 엔터프라이즈 SSO 프로비저닝이 설정되지 않은 한 이 조직에 프로비저닝되지 않습니다.',
    enterprise_sso: '엔터프라이즈 SSO 프로비저닝',
    no_enterprise_connector_set:
      '아직 엔터프라이즈 SSO 커넥터를 설정하지 않았습니다. 먼저 커넥터를 추가하여 엔터프라이즈 SSO 프로비저닝을 활성화하십시오. <a>설정</a>',
    add_enterprise_connector: '엔터프라이즈 커넥터 추가',
    enterprise_sso_description:
      '처음으로 엔터프라이즈 SSO를 통해 로그인하는 신규 사용자나 기존 사용자는 자동으로 조직에 가입됩니다. <a>자세히 알아보기</a>',
    organization_roles: '기본 조직 역할',
    organization_roles_description:
      '즉시 프로비저닝을 통해 조직에 가입할 때 사용자에게 할당할 역할입니다.',
  },
  mfa: {
    title: '다중 인증 (MFA)',
    tip: 'MFA가 필요할 때, MFA가 설정되지 않은 사용자는 조직 토큰을 교환하려고 시도할 때 거부됩니다. 이 설정은 사용자 인증에 영향을 미치지 않습니다.',
    description: '이 조직에 액세스하기 위해 사용자가 다중 인증을 설정해야 합니다.',
    no_mfa_warning:
      '테넌트에 다중 인증 방법이 활성화되어 있지 않습니다. 하나 이상의 <a>다중 인증 방법</a>이 활성화될 때까지 사용자는 이 조직에 액세스할 수 없습니다.',
  },
};

export default Object.freeze(organization_details);
