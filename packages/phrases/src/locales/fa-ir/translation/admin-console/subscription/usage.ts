const usage = {
  status_active: 'در حال استفاده',
  status_inactive: 'استفاده نمی‌شود',
  limited_status_quota_description: '(اولین {{quota}} شامل می‌شود)',
  unlimited_status_quota_description: '(شامل می‌شود)',
  disabled_status_quota_description: '(شامل نمی‌شود)',
  usage_description_with_unlimited_quota: '{{usage}}<span> (نامحدود)</span>',
  usage_description_with_limited_quota: '{{usage}}<span> (اولین {{basicQuota}} شامل می‌شود)</span>',
  usage_description_without_quota: '{{usage}}<span> (شامل نمی‌شود)</span>',
  mau: {
    title: 'MAU',
    tooltip:
      'MAU یک کاربر منحصربه‌فرد است که در طول یک دوره صورت‌حساب حداقل یک توکن با Logto مبادله کرده است. برای پلن Pro نامحدود است. <a>بیشتر بدانید</a>',
    tooltip_for_enterprise:
      'MAU یک کاربر منحصربه‌فرد است که در طول یک دوره صورت‌حساب حداقل یک توکن با Logto مبادله کرده است. برای پلن Enterprise نامحدود است.',
  },
  organizations: {
    title: 'سازمان‌ها',
    tooltip:
      'ویژگی افزونه با نرخ ثابت ${{price, number}} در ماه. قیمت تحت تأثیر تعداد سازمان‌ها یا سطح فعالیت آن‌ها نیست.',
    description_for_enterprise: '(شامل می‌شود)',
    tooltip_for_enterprise:
      'شامل بودن به پلن شما بستگی دارد. اگر ویژگی سازمان در قرارداد اولیه شما نباشد، هنگام فعال‌سازی به صورت‌حساب شما اضافه می‌شود. هزینه افزونه ${{price, number}} در ماه است، صرف‌نظر از تعداد سازمان‌ها یا سطح فعالیت آن‌ها.',
    tooltip_for_enterprise_with_numbered_basic_quota:
      'پلن شما شامل اولین {{basicQuota}} سازمان به صورت رایگان است. اگر به بیشتر نیاز دارید، می‌توانید با افزونه سازمان با نرخ ثابت ${{price, number}} در ماه، صرف‌نظر از تعداد سازمان‌ها یا سطح فعالیت آن‌ها، اضافه کنید.',
  },
  mfa: {
    title: 'MFA',
    tooltip:
      'ویژگی افزونه با نرخ ثابت ${{price, number}} در ماه. قیمت تحت تأثیر تعداد عوامل احراز هویت استفاده‌شده نیست.',
    tooltip_for_enterprise:
      'شامل بودن به پلن شما بستگی دارد. اگر ویژگی MFA در قرارداد اولیه شما نباشد، هنگام فعال‌سازی به صورت‌حساب شما اضافه می‌شود. هزینه افزونه ${{price, number}} در ماه است، صرف‌نظر از تعداد عوامل احراز هویت استفاده‌شده.',
  },
  enterprise_sso: {
    title: 'SSO سازمانی',
    tooltip: 'ویژگی افزونه با قیمت ${{price, number}} به ازای هر اتصال SSO در ماه.',
    tooltip_for_enterprise:
      'ویژگی افزونه با قیمت ${{price, number}} به ازای هر اتصال SSO در ماه. اولین {{basicQuota}} SSO در پلن مبتنی بر قرارداد شما شامل و رایگان هستند.',
  },
  api_resources: {
    title: 'منابع API',
    tooltip:
      'ویژگی افزونه با قیمت ${{price, number}} به ازای هر منبع در ماه. ۳ منبع API اول رایگان هستند.',
    tooltip_for_enterprise:
      'اولین {{basicQuota}} منبع API در پلن مبتنی بر قرارداد شما شامل و رایگان هستند. اگر به بیشتر نیاز دارید، ${{price, number}} به ازای هر منبع API در ماه.',
  },
  machine_to_machine: {
    title: 'ماشین به ماشین',
    tooltip:
      'ویژگی افزونه با قیمت ${{price, number}} به ازای هر اپلیکیشن در ماه. اولین اپلیکیشن ماشین به ماشین رایگان است.',
    tooltip_for_enterprise:
      'اولین {{basicQuota}} اپلیکیشن ماشین به ماشین در پلن مبتنی بر قرارداد شما رایگان است. اگر به بیشتر نیاز دارید، ${{price, number}} به ازای هر اپلیکیشن در ماه.',
  },
  tenant_members: {
    title: 'اعضای تنانت',
    tooltip:
      'ویژگی افزونه با قیمت ${{price, number}} به ازای هر عضو در ماه. اولین {{count}} عضو تنانت رایگان است.',
    tooltip_one:
      'ویژگی افزونه با قیمت ${{price, number}} به ازای هر عضو در ماه. اولین {{count}} عضو تنانت رایگان است.',
    tooltip_other:
      'ویژگی افزونه با قیمت ${{price, number}} به ازای هر عضو در ماه. اولین {{count}} عضو تنانت رایگان هستند.',
    tooltip_for_enterprise:
      'اولین {{count}} عضو تنانت در پلن مبتنی بر قرارداد شما شامل و رایگان هستند. اگر به بیشتر نیاز دارید، ${{price, number}} به ازای هر عضو تنانت در ماه.',
  },
  custom_domains: {
    title: 'دامنه‌های سفارشی',
    tooltip:
      'ویژگی افزونه با قیمت ${{price, number}} برای حداکثر ۱۰ دامنه سفارشی در ماه. اولین ۱ دامنه سفارشی رایگان است.',
  },
  tokens: {
    title: 'توکن‌ها',
    tooltip:
      'ویژگی افزونه با قیمت ${{price, number}} به ازای هر {{tokenLimit}} توکن. اولین {{basicQuota}} توکن شامل می‌شود.',
    tooltip_for_enterprise:
      'اولین {{basicQuota}} توکن در پلن مبتنی بر قرارداد شما شامل و رایگان هستند. اگر به بیشتر نیاز دارید، ${{price, number}} به ازای هر {{tokenLimit}} توکن در ماه.',
  },
  m2mTokens: {
    title: 'توکن‌های M2M',
  },
  hooks: {
    title: 'هوک‌ها',
    tooltip: 'ویژگی افزونه با قیمت ${{price, number}} به ازای هر هوک. ۱۰ هوک اول شامل می‌شوند.',
    tooltip_for_enterprise:
      'اولین {{basicQuota}} هوک در پلن مبتنی بر قرارداد شما شامل و رایگان هستند. اگر به بیشتر نیاز دارید، ${{price, number}} به ازای هر هوک در ماه.',
  },
  security_features: {
    title: 'امنیت پیشرفته',
    tooltip:
      'ویژگی افزونه با قیمت ${{price, number}} در ماه برای بسته کامل امنیت پیشرفته، شامل CAPTCHA، قفل شناسه، لیست مسدود ایمیل و موارد دیگر.',
  },
  saml_applications: {
    title: 'اپلیکیشن SAML',
    tooltip: 'ویژگی افزونه با قیمت ${{price, number}} به ازای هر اپلیکیشن SAML در ماه.',
  },
  third_party_applications: {
    title: 'اپلیکیشن شخص ثالث',
    tooltip: 'ویژگی افزونه با قیمت ${{price, number}} به ازای هر اپلیکیشن در ماه.',
  },
  rbacEnabled: {
    title: 'نقش‌ها',
    tooltip:
      'ویژگی افزونه با نرخ ثابت ${{price, number}} در ماه. قیمت تحت تأثیر تعداد نقش‌های سراسری نیست.',
  },
  pricing: {
    add_on_changes_in_current_cycle_notice:
      'اگر در طول دوره صورت‌حساب فعلی تغییراتی ایجاد کنید، صورت‌حساب بعدی شما ممکن است برای اولین ماه پس از تغییر کمی بالاتر باشد. این مبلغ شامل ${{price, number}} قیمت پایه به علاوه هزینه‌های افزونه برای استفاده صورت‌حساب نشده از دوره فعلی و هزینه کامل دوره بعدی خواهد بود. <a>بیشتر بدانید</a>',
  },
};

export default Object.freeze(usage);
