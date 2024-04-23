import featured_plan_content from './featured-plan-content.js';
import paywall from './paywall.js';

const upsell = {
  upgrade_plan: 'Plan de actualización',
  compare_plans: 'Comparar planes',
  view_plans: 'Ver planes',
  create_tenant: {
    title: 'Selecciona tu plan de tenant',
    description:
      'Logto ofrece opciones de planes competitivos con una innovadora y asequible estructura de precios diseñada para empresas en crecimiento. <a>Más información</a>',
    base_price: 'Precio base',
    monthly_price: '{{value, number}}/mes',
    view_all_features: 'Ver todas las características',
    select_plan: 'Seleccionar <name/>',
    free_tenants_limit: 'Hasta {{count, number}} tenant gratuito',
    free_tenants_limit_other: 'Hasta {{count, number}} tenants gratuitos',
    most_popular: 'Más popular',
    upgrade_success: 'Actualización a <name/> realizada con éxito',
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
      '¡Ups! El pago de la factura del inquilino <span>{{name}}</span> ha fallado. Por favor, pague la factura a tiempo para evitar la suspensión del servicio de Logto.',
    unpaid_bills: 'Facturas impagas',
    update_payment: 'Actualizar pago',
  },
  add_on_quota_item: {
    api_resource: 'Recurso de API',
    machine_to_machine: 'aplicación de máquina a máquina',
    tokens: '{{limit}}M tokens',
    tenant_member: 'miembro del tenant',
  },
  charge_notification_for_quota_limit:
    'Has superado tu límite de cuota de {{item}}. Logto agregará cargos por el uso más allá de tu límite de cuota. La facturación comenzará el día en que se lance el nuevo diseño de precios del complemento. <a>Más información</a>',
  paywall,
  featured_plan_content,
};

export default Object.freeze(upsell);
