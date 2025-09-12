const usage = {
  status_active: 'قيد الاستخدام',
  status_inactive: 'غير مستخدم',
  limited_status_quota_description: '(تم تضمين أول {{quota}})',
  unlimited_status_quota_description: '(مدرج)',
  disabled_status_quota_description: '(غير مدرج)',
  usage_description_with_unlimited_quota: '{{usage}}<span> (غير محدود)</span>',
  usage_description_with_limited_quota: '{{usage}}<span> (تم تضمين أول {{basicQuota}})</span>',
  usage_description_without_quota: '{{usage}}<span> (غير مدرج)</span>',
  mau: {
    title: 'MAU',
    tooltip:
      'MAU هو مستخدم فريد قام بتبادل رمز واحد على الأقل مع Logto خلال دورة فوترة. غير محدود لخطة Pro. <a>تعرف أكثر</a>',
    tooltip_for_enterprise:
      'MAU هو مستخدم فريد قام بتبادل رمز واحد على الأقل مع Logto خلال دورة فوترة. غير محدود لخطة الشركات.',
  },
  organizations: {
    title: 'المؤسسات',
    tooltip:
      'ميزة إضافية بسعر ثابت قدره ${{price, number}} شهريًا. لا يتأثر السعر بعدد المؤسسات أو مستوى نشاطها.',
    description_for_enterprise: '(مدرج)',
    tooltip_for_enterprise:
      'يعتمد الإدراج على خطتك. إذا لم تكن ميزة المؤسسة في عقدك الأولي ، فسيتم إضافتها إلى فاتورتك عند تفعيلها. الإضافة تكلف ${{price, number}}/الشهر ، بغض النظر عن عدد المؤسسات أو نشاطها.',
    tooltip_for_enterprise_with_numbered_basic_quota:
      'تشمل خطتك أول {{basicQuota}} مؤسسات مجانًا. إذا كنت بحاجة إلى المزيد ، يمكنك إضافتها مع الإضافة للمؤسسات بمعدل ثابت قدره ${{price, number}} شهريًا ، بغض النظر عن عدد المؤسسات أو مستوى نشاطها.',
  },
  mfa: {
    title: 'MFA',
    tooltip:
      'ميزة إضافية بسعر ثابت قدره ${{price, number}} شهريًا. لا يتأثر السعر بعدد عوامل المصادقة المستخدمة.',
    tooltip_for_enterprise:
      'يعتمد الإدراج على خطتك. إذا لم تكن ميزة MFA في عقدك الأولي ، فسيتم إضافتها إلى فاتورتك عند تفعيلها. الإضافة تكلف ${{price, number}}/الشهر ، بغض النظر عن عدد عوامل المصادقة المستخدمة.',
  },
  enterprise_sso: {
    title: 'SSO للشركات',
    tooltip: 'ميزة إضافية بسعر قدره ${{price, number}} للاتصال بواجهة SSO شهريًا.',
    tooltip_for_enterprise:
      'ميزة إضافية بسعر ${{price, number}} لكل اتصال SSO شهريًا. تُشمل وتكون مجانية لاستخدام أول {{basicQuota}} في خطتك القائمة على العقد.',
  },
  api_resources: {
    title: 'موارد واجهة برمجة التطبيقات',
    tooltip:
      'ميزة إضافية بسعر قدره ${{price, number}} لكل مورد في واجهة برمجة التطبيقات شهريًا. الموارد الأولى 3 مجانية.',
    tooltip_for_enterprise:
      'تشمل خطتك القائمة على العقد أول {{basicQuota}} من موارد واجهة برمجة التطبيقات وتكون مجانية للاستخدام. إذا كنت بحاجة إلى المزيد ، {{price, number}} لكل مورد واجهة برمجة التطبيقات شهريًا.',
  },
  machine_to_machine: {
    title: 'من الجهاز إلى الجهاز',
    tooltip:
      'ميزة إضافية بسعر قدره ${{price, number}} لكل تطبيق من الجهاز إلى الجهاز شهريًا. التطبيق الأول من الجهاز إلى الجهاز مجاني.',
    tooltip_for_enterprise:
      'أول {{basicQuota}} تطبيق من الجهاز إلى الجهاز مجاني للاستخدام في خطتك القائمة على العقد. إذا كنت بحاجة إلى المزيد ، {{price, number}} لكل تطبيق شهريًا.',
  },
  tenant_members: {
    title: 'أعضاء المستأجر',
    tooltip: 'ميزة إضافية بسعر ${{price, number}} لكل عضو شهريًا. أول {{count}} عضو مستأجر مجاني.',
    tooltip_one:
      'ميزة إضافية بسعر ${{price, number}} لكل عضو شهريًا. أول {{count}} عضو مستأجر مجاني.',
    tooltip_other:
      'ميزة إضافية بسعر ${{price, number}} لكل عضو شهريًا. أول {{count}} أعضاء مستأجرين مجانًا.',
    tooltip_for_enterprise:
      'تشمل خطتك القائمة على العقد أول {{basicQuota}} من أعضاء المستأجر وتكون مجانية للاستخدام. إذا كنت بحاجة إلى المزيد ، {{price, number}} لكل عضو مستأجر شهريًا.',
  },
  tokens: {
    title: 'الرموز',
    tooltip:
      'ميزة إضافية بسعر ${{price, number}} لكل {{tokenLimit}} توكن. أول {{basicQuota}} توكن مشمولة.',
    tooltip_for_enterprise:
      'تشمل خطتك القائمة على العقد أول {{basicQuota}} من الرموز وتكون مجانية للاستخدام. إذا كنت بحاجة إلى المزيد ، {{price, number}} لكل {{tokenLimit}} رمز شهريًا.',
  },
  hooks: {
    title: 'الخطافات',
    tooltip: 'ميزة إضافية بسعر قدره ${{price, number}} لكل خطاف. الخطافات الأولى 10 مشمولة.',
    tooltip_for_enterprise:
      'تشمل خطتك القائمة على العقد أول {{basicQuota}} من الخطافات وتكون مجانية للاستخدام. إذا كنت بحاجة إلى المزيد ، {{price, number}} لكل خطاف شهريًا.',
  },
  security_features: {
    title: 'الأمان المتقدم',
    tooltip:
      'ميزة إضافية بسعر ${{price, number}}/الشهر لحزمة الأمان المتقدمة الكاملة، بما في ذلك CAPTCHA، وقفل التعريف، وقائمة البريد الإلكتروني المحظورة، والمزيد.',
  },
  saml_applications: {
    title: 'تطبيق SAML',
    tooltip: 'ميزة إضافية بسعر ${{price, number}} لكل تطبيق SAML شهريًا.',
  },
  third_party_applications: {
    title: 'تطبيقات الطرف الثالث',
    tooltip: 'ميزة إضافية بسعر ${{price, number}} لكل تطبيق شهريًا.',
  },
  rbacEnabled: {
    title: 'الأدوار',
    tooltip:
      'ميزة إضافية بسعر ثابت ${{price, number}} شهريًا. السعر لا يتأثر بعدد الأدوار العالمية.',
  },
  pricing: {
    add_on_changes_in_current_cycle_notice:
      'إذا قمت بإجراء أي تغييرات خلال دورة الفوترة الحالية، فقد تكون فاتورتك التالية أعلى قليلًا للشهر الأول بعد التغيير. سيكون السعر الأساسي ${{price, number}} بالإضافة إلى تكاليف الميزات الإضافية للاستخدام غير المقدر من الدورة الحالية والرسوم الكاملة للدورة التالية. <a>تعرف أكثر</a>',
  },
};

export default Object.freeze(usage);
