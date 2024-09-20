const add_on = {
  mfa_inline_notification:
    'MFA 是 {{planName}} 的每月 ${{price, number}} 加購項目。第一個月的費用將根據你的帳單週期按比例計算。<a>了解更多</a>',
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
  },
};

export default Object.freeze(add_on);
