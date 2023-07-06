const subscription = {
  free_plan: '免費計劃',
  free_plan_description: '用於側專案和初步的 Logto 試驗。無需信用卡。',
  hobby_plan: '業餘計劃',
  hobby_plan_description: '適用於個人開發者或開發環境。',
  pro_plan: '專業計劃',
  pro_plan_description: '讓企業輕鬆受益於 Logto。',
  enterprise: '企業',
  current_plan: '當前計劃',
  current_plan_description:
    '這是您當前的計劃。您可以查看計劃使用情況、下一個帳單並升級到更高級別的計劃（如果需要）。',
  plan_usage: '計劃使用情況',
  plan_cycle: '計劃週期：{{period}}。使用情況會在 {{renewDate}} 更新。',
  next_bill: '您的下一個帳單',
  next_bill_hint: '要了解更多有關計算方式的信息，請參閱此<a>文章</a>。',
  next_bill_tip:
    '您的即將到期的帳單包括下個月計劃的基本價格，以及使用量乘以各級別的 MAU 單價的費用。',
  manage_payment: '管理付款',
  overfill_quota_warning: '您已達到配額限制。為防止任何問題，請升級計劃。',
  upgrade_pro: '升級到專業版',
  payment_error:
    // eslint-disable-next-line no-template-curly-in-string
    '檢測到付款問題。無法處理上一個週期的價格 ${{price, number}}。請更新付款方式，以避免 Logto 服務暫停。',
  downgrade: '降級',
  current: '當前',
  buy_now: '立即購買',
  contact_us: '聯繫我們',
  quota_table: {
    quota: {
      title: '配額',
      tenant_limit: '租戶限制',
      base_price: '基本價格',
      mau_unit_price: '* MAU 單價',
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
      scopes_per_resource: '每個資源的權限',
    },
    branding: {
      title: '品牌',
      custom_domain: '自訂域名',
    },
    user_authn: {
      title: '用戶身份驗證',
      omni_sign_in: 'Omni 登錄',
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
      title: '審計日誌',
      retention: '保留期',
    },
    hooks: {
      title: '鉤子',
      amount: '數量',
    },
    support: {
      title: '支援',
      community: '社群',
      customer_ticket: '客戶票',
      premium: '進階版',
    },
    mau_unit_price_footnote:
      '* 我們的單價可能會根據實際使用的資源而有所變動，Logto 保留解釋單價變動的權利。',
    unlimited: '無限',
    contact: '聯絡',
    // eslint-disable-next-line no-template-curly-in-string
    monthly_price: '${{value, number}}/每月',
    // eslint-disable-next-line no-template-curly-in-string
    mau_price: '${{value, number}}/MAU',
    days_one: '{{count, number}} 天',
    days_other: '{{count, number}} 天',
    add_on: '附加功能',
  },
  downgrade_form: {
    allowed_title: '確定要降級嗎？',
    allowed_description: '降級到{{plan}}後，您將不再享有以下優勢。',
    not_allowed_title: '您不符合降級資格',
    not_allowed_description:
      '在降級到{{plan}}之前，請確保符合以下標準。完成調整並滿足要求後，您將符合降級資格。',
    confirm_downgrade: '無論如何降級',
  },
};

export default subscription;
