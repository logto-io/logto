const organization_details = {
  page_title: '組織の詳細',
  delete_confirmation:
    '削除すると、すべてのメンバーが組織内のメンバーシップとロールを失います。この操作は元に戻せません。',
  organization_id: '組織ID',
  settings_description:
    '組織は、アプリケーションにアクセスできるチーム、ビジネス顧客、およびパートナー企業を表します。',
  name_placeholder: '組織の名前。一意である必要はありません。',
  description_placeholder: '組織の説明。',
  member: 'メンバー',
  member_other: 'メンバー',
  add_members_to_organization: '組織 {{name}} にメンバーを追加',
  add_members_to_organization_description:
    '名前、メール、電話、またはユーザーIDで検索して適切なユーザーを見つけます。検索結果には既存のメンバーは表示されません。',
  add_with_organization_role: '組織の役割付きで追加',
  user: 'ユーザー',
  authorize_to_roles: '{{name}} に以下の役割へのアクセスを許可',
  edit_organization_roles: '組織の役割を編集',
  edit_organization_roles_of_user: '{{name}} の組織の役割を編集',
  remove_user_from_organization: '組織からユーザーを削除',
  remove_user_from_organization_description:
    '削除すると、ユーザーは組織内のメンバーシップとロールを失います。この操作は元に戻せません。',
  search_user_placeholder: '名前、メール、電話番号、またはユーザーIDで検索',
  at_least_one_user: '少なくとも1人のユーザーが必要です。',
  custom_data: 'カスタムデータ',
  custom_data_tip:
    'カスタムデータは、組織に関連付けられた追加データを格納するために使用できるJSONオブジェクトです。',
  invalid_json_object: '無効なJSONオブジェクト。',
};

export default Object.freeze(organization_details);
