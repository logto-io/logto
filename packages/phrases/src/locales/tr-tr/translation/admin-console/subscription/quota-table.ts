const quota_table = {
  quota: {
    title: 'Kota',
    tenant_limit: 'Kiracı sınırlaması',
    base_price: 'Temel fiyat',
    mau_unit_price: '* MAU birim fiyatı',
    mau_limit: 'MAU sınırlaması',
  },
  application: {
    title: 'Uygulamalar',
    total: 'Toplam',
    m2m: 'Makineye Makine',
  },
  resource: {
    title: 'API kaynakları',
    resource_count: 'Kaynak sayısı',
    scopes_per_resource: 'Kaynak başına izin',
  },
  branding: {
    title: 'Markalama',
    custom_domain: 'Özel Alan Adı',
  },
  user_authn: {
    title: 'Kullanıcı yetkilendirmesi',
    omni_sign_in: 'Omni girişi',
    built_in_email_connector: 'Dahili e-posta bağlayıcısı',
    social_connectors: 'Sosyal bağlayıcılar',
    standard_connectors: 'Standart bağlayıcılar',
  },
  roles: {
    title: 'Roller',
    roles: 'Roller',
    scopes_per_role: 'Rol başına izin',
  },
  audit_logs: {
    title: 'Denetim günlükleri',
    retention: 'Saklama',
  },
  hooks: {
    title: 'Hooks',
    amount: 'Miktar',
  },
  support: {
    title: 'Destek',
    community: 'Topluluk',
    customer_ticket: 'Müşteri bileti',
    premium: 'Premium',
  },
  mau_unit_price_footnote:
    '* Gerçek kaynakların tüketimine bağlı olarak birim fiyatlarımız değişebilir ve Logto, birim fiyatlardaki değişikliklerin açıklamasını yapma hakkını saklı tutar.',
  unlimited: 'Sınırsız',
  contact: 'İletişim',
  // eslint-disable-next-line no-template-curly-in-string
  monthly_price: '${{value, number}}/ay',
  // eslint-disable-next-line no-template-curly-in-string
  mau_price: '${{value, number}}/MAU',
  days_one: '{{count, number}} gün',
  days_other: '{{count, number}} gün',
  add_on: 'Ek fonksiyon',
};

export default quota_table;
