const role_details = {
  back_to_roles: 'ロールに戻る',
  identifier: '識別子',
  delete_description:
    'これを行うと、このロールに関連付けられた許可が影響を受けるユーザーから削除され、ロール、ユーザー、および許可のマッピングが削除されます。',
  role_deleted: '{{name}} は正常に削除されました。',
  general_tab: '一般',
  users_tab: 'ユーザー',
  m2m_apps_tab: '機械対機械のアプリ',
  permissions_tab: '許可',
  settings: '設定',
  settings_description:
    'ロールは、ユーザーに割り当てることができる許可のグループ化です。また、異なるAPIに対して定義された許可を集約する方法を提供し、ユーザーに個別に割り当てるよりも許可を追加、削除、または調整するのに効率的です。',
  field_name: '名前',
  field_description: '説明',
  type_m2m_role_tag: '機械対機械のアプリのロール',
  type_user_role_tag: 'ユーザーロール',
  permission: {
    assign_button: '許可を割り当てる',
    assign_title: '許可の割り当て',
    assign_subtitle:
      'このロールに許可を割り当てます。ロールには追加された許可が追加され、このロールを持つユーザーはこれらの許可を継承します。',
    assign_form_field: '許可を割り当てる',
    added_text_one: '{{count, number}} 個の許可が追加されました',
    added_text_other: '{{count, number}} 個の許可が追加されました',
    api_permission_count_one: '{{count, number}} 個の許可',
    api_permission_count_other: '{{count, number}} 個の許可',
    confirm_assign: '許可を割り当てる',
    permission_assigned: '選択した許可は、このロールに正常に割り当てられました',
    deletion_description:
      'この許可が削除されると、このロールの影響を受けるユーザーは、この許可によって付与されたアクセス権を失います。',
    permission_deleted: '許可 "{{name}}" がこのロールから正常に削除されました',
    empty: '使用可能な許可はありません',
  },
  users: {
    assign_button: 'ユーザーを割り当てる',
    name_column: 'ユーザー',
    app_column: 'アプリ',
    latest_sign_in_column: '最新サインイン',
    delete_description: 'ユーザープールには残りますが、このロールに対する認可を失います。',
    deleted: '{{name}} はこのロールから正常に削除されました',
    assign_title: 'ユーザーを割り当てる',
    assign_subtitle:
      'ユーザーをこのロールに割り当てます。名前、電子メール、電話、またはユーザーIDで検索して適切なユーザーを見つけます。',
    assign_field: 'ユーザーを割り当てる',
    confirm_assign: 'ユーザーを割り当てる',
    assigned_toast_text: '選択したユーザーがこのロールに正常に割り当てられました',
    empty: '使用可能なユーザーはありません',
  },
  applications: {
    assign_button: 'アプリケーションを割り当てる',
    name_column: 'アプリケーション',
    app_column: 'アプリ',
    description_column: '説明',
    delete_description: 'アプリケーションプールには残りますが、このロールに対する認可を失います。',
    deleted: '{{name}} はこのロールから正常に削除されました',
    assign_title: 'アプリケーションを割り当てる',
    assign_subtitle:
      'このロールにアプリケーションを割り当てます。名前、説明、またはアプリIDで検索して適切なアプリケーションを見つけます。',
    assign_field: 'アプリケーションを割り当てる',
    confirm_assign: 'アプリケーションを割り当てる',
    assigned_toast_text: '選択したアプリケーションがこのロールに正常に割り当てられました',
    empty: '利用可能なアプリケーションはありません',
  },
};

export default Object.freeze(role_details);
