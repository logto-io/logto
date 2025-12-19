const application = {
  invalid_type: '関連するロールを持つことができるのは、マシン間アプリケーションのみです。',
  role_exists: 'ロールID {{roleId}} は、すでにこのアプリケーションに追加されています。',
  invalid_role_type:
    'ユーザータイプのロールをマシン間アプリケーションに割り当てることはできません。',
  invalid_third_party_application_type:
    '伝統的な Web アプリケーション、シングルページアプリケーション、ネイティブアプリケーションのみ、サードパーティアプリとしてマークできます。',
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
    use_saml_app_api:
      'SAML アプリを操作するには、`[METHOD] /saml-applications(/.*)?` API を使用します。',
    saml_application_only: 'API は SAML アプリケーションにのみ利用可能です。',
    reach_oss_limit: 'OSS の上限 {{limit}} に達したため、これ以上 SAML アプリを作成できません。',
    acs_url_binding_not_supported:
      'SAML アサーションを受信するには HTTP-POST バインディングのみがサポートされています。',
    can_not_delete_active_secret: 'アクティブなシークレットを削除できません。',
    no_active_secret: 'アクティブなシークレットが見つかりません。',
    entity_id_required: 'メタデータを生成するには、エンティティ ID が必要です。',
    name_id_format_required: '名前 ID フォーマットが必要です。',
    unsupported_name_id_format: 'サポートされていない名前 ID フォーマットです。',
    missing_email_address: 'ユーザーにメールアドレスがありません。',
    email_address_unverified: 'ユーザーのメールアドレスは確認されていません。',
    invalid_certificate_pem_format: '無効な PEM 証明書フォーマット',
    acs_url_required: 'アサーションコンシューマーサービス URL が必要です。',
    private_key_required: '秘密鍵が必要です。',
    certificate_required: '証明書が必要です。',
    invalid_saml_request: '無効な SAML 認証要求です。',
    auth_request_issuer_not_match:
      'SAML 認証要求の発行者がサービスプロバイダーのエンティティ ID と一致しません。',
    sp_initiated_saml_sso_session_not_found_in_cookies:
      'サービスプロバイダーが開始した SAML SSO セッション ID がクッキーに見つかりません。',
    sp_initiated_saml_sso_session_not_found:
      'サービスプロバイダーが開始した SAML SSO セッションが見つかりません。',
    state_mismatch: '`state` が一致しません。',
  },
};

export default Object.freeze(application);
