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
    mfa: 'MFA',
    sso: 'エンタープライズ SSO',
  },
  user_management: {
    title: 'ユーザー管理',
    user_management: 'ユーザー管理',
    roles: 'ロール',
    machine_to_machine_roles: 'マシン対マシンロール',
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
  organizations: {
    title: '組織',
    organizations: '組織',
    monthly_active_organization: '月間アクティブ組織',
    allowed_users_per_org: '組織ごとの許可ユーザー数',
    invitation: '招待状（近日公開）',
    org_roles: '組織ロール',
    org_permissions: '組織権限',
    just_in_time_provisioning: 'ジャストインタイムプロビジョニング',
  },
  support: {
    /** UNTRANSLATED */
    title: 'Compliance and support',
    community: 'コミュニティ',
    customer_ticket: 'カスタマーチケット',
    premium: 'プレミアム',
    /** UNTRANSLATED */
    email_ticket_support: 'Email ticket support',
    /** UNTRANSLATED */
    soc2_report: 'SOC2 report (Coming soon)',
    /** UNTRANSLATED */
    hipaa_or_baa_report: 'HIPAA/BAA report (Coming soon)',
  },
  mau_unit_price_footnote:
    '* 月間アクティブユーザー（MAU）は、請求サイクル中のログイン頻度に基づいて3つの階層に分かれます。各階層ごとに異なるMAU単価が適用されます。',
  unlimited: '無制限',
  contact: 'お問い合わせ',
  monthly_price: '${{value, number}}/mo',
  mau_price: '${{value, number}}/MAU',
  days_one: '{{count, number}}日',
  days_other: '{{count, number}}日',
  add_on: 'アドオン',
  tier: 'レベル{{value, number}}: ',
  free_token_limit_tip: '無料 {{value}}M トークン発行。',
  paid_token_limit_tip:
    '無料 {{value}}M トークン発行。価格設定が最終決定した場合、{{value}}M トークンを超えると追加料金が発生する可能性があります。',
  paid_quota_limit_tip:
    '価格設定が最終決定した場合、クォータ制限を超える機能について追加料金が発生することがあります。',
  beta_feature_tip:
    'ベータフェーズ中は無料です。アドオンの価格設定が最終決定した後、請求を開始します。',
  usage_based_beta_feature_tip:
    'ベータフェーズ中は無料です。組織の使用に基づく価格設定が最終決定した後、請求を開始します。',
  beta: 'ベータ',
  add_on_beta: 'アドオン（ベータ版）',
};

export default Object.freeze(quota_table);
