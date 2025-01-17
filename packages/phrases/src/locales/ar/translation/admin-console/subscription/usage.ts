const usage = {
  /** UNTRANSLATED */
  status_active: 'In use',
  /** UNTRANSLATED */
  status_inactive: 'Not in use',
  /** UNTRANSLATED */
  limited_status_quota_description: '(First {{quota}} included)',
  /** UNTRANSLATED */
  unlimited_status_quota_description: '(Included)',
  /** UNTRANSLATED */
  disabled_status_quota_description: '(Not included)',
  /** UNTRANSLATED */
  usage_description_with_unlimited_quota: '{{usage}}<span> (Unlimited)</span>',
  /** UNTRANSLATED */
  usage_description_with_limited_quota: '{{usage}}<span> (First {{basicQuota}} included)</span>',
  /** UNTRANSLATED */
  usage_description_without_quota: '{{usage}}<span> (Not included)</span>',
  mau: {
    title: 'MAU',
    tooltip:
      'MAU هو مستخدم فريد قام بتبادل رمز واحد على الأقل مع Logto خلال دورة فوترة. غير محدود لخطة Pro. <a>تعرف أكثر</a>',
    /** UNTRANSLATED */
    tooltip_for_enterprise:
      'A MAU is a unique user who has exchanged at least one token with Logto within a billing cycle. Unlimited for the Enterprise Plan.',
  },
  organizations: {
    title: 'المؤسسات',
    tooltip:
      'ميزة إضافية بسعر ثابت قدره ${{price, number}} شهريًا. لا يتأثر السعر بعدد المؤسسات أو مستوى نشاطها.',
    /** UNTRANSLATED */
    description_for_enterprise: '(Included)',
    /** UNTRANSLATED */
    tooltip_for_enterprise:
      'Inclusion depends on your plan. If the organization feature isn’t in your initial contract, it will be added to your bill when you activate it. The add-on costs ${{price, number}}/month, regardless of the number of organizations or their activity.',
    /** UNTRANSLATED */
    tooltip_for_enterprise_with_numbered_basic_quota:
      'Your plan includes the first {{basicQuota}} organizations for free. If you need more, you can add them with the organization add-on at a flat rate of ${{price, number}} per month, regardless of the number of organizations or their activity level.',
  },
  mfa: {
    title: 'MFA',
    tooltip:
      'ميزة إضافية بسعر ثابت قدره ${{price, number}} شهريًا. لا يتأثر السعر بعدد عوامل المصادقة المستخدمة.',
    /** UNTRANSLATED */
    tooltip_for_enterprise:
      'Inclusion depends on your plan. If the MFA feature isn’t in your initial contract, it will be added to your bill when you activate it. The add-on costs ${{price, number}}/month, regardless of the number of authentication factors used.',
  },
  enterprise_sso: {
    title: 'SSO للشركات',
    tooltip: 'ميزة إضافية بسعر قدره ${{price, number}} للاتصال بواجهة SSO شهريًا.',
    /** UNTRANSLATED */
    tooltip_for_enterprise:
      'Add-on feature with a price of ${{price, number}} per SSO connection per month. The first {{basicQuota}} SSO are included and free to use in your contract-based plan.',
  },
  api_resources: {
    title: 'موارد واجهة برمجة التطبيقات',
    tooltip:
      'ميزة إضافية بسعر قدره ${{price, number}} لكل مورد في واجهة برمجة التطبيقات شهريًا. الموارد الأولى 3 مجانية.',
    /** UNTRANSLATED */
    tooltip_for_enterprise:
      'The first {{basicQuota}} API resources are included and free to use in your contract-based plan. If you need more, ${{price, number}} per API resource per month.',
  },
  machine_to_machine: {
    title: 'من الجهاز إلى الجهاز',
    tooltip:
      'ميزة إضافية بسعر قدره ${{price, number}} لكل تطبيق من الجهاز إلى الجهاز شهريًا. التطبيق الأول من الجهاز إلى الجهاز مجاني.',
    /** UNTRANSLATED */
    tooltip_for_enterprise:
      'The first {{basicQuota}} machine-to-machine app is free to use in your contract-based plan. If you need more, ${{price, number}} per app per month.',
  },
  tenant_members: {
    title: 'أعضاء المستأجر',
    tooltip:
      'ميزة إضافية بسعر قدره ${{price, number}} لكل عضو في المستأجر شهريًا. الأعضاء الأولى 3 في المستأجر مجانية.',
    /** UNTRANSLATED */
    tooltip_for_enterprise:
      'The first {{basicQuota}} tenant members are included and free to use in your contract-based plan. If you need more, ${{price, number}} per tenant member per month.',
  },
  tokens: {
    title: 'الرموز',
    tooltip:
      'ميزة إضافية بسعر ${{price, number}} لكل {{tokenLimit}} توكن. أول {{basicQuota}} توكن مشمولة.',
    /** UNTRANSLATED */
    tooltip_for_enterprise:
      'The first {{basicQuota}} tokens is included and free to use in your contract-based plan. If you need more, ${{price, number}} per {{tokenLimit}} tokens per month.',
  },
  hooks: {
    title: 'الخطافات',
    tooltip: 'ميزة إضافية بسعر قدره ${{price, number}} لكل خطاف. الخطافات الأولى 10 مشمولة.',
    /** UNTRANSLATED */
    tooltip_for_enterprise:
      'The first {{basicQuota}} hooks are included and free to use in your contract-based plan. If you need more, ${{price, number}} per hook per month.',
  },
  pricing: {
    add_on_changes_in_current_cycle_notice:
      'إذا قمت بإجراء أي تغييرات خلال دورة الفوترة الحالية، فقد تكون فاتورتك التالية أعلى قليلًا للشهر الأول بعد التغيير. سيكون السعر الأساسي ${{price, number}} بالإضافة إلى تكاليف الميزات الإضافية للاستخدام غير المقدر من الدورة الحالية والرسوم الكاملة للدورة التالية. <a>تعرف أكثر</a>',
  },
};

export default Object.freeze(usage);
