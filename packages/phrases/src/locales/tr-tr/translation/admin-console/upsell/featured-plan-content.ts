const featured_plan_content = {
  mau: {
    free_plan: "{{count, number}} MAU'ya kadar",
    pro_plan: 'Sınırsız MAU',
  },
  m2m: {
    free_plan: '{{count, number}} makineye makineye',
    pro_plan: 'Ek makineye makineye',
  },
  saml_and_third_party_apps: 'SAML uygulamaları ve üçüncü taraf uygulamaları',
  third_party_apps: 'Üçüncü taraf uygulamalar için IdP',
  mfa: 'Çok faktörlü kimlik doğrulama',
  sso: 'Kurumsal SSO',
  role_and_permissions: {
    free_plan: '{{roleCount, number}} rol ve {{permissionCount, number}} izin başına rol',
    pro_plan: 'Rol başına sınırsız roller ve izinler',
  },
  rbac: 'Rol tabanlı erişim kontrolü',
  organizations: 'Organizasyonlar',
  audit_logs: 'Denetim günlükleri saklama: {{count, number}} gün',
};

export default Object.freeze(featured_plan_content);
