const usage = {
  status_active: 'تشغيل',
  status_inactive: 'إيقاف',
  mau: {
    title: 'MAU',
    description: '{{usage}}',
    tooltip:
      'MAU هو مستخدم فريد قام بتبادل رمز واحد على الأقل مع Logto خلال دورة فوترة. غير محدود لخطة Pro. <a>تعرف أكثر</a>',
  },
  organizations: {
    title: 'المؤسسات',
    description: '{{usage}}',
    tooltip:
      'ميزة إضافية بسعر ثابت قدره ${{price, number}} شهريًا. لا يتأثر السعر بعدد المؤسسات أو مستوى نشاطها.',
  },
  mfa: {
    title: 'MFA',
    description: '{{usage}}',
    tooltip:
      'ميزة إضافية بسعر ثابت قدره ${{price, number}} شهريًا. لا يتأثر السعر بعدد عوامل المصادقة المستخدمة.',
  },
  enterprise_sso: {
    title: 'SSO للشركات',
    description: '{{usage}}',
    tooltip: 'ميزة إضافية بسعر قدره ${{price, number}} للاتصال بواجهة SSO شهريًا.',
  },
  api_resources: {
    title: 'موارد واجهة برمجة التطبيقات',
    description: '{{usage}} <span>(مجانًا لأول 3)</span>',
    tooltip:
      'ميزة إضافية بسعر قدره ${{price, number}} لكل مورد في واجهة برمجة التطبيقات شهريًا. الموارد الأولى 3 مجانية.',
  },
  machine_to_machine: {
    title: 'من الجهاز إلى الجهاز',
    description: '{{usage}} <span>(مجانًا لأول 1)</span>',
    tooltip:
      'ميزة إضافية بسعر قدره ${{price, number}} لكل تطبيق من الجهاز إلى الجهاز شهريًا. التطبيق الأول من الجهاز إلى الجهاز مجاني.',
  },
  tenant_members: {
    title: 'أعضاء المستأجر',
    description: '{{usage}} <span>(مجانًا لأول 3)</span>',
    tooltip:
      'ميزة إضافية بسعر قدره ${{price, number}} لكل عضو في المستأجر شهريًا. الأعضاء الأولى 3 في المستأجر مجانية.',
  },
  tokens: {
    title: 'الرموز',
    description: '{{usage}}',
    tooltip: 'ميزة إضافية بسعر قدره ${{price, number}} لكل مليون رمز. الرموز الأولى مليون مشمولة.',
  },
  hooks: {
    title: 'الخطافات',
    description: '{{usage}} <span>(مجانًا لأول 10)</span>',
    tooltip: 'ميزة إضافية بسعر قدره ${{price, number}} لكل خطاف. الخطافات الأولى 10 مشمولة.',
  },
  pricing: {
    /** UNTRANSLATED */
    add_on_changes_in_current_cycle_notice:
      'If you make any changes during the current billing cycle, your next bill may be slightly higher for the first month after the change. It will be ${{price, number}} base price plus add-on costs for unbilled usage from the current cycle and the full charge for the next cycle. <a>Learn more</a>',
  },
};

export default Object.freeze(usage);
