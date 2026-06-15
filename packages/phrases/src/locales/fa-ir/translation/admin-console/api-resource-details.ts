const api_resource_details = {
  page_title: 'جزئیات منبع API',
  back_to_api_resources: 'بازگشت به منابع API',
  general_tab: 'عمومی',
  permissions_tab: 'مجوزها',
  settings: 'تنظیمات',
  settings_description:
    'منابع API، که به عنوان نشانگرهای منبع نیز شناخته می‌شوند، سرویس‌ها یا منابع هدف مورد درخواست را مشخص می‌کنند و معمولاً به صورت متغیر URI نشان‌دهنده هویت منبع هستند.',
  management_api_settings_description:
    'Logto Management API مجموعه‌ای جامع از APIها است که به مدیران امکان می‌دهد طیف گسترده‌ای از وظایف مرتبط با هویت را مدیریت کنند، سیاست‌های امنیتی را اعمال نمایند و با مقررات و استانداردها مطابقت داشته باشند.',
  management_api_notice:
    'این API نمایانگر موجودیت Logto است و قابل تغییر یا حذف نیست. برای فراخوانی Logto Management API یک برنامه ماشین-به-ماشین ایجاد کنید. <a>بیشتر بدانید</a>',
  token_expiration_time_in_seconds: 'زمان انقضای توکن (بر حسب ثانیه)',
  token_expiration_time_in_seconds_placeholder: 'زمان انقضای توکن را وارد کنید',
  delete_description:
    'این عملیات قابل بازگشت نیست. منبع API به طور دائمی حذف خواهد شد. لطفاً نام منبع API را <span>{{name}}</span> وارد کنید تا تأیید شود.',
  enter_your_api_resource_name: 'نام منبع API خود را وارد کنید',
  api_resource_deleted: 'منبع API {{name}} با موفقیت حذف شد',
  permission: {
    create_button: 'ایجاد مجوز',
    create_title: 'ایجاد مجوز',
    create_subtitle: 'مجوزها (دامنه‌ها) مورد نیاز این API را تعریف کنید.',
    confirm_create: 'ایجاد مجوز',
    edit_title: 'ویرایش مجوز API',
    edit_subtitle: 'مجوزها (دامنه‌ها) مورد نیاز API {{resourceName}} را تعریف کنید.',
    name: 'نام مجوز',
    name_placeholder: 'read:resource',
    forbidden_space_in_name: 'نام مجوز نباید حاوی فاصله باشد.',
    description: 'توضیحات',
    description_placeholder: 'قادر به خواندن منابع است',
    permission_created: 'مجوز {{name}} با موفقیت ایجاد شد',
    delete_description:
      'در صورت حذف این مجوز، کاربری که این مجوز را داشته دسترسی اعطا شده توسط آن را از دست خواهد داد.',
    deleted: 'مجوز "{{name}}" با موفقیت حذف شد.',
  },
};

export default Object.freeze(api_resource_details);
