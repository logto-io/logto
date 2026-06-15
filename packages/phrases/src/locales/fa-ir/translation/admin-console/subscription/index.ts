import quota_item from './quota-item.js';
import quota_table from './quota-table.js';
import usage from './usage.js';

const subscription = {
  free_plan: 'پلن رایگان',
  free_plan_description: 'برای پروژه‌های جانبی و آزمایش اولیه Logto. بدون نیاز به کارت اعتباری.',
  pro_plan: 'پلن حرفه‌ای',
  pro_plan_description: 'برای کسب‌وکارهایی که می‌خواهند بدون نگرانی از Logto استفاده کنند.',
  enterprise: 'پلن سازمانی',
  enterprise_description: 'برای تیم‌های بزرگ و کسب‌وکارهایی با نیازهای سطح سازمانی.',
  admin_plan: 'پلن مدیریت',
  dev_plan: 'پلن توسعه',
  current_plan: 'پلن فعلی',
  current_plan_description:
    'این پلن فعلی شماست. می‌توانید میزان استفاده از پلن، صورت‌حساب آینده و تغییرات پلن را به راحتی مشاهده کنید.',
  plan_usage: 'میزان استفاده از پلن',
  plan_cycle: 'چرخه پلن: {{period}}. استفاده در {{renewDate}} تجدید می‌شود.',
  next_bill: 'صورت‌حساب آینده شما',
  next_bill_hint: 'برای اطلاعات بیشتر درباره نحوه محاسبه، لطفاً به این <a>مقاله</a> مراجعه کنید.',
  next_bill_tip:
    'قیمت‌های نمایش داده شده بدون مالیات هستند و ممکن است با کمی تأخیر به‌روزرسانی شوند. مبلغ مالیات بر اساس اطلاعات شما و الزامات قانونی محلی محاسبه و در فاکتورها نمایش داده می‌شود.',
  manage_payment: 'مدیریت پرداخت',
  overfill_quota_warning:
    'به محدودیت سهمیه خود رسیده‌اید. برای جلوگیری از مشکلات، پلن را ارتقا دهید.',
  upgrade_pro: 'ارتقا به پلن حرفه‌ای',
  update_payment: 'به‌روزرسانی پرداخت',
  payment_error:
    'مشکل پرداخت شناسایی شد. پردازش ${{price, number}} برای دوره قبلی امکان‌پذیر نیست. پرداخت را به‌روز کنید تا از تعلیق سرویس Logto جلوگیری شود.',
  downgrade: 'کاهش پلن',
  current: 'فعلی',
  upgrade: 'ارتقا',
  quota_table,
  billing_history: {
    invoice_column: 'فاکتورها',
    status_column: 'وضعیت',
    amount_column: 'مبلغ',
    invoice_created_date_column: 'تاریخ ایجاد فاکتور',
    invoice_status: {
      void: 'لغو شده',
      paid: 'پرداخت شده',
      open: 'باز',
      uncollectible: 'معوق',
    },
  },
  quota_item,
  downgrade_modal: {
    title: 'آیا مطمئن هستید که می‌خواهید پلن را کاهش دهید؟',
    description:
      'اگر تصمیم دارید به <targetName/> تغییر دهید، توجه داشته باشید که دیگر به سهمیه و ویژگی‌هایی که قبلاً در <currentName/> داشتید دسترسی نخواهید داشت.',
    before: 'قبل: <name/>',
    after: 'بعد: <name />',
    downgrade: 'کاهش پلن',
  },
  not_eligible_modal: {
    downgrade_title: 'شما واجد شرایط کاهش پلن نیستید',
    downgrade_description:
      'قبل از کاهش پلن به <name/>، مطمئن شوید که معیارهای زیر را رعایت می‌کنید.',
    downgrade_help_tip: 'به کمک برای کاهش پلن نیاز دارید؟ <a>با ما تماس بگیرید</a>.',
    upgrade_title: 'یادآوری دوستانه برای کاربران اولیه ما',
    upgrade_description:
      'شما در حال حاضر بیش از آنچه <name /> اجازه می‌دهد استفاده می‌کنید. Logto اکنون رسمی شده و شامل ویژگی‌های مخصوص هر پلن است. قبل از ارتقا به <name />، مطمئن شوید که معیارهای زیر را دارید.',
    upgrade_pro_tip: ' یا در نظر داشته باشید به پلن حرفه‌ای ارتقا دهید.',
    upgrade_help_tip: 'به کمک برای ارتقا نیاز دارید؟ <a>با ما تماس بگیرید</a>.',
    a_maximum_of: 'حداکثر <item/>',
  },
  upgrade_success: 'با موفقیت به <name/> ارتقا یافت',
  downgrade_success: 'با موفقیت به <name/> کاهش یافت',
  subscription_check_timeout:
    'بررسی اشتراک با تایم‌اوت مواجه شد. لطفاً بعداً صفحه را بارگذاری کنید.',
  no_subscription: 'بدون اشتراک',
  usage,
  token_usage_notification: {
    exceeded:
      'شما بیش از ۱۰۰٪ از محدودیت سهمیه خود استفاده کرده‌اید. کاربران دیگر نمی‌توانند به درستی وارد سیستم شوند. لطفاً فوراً ارتقا دهید تا از هرگونه مشکلی جلوگیری شود.',
    close_to_limit:
      'شما به محدودیت استفاده از توکن نزدیک شده‌اید. در صورتی که استفاده شما از ۱۰۰٪ بیشتر شود، Logto صدور توکن را متوقف خواهد کرد. لطفاً پلن رایگان را ارتقا دهید تا از هرگونه مشکلی جلوگیری شود.',
    dev_plan_exceeded: 'این مستأجر به محدودیت توکن بر اساس سیاست محدودیت موجودیت Logto رسیده است.',
  },
};

export default Object.freeze(subscription);
