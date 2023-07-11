const quota_item = {
  tenant_limit: {
    name: 'Kiracılar',
    limited: '{{count, number}} kiracı',
    limited_other: '{{count, number}} kiracı',
    unlimited: 'Sınırsız kiracı',
  },
  mau_limit: {
    name: 'Aylık aktif kullanıcılar',
    limited: '{{count, number}} AK',
    unlimited: 'Sınırsız AK',
  },
  applications_limit: {
    name: 'Uygulamalar',
    limited: '{{count, number}} uygulama',
    limited_other: '{{count, number}} uygulama',
    unlimited: 'Sınırsız uygulama',
  },
  machine_to_machine_limit: {
    name: 'Makineye Makine',
    limited: '{{count, number}} makine için uygulama',
    limited_other: '{{count, number}} makine için uygulamalar',
    unlimited: 'Sınırsız makine için uygulamalar',
  },
  resources_limit: {
    name: 'API kaynakları',
    limited: '{{count, number}} API kaynağı',
    limited_other: '{{count, number}} API kaynakları',
    unlimited: 'Sınırsız API kaynağı',
  },
  scopes_per_resource_limit: {
    name: 'Kaynak izinleri',
    limited: '{{count, number}} izin per kaynak',
    limited_other: '{{count, number}} izinler per kaynak',
    unlimited: 'Sınırsız izin per kaynak',
  },
  custom_domain_enabled: {
    name: 'Özel etki alanı',
    limited: 'Özel etki alanı',
    unlimited: 'Özel etki alanı',
  },
  omni_sign_in_enabled: {
    name: 'Omni oturumu',
    limited: 'Omni oturumu',
    unlimited: 'Omni oturumu',
  },
  built_in_email_connector_enabled: {
    name: 'Dahili e-posta bağlayıcı',
    limited: 'Dahili e-posta bağlayıcı',
    unlimited: 'Dahili e-posta bağlayıcı',
  },
  social_connectors_limit: {
    name: 'Sosyal bağlayıcılar',
    limited: '{{count, number}} sosyal bağlayıcı',
    limited_other: '{{count, number}} sosyal bağlayıcı',
    unlimited: 'Sınırsız sosyal bağlayıcı',
  },
  standard_connectors_limit: {
    name: 'Ücretsiz standart bağlayıcılar',
    limited: '{{count, number}} ücretsiz standart bağlayıcı',
    limited_other: '{{count, number}} ücretsiz standart bağlayıcı',
    unlimited: 'Sınırsız standart bağlayıcı',
  },
  roles_limit: {
    name: 'Roller',
    limited: '{{count, number}} rol',
    limited_other: '{{count, number}} roller',
    unlimited: 'Sınırsız roller',
  },
  scopes_per_role_limit: {
    name: 'Rol izinleri',
    limited: '{{count, number}} izin per rol',
    limited_other: '{{count, number}} izinler per rol',
    unlimited: 'Sınırsız izin per rol',
  },
  hooks_limit: {
    name: 'Kancalar',
    limited: '{{count, number}} kancalar',
    limited_other: '{{count, number}} kancalar',
    unlimited: 'Sınırsız kancalar',
  },
  audit_logs_retention_days: {
    name: 'Denetim günlükleri tutma süresi',
    limited: 'Denetim günlükleri saklama: {{count, number}} gün',
    limited_other: 'Denetim günlükleri saklama: {{count, number}} gün',
    unlimited: 'Sınırsız gün',
  },
  community_support_enabled: {
    name: 'Topluluk desteği',
    limited: 'Topluluk desteği',
    unlimited: 'Topluluk desteği',
  },
  customer_ticket_support: {
    name: 'Müşteri bilet desteği',
    limited: '{{count, number}} saat müşteri bilet desteği',
    limited_other: '{{count, number}} saat müşteri bilet desteği',
    unlimited: 'Müşteri bilet desteği',
  },
};

export default quota_item;
