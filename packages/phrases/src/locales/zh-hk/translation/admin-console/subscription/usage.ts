const usage = {
  /** UNTRANSLATED */
  status_active: 'In use',
  /** UNTRANSLATED */
  status_inactive: 'Not in use',
  mau: {
    title: 'MAU',
    description: '{{usage}}',
    tooltip:
      'MAU 是指在一個計費周期內至少與 Logto 交換過一次 Token 的獨立用戶。專業計劃不限量。<a>了解更多</a>',
  },
  organizations: {
    title: '組織',
    description: '{{usage}}',
    tooltip: '附加功能，每月固定費用 ${{price, number}}。費用不受組織數量或其活躍程度影響。',
  },
  mfa: {
    title: '多重身份驗證',
    description: '{{usage}}',
    tooltip: '附加功能，每月固定費用 ${{price, number}}。費用不受使用的驗證因素數量影響。',
  },
  enterprise_sso: {
    title: '企業單一簽入',
    description: '{{usage}}',
    tooltip: '附加功能，每個 SSO 連接每月 ${{price, number}}。',
  },
  api_resources: {
    title: 'API 資源',
    description: '{{usage}} <span>(首 3 個免費)</span>',
    tooltip: '附加功能，每個資源每月 ${{price, number}}。首 3 個 API 資源免費。',
  },
  machine_to_machine: {
    title: '機器對機器',
    description: '{{usage}} <span>(首 1 個免費)</span>',
    tooltip: '附加功能，每個應用程式每月 ${{price, number}}。首個機器對機器應用程式免費。',
  },
  tenant_members: {
    title: '租戶成員',
    description: '{{usage}} <span>(首 3 個免費)</span>',
    tooltip: '附加功能，每位成員每月 ${{price, number}}。首 3 位租戶成員免費。',
  },
  tokens: {
    title: '令牌',
    description: '{{usage}}',
    tooltip: '附加功能，每百萬次令牌 ${{price, number}}。首百萬次令牌已包含在內。',
  },
  hooks: {
    title: '鉤子',
    description: '{{usage}} <span>(首 10 個免費)</span>',
    tooltip: '附加功能，每個鉤子 ${{price, number}}。首 10 個鉤子已包含在內。',
  },
  pricing: {
    add_on_changes_in_current_cycle_notice:
      '如果你在當前計費周期內做出任何更改，則下個月的費用可能會略高。它將是 ${{price, number}} 的基本價格，加上當前周期未出賬用量的附加費用，以及下個周期的全額費用。<a>了解更多</a>',
  },
};

export default Object.freeze(usage);
