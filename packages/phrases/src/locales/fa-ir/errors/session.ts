const session = {
  not_found: 'نشست یافت نشد. لطفاً برگردید و دوباره وارد شوید.',
  invalid_credentials: 'حساب یا رمز عبور نادرست است. لطفاً ورودی را بررسی کنید.',
  invalid_sign_in_method: 'روش ورود فعلی در دسترس نیست.',
  invalid_connector_id: 'اتصال‌دهنده در دسترس با شناسه {{connectorId}} یافت نشد.',
  insufficient_info: 'اطلاعات ورود ناکافی است.',
  connector_id_mismatch: 'connectorId با رکورد نشست مطابقت ندارد.',
  connector_session_not_found: 'نشست اتصال‌دهنده یافت نشد. لطفاً برگردید و دوباره وارد شوید.',
  verification_session_not_found:
    'تأیید موفق نبود. جریان تأیید را از نو شروع کنید و دوباره تلاش کنید.',
  verification_expired: 'اتصال منقضی شد. دوباره تأیید کنید تا امنیت حساب شما حفظ شود.',
  verification_blocked_too_many_attempts:
    'تلاش‌های زیاد در زمان کوتاه. لطفاً {{relativeTime}} دوباره تلاش کنید.',
  unauthorized: 'لطفاً ابتدا وارد شوید.',
  unsupported_prompt_name: 'نام prompt پشتیبانی نمی‌شود.',
  forgot_password_not_enabled: 'فراموشی رمز عبور فعال نیست.',
  verification_failed: 'تأیید موفق نبود. جریان تأیید را از نو شروع کنید و دوباره تلاش کنید.',
  connector_validation_session_not_found: 'نشست اتصال‌دهنده برای اعتبارسنجی توکن یافت نشد.',
  csrf_token_mismatch: 'عدم تطابق توکن CSRF.',
  identifier_not_found: 'شناسه کاربر یافت نشد. لطفاً برگردید و دوباره وارد شوید.',
  interaction_not_found: 'نشست تعامل یافت نشد. لطفاً برگردید و نشست را دوباره شروع کنید.',
  invalid_interaction_type:
    'این عملیات برای تعامل فعلی پشتیبانی نمی‌شود. لطفاً نشست جدیدی آغاز کنید.',
  not_supported_for_forgot_password: 'این عملیات برای فراموشی رمز عبور پشتیبانی نمی‌شود.',
  identity_conflict:
    'عدم تطابق هویت شناسایی شد. لطفاً نشست جدیدی آغاز کنید تا با هویت دیگری ادامه دهید.',
  identifier_not_verified:
    'شناسه ارائه‌شده {{identifier}} تأیید نشده است. لطفاً رکورد تأیید برای این شناسه ایجاد و فرایند تأیید را تکمیل کنید.',
  mfa: {
    require_mfa_verification: 'تأیید MFA برای ورود الزامی است.',
    mfa_sign_in_only: 'MFA فقط برای تعامل ورود در دسترس است.',
    pending_info_not_found: 'اطلاعات MFA در انتظار یافت نشد، لطفاً ابتدا MFA را آغاز کنید.',
    invalid_totp_code: 'کد TOTP نامعتبر است.',
    webauthn_verification_failed: 'تأیید WebAuthn ناموفق بود.',
    webauthn_verification_not_found: 'تأیید WebAuthn یافت نشد.',
    bind_mfa_existed: 'MFA از قبل وجود دارد.',
    backup_code_can_not_be_alone: 'کد پشتیبان نمی‌تواند تنها MFA باشد.',
    backup_code_required: 'کد پشتیبان الزامی است.',
    invalid_backup_code: 'کد پشتیبان نامعتبر است.',
    mfa_policy_not_user_controlled: 'سیاست MFA تحت کنترل کاربر نیست.',
    mfa_factor_not_enabled: 'عامل MFA فعال نیست.',
    suggest_additional_mfa:
      'برای محافظت قوی‌تر، افزودن روش MFA دیگر را در نظر بگیرید. می‌توانید این مرحله را رد کنید و ادامه دهید.',
  },
  passkey_sign_in: {
    pending_info_not_found:
      'اطلاعات ورود passkey در انتظار یافت نشد. لطفاً جریان ورود را دوباره آغاز کنید.',
    conflict_rp_id:
      'شناسه Relying Party مطابقت ندارد. لطفاً از کلاینت صحیح برای ورود استفاده کنید.',
    sso_users_not_allowed: 'گزینه ورود با passkey برای کاربران SSO واجد شرایط نیست.',
  },
  password_expiration: {
    reset_not_allowed: 'بازنشانی رمز عبور فقط پس از انقضای رمز عبور در نشست ورود فعلی مجاز است.',
  },
  sso_enabled: 'ورود یکپارچه برای این ایمیل فعال است. لطفاً با SSO وارد شوید.',
  captcha_required: 'CAPTCHA الزامی است.',
  captcha_failed: 'تأیید CAPTCHA ناموفق بود.',
  email_blocklist: {
    disposable_email_validation_failed: 'اعتبارسنجی آدرس ایمیل ناموفق بود.',
    invalid_email: 'آدرس ایمیل نامعتبر است.',
    email_subaddressing_not_allowed: 'زیرآدرس ایمیل مجاز نیست.',
    email_not_allowed: 'آدرس ایمیل «{{email}}» محدود شده است. لطفاً آدرس دیگری انتخاب کنید.',
  },
  google_one_tap: {
    cookie_mismatch: 'عدم تطابق کوکی Google One Tap.',
    invalid_id_token: 'توکن شناسایی Google نامعتبر است.',
    unverified_email: 'ایمیل تأییدنشده.',
  },
};

export default Object.freeze(session);
