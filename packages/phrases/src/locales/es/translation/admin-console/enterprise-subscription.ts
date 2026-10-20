const enterprise_subscription = {
  page_title: 'Suscripción',
  title: 'Gestiona tu suscripción',
  subtitle: 'Esto es para gestionar tu suscripción multiinquilino e historial de facturación',
  tab: {
    subscription: 'Suscripción',
    billing_history: 'Historial de facturación',
  },
  subscription: {
    title: 'Suscripción',
    description:
      'Rastrea fácilmente tu uso, consulta tu próxima factura y revisa tu contrato original.',
    enterprise_plan_title: 'Plan Empresarial',
    enterprise_plan_description:
      'Esta es tu suscripción al plan Empresarial y esta cuota se comparte entre inquilinos. El uso puede estar sujeto a un leve retraso en las actualizaciones.',
    add_on_title: 'Complementos de pago por uso',
    add_on_description:
      'Estos son complementos adicionales de pago por uso basados en su contrato o en las tarifas estándar de pago por uso de Logto. Se le cobrará según su uso real.',
    included: 'Incluido',
    over_quota: 'Supera la cuota',
    basic_plan_column_title: {
      product: 'Producto',
      usage: 'Uso',
      quota: 'Cuota',
    },
    add_on_column_title: {
      product: 'Producto',
      unit_price: 'Precio Unitario',
      quantity: 'Cantidad',
      total_price: 'Total',
    },
    add_on_sku_price: '${{price}}/mes',
    private_region_title: 'Instancia de nube privada ({{regionName}})',
    shared_cross_tenants: 'Entre inquilinos',
  },
  user_subscriptions: {
    description:
      'Consulta tus suscripciones personales y la cobertura Enterprise contratada, independientemente del tenant seleccionado.',
    personal_title: 'Suscripciones personales',
    personal_description: 'Suscripciones facturadas a tu cuenta, incluidas las anteriores.',
    enterprise_description:
      'El cupo de Console SSO se define en tu contrato y se comparte entre los administradores autorizados. Las suscripciones personales se facturan por separado.',
    allowance: 'Cupo contratado',
    quantity_price: 'Cantidad × precio unitario',
    billing_period: 'Periodo de facturación',
    connectors: 'Conectores de Console SSO',
    no_connectors: 'Sin conectores',
    list_price_note:
      'Los precios unitarios de lista excluyen impuestos, descuentos y ajustes prorrateados. No representan una próxima factura ni un importe adeudado.',
    proration_note:
      'Las altas y bajas de Console SSO se prorratean en la factura habitual. Eliminar el último conector de pago cancela y liquida la suscripción.',
    overdue_note:
      'Tras tres periodos de facturación consecutivos sin pagar y agotar los reintentos, se pausa el cobro y se eliminan los conectores de Console SSO de pago. Actualizar el pago no restaura su configuración. Contáctanos si necesitas ayuda.',
    cancel_on: 'Cancelación prevista para {{date}}',
    other_product: 'Otra suscripción',
    status: {
      active: 'Activa',
      trialing: 'En prueba',
      past_due: 'Vencida',
      unpaid: 'Sin pagar',
      canceled: 'Cancelada',
      incomplete: 'Incompleta',
      incomplete_expired: 'Expirada',
      paused: 'En pausa',
    },
  },
};

export default Object.freeze(enterprise_subscription);
