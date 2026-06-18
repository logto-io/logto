const account_center = {
  home: {
    title: 'صفحه یافت نشد',
    description: 'این صفحه در دسترس نیست.',
  },
  page: {
    title: 'حساب',
    security_title: 'امنیت',
    security_description: 'برای اطمینان از امنیت حساب، تنظیمات حساب خود را اینجا تغییر دهید.',
    profile_title: 'اطلاعات شخصی',
    profile_description: 'اطلاعات شخصی خود را اینجا تغییر دهید.',
    sidebar_personal_info: 'اطلاعات شخصی',
    sidebar_security: 'امنیت',
    sidebar_sessions: 'نشست‌ها',
    support: 'پشتیبانی',
  },
  verification: {
    title: 'تأیید امنیتی',
    description:
      'برای محافظت از امنیت حساب خود، هویتتان را تأیید کنید. لطفاً روش تأیید هویت را انتخاب کنید.',
    error_send_failed: 'ارسال کد تأیید ناموفق بود. لطفاً بعداً دوباره تلاش کنید.',
    error_invalid_code: 'کد تأیید نامعتبر است یا منقضی شده است.',
    error_verify_failed: 'تأیید ناموفق بود. لطفاً کد را دوباره وارد کنید.',
    verification_required: 'تأیید منقضی شد. لطفاً هویت خود را دوباره تأیید کنید.',
    try_another_method: 'روش دیگری برای تأیید امتحان کنید',
    no_available_methods_title: 'هیچ روش تأییدی در دسترس نیست',
    no_available_methods_description:
      'شما هیچ روش تأییدی تنظیم نکرده‌اید. لطفاً ابتدا یک رمز عبور، ایمیل یا شماره تلفن به حساب خود اضافه کنید.',
  },
  password_verification: {
    title: 'تأیید رمز عبور',
    description: 'برای محافظت از امنیت حساب خود، هویتتان را تأیید کنید. رمز عبور خود را وارد کنید.',
    error_failed: 'رمز عبور نادرست است. لطفاً ورودی خود را بررسی کنید.',
  },
  verification_method: {
    password: {
      name: 'رمز عبور',
      description: 'رمز عبور خود را تأیید کنید',
    },
    email: {
      name: 'کد تأیید ایمیل',
      description: 'ارسال کد تأیید به ایمیل شما',
    },
    phone: {
      name: 'کد تأیید تلفن',
      description: 'ارسال کد تأیید به شماره تلفن شما',
    },
  },
  email: {
    title: 'پیوند ایمیل',
    description: 'ایمیل خود را برای ورود یا کمک به بازیابی حساب پیوند دهید.',
    verification_title: 'کد تأیید ایمیل را وارد کنید',
    verification_description: 'کد تأیید به ایمیل شما {{email_address}} ارسال شد.',
    success: 'ایمیل اصلی با موفقیت پیوند داده شد.',
    verification_required: 'تأیید منقضی شد. لطفاً هویت خود را دوباره تأیید کنید.',
  },
  phone: {
    title: 'پیوند شماره تلفن',
    description: 'شماره تلفن خود را برای ورود یا کمک به بازیابی حساب پیوند دهید.',
    verification_title: 'کد تأیید پیامکی را وارد کنید',
    verification_description: 'کد تأیید به تلفن شما {{phone_number}} ارسال شد.',
    success: 'شماره تلفن اصلی با موفقیت پیوند داده شد.',
    verification_required: 'تأیید منقضی شد. لطفاً هویت خود را دوباره تأیید کنید.',
  },
  username: {
    title: 'تنظیم نام کاربری',
    description: 'نام کاربری باید فقط شامل حروف، اعداد و زیرخط باشد.',
    policy_description: '{{requirements}}',
    success: 'نام کاربری با موفقیت به‌روزرسانی شد.',
  },
  security: {
    add: 'افزودن',
    change: 'تغییر',
    remove: 'حذف',
    not_set: 'تنظیم نشده',
    social_sign_in: 'ورود اجتماعی',
    social_not_linked: 'پیوند داده نشده',
    email_phone: 'ایمیل / تلفن',
    email: 'ایمیل',
    phone: 'تلفن',
    password: 'رمز عبور',
    configured: 'پیکربندی‌شده',
    not_configured: 'پیکربندی‌نشده',
    two_step_verification: 'تأیید دو مرحله‌ای',
    authenticator_app: 'اپلیکیشن احراز هویت',
    passkeys: 'کلیدهای عبور',
    backup_codes: 'کدهای پشتیبان',
    email_verification_code: 'کد تأیید ایمیل',
    phone_verification_code: 'کد تأیید تلفن',
    passkeys_count_one: '{{count}} کلید عبور',
    passkeys_count_other: '{{count}} کلید عبور',
    backup_codes_count_one: '{{count}} کد باقی‌مانده',
    backup_codes_count_other: '{{count}} کد باقی‌مانده',
    view: 'مشاهده',
    manage: 'مدیریت',
    turn_on_2_step_verification_description:
      'یک لایه امنیتی اضافی اضافه کنید. هنگام ورود از شما یک مرحله تأیید دوم خواسته می‌شود.',
    turn_off_2_step_verification: 'خاموش کردن تأیید دو مرحله‌ای',
    turn_off_2_step_verification_description:
      'غیرفعال کردن تأیید دو مرحله‌ای، لایه حفاظتی اضافی را هنگام ورود از حساب شما حذف می‌کند. آیا مطمئن هستید که می‌خواهید ادامه دهید؟',
    disable_2_step_verification: 'غیرفعال کردن',
    no_verification_method_warning:
      'شما روش تأیید دومی اضافه نکرده‌اید. برای فعال کردن تأیید دو مرحله‌ای هنگام ورود، حداقل یک روش اضافه کنید.',
    passkey_sign_in_prompt: 'درخواست تنظیم کلید عبور',
    passkey_sign_in_prompt_description:
      'وقتی فعال باشد، از شما خواسته می‌شود برای ورود سریع‌تر و امن‌تر یک کلید عبور تنظیم کنید.',
    account_removal: 'حذف حساب',
    delete_your_account: 'حساب خود را حذف کنید',
    delete_account: 'حذف حساب',
    remove_username_confirmation_title: 'حذف نام کاربری',
    remove_username_confirmation_description:
      'پس از حذف، دیگر نمی‌توانید با این نام کاربری وارد شوید. آیا مطمئن هستید که می‌خواهید ادامه دهید؟',
    remove_email_confirmation_title: 'حذف آدرس ایمیل',
    remove_email_confirmation_description:
      'پس از حذف، دیگر نمی‌توانید با این آدرس ایمیل وارد شوید. آیا مطمئن هستید که می‌خواهید ادامه دهید؟',
    remove_phone_confirmation_title: 'حذف شماره تلفن',
    remove_phone_confirmation_description:
      'پس از حذف، دیگر نمی‌توانید با این شماره تلفن وارد شوید. آیا مطمئن هستید که می‌خواهید ادامه دهید؟',
    email_removed: 'آدرس ایمیل با موفقیت حذف شد.',
    phone_removed: 'شماره تلفن با موفقیت حذف شد.',
    username_removed: 'نام کاربری با موفقیت حذف شد.',
  },
  social: {
    linked: '{{connector}} با موفقیت پیوند داده شد.',
    removed: '{{connector}} با موفقیت حذف شد.',
    not_enabled: 'این روش ورود اجتماعی فعال نیست. لطفاً برای کمک با مدیر خود تماس بگیرید.',
    remove_confirmation_title: 'حذف حساب اجتماعی',
    remove_confirmation_description:
      'اگر {{connector}} را حذف کنید، تا زمانی که دوباره آن را اضافه نکنید ممکن است نتوانید با آن وارد شوید.',
  },
  password: {
    title: 'تنظیم رمز عبور',
    description: 'برای ایمن‌سازی حساب خود یک رمز عبور جدید ایجاد کنید.',
    success: 'رمز عبور با موفقیت به‌روزرسانی شد.',
  },

  code_verification: {
    send: 'ارسال کد تأیید',
    resend: 'هنوز دریافت نکرده‌اید؟ <a>ارسال مجدد کد تأیید</a>',
    resend_countdown: 'هنوز دریافت نکرده‌اید؟ ارسال مجدد پس از {{seconds}} ثانیه',
  },

  email_verification: {
    title: 'ایمیل خود را تأیید کنید',
    prepare_description:
      'برای محافظت از امنیت حساب خود، هویتتان را تأیید کنید. کد تأیید را به ایمیل خود ارسال کنید.',
    email_label: 'آدرس ایمیل',
    send: 'ارسال کد تأیید',
    description: 'کد تأیید به ایمیل شما {{email}} ارسال شد. برای ادامه کد را وارد کنید.',
    resend: 'هنوز دریافت نکرده‌اید؟ <a>ارسال مجدد کد تأیید</a>',
    not_received: 'هنوز دریافت نکرده‌اید؟',
    resend_action: 'ارسال مجدد کد تأیید',
    resend_countdown: 'هنوز دریافت نکرده‌اید؟ ارسال مجدد پس از {{seconds}} ثانیه',
    error_send_failed: 'ارسال کد تأیید ناموفق بود. لطفاً بعداً دوباره تلاش کنید.',
    error_verify_failed: 'تأیید ناموفق بود. لطفاً کد را دوباره وارد کنید.',
    error_invalid_code: 'کد تأیید نامعتبر است یا منقضی شده است.',
  },
  phone_verification: {
    title: 'تلفن خود را تأیید کنید',
    prepare_description:
      'برای محافظت از امنیت حساب خود، هویتتان را تأیید کنید. کد تأیید را به تلفن خود ارسال کنید.',
    phone_label: 'شماره تلفن',
    send: 'ارسال کد تأیید',
    description: 'کد تأیید به تلفن شما {{phone}} ارسال شد. برای ادامه کد را وارد کنید.',
    resend: 'هنوز دریافت نکرده‌اید؟ <a>ارسال مجدد کد تأیید</a>',
    resend_countdown: 'هنوز دریافت نکرده‌اید؟ ارسال مجدد پس از {{seconds}} ثانیه',
    error_send_failed: 'ارسال کد تأیید ناموفق بود. لطفاً بعداً دوباره تلاش کنید.',
    error_verify_failed: 'تأیید ناموفق بود. لطفاً کد را دوباره وارد کنید.',
    error_invalid_code: 'کد تأیید نامعتبر است یا منقضی شده است.',
  },
  mfa: {
    totp_already_added:
      'شما قبلاً یک اپلیکیشن احراز هویت اضافه کرده‌اید. لطفاً ابتدا مورد موجود را حذف کنید.',
    totp_not_enabled:
      'رمز یک‌بارمصرف اپلیکیشن احراز هویت فعال نیست. لطفاً برای کمک با مدیر خود تماس بگیرید.',
    backup_code_already_added:
      'شما کدهای پشتیبان فعال دارید. لطفاً قبل از ایجاد کدهای جدید، آن‌ها را استفاده یا حذف کنید.',
    backup_code_not_enabled: 'کد پشتیبان فعال نیست. لطفاً برای کمک با مدیر خود تماس بگیرید.',
    backup_code_requires_other_mfa:
      'کدهای پشتیبان نیازمند تنظیم یک روش MFA دیگر به‌صورت اولیه هستند.',
    passkey_not_enabled: 'کلید عبور فعال نیست. لطفاً برای کمک با مدیر خود تماس بگیرید.',
    passkey_already_registered:
      'این کلید عبور قبلاً در حساب شما ثبت شده است. لطفاً از احرازکننده دیگری استفاده کنید.',
  },
  update_success: {
    default: {
      title: 'به‌روزرسانی موفق',
      description: 'تغییرات شما با موفقیت ذخیره شد.',
    },
    email: {
      title: 'آدرس ایمیل به‌روزرسانی شد!',
      description: 'آدرس ایمیل حساب شما با موفقیت تغییر کرد.',
    },
    phone: {
      title: 'شماره تلفن به‌روزرسانی شد!',
      description: 'شماره تلفن حساب شما با موفقیت تغییر کرد.',
    },
    username: {
      title: 'نام کاربری به‌روزرسانی شد!',
      description: 'نام کاربری حساب شما با موفقیت تغییر کرد.',
    },
    password: {
      title: 'رمز عبور به‌روزرسانی شد!',
      description: 'رمز عبور حساب شما با موفقیت تغییر کرد.',
    },
    totp: {
      title: 'اپلیکیشن احراز هویت اضافه شد!',
      description: 'اپلیکیشن احراز هویت شما با موفقیت به حساب شما پیوند داده شد.',
    },
    totp_replaced: {
      title: 'اپلیکیشن احراز هویت جایگزین شد!',
      description: 'اپلیکیشن احراز هویت شما با موفقیت جایگزین شد.',
    },
    backup_code: {
      title: 'کدهای پشتیبان ایجاد شد!',
      description: 'کدهای پشتیبان شما ذخیره شد. آن‌ها را در مکانی امن نگه دارید.',
    },
    passkey: {
      title: 'کلید عبور اضافه شد!',
      description: 'کلید عبور شما با موفقیت به حساب شما پیوند داده شد.',
    },
    social: {
      title: 'حساب اجتماعی پیوند داده شد!',
      description: 'حساب اجتماعی شما با موفقیت پیوند داده شد.',
    },
  },
  backup_code: {
    title: 'کدهای پشتیبان',
    description:
      'اگر هنگام تأیید دو مرحله‌ای از راه‌های دیگر با مشکل مواجه شدید، می‌توانید از یکی از این کدهای پشتیبان برای دسترسی به حساب خود استفاده کنید. هر کد فقط یک‌بار قابل استفاده است.',
    copy_hint: 'حتماً آن‌ها را کپی کرده و در مکانی امن ذخیره کنید.',
    generate_new_title: 'ایجاد کدهای پشتیبان جدید',
    generate_new: 'ایجاد کدهای پشتیبان جدید',
  },
  passkey: {
    title: 'کلیدهای عبور',
    added: 'اضافه‌شده: {{date}}',
    last_used: 'آخرین استفاده: {{date}}',
    never_used: 'هرگز',
    unnamed: 'کلید عبور بدون نام',
    renamed: 'نام کلید عبور با موفقیت تغییر کرد.',
    deleted: 'کلید عبور با موفقیت حذف شد.',
    add_another_title: 'افزودن کلید عبور دیگر',
    add_another_description:
      'کلید عبور خود را با استفاده از بیومتریک دستگاه، کلیدهای امنیتی (مانند YubiKey) یا سایر روش‌های موجود ثبت کنید.',
    add_passkey: 'افزودن کلید عبور',
    delete_confirmation_title: 'حذف کلید عبور شما',
    delete_confirmation_description:
      'اگر این کلید عبور را حذف کنید، دیگر نمی‌توانید با آن تأیید کنید.',
    rename_passkey: 'تغییر نام کلید عبور',
    rename_description: 'یک نام جدید برای این کلید عبور وارد کنید.',
    name_this_passkey: 'این کلید عبور دستگاه را نام‌گذاری کنید',
    name_passkey_description:
      'شما این دستگاه را با موفقیت برای احراز هویت دو مرحله‌ای تأیید کردید. برای تشخیص در صورت داشتن چند کلید، نام را سفارشی کنید.',
    name_input_label: 'نام',
  },
  sessions: {
    page_title: 'نشست‌ها',
    page_description: 'نشست‌های فعال و برنامه‌های شخص ثالث مجازشده خود را مدیریت کنید.',
    title: 'نشست‌ها',
    current_session: 'نشست فعلی',
    signed_in_at: 'ورود در {{date}}',
    revoke_session: 'خروج',
    revoke_session_title: 'خروج از نشست',
    revoke_session_description:
      'این کار از نشست خارج می‌شود و تمام دسترسی‌های مرتبط را لغو می‌کند. آیا مطمئن هستید که می‌خواهید ادامه دهید؟',
    no_other_sessions: 'نشست فعال دیگری وجود ندارد.',
    loading: 'در حال بارگذاری...',
    third_party_apps_title: 'برنامه‌های شخص ثالث',
    no_third_party_apps: 'هیچ برنامه شخص ثالث مجازشده‌ای وجود ندارد.',
    third_party_apps_load_failed:
      'بارگذاری برنامه‌های شخص ثالث ناموفق بود. لطفاً دوباره تلاش کنید.',
    granted_at: 'مجازشده در {{date}}',
    revoke_grant: 'حذف',
    revoke_grant_title: 'حذف دسترسی برنامه شخص ثالث',
    revoke_grant_description:
      'این کار تمام دسترسی‌های اعطاشده به این برنامه را لغو می‌کند. آیا مطمئن هستید که می‌خواهید ادامه دهید؟',
    revoke_grant_failed: 'لغو برخی از دسترسی‌ها ناموفق بود. لطفاً دوباره تلاش کنید.',
  },
};

export default Object.freeze(account_center);
