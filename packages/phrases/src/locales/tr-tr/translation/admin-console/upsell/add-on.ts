const add_on = {
  mfa_inline_notification:
    'MFA, {{planName}} için aylık ${{price, number}} tutarında ek bir özelliktir. İlk ay faturalandırma döngünüze göre orantılı olarak hesaplanır. <a>Daha fazla bilgi edinin</a>',
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
  },
};

export default Object.freeze(add_on);
