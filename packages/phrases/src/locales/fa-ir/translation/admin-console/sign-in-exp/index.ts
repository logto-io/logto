import content from './content.js';
import custom_profile_fields from './custom-profile-fields.js';
import sign_up_and_sign_in from './sign-up-and-sign-in.js';

const sign_in_exp = {
  page_title: 'تجربه ورود',
  page_title_with_account: 'ورود و حساب کاربری',
  title: 'ورود و حساب کاربری',
  description:
    'جریان‌های احراز هویت و رابط کاربری را سفارشی کنید و تجربه آماده را به صورت بلادرنگ پیش‌نمایش دهید.',
  tabs: {
    branding: 'برندینگ',
    sign_up_and_sign_in: 'ثبت‌نام و ورود',
    collect_user_profile: 'جمع‌آوری پروفایل کاربر',
    account_center: 'مرکز حساب',
    content: 'محتوا',
    password_policy: 'سیاست رمز عبور',
  },
  welcome: {
    title: 'سفارشی‌سازی تجربه ورود',
    description:
      'با اولین تنظیمات ورود خود سریع شروع کنید. این راهنما شما را از طریق تمام تنظیمات لازم هدایت می‌کند.',
    get_started: 'شروع کنید',
    apply_remind:
      'لطفاً توجه داشته باشید که تجربه ورود برای تمام برنامه‌های این حساب اعمال خواهد شد.',
  },
  color: {
    title: 'رنگ',
    primary_color: 'رنگ برند',
    dark_primary_color: 'رنگ برند (تاریک)',
    dark_mode: 'فعال‌سازی حالت تاریک',
    dark_mode_description:
      'برنامه شما یک تم حالت تاریک به صورت خودکار بر اساس رنگ برند و الگوریتم Logto خواهد داشت. می‌توانید آن را سفارشی کنید.',
    dark_mode_reset_tip: 'محاسبه مجدد رنگ حالت تاریک بر اساس رنگ برند.',
    reset: 'محاسبه مجدد',
  },
  branding: {
    title: 'ناحیه برندینگ',
    ui_style: 'سبک',
    with_light: '{{value}}',
    with_dark: '{{value}} (تاریک)',
    app_logo_and_favicon: 'لوگو برنامه و فاویکون',
    company_logo_and_favicon: 'لوگو شرکت و فاویکون',
    organization_logo_and_favicon: 'لوگو سازمان و فاویکون',
    hide_logto_branding: 'پنهان کردن برندینگ Logto',
    hide_logto_branding_description:
      'عبارت "Powered by Logto" را حذف کنید. برند خود را با یک تجربه ورود تمیز و حرفه‌ای برجسته کنید.',
    hide_logto_branding_oss_note: 'این ویژگی به طور بومی در <a>Logto Cloud</a> موجود است.',
  },
  branding_uploads: {
    app_logo: {
      title: 'لوگو برنامه',
      url: 'آدرس لوگو برنامه',
      url_placeholder: 'https://your.cdn.domain/logo.png',
      error: 'لوگو برنامه: {{error}}',
    },
    company_logo: {
      title: 'لوگو شرکت',
      url: 'آدرس لوگو شرکت',
      url_placeholder: 'https://your.cdn.domain/logo.png',
      error: 'لوگو شرکت: {{error}}',
    },
    organization_logo: {
      title: 'آپلود تصویر',
      url: 'آدرس لوگو سازمان',
      url_placeholder: 'https://your.cdn.domain/logo.png',
      error: 'لوگو سازمان: {{error}}',
    },
    connector_logo: {
      title: 'آپلود تصویر',
      url: 'آدرس لوگو اتصال‌دهنده',
      url_placeholder: 'https://your.cdn.domain/logo.png',
      error: 'لوگو اتصال‌دهنده: {{error}}',
    },
    favicon: {
      title: 'فاویکون',
      url: 'آدرس فاویکون',
      url_placeholder: 'https://your.cdn.domain/favicon.ico',
      error: 'فاویکون: {{error}}',
    },
  },
  custom_ui: {
    title: 'رابط کاربری سفارشی',
    cloud_tag: 'ابری',
    css_code_editor_title: 'CSS سفارشی',
    css_code_editor_field_title: 'بازنویسی CSS',
    css_code_editor_description1: 'نمونه CSS سفارشی را ببینید.',
    css_code_editor_description2: '<a>{{link}}</a>',
    css_code_editor_description_link_content: 'بیشتر بدانید',
    css_code_editor_content_placeholder:
      'بازنویسی‌های CSS خود را اینجا وارد کنید تا سبک‌ها را دقیقاً مطابق مشخصات خود تنظیم کنید. خلاقیت خود را نشان دهید و رابط کاربری خود را برجسته کنید.',
    bring_your_ui_title: 'رابط کاربری خود را بیاورید',
    bring_your_ui_upload_title: 'آپلود دارایی‌های رابط کاربری سفارشی',
    bring_your_ui_description:
      'یک بسته فشرده (.zip) آپلود کنید تا رابط کاربری از پیش‌ساخته Logto را با کد خود جایگزین کنید. <a>بیشتر بدانید</a>',
    bring_your_ui_oss_description: 'رابط کاربری ورود را با کد خود سفارشی کنید.',
    bring_your_ui_oss_card_description:
      'رابط کاربری ورود سفارشی خود را مستقیماً در <a>Logto Cloud</a> آپلود کنید. نیازی به fork و استقرار مجدد نیست.',
    bring_your_ui_oss_try_cloud: 'امتحان Cloud',
    preview_with_bring_your_ui_description:
      'دارایی‌های رابط کاربری سفارشی شما با موفقیت آپلود شده و در حال ارائه هستند. در نتیجه، پنجره پیش‌نمایش داخلی غیرفعال شده است.\nبرای آزمایش رابط کاربری ورود شخصی‌سازی‌شده خود، روی دکمه "پیش‌نمایش زنده" کلیک کنید تا در یک تب جدید مرورگر باز شود.',
    csp_description:
      'عبارات منبع اضافی برای رابط کاربری ورود سفارشی خود مجاز کنید. این مقادیر فقط زمانی اعمال می‌شوند که دارایی‌های رابط کاربری سفارشی ارائه می‌شوند.',
    csp_script_src: 'script-src مجاز',
    csp_script_src_tip:
      'عبارات منبع HTTPS برای اسکریپت‌های بارگذاری‌شده توسط رابط کاربری سفارشی را مجاز کنید، مانند https://scripts.example.com یا https://*.example.com.',
    csp_connect_src: 'connect-src مجاز',
    csp_connect_src_tip:
      'عبارات منبع HTTPS یا WSS برای درخواست‌های شبکه‌ای رابط کاربری سفارشی را مجاز کنید، مانند https://api.example.com یا wss://events.example.com.',
    csp_source_invalid_error:
      'یک عبارت منبع معتبر وارد کنید. از آدرس‌های https:// استفاده کنید؛ connect-src همچنین از wss:// پشتیبانی می‌کند. کلمات کلیدی CSP و نقطه‌ویرگول پشتیبانی نمی‌شوند.',
    csp_source_duplicate_error: 'این عبارت منبع قبلاً در لیست است.',
  },
  account_center: {
    title: 'مرکز حساب',
    description:
      'مرکز حساب کاربری خود را برای مدیریت امنیت حساب و اطلاعات پروفایل توسط کاربران نهایی پیاده‌سازی کنید.',
    enable_account_api: 'فعال‌سازی مرکز حساب و Account API',
    enable_account_api_description:
      'هم Account API کاربرمحور و هم مرکز حساب آماده Logto را فعال کنید. در صورت خاموش بودن، هر دو ویژگی در دسترس نیستند.',
    field_options: {
      off: 'خاموش',
      edit: 'ویرایش',
      read_only: 'فقط خواندنی',
      enabled: 'فعال',
      disabled: 'غیرفعال',
    },
    sections: {
      account_security: {
        title: 'امنیت حساب',
        description:
          'دسترسی به Account API را مدیریت کنید و به کاربران امکان مشاهده یا ویرایش اطلاعات هویتی و عوامل احراز هویت پس از ورود به برنامه را بدهید.',
        security_verification: {
          title: 'تأیید امنیتی',
          description:
            'قبل از تغییر تنظیمات امنیتی، کاربران باید هویت خود را تأیید کنند تا یک شناسه رکورد تأیید ۱۰ دقیقه‌ای دریافت کنند. برای فعال‌سازی روش تأیید (ایمیل، تلفن، رمز عبور)، مجوز Account API را به <strong>فقط خواندنی</strong> (حداقل) یا <strong>ویرایش</strong> در زیر تنظیم کنید تا سیستم بتواند تشخیص دهد آیا کاربر آن را پیکربندی کرده است. <a>بیشتر بدانید</a>',
        },
        groups: {
          identifiers: {
            title: 'شناسه‌ها',
          },
          authentication_factors: {
            title: 'عوامل احراز هویت',
          },
          session_management: {
            title: 'مدیریت نشست',
          },
        },
      },
      user_profile: {
        title: 'پروفایل کاربر',
        description:
          'دسترسی به Account API را مدیریت کنید و به کاربران امکان مشاهده یا ویرایش داده‌های پروفایل پایه یا سفارشی پس از ورود به برنامه را بدهید.',
        groups: {
          profile_data: {
            title: 'داده‌های پروفایل',
          },
        },
      },
      secret_vault: {
        title: 'خزانه راز',
        description:
          'برای اتصال‌دهنده‌های اجتماعی و سازمانی، توکن‌های دسترسی شخص ثالث را برای فراخوانی API‌های آن‌ها به صورت امن ذخیره کنید (مثلاً افزودن رویدادها به Google Calendar).',
        third_party_token_storage: {
          title: 'توکن شخص ثالث',
          third_party_access_token_retrieval: 'بازیابی توکن دسترسی شخص ثالث',
          third_party_token_tooltip:
            'برای ذخیره توکن‌ها، می‌توانید این را در تنظیمات اتصال‌دهنده اجتماعی یا سازمانی مربوطه فعال کنید.',
          third_party_token_description:
            'پس از فعال‌سازی Account API، بازیابی توکن شخص ثالث به طور خودکار فعال می‌شود.',
        },
      },
    },
    fields: {
      email: 'آدرس ایمیل',
      phone: 'شماره تلفن',
      social: 'هویت‌های اجتماعی',
      password: 'رمز عبور',
      mfa: 'احراز هویت چندعاملی',
      mfa_description: 'به کاربران اجازه دهید روش‌های MFA خود را از مرکز حساب مدیریت کنند.',
      passkey: 'کلید عبور',
      username: 'نام کاربری',
      name: 'نام',
      avatar: 'آواتار',
      profile: 'پروفایل',
      profile_description: 'کنترل دسترسی به ویژگی‌های پروفایل ساختاریافته.',
      custom_data: 'داده‌های سفارشی',
      custom_data_description: 'کنترل دسترسی به داده‌های JSON سفارشی ذخیره‌شده روی کاربر.',
      sessions: 'نشست‌ها',
    },
    profile_fields: {
      title: 'فیلدهای پروفایل برای مرکز حساب از پیش‌ساخته',
      add_profile_fields: 'افزودن فیلدهای پروفایل',
      hint: {
        not_in_list: 'در لیست نیست؟',
        set_up: 'تنظیم کنید',
        go_to: 'سایر فیلدهای پروفایل را اکنون.',
      },
      disabled_hint: {
        name: "برای افزودن این فیلد، ابتدا مجوز 'نام' را در بخش پروفایل کاربر زیر به 'ویرایش / فقط خواندنی' تنظیم کنید.",
        avatar:
          "برای افزودن این فیلد، ابتدا مجوز 'آواتار' را در بخش پروفایل کاربر زیر به 'ویرایش / فقط خواندنی' تنظیم کنید.",
        profile:
          "برای افزودن این فیلد، ابتدا مجوز 'پروفایل' را در بخش پروفایل کاربر زیر به 'ویرایش / فقط خواندنی' تنظیم کنید.",
        custom_data:
          "برای افزودن این فیلد، ابتدا مجوز 'داده‌های سفارشی' را در بخش پروفایل کاربر زیر به 'ویرایش / فقط خواندنی' تنظیم کنید.",
      },
    },
    webauthn_related_origins: 'مبدأهای مرتبط WebAuthn',
    webauthn_related_origins_description:
      'دامنه‌های برنامه‌های فرانت‌اند خود را که مجاز به ثبت کلیدهای عبور از طریق Account API هستند اضافه کنید.',
    webauthn_related_origins_error: 'مبدأ باید با https:// یا http:// شروع شود',
    delete_account_url: 'حذف حساب',
    delete_account_url_description:
      'آدرس endpoint خود را برای مدیریت حذف حساب با منطق سفارشی ارائه دهید.',
    prebuilt_ui: {
      title: 'یکپارچه‌سازی رابط کاربری از پیش‌ساخته',
      description:
        'مرکز حساب آماده، تأیید امنیتی یا یک جریان به‌روزرسانی پروفایل تکی را با رابط کاربری از پیش‌ساخته به سرعت یکپارچه کنید. کافی است دامنه خود را با مسیر ترکیب کنید تا آدرس مرکز حساب خود را بسازید (مثلاً https://auth.foo.com/account/email).',
      permission_notice:
        'برای یکپارچه‌سازی این جریان‌های از پیش‌ساخته، مجوزهای مرتبط Account API را در تنظیمات زیر به <strong>ویرایش</strong> تنظیم کنید.',
      account_center_title: 'یکپارچه‌سازی مرکز حساب آماده',
      account_center_description:
        'کاربران را به مرکز حساب هدایت کنید تا تنظیمات امنیتی مانند ایمیل، تلفن، نام کاربری، رمز عبور، MFA و حساب‌های متصل را مدیریت کنند.',
      flows_title: 'یکپارچه‌سازی جریان‌های تنظیمات امنیتی آماده',
      single_task_flows_title: 'یکپارچه‌سازی یک جریان تکلیف تکی آماده',
      flows_description:
        'دامنه خود را با مسیر ترکیب کنید تا آدرس تنظیمات حساب خود را بسازید (مثلاً https://auth.foo.com/account/email). به صورت اختیاری `redirect=` را برای بازگشت کاربران به برنامه پس از به‌روزرسانی موفق، `show_success=true` برای نگه داشتن صفحه موفقیت، `ui_locales=` برای بازنویسی زبان پیش‌فرض، یا `identifier=` برای پیش‌پر کردن فیلد شناسه اضافه کنید.',
      single_task_flows_description:
        'کاربران را مستقیماً به یک جریان خاص هدایت کنید (مثلاً اتصال ایمیل). به صورت اختیاری `redirect=` را برای بازگشت کاربران به برنامه پس از به‌روزرسانی موفق، `show_success=true` برای نگه داشتن صفحه موفقیت، `ui_locales=` برای بازنویسی زبان پیش‌فرض، یا `identifier=` برای پیش‌پر کردن فیلد شناسه اضافه کنید.',
      tooltips: {
        email: 'آدرس ایمیل اصلی خود را به‌روزرسانی کنید',
        phone: 'شماره تلفن اصلی خود را به‌روزرسانی کنید',
        username: 'نام کاربری خود را به‌روزرسانی کنید',
        password: 'یک رمز عبور جدید تنظیم کنید',
        social: 'یک حساب اجتماعی برای ورود متصل کنید',
        social_change: 'به حساب اجتماعی متصل دیگری تغییر دهید',
        social_remove: 'یک حساب اجتماعی متصل را حذف کنید',
        authenticator_app: 'یک برنامه احراز هویت جدید برای احراز هویت چندعاملی تنظیم کنید',
        authenticator_app_replace: 'برنامه احراز هویت موجود خود را با یک برنامه جدید جایگزین کنید',
        passkey_add: 'یک کلید عبور جدید ثبت کنید',
        passkey_manage: 'کلیدهای عبور موجود خود را مدیریت کنید یا موارد جدید اضافه کنید',
        backup_codes_generate: 'یک مجموعه جدید از ۱۰ کد پشتیبان تولید کنید',
        backup_codes_manage: 'کدهای پشتیبان موجود خود را مشاهده کنید یا موارد جدید تولید کنید',
        account_center:
          'به مرکز حساب دسترسی پیدا کنید تا تنظیمات امنیتی مانند ایمیل، تلفن، نام کاربری، رمز عبور، MFA و حساب‌های متصل را مدیریت کنید',
        profile: 'مرکز اصلی برای مدیریت اطلاعات شخصی شما (مثلاً نام، آواتار)',
        sessions: 'نشست‌های فعال خود را در دستگاه‌های مختلف مشاهده و مدیریت کنید',
      },
      customize_note: 'تجربه آماده را نمی‌خواهید؟ می‌توانید کاملاً',
      customize_link: 'جریان‌های خود را با Account API سفارشی کنید.',
    },
    custom_css: {
      title: 'CSS سفارشی',
      description: 'ظاهر مرکز حساب را با استفاده از CSS سفارشی شخصی‌سازی کنید.',
    },
  },
  sign_up_and_sign_in,
  content,
  setup_warning: {
    no_connector_sms:
      'هنوز هیچ اتصال‌دهنده SMS تنظیم نشده است. قبل از تکمیل پیکربندی، کاربران قادر به ورود با این روش نخواهند بود. <a>{{link}}</a> در "اتصال‌دهنده‌ها"',
    no_connector_email:
      'هنوز هیچ اتصال‌دهنده ایمیل تنظیم نشده است. قبل از تکمیل پیکربندی، کاربران قادر به ورود با این روش نخواهند بود. <a>{{link}}</a> در "اتصال‌دهنده‌ها"',
    no_connector_social:
      'هنوز هیچ اتصال‌دهنده اجتماعی تنظیم نکرده‌اید. ابتدا اتصال‌دهنده‌ها را اضافه کنید تا روش‌های ورود اجتماعی را اعمال کنید. <a>{{link}}</a> در "اتصال‌دهنده‌ها".',
    no_connector_email_account_center:
      'هنوز هیچ اتصال‌دهنده ایمیل تنظیم نشده است. در <a>"اتصال‌دهنده‌های ایمیل و SMS"</a> تنظیم کنید.',
    no_connector_sms_account_center:
      'هنوز هیچ اتصال‌دهنده SMS تنظیم نشده است. در <a>"اتصال‌دهنده‌های ایمیل و SMS"</a> تنظیم کنید.',
    no_connector_social_account_center:
      'هنوز هیچ اتصال‌دهنده اجتماعی تنظیم نشده است. در <a>"اتصال‌دهنده‌های اجتماعی"</a> تنظیم کنید.',
    no_mfa_factor: 'هنوز هیچ عامل MFA تنظیم نشده است. در <a>{{link}}</a> تنظیم کنید.',
    setup_link: 'تنظیم کنید',
  },
  save_alert: {
    description:
      'شما در حال پیاده‌سازی روش‌های جدید ورود و ثبت‌نام هستید. همه کاربران شما ممکن است تحت تأثیر تنظیمات جدید قرار گیرند. آیا مطمئن هستید که می‌خواهید این تغییر را اعمال کنید؟',
    before: 'قبل',
    after: 'بعد',
    sign_up: 'ثبت‌نام',
    sign_in: 'ورود',
    social: 'اجتماعی',
    forgot_password_migration_notice:
      'تأیید فراموشی رمز عبور را برای پشتیبانی از روش‌های سفارشی ارتقا داده‌ایم. قبلاً این به طور خودکار توسط اتصال‌دهنده‌های ایمیل و SMS شما تعیین می‌شد. برای تکمیل ارتقا روی <strong>تأیید</strong> کلیک کنید.',
  },
  preview: {
    title: 'پیش‌نمایش ورود',
    live_preview: 'پیش‌نمایش زنده',
    live_preview_tip: 'برای پیش‌نمایش تغییرات ذخیره کنید',
    native: 'بومی',
    desktop_web: 'وب دسکتاپ',
    mobile_web: 'وب موبایل',
    desktop: 'دسکتاپ',
    mobile: 'موبایل',
  },
  custom_profile_fields,
};

export default Object.freeze(sign_in_exp);
