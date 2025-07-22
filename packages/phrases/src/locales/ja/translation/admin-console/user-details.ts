const user_details = {
  page_title: 'ユーザーの詳細',
  back_to_users: 'ユーザー管理に戻る',
  created_title: 'このユーザーは正常に作成されました',
  created_guide: 'ユーザーがサインインプロセスを支援するための情報です。',
  created_email: 'メールアドレス：',
  created_phone: '電話番号：',
  created_username: 'ユーザー名：',
  created_password: 'パスワード：',
  menu_delete: '削除',
  delete_description: 'この操作は取り消せません。ユーザーが永久に削除されます。',
  deleted: 'ユーザーは正常に削除されました',
  reset_password: {
    reset_title: '本当にパスワードをリセットしますか？',
    generate_title: '本当にパスワードを生成しますか？',
    content: 'この操作は取り消せません。ユーザーのログイン情報がリセットされます。',
    reset_complete: 'このユーザーはリセットされました',
    generate_complete: 'パスワードが生成されました',
    new_password: '新しいパスワード：',
    password: 'パスワード：',
  },
  tab_settings: '設定',
  tab_roles: 'ユーザー役割',
  tab_logs: 'ユーザーログ',
  tab_organizations: '組織',
  authentication: '認証',
  authentication_description:
    '各ユーザーには、すべてのユーザー情報が含まれるプロファイルがあります。基本データ、ソーシャルアイデンティティ、およびカスタムデータで構成されています。',
  user_profile: 'ユーザープロファイル',
  field_email: 'メールアドレス',
  field_phone: '電話番号',
  field_username: 'ユーザー名',
  field_password: 'パスワード',
  field_name: '名前',
  field_avatar: 'アバター画像のURL',
  field_avatar_placeholder: 'https://your.cdn.domain/avatar.png',
  field_custom_data: 'カスタムデータ',
  field_custom_data_tip:
    'プリディフィンドされたユーザープロパティにリストされていない、追加のユーザー情報（ユーザーが好みの色や言語など）。',
  field_profile: 'プロフィール',
  field_profile_tip:
    'ユーザーのプロパティに含まれていないオープン ID コネクト標準クレーム。すべての不明なプロパティは削除される点に注意してください。詳細については、<a>プロフィールプロパティリファレンス</a> を参照してください。',
  field_connectors: 'ソーシャル接続',
  field_sso_connectors: 'エンタープライズ接続',
  custom_data_invalid: 'カスタムデータは有効な JSON オブジェクトである必要があります',
  profile_invalid: 'プロフィールは有効な JSON オブジェクトである必要があります',
  password_already_set: 'すでにパスワードが設定されています',
  no_password_set: 'パスワードが設定されていません',
  connectors: {
    connectors: 'コネクタ',
    user_id: 'ユーザーID',
    remove: '削除',
    connected: 'このユーザーは複数のソーシャルコネクタに接続しています。',
    not_connected: 'ユーザーはソーシャルコネクタに接続していません',
    deletion_confirmation: '既存の<name/>アイデンティティを削除しています。本当に続行しますか？',
  },
  sso_connectors: {
    connectors: '接続',
    enterprise_id: 'エンタープライズID',
    connected:
      'このユーザーはシングルサインオンのために複数のエンタープライズアイデンティティプロバイダに接続しています。',
    not_connected:
      'ユーザーはシングルサインオンのためにいかなるエンタープライズアイデンティティプロバイダにも接続していません。',
  },
  mfa: {
    field_name: '多要素認証',
    field_description: 'このユーザーは2段階認証要素を有効にしました。',
    name_column: '多要素認証',
    field_description_empty: 'このユーザーは2段階認証の要因を有効にしていません。',
    deletion_confirmation: '2段階認証の既存の<name/>を削除しています。本当に続行しますか？',
  },
  suspended: '停止中',
  suspend_user: 'ユーザーを一時停止',
  suspend_user_reminder:
    'ユーザーを一時停止してよろしいですか？この操作を行うと、ユーザーはアプリにサインインできなくなり、現在のアクセストークンが期限切れになった後、新しいアクセストークンを取得できなくなります。さらに、このユーザーによって行われたすべての API リクエストは失敗します。',
  suspend_action: '一時停止',
  user_suspended: 'ユーザーが停止されました。',
  reactivate_user: 'ユーザーをリアクティブ化',
  reactivate_user_reminder:
    'このユーザーをリアクティブ化することを確認しますか？それにより、このユーザーのサインイン試行が許可されます。',
  reactivate_action: '活性化',
  user_reactivated: 'ユーザーが再活性化されました。',
  roles: {
    name_column: 'ユーザー役割',
    description_column: '説明',
    assign_button: '役割を割り当てる',
    delete_description:
      'この操作により、このユーザーからこの役割が削除されます。役割自体はまだ存在しますが、このユーザーに関連付けられなくなります。',
    deleted: '役割 {{name}} はこのユーザーから正常に削除されました。',
    assign_title: '{{name}} に役割を割り当てる',
    assign_subtitle: '名前、説明、または役割 ID で検索して適切なユーザー役割を見つけます。',
    assign_role_field: '役割を割り当てる',
    role_search_placeholder: '役割名で検索',
    added_text: '{{value, number}} 追加しました',
    assigned_user_count: '{{value, number}} ユーザー',
    confirm_assign: '役割を割り当てる',
    role_assigned: '役割が正常に割り当てられました',
    search: 'ロール名、説明、または ID で検索',
    empty: '利用可能な役割はありません',
  },
  warning_no_sign_in_identifier:
    'ユーザーは、サインインに少なくとも 1 つの識別子（ユーザー名、メールアドレス、電話番号、またはソーシャル）を持っている必要があります。続行してよろしいですか？',
  personal_access_tokens: {
    title: '個人用アクセス トークン',
    title_other: '個人用アクセス トークン',
    title_short: 'トークン',
    empty: 'ユーザーは個人用アクセス トークンを持っていません。',
    create: '新しいトークンを作成',
    tip: '個人用アクセス トークン (PAT) を使用すると、ユーザーは資格情報やインタラクティブサインインを使用せずにアクセス トークンを発行できます。これは、プログラムでリソースにアクセスする必要がある CI/CD、スクリプト、またはアプリケーションに役立ちます。',
    value: '値',
    created_at: '作成日',
    expires_at: '有効期限',
    never: '期限切れなし',
    create_new_token: '新しいトークンを作成',
    delete_confirmation: 'この操作は取り消せません。本当にこのトークンを削除しますか？',
    expired: '期限切れ',
    expired_tooltip: 'このトークンは {{date}} に期限切れでした。',
    create_modal: {
      title: '個人用アクセス トークンを作成',
      expiration: '有効期限',
      expiration_description: 'トークンは {{date}} に期限切れになります。',
      expiration_description_never:
        'トークンは期限切れになりません。セキュリティを強化するために有効期限を設定することをお勧めします。',
      days: '{{count}} 日',
      days_other: '{{count}} 日',
      created: 'トークン {{name}} が正常に作成されました。',
    },
    edit_modal: {
      title: '個人用アクセス トークンを編集',
      edited: 'トークン {{name}} が正常に編集されました。',
    },
  },
  connections: {
    /** UNTRANSLATED */
    title: 'Connection',
    /** UNTRANSLATED */
    description:
      'The user links third-party accounts for social sign-in, enterprise SSO, or resources access.',
    /** UNTRANSLATED */
    token_status_column: 'Token status',
    token_status: {
      /** UNTRANSLATED */
      active: 'Active',
      /** UNTRANSLATED */
      expired: 'Expired',
      /** UNTRANSLATED */
      inactive: 'Inactive',
      /** UNTRANSLATED */
      not_applicable: 'Not applicable',
      /** UNTRANSLATED */
      available: 'Available',
      /** UNTRANSLATED */
      not_available: 'Not available',
    },
  },
};

export default Object.freeze(user_details);
