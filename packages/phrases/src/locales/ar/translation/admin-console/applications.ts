const applications = {
  page_title: 'التطبيقات',
  title: 'التطبيقات',
  subtitle: 'إنشاء وإدارة التطبيقات للمصادقة بواسطة OIDC.',
  subtitle_with_app_type: 'قم بإعداد مصادقة Logto لتطبيقك {{name}}',
  create_device_flow_description:
    'أنشئ تطبيقًا أصليًا يستخدم منح تفويض جهاز OAuth 2.0 للأجهزة ذات الإدخال المحدود أو التطبيقات بدون واجهة.',
  create: 'إنشاء تطبيق',
  create_third_party: 'إنشاء تطبيق جهة خارجية',
  create_thrid_party_modal_title: 'إنشاء تطبيق جهة خارجية ({{type}})',
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
      description:
        'على سبيل المثال، تطبيق iOS، تطبيق Android، تطبيق سطح المكتب، أجهزة التلفاز، CLI',
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
    saml: {
      title: 'تطبيق SAML',
      subtitle: 'تطبيق يُستخدم كموصل IdP لبروتوكول SAML',
      description: 'على سبيل المثال، SAML',
    },
    third_party: {
      title: 'تطبيق الجهة الخارجية',
      subtitle: 'تطبيق يستخدم كموصل IdP من جهة خارجية',
      description: 'على سبيل المثال، OIDC، SAML',
    },
  },
  authorization_flow: {
    title: 'تدفق التفويض',
    tooltip: 'حدد تدفق التفويض لتطبيقك. بمجرد التعيين، لا يمكن تغييره.',
    authorization_code: {
      title: 'Authorization code',
      description:
        'نوع التفويض الافتراضي والأكثر شيوعًا. يتم إعادة توجيه المستخدمين إلى صفحة تسجيل الدخول لتفويض الوصول مباشرة.',
    },
    device_flow: {
      title: 'Device flow',
      description:
        'للأجهزة ذات الإدخال المحدود أو التطبيقات بدون واجهة (مثل أجهزة التلفزيون، CLI). يُكمل المستخدمون تسجيل الدخول على جهاز منفصل عن طريق إدخال رمز الجهاز أو مسح رمز QR.',
    },
  },
  placeholder_title: 'حدد نوع التطبيق للمتابعة',
  placeholder_description:
    'يستخدم Logto كيان التطبيق لـ OIDC للمساعدة في مهام مثل تحديد التطبيقات الخاصة بك وإدارة تسجيل الدخول وإنشاء سجلات التدقيق.',
  third_party_application_placeholder_description:
    'استخدم Logto كمزود هوية لتوفير تفويض OAuth للخدمات الخارجية. \n يتضمن شاشة موافقة المستخدم المُبنية مسبقًا للوصول إلى الموارد. <a>اعرف المزيد</a>',
  dynamic_app: {
    title: 'تطبيق ديناميكي',
    subtitle: 'CIMD',
    description: 'يتيح التطبيق الديناميكي لعملاء OAuth الاتصال دون تسجيل مسبق.',
    settings_description:
      'يتيح التطبيق الديناميكي لعملاء OAuth الاتصال دون تسجيل مسبق. يستخدم مواصفة OAuth Client ID Metadata Document (CIMD).',
    app_id_placeholder: 'يوفره كل عميل ديناميكيًا',
    enable_confirm_modal: {
      title: 'تفعيل وصول العملاء الديناميكي؟',
      content:
        'يمكن لأي عميل OAuth يمتلك عنوان URL عامًا وصالحًا لمعرّف العميل عبر HTTPS أن يبدأ التفويض لهذا المستأجر دون تسجيل مسبق. يظل الوصول محدودًا بالحد الأقصى من الأذونات لديك وبموافقة المستخدم.',
    },
    enabled: 'تم تفعيل التطبيق الديناميكي بنجاح.',
    disable_confirm_modal: {
      title: 'تعطيل التطبيق الديناميكي؟',
      content:
        'لن يتمكن عملاء CIMD بعد الآن من بدء طلبات تفويض جديدة. سيتم الاحتفاظ بالمنح الحالية، وقد تظل رموز الوصول الصادرة صالحة حتى انتهاء صلاحيتها.',
    },
    disabled: 'تم تعطيل التطبيق الديناميكي بنجاح.',
    permissions: {
      user_title: 'المستخدم',
      user_description: 'حدد الأذونات التي يطلبها عملاء OAuth للوصول إلى بيانات مستخدم محددة.',
      grant_user_level_permissions: 'منح أذونات المستخدم',
      organization_title: 'المؤسسة',
      organization_description:
        'حدد الأذونات التي يطلبها عملاء OAuth للوصول إلى بيانات مؤسسة محددة.',
      grant_organization_level_permissions: 'منح أذونات المؤسسة',
      permission_delete_confirm:
        'سيؤدي هذا الإجراء إلى إزالة الإذن من التطبيق الديناميكي، مما يمنع عملاء OAuth من طلب موافقة المستخدم عليه. هل أنت متأكد أنك تريد المتابعة؟',
    },
  },
  guide: {
    third_party: {
      title: 'دمج تطبيق جهة خارجية',
      description:
        'استخدم Logto كمزوّد هوية لتوفير تفويض OAuth لخدمات الجهات الخارجية. يتضمن شاشة موافقة مستخدم مُعدّة مسبقًا للوصول الآمن إلى الموارد. <a>معرفة المزيد</a>',
    },
  },
};

export default Object.freeze(applications);
