const subscription = {
  free_plan: '免費計劃',
  free_plan_description: '適用於側項目和初始 Logto 試用。無需信用卡。',
  hobby_plan: '業餘計劃',
  hobby_plan_description: '適用於個人開發者或開發環境。',
  pro_plan: '專業計劃',
  pro_plan_description: '讓您的業務無憂無慮地使用 Logto。',
  enterprise: '企業',
  current_plan: '當前計劃',
  current_plan_description:
    '這是您當前的計劃。您可以查看計劃使用情況、下一次帳單並升級到更高的計劃層級（如果需要）。',
  plan_usage: '計劃使用情況',
  plan_cycle: '計劃週期：{{period}}。使用情況將於{{renewDate}}更新。',
  next_bill: '您的下一個帳單',
  next_bill_hint: '要瞭解更多關於計算的信息，請參閱這篇 <a>文章</a>。',
  next_bill_tip:
    '您即將收到的帳單包括下個月計劃的基本價格，以及在不同層級中按月活躍用戶 (MAU) 單價的用量費用。',
  manage_payment: '管理付款',
  overfill_quota_warning: '您已達到配額限制。請升級計劃以防止任何問題的發生。',
  upgrade_pro: '升級到專業版',
  payment_error:
    // eslint-disable-next-line no-template-curly-in-string
    '檢測到付款問題。無法處理先前周期的 ${{price, number}}。請更新付款以避免 Logto 服務暫停。',
  downgrade: '降級',
  current: '當前',
  buy_now: '立即購買',
  contact_us: '聯繫我們',
  quota_table: {
    quota: {
      title: '配額',
      tenant_limit: '租戶限制',
      base_price: '基本價格',
      mau_unit_price: '* 每月活躍用戶（MAU）單價',
      mau_limit: 'MAU 限制',
    },
    application: {
      title: '應用程式',
      total: '總計',
      m2m: '機器對機器',
    },
    resource: {
      title: 'API 資源',
      resource_count: '資源計數',
      scopes_per_resource: '每個資源的權限',
    },
    branding: {
      title: '品牌',
      custom_domain: '自訂域名',
    },
    user_authn: {
      title: '使用者身份驗證',
      omni_sign_in: '全渠道登錄',
      built_in_email_connector: '內建電子郵件連接器',
      social_connectors: '社交連接器',
      standard_connectors: '標準連接器',
    },
    roles: {
      title: '角色',
      roles: '角色',
      scopes_per_role: '每個角色的權限',
    },
    audit_logs: {
      title: '審核日誌',
      retention: '保存期限',
    },
    hooks: {
      title: 'Hooks',
      amount: '數量',
    },
    support: {
      title: '支援',
      community: '社區',
      customer_ticket: '客戶票證',
      premium: '高級',
    },
    mau_unit_price_footnote:
      '* 我們的單價可能根據實際使用的資源而有所變動，Logto 保留解釋單價變動的權利。',
    unlimited: '無限制',
    contact: '聯絡我們',
    // eslint-disable-next-line no-template-curly-in-string
    monthly_price: '每月 ${{value, number}}',
    // eslint-disable-next-line no-template-curly-in-string
    mau_price: '每 MAU ${{value, number}}',
    days_one: '{{count, number}} 天',
    days_other: '{{count, number}} 天',
    add_on: '附加功能',
  },
  downgrade_form: {
    allowed_title: '您確定要降級嗎？',
    allowed_description: '降級到 {{plan}}，您將失去以下優勢。',
    not_allowed_title: '您不符合降級資格',
    not_allowed_description:
      '在降級到 {{plan}} 之前，請確保滿足以下標準。完成和履行要求後，您將符合降級資格。',
    confirm_downgrade: '仍然降級',
  },
};

export default subscription;
