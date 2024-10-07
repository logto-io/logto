const applications = {
  page_title: 'التطبيقات',
  title: 'التطبيقات',
  subtitle: 'إنشاء وإدارة التطبيقات للمصادقة بواسطة OIDC.',
  subtitle_with_app_type: 'قم بإعداد مصادقة Logto لتطبيقك {{name}}',
  create: 'إنشاء تطبيق',
  create_subtitle_third_party:
    'استخدم Logto كموفر هوية (IdP) للتكامل بسهولة مع التطبيقات من جهات خارجية',
  application_name: 'اسم التطبيق',
  application_name_placeholder: 'تطبيقي',
  application_description: 'وصف التطبيق',
  application_description_placeholder: 'أدخل وصف التطبيق الخاص بك',
  select_application_type: 'حدد نوع التطبيق',
  no_application_type_selected: 'لم تقم بتحديد أي نوع للتطبيق حتى الآن',
  application_created: 'تم إنشاء التطبيق بنجاح.',
  tab: {
    my_applications: 'تطبيقاتي',
    third_party_applications: 'تطبيقات الجهات الخارجية',
  },
  app_id: 'معرف التطبيق',
  type: {
    native: {
      title: 'تطبيق محلي',
      subtitle: 'تطبيق يعمل في بيئة محلية',
      description: 'على سبيل المثال، تطبيق iOS، تطبيق Android',
    },
    spa: {
      title: 'تطبيق صفحة واحدة',
      subtitle: 'تطبيق يعمل في متصفح الويب ويحدث البيانات بشكل ديناميكي في المكان',
      description: 'على سبيل المثال، تطبيق React DOM، تطبيق Vue',
    },
    traditional: {
      title: 'تطبيق ويب تقليدي',
      subtitle: 'تطبيق يقوم بعرض الصفحات وتحديثها عن طريق خادم الويب فقط',
      description: 'على سبيل المثال، Next.js، PHP',
    },
    machine_to_machine: {
      title: 'الجهاز إلى الجهاز',
      subtitle: 'تطبيق (عادةً خدمة) يتحدث مباشرة إلى الموارد',
      description: 'على سبيل المثال، خدمة الخلفية',
    },
    protected: {
      title: 'تطبيق محمي',
      subtitle: 'تطبيق محمي بواسطة Logto',
      description: 'غير متوفر',
    },
    third_party: {
      title: 'تطبيق الجهة الخارجية',
      subtitle: 'تطبيق يستخدم كموصل IdP من جهة خارجية',
      description: 'على سبيل المثال، OIDC، SAML',
    },
  },
  placeholder_title: 'حدد نوع التطبيق للمتابعة',
  placeholder_description:
    'يستخدم Logto كيان التطبيق لـ OIDC للمساعدة في مهام مثل تحديد التطبيقات الخاصة بك وإدارة تسجيل الدخول وإنشاء سجلات التدقيق.',
};

export default Object.freeze(applications);
