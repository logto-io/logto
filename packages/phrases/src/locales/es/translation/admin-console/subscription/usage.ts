const usage = {
  status_active: 'En uso',
  status_inactive: 'No en uso',
  limited_status_quota_description: '(Primeros {{quota}} incluidos)',
  unlimited_status_quota_description: '(Incluido)',
  disabled_status_quota_description: '(No incluido)',
  usage_description_with_unlimited_quota: '{{usage}}<span> (Ilimitado)</span>',
  usage_description_with_limited_quota:
    '{{usage}}<span> (Primeros {{basicQuota}} incluidos)</span>',
  usage_description_without_quota: '{{usage}}<span> (No incluido)</span>',
  mau: {
    title: 'MAU',
    tooltip:
      'Un MAU es un usuario único que ha intercambiado al menos un token con Logto dentro de un ciclo de facturación. Ilimitado para el Plan Pro. <a>Más información</a>',
    tooltip_for_enterprise:
      'Un MAU es un usuario único que ha intercambiado al menos un token con Logto dentro de un ciclo de facturación. Ilimitado para el Plan Empresarial.',
  },
  organizations: {
    title: 'Organizaciones',
    tooltip:
      'Función adicional con una tarifa fija de ${{price, number}} por mes. El precio no se ve afectado por el número de organizaciones o su nivel de actividad.',
    description_for_enterprise: '(Incluido)',
    tooltip_for_enterprise:
      'La inclusión depende de tu plan. Si la función de organización no está en tu contrato inicial, se añadirá a tu factura cuando la actives. El complemento cuesta ${{price, number}}/mes, independientemente del número de organizaciones o su actividad.',
    tooltip_for_enterprise_with_numbered_basic_quota:
      'Tu plan incluye las primeras {{basicQuota}} organizaciones gratis. Si necesitas más, puedes agregarlas con el complemento de organización a una tarifa fija de ${{price, number}} por mes, independientemente del número de organizaciones o su nivel de actividad.',
  },
  mfa: {
    title: 'MFA',
    tooltip:
      'Función adicional con una tarifa fija de ${{price, number}} por mes. El precio no se ve afectado por el número de factores de autenticación utilizados.',
    tooltip_for_enterprise:
      'La inclusión depende de tu plan. Si la función MFA no está en tu contrato inicial, se añadirá a tu factura cuando la actives. El complemento cuesta ${{price, number}}/mes, independientemente del número de factores de autenticación utilizados.',
  },
  enterprise_sso: {
    title: 'SSO empresarial',
    tooltip: 'Función adicional con un precio de ${{price, number}} por conexión SSO por mes.',
    tooltip_for_enterprise:
      'Función adicional con un precio de ${{price, number}} por conexión SSO por mes. Las primeras {{basicQuota}} SSO están incluidas y son gratuitas en tu plan basado en contrato.',
  },
  api_resources: {
    title: 'Recursos API',
    tooltip:
      'Función adicional con un precio de ${{price, number}} por recurso por mes. Los primeros 3 recursos API son gratis.',
    tooltip_for_enterprise:
      'Los primeros {{basicQuota}} recursos API están incluidos y son gratuitos en tu plan basado en contrato. Si necesitas más, ${{price, number}} por recurso API por mes.',
  },
  machine_to_machine: {
    title: 'Máquina a máquina',
    tooltip:
      'Función adicional con un precio de ${{price, number}} por aplicación por mes. La primera aplicación de máquina a máquina es gratis.',
    tooltip_for_enterprise:
      'La primera {{basicQuota}} aplicación de máquina a máquina es gratuita en tu plan basado en contrato. Si necesitas más, ${{price, number}} por aplicación por mes.',
  },
  tenant_members: {
    title: 'Miembros del inquilino',
    tooltip:
      'Función adicional con un precio de ${{price, number}} por miembro por mes. Los primeros {{count}} miembros del inquilino son gratis.',
    tooltip_one:
      'Función adicional con un precio de ${{price, number}} por miembro por mes. El primer {{count}} miembro del inquilino es gratis.',
    tooltip_other:
      'Función adicional con un precio de ${{price, number}} por miembro por mes. Los primeros {{count}} miembros del inquilino son gratis.',
    tooltip_for_enterprise:
      'Los primeros {{basicQuota}} miembros del inquilino están incluidos y son gratuitos en tu plan basado en contrato. Si necesitas más, ${{price, number}} por miembro del inquilino por mes.',
  },
  tokens: {
    title: 'Tokens',
    tooltip:
      'Función adicional con un precio de ${{price, number}} por {{tokenLimit}} de tokens. El primer {{basicQuota}} de tokens está incluido.',
    tooltip_for_enterprise:
      'El primer {{basicQuota}} de tokens está incluido y es gratuito en tu plan basado en contrato. Si necesitas más, ${{price, number}} por {{tokenLimit}} tokens por mes.',
  },
  hooks: {
    title: 'Ganchos',
    tooltip:
      'Función adicional con un precio de ${{price, number}} por gancho. Los primeros 10 ganchos están incluidos.',
    tooltip_for_enterprise:
      'Los primeros {{basicQuota}} ganchos están incluidos y son gratuitos en tu plan basado en contrato. Si necesitas más, ${{price, number}} por gancho por mes.',
  },
  security_features: {
    title: 'Seguridad avanzada',
    tooltip:
      'Función adicional con un precio de ${{price, number}}/mes por el paquete completo de seguridad avanzada, que incluye CAPTCHA, bloqueo de identificador, lista bloqueada de correos electrónicos, y más.',
  },
  saml_applications: {
    title: 'Aplicación SAML',
    tooltip: 'Función adicional con un precio de ${{price, number}} por aplicación SAML por mes.',
  },
  third_party_applications: {
    title: 'Aplicación de terceros',
    tooltip: 'Función adicional con un precio de ${{price, number}} por aplicación por mes.',
  },
  rbacEnabled: {
    title: 'Roles',
    tooltip:
      'Función adicional con una tarifa fija de ${{price, number}} por mes. El precio no se ve afectado por el número de roles globales.',
  },
  pricing: {
    add_on_changes_in_current_cycle_notice:
      'Si realizas algún cambio durante el ciclo de facturación actual, tu próximo recibo puede ser ligeramente más alto durante el primer mes después del cambio. Será ${{price, number}} como precio base más los costos adicionales por el uso no facturado del ciclo actual y el cargo completo para el próximo ciclo. <a>Más información</a>',
  },
};

export default Object.freeze(usage);
