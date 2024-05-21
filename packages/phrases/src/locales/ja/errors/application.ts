const application = {
  invalid_type: '関連するロールを持つことができるのは、マシン間アプリケーションのみです。',
  role_exists: 'ロールID {{roleId}} は、すでにこのアプリケーションに追加されています。',
  invalid_role_type:
    'ユーザータイプのロールをマシン間アプリケーションに割り当てることはできません。',
  invalid_third_party_application_type:
    '伝統的なWebアプリケーションにのみ、サードパーティアプリとしてマークできます。',
  third_party_application_only: 'この機能はサードパーティアプリケーションにのみ利用可能です。',
  user_consent_scopes_not_found: '無効なユーザー同意スコープ。',
  consent_management_api_scopes_not_allowed: '管理APIスコープは許可されていません。',
  protected_app_metadata_is_required: '保護されたアプリケーションメタデータが必要です。',
  protected_app_not_configured:
    '保護されたアプリケーションプロバイダーが構成されていません。この機能はオープンソースバージョンでは利用できません。',
  cloudflare_unknown_error: 'Cloudflare APIをリクエスト中に不明なエラーが発生しました',
  protected_application_only: 'この機能は保護されたアプリケーションにのみ利用可能です。',
  protected_application_misconfigured: '保護されたアプリケーションの設定が間違っています。',
  protected_application_subdomain_exists:
    '保護されたアプリケーションのサブドメインはすでに使用されています。',
  invalid_subdomain: '無効なサブドメイン。',
  custom_domain_not_found: 'カスタムドメインが見つかりません。',
  should_delete_custom_domains_first: 'まずカスタムドメインを削除する必要があります。',
};

export default Object.freeze(application);
