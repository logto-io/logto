const quota_table = {
  quota: {
    title: '配額',
    tenant_limit: '租戶限制',
    base_price: '基本價格',
    mau_unit_price: '* MAU 單位價格',
    mau_limit: 'MAU 限制',
  },
  application: {
    title: '應用程式',
    total: '總數',
    m2m: '機器對機器',
  },
  resource: {
    title: 'API 資源',
    resource_count: '資源數量',
    scopes_per_resource: '資源每個權限',
  },
  branding: {
    title: '品牌',
    custom_domain: '自訂網域',
  },
  user_authn: {
    title: '用戶身份驗證',
    omni_sign_in: 'Omni 登入',
    built_in_email_connector: '內建電子郵件連接器',
    social_connectors: '社交連接器',
    standard_connectors: '標準連接器',
  },
  roles: {
    title: '角色',
    roles: '角色',
    scopes_per_role: '角色每個權限',
  },
  audit_logs: {
    title: '審核日誌',
    retention: '保留',
  },
  hooks: {
    title: 'Hooks',
    amount: '數量',
  },
  support: {
    title: '支援',
    community: '社群',
    customer_ticket: '客戶工單',
    premium: '高級',
  },
  mau_unit_price_footnote:
    '* 我們的單價可能因實際消耗的資源而有所變動，並且 Logto 保留隨時解釋單價變動的權利。',
  unlimited: '無限制',
  contact: '聯絡我們',
  // eslint-disable-next-line no-template-curly-in-string
  monthly_price: '${{value, number}}/月',
  // eslint-disable-next-line no-template-curly-in-string
  mau_price: '${{value, number}}/MAU',
  days_one: '{{count, number}} 天',
  days_other: '{{count, number}} 天',
  add_on: '附加',
};

export default quota_table;
