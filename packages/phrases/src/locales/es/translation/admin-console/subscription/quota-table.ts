const quota_table = {
  quota: {
    title: 'Cuota',
    tenant_limit: 'Límite de inquilinos',
    base_price: 'Precio base',
    mau_limit: 'Límite de MAU',
  },
  application: {
    title: 'Aplicaciones',
    total: 'Total de aplicaciones',
    m2m: 'Aplicación machine-to-machine',
  },
  resource: {
    title: 'Recursos de API',
    resource_count: 'Cantidad de recursos',
    scopes_per_resource: 'Permisos por recurso',
  },
  branding: {
    title: 'Interfaz de usuario y branding',
    custom_domain: 'Dominio personalizado',
    custom_css: 'CSS personalizado',
    app_logo_and_favicon: 'Logo de la aplicación y favicon',
    dark_mode: 'Modo oscuro',
    i18n: 'Internacionalización',
  },
  user_authn: {
    title: 'Autenticación de usuario',
    omni_sign_in: 'Inicio de sesión omnicanal',
    password: 'Contraseña',
    passwordless: 'Sin contraseña - Correo electrónico y SMS',
    email_connector: 'Conector de correo electrónico',
    sms_connector: 'Conector de SMS',
    social_connectors: 'Conectores sociales',
    standard_connectors: 'Conectores estándar',
    built_in_email_connector: 'Conector de correo electrónico incorporado',
    mfa: 'MFA',
    sso: 'SSO empresarial',
  },
  user_management: {
    title: 'Gestión de usuarios',
    user_management: 'Gestión de usuarios',
    roles: 'Roles',
    machine_to_machine_roles: 'Roles de máquina a máquina',
    scopes_per_role: 'Permisos por rol',
  },
  audit_logs: {
    title: 'Registros de auditoría',
    retention: 'Retención',
  },
  hooks: {
    title: 'Webhooks',
    hooks: 'Webhooks',
  },
  organizations: {
    title: 'Organización',
    organizations: 'Organizaciones',
    monthly_active_organization: 'Organización activa mensualmente',
    allowed_users_per_org: 'Usuarios permitidos por organización',
    invitation: 'Invitación (Próximamente)',
    org_roles: 'Roles de organización',
    org_permissions: 'Permisos de organización',
    just_in_time_provisioning: 'Provisión justo a tiempo',
  },
  support: {
    title: 'Cumplimiento y soporte',
    community: 'Comunidad',
    customer_ticket: 'Ticket de soporte',
    premium: 'Premium',
    email_ticket_support: 'Soporte por ticket de correo electrónico',
    soc2_report: 'Informe SOC2 (Próximamente)',
    hipaa_or_baa_report: 'Informe HIPAA/BAA (Próximamente)',
  },
  unlimited: 'Ilimitado',
  contact: 'Contacto',
  monthly_price: '${{value, number}}/mes',
  days_one: '{{count, number}} día',
  days_other: '{{count, number}} días',
  add_on: 'Complemento',
  tier: 'Nivel{{value, number}}: ',
  free_token_limit_tip: 'Gratis para {{value}}M tokens emitidos.',
  paid_token_limit_tip:
    'Gratis para {{value}}M tokens emitidos. Es posible que agreguemos cargos si supera los {{value}}M tokens una vez que finalicemos los precios.',
  paid_quota_limit_tip:
    'Podemos agregar cargos por funciones que excedan su límite de cuota como complementos una vez que finalicemos los precios.',
  beta_feature_tip:
    'Gratis durante la fase beta. Comenzaremos a cobrar una vez que finalicemos la fijación de precios del complemento.',
  usage_based_beta_feature_tip:
    'Gratis durante la fase beta. Comenzaremos a cobrar una vez que finalicemos los precios basados en el uso de la organización.',
  beta: 'Beta',
  add_on_beta: 'Complemento (Beta)',
};

export default Object.freeze(quota_table);
