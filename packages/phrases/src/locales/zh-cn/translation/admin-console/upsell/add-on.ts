const add_on = {
  mfa_inline_notification:
    'MFA 是 {{planName}} 的一个每月 ${{price, number}} 的附加功能。第一个月根据你的计费周期按比例收费。<a>了解更多</a>',
  security_features_inline_notification:
    '启用 CAPTCHA、自定义锁定体验和其他高级安全功能——所有功能均包含在一个附加功能包中，每月仅需 ${{price, number}}。',
  footer: {
    api_resource:
      '额外资源的费用是 <span>每月 / 每个 ${{price, number}}</span>。第一个月根据你的计费周期按比例收费。<a>了解更多</a>',
    machine_to_machine_app:
      '额外的机器对机器应用程序的费用是 <span>每月 / 每个 ${{price, number}}</span>。第一个月根据你的计费周期按比例收费。<a>了解更多</a>',
    enterprise_sso:
      '企业 SSO 是 {{planName}} 的一个每月 / 每个 <span>${{price, number}}</span> 的附加功能。第一个月根据你的计费周期按比例收费。<a>了解更多</a>',
    tenant_members:
      '额外成员的费用是 <span>每月 / 每个 ${{price, number}}</span>。第一个月根据你的计费周期按比例收费。<a>了解更多</a>',
    organization:
      '组织是 {{planName}} 的一个每月 <span>${{price, number}}</span> 的附加功能，可提供无限制的组织。第一个月根据你的计费周期按比例收费。<a>了解更多</a>',
    saml_apps:
      '额外的 SAML 应用程序的费用是 <span>每月 / 每个 ${{price, number}}</span>。第一个月根据你的计费周期按比例收费。<a>了解更多</a>',
    third_party_apps:
      '额外的第三方应用程序的费用是 <span>每月 / 每个 ${{price, number}}</span>。第一个月根据你的计费周期按比例收费。<a>了解更多</a>',
    roles:
      '基于角色的访问控制是一个 Pro 计划的每月 <span>${{price, number}}</span> 的附加功能，具有无限制的角色。第一个月根据你的计费周期按比例收费。<a>了解更多</a>',
  },
};

export default Object.freeze(add_on);
