const profile = {
  link_account: {
    anonymous: 'ناشناس',
  },

  delete_account: {
    title: 'حذف حساب',
    label: 'حذف حساب',
    description:
      'حذف حساب شما همه اطلاعات شخصی، داده‌های کاربر و پیکربندی را حذف می‌کند. این عمل قابل بازگشت نیست.',
    button: 'حذف حساب',
    p: {
      has_issue:
        'متأسفیم که می‌خواهید حساب خود را حذف کنید. قبل از حذف حساب باید مسائل زیر را حل کنید.',
      after_resolved:
        'پس از حل مسائل می‌توانید حساب را حذف کنید. در صورت نیاز به کمک با ما تماس بگیرید.',
      check_information:
        'متأسفیم که می‌خواهید حساب خود را حذف کنید. لطفاً قبل از ادامه اطلاعات زیر را با دقت بررسی کنید.',
      remove_all_data:
        'حذف حساب شما همه داده‌های مربوط به شما در Logto Cloud را برای همیشه حذف می‌کند. لطفاً قبل از ادامه داده‌های مهم را پشتیبان بگیرید.',
      confirm_information:
        'لطفاً تأیید کنید اطلاعات بالا همان چیزی است که انتظار داشتید. پس از حذف حساب، امکان بازیابی نخواهیم داشت.',
      has_admin_role: 'از آنجا که نقش مدیر در مستأجر زیر دارید، همراه با حساب شما حذف می‌شود:',
      has_admin_role_other:
        'از آنجا که نقش مدیر در مستأجرهای زیر دارید، همراه با حساب شما حذف می‌شوند:',
      quit_tenant: 'در حال خروج از مستأجر زیر هستید:',
      quit_tenant_other: 'در حال خروج از مستأجرهای زیر هستید:',
    },
    issues: {
      paid_plan: 'مستأجر زیر طرح پولی دارد، لطفاً ابتدا اشتراک را لغو کنید:',
      paid_plan_other: 'مستأجرهای زیر طرح پولی دارند، لطفاً ابتدا اشتراک را لغو کنید:',
      subscription_status: 'مستأجر زیر مشکل وضعیت اشتراک دارد:',
      subscription_status_other: 'مستأجرهای زیر مشکل وضعیت اشتراک دارند:',
      open_invoice: 'مستأجر زیر صورتحساب باز دارد:',
      open_invoice_other: 'مستأجرهای زیر صورتحساب باز دارند:',
    },
    error_occurred: 'خطایی رخ داد',
    error_occurred_description: 'متأسفیم، هنگام حذف حساب مشکلی پیش آمد:',
    request_id: 'شناسه درخواست: {{requestId}}',
    try_again_later:
      'لطفاً بعداً دوباره تلاش کنید. اگر مشکل ادامه داشت، با تیم Logto و شناسه درخواست تماس بگیرید.',
    final_confirmation: 'تأیید نهایی',
    about_to_start_deletion: 'در حال شروع فرایند حذف هستید و این عمل قابل بازگشت نیست.',
    permanently_delete: 'حذف دائمی',
  },

  fields: {
    name: 'نام',
    name_description: 'نام کامل کاربر در قالب قابل نمایش شامل همه اجزای نام (مثلاً «Jane Doe»).',
    avatar: 'آواتار',
    avatar_description: 'URL تصویر آواتار کاربر.',
    familyName: 'نام خانوادگی',
    familyName_description: 'نام خانوادگی کاربر (مثلاً «Doe»).',
    givenName: 'نام',
    givenName_description: 'نام کوچک کاربر (مثلاً «Jane»).',
    middleName: 'نام میانی',
    middleName_description: 'نام میانی کاربر (مثلاً «Marie»).',
    nickname: 'نام مستعار',
    nickname_description: 'نام غیررسمی یا آشنا برای کاربر که ممکن است با نام قانونی متفاوت باشد.',
    preferredUsername: 'نام کاربری ترجیحی',
    preferredUsername_description: 'شناسه کوتاهی که کاربر می‌خواهد با آن شناخته شود.',
    profile: 'پروفایل',
    profile_description:
      'URL صفحه پروفایل قابل خواندن توسط انسان کاربر (مثلاً پروفایل شبکه اجتماعی).',
    website: 'وب‌سایت',
    website_description: 'URL وب‌سایت شخصی یا وبلاگ کاربر.',
    gender: 'جنسیت',
    gender_description: 'جنسیت خودشناسایی‌شده کاربر (مثلاً «زن»، «مرد»، «غیردودویی»)',
    birthdate: 'تاریخ تولد',
    birthdate_description: 'تاریخ تولد کاربر در قالب مشخص (مثلاً «MM-dd-yyyy»).',
    zoneinfo: 'منطقه زمانی',
    zoneinfo_description:
      'منطقه زمانی کاربر در قالب IANA (مثلاً «America/New_York» یا «Europe/Paris»).',
    locale: 'زبان',
    locale_description: 'زبان کاربر در قالب IETF BCP 47 (مثلاً «en-US» یا «zh-CN»).',
    address: {
      formatted: 'آدرس',
      streetAddress: 'آدرس خیابان',
      locality: 'شهر',
      region: 'استان',
      postalCode: 'کد پستی',
      country: 'کشور',
    },
    address_description:
      'آدرس کامل کاربر در قالب قابل نمایش شامل همه اجزای آدرس (مثلاً «123 Main St, Anytown, USA 12345»).',
    fullname: 'نام کامل',
    fullname_description: 'ترکیب انعطاف‌پذیر familyName، givenName و middleName بر اساس پیکربندی.',
  },
};

export default Object.freeze(profile);
