const connector = {
  general: 'خطا در اتصال‌دهنده رخ داد: {{errorDescription}}',
  not_found: 'هیچ اتصال‌دهنده در دسترسی برای نوع {{type}} یافت نشد.',
  not_enabled: 'اتصال‌دهنده فعال نیست.',
  invalid_metadata: 'متادیتای اتصال‌دهنده نامعتبر است.',
  invalid_config_guard: 'config guard اتصال‌دهنده نامعتبر است.',
  unexpected_type: 'نوع اتصال‌دهنده غیرمنتظره است.',
  invalid_request_parameters: 'درخواست دارای پارامتر(های) ورودی نادرست است.',
  insufficient_request_parameters: 'درخواست ممکن است برخی پارامترهای ورودی را نداشته باشد.',
  invalid_config: 'پیکربندی اتصال‌دهنده نامعتبر است.',
  invalid_certificate: 'گواهی اتصال‌دهنده نامعتبر است، لطفاً مطمئن شوید گواهی در قالب PEM است.',
  invalid_response: 'پاسخ اتصال‌دهنده نامعتبر است.',
  template_not_found: 'قالب صحیح در پیکربندی اتصال‌دهنده یافت نشد.',
  template_not_supported: 'اتصال‌دهنده از این نوع قالب پشتیبانی نمی‌کند.',
  rate_limit_exceeded: 'محدودیت نرخ ماشه. لطفاً بعداً دوباره تلاش کنید.',
  not_implemented: '{{method}}: هنوز پیاده‌سازی نشده است.',
  social_invalid_access_token: 'توکن دسترسی اتصال‌دهنده نامعتبر است.',
  invalid_auth_code: 'کد auth اتصال‌دهنده نامعتبر است.',
  social_invalid_id_token: 'توکن شناسایی اتصال‌دهنده نامعتبر است.',
  authorization_failed: 'فرایند مجوز کاربر ناموفق بود.',
  social_auth_code_invalid: 'امکان دریافت توکن دسترسی نیست، لطفاً کد مجوز را بررسی کنید.',
  more_than_one_sms: 'تعداد اتصال‌دهنده‌های پیامکی بیش از ۱ است.',
  more_than_one_email: 'تعداد اتصال‌دهنده‌های ایمیل بیش از ۱ است.',
  more_than_one_connector_factory:
    'چند factory اتصال‌دهنده یافت شد (با شناسه {{connectorIds}})، می‌توانید موارد غیرضروری را حذف کنید.',
  db_connector_type_mismatch: 'اتصال‌دهنده‌ای در DB وجود دارد که با نوع مطابقت ندارد.',
  not_found_with_connector_id: 'اتصال‌دهنده با شناسه استاندارد داده‌شده یافت نشد.',
  multiple_instances_not_supported:
    'نمی‌توان چند نمونه با اتصال‌دهنده استاندارد انتخاب‌شده ایجاد کرد.',
  invalid_type_for_syncing_profile:
    'فقط می‌توانید پروفایل کاربر را با اتصال‌دهنده‌های اجتماعی همگام کنید.',
  can_not_modify_target: 'فیلد «target» اتصال‌دهنده قابل تغییر نیست.',
  should_specify_target: 'باید «target» را مشخص کنید.',
  multiple_target_with_same_platform:
    'نمی‌توانید چند اتصال‌دهنده اجتماعی با target و platform یکسان داشته باشید.',
  cannot_overwrite_metadata_for_non_standard_connector:
    '«metadata» این اتصال‌دهنده قابل بازنویسی نیست.',
  email_connector: {
    bulk_deletion_no_filter:
      'برای حذف گروهی بر اساس ویژگی‌ها باید حداقل یک شرط فیلتر ارائه شود. ویژگی‌های پشتیبانی‌شده: {{properties, list(type:conjunction)}}.',
  },
  token_storage_not_supported: 'این اتصال‌دهنده از ذخیره توکن پشتیبانی نمی‌کند.',
};

export default Object.freeze(connector);
