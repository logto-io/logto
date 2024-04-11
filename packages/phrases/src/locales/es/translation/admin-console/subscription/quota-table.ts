const quota_table = {
  quota: {
    title: 'Conceptos básicos',
    base_price: 'Precio base',
    mau_limit: 'Límite de MAU',
    included_tokens: 'Tokens incluidos',
  },
  application: {
    title: 'Aplicaciones',
    total: 'Total de aplicaciones',
    m2m: 'Aplicación machine-to-machine',
    /** UNTRANSLATED */
    third_party: 'Third-party apps',
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
    mfa: 'Autenticación multifactor',
    sso: 'SSO empresarial',
    adaptive_mfa: 'MFA adaptativo',
  },
  user_management: {
    title: 'Gestión de usuarios',
    user_management: 'Gestión de usuarios',
    roles: 'Roles',
    machine_to_machine_roles: 'Roles de máquina a máquina',
    scopes_per_role: 'Permisos por rol',
  },
  organizations: {
    title: 'Organización',
    organizations: 'Organizaciones',
    monthly_active_organization: 'Organización activa mensualmente',
    allowed_users_per_org: 'Usuarios permitidos por organización',
    invitation: 'Invitación',
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
  developers_and_platform: {
    /** UNTRANSLATED */
    title: 'Developers and platform',
    /** UNTRANSLATED */
    hooks: 'Webhooks',
    /** UNTRANSLATED */
    audit_logs_retention: 'Audit logs retention',
    /** UNTRANSLATED */
    jwt_claims: 'JWT claims',
    /** UNTRANSLATED */
    tenant_members: 'Tenant members',
  },
  unlimited: 'Ilimitado',
  contact: 'Contacto',
  monthly_price: '${{value, number}}/mes',
  days_one: '{{count, number}} día',
  days_other: '{{count, number}} días',
  add_on: 'Complemento',
  tier: 'Nivel{{value, number}}: ',
  paid_token_limit_tip:
    'Logto agregará cargos por funciones que superen su límite de cuota. Puede usarlo sin costo hasta que comencemos a cobrar alrededor del segundo trimestre de 2024. Si necesita más tokens, por favor contáctenos. Por defecto, cobramos $80 por mes por cada millón de tokens.',
  paid_quota_limit_tip:
    'Logto agregará cargos por funciones que excedan su límite de cuota. Puede usarlo sin costo hasta que comencemos a cobrar aproximadamente en el segundo trimestre de 2024.',
  paid_add_on_feature_tip:
    'Esta es una característica adicional. Puede usarla sin costo hasta que comencemos a cobrar aproximadamente en el segundo trimestre de 2024.',
  million: '{{value, number}} millones',
  mau_tip:
    'MAU (usuarios activos mensuales) significa el número de usuarios únicos que han intercambiado al menos un token con Logto en un ciclo de facturación.',
  tokens_tip:
    'Todo tipo de tokens emitidos por Logto, incluyendo tokens de acceso, tokens de actualización, etc.',
  mao_tip:
    'MAO (Organización activa mensual) significa la cantidad de organizaciones únicas que tienen al menos un MAU (usuario activo mensual) en un ciclo de facturación.',
  /** UNTRANSLATED */
  third_party_tip:
    'Use Logto as your OIDC identity provider for third-party app sign-ins and permission grants.',
  included: 'incluido{{value, number}}',
  included_mao: '{{value, number}} MAO incluido',
  extra_quota_price: 'Luego ${{value, number}} por mes / cada uno después',
  per_month_each: '${{value, number}} por mes / cada uno',
  extra_mao_price: 'Luego ${{value, number}} por MAO',
  per_month: '${{value, number}} por mes',
  /** UNTRANSLATED */
  per_member: 'Then ${{value, number}} per member',
};

export default Object.freeze(quota_table);
