const featured_plan_content = {
  mau: {
    free_plan: 'До {{count, number}} MAU',
    pro_plan: 'Неограниченные MAU',
  },
  m2m: {
    free_plan: '{{count, number}} от устройства к устройству',
    pro_plan: 'Дополнительное устройство к устройству',
  },
  saml_and_third_party_apps: 'Приложения SAML и приложения третьих сторон',
  third_party_apps: 'IdP для сторонних приложений',
  mfa: 'Многофакторная аутентификация',
  sso: 'Корпоративный SSO',
  role_and_permissions: {
    free_plan: '{{roleCount, number}} роль и {{permissionCount, number}} разрешение на роль',
    pro_plan: 'Неограниченные роли и разрешения на роль',
  },
  rbac: 'Контроль доступа на основе ролей',
  organizations: 'Организации',
  audit_logs: 'Хранение журналов аудита: {{count, number}} дней',
};

export default Object.freeze(featured_plan_content);
