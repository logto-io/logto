const upsell = {
  pro_tag: 'PRO',
  upgrade_plan: 'Plan de actualización',
  compare_plans: 'Comparar planes',
  contact_us: 'Contáctanos',
  get_started: {
    title: '¡Comienza tu viaje de identidad sin problemas con un <planName/>!',
    description:
      'Con <planName/>, puedes probar Logto en tus proyectos secundarios o pruebas. Para aprovechar al máximo las capacidades de Logto para tu equipo, actualízate para obtener acceso ilimitado a funciones premium: uso ilimitado de MAU, integración de máquina a máquina, gestión de RBAC sin problemas, registros de auditoría a largo plazo y más.',
    view_plans: 'Ver planes',
  },
  create_tenant: {
    title: 'Selecciona tu plan de tenant',
    description:
      'Logto ofrece opciones de planes competitivos con una innovadora y asequible estructura de precios diseñada para empresas en crecimiento. <a>Más información</a>',
    base_price: 'Precio base',
    monthly_price: '{{value, number}}/mes',
    mau_unit_price: 'Precio unitario de MAU',
    view_all_features: 'Ver todas las características',
    select_plan: 'Seleccionar <name/>',
    upgrade_to: 'Actualizar a <name/>',
    free_tenants_limit: 'Hasta {{count, number}} tenant gratuito',
    free_tenants_limit_other: 'Hasta {{count, number}} tenants gratuitos',
    most_popular: 'Más popular',
    upgrade_success: 'Actualización a <name/> realizada con éxito',
  },
  paywall: {
    applications:
      'Se ha alcanzado el límite de {{count, number}} aplicación de <planName/>. Actualiza el plan para satisfacer las necesidades de tu equipo. Para cualquier ayuda, no dudes en <a>contactarnos</a>.',
    applications_other:
      'Se ha alcanzado el límite de {{count, number}} aplicaciones de <planName/>. Actualiza el plan para satisfacer las necesidades de tu equipo. Para cualquier ayuda, no dudes en <a>contactarnos</a>.',
    machine_to_machine_feature:
      'Actualiza a un plan de pago para crear aplicaciones de máquina a máquina, junto con acceso a todas las funciones premium. Para cualquier ayuda, no dudes en <a>contactarnos</a>.',
    machine_to_machine:
      'Se ha alcanzado el límite de {{count, number}} aplicación de máquina a máquina de <planName/>. Actualiza el plan para satisfacer las necesidades de tu equipo. Para cualquier ayuda, no dudes en <a>contactarnos</a>.',
    machine_to_machine_other:
      'Se ha alcanzado el límite de {{count, number}} aplicaciones de máquina a máquina de <planName/>. Actualiza el plan para satisfacer las necesidades de tu equipo. Para cualquier ayuda, no dudes en <a>contactarnos</a>.',
    resources:
      'Has alcanzado el límite de {{count, number}} recursos de API de <planName/>. Actualiza el plan para satisfacer las necesidades de tu equipo. <a>Contáctanos</a> si necesitas asistencia.',
    resources_other:
      'Has alcanzado el límite de {{count, number}} recursos de API de <planName/>. Actualiza el plan para satisfacer las necesidades de tu equipo. <a>Contáctanos</a> si necesitas asistencia.',
    scopes_per_resource:
      'Has alcanzado el límite de {{count, number}} permisos por recurso de API de <planName/>. Actualiza ahora para expandirlo. <a>Contáctanos</a> si necesitas asistencia.',
    scopes_per_resource_other:
      'Has alcanzado el límite de {{count, number}} permisos por recurso de API de <planName/>. Actualiza ahora para expandirlo. <a>Contáctanos</a> si necesitas asistencia.',
    custom_domain:
      'Desbloquea la funcionalidad de dominio personalizado y una variedad de beneficios premium al actualizar a un plan de pago. No dudes en <a>contactarnos</a> si necesitas ayuda.',
    social_connectors:
      'Has alcanzado el límite de {{count, number}} conectores sociales de <planName/>. Actualiza el plan para obtener conectores sociales adicionales y la capacidad de crear tus propios conectores usando los protocolos OIDC, OAuth 2.0 y SAML. Si necesitas ayuda, no dudes en <a>contactarnos</a>.',
    social_connectors_other:
      'Has alcanzado el límite de {{count, number}} conectores sociales de <planName/>. Actualiza el plan para obtener conectores sociales adicionales y la capacidad de crear tus propios conectores usando los protocolos OIDC, OAuth 2.0 y SAML. Si necesitas ayuda, no dudes en <a>contactarnos</a>.',
    standard_connectors_feature:
      'Actualiza a un plan de pago para crear tus propios conectores usando los protocolos OIDC, OAuth 2.0 y SAML, además de obtener conectores sociales ilimitados y todas las funciones premium. Si necesitas ayuda, no dudes en <a>contactarnos</a>.',
    standard_connectors:
      'Has alcanzado el límite de {{count, number}} conectores sociales de <planName/>. Actualiza el plan para obtener conectores sociales adicionales y la capacidad de crear tus propios conectores usando los protocolos OIDC, OAuth 2.0 y SAML. Si necesitas ayuda, no dudes en <a>contactarnos</a>.',
    standard_connectors_other:
      'Has alcanzado el límite de {{count, number}} conectores sociales de <planName/>. Actualiza el plan para obtener conectores sociales adicionales y la capacidad de crear tus propios conectores usando los protocolos OIDC, OAuth 2.0 y SAML. Si necesitas ayuda, no dudes en <a>contactarnos</a>.',
    standard_connectors_pro:
      'Has alcanzado el límite de {{count, number}} conectores estándar de <planName/>. Actualiza al plan Enterprise para obtener conectores sociales adicionales y la capacidad de crear tus propios conectores usando los protocolos OIDC, OAuth 2.0 y SAML. Si necesitas ayuda, no dudes en <a>contactarnos</a>.',
    standard_connectors_pro_other:
      'Has alcanzado el límite de {{count, number}} conectores estándar de <planName/>. Actualiza al plan Enterprise para obtener conectores sociales adicionales y la capacidad de crear tus propios conectores usando los protocolos OIDC, OAuth 2.0 y SAML. Si necesitas ayuda, no dudes en <a>contactarnos</a>.',
    roles:
      'Has alcanzado el límite de {{count, number}} roles de <planName/>. Actualiza el plan para agregar roles y permisos adicionales. Si necesitas ayuda, no dudes en <a>contactarnos</a>.',
    roles_other:
      'Has alcanzado el límite de {{count, number}} roles de <planName/>. Actualiza el plan para agregar roles y permisos adicionales. Si necesitas ayuda, no dudes en <a>contactarnos</a>.',
    scopes_per_role:
      'Has alcanzado el límite de {{count, number}} permisos por rol de <planName/>. Actualiza el plan para agregar roles y permisos adicionales. Si necesitas ayuda, no dudes en <a>contactarnos</a>.',
    scopes_per_role_other:
      'Has alcanzado el límite de {{count, number}} permisos por rol de <planName/>. Actualiza el plan para agregar roles y permisos adicionales. Si necesitas ayuda, no dudes en <a>contactarnos</a>.',
    hooks:
      'Has alcanzado el límite de {{count, number}} webhooks de <planName/>. Actualiza el plan para crear más webhooks. Si necesitas ayuda, no dudes en <a>contactarnos</a>.',
    hooks_other:
      'Has alcanzado el límite de {{count, number}} webhooks de <planName/>. Actualiza el plan para crear más webhooks. Si necesitas ayuda, no dudes en <a>contactarnos</a>.',
  },
  mau_exceeded_modal: {
    title: 'Se ha superado el límite de MAU. Actualiza tu plan.',
    notification:
      'Tu MAU actual ha superado el límite de <planName/>. Por favor, actualiza tu plan a premium a tiempo para evitar la suspensión del servicio de Logto.',
    update_plan: 'Actualizar plan',
  },
  payment_overdue_modal: {
    title: 'Factura con pagos atrasados',
    notification:
      '¡Vaya! El pago de la factura del tenant {{name}} falló en el último ciclo. Por favor, paga la factura a tiempo para evitar la suspensión del servicio de Logto.',
    unpaid_bills_last_cycle: 'Facturas impagadas del último ciclo',
    update_payment: 'Actualizar pago',
  },
};

export default upsell;
