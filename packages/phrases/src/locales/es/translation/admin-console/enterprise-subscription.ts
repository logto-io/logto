const enterprise_subscription = {
  page_title: 'Suscripción',
  title: 'Gestiona tu suscripción',
  subtitle:
    'Consulta y gestiona los detalles de tu suscripción multiinquilino y la información de facturación.',
  tab: {
    subscription: 'Suscripción',
    billing_history: 'Historial de facturación',
  },
  subscription: {
    title: 'Suscripción',
    description:
      'Revisa los detalles de uso de tu actual plan de suscripción e información de facturación.',
    enterprise_plan_title: 'Plan Empresarial',
    enterprise_plan_description:
      'Esta es su suscripción al plan empresarial y esta cuota se comparte entre todos los inquilinos bajo su suscripción empresarial.',
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
};

export default Object.freeze(enterprise_subscription);
