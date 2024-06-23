const organization_role_details = {
  page_title: '조직 역할 세부 정보',
  back_to_org_roles: '조직 역할로 돌아가기',
  delete_confirm:
    '이렇게 하면 해당 역할과 관련된 사용자의 권한이 제거되고 조직 역할, 조직 구성원 및 조직 권한 간의 관계가 삭제됩니다.',
  deleted: '조직 역할 {{name}} 이(가) 성공적으로 삭제되었습니다.',
  permissions: {
    tab: '권한',
    name_column: '권한',
    description_column: '설명',
    type_column: '권한 유형',
    type: {
      api: 'API 권한',
      org: '조직 권한',
    },
    assign_permissions: '권한 할당',
    remove_permission: '권한 삭제',
    remove_confirmation:
      '이 권한을 제거하면이 조직 역할을하는 사용자는이 권한으로 부여된 액세스를 잃게됩니다.',
    removed: '권한 {{name}}이(가)이 조직 역할에서 성공적으로 제거되었습니다',
    assign_description:
      '이 조직 내의 역할에 권한을 할당합니다. 이는 조직 권한과 API 권한을 모두 포함할 수 있습니다.',
    organization_permissions: '조직 권한',
    api_permissions: 'API 권한',
    assign_organization_permissions: '조직 권한 할당',
    assign_api_permissions: 'API 권한 할당',
  },
  general: {
    tab: '일반',
    settings: '설정',
    description:
      '조직 역할은 사용자에게 할당할 수 있는 권한의 그룹입니다. 권한은 사전에 정의된 조직 권한과 API 권한에서 올 수 있습니다.',
    name_field: '이름',
    description_field: '설명',
    description_field_placeholder: '읽기 전용 권한을 가진 사용자',
  },
};

export default Object.freeze(organization_role_details);
