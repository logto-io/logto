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
    /** UNTRANSLATED */
    third_party: 'Third-party apps',
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
    mfa: '多要素認証',
    sso: 'エンタープライズ SSO',
    adaptive_mfa: '適応型MFA',
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
    monthly_active_organization: '月間アクティブ組織',
    allowed_users_per_org: '組織ごとの許可ユーザー数',
    invitation: '招待状',
    org_roles: '組織ロール',
    org_permissions: '組織権限',
    just_in_time_provisioning: 'ジャストインタイムプロビジョニング',
  },
  support: {
    title: 'コンプライアンスとサポート',
    community: 'コミュニティ',
    customer_ticket: 'カスタマーチケット',
    premium: 'プレミアム',
    email_ticket_support: 'Emailチケットサポート',
    soc2_report: 'SOC2レポート',
    hipaa_or_baa_report: 'HIPAA/BAAレポート',
  },
  developers_and_platform: {
    /** UNTRANSLATED */
    title: 'Developers and platform',
    /** UNTRANSLATED */
    hooks: 'Webhooks',
    /** UNTRANSLATED */
    audit_logs_retention: 'Audit logs retention',
    /** UNTRANSLATED */
    jwt_claims: 'JWT claims',
    /** UNTRANSLATED */
    tenant_members: 'Tenant members',
  },
  unlimited: '無制限',
  contact: 'お問い合わせ',
  monthly_price: '${{value, number}}/mo',
  days_one: '{{count, number}}日',
  days_other: '{{count, number}}日',
  add_on: 'アドオン',
  tier: 'レベル{{value, number}}: ',
  paid_token_limit_tip:
    'Logtoは、クォータ制限を超える機能に対して料金を追加します。2024年第2四半期ごろから課金を開始するまで無料でご利用いただけます。トークンがさらに必要な場合は、お問い合わせください。デフォルトでは、100万トークンごとに月額80ドルを請求します。',
  paid_quota_limit_tip:
    'Logtoはクォータ制限を超える機能に対して料金を追加します。2024年第2四半期ごろまでは無料でご利用いただけます。',
  paid_add_on_feature_tip:
    'これはアドオン機能です。2024年第2四半期ごろまでは無料でご利用いただけます。',
  million: '{{value, number}} 万',
  mau_tip:
    'MAU（月間アクティブユーザー）は、請求サイクルでLogtoと少なくとも1つのトークンを交換したユニークユーザーの数を指します。',
  tokens_tip:
    'Logtoによって発行されたすべての種類のトークン、アクセストークン、リフレッシュトークンなどを含みます。',
  mao_tip:
    'MAO（月間アクティブ組織）は、請求サイクル内で少なくとも1つのMAU（月間アクティブユーザー）を持つユニークな組織の数を意味します。',
  /** UNTRANSLATED */
  third_party_tip:
    'Use Logto as your OIDC identity provider for third-party app sign-ins and permission grants.',
  included: '{{value, number}} 込み',
  included_mao: '{{value, number}} MAO込み',
  extra_quota_price: 'その後、各${{value, number}} / 月ごと',
  per_month_each: '各${{value, number}} / 月ごと',
  extra_mao_price: 'その後、MAOごとに${{value, number}}',
  per_month: '${{value, number}} / 月ごと',
  /** UNTRANSLATED */
  per_member: 'Then ${{value, number}} per member',
};

export default Object.freeze(quota_table);
