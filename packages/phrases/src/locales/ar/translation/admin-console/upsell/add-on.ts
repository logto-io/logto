const add_on = {
  mfa_inline_notification:
    'MFA هو إضافة بتكلفة ${{price, number}} شهريًا لخطة {{planName}}. الشهر الأول محسوب استنادًا إلى دورة الفوترة الخاصة بك. <a>تعرف أكثر</a>',
  /** UNTRANSLATED */
  security_features_inline_notification:
    'Enable CAPTCHA, custom lockout experience, and other advanced security features—all included in an add-on bundle for just ${{price, number}}/month.',
  footer: {
    api_resource:
      'تكلف الموارد الإضافية <span>${{price, number}} شهريًا / لكل واحدة</span>. الشهر الأول محسوب استنادًا إلى دورة الفوترة الخاصة بك. <a>تعرف أكثر</a>',
    machine_to_machine_app:
      'تكلف التطبيقات الإضافية للتواصل بين الآلات <span>${{price, number}} شهريًا / لكل واحدة</span>. الشهر الأول محسوب استنادًا إلى دورة الفوترة الخاصة بك. <a>تعرف أكثر</a>',
    enterprise_sso:
      'تكلفة تسجيل الدخول الموحد للمؤسسات <span>${{price, number}} شهريًا / لكل واحدة</span> إضافة لخطة {{planName}}. الشهر الأول محسوب استنادًا إلى دورة الفوترة الخاصة بك. <a>تعرف أكثر</a>',
    tenant_members:
      'تكلف الأعضاء الإضافيين <span>${{price, number}} شهريًا / لكل واحدة</span>. الشهر الأول محسوب استنادًا إلى دورة الفوترة الخاصة بك. <a>تعرف أكثر</a>',
    organization:
      'المنظمة هي إضافة بتكلفة <span>${{price, number}} شهريًا / لكل واحدة</span> لخطة {{planName}}. الشهر الأول محسوب استنادًا إلى دورة الفوترة الخاصة بك. <a>تعرف أكثر</a>',
  },
};

export default Object.freeze(add_on);
