const webhook_details = {
  page_title: 'جزئیات وب‌هوک',
  back_to_webhooks: 'بازگشت به وب‌هوک‌ها',
  not_in_use: 'غیرفعال',
  success_rate: 'نرخ موفقیت',
  requests: '{{value, number}} درخواست در ۲۴ ساعت',
  disable_webhook: 'غیرفعال کردن وب‌هوک',
  disable_reminder:
    'آیا مطمئن هستید که می‌خواهید این وب‌هوک را دوباره فعال کنید؟ این کار درخواست HTTP به URL مقصد ارسال نمی‌کند.',
  webhook_disabled: 'وب‌هوک غیرفعال شد.',
  webhook_reactivated: 'وب‌هوک دوباره فعال شد.',
  reactivate_webhook: 'فعال‌سازی مجدد وب‌هوک',
  delete_webhook: 'حذف وب‌هوک',
  deletion_reminder:
    'در حال حذف این وب‌هوک هستید. پس از حذف، درخواست HTTP به URL مقصد ارسال نمی‌شود.',
  deleted: 'وب‌هوک با موفقیت حذف شد.',
  settings_tab: 'تنظیمات',
  recent_requests_tab: 'درخواست‌های اخیر (۲۴ ساعت)',
  settings: {
    settings: 'تنظیمات',
    settings_description:
      'وب‌هوک‌ها به شما امکان می‌دهند به‌روزرسانی‌های لحظه‌ای درباره رویدادهای خاص را با ارسال درخواست POST به URL مقصد دریافت کنید. این امکان اقدام فوری بر اساس اطلاعات جدید را فراهم می‌کند.',
    events: 'رویدادها',
    events_description:
      'رویدادهای ماشه‌ای را انتخاب کنید که Logto درخواست POST را برای آن‌ها ارسال می‌کند.',
    name: 'نام',
    endpoint_url: 'URL مقصد',
    signing_key: 'کلید امضا',
    signing_key_tip:
      'کلید مخفی ارائه‌شده توسط Logto را به‌عنوان هدر درخواست به مقصد اضافه کنید تا اصالت بار وب‌هوک تضمین شود.',
    regenerate: 'تولید مجدد',
    regenerate_key_title: 'تولید مجدد کلید امضا',
    regenerate_key_reminder:
      'آیا مطمئن هستید که می‌خواهید کلید امضا را تغییر دهید؟ تولید مجدد فوراً اعمال می‌شود. لطفاً کلید امضا را در مقصد همزمان به‌روزرسانی کنید.',
    regenerated: 'کلید امضا دوباره تولید شد.',
    custom_headers: 'هدرهای سفارشی',
    custom_headers_tip:
      'در صورت نیاز می‌توانید هدرهای سفارشی به بار وب‌هوک اضافه کنید تا زمینه یا متادیتای بیشتری درباره رویداد ارائه دهید.',
    key_duplicated_error: 'کلید نمی‌تواند تکراری باشد.',
    key_missing_error: 'کلید الزامی است.',
    value_missing_error: 'مقدار الزامی است.',
    invalid_key_error: 'کلید نامعتبر است',
    invalid_value_error: 'مقدار نامعتبر است',
    test: 'آزمایش',
    test_webhook: 'وب‌هوک خود را آزمایش کنید',
    test_webhook_description:
      'وب‌هوک را پیکربندی کنید و با نمونه بار برای هر رویداد انتخاب‌شده آزمایش کنید تا دریافت و پردازش صحیح را تأیید کنید.',
    send_test_payload: 'ارسال بار آزمایشی',
    test_result: {
      endpoint_url: 'URL مقصد: {{url}}',
      message: 'پیام: {{message}}',
      response_status: 'وضعیت پاسخ: {{status, number}}',
      response_body: 'بدنه پاسخ: {{body}}',
      request_time: 'زمان درخواست: {{time}}',
      test_success: 'آزمایش وب‌هوک به مقصد موفق بود.',
    },
  },
};

export default Object.freeze(webhook_details);
