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
};

export default Object.freeze(enterprise_subscription);
