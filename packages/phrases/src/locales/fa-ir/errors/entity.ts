const entity = {
  invalid_input: 'ورودی نامعتبر است. لیست مقادیر نباید خالی باشد.',
  value_too_long: 'طول مقدار بیش از حد است و از محدودیت تجاوز می‌کند.',
  create_failed: 'ایجاد {{name}} ناموفق بود.',
  db_constraint_violated: 'محدودیت پایگاه داده نقض شد.',
  not_exists: '{{name}} وجود ندارد.',
  not_exists_with_id: '{{name}} با شناسه `{{id}}` وجود ندارد.',
  not_found: 'منبع وجود ندارد.',
  relation_foreign_key_not_found:
    'یک یا چند کلید خارجی یافت نشد. لطفاً ورودی را بررسی کنید و مطمئن شوید همه موجودیت‌های ارجاع‌شده وجود دارند.',
  unique_integrity_violation: 'موجودیت از قبل وجود دارد. لطفاً ورودی را بررسی و دوباره تلاش کنید.',
};

export default Object.freeze(entity);
