const password = {
  unsupported_encryption_method: 'روش رمزنگاری {{name}} پشتیبانی نمی‌شود.',
  pepper_not_found: 'pepper رمز عبور یافت نشد. لطفاً متغیرهای محیطی core را بررسی کنید.',
  rejected: 'رمز عبور رد شد. لطفاً بررسی کنید که رمز عبور الزامات را برآورده می‌کند.',
  invalid_legacy_password_format: 'قالب رمز عبور قدیمی نامعتبر است.',
  unsupported_legacy_hash_algorithm: 'الگوریتم هش قدیمی پشتیبانی‌نشده: {{algorithm}}.',
  expired: 'رمز عبور شما منقضی شده است. لطفاً برای ادامه رمز عبور را بازنشانی کنید.',
};

export default Object.freeze(password);
