const quota_table = {
  quota: {
    title: 'Cuota',
    tenant_limit: 'Límite de inquilino',
    base_price: 'Precio base',
    mau_unit_price: '* Precio unitario MAU',
    mau_limit: 'Límite de MAU',
  },
  application: {
    title: 'Aplicaciones',
    total: 'Total',
    m2m: 'Máquina a máquina',
  },
  resource: {
    title: 'Recursos API',
    resource_count: 'Recuento de recursos',
    scopes_per_resource: 'Permisos por recurso',
  },
  branding: {
    title: 'Branding',
    custom_domain: 'Dominio personalizado',
  },
  user_authn: {
    title: 'Autenticación de usuario',
    omni_sign_in: 'Inicio de sesión Omni',
    built_in_email_connector: 'Conector de correo electrónico incorporado',
    social_connectors: 'Conectores sociales',
    standard_connectors: 'Conectores estándar',
  },
  roles: {
    title: 'Roles',
    roles: 'Roles',
    scopes_per_role: 'Permisos por rol',
  },
  audit_logs: {
    title: 'Registros de auditoría',
    retention: 'Retención',
  },
  hooks: {
    title: 'Hooks',
    amount: 'Cantidad',
  },
  support: {
    title: 'Soporte',
    community: 'Comunidad',
    customer_ticket: 'Ticket de cliente',
    premium: 'Premium',
  },
  mau_unit_price_footnote:
    '* Nuestras tarifas unitarias pueden variar según los recursos consumidos y Logto se reserva el derecho de explicar cualquier cambio en las tarifas unitarias.',
  unlimited: 'Sin límites',
  contact: 'Contacto',
  // eslint-disable-next-line no-template-curly-in-string
  monthly_price: '${{value, number}}/mes',
  // eslint-disable-next-line no-template-curly-in-string
  mau_price: '${{value, number}}/MAU',
  days_one: '{{count, number}} día',
  days_other: '{{count, number}} días',
  add_on: 'Agregar',
};

export default quota_table;
