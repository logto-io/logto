const role = {
  name_in_use: 'نام نقش {{name}} از قبل در حال استفاده است',
  scope_exists: 'شناسه scope {{scopeId}} از قبل به این نقش اضافه شده است',
  management_api_scopes_not_assignable_to_user_role:
    'نمی‌توان scopeهای Management API را به نقش کاربر اختصاص داد.',
  user_exists: 'شناسه کاربر {{userId}} از قبل به این نقش اضافه شده است',
  application_exists: 'شناسه برنامه {{applicationId}} از قبل به این نقش اضافه شده است',
  default_role_missing:
    'برخی از نام‌های نقش پیش‌فرض در پایگاه داده وجود ندارند، لطفاً ابتدا نقش‌ها را ایجاد کنید',
  internal_role_violation:
    'ممکن است در حال به‌روزرسانی یا حذف نقش داخلی باشید که توسط Logto ممنوع است. اگر نقش جدید ایجاد می‌کنید، نام دیگری که با "#internal:" شروع نشود امتحان کنید.',
};

export default Object.freeze(role);
