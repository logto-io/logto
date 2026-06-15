const api_resources = {
  page_title: 'منابع API',
  title: 'منابع API',
  subtitle: 'APIهایی را تعریف کنید که برنامه‌های مجاز شما می‌توانند از آن‌ها استفاده کنند.',
  create: 'ایجاد منبع API',
  api_name: 'نام API',
  api_name_placeholder: 'نام API خود را وارد کنید',
  api_identifier: 'شناسه API',
  api_identifier_placeholder: 'https://your-api-identifier',
  api_identifier_tip:
    'شناسه منحصربه‌فرد منبع API. باید یک URI مطلق باشد و هیچ قطعه‌ای (#) نداشته باشد. معادل <a>پارامتر resource</a> در OAuth 2.0 است.',
  default_api: 'API پیش‌فرض',
  default_api_label:
    'فقط صفر یا یک API پیش‌فرض می‌تواند برای هر مستأجر تنظیم شود.\nهنگامی که یک API پیش‌فرض تعیین می‌شود، پارامتر resource می‌تواند در درخواست احراز هویت حذف شود. تبادل‌های توکن بعدی از آن API به عنوان مخاطب به طور پیش‌فرض استفاده می‌کنند و منجر به صدور JWTها می‌شود. <a>بیشتر بدانید</a>',
  api_resource_created: 'منبع API {{name}} با موفقیت ایجاد شد',
  invalid_resource_indicator_format: 'شناسه API باید یک URI مطلق معتبر باشد.',
};

export default Object.freeze(api_resources);
