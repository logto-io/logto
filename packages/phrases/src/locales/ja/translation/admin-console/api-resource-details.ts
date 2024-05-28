const api_resource_details = {
  page_title: 'APIリソースの詳細',
  back_to_api_resources: 'APIリソースに戻る',
  general_tab: '一般',
  permissions_tab: '権限',
  settings: '設定',
  settings_description:
    'APIリソース、またはリソースインジケータは、通常、リソースの識別子を表すURI形式の変数を表します。',
  management_api_settings_description:
    'Logto管理APIは、管理者が幅広いID関連タスクを管理し、セキュリティポリシーを強制し、規制や標準に準拠するための包括的なAPIのコレクションです。',
  management_api_notice:
    'このAPIはLogtoエンティティを表し、変更または削除することはできません。管理APIを使用して、幅広いID関連タスクを実行できます。 <a>詳細</a>',
  token_expiration_time_in_seconds: 'トークンの有効期限（秒単位）',
  token_expiration_time_in_seconds_placeholder: 'トークンの有効期限を入力してください',
  delete_description:
    'この操作は元に戻すことはできません。APIリソースを完全に削除します。削除を確認するために、APIリソース名を入力してください。 <span>{{name}}</span>',
  enter_your_api_resource_name: 'APIリソース名を入力してください',
  api_resource_deleted: 'APIリソース {{name}} が正常に削除されました',
  permission: {
    create_button: '権限を作成',
    create_title: '権限の作成',
    create_subtitle: 'このAPIで必要な権限（スコープ）を定義します。',
    confirm_create: '権限を作成',
    edit_title: 'API権限の編集',
    edit_subtitle: 'Define the permissions (scopes) needed by the {{resourceName}} API.',
    name: '権限名',
    name_placeholder: 'read:resource',
    forbidden_space_in_name: '権限名にはスペースを含めることはできません。',
    description: '説明',
    description_placeholder: 'リソースを読み込むことができます',
    permission_created: '権限 {{name}} が正常に作成されました',
    delete_description:
      'この権限が削除されると、この権限を持っていたユーザーはそれによって与えられたアクセスを失います。',
    deleted: '権限 "{{name}}" が正常に削除されました。',
  },
};

export default Object.freeze(api_resource_details);
