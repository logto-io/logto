const content = {
  terms_of_use: {
    title: 'شرایط',
    description: 'شرایط و حریم خصوصی را برای رعایت الزامات انطباق اضافه کنید.',
    terms_of_use: 'آدرس URL شرایط استفاده',
    terms_of_use_placeholder: 'https://your.terms.of.use/',
    privacy_policy: 'آدرس URL سیاست حریم خصوصی',
    privacy_policy_placeholder: 'https://your.privacy.policy/',
    agree_to_terms: 'موافقت با شرایط',
    agree_policies: {
      automatic: 'ادامه برای موافقت خودکار با شرایط',
      manual_registration_only: 'نیاز به تأیید چک‌باکس فقط در هنگام ثبت‌نام',
      manual: 'نیاز به تأیید چک‌باکس در هنگام ثبت‌نام و ورود',
    },
  },
  languages: {
    title: 'زبان‌ها',
    enable_auto_detect: 'فعال‌سازی تشخیص خودکار',
    description:
      'نرم‌افزار شما تنظیمات منطقه‌ای کاربر را تشخیص می‌دهد و به زبان محلی تغییر می‌کند. می‌توانید زبان‌های جدید را با ترجمه رابط کاربری از انگلیسی به زبان دیگری اضافه کنید.',
    manage_language: 'مدیریت زبان',
    default_language: 'زبان پیش‌فرض',
    default_language_description_auto:
      'زبان پیش‌فرض زمانی استفاده می‌شود که زبان تشخیص داده‌شده کاربر در کتابخانه زبان فعلی موجود نباشد.',
    default_language_description_fixed:
      'وقتی تشخیص خودکار خاموش است، زبان پیش‌فرض تنها زبانی است که نرم‌افزار شما نمایش می‌دهد. برای گسترش زبان، تشخیص خودکار را فعال کنید.',
  },
  support: {
    title: 'پشتیبانی',
    subtitle: 'کانال‌های پشتیبانی خود را در صفحات خطا برای کمک سریع به کاربران نمایش دهید.',
    support_email: 'ایمیل پشتیبانی',
    support_email_placeholder: 'support@email.com',
    support_website: 'وب‌سایت پشتیبانی',
    support_website_placeholder: 'https://your.website/support',
  },
  manage_language: {
    title: 'مدیریت زبان',
    subtitle:
      'با افزودن زبان‌ها و ترجمه‌ها، تجربه محصول را بومی‌سازی کنید. مشارکت شما می‌تواند به عنوان زبان پیش‌فرض تنظیم شود.',
    add_language: 'افزودن زبان',
    logto_provided: 'ارائه‌شده توسط Logto',
    key: 'کلید',
    logto_source_values: 'مقادیر منبع Logto',
    custom_values: 'مقادیر سفارشی',
    clear_all_tip: 'پاک کردن همه مقادیر',
    unsaved_description: 'اگر این صفحه را بدون ذخیره ترک کنید، تغییرات ذخیره نخواهند شد.',
    deletion_tip: 'حذف زبان',
    deletion_title: 'آیا می‌خواهید زبان اضافه‌شده را حذف کنید؟',
    deletion_description: 'پس از حذف، کاربران شما دیگر نمی‌توانند در آن زبان مرور کنند.',
    default_language_deletion_title: 'زبان پیش‌فرض قابل حذف نیست.',
    default_language_deletion_description:
      '{{language}} به عنوان زبان پیش‌فرض شما تنظیم شده است و قابل حذف نیست. ',
  },
};

export default Object.freeze(content);
