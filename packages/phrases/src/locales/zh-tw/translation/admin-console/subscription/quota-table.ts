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
    sso: '企業SSO（2023年第4季）',
  },
  user_management: {
    title: '使用者管理',
    user_management: '使用者管理',
    roles: '角色',
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
    /** UNTRANSLATED */
    organizations: 'Organizations',
  },
  support: {
    title: '支援',
    community: '社群',
    customer_ticket: '客戶支援票證',
    premium: '進階版',
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
};

export default Object.freeze(quota_table);
