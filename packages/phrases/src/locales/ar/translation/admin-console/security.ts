const password_policy = {
  password_requirements: 'متطلبات كلمة المرور',
  minimum_length: 'الحد الأدنى للطول',
  minimum_length_description: 'يوصي NIST باستخدام <a>على الأقل 8 أحرف</a> للمنتجات على الويب.',
  minimum_length_error: 'يجب أن يكون الحد الأدنى للطول بين {{min}} و {{max}} (شاملاً).',
  minimum_required_char_types: 'الحد الأدنى لأنواع الأحرف المطلوبة',
  minimum_required_char_types_description:
    'أنواع الأحرف: الأحرف الكبيرة (A-Z)، الأحرف الصغيرة (a-z)، الأرقام (0-9)، والرموز الخاصة ({{symbols}}).',
  password_rejection: 'رفض كلمة المرور',
  compromised_passwords: 'رفض كلمات المرور المخترقة',
  breached_passwords: 'كلمات المرور المخترقة',
  breached_passwords_description:
    'رفض كلمات المرور التي تم العثور عليها سابقًا في قواعد البيانات المخترقة.',
  restricted_phrases: 'تقييد عبارات ضعيفة من الناحية الأمنية',
  restricted_phrases_tooltip:
    'يجب تجنب استخدام هذه العبارات في كلمة المرور ما لم تجمعها مع 3 أحرف إضافية أو أكثر.',
  repetitive_or_sequential_characters: 'أحرف متكررة أو متسلسلة',
  repetitive_or_sequential_characters_description: 'مثال: "AAAA"، "1234"، و "abcd".',
  user_information: 'معلومات المستخدم',
  user_information_description: 'مثال: عنوان البريد الإلكتروني، رقم الهاتف، اسم المستخدم، إلخ.',
  custom_words: 'كلمات مخصصة',
  custom_words_description: 'كلمات ذات صلة بالسياق، غير حساسة لحالة الأحرف، وكل كلمة في سطر منفصل.',
  custom_words_placeholder: 'اسم الخدمة الخاص بك، اسم الشركة، إلخ.',
};

const security = {
  page_title: 'الأمان',
  title: 'الأمان',
  subtitle: 'قم بتكوين حماية متقدمة ضد الهجمات المتطورة.',
  tabs: {
    captcha: 'CAPTCHA',
    password_policy: 'سياسة كلمة المرور',
  },
  bot_protection: {
    title: 'حماية الروبوت',
    description: 'تفعيل CAPTCHA للتسجيل وتسجيل الدخول واستعادة كلمة المرور لحظر التهديدات الآلية.',
    captcha: {
      title: 'CAPTCHA',
      placeholder: 'اختر مزود CAPTCHA وقم بإعداد التكامل.',
      add: 'إضافة CAPTCHA',
    },
    settings: 'الإعدادات',
    enable_captcha: 'تفعيل CAPTCHA',
    enable_captcha_description:
      'تفعيل التحقق CAPTCHA لعمليات التسجيل وتسجيل الدخول واستعادة كلمة المرور.',
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
    recaptcha_key_id: 'معرّف مفتاح reCAPTCHA',
    recaptcha_api_key: 'مفتاح API للمشروع',
    deletion_description: 'هل أنت متأكد أنك تريد حذف مزود CAPTCHA هذا؟',
    captcha_deleted: 'تم حذف موفر CAPTCHA بنجاح',
    setup_captcha: 'إعداد CAPTCHA',
  },
  password_policy,
};

export default Object.freeze(security);
