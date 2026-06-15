import add_on from './add-on.js';
import featured_plan_content from './featured-plan-content.js';
import paywall from './paywall.js';

const upsell = {
  upgrade_plan: 'ارتقای پلان',
  compare_plans: 'مقایسه پلان‌ها',
  try_with_product_name: '{{productName}} را همین حالا امتحان کنید',
  view_plans: 'مشاهده پلان‌ها',
  create_tenant: {
    title: 'پلان tenant خود را انتخاب کنید',
    description:
      'Logto گزینه‌های پلان رقابتی با قیمت‌گذاری نوآورانه و مقرون‌به‌صرفه برای شرکت‌های در حال رشد ارائه می‌دهد. <a>بیشتر بدانید</a>',
    base_price: 'قیمت پایه',
    monthly_price: '{{value, number}}/ماه',
    view_all_features: 'مشاهده همه ویژگی‌ها',
    select_plan: 'انتخاب <name/>',
    free_tenants_limit: 'تا {{count, number}} tenant رایگان',
    free_tenants_limit_other: 'تا {{count, number}} tenant رایگان',
    most_popular: 'محبوب‌ترین',
    upgrade_success: 'با موفقیت به <name/> ارتقا یافت',
  },
  mau_exceeded_modal: {
    title: 'MAU از حد مجاز عبور کرده است. پلان خود را ارتقا دهید.',
    notification:
      'MAU فعلی شما از حد مجاز <planName/> عبور کرده است. لطفاً پلان خود را سریعاً به پرمیوم ارتقا دهید تا از تعلیق سرویس Logto جلوگیری شود.',
    update_plan: 'به‌روزرسانی پلان',
  },
  token_exceeded_modal: {
    title: 'مصرف توکن از حد مجاز عبور کرده است. پلان خود را ارتقا دهید.',
    notification:
      'شما از حد مجاز مصرف توکن <planName/> عبور کرده‌اید. کاربران نمی‌توانند به درستی به سرویس Logto دسترسی داشته باشند. لطفاً پلان خود را سریعاً به پرمیوم ارتقا دهید تا از هرگونه مشکل جلوگیری شود.',
  },
  payment_overdue_modal: {
    title: 'پرداخت صورت‌حساب عقب افتاده است',
    notification:
      'اوه! پرداخت صورت‌حساب tenant <span>{{name}}</span> ناموفق بود. لطفاً صورت‌حساب را سریعاً پرداخت کنید تا از تعلیق سرویس Logto جلوگیری شود.',
    unpaid_bills: 'صورت‌حساب‌های پرداخت نشده',
    update_payment: 'به‌روزرسانی پرداخت',
  },
  add_on_quota_item: {
    api_resource: 'منبع API',
    machine_to_machine: 'برنامه machine-to-machine',
    tokens: '{{limit}}M توکن',
    tenant_member: 'عضو tenant',
  },
  charge_notification_for_quota_limit:
    'شما از حد سهمیه {{item}} خود عبور کرده‌اید. Logto برای استفاده بیش از حد سهمیه شما هزینه اضافه خواهد کرد. پرداخت از روز انتشار طرح قیمت‌گذاری جدید add-on آغاز خواهد شد. <a>بیشتر بدانید</a>',
  paywall,
  featured_plan_content,
  add_on,
  convert_to_production_modal: {
    title: 'شما در حال تغییر tenant توسعه خود به tenant تولید هستید',
    description:
      'آماده راه‌اندازی هستید؟ تبدیل این tenant توسعه به tenant تولید، قابلیت‌های کامل را فعال می‌کند',
    benefits: {
      stable_environment: 'برای کاربران نهایی: یک محیط پایدار برای استفاده واقعی.',
      keep_pro_features:
        'نگه داشتن ویژگی‌های Pro: شما در حال اشتراک در پلان Pro هستید. <a>ویژگی‌های Pro را مشاهده کنید.</a>',
      no_dev_restrictions:
        'بدون محدودیت‌های توسعه: محدودیت‌های سیستمی موجودیت و منبع و بنر ورود را حذف می‌کند.',
    },
    cards: {
      dev_description: 'اهداف آزمایشی',
      prod_description: 'تولید واقعی',
      convert_label: 'تبدیل',
    },
    button: 'تبدیل به tenant تولید',
  },
};

export default Object.freeze(upsell);
