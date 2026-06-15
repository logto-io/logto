import concurrent_device_limit from './concurrent-device-limit.js';

const application_details = {
  page_title: 'جزئیات برنامه',
  back_to_applications: 'بازگشت به برنامه‌ها',
  check_guide: 'مشاهده راهنما',
  settings: 'تنظیمات',
  settings_description:
    '"برنامه" یک نرم‌افزار یا سرویس ثبت‌شده است که می‌تواند به اطلاعات کاربر دسترسی داشته باشد یا به نمایندگی از کاربر عمل کند. برنامه‌ها کمک می‌کنند تشخیص دهیم چه کسی چه چیزی از Logto می‌خواهد و ورود و مجوزها را مدیریت می‌کنند. فیلدهای الزامی را برای احراز هویت پر کنید.',
  integration: 'یکپارچه‌سازی',
  integration_description:
    'با کارگران ایمن Logto، که توسط شبکه لبه Cloudflare برای عملکرد برتر و شروع سرد ۰ میلی‌ثانیه‌ای در سراسر جهان پشتیبانی می‌شود، استقرار دهید.',
  service_configuration: 'پیکربندی سرویس',
  service_configuration_description: 'پیکربندی‌های لازم را در سرویس خود تکمیل کنید.',
  session: 'نشست',
  endpoints_and_credentials: 'نقاط پایانی و اعتبارنامه‌ها',
  endpoints_and_credentials_description:
    'از نقاط پایانی و اعتبارنامه‌های زیر برای تنظیم اتصال OIDC در برنامه خود استفاده کنید.',
  refresh_token_settings: 'توکن بازیابی',
  refresh_token_settings_description: 'قوانین توکن بازیابی این برنامه را مدیریت کنید.',
  machine_logs: 'گزارش‌های ماشین',
  application_name: 'نام برنامه',
  application_name_placeholder: 'برنامه من',
  description: 'توضیحات',
  description_placeholder: 'توضیحات برنامه خود را وارد کنید',
  config_endpoint: 'نقطه پایانی پیکربندی ارائه‌دهنده OpenID',
  issuer_endpoint: 'نقطه پایانی صادرکننده',
  jwks_uri: 'URI مجموعه کلیدهای JSON (JWKS)',
  authorization_endpoint: 'نقطه پایانی مجوز',
  authorization_endpoint_tip:
    'نقطه پایانی برای انجام احراز هویت و مجوز. برای <a>احراز هویت</a> OpenID Connect استفاده می‌شود.',
  show_endpoint_details: 'نمایش جزئیات نقطه پایانی',
  hide_endpoint_details: 'پنهان کردن جزئیات نقطه پایانی',
  logto_endpoint: 'نقطه پایانی Logto',
  application_id: 'شناسه برنامه',
  application_id_tip:
    'شناسه منحصربه‌فرد برنامه که معمولاً توسط Logto تولید می‌شود. همچنین به عنوان "<a>client_id</a>" در OpenID Connect شناخته می‌شود.',
  application_secret: 'رمز برنامه',
  application_secret_other: 'رمزهای برنامه',
  redirect_uri: 'URI هدایت',
  redirect_uris: 'URI‌های هدایت',
  redirect_uri_placeholder: 'https://your.website.com/app',
  redirect_uri_placeholder_native: 'io.logto://callback',
  redirect_uri_tip:
    'URI که پس از ورود کاربر (موفق یا ناموفق) هدایت می‌شود. برای اطلاعات بیشتر به <a>AuthRequest</a> OpenID Connect مراجعه کنید.',
  mixed_redirect_uri_warning:
    'نوع برنامه شما با حداقل یکی از URI‌های هدایت سازگار نیست. این با بهترین شیوه‌ها مطابقت ندارد و ما به شدت توصیه می‌کنیم URI‌های هدایت را یکسان نگه دارید.',
  wildcard_redirect_uri_warning:
    'URI‌های هدایت با عام‌جایگزین استاندارد OIDC نیستند و می‌توانند سطح حمله را افزایش دهند. با احتیاط استفاده کنید و در صورت امکان از URI‌های هدایت دقیق استفاده کنید.',
  post_sign_out_redirect_uri: 'URI هدایت پس از خروج',
  post_sign_out_redirect_uris: 'URI‌های هدایت پس از خروج',
  post_sign_out_redirect_uri_placeholder: 'https://your.website.com/home',
  post_sign_out_redirect_uri_tip:
    'URI که پس از خروج کاربر هدایت می‌شود (اختیاری). ممکن است در برخی انواع برنامه تأثیر عملی نداشته باشد.',
  cors_allowed_origins: 'مبداهای مجاز CORS',
  cors_allowed_origins_placeholder: 'https://your.website.com',
  cors_allowed_origins_tip:
    'به طور پیش‌فرض، تمام مبداهای URI‌های هدایت مجاز خواهند بود. معمولاً هیچ اقدامی برای این فیلد لازم نیست. برای اطلاعات دقیق به <a>مستندات MDN</a> مراجعه کنید.',
  token_endpoint: 'نقطه پایانی توکن',
  user_info_endpoint: 'نقطه پایانی اطلاعات کاربر',
  enable_admin_access: 'فعال‌سازی دسترسی مدیر',
  enable_admin_access_label:
    'فعال یا غیرفعال کردن دسترسی به Management API. پس از فعال‌سازی، می‌توانید از توکن‌های دسترسی برای فراخوانی Management API به نمایندگی از این برنامه استفاده کنید.',
  always_issue_refresh_token: 'همیشه توکن بازیابی صادر کن',
  always_issue_refresh_token_label:
    'هنگامی که فعال است، Logto همیشه توکن‌های بازیابی صادر می‌کند، صرف‌نظر از اینکه `prompt=consent` در درخواست احراز هویت ارائه شده باشد یا نه. با این حال، این رویه توصیه نمی‌شود مگر در صورت نیاز، زیرا با OpenID Connect سازگار نیست و ممکن است مشکلاتی ایجاد کند.',
  refresh_token_ttl: 'مدت زمان زندگی توکن بازیابی (TTL) به روز',
  refresh_token_ttl_tip:
    'مدت زمانی که توکن بازیابی می‌تواند برای درخواست توکن‌های دسترسی جدید استفاده شود قبل از اینکه منقضی و نامعتبر شود. درخواست‌های توکن TTL توکن بازیابی را به این مقدار تمدید می‌کنند.',
  rotate_refresh_token: 'چرخش توکن بازیابی',
  rotate_refresh_token_label:
    'هنگامی که فعال است، Logto یک توکن بازیابی جدید برای درخواست‌های توکن صادر می‌کند زمانی که ۷۰٪ از مدت زمان زندگی اصلی (TTL) گذشته باشد یا شرایط خاصی برآورده شود. <a>بیشتر بدانید</a>',
  rotate_refresh_token_label_for_public_clients:
    'هنگامی که فعال است، Logto برای هر درخواست توکن یک توکن بازیابی جدید صادر می‌کند. <a>بیشتر بدانید</a>',
  backchannel_logout: 'خروج از کانال پشتی',
  backchannel_logout_description:
    'نقطه پایانی خروج از کانال پشتی OpenID Connect را پیکربندی کنید و مشخص کنید آیا نشست برای این برنامه الزامی است.',
  backchannel_logout_uri: 'URI خروج از کانال پشتی',
  backchannel_logout_uri_session_required: 'آیا نشست الزامی است؟',
  backchannel_logout_uri_session_required_description:
    'هنگامی که فعال است، RP نیاز دارد که یک ادعای `sid` (شناسه نشست) در توکن خروج گنجانده شود تا نشست RP را با OP هنگام استفاده از `backchannel_logout_uri` شناسایی کند.',
  token_exchange: 'تبادل توکن',
  token_exchange_description: 'تنظیمات تبادل توکن این برنامه را مدیریت کنید.',
  allow_token_exchange: 'اجازه تبادل توکن',
  allow_token_exchange_description:
    'به این برنامه اجازه دهید درخواست‌های تبادل توکن را آغاز کند. این برای <impersonationLink>جعل هویت کاربر</impersonationLink> و <patLink>توکن‌های دسترسی شخصی</patLink> الزامی است.',
  allow_token_exchange_public_client_warning:
    'فعال‌سازی تبادل توکن برای کلاینت‌های عمومی (برنامه تک‌صفحه‌ای / برنامه بومی) توصیه نمی‌شود. کلاینت‌های عمومی نمی‌توانند اعتبارنامه‌ها را به طور ایمن ذخیره کنند، که ممکن است برنامه شما را در معرض خطرات جعل هویت توکن قرار دهد.',
  device_flow_tag: 'جریان دستگاه',
  device_flow_notification:
    'این برنامه جریان مجوز دستگاه OAuth 2.0 را برای دستگاه‌های با ورودی محدود یا برنامه‌های بدون رابط کاربری (مانند تلویزیون‌ها، CLI) فعال می‌کند. کاربران ورود را در یک دستگاه جداگانه با وارد کردن کد دستگاه یا اسکن کد QR تکمیل می‌کنند. <a>بیشتر بدانید</a>',
  device_flow_try_demo: 'نسخه آزمایشی را امتحان کنید',
  delete_description:
    'این عمل قابل بازگشت نیست. برنامه را به طور دائمی حذف خواهد کرد. لطفاً نام برنامه <span>{{name}}</span> را برای تأیید وارد کنید.',
  enter_your_application_name: 'نام برنامه خود را وارد کنید',
  application_deleted: 'برنامه {{name}} با موفقیت حذف شد',
  redirect_uri_required: 'باید حداقل یک URI هدایت وارد کنید',
  app_domain_description_1:
    'می‌توانید از دامنه خود با {{domain}} که توسط Logto پشتیبانی می‌شود و برای همیشه معتبر است استفاده کنید.',
  app_domain_description_2:
    'می‌توانید از دامنه خود <domain>{{domain}}</domain> که برای همیشه معتبر است استفاده کنید.',
  custom_rules: 'قوانین احراز هویت سفارشی',
  custom_rules_placeholder: '^/(admin|privacy)/.+$',
  custom_rules_description:
    'قوانینی با عبارات منظم برای مسیرهای نیازمند احراز هویت تنظیم کنید. پیش‌فرض: محافظت کامل از سایت اگر خالی باشد.',
  authentication_routes: 'مسیرهای احراز هویت',
  custom_rules_tip:
    "در اینجا دو سناریوی نمونه وجود دارد:<ol><li>برای محافظت فقط از مسیرهای '/admin' و '/privacy' با احراز هویت: ^/(admin|privacy)/.*</li><li>برای حذف تصاویر JPG از احراز هویت: ^(?!.*\\.jpg$).*$</li></ol>",
  authentication_routes_description:
    'دکمه احراز هویت خود را با استفاده از مسیرهای مشخص شده هدایت کنید. توجه: این مسیرها قابل جایگزینی نیستند.',
  protect_origin_server: 'از سرور مبدا خود محافظت کنید',
  protect_origin_server_description:
    'اطمینان حاصل کنید که سرور مبدا شما از دسترسی مستقیم محافظت می‌شود. برای <a>دستورالعمل‌های دقیق‌تر</a> به راهنما مراجعه کنید.',
  third_party_settings_description:
    'برنامه‌های شخص ثالث را با Logto به عنوان ارائه‌دهنده هویت (IdP) با استفاده از OIDC / OAuth 2.0 یکپارچه کنید، با صفحه رضایت برای مجوز کاربر.',
  session_duration: 'مدت زمان نشست (روز)',
  try_it: 'امتحان کنید',
  no_organization_placeholder: 'سازمانی یافت نشد. <a>به سازمان‌ها بروید</a>',
  field_custom_data: 'داده سفارشی',
  field_custom_data_tip:
    'اطلاعات سفارشی اضافی برنامه که در ویژگی‌های از پیش تعریف‌شده برنامه فهرست نشده، مانند تنظیمات و پیکربندی‌های خاص کسب‌وکار.',
  custom_data_invalid: 'داده سفارشی باید یک شی JSON معتبر باشد',
  access_control: {
    name: 'قوانین',
    title: 'کنترل دسترسی',
    description: 'قوانین خود را برای کنترل دسترسی سطح برنامه سفارشی کنید.',
    enable: 'فعال‌سازی کنترل دسترسی سطح برنامه',
    enable_description:
      'کنترل دسترسی دقیق را فعال کنید تا محدود کنید کدام کاربران می‌توانند به این برنامه دسترسی داشته باشند. اگر غیرفعال باشد، تمام کاربران ثبت‌شده در سیستم می‌توانند به آن دسترسی داشته باشند.',
    enable_without_rules_notice: 'قبل از فعال‌سازی کنترل دسترسی، حداقل یک قانون دسترسی اضافه کنید.',
    load_error: 'بارگذاری قوانین کنترل دسترسی ناموفق بود.',
    custom_allow_rules: 'قوانین مجاز سفارشی',
    custom_allow_rules_description:
      'قوانینی ایجاد کنید تا کاربران با ویژگی‌های خاص بتوانند به طور خودکار دسترسی داشته باشند. هنگام فعال بودن حداقل یک قانون الزامی است.',
    rules: 'قوانین دسترسی',
    add_rules: 'افزودن قوانین',
    rules_description:
      'کاربران می‌توانند به این برنامه دسترسی داشته باشند اگر با هر یک از قوانین پیکربندی‌شده مطابقت داشته باشند.',
    empty_rules_description: 'هنوز هیچ قانونی پیکربندی نشده است.',
    delete_rule_confirmation: 'آیا مطمئنید که می‌خواهید این قانون را حذف کنید؟',
    rule_table_rules: 'قوانین',
    rule_table_description: 'توضیحات',
    rule_table_users: 'کاربران',
    rule_table_members: 'اعضا',
    rule_table_user_id: 'شناسه کاربر',
    rule_count: '{{count}} قانون',
    rule_count_other: '{{count}} قانون',
    rule_users: 'کاربران',
    rule_users_description: 'کاربران خاص می‌توانند به این برنامه دسترسی داشته باشند.',
    rule_roles: 'نقش‌ها',
    rule_user_roles: 'نقش‌های کاربری',
    rule_user_roles_description:
      'کاربرانی که به نقش‌های کاربری انتخاب‌شده تخصیص داده شده‌اند می‌توانند به این برنامه دسترسی داشته باشند.',
    rule_organizations: 'سازمان‌ها',
    rule_organizations_description:
      'تمام اعضای فعلی و آینده سازمان‌های انتخاب‌شده می‌توانند به این برنامه دسترسی داشته باشند.',
    rule_organization_roles: 'نقش‌های سازمانی',
    rule_organization_roles_description:
      'اعضایی که نقش‌های سازمانی انتخاب‌شده را در سازمان‌های انتخاب‌شده دارند می‌توانند به این برنامه دسترسی داشته باشند.',
  },
  branding: {
    name: 'برندینگ',
    description: 'لوگو و رنگ برند برنامه خود را برای تجربه سطح برنامه سفارشی کنید.',
    description_third_party: 'نام نمایشی و لوگوی برنامه خود را در صفحه رضایت سفارشی کنید.',
    app_logo: 'لوگوی برنامه',
    app_level_sie: 'تجربه ورود سطح برنامه',
    app_level_sie_switch:
      'تجربه ورود سطح برنامه را فعال کنید و برندینگ خاص برنامه را تنظیم کنید. اگر غیرفعال باشد، از تجربه ورود همه‌جانبه استفاده می‌شود.',
    more_info: 'اطلاعات بیشتر',
    more_info_description:
      'جزئیات بیشتری درباره برنامه خود را در صفحه رضایت به کاربران ارائه دهید.',
    display_name: 'نام نمایشی',
    application_logo: 'لوگوی برنامه',
    application_logo_dark: 'لوگوی برنامه (تاریک)',
    brand_color: 'رنگ برند',
    brand_color_dark: 'رنگ برند (تاریک)',
    terms_of_use_url: 'URL شرایط استفاده برنامه',
    privacy_policy_url: 'URL سیاست حریم خصوصی برنامه',
  },
  permissions: {
    name: 'مجوزها',
    description:
      'مجوزهایی را که برنامه شخص ثالث برای مجوز کاربر جهت دسترسی به انواع داده خاص نیاز دارد انتخاب کنید.',
    user_permissions: 'داده‌های شخصی کاربر',
    organization_permissions: 'دسترسی سازمان',
    table_name: 'اعطای مجوزها',
    field_name: 'مجوز',
    field_description: 'در صفحه رضایت نمایش داده می‌شود',
    delete_text: 'حذف مجوز',
    permission_delete_confirm:
      'این عمل مجوزهای اعطاشده به برنامه شخص ثالث را لغو می‌کند و مانع از درخواست مجوز کاربر برای انواع داده خاص می‌شود. آیا مطمئنید که می‌خواهید ادامه دهید؟',
    permissions_assignment_description:
      'مجوزهایی را که برنامه شخص ثالث برای مجوز کاربر جهت دسترسی به انواع داده خاص درخواست می‌کند انتخاب کنید.',
    user_profile: 'داده‌های کاربر',
    api_permissions: 'مجوزهای API',
    organization: 'مجوزهای سازمان',
    user_permissions_assignment_form_title: 'افزودن مجوزهای پروفایل کاربر',
    organization_permissions_assignment_form_title: 'افزودن مجوزهای سازمان',
    api_resource_permissions_assignment_form_title: 'افزودن مجوزهای منبع API',
    user_data_permission_description_tips:
      'می‌توانید توضیحات مجوزهای داده شخصی کاربر را از طریق "تجربه ورود > محتوا > مدیریت زبان" تغییر دهید',
    permission_description_tips:
      'هنگامی که Logto به عنوان یک ارائه‌دهنده هویت (IdP) برای احراز هویت در برنامه‌های شخص ثالث استفاده می‌شود و از کاربران مجوز درخواست می‌شود، این توضیحات در صفحه رضایت نمایش داده می‌شود.',
    user_title: 'کاربر',
    user_description:
      'مجوزهای درخواست‌شده توسط برنامه شخص ثالث برای دسترسی به داده‌های کاربر خاص را انتخاب کنید.',
    grant_user_level_permissions: 'اعطای مجوزهای داده کاربر',
    organization_title: 'سازمان',
    organization_description:
      'مجوزهای درخواست‌شده توسط برنامه شخص ثالث برای دسترسی به داده‌های سازمان خاص را انتخاب کنید.',
    grant_organization_level_permissions: 'اعطای مجوزهای داده سازمان',
    oidc_title: 'OIDC',
    oidc_description:
      'مجوزهای اصلی OIDC به طور خودکار برای برنامه شما پیکربندی می‌شوند. این دامنه‌ها برای احراز هویت ضروری هستند و در صفحه رضایت کاربر نمایش داده نمی‌شوند.',
    default_oidc_permissions: 'مجوزهای پیش‌فرض OIDC',
    permission_column: 'مجوز',
    guide_column: 'راهنما',
    openid_permission: 'openid',
    openid_permission_guide:
      "برای دسترسی به منابع OAuth اختیاری است.\nبرای احراز هویت OIDC الزامی است. دسترسی به توکن شناسه را اعطا می‌کند و امکان دسترسی به 'userinfo_endpoint' را فراهم می‌کند.",
    offline_access_permission: 'offline_access',
    offline_access_permission_guide:
      'اختیاری. برای دسترسی بلندمدت یا وظایف پس‌زمینه، توکن‌های بازیابی را بازیابی می‌کند.',
  },
  roles: {
    assign_button: 'تخصیص نقش‌ها',
    delete_description:
      'این عمل این نقش را از این برنامه ماشین به ماشین حذف می‌کند. نقش خودش همچنان وجود خواهد داشت، اما دیگر با این برنامه ماشین به ماشین مرتبط نخواهد بود.',
    deleted: '{{name}} با موفقیت از این کاربر حذف شد.',
    assign_title: 'تخصیص نقش‌ها به {{name}}',
    assign_subtitle:
      'برنامه‌های ماشین به ماشین باید نقش‌های نوع ماشین به ماشین داشته باشند تا به منابع API مرتبط دسترسی داشته باشند.',
    assign_role_field: 'تخصیص نقش‌ها',
    role_search_placeholder: 'جستجو بر اساس نام نقش',
    added_text: '{{value, number}} اضافه شد',
    assigned_app_count: '{{value, number}} برنامه',
    confirm_assign: 'تخصیص نقش‌ها',
    role_assigned: 'نقش(ها) با موفقیت تخصیص یافت',
    search: 'جستجو بر اساس نام نقش، توضیحات یا شناسه',
    empty: 'هیچ نقشی موجود نیست',
  },
  secrets: {
    value: 'مقدار',
    empty: 'برنامه هیچ رمزی ندارد.',
    created_at: 'ایجاد شده در',
    expires_at: 'منقضی می‌شود در',
    never: 'هرگز',
    create_new_secret: 'ایجاد رمز جدید',
    delete_confirmation: 'این عمل قابل بازگشت نیست. آیا مطمئنید که می‌خواهید این رمز را حذف کنید؟',
    deleted: 'رمز با موفقیت حذف شد.',
    activated: 'رمز با موفقیت فعال شد.',
    deactivated: 'رمز با موفقیت غیرفعال شد.',
    legacy_secret: 'رمز قدیمی',
    expired: 'منقضی شده',
    expired_tooltip: 'این رمز در تاریخ {{date}} منقضی شد.',
    create_modal: {
      title: 'ایجاد رمز برنامه',
      expiration: 'انقضا',
      expiration_description: 'رمز در تاریخ {{date}} منقضی خواهد شد.',
      expiration_description_never:
        'رمز هرگز منقضی نخواهد شد. برای امنیت بیشتر، پیشنهاد می‌کنیم تاریخ انقضا تنظیم کنید.',
      days: '{{count}} روز',
      days_other: '{{count}} روز',
      years: '{{count}} سال',
      years_other: '{{count}} سال',
      created: 'رمز {{name}} با موفقیت ایجاد شد.',
    },
    edit_modal: {
      title: 'ویرایش رمز برنامه',
      edited: 'رمز {{name}} با موفقیت ویرایش شد.',
    },
  },
  saml_idp_config: {
    title: 'متادیتای IdP SAML',
    description: 'از متادیتا و گواهینامه زیر برای پیکربندی IdP SAML در برنامه خود استفاده کنید.',
    metadata_url_label: 'URL متادیتای IdP',
    single_sign_on_service_url_label: 'URL سرویس ورود یکپارچه',
    idp_entity_id_label: 'شناسه موجودیت IdP',
  },
  saml_idp_certificates: {
    title: 'گواهینامه امضای SAML',
    expires_at: 'منقضی می‌شود در',
    finger_print: 'اثر انگشت',
    status: 'وضعیت',
    active: 'فعال',
    inactive: 'غیرفعال',
  },
  saml_idp_name_id_format: {
    title: 'فرمت شناسه نام',
    description: 'فرمت شناسه نام IdP SAML را انتخاب کنید.',
    persistent: 'پایدار',
    persistent_description: 'استفاده از شناسه کاربر Logto به عنوان شناسه نام',
    transient: 'موقت',
    transient_description: 'استفاده از شناسه کاربر یک‌بار مصرف به عنوان شناسه نام',
    unspecified: 'نامشخص',
    unspecified_description: 'استفاده از شناسه کاربر Logto به عنوان شناسه نام',
    email_address: 'آدرس ایمیل',
    email_address_description: 'استفاده از آدرس ایمیل به عنوان شناسه نام',
  },
  saml_encryption_config: {
    encrypt_assertion: 'رمزگذاری ادعای SAML',
    encrypt_assertion_description: 'با فعال‌سازی این گزینه، ادعای SAML رمزگذاری خواهد شد.',
    encrypt_then_sign: 'رمزگذاری سپس امضا',
    encrypt_then_sign_description:
      'با فعال‌سازی این گزینه، ادعای SAML ابتدا رمزگذاری و سپس امضا می‌شود؛ در غیر این صورت، ادعای SAML ابتدا امضا و سپس رمزگذاری می‌شود.',
    certificate: 'گواهینامه',
    certificate_tooltip:
      'گواهینامه x509 که از ارائه‌دهنده سرویس خود دریافت کرده‌اید را کپی و جای‌گذاری کنید تا ادعای SAML را رمزگذاری کنید.',
    certificate_placeholder:
      '-----BEGIN CERTIFICATE-----\nMIICYDCCAcmgAwIBA...\n-----END CERTIFICATE-----\n',
    certificate_missing_error: 'گواهینامه الزامی است.',
    certificate_invalid_format_error:
      'فرمت گواهینامه نامعتبر شناسایی شد. لطفاً فرمت گواهینامه را بررسی کنید و دوباره امتحان کنید.',
  },
  saml_app_attribute_mapping: {
    name: 'نگاشت‌های ویژگی',
    title: 'نگاشت‌های ویژگی پایه',
    description:
      'نگاشت‌های ویژگی را برای همگام‌سازی پروفایل کاربر از Logto به برنامه خود اضافه کنید.',
    col_logto_claims: 'مقدار Logto',
    col_sp_claims: 'نام مقدار برنامه شما',
    add_button: 'افزودن مورد دیگر',
  },
  concurrent_device_limit,
};

export default Object.freeze(application_details);
