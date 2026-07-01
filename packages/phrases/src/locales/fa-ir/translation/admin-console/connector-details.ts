const connector_details = {
  page_title: 'جزئیات کانکتور',
  back_to_connectors: 'بازگشت به کانکتورها',
  check_readme: 'مشاهده README',
  settings: 'تنظیمات عمومی',
  settings_description:
    'ادغام با ارائه‌دهندگان شخص ثالث برای ورود سریع اجتماعی و اتصال حساب اجتماعی',
  setting_description_with_token_storage_supported:
    'ادغام با ارائه‌دهندگان شخص ثالث برای ورود سریع اجتماعی، اتصال حساب اجتماعی و دسترسی به API.',
  email_connector_settings_description:
    'ادغام با ارائه‌دهنده سرویس ایمیل برای فعال‌سازی ثبت‌نام و ورود بدون رمز عبور از طریق ایمیل برای کاربران.',
  parameter_configuration: 'پیکربندی پارامترها',
  test_connection: 'آزمایش',
  save_error_empty_config: 'لطفاً پیکربندی را وارد کنید',
  send: 'ارسال',
  send_error_invalid_format: 'ورودی نامعتبر',
  edit_config_label: 'JSON خود را اینجا وارد کنید',
  test_email_sender: 'کانکتور ایمیل خود را آزمایش کنید',
  test_sms_sender: 'کانکتور پیامک خود را آزمایش کنید',
  test_email_placeholder: 'john.doe@example.com',
  test_sms_placeholder: '+1 555-123-4567',
  test_message_sent: 'پیام آزمایشی ارسال شد',
  test_sender_description:
    'Logto از قالب "عمومی" برای آزمایش استفاده می‌کند. اگر کانکتور شما به درستی پیکربندی شده باشد، یک پیام دریافت خواهید کرد.',
  options_change_email: 'تغییر کانکتور ایمیل',
  options_change_sms: 'تغییر کانکتور پیامک',
  connector_deleted: 'کانکتور با موفقیت حذف شد',
  type_email: 'کانکتور ایمیل',
  type_sms: 'کانکتور پیامک',
  type_social: 'کانکتور اجتماعی',
  in_used_social_deletion_description:
    'این کانکتور در تجربه ورود شما استفاده می‌شود. با حذف آن، تجربه ورود <name/> از تنظیمات تجربه ورود حذف خواهد شد. اگر تصمیم به افزودن مجدد آن گرفتید، باید دوباره پیکربندی کنید.',
  in_used_passwordless_deletion_description:
    'این {{name}} در تجربه ورود شما استفاده می‌شود. با حذف آن، تجربه ورود شما تا زمان رفع تعارض به درستی کار نخواهد کرد. اگر تصمیم به افزودن مجدد آن گرفتید، باید دوباره پیکربندی کنید.',
  deletion_description:
    'در حال حذف این کانکتور هستید. این عمل قابل بازگشت نیست و اگر تصمیم به افزودن مجدد آن گرفتید، باید دوباره پیکربندی کنید.',
  logto_email: {
    total_email_sent: 'مجموع ایمیل‌های ارسال‌شده: {{value, number}}',
    total_email_sent_tip:
      'Logto از SendGrid برای ایمیل داخلی امن و پایدار استفاده می‌کند. استفاده از آن کاملاً رایگان است. <a>بیشتر بدانید</a>',
    hosted_email_usage: {
      daily: 'روزانه <value>{{usage, number}}</value> / {{limit, number}}',
      daily_unlimited: 'روزانه <value>{{usage, number}}</value>',
      monthly: 'ماهانه <value>{{usage, number}}</value> / {{limit, number}}',
      monthly_unlimited: 'ماهانه <value>{{usage, number}}</value>',
      tip: 'طرح‌های Free و Development شامل محدودیت‌های روزانه و ماهانه ایمیل داخلی هستند.',
    },
    email_template_title: 'قالب ایمیل',
    template_description:
      'ایمیل داخلی از قالب‌های پیش‌فرض برای تحویل یکپارچه ایمیل‌های تأیید استفاده می‌کند. هیچ پیکربندی لازم نیست و می‌توانید اطلاعات برند پایه را سفارشی کنید.',
    template_description_link_text: 'مشاهده قالب‌ها',
    description_action_text: 'مشاهده قالب‌ها',
    from_email_field: 'ایمیل فرستنده',
    sender_name_field: 'نام فرستنده',
    sender_name_tip:
      'نام فرستنده برای ایمیل‌ها را سفارشی کنید. اگر خالی بماند، "Verification" به عنوان نام پیش‌فرض استفاده می‌شود.',
    sender_name_placeholder: 'نام فرستنده شما',
    company_information_field: 'اطلاعات شرکت',
    company_information_description:
      'نام، آدرس یا کد پستی شرکت خود را در پایین ایمیل‌ها نمایش دهید تا اعتبار را افزایش دهید.',
    company_information_placeholder: 'اطلاعات پایه شرکت شما',
    email_logo_field: 'لوگوی ایمیل',
    email_logo_tip:
      'لوگوی برند خود را در بالای ایمیل‌ها نمایش دهید. از یک تصویر برای هر دو حالت روشن و تاریک استفاده کنید.',
    urls_not_allowed: 'آدرس‌های URL مجاز نیستند',
    test_notes: 'Logto از قالب "عمومی" برای آزمایش استفاده می‌کند.',
  },
  google_one_tap: {
    title: 'Google One Tap',
    description: 'Google One Tap روشی امن و آسان برای ورود کاربران به وب‌سایت شما است.',
    enable_google_one_tap: 'فعال‌سازی Google One Tap',
    enable_google_one_tap_description:
      'Google One Tap را در تجربه ورود خود فعال کنید: به کاربران اجازه دهید اگر قبلاً در دستگاهشان وارد شده‌اند، به سرعت با حساب Google خود ثبت‌نام یا وارد شوند.',
    configure_google_one_tap: 'پیکربندی Google One Tap',
    auto_select: 'انتخاب خودکار اعتبار در صورت امکان',
    close_on_tap_outside: 'لغو درخواست در صورت کلیک/لمس خارج از آن توسط کاربر',
    itp_support: 'فعال‌سازی <a>تجربه کاربری ارتقایافته One Tap در مرورگرهای ITP</a>',
  },
  sign_in_experience: {
    in_use: 'برای ورود فعال است ',
    not_in_use: 'برای ورود غیرفعال است ',
  },
};

export default Object.freeze(connector_details);
