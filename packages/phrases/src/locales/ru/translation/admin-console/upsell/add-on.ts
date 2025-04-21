const add_on = {
  mfa_inline_notification:
    'MFA стоит ${{price, number}} в месяц в дополнение к {{planName}}. Первый месяц рассчитывается пропорционально в зависимости от вашего расчетного цикла. <a>Узнайте больше</a>',
  /** UNTRANSLATED */
  security_features_inline_notification:
    'Enable CAPTCHA, custom lockout experience, and other advanced security features—all included in an add-on bundle for just ${{price, number}}/month.',
  footer: {
    api_resource:
      'Дополнительные ресурсы стоят <span>${{price, number}} в месяц / каждый</span>. Первый месяц рассчитывается пропорционально в зависимости от вашего расчетного цикла. <a>Узнайте больше</a>',
    machine_to_machine_app:
      'Дополнительные приложения между машинами стоят <span>${{price, number}} в месяц / каждое</span>. Первый месяц рассчитывается пропорционально в зависимости от вашего расчетного цикла. <a>Узнайте больше</a>',
    enterprise_sso:
      'Enterprise SSO стоит <span>${{price, number}} в месяц / каждое</span> в дополнение к {{planName}}. Первый месяц рассчитывается пропорционально в зависимости от вашего расчетного цикла. <a>Узнайте больше</a>',
    tenant_members:
      'Дополнительные участники стоят <span>${{price, number}} в месяц / каждый</span>. Первый месяц рассчитывается пропорционально в зависимости от вашего расчетного цикла. <a>Узнайте больше</a>',
    organization:
      'Организация стоит <span>${{price, number}} в месяц</span> в дополнение к {{planName}} с неограниченным количеством организаций. Первый месяц рассчитывается пропорционально в зависимости от вашего расчетного цикла. <a>Узнайте больше</a>',
  },
};

export default Object.freeze(add_on);
