const enterprise_sso_details = {
  back_to_sso_connectors: 'بازگشت به SSO سازمانی',
  page_title: 'جزئیات اتصال‌دهنده SSO سازمانی',
  readme_drawer_title: 'SSO سازمانی',
  readme_drawer_subtitle:
    'اتصال‌دهنده‌های SSO سازمانی را برای فعال‌سازی SSO کاربران نهایی تنظیم کنید',
  tab_experience: 'تجربه SSO',
  tab_connection: 'اتصال',
  tab_idp_initiated_auth: 'SSO آغازشده توسط IdP',
  general_settings_title: 'عمومی',
  general_settings_description:
    'تجربه کاربر نهایی را پیکربندی کرده و دامنه ایمیل سازمانی را برای جریان SSO آغازشده توسط SP پیوند دهید.',
  custom_branding_title: 'نمایش',
  custom_branding_description:
    'نام و لوگوی نمایش‌داده‌شده در جریان ورود یکپارچه کاربران نهایی را سفارشی کنید. در صورت خالی بودن، مقادیر پیش‌فرض استفاده می‌شوند.',
  email_domain_field_name: 'دامنه‌های ایمیل سازمانی',
  email_domain_field_description:
    'کاربران با این دامنه‌های ایمیل می‌توانند از SSO برای احراز هویت استفاده کنند. لطفاً قبل از افزودن، مالکیت دامنه را تأیید کنید.',
  email_domain_field_placeholder: 'یک یا چند دامنه ایمیل وارد کنید (مثلاً yourcompany.com)',
  sync_profile_field_name: 'همگام‌سازی اطلاعات پروفایل از ارائه‌دهنده هویت',
  sync_profile_option: {
    register_only: 'فقط در اولین ورود همگام‌سازی شود',
    each_sign_in: 'همیشه در هر ورود همگام‌سازی شود',
  },
  connector_name_field_name: 'نام اتصال‌دهنده',
  display_name_field_name: 'نام نمایشی',
  connector_logo_field_name: 'لوگوی نمایشی',
  connector_logo_field_description:
    'هر تصویر باید کمتر از ۵۰۰ کیلوبایت باشد، فقط SVG، PNG، JPG، JPEG.',
  branding_logo_context: 'بارگذاری لوگو',
  branding_logo_error: 'خطا در بارگذاری لوگو: {{error}}',
  branding_light_logo_context: 'بارگذاری لوگوی حالت روشن',
  branding_light_logo_error: 'خطا در بارگذاری لوگوی حالت روشن: {{error}}',
  branding_logo_field_name: 'لوگو',
  branding_logo_field_placeholder: 'https://your.domain/logo.png',
  branding_dark_logo_context: 'بارگذاری لوگوی حالت تاریک',
  branding_dark_logo_error: 'خطا در بارگذاری لوگوی حالت تاریک: {{error}}',
  branding_dark_logo_field_name: 'لوگو (حالت تاریک)',
  branding_dark_logo_field_placeholder: 'https://your.domain/dark-mode-logo.png',
  check_connection_guide: 'راهنمای اتصال',
  enterprise_sso_deleted: 'اتصال‌دهنده SSO سازمانی با موفقیت حذف شد',
  delete_confirm_modal_title: 'حذف اتصال‌دهنده SSO سازمانی',
  delete_confirm_modal_content:
    'آیا مطمئن هستید که می‌خواهید این اتصال‌دهنده سازمانی را حذف کنید؟ کاربران از ارائه‌دهندگان هویت دیگر نمی‌توانند از ورود یکپارچه استفاده کنند.',
  upload_idp_metadata_title_saml: 'بارگذاری متادیتا',
  upload_idp_metadata_description_saml: 'متادیتای کپی‌شده از ارائه‌دهنده هویت را پیکربندی کنید.',
  upload_idp_metadata_title_oidc: 'بارگذاری اعتبارنامه‌ها',
  upload_idp_metadata_description_oidc:
    'اعتبارنامه‌ها و اطلاعات توکن OIDC کپی‌شده از ارائه‌دهنده هویت را پیکربندی کنید.',
  upload_idp_metadata_button_text: 'بارگذاری فایل XML متادیتا',
  upload_signing_certificate_button_text: 'بارگذاری فایل گواهی امضا',
  configure_domain_field_info_text:
    'دامنه ایمیل را اضافه کنید تا کاربران سازمانی به ارائه‌دهنده هویت خود برای ورود یکپارچه هدایت شوند.',
  email_domain_field_required: 'برای فعال‌سازی SSO سازمانی، دامنه ایمیل الزامی است.',
  upload_saml_idp_metadata_info_text_url:
    'آدرس URL متادیتا از ارائه‌دهنده هویت را برای اتصال جای‌گذاری کنید.',
  upload_saml_idp_metadata_info_text_xml:
    'متادیتا از ارائه‌دهنده هویت را برای اتصال جای‌گذاری کنید.',
  upload_saml_idp_metadata_info_text_manual: 'متادیتا از ارائه‌دهنده هویت را برای اتصال پر کنید.',
  upload_oidc_idp_info_text: 'اطلاعات ارائه‌دهنده هویت را برای اتصال پر کنید.',
  service_provider_property_title: 'پیکربندی در IdP',
  service_provider_property_description:
    'یک یکپارچه‌سازی برنامه با استفاده از {{protocol}} در ارائه‌دهنده هویت خود تنظیم کنید. جزئیات ارائه‌شده توسط Logto را وارد کنید.',
  attribute_mapping_title: 'نگاشت ویژگی‌ها',
  attribute_mapping_description:
    'پروفایل‌های کاربر را از ارائه‌دهنده هویت با پیکربندی نگاشت ویژگی‌های کاربر از ارائه‌دهنده هویت به سمت Logto همگام‌سازی کنید.',
  saml_preview: {
    sign_on_url: 'آدرس URL ورود',
    entity_id: 'صادرکننده',
    x509_certificate: 'گواهی امضا',
    certificate_content: 'منقضی می‌شود در {{date}}',
  },
  oidc_preview: {
    authorization_endpoint: 'نقطه پایانی مجوز',
    token_endpoint: 'نقطه پایانی توکن',
    userinfo_endpoint: 'نقطه پایانی اطلاعات کاربر',
    jwks_uri: 'نقطه پایانی مجموعه کلید وب JSON',
    issuer: 'صادرکننده',
  },
  idp_initiated_auth_config: {
    card_title: 'SSO آغازشده توسط IdP',
    card_description:
      'کاربران معمولاً فرایند احراز هویت را از برنامه شما با استفاده از جریان SSO آغازشده توسط SP شروع می‌کنند. این ویژگی را فعال نکنید مگر در موارد کاملاً ضروری.',
    enable_idp_initiated_sso: 'فعال‌سازی SSO آغازشده توسط IdP',
    enable_idp_initiated_sso_description:
      'به کاربران سازمانی اجازه دهید فرایند احراز هویت را مستقیماً از پورتال ارائه‌دهنده هویت شروع کنند. لطفاً قبل از فعال‌سازی این ویژگی، خطرات امنیتی احتمالی را درک کنید.',
    default_application: 'برنامه پیش‌فرض',
    default_application_tooltip: 'برنامه هدفی که کاربر پس از احراز هویت به آن هدایت می‌شود.',
    empty_applications_error:
      'هیچ برنامه‌ای یافت نشد. لطفاً یکی را در بخش <a>برنامه‌ها</a> اضافه کنید.',
    empty_applications_placeholder: 'هیچ برنامه‌ای وجود ندارد',
    authentication_type: 'نوع احراز هویت',
    auto_authentication_disabled_title: 'هدایت به کلاینت برای SSO آغازشده توسط SP',
    auto_authentication_disabled_description:
      'توصیه‌شده. کاربران را به برنامه سمت کلاینت هدایت کنید تا احراز هویت OIDC امن آغازشده توسط SP را آغاز کنند. این از حملات CSRF جلوگیری می‌کند.',
    auto_authentication_enabled_title: 'ورود مستقیم با استفاده از SSO آغازشده توسط IdP',
    auto_authentication_enabled_description:
      'پس از ورود موفق، کاربران با کد مجوز به URI تغییر مسیر مشخص‌شده هدایت می‌شوند (بدون اعتبارسنجی state و PKCE).',
    auto_authentication_disabled_app: 'برای برنامه وب سنتی، برنامه تک‌صفحه‌ای (SPA)',
    auto_authentication_enabled_app: 'برای برنامه وب سنتی',
    idp_initiated_auth_callback_uri: 'URI بازگشتی کلاینت',
    idp_initiated_auth_callback_uri_tooltip:
      'URI بازگشتی کلاینت برای آغاز جریان احراز هویت SSO آغازشده توسط SP. یک ssoConnectorId به عنوان پارامتر query به URI اضافه می‌شود. (مثلاً https://your.domain/sso/callback?connectorId={{ssoConnectorId}})',
    redirect_uri: 'URI تغییر مسیر پس از ورود',
    redirect_uri_tooltip:
      'URI تغییر مسیر برای هدایت کاربران پس از ورود موفق. Logto از این URI به عنوان URI تغییر مسیر OIDC در درخواست مجوز استفاده می‌کند. برای امنیت بیشتر، از یک URI اختصاصی برای جریان احراز هویت SSO آغازشده توسط IdP استفاده کنید.',
    empty_redirect_uris_error:
      'هیچ URI تغییر مسیری برای برنامه ثبت نشده است. لطفاً ابتدا یکی اضافه کنید.',
    redirect_uri_placeholder: 'یک URI تغییر مسیر پس از ورود انتخاب کنید',
    auth_params: 'پارامترهای احراز هویت اضافی',
    auth_params_tooltip:
      'پارامترهای اضافی برای ارسال در درخواست مجوز. به طور پیش‌فرض فقط دامنه‌های (openid profile) درخواست می‌شوند، می‌توانید دامنه‌های اضافی یا یک مقدار state انحصاری در اینجا مشخص کنید. (مثلاً { "scope": "organizations email", "state": "secret_state" }).',
  },
  trust_unverified_email: 'اعتماد به ایمیل تأیید نشده',
  trust_unverified_email_label:
    'همیشه به آدرس‌های ایمیل تأیید نشده بازگشتی از ارائه‌دهنده هویت اعتماد کنید',
  trust_unverified_email_tip:
    'اتصال‌دهنده Entra ID (OIDC) ادعای `email_verified` را برنمی‌گرداند، به این معنی که آدرس‌های ایمیل از Azure تضمین نمی‌شوند که تأیید شده باشند. به طور پیش‌فرض، Logto آدرس‌های ایمیل تأیید نشده را با پروفایل کاربر همگام‌سازی نمی‌کند. این گزینه را فقط در صورتی فعال کنید که به تمام آدرس‌های ایمیل از دایرکتوری Entra ID اعتماد دارید.',
  trust_unverified_email_tip_oidc:
    'اتصال‌دهنده OIDC ممکن است ادعای `email_verified` را برنگرداند، به این معنی که آدرس‌های ایمیل از ارائه‌دهنده هویت تضمین نمی‌شوند که تأیید شده باشند. به طور پیش‌فرض، Logto آدرس‌های ایمیل تأیید نشده را با پروفایل کاربر همگام‌سازی نمی‌کند. این گزینه را فقط در صورتی فعال کنید که به تمام آدرس‌های ایمیل از ارائه‌دهنده هویت اعتماد دارید.',
  offline_access: {
    label: 'بازنوسازی توکن دسترسی',
    description:
      'دسترسی `offline` گوگل را فعال کنید تا یک توکن بازنوسازی درخواست شود و برنامه شما بتواند توکن دسترسی را بدون نیاز به تأیید مجدد کاربر بازنوسازی کند.',
  },
};

export default Object.freeze(enterprise_sso_details);
