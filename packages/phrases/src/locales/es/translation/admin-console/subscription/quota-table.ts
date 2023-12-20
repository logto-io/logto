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
    sso: 'SSO empresarial',
  },
  user_management: {
    title: 'Gestión de usuarios',
    user_management: 'Gestión de usuarios',
    roles: 'Roles',
    /** UNTRANSLATED */
    machine_to_machine_roles: 'Machine-to-machine roles',
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
    /** UNTRANSLATED */
    organizations: 'Organizations',
    /** UNTRANSLATED */
    monthly_active_organization: 'Monthly active organization',
    /** UNTRANSLATED */
    allowed_users_per_org: 'Allowed users per org',
    /** UNTRANSLATED */
    invitation: 'Invitation (Coming soon)',
    /** UNTRANSLATED */
    org_roles: 'Org roles',
    /** UNTRANSLATED */
    org_permissions: 'Org permissions',
    /** UNTRANSLATED */
    just_in_time_provisioning: 'Just-in-time provisioning',
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
  /** UNTRANSLATED */
  free_token_limit_tip: 'Free for {{value}}M token issued.',
  /** UNTRANSLATED */
  paid_token_limit_tip:
    'Free for {{value}}M token issued. We may add charges if you go beyond {{value}}M tokens once we finalize the prices.',
  /** UNTRANSLATED */
  paid_quota_limit_tip:
    'We may add charges for features that go beyond your quota limit as add-ons once we finalize the prices.',
  /** UNTRANSLATED */
  beta_feature_tip:
    'Free to use during the beta phase. We will begin charging once we finalize the add-on pricing.',
  /** UNTRANSLATED */
  usage_based_beta_feature_tip:
    'Free to use during the beta phase. We will begin charging once we finalize the org usage-based pricing.',
  /** UNTRANSLATED */
  beta: 'Beta',
  /** UNTRANSLATED */
  add_on_beta: 'Add-on (Beta)',
};

export default Object.freeze(quota_table);
