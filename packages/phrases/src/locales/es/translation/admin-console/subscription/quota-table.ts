const quota_table = {
  quota: {
    title: 'Cuota',
    tenant_limit: 'Límite de inquilinos',
    base_price: 'Precio base',
    mau_unit_price: '* Precio unitario de MAU',
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
    sso: 'SSO empresarial (T4, 2023)',
  },
  user_management: {
    title: 'Gestión de usuarios',
    user_management: 'Gestión de usuarios',
    roles: 'Roles',
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
  },
  support: {
    title: 'Soporte',
    community: 'Comunidad',
    customer_ticket: 'Ticket de soporte',
    premium: 'Premium',
  },
  mau_unit_price_footnote:
    '* Sus usuarios activos mensuales (MAU) se dividen en 3 niveles según la frecuencia con la que inician sesión durante el ciclo de facturación. Cada nivel tiene un precio diferente por unidad de MAU.',
  unlimited: 'Ilimitado',
  contact: 'Contacto',
  monthly_price: '${{value, number}}/mes',
  mau_price: '${{value, number}}/MAU',
  days_one: '{{count, number}} día',
  days_other: '{{count, number}} días',
  add_on: 'Complemento',
  tier: 'Nivel{{value, number}}: ',
};

export default Object.freeze(quota_table);
