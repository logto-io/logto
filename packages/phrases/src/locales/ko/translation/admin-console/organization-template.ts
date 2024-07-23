const organization_template = {
  title: '조직 템플릿',
  subtitle:
    '멀티 테넌트 SaaS 애플리케이션에서 조직 템플릿은 여러 조직의 공유 액세스 제어 정책(권한 및 역할)을 정의합니다.',
  roles: {
    tab_name: '조직 역할',
    search_placeholder: '역할 이름으로 검색',
    create_title: '조직 역할 생성',
    role_column: '조직 역할',
    permissions_column: '권한',
    placeholder_title: '조직 역할',
    placeholder_description:
      '조직 역할은 사용자에게 할당될 수 있는 권한의 그룹입니다. 권한은 미리 정의된 조직 권한에서 와야 합니다.',
    create_modal: {
      title: '조직 역할 만들기',
      create: '역할 만들기',
      name: '역할 이름',
      description: '설명',
      type: '역할 유형',
      created: '조직 역할 {{name}}이(가) 성공적으로 만들어졌습니다.',
    },
  },
  permissions: {
    tab_name: '조직 권한',
    search_placeholder: '권한 이름으로 검색',
    create_org_permission: '조직 권한 생성',
    permission_column: '조직 권한',
    description_column: '설명',
    placeholder_title: '조직 권한',
    placeholder_description: '조직 권한은 조직의 맥락에서 자원에 접근할 수 있는 권한을 의미합니다.',
    delete_confirm:
      '이 권한이 삭제되면, 이 권한을 포함하는 모든 조직 역할이 이 권한을 잃게 되며, 이 권한을 가진 사용자는 그것에 의해 부여된 접근을 잃게 됩니다.',
    create_title: '조직 권한 생성',
    edit_title: '조직 권한 편집',
    permission_field_name: '권한 이름',
    description_field_name: '설명',
    description_field_placeholder: '약속 기록 읽기',
    create_permission: '권한 생성',
    created: '조직 권한 {{name}}이(가) 성공적으로 생성되었습니다.',
  },
};

export default Object.freeze(organization_template);
