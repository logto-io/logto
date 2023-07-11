const quota_table = {
  quota: {
    title: 'クオータ',
    tenant_limit: 'テナント制限',
    base_price: '基本価格',
    mau_unit_price: '* MAU単価',
    mau_limit: 'MAU制限',
  },
  application: {
    title: 'アプリケーション',
    total: '合計',
    m2m: '機械間',
  },
  resource: {
    title: 'APIリソース',
    resource_count: 'リソース数',
    scopes_per_resource: 'リソースごとの権限',
  },
  branding: {
    title: 'ブランディング',
    custom_domain: 'カスタムドメイン',
  },
  user_authn: {
    title: 'ユーザー認証',
    omni_sign_in: 'オムニサインイン',
    built_in_email_connector: '組み込みメールコネクタ',
    social_connectors: 'ソーシャルコネクタ',
    standard_connectors: '標準コネクタ',
  },
  roles: {
    title: 'ロール',
    roles: 'ロール',
    scopes_per_role: 'ロールごとの権限',
  },
  audit_logs: {
    title: '監査ログ',
    retention: '保持期間',
  },
  hooks: {
    title: 'フック',
    amount: '量',
  },
  support: {
    title: 'サポート',
    community: 'コミュニティ',
    customer_ticket: '顧客チケット',
    premium: 'プレミアム',
  },
  mau_unit_price_footnote:
    '* 実際に消費されるリソースに基づいて単価が変動する場合があり、Logtoは単価変更の説明をする権利を留保します。',
  unlimited: '無制限',
  contact: '連絡先',
  // eslint-disable-next-line no-template-curly-in-string
  monthly_price: '月額${{value, number}}',
  // eslint-disable-next-line no-template-curly-in-string
  mau_price: 'MAUあたり${{value, number}}',
  days_one: '{{count, number}} 日',
  days_other: '{{count, number}} 日',
  add_on: 'アドオン',
};

export default quota_table;
