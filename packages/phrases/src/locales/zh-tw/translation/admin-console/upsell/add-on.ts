const add_on = {
  mfa_inline_notification:
    'MFA 是 {{planName}} 的每月 ${{price, number}} 加購項目。第一個月的費用將根據你的帳單週期按比例計算。<a>了解更多</a>',
  security_features_inline_notification:
    '啟用 CAPTCHA、自定義鎖定體驗和其他高級安全功能——全部包含在每月僅需 ${{price, number}} 的附加組合中。',
  footer: {
    api_resource:
      '額外的資源每月每個花費 <span>${{price, number}}</span>。第一個月的費用將根據你的帳單週期按比例計算。<a>了解更多</a>',
    machine_to_machine_app:
      '額外的機器對機器應用程式每月每個花費 <span>${{price, number}}</span>。第一個月的費用將根據你的帳單週期按比例計算。<a>了解更多</a>',
    enterprise_sso:
      '企業單一登入是 {{planName}} 的每月每個 <span>${{price, number}}</span> 加購項目。第一個月的費用將根據你的帳單週期按比例計算。<a>了解更多</a>',
    tenant_members:
      '額外的成員每月每個花費 <span>${{price, number}}</span>。第一個月的費用將根據你的帳單週期按比例計算。<a>了解更多</a>',
    organization:
      '組織是具有無限組織的 {{planName}} 的每月 <span>${{price, number}}</span> 加購項目。第一個月的費用將根據你的帳單週期按比例計算。<a>了解更多</a>',
    saml_apps:
      '額外的 SAML 應用程式每月每個花費 <span>${{price, number}}</span>。第一個月的費用將根據你的帳單週期按比例計算。<a>了解更多</a>',
    third_party_apps:
      '額外的第三方應用程式每月每個花費 <span>${{price, number}}</span>。第一個月的費用將根據你的帳單週期按比例計算。<a>了解更多</a>',
    roles:
      '基於角色的訪問控制是 Pro 計劃中每月 <span>${{price, number}}</span> 的加購項目，具有無限角色。第一個月的費用將根據你的帳單週期按比例計算。<a>了解更多</a>',
  },
};

export default Object.freeze(add_on);
