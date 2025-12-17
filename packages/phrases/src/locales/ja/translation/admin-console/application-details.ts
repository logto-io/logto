const application_details = {
  page_title: 'アプリケーションの詳細',
  back_to_applications: 'アプリケーションに戻る',
  check_guide: 'ガイドを確認',
  settings: '設定',
  settings_description:
    '「アプリケーション」とは、ユーザー情報にアクセスしたり利用者に代わって操作したりできる登録済みのソフトウェアやサービスを指します。アプリケーションは、Logto に誰が何を要求しているのかを認識させ、サインインと権限の処理を担います。認証に必要な項目を入力してください。',
  integration: '統合',
  integration_description:
    "Deploy with Logto secure workers, powered by Cloudflare's edge network for top-tier performance and 0ms cold starts worldwide.",
  service_configuration: 'サービス構成',
  service_configuration_description: 'サービスで必要な構成を完了します。',
  session: 'セッション',
  endpoints_and_credentials: 'エンドポイントと資格情報',
  endpoints_and_credentials_description:
    '次のエンドポイントと資格情報を使用して、アプリケーションで OIDC 接続を設定します。',
  refresh_token_settings: 'リフレッシュトークン',
  refresh_token_settings_description:
    'このアプリケーションのリフレッシュトークン規則を管理します。',
  machine_logs: 'マシンログ',
  application_name: 'アプリケーション名',
  application_name_placeholder: '私のアプリ',
  description: '説明',
  description_placeholder: 'アプリケーションの説明を入力してください',
  config_endpoint: 'OpenID プロバイダ構成エンドポイント',
  issuer_endpoint: '発行者エンドポイント',
  jwks_uri: 'JWKS URI',
  authorization_endpoint: '認可エンドポイント',
  authorization_endpoint_tip:
    '認証と認可を実行するエンドポイントです。OpenID Connect の<a>認証</a>に使用されます。',
  show_endpoint_details: 'エンドポイントの詳細を表示',
  hide_endpoint_details: 'エンドポイントの詳細を非表示',
  logto_endpoint: 'Logto エンドポイント',
  application_id: 'アプリ ID',
  application_id_tip:
    '通常 Logto によって生成される一意のアプリケーション識別子です。OpenID Connect では「<a>client_id</a>」とも呼ばれます。',
  application_secret: 'アプリのシークレット',
  application_secret_other: 'アプリのシークレット',
  redirect_uri: 'リダイレクト URI',
  redirect_uris: 'リダイレクト URI',
  redirect_uri_placeholder: 'https://your.website.com/app',
  redirect_uri_placeholder_native: 'io.logto://callback',
  redirect_uri_tip:
    'ユーザーがサインイン（成功した場合も失敗した場合も）した後にリダイレクトされる URI です。詳細については、OpenID Connect の<a>AuthRequest</a>を参照してください。',
  mixed_redirect_uri_warning:
    'アプリケーションの種類は少なくとも一つのリダイレクト URI と互換性がありません。これは最善のプラクティスに従っておらず、リダイレクト URI を一貫性のあるものにすることを強くお勧めします。',
  post_sign_out_redirect_uri: 'サインアウト後のリダイレクト URI',
  post_sign_out_redirect_uris: 'サインアウト後のリダイレクト URI',
  post_sign_out_redirect_uri_placeholder: 'https://your.website.com/home',
  post_sign_out_redirect_uri_tip:
    'ユーザーのサインアウト後にリダイレクトされる URI です（オプション）。一部のアプリケーションタイプでは実質的な効果がない可能性があります。',
  cors_allowed_origins: 'CORS 許可されたオリジン',
  cors_allowed_origins_placeholder: 'https://your.website.com',
  cors_allowed_origins_tip:
    'デフォルトでは、リダイレクト URI のすべてのオリジンが許可されます。通常、このフィールドでは何も行動を必要としません。これについての詳細情報は<a>MDN doc</a>を参照してください。',
  token_endpoint: 'トークンエンドポイント',
  user_info_endpoint: 'ユーザー情報エンドポイント',
  enable_admin_access: '管理者アクセスを有効にする',
  enable_admin_access_label:
    '管理 API へのアクセスを有効または無効にします。有効にすると、アクセストークンを使用してこのアプリケーションを代表して管理 API を呼び出すことができます。',
  always_issue_refresh_token: '常に Refresh Token を発行する',
  always_issue_refresh_token_label:
    'この設定を有効にすると、Logto は、認証要求に「prompt = consent」が提示されたかどうかにかかわらず、常に Refresh Token を発行することができます。ただし、OpenID Connect と互換性がないため、必要でない限りこのプラクティスは推奨されず、問題が発生する可能性があります。',
  refresh_token_ttl: 'リフレッシュトークンの有効期限（日単位）',
  refresh_token_ttl_tip:
    'リフレッシュトークンが期限切れになるまでの期間です。トークンリクエストは、リフレッシュトークンの TTL をこの値に延長します。',
  rotate_refresh_token: 'Refresh Token を切り替える',
  rotate_refresh_token_label:
    '有効にすると、Logto は、元の TTL の 70％ が経過したときまたは特定の条件が満たされた場合、トークン要求で新しい Refresh Token を発行します。<a>詳細を見る</a>',
  rotate_refresh_token_label_for_public_clients:
    '有効にすると、Logto は各トークンリクエストに対して新しいリフレッシュトークンを発行します。<a>詳細を見る</a>',
  backchannel_logout: 'バックチャネルログアウト',
  backchannel_logout_description:
    'OpenID Connect バックチャネルログアウトエンドポイントを構成し、このアプリケーションにセッションが必要かどうかを設定します。',
  backchannel_logout_uri: 'バックチャネルログアウト URI',
  backchannel_logout_uri_session_required: 'セッションが必要ですか？',
  backchannel_logout_uri_session_required_description:
    '有効にすると、RP は、`sid` （セッション ID）クレームをログアウトトークンに含めて、`backchannel_logout_uri` が使用されるときに RP セッションが OP と一致するように要求します。',
  delete_description:
    'この操作は元に戻すことはできません。アプリケーション名「<span>{{name}}</span>」を入力して確認してください。',
  enter_your_application_name: 'アプリケーション名を入力してください',
  application_deleted: 'アプリケーション{{name}}が正常に削除されました',
  redirect_uri_required: 'リダイレクト URI を少なくとも 1 つ入力する必要があります',
  app_domain_description_1:
    'Logto によって提供される {{domain}} を使用して、ドメインを自由に利用できます。これは永久に有効です。',
  app_domain_description_2:
    'Logto によって提供される <domain>{{domain}}</domain> を自由に利用できます。これは永久に有効です。',
  custom_rules: 'カスタム認証ルール',
  custom_rules_placeholder: '^/(admin|privacy)/.+',
  custom_rules_description:
    '認証が必要なルートのために正規表現でルールを設定します。デフォルトとして、このフィールドが空の場合、サイト全体が保護されます。',
  authentication_routes: '認証ルート',
  custom_rules_tip:
    "以下のようなケースがあります：<ol><li>認証で '/admin' と '/privacy' ルートのみを保護する: ^/(admin|privacy)/.*</li><li>JPG 画像を認証から除外する: ^(?!.*\\.jpg$).*$</li></ol>",
  authentication_routes_description:
    '指定されたルートを使用して認証ボタンをリダイレクトします。注意：これらのルートは置き換えることはできません。',
  protect_origin_server: 'オリジンサーバーを保護する',
  protect_origin_server_description:
    'オリジンサーバーへの直接アクセスを保護してください。詳細については、ガイドを参照してください。<a>詳細な手順</a>',
  third_party_settings_description:
    'OIDC / OAuth 2.0 を使用して Logto をアイデンティティプロバイダ（IdP）として、サードパーティアプリケーションと統合し、ユーザー承認のための同意画面を提供します。',
  session_duration: 'セッション期間（日単位）',
  try_it: 'お試しください',
  no_organization_placeholder: '組織が見つかりません。<a>組織に行く</a>',
  field_custom_data: 'カスタムデータ',
  field_custom_data_tip:
    '事前定義されたアプリケーションプロパティにリストされていない追加のカスタムアプリケーション情報。例えば、ビジネス固有の設定と構成。',
  custom_data_invalid: 'カスタムデータは有効な JSON オブジェクトである必要があります',
  branding: {
    name: 'ブランディング',
    description: 'Consent 画面上でアプリケーションの表示名とロゴをカスタマイズします。',
    description_third_party:
      'アプリケーションの同意画面に表示される名前とロゴをカスタマイズします。',
    app_logo: 'アプリのロゴ',
    app_level_sie: 'アプリレベルのサインインエクスペリエンス',
    app_level_sie_switch:
      'アプリレベルのサインインエクスペリエンスを有効にし、アプリ固有のブランディングを設定します。無効にすると、全体的なサインインエクスペリエンスが使用されます。',
    more_info: '詳細',
    more_info_description: 'Consent 画面上でアプリケーションに関する追加情報を提供します。',
    display_name: '表示名',
    application_logo: 'アプリケーションのロゴ',
    application_logo_dark: 'アプリケーションのロゴ（ダーク）',
    brand_color: 'ブランドカラー',
    brand_color_dark: 'ブランドカラー（ダーク）',
    terms_of_use_url: 'アプリケーション利用規約 URL',
    privacy_policy_url: 'アプリケーションプライバシーポリシー URL',
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
    api_permissions: 'API 権限',
    organization: '組織権限',
    user_permissions_assignment_form_title: 'ユーザープロファイル権限を追加',
    organization_permissions_assignment_form_title: '組織権限を追加',
    api_resource_permissions_assignment_form_title: 'API リソース権限を追加',
    user_data_permission_description_tips:
      '個人ユーザーデータ権限の説明を「サインイン体験 > コンテンツ > 言語管理」を介して変更できます',
    permission_description_tips:
      'Logto がサードパーティアプリケーションの認証プロバイダ（IdP）として使用され、ユーザーに承認を要求される場合、この説明が同意画面に表示されます。',
    user_title: 'ユーザー',
    user_description:
      '特定のユーザーデータにアクセスするためにサードパーティアプリケーションが要求する権限を選択します。',
    grant_user_level_permissions: 'ユーザーデータの権限を付与する',
    organization_title: '組織',
    organization_description:
      '特定の組織データにアクセスするためにサードパーティアプリケーションが要求する権限を選択します。',
    grant_organization_level_permissions: '組織データの権限を付与する',
    oidc_title: 'OIDC',
    oidc_description:
      '主要な OIDC 権限はアプリに自動的に設定されます。これらのスコープは認証に必須であり、ユーザーの同意画面には表示されません。',
    default_oidc_permissions: '既定の OIDC 権限',
    permission_column: '権限',
    guide_column: 'ガイド',
    openid_permission: 'openid',
    openid_permission_guide:
      "OAuth リソースへのアクセスでは任意です。\nOIDC 認証では必須です。ID トークンへのアクセスを許可し、'userinfo_endpoint' にアクセスできるようにします。",
    offline_access_permission: 'offline_access',
    offline_access_permission_guide:
      '任意。長期アクセスやバックグラウンド処理のためのリフレッシュトークンを取得します。',
  },
  roles: {
    assign_button: 'マシン間の役割を割り当てる',
    delete_description:
      'この操作は、このマシン対マシンアプリからこの役割を削除します。役割自体はまだ存在しますが、もはやマシン対マシンアプリに関連付けられていません。',
    deleted: '{{name}} がこのユーザーから正常に削除されました。',
    assign_title: '{{name}}にマシン間の役割を割り当てる',
    assign_subtitle:
      'マシン対マシンアプリは、関連する API リソースにアクセスするためにマシン対マシンタイプの役割が必要です。',
    assign_role_field: 'マシン間の役割を割り当てる',
    role_search_placeholder: '役割名で検索',
    added_text: '{{value, number}} 件追加',
    assigned_app_count: '{{value, number}} 個のアプリケーション',
    confirm_assign: 'マシン間の役割を割り当てる',
    role_assigned: '役割の割り当てに成功しました。',
    search: '役割名、説明、または ID で検索',
    empty: '利用可能な役割はありません',
  },
  secrets: {
    value: '値',
    empty: 'アプリケーションにはシークレットがありません。',
    created_at: '作成日',
    expires_at: '有効期限',
    never: 'なし',
    create_new_secret: '新しいシークレットを作成',
    delete_confirmation:
      'この操作は元に戻せません。本当にこのシークレットを削除してもよろしいですか？',
    deleted: 'シークレットは正常に削除されました。',
    activated: 'シークレットは正常にアクティブ化されました。',
    deactivated: 'シークレットは正常に非アクティブ化されました。',
    legacy_secret: 'レガシーシークレット',
    expired: '期限切れ',
    expired_tooltip: 'このシークレットは {{date}} に期限切れになりました。',
    create_modal: {
      title: 'アプリケーションシークレットを作成',
      expiration: '有効期限',
      expiration_description: 'シークレットは{{date}}に期限切れになります。',
      expiration_description_never:
        'シークレットは期限切れになりません。セキュリティを強化するため、有効期限を設定することをお勧めします。',
      days: '{{count}} 日',
      days_other: '{{count}} 日間',
      years: '{{count}} 年',
      years_other: '{{count}} 年間',
      created: 'シークレット {{name}} が正常に作成されました。',
    },
    edit_modal: {
      title: 'アプリケーションシークレットを編集',
      edited: 'シークレット {{name}} が正常に編集されました。',
    },
  },
  saml_idp_config: {
    title: 'SAML IdP メタデータ',
    description: '次のメタデータと証明書を使用して、アプリケーションで SAML IdP を構成します。',
    metadata_url_label: 'IdP メタデータ URL',
    single_sign_on_service_url_label: 'シングルサインオンサービス URL',
    idp_entity_id_label: 'IdP エンティティ ID',
  },
  saml_idp_certificates: {
    title: 'SAML 署名証明書',
    expires_at: '有効期限',
    finger_print: 'フィンガープリント',
    status: '状態',
    active: 'アクティブ',
    inactive: '非アクティブ',
  },
  saml_idp_name_id_format: {
    title: 'Name ID フォーマット',
    description: 'SAML IdP の Name ID フォーマットを選択します。',
    persistent: '永続的',
    persistent_description: 'Logto ユーザー ID を Name ID として使用',
    transient: '一時的',
    transient_description: '一回限りのユーザー ID を Name ID として使用',
    unspecified: '未指定',
    unspecified_description: 'Logto ユーザー ID を Name ID として使用',
    email_address: 'メールアドレス',
    email_address_description: 'メールアドレスを Name ID として使用',
  },
  saml_encryption_config: {
    encrypt_assertion: 'SAML アサーションを暗号化',
    encrypt_assertion_description:
      'このオプションを有効にすると、SAML アサーションが暗号化されます。',
    encrypt_then_sign: '暗号化してから署名',
    encrypt_then_sign_description:
      'このオプションを有効にすると、SAML アサーションが暗号化されてから署名されます。それ以外の場合、SAML アサーションは署名されてから暗号化されます。',
    certificate: '証明書',
    certificate_tooltip:
      'サービスプロバイダから取得した x509 証明書をコピーして貼り付け、SAML アサーションを暗号化します。',
    certificate_placeholder:
      '-----BEGIN CERTIFICATE-----\nMIICYDCCAcmgAwIBA...\n-----END CERTIFICATE-----\n',
    certificate_missing_error: '証明書が必要です。',
    certificate_invalid_format_error:
      '無効な証明書フォーマットが検出されました。証明書のフォーマットを確認してもう一度試してください。',
  },
  saml_app_attribute_mapping: {
    name: '属性マッピング',
    title: '基本属性マッピング',
    description:
      'Logto からアプリケーションにユーザープロファイルを同期するために属性マッピングを追加します。',
    col_logto_claims: 'Logto の値',
    col_sp_claims: 'アプリケーションの値名',
    add_button: '別のものを追加',
  },
};

export default Object.freeze(application_details);
