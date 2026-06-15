const domain = {
  not_configured: 'ارائه‌دهنده hostname دامنه پیکربندی نشده است.',
  cloudflare_data_missing: 'cloudflare_data وجود ندارد، لطفاً بررسی کنید.',
  cloudflare_unknown_error: 'هنگام درخواست API مربوط به Cloudflare خطای ناشناخته رخ داد',
  cloudflare_response_error: 'پاسخ غیرمنتظره از Cloudflare دریافت شد.',
  limit_to_one_domain: 'فقط می‌توانید یک دامنه سفارشی داشته باشید.',
  hostname_already_exists: 'این دامنه از قبل در سرور ما وجود دارد.',
  cloudflare_not_found: 'hostname در Cloudflare یافت نشد',
  domain_is_not_allowed: 'این دامنه مجاز نیست.',
  domain_in_use: 'دامنه {{domain}} از قبل در حال استفاده است',
  exceed_domain_limit: 'حداکثر می‌توانید {{limit}} دامنه سفارشی داشته باشید.',
};

export default Object.freeze(domain);
