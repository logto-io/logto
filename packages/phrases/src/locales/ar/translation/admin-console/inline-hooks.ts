const inline_hooks = {
  page_title: 'الخطافات المضمّنة',
  title: 'الخطافات المضمّنة',
  subtitle: 'شغّل تعليمات برمجية مخصصة في نقاط محددة من تدفق المصادقة لتوسيع سلوك Logto.',
  status: {
    not_configured: 'غير مكوّن',
    configured: 'مكوّن',
    enabled: 'مفعّل',
    disabled: 'معطّل',
  },
  hooks: {
    post_first_factor_verification: {
      name: 'بعد التحقق من العامل الأول',
      description: 'شغّل منطقًا مخصصًا بعد التحقق من عامل المصادقة الأول وقبل متابعة تسجيل الدخول.',
    },
    post_sign_in: {
      name: 'بعد تسجيل الدخول',
      description: 'شغّل منطقًا مخصصًا بعد تسجيل دخول المستخدم بنجاح.',
    },
  },
};

export default Object.freeze(inline_hooks);
