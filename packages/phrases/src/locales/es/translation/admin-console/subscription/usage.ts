const usage = {
  /** UNTRANSLATED */
  status_active: 'In use',
  /** UNTRANSLATED */
  status_inactive: 'Not in use',
  mau: {
    title: 'MAU',
    description: '{{usage}}',
    tooltip:
      'Un MAU es un usuario único que ha intercambiado al menos un token con Logto dentro de un ciclo de facturación. Ilimitado para el Plan Pro. <a>Más información</a>',
  },
  organizations: {
    title: 'Organizaciones',
    description: '{{usage}}',
    tooltip:
      'Función adicional con una tarifa fija de ${{price, number}} por mes. El precio no se ve afectado por el número de organizaciones o su nivel de actividad.',
  },
  mfa: {
    title: 'MFA',
    description: '{{usage}}',
    tooltip:
      'Función adicional con una tarifa fija de ${{price, number}} por mes. El precio no se ve afectado por el número de factores de autenticación utilizados.',
  },
  enterprise_sso: {
    title: 'SSO empresarial',
    description: '{{usage}}',
    tooltip: 'Función adicional con un precio de ${{price, number}} por conexión SSO por mes.',
  },
  api_resources: {
    title: 'Recursos API',
    description: '{{usage}} <span>(Gratis para los primeros 3)</span>',
    tooltip:
      'Función adicional con un precio de ${{price, number}} por recurso por mes. Los primeros 3 recursos API son gratis.',
  },
  machine_to_machine: {
    title: 'Máquina a máquina',
    description: '{{usage}} <span>(Gratis para el primero)</span>',
    tooltip:
      'Función adicional con un precio de ${{price, number}} por aplicación por mes. La primera aplicación de máquina a máquina es gratis.',
  },
  tenant_members: {
    title: 'Miembros del inquilino',
    description: '{{usage}} <span>(Gratis para los primeros 3)</span>',
    tooltip:
      'Función adicional con un precio de ${{price, number}} por miembro por mes. Los primeros 3 miembros del inquilino son gratis.',
  },
  tokens: {
    title: 'Tokens',
    description: '{{usage}}',
    tooltip:
      'Función adicional con un precio de ${{price, number}} por millón de tokens. El primer millón de tokens está incluido.',
  },
  hooks: {
    title: 'Ganchos',
    description: '{{usage}} <span>(Gratis para los primeros 10)</span>',
    tooltip:
      'Función adicional con un precio de ${{price, number}} por gancho. Los primeros 10 ganchos están incluidos.',
  },
  pricing: {
    add_on_changes_in_current_cycle_notice:
      'Si realizas algún cambio durante el ciclo de facturación actual, tu próximo recibo puede ser ligeramente más alto durante el primer mes después del cambio. Será ${{price, number}} como precio base más los costos adicionales por el uso no facturado del ciclo actual y el cargo completo para el próximo ciclo. <a>Más información</a>',
  },
};

export default Object.freeze(usage);
