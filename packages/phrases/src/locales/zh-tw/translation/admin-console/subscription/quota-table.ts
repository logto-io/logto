const quota_table = {
  quota: {
    title: '配額',
    tenant_limit: '租戶限制',
    base_price: '基本價格',
    mau_unit_price: '* 每月活躍使用者（MAU）單價',
    mau_limit: 'MAU 限制',
  },
  application: {
    title: '應用程式',
    total: '總應用程式數',
    m2m: '機器對機器',
  },
  resource: {
    title: 'API 資源',
    resource_count: '資源數量',
    scopes_per_resource: '每資源權限',
  },
  branding: {
    title: '使用者介面和品牌塑造',
    custom_domain: '自訂網域',
    custom_css: '自訂 CSS',
    app_logo_and_favicon: '應用程式標誌和網站圖示',
    dark_mode: '深色模式',
    i18n: '國際化',
  },
  user_authn: {
    title: '使用者認證',
    omni_sign_in: '全渠道登錄',
    password: '密碼',
    passwordless: '免密碼登入 - 電子郵件和簡訊',
    email_connector: '電子郵件連接器',
    sms_connector: '簡訊連接器',
    social_connectors: '社交連接器',
    standard_connectors: '標準連接器',
    built_in_email_connector: '內建電子郵件連接器',
    mfa: '多因素認證',
    sso: '企業 SSO',
  },
  user_management: {
    title: '使用者管理',
    user_management: '使用者管理',
    roles: '角色',
    machine_to_machine_roles: '機器對機器角色',
    scopes_per_role: '每角色權限',
  },
  audit_logs: {
    title: '稽核日誌',
    retention: '保留期限',
  },
  hooks: {
    title: 'Webhooks',
    hooks: 'Webhooks',
  },
  organizations: {
    title: '組織',
    organizations: '組織',
    monthly_active_organization: '每月活躍組織',
    allowed_users_per_org: '組織允許用戶數',
    invitation: '邀請（即將推出）',
    org_roles: '組織角色',
    org_permissions: '組織權限',
    just_in_time_provisioning: '即時供應管理',
  },
  support: {
    /** UNTRANSLATED */
    title: 'Compliance and support',
    community: '社群',
    customer_ticket: '客戶支援票證',
    premium: '進階版',
    /** UNTRANSLATED */
    email_ticket_support: 'Email ticket support',
    /** UNTRANSLATED */
    soc2_report: 'SOC2 report (Coming soon)',
    /** UNTRANSLATED */
    hipaa_or_baa_report: 'HIPAA/BAA report (Coming soon)',
  },
  mau_unit_price_footnote:
    '* 您的每月活躍使用者（MAU）將根據在結算週期內登錄的頻率分為3個層級。每個層級都有不同的MAU單價。',
  unlimited: '無限制',
  contact: '聯絡',
  monthly_price: '${{value, number}}/月',
  mau_price: '${{value, number}}/MAU',
  days_one: '{{count, number}} 天',
  days_other: '{{count, number}} 天',
  add_on: '附加功能',
  tier: '層級{{value, number}}：',
  free_token_limit_tip: '免費發行 {{value}}M 標記。',
  paid_token_limit_tip:
    '免費發行 {{value}}M 標記。一旦我們確定價格，如果您超過 {{value}}M 標記，我們可能會加收費用。',
  paid_quota_limit_tip:
    '一旦我們確定價格，如果您超出配額限制的功能，我們可能會將其作為附加功能收費。',
  beta_feature_tip: '在測試版階段免費使用。一旦我們確定附加功能的定價，我們將開始收費。',
  usage_based_beta_feature_tip:
    '在測試版階段免費使用。一旦我們確定組織使用量的定價，我們將開始收費。',
  beta: '測試版',
  add_on_beta: '附加功能（測試版）',
};

export default Object.freeze(quota_table);
