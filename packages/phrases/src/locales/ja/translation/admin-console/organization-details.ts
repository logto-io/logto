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
  application: 'アプリケーション',
  application_other: 'アプリケーション',
  add_applications_to_organization: '組織 {{name}} にアプリケーションを追加',
  add_applications_to_organization_description:
    'アプリID、名前、または説明を検索して適切なアプリケーションを見つけます。検索結果には既存のアプリケーションは表示されません。',
  at_least_one_application: '少なくとも1つのアプリケーションが必要です。',
  remove_application_from_organization: '組織からアプリケーションを削除',
  remove_application_from_organization_description:
    '削除されると、このアプリケーションは組織の関連付けとロールを失います。この操作は元に戻せません。',
  search_application_placeholder: 'アプリID、名前、または説明で検索',
  roles: '組織ロール',
  authorize_to_roles: '{{name}} に以下の役割へのアクセスを許可',
  edit_organization_roles: '組織の役割を編集',
  edit_organization_roles_title: '{{name}} の組織役割を編集',
  remove_user_from_organization: '組織からユーザーを削除',
  remove_user_from_organization_description:
    '削除すると、ユーザーは組織内のメンバーシップとロールを失います。この操作は元に戻せません。',
  search_user_placeholder: '名前、メール、電話番号、またはユーザーIDで検索',
  at_least_one_user: '少なくとも1人のユーザーが必要です。',
  organization_roles_tooltip: 'この組織内で {{type}} に割り当てられた役割。',
  custom_data: 'カスタムデータ',
  custom_data_tip:
    'カスタムデータは、組織に関連付けられた追加データを格納するために使用できるJSONオブジェクトです。',
  invalid_json_object: '無効なJSONオブジェクト。',
  branding: {
    logo: '組織ロゴ',
    logo_tooltip:
      '組織IDを渡してサインイン画面でこのロゴを表示できます。ダークモードが有効になっている場合は、ダークバージョンのロゴが必要です。<a>詳細</a>',
  },
  jit: {
    title: 'ジャストインタイムプロビジョニング',
    description:
      'ユーザーは、いくつかの認証方法を使って初めてサインインするときに自動的に組織に参加し、役割が割り当てられます。ジャストインタイムプロビジョニングの要件を設定できます。',
    email_domain: 'メールドメインプロビジョニング',
    email_domain_description:
      '検証済みのメールアドレスでサインアップする新しいユーザー、または検証済みのメールアドレスを使ってソーシャルサインインする新しいユーザーは、自動的に組織に参加します。<a>詳細</a>',
    email_domain_placeholder: 'ジャストインタイムプロビジョニング用のメールドメインを入力',
    invalid_domain: '無効なドメイン',
    domain_already_added: '既に追加されたドメイン',
    sso_enabled_domain_warning:
      'エンタープライズSSOに関連付けられたメールドメインを1つ以上入力しました。これらのメールを持つユーザーは標準的なSSOフローに従います。エンタープライズSSOプロビジョニングが設定されていない限り、この組織にプロビジョニングされません。',
    enterprise_sso: 'エンタープライズSSOプロビジョニング',
    no_enterprise_connector_set:
      'エンタープライズSSOコネクタがまだ設定されていません。エンタープライズSSOプロビジョニングを有効にするには、まずコネクタを追加してください。<a>セットアップ</a>',
    add_enterprise_connector: 'エンタープライズコネクタを追加',
    enterprise_sso_description:
      'エンタープライズSSOを使用して初めてサインインする新しいユーザーまたは既存のユーザーは、自動的に組織に参加します。<a>詳細</a>',
    organization_roles: 'デフォルトの組織ロール',
    organization_roles_description:
      'ジャストインタイムプロビジョニングを通じて組織に参加したユーザーに役割を割り当てます。',
  },
  mfa: {
    title: '多要素認証 (MFA)',
    tip: 'MFAが必要な場合、MFAが設定されていないユーザーは組織トークンを取得しようとすると拒否されます。この設定はユーザー認証には影響しません。',
    description: 'この組織にアクセスするために必要な多要素認証を設定してください。',
    no_mfa_warning:
      'テナントに多要素認証のメソッドが有効になっていません。少なくとも1つの<a>多要素認証メソッド</a>が有効になるまで、ユーザーはこの組織にアクセスできません。',
  },
};

export default Object.freeze(organization_details);
