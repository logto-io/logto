const single_sign_on = {
  forbidden_domains: 'دامنه‌های ایمیل عمومی مجاز نیستند.',
  duplicated_domains: 'دامنه‌های تکراری وجود دارند.',
  invalid_domain_format: 'قالب دامنه نامعتبر است.',
  duplicate_connector_name: 'نام اتصال‌دهنده از قبل وجود دارد. لطفاً نام دیگری انتخاب کنید.',
  idp_initiated_authentication_not_supported:
    'احراز هویت آغازشده توسط IdP فقط برای اتصال‌دهنده‌های SAML پشتیبانی می‌شود.',
  idp_initiated_authentication_invalid_application_type:
    'نوع برنامه نامعتبر است. فقط برنامه‌های {{type}} مجاز هستند.',
  idp_initiated_authentication_redirect_uri_not_registered:
    'redirect_uri ثبت نشده است. لطفاً تنظیمات برنامه را بررسی کنید.',
  idp_initiated_authentication_client_callback_uri_not_found:
    'URI callback احراز هویت آغازشده توسط IdP کلاینت یافت نشد. لطفاً تنظیمات اتصال‌دهنده را بررسی کنید.',
  sso_signing_unavailable:
    'ورود از طریق ارائه‌دهنده هویت شما تکمیل نشد. لطفاً با مدیر خود تماس بگیرید.',
};

export default Object.freeze(single_sign_on);
