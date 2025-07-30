const enterprise_sso_details = {
  back_to_sso_connectors: '企業SSOに戻る',
  page_title: '企業SSOコネクタの詳細',
  readme_drawer_title: '企業SSO',
  readme_drawer_subtitle: 'エンドユーザーのSSOを有効にするために企業SSOコネクタを設定します',
  tab_experience: 'SSO体験',
  tab_connection: '接続',
  tab_idp_initiated_auth: 'IdP によって開始された SSO',
  general_settings_title: '一般設定',
  general_settings_description:
    'エンドユーザーの体験を構成し、SP によって開始される SSO フローのための企業メールドメインをリンクします。',
  custom_branding_title: '表示',
  custom_branding_description:
    'エンドユーザーのシングルサインオンプロセスで表示される名前とロゴをカスタマイズします。空白の場合、デフォルト値が使用されます。',
  email_domain_field_name: '企業メールドメイン',
  email_domain_field_description:
    'このメールドメインを使用するユーザーは、SSOで認証できます。このドメインが企業のものであることを確認してください。',
  email_domain_field_placeholder: 'メールドメイン',
  sync_profile_field_name: 'アイデンティティプロバイダーからプロファイル情報を同期',
  sync_profile_option: {
    register_only: '初回ログイン時のみ同期',
    each_sign_in: '毎回ログイン時に同期',
  },
  connector_name_field_name: 'コネクタ名',
  display_name_field_name: '表示名',
  connector_logo_field_name: 'ロゴ表示',
  connector_logo_field_description:
    '各画像は500KB以下にしてください。SVG、PNG、JPG、JPEG形式をサポートしています。',
  branding_logo_context: 'ロゴをアップロード',
  branding_logo_error: 'ロゴのアップロードエラー: {{error}}',
  branding_light_logo_context: 'ライトモードのロゴをアップロード',
  branding_light_logo_error: 'ライトモードのロゴアップロードエラー: {{error}}',
  branding_logo_field_name: 'ロゴ',
  branding_logo_field_placeholder: 'https://your.domain/logo.png',
  branding_dark_logo_context: 'ダークモードのロゴをアップロード',
  branding_dark_logo_error: 'ダークモードのロゴアップロードエラー: {{error}}',
  branding_dark_logo_field_name: 'ロゴ（ダークモード）',
  branding_dark_logo_field_placeholder: 'https://your.domain/dark-mode-logo.png',
  check_connection_guide: '接続ガイド',
  enterprise_sso_deleted: '企業SSOコネクタが正常に削除されました',
  delete_confirm_modal_title: '企業SSOコネクタを削除',
  delete_confirm_modal_content:
    'この企業コネクタを削除してもよろしいですか？アイデンティティプロバイダーからのユーザーはシングルサインオンを使用できなくなります。',
  upload_idp_metadata_title_saml: 'メタデータをアップロード',
  upload_idp_metadata_description_saml:
    'アイデンティティプロバイダーからコピーしたメタデータを設定します。',
  upload_idp_metadata_title_oidc: '証明書をアップロード',
  upload_idp_metadata_description_oidc:
    'アイデンティティプロバイダーからコピーした証明書およびOIDCトークン情報を設定します。',
  upload_idp_metadata_button_text: 'メタデータXMLファイルをアップロード',
  upload_signing_certificate_button_text: '署名証明書ファイルをアップロード',
  configure_domain_field_info_text:
    '企業ユーザーをアイデンティティプロバイダーに誘導するためにメールドメインを追加します。',
  email_domain_field_required: '企業SSOを有効にするには、メールドメインを入力する必要があります。',
  upload_saml_idp_metadata_info_text_url:
    'アイデンティティプロバイダーからのメタデータURLを貼り付けて接続します。',
  upload_saml_idp_metadata_info_text_xml:
    'アイデンティティプロバイダーからコピーしたメタデータを貼り付けて接続します。',
  upload_saml_idp_metadata_info_text_manual:
    'アイデンティティプロバイダーからコピーしたメタデータを入力して接続します。',
  upload_oidc_idp_info_text: 'アイデンティティプロバイダーからコピーした情報を入力して接続します。',
  service_provider_property_title: 'アイデンティティプロバイダーに設定',
  service_provider_property_description:
    'アイデンティティプロバイダーを使用して {{protocol}} でアプリケーション統合を設定します。Logtoが提供する詳細情報を入力してください。',
  attribute_mapping_title: '属性マッピング',
  attribute_mapping_description:
    'アイデンティティプロバイダーまたはLogto側でユーザー属性マッピングを設定して、ユーザープロファイルを同期します。',
  saml_preview: {
    sign_on_url: 'サインオンURL',
    entity_id: '発行者',
    x509_certificate: '署名証明書',
    certificate_content: '有効期限: {{date}}',
  },
  oidc_preview: {
    authorization_endpoint: '認可エンドポイント',
    token_endpoint: 'トークンエンドポイント',
    userinfo_endpoint: 'ユーザー情報エンドポイント',
    jwks_uri: 'JSON Web キー セットエンドポイント',
    issuer: '発行者',
  },
  idp_initiated_auth_config: {
    card_title: 'IdP によって開始された SSO',
    card_description:
      '通常、ユーザーは SP によって開始される SSO フローを使用してアプリから認証プロセスを開始します。この機能は絶対に必要な場合にのみ有効にして下さい。',
    enable_idp_initiated_sso: 'IdP によって開始された SSO を有効にする',
    enable_idp_initiated_sso_description:
      '企業ユーザーがアイデンティティプロバイダーのポータルから直接認証プロセスを開始できるようにします。この機能を有効にする前に潜在的なセキュリティリスクを確認してください。',
    default_application: 'デフォルトアプリケーション',
    default_application_tooltip: 'ユーザーが認証後にリダイレクトされる目標アプリケーション。',
    empty_applications_error:
      'アプリケーションが見つかりませんでした。「<a>アプリケーション</a>」セクションに追加してください。',
    empty_applications_placeholder: 'アプリケーションなし',
    authentication_type: '認証の種類',
    auto_authentication_disabled_title:
      'SP イニシエーテッド SSO のためにクライアントにリダイレクト',
    auto_authentication_disabled_description:
      '推奨: セキュアな SP イニシエーテッド OIDC 認証を開始するためにクライアント側アプリケーションにユーザーをリダイレクトします。これにより CSRF 攻撃を防止できます。',
    auto_authentication_enabled_title: 'IdP によって開始された SSO を使用して直接サインイン',
    auto_authentication_enabled_description:
      'サインインが成功すると、ユーザーは特定されたリダイレクト URI に認可コードでリダイレクトされます（状態と PKCE 検証なし）。',
    auto_authentication_disabled_app: '従来のウェブアプリ、シングルページアプリ（SPA）向け',
    auto_authentication_enabled_app: '従来のウェブアプリ向け',
    idp_initiated_auth_callback_uri: 'クライアント コールバック URI',
    idp_initiated_auth_callback_uri_tooltip:
      'SP イニシエーテッド SSO 認証フローを開始するためのクライアント コールバック URI。ssoConnectorId がクエリ パラメータとして URI に追加されます。（例: https://your.domain/sso/callback?connectorId={{ssoConnectorId}}）',
    redirect_uri: 'サインイン後のリダイレクト URI',
    redirect_uri_tooltip:
      'サインインが成功した後にユーザーをリダイレクトする URI。この URI を OIDC 認証リクエストで使用されるリダイレクト URI として使用します。より良いセキュリティのため、IdP によって開始された SSO 認証フローに専用の URI を使用してください。',
    empty_redirect_uris_error:
      'アプリケーションのために登録されたリダイレクト URI がありません。最初に追加してください。',
    redirect_uri_placeholder: 'サインイン後のリダイレクト URI を選択してください',
    auth_params: '追加の認証パラメータ',
    auth_params_tooltip:
      '認可リクエストで渡される追加のパラメータ。デフォルトでは (openid profile) スコープのみリクエストされますが、ここで追加のスコープまたは排他的な状態値を指定できます。（例: { "scope": "organizations email", "state": "secret_state" }）。',
  },
  trust_unverified_email: '未検証のメールを信頼する',
  trust_unverified_email_label:
    'アイデンティティプロバイダーから返された未確認のメールアドレスを常に信頼する',
  trust_unverified_email_tip:
    'Entra ID (OIDC) コネクタは `email_verified` クレームを返さないため、Azure からのメールアドレスは確認済みであることは保証されません。デフォルトでは、Logto は未検証のメールアドレスをユーザープロファイルに同期しません。Entra ID ディレクトリからのすべてのメールアドレスを信頼する場合にのみ、このオプションを有効にしてください。',
  offline_access: {
    label: 'アクセス トークンを更新',
    description:
      'Googleの「オフライン」アクセスを有効にしてリフレッシュ トークンをリクエストし、ユーザーの再認証なしでアプリがアクセス トークンをリフレッシュできるようにします。',
  },
};

export default Object.freeze(enterprise_sso_details);
