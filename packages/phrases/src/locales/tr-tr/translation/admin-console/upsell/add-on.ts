const add_on = {
  mfa_inline_notification:
    'MFA, {{planName}} için aylık ${{price, number}} tutarında ek bir özelliktir. İlk ay faturalandırma döngünüze göre orantılı olarak hesaplanır. <a>Daha fazla bilgi edinin</a>',
  security_features_inline_notification:
    "CAPTCHA'yı etkinleştirin, özel kilitleme deneyimi ve diğer gelişmiş güvenlik özelliklerini ayda sadece ${{price, number}} karşılığında ek bir paket içinde alın.",
  footer: {
    api_resource:
      'Ek kaynaklar aylık <span>${{price, number}} / adet</span> tutarındadır. İlk ay faturalandırma döngünüze göre orantılı olarak hesaplanır. <a>Daha fazla bilgi edinin</a>',
    machine_to_machine_app:
      'Ek makineden makineye uygulamalar aylık <span>${{price, number}} / adet</span> tutarındadır. İlk ay faturalandırma döngünüze göre orantılı olarak hesaplanır. <a>Daha fazla bilgi edinin</a>',
    enterprise_sso:
      '{{planName}} için kurumsal SSO, aylık <span>${{price, number}} / adet</span> tutarında ek bir özelliktir. İlk ay faturalandırma döngünüze göre orantılı olarak hesaplanır. <a>Daha fazla bilgi edinin</a>',
    tenant_members:
      'Ek üyeler aylık <span>${{price, number}} / adet</span> tutarındadır. İlk ay faturalandırma döngünüze göre orantılı olarak hesaplanır. <a>Daha fazla bilgi edinin</a>',
    organization:
      'Organizasyonlar, {{planName}} için sınırsız organizasyon içeren aylık <span>${{price, number}}</span> tutarında ek bir özelliktir. İlk ay faturalandırma döngünüze göre orantılı olarak hesaplanır. <a>Daha fazla bilgi edinin</a>',
    /** UNTRANSLATED */
    saml_apps:
      'Additional SAML apps cost <span>${{price, number}} per mo / ea</span>. First month prorated based on your billing cycle. <a>Learn more</a>',
    /** UNTRANSLATED */
    third_party_apps:
      'Additional third-party apps cost <span>${{price, number}} per mo / ea</span>. First month prorated based on your billing cycle. <a>Learn more</a>',
  },
};

export default Object.freeze(add_on);
