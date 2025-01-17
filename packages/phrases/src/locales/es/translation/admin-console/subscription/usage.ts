const usage = {
  /** UNTRANSLATED */
  status_active: 'In use',
  /** UNTRANSLATED */
  status_inactive: 'Not in use',
  /** UNTRANSLATED */
  limited_status_quota_description: '(First {{quota}} included)',
  /** UNTRANSLATED */
  unlimited_status_quota_description: '(Included)',
  /** UNTRANSLATED */
  disabled_status_quota_description: '(Not included)',
  /** UNTRANSLATED */
  usage_description_with_unlimited_quota: '{{usage}}<span> (Unlimited)</span>',
  /** UNTRANSLATED */
  usage_description_with_limited_quota: '{{usage}}<span> (First {{basicQuota}} included)</span>',
  /** UNTRANSLATED */
  usage_description_without_quota: '{{usage}}<span> (Not included)</span>',
  mau: {
    title: 'MAU',
    tooltip:
      'Un MAU es un usuario único que ha intercambiado al menos un token con Logto dentro de un ciclo de facturación. Ilimitado para el Plan Pro. <a>Más información</a>',
    /** UNTRANSLATED */
    tooltip_for_enterprise:
      'A MAU is a unique user who has exchanged at least one token with Logto within a billing cycle. Unlimited for the Enterprise Plan.',
  },
  organizations: {
    title: 'Organizaciones',
    tooltip:
      'Función adicional con una tarifa fija de ${{price, number}} por mes. El precio no se ve afectado por el número de organizaciones o su nivel de actividad.',
    /** UNTRANSLATED */
    description_for_enterprise: '(Included)',
    /** UNTRANSLATED */
    tooltip_for_enterprise:
      'Inclusion depends on your plan. If the organization feature isn’t in your initial contract, it will be added to your bill when you activate it. The add-on costs ${{price, number}}/month, regardless of the number of organizations or their activity.',
    /** UNTRANSLATED */
    tooltip_for_enterprise_with_numbered_basic_quota:
      'Your plan includes the first {{basicQuota}} organizations for free. If you need more, you can add them with the organization add-on at a flat rate of ${{price, number}} per month, regardless of the number of organizations or their activity level.',
  },
  mfa: {
    title: 'MFA',
    tooltip:
      'Función adicional con una tarifa fija de ${{price, number}} por mes. El precio no se ve afectado por el número de factores de autenticación utilizados.',
    /** UNTRANSLATED */
    tooltip_for_enterprise:
      'Inclusion depends on your plan. If the MFA feature isn’t in your initial contract, it will be added to your bill when you activate it. The add-on costs ${{price, number}}/month, regardless of the number of authentication factors used.',
  },
  enterprise_sso: {
    title: 'SSO empresarial',
    tooltip: 'Función adicional con un precio de ${{price, number}} por conexión SSO por mes.',
    /** UNTRANSLATED */
    tooltip_for_enterprise:
      'Add-on feature with a price of ${{price, number}} per SSO connection per month. The first {{basicQuota}} SSO are included and free to use in your contract-based plan.',
  },
  api_resources: {
    title: 'Recursos API',
    tooltip:
      'Función adicional con un precio de ${{price, number}} por recurso por mes. Los primeros 3 recursos API son gratis.',
    /** UNTRANSLATED */
    tooltip_for_enterprise:
      'The first {{basicQuota}} API resources are included and free to use in your contract-based plan. If you need more, ${{price, number}} per API resource per month.',
  },
  machine_to_machine: {
    title: 'Máquina a máquina',
    tooltip:
      'Función adicional con un precio de ${{price, number}} por aplicación por mes. La primera aplicación de máquina a máquina es gratis.',
    /** UNTRANSLATED */
    tooltip_for_enterprise:
      'The first {{basicQuota}} machine-to-machine app is free to use in your contract-based plan. If you need more, ${{price, number}} per app per month.',
  },
  tenant_members: {
    title: 'Miembros del inquilino',
    tooltip:
      'Función adicional con un precio de ${{price, number}} por miembro por mes. Los primeros 3 miembros del inquilino son gratis.',
    /** UNTRANSLATED */
    tooltip_for_enterprise:
      'The first {{basicQuota}} tenant members are included and free to use in your contract-based plan. If you need more, ${{price, number}} per tenant member per month.',
  },
  tokens: {
    title: 'Tokens',
    tooltip:
      'Función adicional con un precio de ${{price, number}} por {{tokenLimit}} de tokens. El primer {{basicQuota}} de tokens está incluido.',
    /** UNTRANSLATED */
    tooltip_for_enterprise:
      'The first {{basicQuota}} tokens is included and free to use in your contract-based plan. If you need more, ${{price, number}} per {{tokenLimit}} tokens per month.',
  },
  hooks: {
    title: 'Ganchos',
    tooltip:
      'Función adicional con un precio de ${{price, number}} por gancho. Los primeros 10 ganchos están incluidos.',
    /** UNTRANSLATED */
    tooltip_for_enterprise:
      'The first {{basicQuota}} hooks are included and free to use in your contract-based plan. If you need more, ${{price, number}} per hook per month.',
  },
  pricing: {
    add_on_changes_in_current_cycle_notice:
      'Si realizas algún cambio durante el ciclo de facturación actual, tu próximo recibo puede ser ligeramente más alto durante el primer mes después del cambio. Será ${{price, number}} como precio base más los costos adicionales por el uso no facturado del ciclo actual y el cargo completo para el próximo ciclo. <a>Más información</a>',
  },
};

export default Object.freeze(usage);
