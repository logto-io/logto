const oss_onboarding = {
  page_title: 'راه‌اندازی اولیه',
  title: 'کمی درباره شما',
  description:
    'کمی درباره خود و پروژه‌تان بگویید. این به ما کمک می‌کند Logto بهتری برای همه بسازیم.',
  email: {
    label: 'آدرس ایمیل',
    description: 'در صورت نیاز به تماس درباره حساب شما از این آدرس استفاده می‌کنیم.',
    placeholder: 'email@example.com',
  },
  newsletter: 'به‌روزرسانی محصول، توصیه‌های امنیتی و محتوای منتخب Logto را دریافت کنید.',
  project: {
    label: 'از Logto برای',
    personal: 'پروژه شخصی',
    company: 'پروژه شرکتی',
  },
  project_name: {
    label: 'نام پروژه',
    placeholder: 'پروژه من',
  },
  company_name: {
    label: 'نام شرکت',
    placeholder: 'Acme.co',
  },
  company_size: {
    label: 'اندازه شرکت شما چقدر است؟',
  },
  errors: {
    email_required: 'آدرس ایمیل الزامی است',
    email_invalid: 'یک آدرس ایمیل معتبر وارد کنید',
    project_name_too_long: 'نام پروژه باید حداکثر ۲۰۰ کاراکتر باشد',
  },
};

export default Object.freeze(oss_onboarding);
