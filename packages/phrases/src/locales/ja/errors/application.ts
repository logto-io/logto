const application = {
  invalid_type: '関連するロールを持つことができるのは、マシン間アプリケーションのみです。',
  role_exists: 'ロールID {{roleId}} は、すでにこのアプリケーションに追加されています。',
  invalid_role_type:
    'ユーザータイプのロールをマシン間アプリケーションに割り当てることはできません。',
  invalid_third_party_application_type:
    '伝統的な Web アプリケーションにのみ、サードパーティアプリとしてマークできます。',
  third_party_application_only: 'この機能はサードパーティアプリケーションにのみ利用可能です。',
  user_consent_scopes_not_found: '無効なユーザー同意スコープ。',
  consent_management_api_scopes_not_allowed: '管理 API スコープは許可されていません。',
  protected_app_metadata_is_required: '保護されたアプリケーションメタデータが必要です。',
  protected_app_not_configured:
    '保護されたアプリケーションプロバイダーが構成されていません。この機能はオープンソースバージョンでは利用できません。',
  cloudflare_unknown_error: 'Cloudflare API をリクエスト中に不明なエラーが発生しました',
  protected_application_only: 'この機能は保護されたアプリケーションにのみ利用可能です。',
  protected_application_misconfigured: '保護されたアプリケーションの設定が間違っています。',
  protected_application_subdomain_exists:
    '保護されたアプリケーションのサブドメインはすでに使用されています。',
  invalid_subdomain: '無効なサブドメイン。',
  custom_domain_not_found: 'カスタムドメインが見つかりません。',
  should_delete_custom_domains_first: 'まずカスタムドメインを削除する必要があります。',
  no_legacy_secret_found: 'アプリケーションにレガシーシークレットがありません。',
  secret_name_exists: 'シークレット名はすでに存在します。',
  saml: {
    /** UNTRANSLATED */
    use_saml_app_api: 'Use `[METHOD] /saml-applications(/.*)?` API to operate SAML app.',
    /** UNTRANSLATED */
    saml_application_only: 'The API is only available for SAML applications.',
    /** UNTRANSLATED */
    acs_url_binding_not_supported:
      'Only HTTP-POST binding is supported for receiving SAML assertions.',
    /** UNTRANSLATED */
    can_not_delete_active_secret: 'Can not delete the active secret.',
    /** UNTRANSLATED */
    no_active_secret: 'No active secret found.',
    /** UNTRANSLATED */
    entity_id_required: 'Entity ID is required to generate metadata.',
    /** UNTRANSLATED */
    name_id_format_required: 'Name ID format is required.',
    /** UNTRANSLATED */
    unsupported_name_id_format: 'Unsupported name ID format.',
    /** UNTRANSLATED */
    missing_email_address: 'User does not have an email address.',
    /** UNTRANSLATED */
    email_address_unverified: 'User email address is not verified.',
    /** UNTRANSLATED */
    invalid_certificate_pem_format: 'Invalid PEM certificate format',
    /** UNTRANSLATED */
    acs_url_required: 'Assertion Consumer Service URL is required.',
    /** UNTRANSLATED */
    private_key_required: 'Private key is required.',
    /** UNTRANSLATED */
    certificate_required: 'Certificate is required.',
    /** UNTRANSLATED */
    invalid_saml_request: 'Invalid SAML authentication request.',
    /** UNTRANSLATED */
    auth_request_issuer_not_match:
      'The issuer of the SAML authentication request mismatch with service provider entity ID.',
    /** UNTRANSLATED */
    sp_initiated_saml_sso_session_not_found_in_cookies:
      'Service provider initiated SAML SSO session ID not found in cookies.',
    /** UNTRANSLATED */
    sp_initiated_saml_sso_session_not_found:
      'Service provider initiated SAML SSO session not found.',
    /** UNTRANSLATED */
    state_mismatch: '`state` mismatch.',
  },
};

export default Object.freeze(application);
