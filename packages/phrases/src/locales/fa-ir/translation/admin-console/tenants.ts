const tenants = {
  title: 'تنظیمات',
  description: 'تنظیمات مستأجر را به‌صورت کارآمد مدیریت و دامنه خود را سفارشی کنید.',
  oss_description:
    'تنظیمات حساب خود را تغییر دهید و اطلاعات شخصی را برای اطمینان از امنیت حساب مدیریت کنید.',
  tabs: {
    settings: 'تنظیمات',
    members: 'اعضا',
    domains: 'دامنه‌ها',
    oidc_configs: 'پیکربندی OIDC',
    subscription: 'طرح و صورتحساب',
    billing_history: 'تاریخچه صورتحساب',
    license: 'مجوز',
  },
  license: {
    purchase_title: 'پلن‌های self-hosted',
    purchase_description:
      'پلن‌های حرفه‌ای و سازمانی self-hosted قابلیت‌های پولی را روی نمونه خودتان باز می‌کنند؛ مانند پنهان کردن برند Logto، استفاده از رابط کاربری خودتان، SSO آغازشده توسط IdP، همکاری در کنسول و برنامه‌های SAML نامحدود. برای دریافت کلید مجوز، یک پلن بخرید.',
    purchase_button: 'مشاهده پلن‌های self-hosted',
    install_title: 'نصب مجوز',
    install_description:
      'کلید مجوزی را که پس از خرید پلن self-hosted دریافت کرده‌اید جای‌گذاری کنید.',
    install_button: 'نصب مجوز',
    key_field: 'کلید مجوز',
    key_field_description:
      'کلید روی نمونه شما بررسی می‌شود و هرگز از آن خارج نمی‌شود. اگر کلید فعلی منقضی شده است، کلید تازه‌ای را از حساب Logto خود بگیرید.',
    key_placeholder: 'کلید مجوز خود را اینجا جای‌گذاری کنید',
    installed_toast: 'مجوز با موفقیت نصب شد.',
    details_title: 'مجوز',
    details_description: 'مجوز نصب‌شده روی این نمونه و آنچه اعطا می‌کند.',
    plan_field: 'پلن',
    environment_field: 'محیط',
    environment_production: 'تولید',
    environment_non_production: 'غیرتولیدی',
    expires_at_field: 'تاریخ انقضا',
    installed_at_field: 'تاریخ نصب',
    replace_button: 'جایگزینی مجوز',
  },
  members: {
    card_title: 'مدیریت امن‌تر مستأجرها با Logto Cloud',
    card_description:
      'مدیران یا همکاران را به مستأجر خود اضافه کنید بدون اشتراک‌گذاری یک حساب مدیر.',
    card_action: 'کشف Logto Cloud',
    self_hosted_card_title: 'مدیریت امن‌تر مستأجرها با طرح‌های self-hosted',
    self_hosted_card_description:
      'مدیران یا همکاران را به مستأجر خود اضافه کنید بدون اشتراک‌گذاری یک حساب مدیر.',
    self_hosted_card_action: 'کشف طرح‌های self-hosted',
  },
  settings: {
    title: 'تنظیمات',
    description: 'نام مستأجر را تنظیم کنید و منطقه میزبانی داده و نوع مستأجر را مشاهده کنید.',
    tenant_id: 'شناسه مستأجر',
    tenant_name: 'نام مستأجر',
    tenant_instance: 'نمونه خود را انتخاب کنید',
    tenant_instance_description:
      'محل میزبانی مستأجر خود را انتخاب کنید. Logto Cloud را برای زیرساخت اشتراکی عمومی یا نمونه خصوصی برای منابع اختصاصی انتخاب کنید.',
    tenant_region: 'منطقه داده',
    tenant_region_description:
      'مکان فیزیکی منابع مستأجر شما (کاربران، برنامه‌ها و غیره). پس از ایجاد قابل تغییر نیست.',
    tenant_region_tip: 'منابع مستأجر شما در {{region}} میزبانی می‌شوند. <a>بیشتر بدانید</a>',
    environment_tag_development: 'توسعه',
    environment_tag_production: 'تولید',
    tenant_type: 'نوع مستأجر',
    development_description:
      'فقط برای آزمایش و نباید در تولید استفاده شود. اشتراک لازم نیست. همه ویژگی‌های حرفه‌ای را دارد اما محدودیت‌هایی مانند بنر ورود دارد.',
    production_description:
      'برای برنامه‌هایی که توسط کاربران نهایی استفاده می‌شوند و ممکن است اشتراک پولی نیاز داشته باشند.',
    tenant_info_saved: 'اطلاعات مستأجر با موفقیت ذخیره شد.',
    tenant_mfa: 'احراز هویت چندعاملی',
    tenant_mfa_description:
      'از اعضای خود بخواهید احراز هویت چندعاملی را برای دسترسی به این مستأجر راه‌اندازی کنند.',
    enterprise_sso: 'SSO سازمانی',
    enterprise_sso_description:
      'در طرح‌های پولی در دسترس است. برای فعال‌سازی SSO سازمانی تا همه اعضا بتوانند با ارائه‌دهنده هویت سازمان خود به کنسول Logto Cloud وارد شوند، با ما تماس بگیرید.',
  },
  full_env_tag: {
    development: 'توسعه',
    production: 'تولید',
  },
  deletion_card: {
    title: 'حذف',
    tenant_deletion: 'حذف مستأجر',
    tenant_deletion_description:
      'حذف مستأجر منجر به حذف دائمی همه داده‌های کاربر و پیکربندی مرتبط می‌شود. لطفاً با احتیاط ادامه دهید.',
    tenant_deletion_button: 'حذف مستأجر',
  },
  leave_tenant_card: {
    title: 'خروج',
    leave_tenant: 'خروج از مستأجر',
    leave_tenant_description:
      'منابع مستأجر باقی می‌مانند اما دیگر به این مستأجر دسترسی نخواهید داشت.',
    last_admin_note: 'برای خروج از این مستأجر، مطمئن شوید حداقل یک عضو دیگر نقش مدیر دارد.',
  },
  create_modal: {
    title: 'ایجاد مستأجر',
    subtitle: 'مستأجر جدیدی با منابع و کاربران جدا ایجاد کنید.',
    tenant_id: 'شناسه مستأجر',
    tenant_usage_purpose: 'این مستأجر را برای چه استفاده‌ای می‌خواهید؟',
    development_description: 'فقط برای آزمایش و نباید در تولید استفاده شود. اشتراک لازم نیست.',
    development_description_for_private_regions: 'فقط برای آزمایش و نباید در تولید استفاده شود.',
    development_hint: 'همه ویژگی‌های حرفه‌ای را دارد اما محدودیت‌هایی مانند بنر ورود دارد.',
    production_description: 'برای استفاده کاربران نهایی و ممکن است اشتراک پولی نیاز داشته باشد.',
    available_plan: 'طرح در دسترس:',
    create_button: 'ایجاد مستأجر',
    tenant_name_placeholder: 'مستأجر من',
    tenant_created: 'مستأجر با موفقیت ایجاد شد.',
    invitation_failed:
      'برخی دعوت‌نامه‌ها ارسال نشدند. لطفاً بعداً در تنظیمات -> اعضا دوباره تلاش کنید.',
    tenant_type_description: 'پس از ایجاد قابل تغییر نیست.',
    tenant_id_invalid:
      'شناسه مستأجر فقط می‌تواند شامل حروف کوچک، اعداد و خط تیره باشد و نباید از {{max}} کاراکتر بیشتر شود.',
    tenant_id_placeholder: 'شناسه مستأجر شما',
    tenant_id_tip:
      'شناسه مستأجر را سفارشی کنید. اگر خالی بماند، Logto شناسه پیش‌فرض تولید می‌کند. شناسه مستأجر پس از ایجاد قابل تغییر نیست.',
  },
  dev_tenant_migration: {
    title: 'اکنون می‌توانید ویژگی‌های Pro را رایگان با ایجاد «مستأجر توسعه» جدید امتحان کنید!',
    affect_title: 'این چه تأثیری بر شما دارد؟',
    hint_1:
      'ما <strong>برچسب‌های محیط</strong> قدیمی را با دو نوع مستأجر جدید جایگزین می‌کنیم: <strong>«توسعه»</strong> و <strong>«تولید»</strong>.',
    hint_2:
      'برای انتقال روان و بدون وقفه، همه مستأجرهای ایجادشده زودهنگام به نوع مستأجر <strong>تولید</strong> همراه با اشتراک قبلی شما ارتقا می‌یابند.',
    hint_3: 'نگران نباشید، همه تنظیمات دیگر شما بدون تغییر می‌ماند.',
    about_tenant_type: 'درباره نوع مستأجر',
  },
  delete_modal: {
    title: 'حذف مستأجر',
    description_line1:
      'آیا مطمئن هستید که می‌خواهید مستأجر «<span>{{name}}</span>» با برچسب پسوند محیط «<span>{{tag}}</span>» را حذف کنید؟ این عمل قابل بازگشت نیست و منجر به حذف دائمی همه داده‌ها و اطلاعات مستأجر می‌شود.',
    description_line2:
      'قبل از حذف مستأجر، شاید بتوانیم کمک کنیم. <span><a>از طریق ایمیل با ما تماس بگیرید</a></span>',
    description_line3:
      'اگر می‌خواهید ادامه دهید، لطفاً نام مستأجر «<span>{{name}}</span>» را برای تأیید وارد کنید.',
    delete_button: 'حذف دائمی',
    cannot_delete_title: 'نمی‌توان این مستأجر را حذف کرد',
    cannot_delete_description:
      'متأسفیم، فعلاً نمی‌توانید این مستأجر را حذف کنید. لطفاً مطمئن شوید در طرح رایگان هستید و همه صورتحساب‌های معوق را پرداخت کرده‌اید.',
  },
  leave_tenant_modal: {
    description: 'آیا مطمئن هستید که می‌خواهید از این مستأجر خارج شوید؟',
    leave_button: 'خروج',
  },
  tenant_landing_page: {
    title: 'هنوز مستأجری ایجاد نکرده‌اید',
    description:
      'برای شروع پیکربندی پروژه با Logto، لطفاً مستأجر جدیدی ایجاد کنید. اگر می‌خواهید خارج شوید یا حساب را حذف کنید، روی دکمه آواتار در گوشه بالا سمت راست کلیک کنید.',
    create_tenant_button: 'ایجاد مستأجر',
  },
  status: {
    mau_exceeded: 'MAU بیش از حد',
    token_exceeded: 'توکن بیش از حد',
    suspended: 'معلق',
    overdue: 'معوق',
  },
  tenant_suspended_page: {
    title: 'مستأجر معلق شد. برای بازیابی دسترسی با ما تماس بگیرید.',
    description_1:
      'با تأسف اطلاع می‌دهیم حساب مستأجر شما به‌دلیل استفاده نادرست، از جمله تجاوز از محدودیت MAU، پرداخت‌های معوق یا اقدامات غیرمجاز دیگر، موقتاً معلق شده است.',
    description_2:
      'اگر توضیح بیشتری نیاز دارید، نگرانی دارید یا می‌خواهید عملکرد کامل بازیابی و مستأجرها را از مسدودیت خارج کنید، فوراً با ما تماس بگیرید.',
  },
  production_tenant_notification: {
    text: 'شما در مستأجر توسعه برای آزمایش رایگان هستید. برای انتشار، یک مستأجر تولید ایجاد کنید.',
    action: 'ایجاد مستأجر',
  },
};

export default Object.freeze(tenants);
