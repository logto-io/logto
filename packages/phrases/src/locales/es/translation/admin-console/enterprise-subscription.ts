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
    price: 'Precio',
    billing_period: 'Periodo de facturación',
    list_price_note:
      'Los precios no incluyen impuestos ni descuentos. Los cambios se prorratean en tu próxima factura.',
    overdue_note:
      'El pago está vencido. Si sigue sin pagarse, la suscripción puede pausarse y sus funciones de pago pueden eliminarse.',
    cancel_on: 'Cancelación prevista para {{date}}',
    other_product: 'Otra suscripción',
    enterprise_invoices_description:
      'Facturas de tu contrato Enterprise. Selecciona una factura para verla y descargar la factura o el recibo.',
    personal_invoices_description:
      'Facturas de las suscripciones cobradas a tu cuenta, incluidas las suscripciones anteriores. Selecciona una factura para verla y descargar la factura o el recibo.',
    credit_note:
      'Los créditos por eliminaciones o prorrateos reducen facturas posteriores y no se reembolsan necesariamente de inmediato a tu método de pago.',
    invoice_link_unavailable:
      'La página de esta factura no está disponible. Contáctanos si necesitas una copia.',
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
