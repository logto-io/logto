const organization_template = {
  title: '組織テンプレート',
  subtitle:
    'マルチテナントSaaSアプリケーションでは、組織テンプレートが複数の組織の共有アクセス制御ポリシー（権限と役割）を定義します。',
  roles: {
    tab_name: '組織の役割',
    search_placeholder: '役割名で検索',
    create_title: '組織の役割を作成',
    role_column: '組織の役割',
    permissions_column: '権限',
    placeholder_title: '組織の役割',
    placeholder_description:
      '組織の役割は、ユーザーに割り当てることができる権限のグループです。権限は、事前に定義された組織の権限から来なければなりません。',
    create_modal: {
      title: '組織の役割を作成する',
      create: '役割を作成する',
      name_field: '役割名',
      description_field: '説明',
      created: '組織の役割{{name}}が正常に作成されました。',
    },
  },
  permissions: {
    tab_name: '組織の権限',
    search_placeholder: '権限名で検索',
    create_org_permission: '組織の権限を作成',
    permission_column: '組織の許可',
    description_column: '説明',
    placeholder_title: '組織の権限',
    placeholder_description:
      '組織の権限は、組織の文脈でリソースにアクセスするための認可を指します。',
    delete_confirm:
      'この権限が削除されると、この権限を含むすべての組織の役割がこの権限を失い、この権限を持っていたユーザーはそれによって与えられたアクセスを失います。',
    create_title: '組織の権限を作成',
    edit_title: '組織の権限を編集',
    permission_field_name: '権限名',
    description_field_name: '説明',
    description_field_placeholder: '予約履歴を読む',
    create_permission: '権限を作成',
    created: '組織権限 {{name}} が正常に作成されました。',
  },
};

export default Object.freeze(organization_template);
