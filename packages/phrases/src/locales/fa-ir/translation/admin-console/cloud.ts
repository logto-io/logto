const cloud = {
  console_sso: {
    back_to_list: 'بازگشت به ورود یکپارچه کنسول',
    create: 'افزودن اتصال\u200Cدهنده',
    title: 'ورود یکپارچه کنسول',
    description:
      'ارائه‌دهنده هویت خود را پیکربندی کنید تا با ورود یکپارچه به Logto Console وارد شوید.',
    domain_bound: 'متصل',
    domain_pending: 'در حال تأیید',
    domain_add_placeholder: 'افزودن دامنه ایمیل',
    domain_bound_description:
      'این دامنه برای Console SSO فعال است. رکورد TXT تأیید آن حذف شده است.',
    domain_dns_instructions:
      'برای تأیید مالکیت دامنه، این رکورد TXT را نزد ارائه\u200Cدهنده DNS خود اضافه کنید.',
    domain_waiting_for_dns: 'در انتظار رکورد TXT. هر ۱۰ ثانیه دوباره بررسی می\u200Cکنیم.',
    domain_proven_unbound: 'مالکیت دامنه تأیید شده، اما اتصال کامل نشده است.',
    domain_remove_description:
      '{{domain}} از Console SSO حذف شود؟ حذف دامنه متصل، شناسایی SSO را برای نشانی\u200Cهای ایمیل آن متوقف می\u200Cکند.',
    domain_invalid: 'یک دامنه ایمیل معتبر وارد کنید.',
    domain_conflict: 'این دامنه قبلاً به رابط Console SSO دیگری متصل شده است.',
    domain_invalid_provider: 'پیش از اتصال این دامنه، تنظیمات اتصال را کامل کنید.',
    domain_dns_timeout: 'بررسی DNS ناموفق بود. به\u200Cطور خودکار دوباره تلاش می\u200Cکنیم.',
    domain_recovery: 'تغییر دامنه کامل نشده است.',
    start_over: 'شروع دوباره',
    start_over_confirmation:
      'شروع دوباره ممکن است پیکربندی ناتمام SSO شما را حذف کند. آیا می‌خواهید ادامه دهید؟',
    resume_creation:
      'یک عملیات ایجاد ناتمام پیدا شد. برای بازیابی این اتصال‌دهنده با همان ارائه‌دهنده ادامه دهید.',
  },
  general: {
    onboarding: 'آشنایی با سیستم',
  },
  create_tenant: {
    page_title: 'ایجاد مستأجر',
    title: 'اولین مستأجر خود را ایجاد کنید',
    description:
      'مستأجر یک محیط ایزوله است که در آن می‌توانید هویت‌های کاربری، برنامه‌ها و تمام منابع دیگر Logto را مدیریت کنید.',
    invite_collaborators: 'همکاران خود را از طریق ایمیل دعوت کنید',
    hear_about_us: {
      title: 'اولین بار چگونه با Logto آشنا شدید؟',
      detail_placeholder: 'بیشتر برایمان بگویید (اختیاری)',
      options: {
        search_engine: 'موتور جستجو (Google، Bing...)',
        ai_assistant: 'دستیار هوش مصنوعی (ChatGPT، Claude، Gemini...)',
        github_oss: 'GitHub یا دایرکتوری‌های متن‌باز',
        friend_colleague: 'دوست یا همکار',
        powered_by: 'صفحه ورود برنامه‌ای که از Logto استفاده می‌کند',
        content_social: 'شبکه‌های اجتماعی، مقاله یا ویدیو (YouTube، X، Reddit...)',
        other: 'سایر',
      },
    },
  },
  social_callback: {
    title: 'شما با موفقیت وارد شدید',
    description:
      'شما با موفقیت با استفاده از حساب اجتماعی خود وارد شده‌اید. برای اطمینان از یکپارچه‌سازی بدون مشکل و دسترسی به تمام ویژگی‌های Logto، توصیه می‌کنیم که اتصال‌دهنده اجتماعی خود را پیکربندی کنید.',
    notice:
      'لطفاً از اتصال‌دهنده آزمایشی برای اهداف تولیدی استفاده نکنید. پس از اتمام آزمایش، لطفاً اتصال‌دهنده آزمایشی را حذف کرده و اتصال‌دهنده خود را با اطلاعات کاربری خود تنظیم کنید.',
  },
  tenant: {
    create_tenant: 'ایجاد مستأجر',
  },
};

export default Object.freeze(cloud);
