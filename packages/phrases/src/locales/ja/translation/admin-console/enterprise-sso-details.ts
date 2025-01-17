const enterprise_sso_details = {
  back_to_sso_connectors: '企業SSOに戻る',
  page_title: '企業SSOコネクタの詳細',
  readme_drawer_title: '企業SSO',
  readme_drawer_subtitle: 'エンドユーザーのSSOを有効にするために企業SSOコネクタを設定します',
  tab_experience: 'SSO体験',
  tab_connection: '接続',
  /** UNTRANSLATED */
  tab_idp_initiated_auth: 'IdP-initiated SSO',
  general_settings_title: '一般設定',
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
    jwks_uri: 'JSON Webキーセットエンドポイント',
    issuer: '発行者',
  },
  idp_initiated_auth_config: {
    /** UNTRANSLATED */
    card_title: 'IdP-initiated SSO',
    /** UNTRANSLATED */
    card_description:
      'User typically start the authentication process from your app using the SP-initiated SSO flow. DO NOT enable this feature unless absolutely necessary.',
    /** UNTRANSLATED */
    enable_idp_initiated_sso: 'Enable IdP-initiated SSO',
    /** UNTRANSLATED */
    enable_idp_initiated_sso_description:
      "Allow enterprise users to start the authentication process directly from the identity provider's portal. Please understand the potential security risks before enabling this feature.",
    /** UNTRANSLATED */
    default_application: 'Default application',
    /** UNTRANSLATED */
    default_application_tooltip:
      'Target application the user will be redirected to after authentication.',
    /** UNTRANSLATED */
    empty_applications_error:
      'No applications found. Please add one in the <a>Applications</a> section.',
    /** UNTRANSLATED */
    empty_applications_placeholder: 'No applications',
    /** UNTRANSLATED */
    authentication_type: 'Authentication type',
    /** UNTRANSLATED */
    auto_authentication_disabled_title: 'Redirect to client for SP-initiated SSO',
    /** UNTRANSLATED */
    auto_authentication_disabled_description:
      'Recommended. Redirect users to the client-side application to initiate a secure SP-initiated OIDC authentication.  This will prevent the CSRF attacks.',
    /** UNTRANSLATED */
    auto_authentication_enabled_title: 'Directly sign in using the IdP-initiated SSO',
    /** UNTRANSLATED */
    auto_authentication_enabled_description:
      'After successful sign-in, users will be redirected to the specified Redirect URI with the authorization code (Without state and PKCE validation).',
    /** UNTRANSLATED */
    auto_authentication_disabled_app: 'For traditional web app, single-page app (SPA)',
    /** UNTRANSLATED */
    auto_authentication_enabled_app: 'For traditional web app',
    /** UNTRANSLATED */
    idp_initiated_auth_callback_uri: 'Client callback URI',
    /** UNTRANSLATED */
    idp_initiated_auth_callback_uri_tooltip:
      'The client callback URI to initiate a SP-initiated SSO authentication flow. An ssoConnectorId will be appended to the URI as a query parameter. (e.g., https://your.domain/sso/callback?connectorId={{ssoConnectorId}})',
    /** UNTRANSLATED */
    redirect_uri: 'Post sign-in redirect URI',
    /** UNTRANSLATED */
    redirect_uri_tooltip:
      'The redirect URI to redirect users after successful sign-in. Logto will use this URI as the OIDC redirect URI in the authorization request. Use a dedicated URI for the IdP-initiated SSO authentication flow for better security.',
    /** UNTRANSLATED */
    empty_redirect_uris_error:
      'No redirect URI has been registered for the application. Please add one first.',
    /** UNTRANSLATED */
    redirect_uri_placeholder: 'Select a post sign-in redirect URI',
    /** UNTRANSLATED */
    auth_params: 'Additional authentication parameters',
    /** UNTRANSLATED */
    auth_params_tooltip:
      'Additional parameters to be passed in the authorization request. By default only (openid profile) scopes will be requested, you can specify additional scopes or a exclusive state value here. (e.g., { "scope": "organizations email", "state": "secret_state" }).',
  },
  /** UNTRANSLATED */
  trust_unverified_email: 'Trust unverified email',
  /** UNTRANSLATED */
  trust_unverified_email_label:
    'Always trust the unverified email addresses returned from the identity provider',
  /** UNTRANSLATED */
  trust_unverified_email_tip:
    'The Entra ID (OIDC) connector does not return the `email_verified` claim, meaning that email addresses from Azure are not guaranteed to be verified. By default, Logto will not sync unverified email addresses to the user profile. Enable this option only if you trust all the email addresses from the Entra ID directory.',
};

export default Object.freeze(enterprise_sso_details);
