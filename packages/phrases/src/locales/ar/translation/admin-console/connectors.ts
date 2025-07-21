const connectors = {
  page_title: 'الموصلات',
  title: 'الموصلات',
  subtitle:
    'قم بإعداد الموصلات لتمكين تجربة تسجيل الدخول بدون كلمة مرور والتسجيل بواسطة وسائل التواصل الاجتماعي',
  create: 'إضافة موصل اجتماعي',
  config_sie_notice: 'لقد قمت بإعداد الموصلات. تأكد من تكوينها في <a>{{link}}</a>.',
  config_sie_link_text: 'تجربة تسجيل الدخول',
  tab_email_sms: 'موصلات البريد الإلكتروني والرسائل القصيرة',
  tab_social: 'موصلات وسائل التواصل الاجتماعي',
  connector_name: 'اسم الموصل',
  demo_tip:
    'الحد الأقصى لعدد الرسائل المسموح بها لهذا الموصل التجريبي محدود إلى 100 ولا يُنصح باستخدامه في بيئة إنتاجية.',
  social_demo_tip:
    'تم تصميم الموصل التجريبي حصريًا لأغراض العرض ولا يُنصح باستخدامه في بيئة إنتاجية.',
  connector_type: 'النوع',
  connector_status: 'تجربة تسجيل الدخول',
  connector_status_in_use: 'قيد الاستخدام',
  connector_status_not_in_use: 'غير قيد الاستخدام',
  not_in_use_tip: {
    content:
      'غير قيد الاستخدام يعني أن تجربة تسجيل الدخول الخاصة بك لم تستخدم هذا طريقة تسجيل الدخول. <a>{{link}}</a> لإضافة هذه طريقة تسجيل الدخول. ',
    go_to_sie: 'انتقل إلى تجربة تسجيل الدخول',
  },
  placeholder_title: 'موصل اجتماعي',
  placeholder_description:
    'قدمت Logto العديد من موصلات تسجيل الدخول بواسطة وسائل التواصل الاجتماعي المستخدمة على نطاق واسع في الوقت الحالي يمكنك إنشاء موصل خاص بك باستخدام بروتوكولات قياسية.',
  save_and_done: 'حفظ وانتهاء',
  type: {
    email: 'موصل بريد إلكتروني',
    sms: 'موصل رسائل قصيرة',
    social: 'موصل اجتماعي',
  },
  setup_title: {
    email: 'إعداد موصل البريد الإلكتروني',
    sms: 'إعداد موصل الرسائل القصيرة',
    social: 'إضافة موصل اجتماعي',
  },
  guide: {
    subtitle: 'دليل خطوة بخطوة لتكوين الموصل الخاص بك',
    general_setting: 'الإعدادات العامة',
    parameter_configuration: 'تكوين المعلمات',
    test_connection: 'اختبار الاتصال',
    name: 'اسم زر تسجيل الدخول الاجتماعي',
    name_placeholder: 'أدخل اسم زر تسجيل الدخول الاجتماعي',
    name_tip:
      'سيتم عرض اسم زر الموصل على النحو التالي "المتابعة مع {{name}}". يجب أن تكون حذرًا من طول الاسم في حالة أصبح طويلاً جدًا.',
    connector_logo: 'شعار الموصل',
    connector_logo_tip: 'سيتم عرض الشعار على زر تسجيل الدخول للموصل.',
    target: 'اسم مزود الهوية',
    target_placeholder: 'أدخل اسم مزود الهوية للموصل',
    target_tip: 'قيمة "اسم مزود الهوية" يمكن أن تكون سلسلة معرف فريد لتمييز هوياتك الاجتماعية.',
    target_tip_standard:
      'قيمة "اسم مزود الهوية" يمكن أن تكون سلسلة معرف فريد لتمييز هوياتك الاجتماعية. لا يمكن تغيير هذا الإعداد بعد بناء الموصل.',
    target_tooltip:
      'يشير "اسم مزود الهوية" في موصلات Logto الاجتماعية إلى "المصدر" لهوياتك الاجتماعية. في تصميم Logto ، لا نقبل نفس "اسم مزود الهوية" لمنصة محددة لتجنب التعارضات. يجب أن تكون حذرًا جدًا قبل إضافة موصل لأنه لا يمكنك تغيير قيمته بمجرد إنشائه. <a>تعلم المزيد</a>',
    target_conflict:
      'اسم مزود الهوية المدخل يتطابق مع موصل <span>name</span> الموجود. قد يتسبب استخدام نفس اسم مزود الهوية في سلوك غير متوقع لتسجيل الدخول حيث يمكن للمستخدمين الوصول إلى نفس الحساب من خلال موصلين مختلفين.',
    target_conflict_line2:
      'إذا كنت ترغب في استبدال الموصل الحالي بنفس مزود الهوية والسماح للمستخدمين السابقين بتسجيل الدخول دون التسجيل مرة أخرى ، فيرجى حذف موصل <span>name</span> وإنشاء واحد جديد بنفس "اسم مزود الهوية".',
    target_conflict_line3:
      'إذا كنت ترغب في الاتصال بمزود هوية مختلف ، فيرجى تعديل "اسم مزود الهوية" والمتابعة.',
    config: 'أدخل تكوين JSON الخاص بك',
    sync_profile: 'مزامنة معلومات الملف الشخصي',
    sync_profile_only_at_sign_up: 'مزامنة فقط عند التسجيل',
    sync_profile_each_sign_in: 'قم بمزامنة في كل مرة تسجيل دخول',
    sync_profile_tip:
      'قم بمزامنة الملف الشخصي الأساسي من موفر الخدمة الاجتماعية ، مثل أسماء المستخدمين وصورهم الرمزية.',
    enable_token_storage: {
      /** UNTRANSLATED */
      title: 'Store tokens for persistent API access',
      /** UNTRANSLATED */
      description:
        'Store access and refresh tokens in the Secret Vault. Allows automated API calls without repeated user consent. Example: let your AI Agent add events to Google Calendar with persistent authorization. <a>Learn how to call third-party APIs</a>',
      /** UNTRANSLATED */
      tip: 'Tips: For standard OAuth/OIDC identity provider, the `offline_access` scope must be included to obtain a refresh token, preventing repeated user consent prompts. ',
    },
    callback_uri: 'عنوان URI للرد',
    callback_uri_description:
      'يُطلق عليه أيضًا اسم عنوان URI للتوجيه ، وهو عنوان URI في Logto الذي سيتم إرسال المستخدمين إليه بعد المصادقة الاجتماعية ، قم بنسخه ولصقه في صفحة تكوين مزود الخدمة الاجتماعية.',
    acs_url: 'عنوان URL لخدمة استهلاك الادعاء',
  },
  platform: {
    universal: 'عالمي',
    web: 'ويب',
    native: 'تطبيق محمول',
  },
  add_multi_platform: 'يدعم منصات متعددة ، حدد منصة للمتابعة',
  drawer_title: 'دليل الموصل',
  drawer_subtitle: 'اتبع التعليمات لدمج الموصل الخاص بك',
  unknown: 'موصل غير معروف',
  standard_connectors: 'موصلات قياسية',
};

export default Object.freeze(connectors);
