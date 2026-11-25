const hook = {
  missing_events: 'باید حداقل یک رویداد ارائه دهید.',
  send_test_payload_failed: 'ارسال بار آزمایشی ناموفق بود: {{message}}',
  endpoint_responded_with_error: 'مقصد با خطا پاسخ داد.',
  disabled: 'هوک غیرفعال است و نمی‌تواند رویدادها را دوباره تحویل دهد.',
  log_not_permanently_failed:
    'فقط تحویل‌های وب‌هوک که به‌طور دائم ناموفق بوده‌اند قابل ارسال مجدد هستند.',
  invalid_log_payload: 'ورودی گزارش وب‌هوک حاوی بار درخواست معتبری برای ارسال مجدد نیست.',
  redelivery_in_progress:
    'یک تحویل یا ارسال مجدد برای این رویداد وب‌هوک هم‌اکنون در حال انجام است.',
};

export default Object.freeze(hook);
