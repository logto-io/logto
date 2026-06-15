const sign_in_experiences = {
  empty_content_url_of_terms_of_use:
    'URL محتوای «شرایط استفاده» خالی است. اگر «شرایط استفاده» فعال است، URL محتوا را اضافه کنید.',
  empty_social_connectors:
    'اتصال‌دهنده‌های اجتماعی خالی است. وقتی روش ورود اجتماعی فعال است، اتصال‌دهنده‌های اجتماعی فعال اضافه کنید.',
  enabled_connector_not_found: 'اتصال‌دهنده {{type}} فعال یافت نشد.',
  not_one_and_only_one_primary_sign_in_method:
    'باید دقیقاً یک روش ورود اصلی وجود داشته باشد. لطفاً ورودی را بررسی کنید.',
  username_requires_password: 'برای شناسه ثبت‌نام نام کاربری باید تنظیم رمز عبور فعال باشد.',
  passwordless_requires_verify: 'برای شناسه ثبت‌نام ایمیل/تلفن باید تأیید فعال باشد.',
  miss_sign_up_identifier_in_sign_in: 'روش‌های ورود باید شامل شناسه ثبت‌نام باشند.',
  password_sign_in_must_be_enabled:
    'وقتی تنظیم رمز عبور در ثبت‌نام الزامی است، ورود با رمز عبور باید فعال باشد.',
  code_sign_in_must_be_enabled:
    'وقتی تنظیم رمز عبور در ثبت‌نام الزامی نیست، ورود با کد تأیید باید فعال باشد.',
  unsupported_default_language: 'این زبان - {{language}} فعلاً پشتیبانی نمی‌شود.',
  at_least_one_authentication_factor: 'باید حداقل یک عامل احراز هویت انتخاب کنید.',
  backup_code_cannot_be_enabled_alone: 'کد پشتیبان نمی‌تواند به‌تنهایی فعال شود.',
  duplicated_mfa_factors: 'عوامل MFA تکراری.',
  email_verification_code_cannot_be_used_for_mfa:
    'وقتی تأیید ایمیل برای ورود فعال است، کد تأیید ایمیل نمی‌تواند برای MFA استفاده شود.',
  phone_verification_code_cannot_be_used_for_mfa:
    'وقتی تأیید پیامکی برای ورود فعال است، کد تأیید پیامکی نمی‌تواند برای MFA استفاده شود.',
  email_verification_code_cannot_be_used_for_sign_in:
    'وقتی کد تأیید ایمیل برای MFA فعال است، نمی‌تواند برای ورود استفاده شود.',
  phone_verification_code_cannot_be_used_for_sign_in:
    'وقتی کد تأیید پیامکی برای MFA فعال است، نمی‌تواند برای ورود استفاده شود.',
  adaptive_mfa_requires_mfa: 'قبل از فعال‌سازی MFA تطبیقی، MFA باید فعال باشد.',
  adaptive_mfa_requires_non_skippable_policy:
    'MFA تطبیقی به سیاست اعلان MFA غیرقابل رد نیاز دارد. از PromptOnlyAtSignInMandatory یا PromptAtSignInAndSignUpMandatory استفاده کنید.',
  non_adaptive_mfa_requires_skippable_policy:
    'وقتی MFA تطبیقی غیرفعال است، سیاست اعلان MFA باید قابل رد باشد. از PromptOnlyAtSignInMandatory یا PromptAtSignInAndSignUpMandatory استفاده نکنید.',
  duplicated_sign_up_identifiers: 'شناسه‌های ثبت‌نام تکراری شناسایی شد.',
  missing_sign_up_identifiers: 'شناسه اصلی ثبت‌نام نمی‌تواند خالی باشد.',
  invalid_custom_email_blocklist_format:
    'موارد لیست مسدود ایمیل سفارشی نامعتبر: {{items, list(type:conjunction)}}. هر مورد باید آدرس ایمیل یا دامنه ایمیل معتبر باشد، مثلاً foo@example.com یا @example.com.',
  forgot_password_method_requires_connector:
    'روش فراموشی رمز عبور نیاز به پیکربندی اتصال‌دهنده {{method}} متناظر دارد.',
  password_expiration_requires_forgot_password:
    'انقضای رمز عبور به حداقل یک روش فراموشی رمز عبور با اتصال‌دهنده معتبر نیاز دارد.',
  password_expiration_not_enabled:
    'سیاست انقضای رمز عبور فعال نیست. قبل از منقضی کردن رمزهای عبور، آن را در تنظیمات تجربه ورود فعال کنید.',
  password_expiration_invalid_period_days:
    'وقتی انقضای رمز عبور فعال است، روزهای دوره اعتبار باید یک عدد صحیح مثبت باشد.',
  username_policy_case_conflicts_exist:
    'وقتی نام‌های کاربری که فقط در حروف بزرگ/کوچک متفاوت‌اند وجود دارند، نمی‌توان به نام کاربری بدون حساسیت به حروف بزرگ/کوچک تغییر داد. تعارض‌ها را حل کنید و دوباره تلاش کنید.',
};

export default Object.freeze(sign_in_experiences);
