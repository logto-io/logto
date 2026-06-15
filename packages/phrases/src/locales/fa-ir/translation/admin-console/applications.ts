const applications = {
  page_title: 'برنامه‌ها',
  title: 'برنامه‌ها',
  subtitle: 'برنامه‌های OIDC را ایجاد و مدیریت کنید.',
  subtitle_with_app_type: 'احراز هویت Logto را برای برنامه {{name}} خود راه‌اندازی کنید',
  create_device_flow_description:
    'یک برنامه بومی ایجاد کنید که از OAuth 2.0 Device Authorization Grant برای دستگاه‌های با ورودی محدود یا برنامه‌های بدون رابط گرافیکی استفاده می‌کند.',
  create: 'ایجاد برنامه',
  create_third_party: 'ایجاد برنامه شخص ثالث',
  create_thrid_party_modal_title: 'ایجاد برنامه شخص ثالث ({{type}})',
  application_name: 'نام برنامه',
  application_name_placeholder: 'برنامه من',
  application_description: 'توضیحات برنامه',
  application_description_placeholder: 'توضیحات برنامه خود را وارد کنید',
  select_application_type: 'نوع برنامه را انتخاب کنید',
  no_application_type_selected: 'هنوز هیچ نوع برنامه‌ای انتخاب نکرده‌اید',
  application_created: 'برنامه با موفقیت ایجاد شد.',
  tab: {
    my_applications: 'برنامه‌های من',
    third_party_applications: 'برنامه‌های شخص ثالث',
  },
  app_id: 'شناسه برنامه',
  type: {
    native: {
      title: 'برنامه بومی',
      subtitle: 'برنامه‌ای که در محیط بومی اجرا می‌شود',
      description: 'مثال: برنامه iOS، برنامه Android، برنامه دسکتاپ، تلویزیون، CLI',
    },
    spa: {
      title: 'برنامه تک‌صفحه‌ای',
      subtitle:
        'برنامه‌ای که در مرورگر وب اجرا می‌شود و داده‌ها را به‌صورت پویا به‌روزرسانی می‌کند',
      description: 'مثال: برنامه React DOM، برنامه Vue',
    },
    traditional: {
      title: 'وب سنتی',
      subtitle: 'برنامه‌ای که صفحات را توسط سرور وب رندر و به‌روزرسانی می‌کند',
      description: 'مثال: Next.js، PHP',
    },
    machine_to_machine: {
      title: 'ماشین به ماشین',
      subtitle: 'برنامه‌ای (معمولاً یک سرویس) که مستقیماً با منابع ارتباط برقرار می‌کند',
      description: 'مثال: سرویس بک‌اند',
    },
    protected: {
      title: 'برنامه محافظت‌شده',
      subtitle: 'برنامه‌ای که توسط Logto محافظت می‌شود', // Not in use
      description: 'N/A', // Not in use
    },
    saml: {
      title: 'برنامه SAML',
      subtitle: 'برنامه‌ای که به‌عنوان اتصال‌دهنده SAML IdP استفاده می‌شود',
      description: 'مثال: SAML',
    },
    third_party: {
      title: 'برنامه شخص ثالث',
      subtitle: 'برنامه‌ای که به‌عنوان اتصال‌دهنده IdP شخص ثالث استفاده می‌شود',
      description: 'مثال: OIDC',
    },
  },
  authorization_flow: {
    title: 'جریان مجوزدهی',
    tooltip: 'جریان مجوزدهی برنامه خود را انتخاب کنید. پس از تنظیم، این قابل تغییر نیست.',
    authorization_code: {
      title: 'کد مجوز',
      description:
        'رایج‌ترین نوع grant پیش‌فرض. کاربران برای مجوز دسترسی مستقیم به صفحه ورود هدایت می‌شوند.',
    },
    device_flow: {
      title: 'جریان دستگاه',
      description:
        'برای دستگاه‌های با ورودی محدود یا برنامه‌های بدون رابط گرافیکی (مثل تلویزیون، CLI). کاربران با وارد کردن کد دستگاه یا اسکن کد QR از طریق دستگاه دیگری وارد می‌شوند.',
    },
  },
  placeholder_title: 'نوع برنامه را برای ادامه انتخاب کنید',
  placeholder_description:
    'Logto از یک موجودیت برنامه برای OIDC استفاده می‌کند تا در کارهایی مانند شناسایی برنامه‌ها، مدیریت ورود و ایجاد گزارش‌های حسابرسی کمک کند.',
  third_party_application_placeholder_description:
    'از Logto به‌عنوان Identity Provider برای ارائه مجوز OAuth به سرویس‌های شخص ثالث استفاده کنید. شامل یک صفحه رضایت کاربر از پیش‌ساخته برای دسترسی به منابع می‌شود. <a>بیشتر بدانید</a>',
  guide: {
    third_party: {
      title: 'یکپارچه‌سازی برنامه شخص ثالث',
      description:
        'از Logto به‌عنوان Identity Provider خود برای ارائه مجوز OAuth به سرویس‌های شخص ثالث استفاده کنید. شامل یک صفحه رضایت کاربر از پیش‌ساخته برای دسترسی ایمن به منابع می‌شود. <a>بیشتر بدانید</a>',
    },
  },
};

export default Object.freeze(applications);
