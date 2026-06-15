const application = {
  invalid_type: 'فقط برنامه‌های ماشین به ماشین می‌توانند نقش‌های مرتبط داشته باشند.',
  role_exists: 'شناسه نقش {{roleId}} از قبل به این برنامه اضافه شده است.',
  invalid_role_type: 'نمی‌توان نقش نوع کاربر را به برنامه ماشین به ماشین اختصاص داد.',
  invalid_third_party_application_type:
    'فقط برنامه‌های وب سنتی، تک‌صفحه‌ای و بومی می‌توانند به‌عنوان برنامه شخص ثالث علامت‌گذاری شوند.',
  third_party_application_only: 'این ویژگی فقط برای برنامه‌های شخص ثالث در دسترس است.',
  third_party_application_cannot_enable_token_exchange:
    'برنامه‌های شخص ثالث مجاز به فعال‌سازی تبادل توکن نیستند.',
  user_consent_scopes_not_found: 'scopeهای رضایت کاربر نامعتبر است.',
  consent_management_api_scopes_not_allowed: 'scopeهای Management API مجاز نیستند.',
  device_flow_native_only: 'Device flow فقط برای برنامه‌های بومی در دسترس است.',
  device_flow_not_changeable: 'Device flow پس از ایجاد برنامه قابل تغییر نیست.',
  protected_app_metadata_is_required: 'متادیتای برنامه محافظت‌شده الزامی است.',
  protected_app_not_configured:
    'ارائه‌دهنده برنامه محافظت‌شده پیکربندی نشده است. این ویژگی برای نسخه متن‌باز در دسترس نیست.',
  cloudflare_unknown_error: 'هنگام درخواست API مربوط به Cloudflare خطای ناشناخته رخ داد',
  protected_application_only: 'این ویژگی فقط برای برنامه‌های محافظت‌شده در دسترس است.',
  protected_application_misconfigured: 'برنامه محافظت‌شده نادرست پیکربندی شده است.',
  protected_application_subdomain_exists: 'زیردامنه برنامه محافظت‌شده از قبل در حال استفاده است.',
  invalid_subdomain: 'زیردامنه نامعتبر است.',
  custom_domain_not_found: 'دامنه سفارشی یافت نشد.',
  should_delete_custom_domains_first: 'ابتدا باید دامنه‌های سفارشی را حذف کنید.',
  no_legacy_secret_found: 'برنامه secret قدیمی ندارد.',
  secret_name_exists: 'نام secret از قبل وجود دارد.',
  sync_application_secret_failed: 'همگام‌سازی secret برنامه ناموفق بود.',
  saml: {
    use_saml_app_api:
      'از API `[METHOD] /saml-applications(/.*)?` برای عملیات برنامه SAML استفاده کنید.',
    saml_application_only: 'این API فقط برای برنامه‌های SAML در دسترس است.',
    reach_oss_limit: 'نمی‌توانید برنامه SAML بیشتری ایجاد کنید زیرا محدودیت {{limit}} رسیده است.',
    acs_url_binding_not_supported:
      'فقط binding HTTP-POST برای دریافت assertionهای SAML پشتیبانی می‌شود.',
    acs_url_scheme_not_supported:
      'فقط اسکیمای HTTP و HTTPS برای نشانی Assertion Consumer Service پشتیبانی می‌شود.',
    can_not_delete_active_secret: 'نمی‌توان secret فعال را حذف کرد.',
    no_active_secret: 'secret فعالی یافت نشد.',
    entity_id_required: 'Entity ID برای تولید متادیتا الزامی است.',
    name_id_format_required: 'قالب Name ID الزامی است.',
    unsupported_name_id_format: 'قالب Name ID پشتیبانی نمی‌شود.',
    missing_email_address: 'کاربر آدرس ایمیل ندارد.',
    email_address_unverified: 'آدرس ایمیل کاربر تأیید نشده است.',
    invalid_certificate_pem_format: 'قالب گواهی PEM نامعتبر است',
    acs_url_required: 'URL Assertion Consumer Service الزامی است.',
    private_key_required: 'کلید خصوصی الزامی است.',
    certificate_required: 'گواهی الزامی است.',
    invalid_saml_request: 'درخواست احراز هویت SAML نامعتبر است.',
    auth_request_issuer_not_match:
      'صادرکننده درخواست احراز هویت SAML با entity ID ارائه‌دهنده سرویس مطابقت ندارد.',
    sp_initiated_saml_sso_session_not_found_in_cookies:
      'شناسه نشست SAML SSO آغازشده توسط ارائه‌دهنده سرویس در کوکی‌ها یافت نشد.',
    sp_initiated_saml_sso_session_not_found:
      'نشست SAML SSO آغازشده توسط ارائه‌دهنده سرویس یافت نشد.',
    state_mismatch: 'عدم تطابق `state`.',
  },
};

export default Object.freeze(application);
