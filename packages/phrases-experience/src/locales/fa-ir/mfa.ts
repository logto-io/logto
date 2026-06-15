const mfa = {
  totp: 'کد یکبار مصرف اپلیکیشن احراز هویت',
  webauthn: 'کلید عبور',
  backup_code: 'کد پشتیبان',
  email_verification_code: 'کد تأیید ایمیل',
  phone_verification_code: 'کد تأیید پیامکی',
  link_totp_description: 'مثلاً Google Authenticator و غیره.',
  link_webauthn_description: 'دستگاه یا کلید سخت‌افزاری USB خود را متصل کنید',
  link_backup_code_description: 'یک کد پشتیبان ایجاد کنید',
  link_email_verification_code_description: 'آدرس ایمیل خود را متصل کنید',
  link_email_2fa_description: 'آدرس ایمیل خود را برای تأیید دو مرحله‌ای متصل کنید',
  link_phone_verification_code_description: 'شماره تلفن خود را متصل کنید',
  link_phone_2fa_description: 'شماره تلفن خود را برای تأیید دو مرحله‌ای متصل کنید',
  verify_totp_description: 'کد یکبار مصرف را در اپلیکیشن وارد کنید',
  verify_webauthn_description: 'دستگاه یا کلید سخت‌افزاری USB خود را تأیید کنید',
  verify_backup_code_description: 'کد پشتیبانی که ذخیره کرده‌اید را وارد کنید',
  verify_email_verification_code_description: 'کد ارسال‌شده به ایمیل شما را وارد کنید',
  verify_phone_verification_code_description: 'کد ارسال‌شده به تلفن شما را وارد کنید',
  send_to_email: 'ارسال به {{identifier}}',
  send_to_phone: 'ارسال به {{identifier}}',
  onboarding: 'تأیید دو مرحله‌ای را فعال کنید',
  onboarding_description:
    'با تأیید دو مرحله‌ای از حساب خود محافظت کنید. یک یا چند روش را انتخاب کنید: کلید عبور، اپلیکیشن احراز هویت (OTP)، کد تأیید پیامکی، یا کدهای پشتیبان.',
  enable_mfa: 'تأیید دو مرحله‌ای را فعال کنید',
  add_mfa_factors: 'تأیید دو مرحله‌ای را اضافه کنید',
  add_mfa_description:
    'تأیید دو عاملی فعال شده است. روش تأیید دوم خود را برای ورود امن انتخاب کنید.',
  add_another_mfa_factor: 'تأیید دو مرحله‌ای دیگری اضافه کنید',
  add_another_mfa_description: 'روش دیگری برای تأیید هویت خود هنگام ورود انتخاب کنید.',
  verify_mfa_factors: 'تأیید دو مرحله‌ای',
  verify_mfa_description:
    'تأیید دو مرحله‌ای برای این حساب فعال شده است. لطفاً روش دوم برای تأیید هویت خود را انتخاب کنید.',
  add_authenticator_app: 'اپلیکیشن احراز هویت را اضافه کنید',
  replace_authenticator_app: 'اپلیکیشن احراز هویت را جایگزین کنید',
  step: 'مرحله {{step, number}}: {{content}}',
  scan_qr_code: 'این کد QR را اسکن کنید',
  scan_qr_code_description:
    'کد QR زیر را با اپلیکیشن احراز هویت خود مانند Google Authenticator، Duo Mobile، Authy و غیره اسکن کنید.',
  qr_code_not_available: 'نمی‌توانید کد QR را اسکن کنید؟',
  copy_and_paste_key: 'کلید را کپی و جای‌گذاری کنید',
  copy_and_paste_key_description:
    'کلید زیر را در اپلیکیشن احراز هویت خود مانند Google Authenticator، Duo Mobile، Authy و غیره کپی و جای‌گذاری کنید.',
  want_to_scan_qr_code: 'می‌خواهید کد QR را اسکن کنید؟',
  enter_one_time_code: 'کد یکبار مصرف را وارد کنید',
  enter_one_time_code_link_description:
    'کد تأیید ۶ رقمی ایجاد شده توسط اپلیکیشن احراز هویت را وارد کنید.',
  enter_one_time_code_description:
    'تأیید دو مرحله‌ای برای این حساب فعال شده است. لطفاً کد یکبار مصرف نشان داده شده در اپلیکیشن احراز هویت متصل شده را وارد کنید.',
  enter_email_verification_code: 'کد تأیید ایمیل را وارد کنید',
  enter_email_verification_code_description:
    'احراز هویت دو مرحله‌ای برای این حساب فعال شده است. لطفاً کد تأیید ایمیل ارسال شده به {{identifier}} را وارد کنید.',
  enter_phone_verification_code: 'کد تأیید پیامکی را وارد کنید',
  enter_phone_verification_code_description:
    'احراز هویت دو مرحله‌ای برای این حساب فعال شده است. لطفاً کد تأیید پیامکی ارسال شده به {{identifier}} را وارد کنید.',
  link_another_mfa_factor: 'تغییر به روش دیگر',
  save_backup_code: 'کد پشتیبان خود را ذخیره کنید',
  save_backup_code_description:
    'اگر در حین تأیید دو مرحله‌ای با مشکل مواجه شدید، می‌توانید از یکی از این کدهای پشتیبان برای دسترسی به حساب خود استفاده کنید. هر کد فقط یکبار قابل استفاده است.',
  backup_code_hint: 'مطمئن شوید که آن‌ها را کپی کرده و در مکانی امن ذخیره کنید.',
  new_backup_codes_generated:
    'کدهای پشتیبان جدید جایگزین کدهای قدیمی شما شده‌اند. آن‌ها را در اسرع وقت در مکانی امن ذخیره کنید.',
  enter_a_backup_code: 'یک کد پشتیبان وارد کنید',
  enter_backup_code_description:
    'کد پشتیبانی که هنگام فعال‌سازی اولیه تأیید دو مرحله‌ای ذخیره کرده‌اید را وارد کنید.',
  create_a_passkey: 'یک کلید عبور ایجاد کنید',
  create_passkey_description:
    'کلید عبور خود را با استفاده از بیومتریک دستگاه، کلیدهای امنیتی (مثلاً YubiKey)، یا سایر روش‌های موجود ثبت کنید.',
  try_another_verification_method: 'روش تأیید دیگری را امتحان کنید',
  verify_via_passkey: 'تأیید از طریق کلید عبور',
  verify_via_passkey_description:
    'از کلید عبور برای تأیید با رمز عبور دستگاه یا بیومتریک، اسکن کد QR، یا استفاده از کلید امنیتی USB مانند YubiKey استفاده کنید.',
  secret_key_copied: 'کلید مخفی کپی شد.',
  backup_code_copied: 'کد پشتیبان کپی شد.',
  webauthn_not_ready: 'WebAuthn هنوز آماده نیست. لطفاً بعداً دوباره تلاش کنید.',
  webauthn_not_supported: 'WebAuthn در این مرورگر پشتیبانی نمی‌شود.',
  webauthn_failed_to_create: 'ایجاد ناموفق بود. لطفاً دوباره تلاش کنید.',
  webauthn_failed_to_verify: 'تأیید ناموفق بود. لطفاً دوباره تلاش کنید.',
};

export default Object.freeze(mfa);
