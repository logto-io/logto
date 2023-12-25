const quota_table = {
  quota: {
    title: 'Kota',
    tenant_limit: 'Kiracı limiti',
    base_price: 'Temel fiyat',
    mau_limit: 'MAU limiti',
  },
  application: {
    title: 'Uygulamalar',
    total: 'Toplam uygulama sayısı',
    m2m: 'Makine-makine uygulamaları',
  },
  resource: {
    title: 'API Kaynakları',
    resource_count: 'Kaynak sayısı',
    scopes_per_resource: 'Kaynak başına izinler',
  },
  branding: {
    title: 'Kullanıcı Arayüzü ve Markalama',
    custom_domain: 'Özel alan adı',
    custom_css: 'Özel CSS',
    app_logo_and_favicon: 'Uygulama logoları ve favicon',
    dark_mode: 'Karanlık mod',
    i18n: 'Uluslararasılaştırma',
  },
  user_authn: {
    title: 'Kullanıcı Kimlik Doğrulama',
    omni_sign_in: 'Çoklu oturum açma',
    password: 'Parola',
    passwordless: 'Parolasız - E-posta ve SMS',
    email_connector: 'E-posta bağlayıcı',
    sms_connector: 'SMS bağlayıcı',
    social_connectors: 'Sosyal bağlayıcılar',
    standard_connectors: 'Standart bağlayıcılar',
    built_in_email_connector: 'Dahili e-posta bağlayıcısı',
    mfa: 'MFA',
    sso: 'Kurumsal SSO',
  },
  user_management: {
    title: 'Kullanıcı Yönetimi',
    user_management: 'Kullanıcı Yönetimi',
    roles: 'Roller',
    machine_to_machine_roles: 'Makine-makine rolleri',
    scopes_per_role: 'Rol başına izinler',
  },
  audit_logs: {
    title: 'Denetim Günlükleri',
    retention: 'Saklama',
  },
  hooks: {
    title: 'Web Kancaları',
    hooks: 'Web Kancaları',
  },
  organizations: {
    title: 'Organizasyon',
    organizations: 'Organizasyonlar',
    monthly_active_organization: 'Aylık aktif organizasyon',
    allowed_users_per_org: 'Organizasyon başına izin verilen kullanıcılar',
    invitation: 'Davet (Yakında)',
    org_roles: 'Org rolleri',
    org_permissions: 'Org izinleri',
    just_in_time_provisioning: 'İstisnai olana kadar temin',
  },
  support: {
    /** UNTRANSLATED */
    title: 'Compliance and support',
    community: 'Topluluk',
    customer_ticket: 'Müşteri destek bileti',
    premium: 'Premium',
    /** UNTRANSLATED */
    email_ticket_support: 'Email ticket support',
    /** UNTRANSLATED */
    soc2_report: 'SOC2 report (Coming soon)',
    /** UNTRANSLATED */
    hipaa_or_baa_report: 'HIPAA/BAA report (Coming soon)',
  },
  unlimited: 'Sınırsız',
  contact: 'İletişim',
  monthly_price: '${{value, number}}/ay',
  days_one: '{{count, number}} gün',
  days_other: '{{count, number}} gün',
  add_on: 'Ek Hizmet',
  tier: 'Seviye{{value, number}}: ',
  free_token_limit_tip: 'Free for {{value}}M token issued.',
  paid_token_limit_tip:
    'Free for {{value}}M token issued. We may add charges if you go beyond {{value}}M tokens once we finalize the prices.',
  paid_quota_limit_tip:
    'We may add charges for features that go beyond your quota limit as add-ons once we finalize the prices.',
  beta_feature_tip:
    'Free to use during the beta phase. We will begin charging once we finalize the add-on pricing.',
  usage_based_beta_feature_tip:
    'Free to use during the beta phase. We will begin charging once we finalize the org usage-based pricing.',
  beta: 'Beta',
  add_on_beta: 'Add-on (Beta)',
};

export default Object.freeze(quota_table);
