const quota_table = {
  quota: {
    title: 'クォータ',
    tenant_limit: 'テナント制限',
    base_price: '基本価格',
    mau_unit_price: '* MAU単価',
    mau_limit: 'MAU制限',
  },
  application: {
    title: 'アプリケーション',
    total: '総アプリケーション数',
    m2m: 'マシン・ツー・マシン',
  },
  resource: {
    title: 'APIリソース',
    resource_count: 'リソース数',
    scopes_per_resource: 'リソースごとの権限',
  },
  branding: {
    title: 'UIとブランディング',
    custom_domain: 'カスタムドメイン',
    custom_css: 'カスタムCSS',
    app_logo_and_favicon: 'アプリロゴとFavicon',
    dark_mode: 'ダークモード',
    i18n: '国際化',
  },
  user_authn: {
    title: 'ユーザー認証',
    omni_sign_in: 'オムニサインイン',
    password: 'パスワード',
    passwordless: 'パスワードレス - E-mailとSMS',
    email_connector: 'E-mailコネクタ',
    sms_connector: 'SMSコネクタ',
    social_connectors: 'ソーシャルコネクタ',
    standard_connectors: 'スタンダードコネクタ',
    built_in_email_connector: '組み込みE-mailコネクタ',
  },
  user_management: {
    title: 'ユーザー管理',
    user_management: 'ユーザー管理',
    roles: 'ロール',
    scopes_per_role: 'ロールごとの権限',
  },
  audit_logs: {
    title: '監査ログ',
    retention: '保持期間',
  },
  hooks: {
    title: 'ウェブフック',
    hooks: 'ウェブフック',
  },
  support: {
    title: 'サポート',
    community: 'コミュニティ',
    customer_ticket: 'サポートチケット',
    premium: 'プレミアム',
  },
  mau_unit_price_footnote:
    '* 月間アクティブユーザー（MAU）は、請求サイクル中のログイン頻度に基づいて3つの階層に分かれます。各階層ごとに異なるMAU単価が適用されます。',
  unlimited: '無制限',
  contact: 'お問い合わせ',
  // eslint-disable-next-line no-template-curly-in-string
  monthly_price: '${{value, number}}/mo',
  // eslint-disable-next-line no-template-curly-in-string
  mau_price: '${{value, number}}/MAU',
  days_one: '{{count, number}}日',
  days_other: '{{count, number}}日',
  add_on: 'アドオン',
};

export default quota_table;
