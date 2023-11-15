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
  organization: {
    title: 'Organizasyon',
    organization: 'Organization (Q4, 2023)',
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
};

export default Object.freeze(quota_table);
