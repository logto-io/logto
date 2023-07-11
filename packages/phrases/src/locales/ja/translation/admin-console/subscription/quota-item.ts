const quota_item = {
  tenant_limit: {
    name: 'テナント',
    limited: '{{count, number}} テナント',
    limited_other: '{{count, number}} テナント',
    unlimited: '無制限のテナント',
  },
  mau_limit: {
    name: '月間アクティブユーザー数',
    limited: '{{count, number}} MAU',
    unlimited: '無制限のMAU',
  },
  applications_limit: {
    name: 'アプリケーション',
    limited: '{{count, number}} アプリケーション',
    limited_other: '{{count, number}} アプリケーション',
    unlimited: '無制限のアプリケーション',
  },
  machine_to_machine_limit: {
    name: 'マシン間通信',
    limited: '{{count, number}} マシン間通信アプリ',
    limited_other: '{{count, number}} マシン間通信アプリ',
    unlimited: '無制限のマシン間通信アプリ',
  },
  resources_limit: {
    name: 'APIリソース',
    limited: '{{count, number}} APIリソース',
    limited_other: '{{count, number}} APIリソース',
    unlimited: '無制限のAPIリソース',
  },
  scopes_per_resource_limit: {
    name: 'リソース権限',
    limited: '{{count, number}} リソース権限',
    limited_other: '{{count, number}} リソース権限',
    unlimited: '無制限のリソース権限',
  },
  custom_domain_enabled: {
    name: 'カスタムドメイン',
    limited: 'カスタムドメイン',
    unlimited: 'カスタムドメイン',
  },
  omni_sign_in_enabled: {
    name: 'Omniサインイン',
    limited: 'Omniサインイン',
    unlimited: 'Omniサインイン',
  },
  built_in_email_connector_enabled: {
    name: '組み込みの電子メールコネクタ',
    limited: '組み込みの電子メールコネクタ',
    unlimited: '組み込みの電子メールコネクタ',
  },
  social_connectors_limit: {
    name: 'ソーシャルコネクタ',
    limited: '{{count, number}} ソーシャルコネクタ',
    limited_other: '{{count, number}} ソーシャルコネクタ',
    unlimited: '無制限のソーシャルコネクタ',
  },
  standard_connectors_limit: {
    name: '無料のスタンダードコネクタ',
    limited: '{{count, number}} 無料のスタンダードコネクタ',
    limited_other: '{{count, number}} 無料のスタンダードコネクタ',
    unlimited: '無制限のスタンダードコネクタ',
  },
  roles_limit: {
    name: 'ロール',
    limited: '{{count, number}} ロール',
    limited_other: '{{count, number}} ロール',
    unlimited: '無制限のロール',
  },
  scopes_per_role_limit: {
    name: 'ロール権限',
    limited: '{{count, number}} ロール権限',
    limited_other: '{{count, number}} ロール権限',
    unlimited: '無制限のロール権限',
  },
  hooks_limit: {
    name: 'Hooks',
    limited: '{{count, number}} フック',
    limited_other: '{{count, number}} フック',
    unlimited: '無制限のフック',
  },
  audit_logs_retention_days: {
    name: '監査ログの保持期間',
    limited: '監査ログの保持期間: {{count, number}} 日',
    limited_other: '監査ログの保持期間: {{count, number}} 日',
    unlimited: '無制限の日数',
  },
  community_support_enabled: {
    name: 'コミュニティのサポート',
    limited: 'コミュニティのサポート',
    unlimited: 'コミュニティのサポート',
  },
  customer_ticket_support: {
    name: 'カスタマーチケットサポート',
    limited: '{{count, number}} 時間のカスタマーチケットサポート',
    limited_other: '{{count, number}} 時間のカスタマーチケットサポート',
    unlimited: 'カスタマーチケットサポート',
  },
};

export default quota_item;
