const application_details = {
  page_title: 'アプリケーションの詳細',
  back_to_applications: 'アプリケーションに戻る',
  check_guide: 'ガイドを確認',
  settings: '設定',
  settings_description:
    'アプリケーションは、Logto for OIDC、サインインエクスペリエンス、監査ログなどでアプリケーションを識別するために使用されます。',
  /** UNTRANSLATED */
  endpoints_and_credentials: 'Endpoints & Credentials',
  /** UNTRANSLATED */
  endpoints_and_credentials_description:
    'Use the following endpoints and credentials to set up the OIDC connection in your application.',
  /** UNTRANSLATED */
  refresh_token_settings: 'Refresh token',
  /** UNTRANSLATED */
  refresh_token_settings_description: 'Manage the refresh token rules for this application.',
  application_roles: '役割',
  machine_logs: 'マシンログ',
  application_name: 'アプリケーション名',
  application_name_placeholder: '私のアプリ',
  description: '説明',
  description_placeholder: 'アプリケーションの説明を入力してください',
  config_endpoint: 'OpenID Providerの構成エンドポイント',
  authorization_endpoint: '認可エンドポイント',
  authorization_endpoint_tip:
    '認証と認可を実行するエンドポイントです。OpenID Connectの<a>認証</a>に使用されます。',
  /** UNTRANSLATED */
  show_endpoint_details: 'Show endpoint details',
  /** UNTRANSLATED */
  hide_endpoint_details: 'Hide endpoint details',
  logto_endpoint: 'Logto エンドポイント',
  application_id: 'アプリID',
  application_id_tip:
    '通常Logtoによって生成される一意のアプリケーション識別子です。OpenID Connectでは「<a>client_id</a>」とも呼ばれます。',
  application_secret: 'アプリのシークレット',
  redirect_uri: 'リダイレクトURI',
  redirect_uris: 'リダイレクトURI',
  redirect_uri_placeholder: 'https://your.website.com/app',
  redirect_uri_placeholder_native: 'io.logto://callback',
  redirect_uri_tip:
    'ユーザーがサインイン（成功した場合も失敗した場合も）した後にリダイレクトされるURIです。詳細については、OpenID Connectの<a>AuthRequest</a>を参照してください。',
  post_sign_out_redirect_uri: 'サインアウト後のリダイレクトURI',
  post_sign_out_redirect_uris: 'サインアウト後のリダイレクトURI',
  post_sign_out_redirect_uri_placeholder: 'https://your.website.com/home',
  post_sign_out_redirect_uri_tip:
    'ユーザーのサインアウト後にリダイレクトされるURIです（オプション）。一部のアプリケーションタイプでは実質的な効果がない可能性があります。',
  cors_allowed_origins: 'CORS許可されたオリジン',
  cors_allowed_origins_placeholder: 'https://your.website.com',
  cors_allowed_origins_tip:
    'デフォルトでは、リダイレクトURIのすべてのオリジンが許可されます。通常、このフィールドでは何も行動を必要としません。これについての詳細情報は<a>MDN doc</a>を参照してください。',
  token_endpoint: 'トークンエンドポイント',
  user_info_endpoint: 'ユーザー情報エンドポイント',
  enable_admin_access: '管理者アクセスを有効にする',
  enable_admin_access_label:
    '管理APIへのアクセスを有効または無効にします。有効にすると、アクセストークンを使用してこのアプリケーションを代表して管理APIを呼び出すことができます。',
  always_issue_refresh_token: '常にRefresh Tokenを発行する',
  always_issue_refresh_token_label:
    'この設定を有効にすると、Logtoは、認証要求に「prompt = consent」が提示されたかどうかにかかわらず、常にRefresh Tokenを発行することができます。ただし、OpenID Connectと互換性がないため、必要でない限りこのプラクティスは推奨されず、問題が発生する可能性があります。',
  refresh_token_ttl: 'リフレッシュトークンの有効期限（日単位）',
  refresh_token_ttl_tip:
    'リフレッシュトークンが期限切れになるまでの期間です。トークンリクエストは、リフレッシュトークンのTTLをこの値に延長します。',
  rotate_refresh_token: 'Refresh Tokenを切り替える',
  rotate_refresh_token_label:
    '有効にすると、Logtoは、元のTTLの70％が経過したときまたは特定の条件が満たされた場合、トークン要求で新しいRefresh Tokenを発行します。<a>詳細を見る</a>',
  delete_description:
    'この操作は元に戻すことはできません。アプリケーション名「<span>{{name}}</span>」を入力して確認してください。',
  enter_your_application_name: 'アプリケーション名を入力してください',
  application_deleted: 'アプリケーション{{name}}が正常に削除されました',
  redirect_uri_required: 'リダイレクトURIを少なくとも1つ入力する必要があります',
  branding: {
    /** UNTRANSLATED */
    name: 'Branding',
    /** UNTRANSLATED */
    description: "Customize your application's display name and logo on the consent screen.",
    /** UNTRANSLATED */
    more_info: 'More info',
    /** UNTRANSLATED */
    more_info_description: 'Offer users more details about your application on the consent screen.',
    /** UNTRANSLATED */
    display_name: 'Display name',
    /** UNTRANSLATED */
    display_logo: 'Display logo',
    /** UNTRANSLATED */
    display_logo_dark: 'Display logo (dark)',
    /** UNTRANSLATED */
    terms_of_use_url: 'Application terms of use URL',
    /** UNTRANSLATED */
    privacy_policy_url: 'Application privacy policy URL',
  },
  permissions: {
    /** UNTRANSLATED */
    name: 'Permissions',
    /** UNTRANSLATED */
    description:
      'Select the permissions that the third-party application requires for user authorization to access specific data types.',
  },
  roles: {
    name_column: '役割',
    description_column: '説明',
    assign_button: '役割を割り当てる',
    delete_description:
      'この操作は、このマシン対マシンアプリからこの役割を削除します。役割自体はまだ存在しますが、もはやマシン対マシンアプリに関連付けられていません。',
    deleted: '{{name}} がこのユーザーから正常に削除されました。',
    assign_title: '{{name}} に役割を割り当てる',
    assign_subtitle: '{{name}} に1つ以上の役割を承認する',
    assign_role_field: '役割を割り当てる',
    role_search_placeholder: '役割名で検索',
    added_text: '{{value, number}} 件追加',
    assigned_app_count: '{{value, number}} 個のアプリケーション',
    confirm_assign: '役割を割り当てる',
    role_assigned: '役割の割り当てに成功しました。',
    search: '役割名、説明、または ID で検索',
    empty: '利用可能な役割はありません',
  },
};

export default Object.freeze(application_details);
