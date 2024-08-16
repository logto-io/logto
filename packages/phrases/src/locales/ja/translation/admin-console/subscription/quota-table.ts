const quota_table = {
  quota: {
    title: '基本',
    base_price: '基本価格',
    mau_limit: 'MAU 制限',
    included_tokens: '含まれるトークン',
  },
  application: {
    title: 'アプリケーション',
    total: '総アプリケーション数',
    m2m: 'マシン・ツー・マシン',
    third_party: 'サードパーティーアプリ',
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
    logo_and_favicon: 'ロゴとファビコン',
    bring_your_ui: '自分のUIを持ち込む',
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
    mfa: '多要素認証',
    sso: 'エンタープライズ SSO',

    impersonation: 'なりすまし',
  },
  user_management: {
    title: 'ユーザー管理',
    user_management: 'ユーザー管理',
    roles: 'ロール',
    machine_to_machine_roles: 'マシン対マシンロール',
    scopes_per_role: 'ロールごとの権限',
  },
  organizations: {
    title: '組織',
    organizations: '組織',
    organization: '組織',
    organization_count: '組織数',
    allowed_users_per_org: '組織ごとのユーザー数',
    invitation: '招待（管理API）',
    org_roles: '組織ロール',
    org_permissions: '組織権限',
    just_in_time_provisioning: 'ジャストインタイムプロビジョニング',
  },
  support: {
    /** UNTRANSLATED */
    title: 'Support',
    community: 'コミュニティ',
    customer_ticket: 'カスタマーチケット',
    premium: 'プレミアム',
    email_ticket_support: 'Emailチケットサポート',
    soc2_report: 'SOC2レポート',
    hipaa_or_baa_report: 'HIPAA/BAAレポート',
  },
  developers_and_platform: {
    title: 'デベロッパーとプラットフォーム',
    hooks: 'Webhooks',
    audit_logs_retention: '監査ログの保持',
    jwt_claims: 'JWTクレーム',
    tenant_members: 'テナントメンバー',
  },
  unlimited: '無制限',
  contact: 'お問い合わせ',
  monthly_price: '${{value, number}}/mo',
  days_one: '{{count, number}} 日',
  days_other: '{{count, number}} 日',
  add_on: 'アドオン',
  tier: 'レベル{{value, number}}: ',

  million: '{{value, number}} 万',
  mau_tip:
    'MAU（月間アクティブユーザー）は、請求サイクルで Logto と少なくとも 1 つのトークンを交換したユニークユーザーの数を指します。',
  tokens_tip:
    'Logto によって発行されたすべての種類のトークン、アクセストークン、リフレッシュトークンなどを含みます。',
  mao_tip:
    'MAO（月間アクティブ組織）は、請求サイクル内で少なくとも 1 つの MAU（月間アクティブユーザー）を持つユニークな組織の数を意味します。',
  third_party_tip:
    'Logto を OIDC アイデンティティプロバイダーとして使用して、サードパーティーアプリケーションのサインインや権限の付与を行います。',
  included: '{{value, number}} 込み',
  included_mao: '{{value, number}} MAO込み',
  extra_quota_price: 'その後、各${{value, number}} / 月ごと',
  per_month_each: '各${{value, number}} / 月ごと',
  extra_mao_price: 'その後、MAOごとに${{value, number}}',
  per_month: '${{value, number}} / 月ごと',
  per_member: 'メンバーごとに ${{value, number}}',
};

export default Object.freeze(quota_table);
