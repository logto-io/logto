const auth = {
  authorization_header_missing: 'هدر Authorization وجود ندارد.',
  authorization_token_type_not_supported: 'نوع Authorization پشتیبانی نمی‌شود.',
  unauthorized: 'غیرمجاز. لطفاً اعتبارنامه و scope آن را بررسی کنید.',
  forbidden: 'ممنوع. لطفاً نقش‌ها و مجوزهای کاربر خود را بررسی کنید.',
  expected_role_not_found:
    'نقش مورد انتظار یافت نشد. لطفاً نقش‌ها و مجوزهای کاربر خود را بررسی کنید.',
  jwt_sub_missing: 'فیلد `sub` در JWT وجود ندارد.',
  require_re_authentication: 'برای انجام اقدام محافظت‌شده، احراز هویت مجدد لازم است.',
  exceed_token_limit: 'محدودیت توکن تجاوز شد. لطفاً با مدیر خود تماس بگیرید.',
};

export default Object.freeze(auth);
