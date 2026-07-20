const security = {
  page_title: 'امنیت',
  title: 'امنیت',
  subtitle: 'محافظت پیشرفته در برابر حملات پیچیده را پیکربندی کنید.',
  tabs: {
    captcha: 'CAPTCHA',
    password_policy: 'سیاست رمز عبور',
    blocklist: 'لیست مسدود',
    general: 'عمومی',
  },
  bot_protection: {
    title: 'محافظت در برابر ربات',
    description:
      'CAPTCHA را برای ثبت‌نام، ورود و بازیابی رمز عبور فعال کنید تا تهدیدات خودکار مسدود شوند.',
    captcha: {
      title: 'CAPTCHA',
      placeholder: 'ارائه‌دهنده CAPTCHA را انتخاب و یکپارچه‌سازی را راه‌اندازی کنید.',
      add: 'افزودن CAPTCHA',
    },
    settings: 'تنظیمات',
    enable_captcha: 'فعال‌سازی CAPTCHA',
    enable_captcha_description:
      'تأیید CAPTCHA را برای جریان‌های ثبت‌نام، ورود و بازیابی رمز عبور فعال کنید.',
    custom_ui_captcha_notice:
      'از Bring your UI استفاده می‌کنید. برای فعال‌سازی CAPTCHA در رابط سفارشی، پیکربندی اضافی لازم است. <a>مشاهده راهنمای راه‌اندازی</a>.',
  },
  create_captcha: {
    setup_captcha: 'راه‌اندازی CAPTCHA',
  },
  captcha_providers: {
    recaptcha_enterprise: {
      name: 'reCAPTCHA Enterprise',
      description:
        'راه‌حل CAPTCHA سطح سازمانی گوگل که تشخیص تهدید پیشرفته و تحلیل امنیتی دقیق برای محافظت از وب‌سایت شما در برابر فعالیت‌های متقلبانه ارائه می‌دهد.',
    },
    turnstile: {
      name: 'Cloudflare Turnstile',
      description:
        'جایگزین هوشمند CAPTCHA از Cloudflare که محافظت غیرمزاحم در برابر ربات را با تجربه کاربری روان بدون پازل بصری فراهم می‌کند.',
    },
  },
  captcha_details: {
    back_to_security: 'بازگشت به امنیت',
    page_title: 'جزئیات CAPTCHA',
    check_readme: 'مشاهده README',
    options_change_captcha: 'تغییر ارائه‌دهنده CAPTCHA',
    connection: 'اتصال',
    description: 'اتصال‌های captcha خود را پیکربندی کنید.',
    site_key: 'کلید سایت',
    secret_key: 'کلید مخفی',
    project_id: 'شناسه پروژه',
    domain: 'دامنه (اختیاری)',
    domain_placeholder: 'www.google.com (پیش‌فرض) یا recaptcha.net',
    recaptcha_key_id: 'شناسه کلید reCAPTCHA',
    recaptcha_api_key: 'کلید API پروژه',
    deletion_description: 'آیا مطمئن هستید که می‌خواهید این ارائه‌دهنده CAPTCHA را حذف کنید؟',
    captcha_deleted: 'ارائه‌دهنده CAPTCHA با موفقیت حذف شد',
    setup_captcha: 'راه‌اندازی CAPTCHA',
    mode: 'حالت تأیید',
    mode_invisible: 'نامرئی',
    mode_checkbox: 'چک‌باکس',
    mode_notice:
      'حالت تأیید در تنظیمات کلید reCAPTCHA شما در Google Cloud Console تعریف می‌شود. تغییر حالت در اینجا نیاز به نوع کلید متناظر دارد.',
  },
  password_policy: {
    password_requirements: 'الزامات رمز عبور',
    password_requirements_description:
      'الزامات رمز عبور را تقویت کنید تا در برابر credential stuffing و حملات رمز عبور ضعیف دفاع کنید.',
    minimum_length: 'حداقل طول',
    minimum_length_description:
      'NIST پیشنهاد می‌کند برای محصولات وب <a>حداقل ۸ کاراکتر</a> استفاده شود.',
    minimum_length_error: 'حداقل طول باید بین {{min}} و {{max}} (شامل) باشد.',
    minimum_required_char_types: 'حداقل انواع کاراکتر لازم',
    minimum_required_char_types_description:
      'انواع کاراکتر: حروف بزرگ (A-Z)، حروف کوچک (a-z)، اعداد (0-9) و نمادهای خاص ({{symbols}}).',
    password_rejection: 'رد رمز عبور',
    compromised_passwords: 'رد رمز عبور به خطر افتاده',
    breached_passwords: 'رمزهای عبور افشاشده',
    breached_passwords_description:
      'رمزهای عبوری که قبلاً در پایگاه‌های داده نشت یافتند را رد کنید.',
    restricted_phrases: 'محدود کردن عبارات کم‌امنیت',
    restricted_phrases_tooltip:
      'رمز عبور شما باید از این عبارات اجتناب کند مگر اینکه با ۳ یا بیشتر کاراکتر اضافی ترکیب شود.',
    repetitive_or_sequential_characters: 'کاراکترهای تکراری یا متوالی',
    repetitive_or_sequential_characters_description: 'مثلاً «AAAA»، «1234» و «abcd».',
    user_information: 'اطلاعات کاربر',
    user_information_description: 'مثلاً آدرس ایمیل، شماره تلفن، نام کاربری و غیره.',
    custom_words: 'کلمات سفارشی',
    custom_words_description:
      'کلمات مختص زمینه را شخصی‌سازی کنید؛ بدون حساسیت به حروف بزرگ/کوچک و هر خط یک کلمه.',
    custom_words_placeholder: 'نام سرویس، نام شرکت و غیره.',
    password_expiration: 'انقضای رمز عبور',
    password_expiration_description:
      'از کاربران بخواهید پس از تعداد روز مشخصی رمز عبور را بازنشانی کنند. کاربرانی که از طریق SSO یا passkey وارد می‌شوند تحت تأثیر قرار نمی‌گیرند.',
    enable_password_expiration: 'فعال‌سازی انقضای رمز عبور',
    enable_password_expiration_description:
      'از کاربران بخواهید به‌صورت دوره‌ای رمز عبور را بازنشانی کنند. کاربران موجود بدون تاریخ ثبت‌شده تغییر رمز عبور، از تاریخ فعال شدن این سیاست ارزیابی می‌شوند.',
    enable_password_expiration_tip:
      'انقضای رمز عبور فقط پس از پیکربندی حداقل یک روش فراموشی رمز عبور با اتصال‌دهنده معتبر در تجربه ورود قابل فعال‌سازی است.',
    expiration_period: 'دوره اعتبار رمز عبور (روز)',
    expiration_period_description: 'تعداد روزهایی که رمز عبور قبل از انقضا معتبر می‌ماند.',
    expiration_period_error: 'دوره اعتبار رمز عبور باید بین {{min}} و {{max}} روز باشد.',
    password_expiration_recovery_reminder:
      'برخی کاربران ممکن است ایمیل یا شماره تلفنی برای دریافت کد بازیابی رمز عبور نداشته باشند و بنابراین نمی‌توانند رمز عبور منقضی‌شده را بازنشانی کنند. برای اطمینان از اینکه هر کاربر می‌تواند رمز عبور خود را بازیابی کند، در هنگام ثبت‌نام ایمیل یا شماره تلفن را الزامی کنید.',
  },
  verification_code_policy: {
    card_title: 'کد تأیید',
    card_description:
      'مدت زمان انقضا و حداکثر تعداد تلاش مجدد را برای کدهای تأیید استفاده‌شده در فرایندهای ورود، ثبت‌نام و بازنشانی رمز عبور پیکربندی کنید.',
    enable: {
      title: 'سفارشی‌سازی تنظیمات کد تأیید',
      description: 'اجازه دهید مدت زمان انقضا و حداکثر تعداد تلاش مجدد کد تأیید سفارشی شود.',
    },
    expiration_duration: {
      title: 'مدت زمان انقضا (ثانیه)',
      description: 'مدت زمان به ثانیه که یک کد تأیید پس از ارسال معتبر می‌ماند.',
      error_message: 'مدت زمان انقضا باید بین ۶۰ و ۳۶۰۰ ثانیه باشد.',
    },
    max_retry_attempts: {
      title: 'حداکثر تعداد تلاش مجدد',
      description: 'حداکثر تعداد تلاش‌های ناموفق تأیید مجاز قبل از باطل شدن کد.',
      error_message: 'حداکثر تعداد تلاش مجدد باید بین ۱ و ۱۰۰ باشد.',
    },
  },
  sentinel_policy: {
    card_title: 'قفل شناسه',
    card_description:
      'قفل برای همه کاربران با تنظیمات پیش‌فرض در دسترس است، اما می‌توانید آن را برای کنترل بیشتر سفارشی کنید.\n\nپس از چند تلاش ناموفق احراز هویت (مثلاً رمز عبور یا کد تأیید نادرست متوالی) شناسه را موقتاً قفل کنید تا از دسترسی brute force جلوگیری شود.',
    enable_sentinel_policy: {
      title: 'سفارشی‌سازی تجربه قفل',
      description:
        'امکان سفارشی‌سازی حداکثر تلاش‌های ناموفق ورود قبل از قفل، مدت قفل و باز کردن فوری دستی را بدهید.',
    },
    max_attempts: {
      title: 'حداکثر تلاش‌های ناموفق',
      description:
        'پس از رسیدن به حداکثر تعداد تلاش‌های ناموفق ورود در یک ساعت، شناسه را موقتاً قفل کنید.',
      error_message: 'حداکثر تلاش‌های ناموفق باید بیشتر از ۰ باشد.',
    },
    lockout_duration: {
      title: 'مدت قفل (دقیقه)',
      description: 'پس از تجاوز از حد تلاش‌های ناموفق، ورود را برای مدتی مسدود کنید.',
      error_message: 'مدت قفل باید حداقل ۱ دقیقه باشد.',
    },
    manual_unlock: {
      title: 'باز کردن دستی',
      description: 'کاربران را فوراً با تأیید هویت و وارد کردن شناسه آن‌ها باز کنید.',
      unblock_by_identifiers: 'رفع مسدودیت بر اساس شناسه',
      modal_description_1:
        'یک شناسه به‌دلیل چند تلاش ناموفق ورود/ثبت‌نام موقتاً قفل شده است. برای حفظ امنیت، دسترسی پس از مدت قفل به‌صورت خودکار بازیابی می‌شود.',
      modal_description_2:
        'فقط در صورت تأیید هویت کاربر و اطمینان از نبود تلاش دسترسی غیرمجاز، به‌صورت دستی باز کنید.',
      placeholder: 'شناسه‌ها را وارد کنید (آدرس ایمیل / شماره تلفن / نام کاربری)',
      confirm_button_text: 'باز کردن اکنون',
      success_toast: 'با موفقیت باز شد',
      duplicate_identifier_error: 'شناسه از قبل اضافه شده است',
      empty_identifier_error: 'لطفاً حداقل یک شناسه وارد کنید',
    },
  },
  blocklist: {
    card_title: 'لیست مسدود ایمیل',
    card_description:
      'با مسدود کردن آدرس‌های ایمیل پرخطر یا ناخواسته کنترل بیشتری بر پایگاه کاربری خود داشته باشید.',
    custom_email_allowlist: {
      title: 'اجازه دادن به ایمیل‌های سفارشی',
      description:
        'فقط آدرس‌های ایمیل، دامنه‌ها یا الگوهای wildcard منطبق را برای ثبت‌نام‌های جدید و ایمیل‌های تازه متصل‌شده مجاز کنید.',
      placeholder:
        'آدرس ایمیل، دامنه یا الگوی wildcard مجاز را وارد کنید (مثلاً bar@example.com، @example.com، foo*@example.com، *@example.com)',
      duplicate_error: 'آدرس ایمیل، دامنه یا الگوی wildcard قبلاً اضافه شده است',
      invalid_format_error:
        'باید یک آدرس ایمیل معتبر (bar@example.com)، دامنه (@example.com) یا الگوی wildcard ایمیل (foo*@example.com، *@example.com) باشد',
      warnings: {
        identical_entries:
          'برخی ورودی‌های allowlist در قوانین block نیز وجود دارند. ایمیل‌های منطبق ممکن است همچنان مسدود شوند.',
        blocked_exact_email:
          'برخی ایمیل‌های دقیق allowlist با یک قانون block منطبق هستند. ایمیل‌های منطبق ممکن است همچنان مسدود شوند.',
        blocked_subaddressing:
          'برخی ورودی‌های allowlist شامل علامت + هستند، اما subaddressing ایمیل مسدود شده است.',
        effectively_unusable:
          'بر اساس این بررسی‌ها، allowlist فعلی ممکن است هیچ ایمیل جدیدی را عبور ندهد.',
      },
    },
    disposable_email: {
      title: 'مسدود کردن آدرس‌های ایمیل یک‌بارمصرف',
      description:
        'فعال کنید تا هر تلاش ثبت‌نام با ایمیل یک‌بارمصرف یا موقت رد شود؛ این از اسپم جلوگیری و کیفیت کاربران را بهبود می‌دهد.',
    },
    email_subaddressing: {
      title: 'مسدود کردن زیرآدرس ایمیل',
      description:
        'فعال کنید تا تلاش‌های ثبت‌نام با زیرآدرس ایمیل با علامت مثبت (+) و کاراکترهای اضافی (مثلاً user+alias@foo.com) رد شوند.',
    },
    custom_email_address: {
      title: 'مسدود کردن آدرس‌های ایمیل سفارشی',
      description:
        'قوانینی اضافه کنید تا دامنه‌های ایمیل، آدرس‌های ایمیل یا الگوهای آدرس ایمیل با وایلدکارد از ثبت‌نام یا اتصال از طریق رابط کاربری مسدود شوند.',
      placeholder:
        'آدرس ایمیل، دامنه یا الگوی آدرس ایمیل با وایلدکارد مسدود را وارد کنید (مثلاً bar@example.com، @example.com، foo*@example.com، *@example.com)',
      duplicate_error: 'آدرس ایمیل، دامنه یا الگوی آدرس ایمیل با وایلدکارد از قبل اضافه شده است',
      invalid_format_error:
        'باید آدرس ایمیل معتبر (bar@example.com)، دامنه (@example.com) یا الگوی آدرس ایمیل با وایلدکارد (foo*@example.com، *@example.com) باشد',
    },
  },
};

export default Object.freeze(security);
