const application_details = {
  page_title: 'アプリケーションの詳細',
  back_to_applications: 'アプリケーションに戻る',
  check_guide: 'ガイドを確認',
  settings: '設定',
  settings_description:
    'An "Application" is a registered software or service that can access user info or act for a user. Applications help recognize who’s asking for what from Logto and handle the sign-in and permission. Fill in the required fields for authentication.',
  integration: '統合',
  integration_description:
    "Deploy with Logto secure workers, powered by Cloudflare's edge network for top-tier performance and 0ms cold starts worldwide.",
  service_configuration: 'サービス構成',
  service_configuration_description: 'サービスで必要な構成を完了します。',
  session: 'セッション',
  endpoints_and_credentials: 'エンドポイントと資格情報',
  endpoints_and_credentials_description:
    '次のエンドポイントと資格情報を使用して、アプリケーションでOIDC接続を設定します。',
  refresh_token_settings: 'リフレッシュトークン',
  refresh_token_settings_description:
    'このアプリケーションのリフレッシュトークン規則を管理します。',
  application_roles: '役割',
  machine_logs: 'マシンログ',
  application_name: 'アプリケーション名',
  application_name_placeholder: '私のアプリ',
  description: '説明',
  description_placeholder: 'アプリケーションの説明を入力してください',
  config_endpoint: 'OpenIDプロバイダ構成エンドポイント',
  authorization_endpoint: '認可エンドポイント',
  authorization_endpoint_tip:
    '認証と認可を実行するエンドポイントです。OpenID Connectの<a>認証</a>に使用されます。',
  show_endpoint_details: 'エンドポイントの詳細を表示',
  hide_endpoint_details: 'エンドポイントの詳細を非表示',
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
  app_domain_description_1:
    'Feel free to use your domain with {{domain}} powered by Logto, which is permanently valid.',
  app_domain_description_2:
    'Feel free to utilize your domain <domain>{{domain}}</domain> which is permanently valid.',
  custom_rules: 'カスタム認証ルール',
  custom_rules_placeholder: '^/(admin|privacy)/.+',
  custom_rules_description:
    'Set rules with regular expressions for authentication-required routes. Default: full-site protection if left blank.',
  authentication_routes: '認証ルート',
  custom_rules_tip:
    "Here are two case scenarios:<ol><li>To only protect routes '/admin' and '/privacy' with authentication: ^/(admin|privacy)/.*</li><li>To exclude JPG images from authentication: ^(?!.*\\.jpg$).*$</li></ol>",
  authentication_routes_description:
    'Redirect your authentication button using the specified routes. Note: These routes are irreplaceable.',
  protect_origin_server: 'オリジンサーバーを保護する',
  protect_origin_server_description:
    'Ensure to protect your origin server from direct access. Refer to the guide for more <a>detailed instructions</a>.',
  session_duration: 'セッション期間（日単位）',
  try_it: 'お試しください',
  branding: {
    name: 'ブランディング',
    description: 'Consent画面上でアプリケーションの表示名とロゴをカスタマイズします。',
    more_info: '詳細',
    more_info_description: 'Consent画面上でアプリケーションに関する追加情報を提供します。',
    display_name: '表示名',
    display_logo: '表示ロゴ',
    display_logo_dark: '表示ロゴ（ダーク）',
    terms_of_use_url: 'アプリケーション利用規約URL',
    privacy_policy_url: 'アプリケーションプライバシーポリシーURL',
  },
  permissions: {
    name: '権限',
    description:
      'ユーザーが特定のデータタイプにアクセスするためにサードパーティアプリケーションに対して承認される必要がある権限を選択します。',
    user_permissions: '個人ユーザーデータ',
    organization_permissions: '組織アクセス',
    table_name: '権限を許可',
    field_name: '権限',
    field_description: '同意画面に表示',
    delete_text: '権限を削除',
    permission_delete_confirm:
      'この操作は、ユーザーの特定のデータタイプに対するユーザー認証を要求するアプリケーションに許可された権限を撤回し、続行してもよろしいですか？',
    permissions_assignment_description:
      'ユーザーが特定のデータタイプにアクセスするためにサードパーティアプリケーションが要求している権限を選択します。',
    user_profile: 'ユーザーデータ',
    api_permissions: 'API権限',
    organization: '組織権限',
    user_permissions_assignment_form_title: 'ユーザープロファイル権限を追加',
    organization_permissions_assignment_form_title: '組織権限を追加',
    api_resource_permissions_assignment_form_title: 'APIリソース権限を追加',
    user_data_permission_description_tips:
      '個人ユーザーデータ権限の説明を「サインイン体験 > コンテンツ > 言語管理」を介して変更できます',
    permission_description_tips:
      'Logtoがサードパーティアプリケーションの認証プロバイダ（IdP）として使用され、ユーザーに承認を要求される場合、この説明が同意画面に表示されます。',
    user_title: 'ユーザー',
    user_description:
      '特定のユーザーデータにアクセスするためにサードパーティアプリケーションが要求する権限を選択します。',
    grant_user_level_permissions: 'ユーザーデータの権限を付与する',
    organization_title: '組織',
    organization_description:
      '特定の組織データにアクセスするためにサードパーティアプリケーションが要求する権限を選択します。',
    grant_organization_level_permissions: '組織データの権限を付与する',
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
