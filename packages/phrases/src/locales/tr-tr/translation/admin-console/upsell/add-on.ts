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
    saml_apps:
      'Ek SAML uygulamaları, aylık <span>${{price, number}} / adet</span> tutarındadır. İlk ay faturalandırma döngünüze göre orantılı olarak hesaplanır. <a>Daha fazla bilgi edinin</a>',
    third_party_apps:
      'Ek üçüncü taraf uygulamaları, aylık <span>${{price, number}} / adet</span> tutarındadır. İlk ay faturalandırma döngünüze göre orantılı olarak hesaplanır. <a>Daha fazla bilgi edinin</a>',
    roles:
      'Rol tabanlı erişim kontrolü, sınırsız rol ile Pro plan için aylık <span>${{price, number}}</span> tutarında bir eklentidir. İlk ay faturalandırma döngünüze göre orantılı olarak hesaplanır. <a>Daha fazla bilgi edinin</a>',
  },
};

export default Object.freeze(add_on);
