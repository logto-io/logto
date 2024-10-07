const quota_table = {
  quota: {
    title: 'Temel',
    base_price: 'Temel fiyat',
    mau_limit: 'MAU limiti',
    included_tokens: 'Dahil olan jetonlar',
  },
  application: {
    title: 'Uygulamalar',
    total: 'Toplam uygulama sayısı',
    m2m: 'Makine-makine uygulamaları',
    third_party: 'Üçüncü taraf uygulamalar',
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
    logo_and_favicon: 'Logo ve favicon',
    bring_your_ui: 'Kendi arayüzünü getir',
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
    mfa: 'Çoklu faktörlü kimlik doğrulama',
    sso: 'Kurumsal SSO',

    impersonation: 'Taklit etme',
  },
  user_management: {
    title: 'Kullanıcı Yönetimi',
    user_management: 'Kullanıcı Yönetimi',
    roles: 'Roller',
    machine_to_machine_roles: 'Makine-makine rolleri',
    scopes_per_role: 'Rol başına izinler',
  },
  organizations: {
    title: 'Organizasyon',
    organizations: 'Organizasyonlar',
    organization: 'Organizasyon',
    organization_count: 'Organizasyon sayısı',
    allowed_users_per_org: 'Organizasyon başına kullanıcılar',
    invitation: 'Davet (Management API)',
    org_roles: 'Organizasyon rolleri',
    org_permissions: 'Organizasyon izinleri',
    just_in_time_provisioning: 'İstisnai olana kadar temin',
  },
  support: {
    /** UNTRANSLATED */
    title: 'Support',
    community: 'Topluluk',
    customer_ticket: 'Müşteri destek bileti',
    premium: 'Premium',
    email_ticket_support: 'E-posta bileti desteği',
    soc2_report: 'SOC2 raporu',
    hipaa_or_baa_report: 'HIPAA/BAA raporu',
  },
  developers_and_platform: {
    title: 'Geliştiriciler ve platform',
    hooks: 'Webhooks',
    audit_logs_retention: 'Denetim kayıtları saklama',
    jwt_claims: 'JWT iddiaları',
    tenant_members: 'Kiracı üyeleri',
  },
  unlimited: 'Sınırsız',
  contact: 'İletişim',
  monthly_price: '${{value, number}} / ay',
  days_one: '{{count, number}} gün',
  days_other: '{{count, number}} gün',
  add_on: 'Ek Hizmet',
  tier: 'Seviye{{value, number}}: ',

  million: '{{value, number}} milyon',
  mau_tip:
    'MAU (aylık aktif kullanıcı) Logto ile en az bir jeton değiştirmiş olan benzersiz kullanıcı sayısını ifade eder.',
  tokens_tip:
    'Logto tarafından ihraç edilen erişim tokeni, yenileme tokeni vb. dahil olmak üzere tüm token türleri.',
  mao_tip:
    "MAO (aylık aktif kuruluş) bir fatura döngüsünde en az bir MAU'ya (aylık aktif kullanıcı) sahip olan benzersiz kuruluşların sayısını ifade eder.",
  third_party_tip:
    "Logto'yu üçüncü taraf uygulama oturum açma ve izin verme için OIDC kimlik sağlayıcısı olarak kullanın.",
  included: '{{value, number}} dahil',
  included_mao: '{{value, number}} MAO dahil',
  extra_quota_price: 'Sonra aylık ${{value, number}} / sonrasında her biri',
  per_month_each: 'Aylık ${{value, number}} / her biri',
  extra_mao_price: 'Sonra MAO başına ${{value, number}}',
  per_month: 'Aylık ${{value, number}}',
  per_member: 'Sonra ${{value, number}} her üye',
};

export default Object.freeze(quota_table);
