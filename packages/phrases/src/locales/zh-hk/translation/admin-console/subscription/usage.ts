const usage = {
  status_active: '使用中',
  status_inactive: '未使用中',
  limited_status_quota_description: '(首 {{quota}} 包含在內)',
  unlimited_status_quota_description: '(包含在內)',
  disabled_status_quota_description: '(不包含在內)',
  usage_description_with_unlimited_quota: '{{usage}}<span> (無限使用)</span>',
  usage_description_with_limited_quota: '{{usage}}<span> (首 {{basicQuota}} 包含在內)</span>',
  usage_description_without_quota: '{{usage}}<span> (不包含在內)</span>',
  mau: {
    title: 'MAU',
    tooltip:
      'MAU 是指在一個計費周期內至少與 Logto 交換過一次 Token 的獨立用戶。專業計劃不限量。<a>了解更多</a>',
    tooltip_for_enterprise:
      'MAU 是指在一個計費周期內至少與 Logto 交換過一次 Token 的獨立用戶。企業計劃不限量。',
  },
  organizations: {
    title: '組織',
    tooltip: '附加功能，每月固定費用 ${{price, number}}。費用不受組織數量或其活躍程度影響。',
    description_for_enterprise: '(包含在內)',
    tooltip_for_enterprise:
      '是否包含取決於你的計劃。如果組織功能不在你最初的合約中，當你啟用時將添加到賬單中。附加功能費用為 ${{price, number}}/月，不受組織數量或其活躍程度的影響。',
    tooltip_for_enterprise_with_numbered_basic_quota:
      '你的計劃包含最初的 {{basicQuota}} 個組織免費使用。如果你需要更多，可以按 ${{price, number}} 的固定費率以附加功能形式每月添加，不受組織數量或其活躍程度的影響。',
  },
  mfa: {
    title: '多重身份驗證',
    tooltip: '附加功能，每月固定費用 ${{price, number}}。費用不受使用的驗證因素數量影響。',
    tooltip_for_enterprise:
      '是否包含取決於你的計劃。如果 MFA 功能不在你最初的合約中，當你啟用時將添加到賬單中。附加功能費用為 ${{price, number}}/月，不受使用的驗證因素數量影響。',
  },
  enterprise_sso: {
    title: '企業單一簽入',
    tooltip: '附加功能，每個 SSO 連接每月 ${{price, number}}。',
    tooltip_for_enterprise:
      '附加功能，每個 SSO 連接每月 ${{price, number}}。你的合約計劃中包含前 {{basicQuota}} 個 SSO 並可免費使用。',
  },
  api_resources: {
    title: 'API 資源',
    tooltip: '附加功能，每個資源每月 ${{price, number}}。首 3 個 API 資源免費。',
    tooltip_for_enterprise:
      '你的合約計劃中包含前 {{basicQuota}} 個 API 資源並可免費使用。如果你需要更多，每個 API 資源每月 ${{price, number}}。',
  },
  machine_to_machine: {
    title: '機器對機器',
    tooltip: '附加功能，每個應用程式每月 ${{price, number}}。首個機器對機器應用程式免費。',
    tooltip_for_enterprise:
      '你的合約計劃中包含前 {{basicQuota}} 個機器對機器應用程式免費使用。如果你需要更多，每個應用程式每月 ${{price, number}}。',
  },
  tenant_members: {
    title: '租戶成員',
    tooltip: '附加功能，每位成員每月 ${{price, number}}。首 {{count}} 位租戶成員免費。',
    tooltip_one: '每位租戶成員每月 ${{price, number}} 的附加功能。首 {{count}} 位租戶成員免費。',
    tooltip_other: '每位租戶成員每月 ${{price, number}} 的附加功能。首 {{count}} 位租戶成員免費。',
    tooltip_for_enterprise:
      '你的合約計劃中包含前 {{basicQuota}} 位租戶成員免費使用。如果你需要更多，每位租戶成員每月 ${{price, number}}。',
  },
  tokens: {
    title: '令牌',
    tooltip:
      '附加功能，每 {{tokenLimit}} 次令牌 ${{price, number}}。首 {{basicQuota}} 次令牌已包含在內。',
    tooltip_for_enterprise:
      '你的合約計劃中包含前 {{basicQuota}} 次令牌並可免費使用。如果你需要更多，每 {{tokenLimit}} 次令牌每月 ${{price, number}}。',
  },
  hooks: {
    title: '鉤子',
    tooltip: '附加功能，每個鉤子 ${{price, number}}。首 10 個鉤子已包含在內。',
    tooltip_for_enterprise:
      '你的合約計劃中包含前 {{basicQuota}} 個鉤子並可免費使用。如果你需要更多，每個鉤子每月 ${{price, number}}。',
  },
  security_features: {
    title: '高級安全性',
    tooltip:
      '附加功能，整個高級安全套裝每月 ${{price, number}}，包括 CAPTCHA、標識符鎖定、電子郵件阻止名單等。',
  },
  saml_applications: {
    title: 'SAML 應用程式',
    tooltip: '附加功能，每個 SAML 應用程式每月 ${{price, number}}。',
  },
  third_party_applications: {
    title: '第三方應用程式',
    tooltip: '附加功能，每個應用程式每月 ${{price, number}}。',
  },
  rbacEnabled: {
    title: '角色',
    tooltip: '附加功能，每月固定費用 ${{price, number}}。價格不受全局角色數量影響。',
  },
  pricing: {
    add_on_changes_in_current_cycle_notice:
      '如果你在當前計費周期內做出任何更改，則下個月的費用可能會略高。它將是 ${{price, number}} 的基本價格，加上當前周期未出賬用量的附加費用，以及下個周期的全額費用。<a>了解更多</a>',
  },
};

export default Object.freeze(usage);
