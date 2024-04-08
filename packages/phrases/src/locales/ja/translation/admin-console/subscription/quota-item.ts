const quota_item = {
  tenant_limit: {
    name: 'テナント',
    limited: '{{count, number}} テナント',
    limited_other: '{{count, number}} テナント',
    unlimited: '無制限のテナント',
    not_eligible: 'テナントを削除してください',
  },
  mau_limit: {
    name: '月間アクティブユーザー数',
    limited: '{{count, number}} MAU',
    unlimited: '無制限のMAU',
    not_eligible: '全てのユーザーを削除してください',
  },
  token_limit: {
    name: 'トークン',
    limited: '{{count, number}} トークン',
    limited_other: '{{count, number}} トークン',
    unlimited: '無制限のトークン',
    not_eligible: '新しいトークンを防ぐためにすべてのユーザーを削除してください',
  },
  applications_limit: {
    name: 'アプリケーション',
    limited: '{{count, number}} アプリケーション',
    limited_other: '{{count, number}} アプリケーション',
    unlimited: '無制限のアプリケーション',
    not_eligible: 'アプリケーションを削除してください',
  },
  machine_to_machine_limit: {
    name: 'マシン間アプリケーション',
    limited: '{{count, number}} マシン間アプリケーション',
    limited_other: '{{count, number}} マシン間アプリケーション',
    unlimited: '無制限のマシン間アプリケーション',
    not_eligible: 'マシン間アプリケーションを削除してください',
  },
  third_party_applications_limit: {
    /** UNTRANSLATED */
    name: 'Third-party apps',
    /** UNTRANSLATED */
    limited: '{{count, number}} third-party app',
    /** UNTRANSLATED */
    limited_other: '{{count, number}} third-party apps',
    /** UNTRANSLATED */
    unlimited: 'Unlimited third-party apps',
    /** UNTRANSLATED */
    not_eligible: 'Remove your third-party apps',
  },
  resources_limit: {
    name: 'APIリソース',
    limited: '{{count, number}} APIリソース',
    limited_other: '{{count, number}} APIリソース',
    unlimited: '無制限のAPIリソース',
    not_eligible: 'APIリソースを削除してください',
  },
  scopes_per_resource_limit: {
    name: 'リソースの権限',
    limited: '{{count, number}} リソースごとの権限',
    limited_other: '{{count, number}} リソースごとの権限',
    unlimited: '無制限のリソースごとの権限',
    not_eligible: 'リソースの権限を削除してください',
  },
  custom_domain_enabled: {
    name: 'カスタムドメイン',
    limited: 'カスタムドメイン',
    unlimited: 'カスタムドメイン',
    not_eligible: 'カスタムドメインを削除してください',
  },
  omni_sign_in_enabled: {
    name: 'Omniサインイン',
    limited: 'Omniサインイン',
    unlimited: 'Omniサインイン',
    not_eligible: 'Omniサインインを無効にしてください',
  },
  built_in_email_connector_enabled: {
    name: '組込みメールコネクタ',
    limited: '組込みメールコネクタ',
    unlimited: '組込みメールコネクタ',
    not_eligible: '組込みメールコネクタを削除してください',
  },
  social_connectors_limit: {
    name: 'ソーシャルコネクタ',
    limited: '{{count, number}} ソーシャルコネクタ',
    limited_other: '{{count, number}} ソーシャルコネクタ',
    unlimited: '無制限のソーシャルコネクタ',
    not_eligible: 'ソーシャルコネクタを削除してください',
  },
  standard_connectors_limit: {
    name: '無料の標準コネクタ',
    limited: '{{count, number}} 無料の標準コネクタ',
    limited_other: '{{count, number}} 無料の標準コネクタ',
    unlimited: '無制限の標準コネクタ',
    not_eligible: '標準コネクタを削除してください',
  },
  roles_limit: {
    name: 'ロール',
    limited: '{{count, number}} ロール',
    limited_other: '{{count, number}} ロール',
    unlimited: '無制限のロール',
    not_eligible: 'ロールを削除してください',
  },
  machine_to_machine_roles_limit: {
    name: 'マシン間ロール',
    limited: '{{count, number}} マシン間ロール',
    limited_other: '{{count, number}} マシン間ロール',
    unlimited: '無制限のマシン間ロール',
    not_eligible: 'マシン間ロールを削除してください',
  },
  scopes_per_role_limit: {
    name: 'ロールの権限',
    limited: '{{count, number}} ロールごとの権限',
    limited_other: '{{count, number}} ロールごとの権限',
    unlimited: '無制限のロールごとの権限',
    not_eligible: 'ロールの権限を削除してください',
  },
  hooks_limit: {
    name: 'Webhooks',
    limited: '{{count, number}}個のWebhook',
    limited_other: '{{count, number}}個のWebhook',
    unlimited: '無制限のWebhook',
    not_eligible: 'Webhookを削除してください',
  },
  organizations_enabled: {
    name: '組織',
    limited: '組織',
    unlimited: '組織',
    not_eligible: 'あなたの組織を削除してください',
  },
  audit_logs_retention_days: {
    name: '監査ログの保持期間',
    limited: '監査ログの保持期間: {{count, number}} 日',
    limited_other: '監査ログの保持期間: {{count, number}} 日',
    unlimited: '無制限の日数',
    not_eligible: '監査ログがありません',
  },
  email_ticket_support: {
    name: 'メールチケットサポート',
    limited: '{{count, number}}時間のメールチケットサポート',
    limited_other: '{{count, number}}時間のメールチケットサポート',
    unlimited: 'メールチケットサポート',
    not_eligible: 'メールチケットサポートなし',
  },
  mfa_enabled: {
    name: '二要素認証',
    limited: '二要素認証',
    unlimited: '二要素認証',
    not_eligible: '二要素認証を削除',
  },
  sso_enabled: {
    name: 'エンタープライズSSO',
    limited: 'エンタープライズSSO',
    unlimited: 'エンタープライズSSO',
    not_eligible: 'エンタープライズSSOを削除してください',
  },
  tenant_members_limit: {
    /** UNTRANSLATED */
    name: 'Tenant members',
    /** UNTRANSLATED */
    limited: '{{count, number}} tenant member',
    /** UNTRANSLATED */
    limited_other: '{{count, number}} tenant members',
    /** UNTRANSLATED */
    unlimited: 'Unlimited tenant members',
    /** UNTRANSLATED */
    not_eligible: 'Remove your tenant members',
  },
};

export default Object.freeze(quota_item);
