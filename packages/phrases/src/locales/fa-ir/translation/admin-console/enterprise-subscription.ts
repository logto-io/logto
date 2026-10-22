const enterprise_subscription = {
  page_title: 'اشتراک',
  title: 'مدیریت اشتراک شما',
  subtitle: 'این بخش برای مدیریت اشتراک چند مستأجری و تاریخچه صورت‌حساب شما است',
  tab: {
    subscription: 'اشتراک',
    billing_history: 'تاریخچه صورت‌حساب',
  },
  subscription: {
    title: 'اشتراک',
    description:
      'به راحتی مصرف خود را دنبال کنید، صورت‌حساب بعدی خود را ببینید و قرارداد اصلی خود را بررسی کنید.',
    enterprise_plan_title: 'طرح سازمانی',
    enterprise_plan_description:
      'این اشتراک طرح سازمانی شماست و این سهمیه بین مستأجران مشترک است. به‌روزرسانی مصرف ممکن است با تأخیر جزئی همراه باشد. ',
    add_on_title: 'افزونه‌های پرداخت به ازای مصرف',
    add_on_description:
      'اینها افزونه‌های اضافی پرداخت به ازای مصرف بر اساس قرارداد شما یا نرخ‌های استاندارد Logto هستند. بر اساس مصرف واقعی شما هزینه دریافت خواهد شد.',
    included: 'شامل شده',
    over_quota: 'بیش از سهمیه',
    basic_plan_column_title: {
      product: 'محصول',
      usage: 'مصرف',
      quota: 'سهمیه',
    },
    add_on_column_title: {
      product: 'محصول',
      unit_price: 'قیمت واحد',
      quantity: 'تعداد',
      total_price: 'جمع کل',
    },
    add_on_sku_price: '‎${{price}}/ماه',
    private_region_title: 'نمونه ابر خصوصی ({{regionName}})',
    shared_cross_tenants: 'در بین مستأجران',
  },
  user_subscriptions: {
    description:
      'اشتراک‌های شخصی و پوشش قراردادی Enterprise خود را مستقل از مستأجر انتخاب‌شده مشاهده کنید.',
    personal_title: 'اشتراک‌های شخصی',
    personal_description: 'اشتراک‌هایی که به حساب شما صورتحساب می‌شوند، از جمله اشتراک‌های گذشته.',
    enterprise_description:
      'سهمیه Console SSO در قرارداد تعیین می‌شود و بین مدیران مجاز مشترک است. اشتراک‌های شخصی جداگانه صورتحساب می‌شوند.',
    allowance: 'سهمیه قراردادی',
    not_covered:
      'این طرح Enterprise شامل سهمیه Console SSO نیست. کانکتورهای جدید از طریق اشتراک شخصی صورتحساب می‌شوند.',
    quantity_price: 'تعداد × قیمت واحد',
    billing_period: 'دوره صورتحساب',
    connectors: 'اتصال‌دهنده‌های Console SSO',
    no_connectors: 'بدون اتصال‌دهنده',
    list_price_note:
      'تعداد، قیمت واحد و وضعیت نمایش‌داده‌شده از رکورد اشتراک گرفته می‌شوند. توقف وصول وجه ممکن است تعداد و وضعیت را بدون تغییر باقی بگذارد. قیمت‌های واحد شامل مالیات، تخفیف و تعدیلات نسبی نیستند و هزینه‌های جاری یا مبلغ قابل پرداخت را نشان نمی‌دهند.',
    proration_note:
      'افزودن و حذف Console SSO به‌صورت نسبی در صورتحساب عادی محاسبه می‌شود. حذف آخرین اتصال‌دهنده پولی، اشتراک را لغو و تسویه می‌کند.',
    overdue_note:
      'پس از سه دوره متوالی پرداخت‌نشده و پایان تلاش‌های مجدد، وصول وجه متوقف و اتصال‌دهنده‌های پولی Console SSO حذف می‌شوند. به‌روزرسانی پرداخت، تنظیمات آن‌ها را بازیابی نمی‌کند. برای کمک با ما تماس بگیرید.',
    cancel_on: 'لغو برنامه‌ریزی‌شده برای {{date}}',
    other_product: 'اشتراک دیگر',
    status: {
      active: 'فعال',
      trialing: 'آزمایشی',
      past_due: 'معوق',
      unpaid: 'پرداخت‌نشده',
      canceled: 'لغوشده',
      incomplete: 'ناقص',
      incomplete_expired: 'منقضی‌شده',
      paused: 'متوقف‌شده',
    },
  },
};

export default Object.freeze(enterprise_subscription);
