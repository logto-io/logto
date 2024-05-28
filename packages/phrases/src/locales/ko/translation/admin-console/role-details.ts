const role_details = {
  back_to_roles: '역할로 돌아가기',
  identifier: '식별자',
  delete_description:
    '이렇게 하면 영향을 받는 사용자에게서 이 역할과 관련된 권한이 제거되고 역할, 사용자 및 권한 간의 매핑이 삭제될 걈에요.',
  role_deleted: '{{name}}이 성공적으로 삭제되었어요.',
  general_tab: '일반',
  users_tab: '사용자',
  m2m_apps_tab: '기계 대 기계 앱',
  permissions_tab: '권한',
  settings: '설정',
  settings_description:
    '역할은 사용자에게 할당된 권한들의 모음이에요. 역할은 다양한 API에 정의된 권한들을 통합하는 방법을 제공하기 때문에, 사용자에게 개별적으로 할당하는 것보다 효율적으로 권한을 추가, 제거, 조정할 수 있어요.',
  field_name: '이름',
  field_description: '설명',
  field_is_default: '기본 역할',
  field_is_default_description:
    '새 사용자에게 기본 역할로 설정합니다. 여러 기본 역할을 설정할 수 있습니다. 이는 Management API를 통해 생성된 사용자에 대한 기본 역할에도 영향을 미칩니다.',
  type_m2m_role_tag: '기계 대 기계 앱 역할',
  type_user_role_tag: '사용자 역할',
  m2m_role_notification:
    '이 머신 투 머신 역할을 머신 투 머신 앱에 할당하여 관련 API 리소스에 액세스할 수 있습니다. <a>아직 만들지 않은 경우에는 먼저 머신 투 머신 앱을 만드십시오.</a>',
  permission: {
    assign_button: '권한 할당',
    assign_title: '권한 할당',
    assign_subtitle:
      '이 역할에 권한을 할당해요. 이 역할은 추가된 권한을 할당받고, 이 역할을 가진 이용자들은 이 권한들을 상속받을 거예요.',
    assign_form_field: '권한 할당',
    added_text_one: '권한 {{count, number}}개 추가됨',
    added_text_other: '권한 {{count, number}}개 추가됨',
    api_permission_count_one: '권한 {{count, number}}개',
    api_permission_count_other: '권한 {{count, number}}개',
    confirm_assign: '권한 할당',
    permission_assigned: '선택된 권한들이 이 역할에 성공적으로 할당되었어요.',
    deletion_description:
      '이 권한이 삭제되면, 이 역할에 영향을 받는 사용자가 이 권한에 의해 부여된 접근 권한을 잃게 돼요.',
    permission_deleted: '권한 "{{name}}"이 이 역할에서 성공적으로 삭제되었어요.',
    empty: '권한 없음',
  },
  users: {
    assign_button: '사용자 할당',
    name_column: '사용자',
    app_column: '앱',
    latest_sign_in_column: '최근 로그인 시각',
    delete_description: '사용자는 사용자 목록에 남지만 이 역할에 대한 접근 권한을 잃어버릴 거예요.',
    deleted: '{{name}}이 이 역할에서 성공적으로 삭제되었어요.',
    assign_title: '사용자 할당',
    assign_subtitle:
      '사용자를 이 역할에 할당해요. 이름, 이메일, 전화번호, 사용자 ID 등을 이용하여 적절한 사용자를 찾아 보세요.',
    assign_field: '사용자 할당',
    confirm_assign: '사용자 할당',
    assigned_toast_text: '선택된 사용자가 이 역할에 성공적으로 할당되었어요',
    empty: '사용자 없음',
  },
  applications: {
    assign_button: '앱 할당',
    name_column: '앱',
    app_column: '앱',
    description_column: '설명',
    delete_description: '이 앱은 앱 모음에 남아 있지만 이 역할에 대한 권한을 상실하게 됩니다.',
    deleted: '{{name}} 이(가) 이 역할에서 성공적으로 제거되었습니다.',
    assign_title: '앱 할당',
    assign_subtitle: '이 역할에 앱 할당 적절한 앱을 이름, 설명 또는 앱 ID로 검색하여 찾아보세요.',
    assign_field: '앱 할당',
    confirm_assign: '앱 할당',
    assigned_toast_text: '선택된 앱이 이 역할에 성공적으로 할당되었습니다',
    empty: '사용 가능한 앱 없음',
  },
};

export default Object.freeze(role_details);
