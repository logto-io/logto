const quota_item = {
  tenant_limit: {
    name: 'Tenants',
    limited: '{{count, number}} inquilino',
    limited_other: '{{count, number}} inquilinos',
    unlimited: 'Inquilinos ilimitados',
  },
  mau_limit: {
    name: 'Monthly active users',
    limited: '{{count, number}} MAU',
    unlimited: 'MAU ilimitados',
  },
  applications_limit: {
    name: 'Applications',
    limited: '{{count, number}} aplicación',
    limited_other: '{{count, number}} aplicaciones',
    unlimited: 'Aplicaciones ilimitadas',
  },
  machine_to_machine_limit: {
    name: 'Machine to machine',
    limited: '{{count, number}} aplicación de máquina a máquina',
    limited_other: '{{count, number}} aplicaciones de máquina a máquina',
    unlimited: 'Aplicaciones de máquina a máquina ilimitadas',
  },
  resources_limit: {
    name: 'API resources',
    limited: '{{count, number}} recurso de API',
    limited_other: '{{count, number}} recursos de API',
    unlimited: 'Recursos de API ilimitados',
  },
  scopes_per_resource_limit: {
    name: 'Resource permissions',
    limited: '{{count, number}} permiso por recurso',
    limited_other: '{{count, number}} permisos por recurso',
    unlimited: 'Permisos de recursos ilimitados',
  },
  custom_domain_enabled: {
    name: 'Custom domain',
    limited: 'Dominio personalizado',
    unlimited: 'Dominio personalizado',
  },
  omni_sign_in_enabled: {
    name: 'Omni sign-in',
    limited: 'Omni sign-in',
    unlimited: 'Omni sign-in',
  },
  built_in_email_connector_enabled: {
    name: 'Built-in email connector',
    limited: 'Conector de correo electrónico incorporado',
    unlimited: 'Conector de correo electrónico incorporado',
  },
  social_connectors_limit: {
    name: 'Social connectors',
    limited: '{{count, number}} conector social',
    limited_other: '{{count, number}} conectores sociales',
    unlimited: 'Conectores sociales ilimitados',
  },
  standard_connectors_limit: {
    name: 'Free standard connectors',
    limited: '{{count, number}} conector estándar gratuito',
    limited_other: '{{count, number}} conectores estándar gratuitos',
    unlimited: 'Conectores estándar ilimitados',
  },
  roles_limit: {
    name: 'Roles',
    limited: '{{count, number}} rol',
    limited_other: '{{count, number}} roles',
    unlimited: 'Roles ilimitados',
  },
  scopes_per_role_limit: {
    name: 'Role permissions',
    limited: '{{count, number}} permiso por rol',
    limited_other: '{{count, number}} permisos por rol',
    unlimited: 'Permisos de rol ilimitados',
  },
  hooks_limit: {
    name: 'Hooks',
    limited: '{{count, number}} gancho',
    limited_other: '{{count, number}} ganchos',
    unlimited: 'Ganchos ilimitados',
  },
  audit_logs_retention_days: {
    name: 'Audit logs retention',
    limited: 'Retención de registros de auditoría: {{count, number}} día',
    limited_other: 'Retención de registros de auditoría: {{count, number}} días',
    unlimited: 'Días ilimitados',
  },
  community_support_enabled: {
    name: 'Community support',
    limited: 'Soporte de la comunidad',
    unlimited: 'Soporte de la comunidad',
  },
  customer_ticket_support: {
    name: 'Customer ticket support',
    limited: '{{count, number}} hora de soporte de tickets de cliente',
    limited_other: '{{count, number}} horas de soporte de tickets de cliente',
    unlimited: 'Soporte de tickets de cliente',
  },
};

export default quota_item;
