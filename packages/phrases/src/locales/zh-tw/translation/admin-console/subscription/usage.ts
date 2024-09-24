const usage = {
  /** UNTRANSLATED */
  status_active: 'In use',
  /** UNTRANSLATED */
  status_inactive: 'Not in use',
  mau: {
    title: 'MAU',
    description: '{{usage}}',
    tooltip:
      'MAU 是指在計費週期內至少與 Logto 交換過一次令牌的獨立用戶。專業版計劃不受限制。<a>了解更多</a>',
  },
  organizations: {
    title: '組織',
    description: '{{usage}}',
    tooltip: '附加功能，每月固定費用 ${{price, number}}。價格不受組織數量或其活動水平的影響。',
  },
  mfa: {
    title: '多重身份驗證',
    description: '{{usage}}',
    tooltip: '附加功能，每月固定費用 ${{price, number}}。價格不受使用身份驗證因素數量的影響。',
  },
  enterprise_sso: {
    title: '企業單一登入',
    description: '{{usage}}',
    tooltip: '附加功能，每個 SSO 連接每月 ${{price, number}}。',
  },
  api_resources: {
    title: 'API 資源',
    description: '{{usage}} <span>（前三個免費）</span>',
    tooltip: '附加功能，每個資源每月 ${{price, number}}。前三個 API 資源免費。',
  },
  machine_to_machine: {
    title: '機器對機器',
    description: '{{usage}} <span>（首個免費）</span>',
    tooltip: '附加功能，每個應用每月 ${{price, number}}。首個機器對機器應用免費。',
  },
  tenant_members: {
    title: '租戶成員',
    description: '{{usage}} <span>（前三個免費）</span>',
    tooltip: '附加功能，每個成員每月 ${{price, number}}。前三個租戶成員免費。',
  },
  tokens: {
    title: '令牌',
    description: '{{usage}}',
    tooltip: '附加功能，每百萬令牌 ${{price, number}}。前 1 百萬令牌包含在內。',
  },
  hooks: {
    title: '鉤子',
    description: '{{usage}} <span>（前十個免費）</span>',
    tooltip: '附加功能，每個鉤子 ${{price, number}}。前十個鉤子包含在內。',
  },
  pricing: {
    add_on_changes_in_current_cycle_notice:
      '如果在當前計費週期內進行任何變更，下一個月的賬單可能會稍微高一些。它將是 ${{price, number}} 的基礎價格，加上來自當前週期的未計費使用的附加費用，以及下個週期的全額收費。<a>了解更多</a>',
  },
};

export default Object.freeze(usage);
