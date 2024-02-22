const featured_plan_content = {
  mau: {
    free_plan: 'Hasta {{count, number}} MAU',
    pro_plan: 'MAU ilimitados',
  },
  m2m: {
    free_plan: '{{count, number}} de máquina a máquina',
    pro_plan: 'Máquina a máquina adicional',
  },
  third_party_apps: 'IdP para aplicaciones de terceros',
  mfa: 'Autenticación multifactor',
  sso: 'SSO empresarial',
  role_and_permissions: {
    free_plan: '{{roleCount, number}} rol y {{permissionCount, number}} permiso por rol',
    pro_plan: 'Roles y permisos ilimitados por rol',
  },
  organizations: 'Organizaciones',
  audit_logs: 'Retención de registros de auditoría: {{count, number}} días',
};

export default Object.freeze(featured_plan_content);
