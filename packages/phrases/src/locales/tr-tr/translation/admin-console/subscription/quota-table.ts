const quota_table = {
  quota: {
    title: 'Kota',
    tenant_limit: 'Kiracı limiti',
    base_price: 'Temel fiyat',
    mau_unit_price: '* Aylık Etkin Kullanıcı (MAU) birim fiyatı',
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
    /** UNTRANSLATED */
    organizations: 'Organizations',
    /** UNTRANSLATED */
    monthly_active_organization: 'Monthly active organization',
    /** UNTRANSLATED */
    allowed_users_per_org: 'Allowed users per org',
    /** UNTRANSLATED */
    invitation: 'Invitation (Coming soon)',
    /** UNTRANSLATED */
    org_roles: 'Org roles',
    /** UNTRANSLATED */
    org_permissions: 'Org permissions',
    /** UNTRANSLATED */
    just_in_time_provisioning: 'Just-in-time provisioning',
  },
  support: {
    title: 'Destek',
    community: 'Topluluk',
    customer_ticket: 'Müşteri destek bileti',
    premium: 'Premium',
  },
  mau_unit_price_footnote:
    '* Aylık etkin kullanıcılarınız (MAU), faturalandırma dönemi boyunca ne sıklıkla oturum açtıklarına göre 3 düzeye ayrılır. Her düzeyin farklı bir MAU birim fiyatı vardır.',
  unlimited: 'Sınırsız',
  contact: 'İletişim',
  monthly_price: '${{value, number}}/ay',
  mau_price: '${{value, number}}/MAU',
  days_one: '{{count, number}} gün',
  days_other: '{{count, number}} gün',
  add_on: 'Ek Hizmet',
  tier: 'Seviye{{value, number}}: ',
  /** UNTRANSLATED */
  free_token_limit_tip: 'Free for {{value}}M token issued.',
  /** UNTRANSLATED */
  paid_token_limit_tip:
    'Free for {{value}}M token issued. We may add charges if you go beyond {{value}}M tokens once we finalize the prices.',
  /** UNTRANSLATED */
  paid_quota_limit_tip:
    'We may add charges for features that go beyond your quota limit as add-ons once we finalize the prices.',
  /** UNTRANSLATED */
  beta_feature_tip:
    'Free to use during the beta phase. We will begin charging once we finalize the add-on pricing.',
  /** UNTRANSLATED */
  beta: 'Beta',
  /** UNTRANSLATED */
  add_on_beta: 'Add-on (Beta)',
};

export default Object.freeze(quota_table);
