const enterprise_sso = {
  page_title: 'ورود یکپارچه سازمانی',
  title: 'ورود یکپارچه سازمانی',
  subtitle: 'ارائه‌دهنده هویت سازمانی را متصل کنید و ورود یکپارچه (SSO) را فعال نمایید.',
  create: 'افزودن اتصال‌دهنده سازمانی',
  col_connector_name: 'نام اتصال‌دهنده',
  col_type: 'نوع',
  col_email_domain: 'دامنه ایمیل',

  placeholder_title: 'اتصال‌دهنده سازمانی',
  placeholder_description:
    'لاگتو ارائه‌دهندگان هویت سازمانی داخلی متعددی برای اتصال فراهم کرده است، همچنین می‌توانید با پروتکل‌های SAML و OIDC اتصال‌دهنده خود را بسازید.',
  create_modal: {
    title: 'افزودن اتصال‌دهنده سازمانی',
    text_divider: 'یا می‌توانید اتصال‌دهنده خود را با یک پروتکل استاندارد سفارشی‌سازی کنید.',
    connector_name_field_title: 'نام اتصال‌دهنده',
    connector_name_field_placeholder: 'مثلاً: {نام شرکت} - {نام ارائه‌دهنده هویت}',
    create_button_text: 'ایجاد اتصال‌دهنده',
  },
  guide: {
    subtitle: 'راهنمای گام‌به‌گام برای اتصال به ارائه‌دهنده هویت سازمانی.',
    finish_button_text: 'ادامه',
  },
  basic_info: {
    title: 'پیکربندی سرویس در ارائه‌دهنده هویت',
    description:
      'یک یکپارچه‌سازی برنامه جدید با SAML 2.0 در ارائه‌دهنده هویت {{name}} خود ایجاد کنید. سپس مقادیر زیر را در آن قرار دهید.',
    saml: {
      acs_url_field_name: 'آدرس URL سرویس مصرف‌کننده اظهاریه (Reply URL)',
      audience_uri_field_name: 'شناسه URI مخاطب (SP Entity ID)',
      entity_id_field_name: 'شناسه موجودیت ارائه‌دهنده خدمات (SP)',
      entity_id_field_tooltip:
        'شناسه موجودیت SP می‌تواند در هر قالب رشته‌ای باشد، معمولاً به صورت URI یا URL به عنوان شناسه استفاده می‌شود، اما الزامی نیست.',
      acs_url_field_placeholder: 'https://your-domain.com/api/saml/callback',
      entity_id_field_placeholder: 'urn:your-domain.com:sp:saml:{serviceProviderId}',
    },
    oidc: {
      redirect_uri_field_name: 'آدرس URI بازگشت (Callback URL)',
      redirect_uri_field_description:
        'آدرس URI بازگشت جایی است که کاربران پس از احراز هویت SSO به آن هدایت می‌شوند. این URI را به پیکربندی ارائه‌دهنده هویت خود اضافه کنید.',
      redirect_uri_field_custom_domain_description:
        'اگر از چندین <a>دامنه سفارشی</a> در لاگتو استفاده می‌کنید، مطمئن شوید که تمام URI‌های callback مربوطه را به ارائه‌دهنده هویت خود اضافه کرده‌اید تا SSO در همه دامنه‌ها کار کند.\n\nدامنه پیش‌فرض لاگتو (*.logto.app) همیشه معتبر است — آن را فقط در صورتی که می‌خواهید SSO را در آن دامنه نیز پشتیبانی کنید، اضافه کنید.',
    },
  },
  attribute_mapping: {
    title: 'نگاشت ویژگی‌ها',
    description:
      '`id` و `email` برای همگام‌سازی پروفایل کاربر از ارائه‌دهنده هویت الزامی هستند. نام و مقدار claim زیر را در ارائه‌دهنده هویت خود وارد کنید.',
    col_sp_claims: 'مقدار ارائه‌دهنده خدمات (لاگتو)',
    col_idp_claims: 'نام claim ارائه‌دهنده هویت',
    idp_claim_tooltip: 'نام claim ارائه‌دهنده هویت',
  },
  metadata: {
    title: 'پیکربندی متادیتای ارائه‌دهنده هویت',
    description: 'متادیتا را از ارائه‌دهنده هویت پیکربندی کنید',
    dropdown_trigger_text: 'استفاده از روش پیکربندی دیگر',
    dropdown_title: 'روش پیکربندی خود را انتخاب کنید',
    metadata_format_url: 'وارد کردن آدرس URL متادیتا',
    metadata_format_xml: 'بارگذاری فایل XML متادیتا',
    metadata_format_manual: 'وارد کردن جزئیات متادیتا به صورت دستی',
    saml: {
      metadata_url_field_name: 'آدرس URL متادیتا',
      metadata_url_description:
        'داده‌ها را به صورت پویا از آدرس URL متادیتا دریافت کنید و گواهی را به‌روز نگه دارید.',
      metadata_xml_field_name: 'فایل XML متادیتای ارائه‌دهنده هویت',
      metadata_xml_uploader_text: 'بارگذاری فایل XML متادیتا',
      sign_in_endpoint_field_name: 'آدرس URL ورود',
      idp_entity_id_field_name: 'شناسه موجودیت ارائه‌دهنده هویت (Issuer)',
      certificate_field_name: 'گواهی امضا',
      certificate_placeholder: 'گواهی x509 را کپی و جای‌گذاری کنید',
      certificate_required: 'گواهی امضا الزامی است.',
    },
    oidc: {
      client_id_field_name: 'شناسه کلاینت',
      client_secret_field_name: 'کلید مخفی کلاینت',
      issuer_field_name: 'صادرکننده',
      scope_field_name: 'دامنه دسترسی',
      scope_field_placeholder: 'دامنه‌های دسترسی را وارد کنید (جدا شده با فاصله)',
    },
  },
};

export default Object.freeze(enterprise_sso);
