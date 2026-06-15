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
};

export default Object.freeze(enterprise_subscription);
