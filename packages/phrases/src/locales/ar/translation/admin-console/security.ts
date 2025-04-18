const security = {
  page_title: 'الأمان',
  title: 'الأمان',
  subtitle: 'قم بتكوين حماية متقدمة ضد الهجمات المتطورة.',
  tabs: {
    captcha: 'CAPTCHA',
    password_policy: 'سياسة كلمة المرور',
    general: 'عام',
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
  password_policy: {
    password_requirements: 'متطلبات كلمة المرور',
    password_requirements_description:
      'تعزيز متطلبات كلمة المرور للدفاع ضد هجمات ملء بيانات الاعتماد والهجمات باستخدام كلمات المرور الضعيفة.',
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
    custom_words_description:
      'كلمات ذات صلة بالسياق، غير حساسة لحالة الأحرف، وكل كلمة في سطر منفصل.',
    custom_words_placeholder: 'اسم الخدمة الخاص بك، اسم الشركة، إلخ.',
  },
  sentinel_policy: {
    card_title: 'قفل الهوية',
    card_description:
      'قفل الهوية بشكل مؤقت بعد فشل مصادقات متعددة (على سبيل المثال، تسجيل الدخول باستخدام كلمة مرور أو رمز تحقق غير صحيح بشكل متتالٍ) لمنع الوصول العشوائي.',
    enable_sentinel_policy: {
      /** UNTRANSLATED */
      title: 'Customize lockout experience',
      /** UNTRANSLATED */
      description:
        'Allow customization of the maximum failed login attempts before lockout, lockout duration, and immediate manual unlock.',
    },
    max_attempts: {
      title: 'الحد الأقصى لمحاولات الفشل',
      description: 'تحديد عدد محاولات الفشل المتتالية لكل هوية. تجاوز هذا الحد يؤدي إلى قفل مؤقت.',
      error_message: 'يجب أن يكون الحد الأقصى لمحاولات الفشل أكبر من 0.',
    },
    lockout_duration: {
      title: 'مدة القفل (بالدقائق)',
      description: 'قفل عمليات تسجيل الدخول لفترة بعد تجاوز الحد الأقصى لمحاولات الفشل.',
      error_message: 'يجب أن تكون مدة القفل دقيقة واحدة على الأقل.',
    },
    manual_unlock: {
      title: 'فتح يدوي',
      description: 'فتح المستخدمين فوراً بتأكيد هويتهم وإدخال هويتهم.',
      unblock_by_identifiers: 'فتح باستخدام الهوية',
      modal_description_1:
        'تم قفل الهوية بشكل مؤقت بسبب محاولات تسجيل الدخول/التسجيل الفاشلة المتعددة. لحماية الأمان، سيتم استعادة الوصول تلقائيًا بعد انتهاء مدة القفل.',
      modal_description_2:
        'فقط افتح يدوياً إذا كنت قد أكدت هوية المستخدم وتأكدت من عدم وجود محاولات وصول غير مصرح بها.',
      placeholder: 'إدخال الهويات (عنوان البريد الإلكتروني / رقم الهاتف / اسم المستخدم)',
      confirm_button_text: 'افتح الآن',
      success_toast: 'تم الفتح بنجاح',
      duplicate_identifier_error: 'تمت إضافة الهوية بالفعل',
      empty_identifier_error: 'يرجى إدخال معرف واحد على الأقل',
    },
  },
};

export default Object.freeze(security);
