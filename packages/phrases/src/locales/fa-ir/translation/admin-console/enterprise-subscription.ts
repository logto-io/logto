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
    price: 'قیمت',
    billing_period: 'دوره صورتحساب',
    list_price_note:
      'قیمت‌ها شامل مالیات و تخفیف نیستند. تغییرات به‌صورت نسبی در صورتحساب بعدی شما محاسبه می‌شوند.',
    overdue_note:
      'پرداخت معوق است. اگر پرداخت نشود، ممکن است اشتراک متوقف شود و ویژگی‌های پولی آن حذف شوند.',
    cancel_on: 'لغو برنامه‌ریزی‌شده برای {{date}}',
    other_product: 'اشتراک دیگر',
    enterprise_invoices_description:
      'صورت‌حساب‌های قرارداد Enterprise شما. یک صورت‌حساب را انتخاب کنید تا آن را ببینید و صورت‌حساب یا رسید را دانلود کنید.',
    personal_invoices_description:
      'صورت‌حساب‌های اشتراک‌هایی که به حساب شما صادر می‌شوند، از جمله اشتراک‌های گذشته. یک صورت‌حساب را انتخاب کنید تا آن را ببینید و صورت‌حساب یا رسید را دانلود کنید.',
    credit_note:
      'اعتبارهای ناشی از حذف یا محاسبه تناسبی از صورت‌حساب‌های بعدی کسر می‌شوند و لزوماً بلافاصله به روش پرداخت شما بازگردانده نمی‌شوند.',
    invoice_link_unavailable:
      'صفحه این صورت‌حساب در دسترس نیست. اگر به نسخه‌ای نیاز دارید با ما تماس بگیرید.',
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
