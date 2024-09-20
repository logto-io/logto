const add_on = {
  mfa_inline_notification:
    'MFA 是 {{planName}} 的每月 ${{price, number}} 附加功能。第一個月根據你的計費週期按比例計算。<a>了解更多</a>',
  footer: {
    api_resource:
      '附加資源每月每個 ${{price, number}}。第一個月根據你的計費週期按比例計算。<a>了解更多</a>',
    machine_to_machine_app:
      '附加機器對機器應用每月每個 ${{price, number}}。第一個月根據你的計費週期按比例計算。<a>了解更多</a>',
    enterprise_sso:
      'Enterprise SSO 是 {{planName}} 的每月每個 ${{price, number}} 附加功能。第一個月根據你的計費週期按比例計算。<a>了解更多</a>',
    tenant_members:
      '附加成員每月每個 ${{price, number}}。第一個月根據你的計費週期按比例計算。<a>了解更多</a>',
    organization:
      'Organization 是 {{planName}} 的每月 ${{price, number}} 附加功能，具有無限的組織數。第一個月根據你的計費週期按比例計算。<a>了解更多</a>',
  },
};

export default Object.freeze(add_on);
