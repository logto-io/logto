const security = {
  page_title: 'الأمان',
  title: 'الأمان',
  subtitle: 'قم بتكوين حماية متقدمة ضد الهجمات المتطورة.',
  bot_protection: {
    title: 'حماية الروبوت',
    description: 'تفعيل CAPTCHA للتسجيل وتسجيل الدخول واستعادة كلمة المرور لحظر التهديدات الآلية.',
    captcha: {
      title: 'CAPTCHA',
      placeholder: 'اختر مزود CAPTCHA وقم بإعداد التكامل.',
      add: 'إضافة CAPTCHA',
    },
    settings: 'الإعدادات',
    captcha_required_flows: 'التدفقات التي تحتاج إلى CAPTCHA',
    sign_up: 'التسجيل',
    sign_in: 'تسجيل الدخول',
    forgot_password: 'نسيت كلمة المرور',
  },
  create_captcha: {
    setup_captcha: 'إعداد CAPTCHA',
  },
  captcha_providers: {
    recaptcha_enterprise: {
      name: 'reCAPTCHA Enterprise',
      description:
        'حل CAPTCHA من جوجل للمؤسسات ، الذي يوفر كشفًا متقدمًا عن التهديدات وتحليلات أمنية مفصلة لحماية موقعك من الأنشطة الاحتيالية.',
    },
    turnstile: {
      name: 'Cloudflare Turnstile',
      description:
        'بديل CAPTCHA الذكي من Cloudflare الذي يوفر حماية ضد الروبوتات دون إزعاج، مما يضمن تجربة مستخدم سلسة دون ألغاز بصرية.',
    },
  },
  captcha_details: {
    back_to_security: 'العودة إلى الأمان',
    page_title: 'تفاصيل CAPTCHA',
    check_readme: 'تحقق من README',
    options_change_captcha: 'تغيير مزود CAPTCHA',
    connection: 'الاتصال',
    description: 'تكوين اتصالات captcha الخاصة بك.',
    site_key: 'مفتاح الموقع',
    secret_key: 'المفتاح السري',
    project_id: 'معرف المشروع',
    deletion_description: 'هل أنت متأكد أنك تريد حذف مزود CAPTCHA هذا؟',
    captcha_deleted: 'تم حذف موفر CAPTCHA بنجاح',
    setup_captcha: 'إعداد CAPTCHA',
  },
};

export default Object.freeze(security);
