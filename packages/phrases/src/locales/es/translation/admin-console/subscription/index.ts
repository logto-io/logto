import quota_item from './quota-item.js';
import quota_table from './quota-table.js';

const subscription = {
  free_plan: 'Plan Gratuito',
  free_plan_description:
    'Para proyectos secundarios y pruebas iniciales de Logto. No se requiere tarjeta de crédito.',
  pro_plan: 'Plan Pro',
  pro_plan_description: 'Benefíciese sin preocupaciones con Logto para empresas.',
  enterprise: 'Empresa',
  /** UNTRANSLATED */
  enterprise_description:
    'For large-scale organizations requiring advanced features, full customization, and dedicated support to power mission-critical applications. Tailored to your needs for ultimate security, compliance, and performance.',
  /** UNTRANSLATED */
  admin_plan: 'Admin plan',
  /** UNTRANSLATED */
  dev_plan: 'Development plan',
  current_plan: 'Plan Actual',
  current_plan_description:
    'Aquí está tu plan actual. Puedes ver fácilmente el uso de tu plan, revisar tu próxima factura y hacer cambios en tu plan según sea necesario.',
  plan_usage: 'Uso del plan',
  plan_cycle: 'Ciclo del plan: {{period}}. La renovación del uso se realiza en {{renewDate}}.',
  /** UNTRANSLATED */
  next_bill: 'Your upcoming bill',
  next_bill_hint: 'Para obtener más información sobre el cálculo, consulte este <a>artículo</a>.',
  /** UNTRANSLATED */
  next_bill_tip:
    'The prices displayed here are tax-exclusive and may be subject to a slight delay in updates. The tax amount will be calculated based on the information you provide and your local regulatory requirements, and will be shown in your invoices.',
  manage_payment: 'Gestionar el pago',
  overfill_quota_warning:
    'Ha alcanzado el límite de su cuota. Para evitar problemas, actualice el plan.',
  upgrade_pro: 'Actualizar a Pro',
  update_payment: 'Actualizar pago',
  payment_error:
    'Se ha detectado un problema de pago. No se puede procesar ${ {price, number}} para el ciclo anterior. Actualice el pago para evitar la suspensión del servicio Logto.',
  downgrade: 'Degradar',
  current: 'Actual',
  upgrade: 'Actualizar',
  quota_table,
  billing_history: {
    invoice_column: 'factura',
    status_column: 'estado',
    amount_column: 'monto',
    invoice_created_date_column: 'Fecha de creación de la factura',
    invoice_status: {
      void: 'Cancelada',
      paid: 'Pagada',
      open: 'Abierta',
      uncollectible: 'Vencida',
    },
  },
  quota_item,
  downgrade_modal: {
    title: '¿Está seguro de que desea degradar?',
    description:
      'Si elige cambiar a <targetName/>, tenga en cuenta que ya no tendrá acceso a la cuota y las funciones que tenía anteriormente en <currentName/>.',
    before: 'Antes: <name/>',
    after: 'Después: <name/>',
    downgrade: 'Degradar',
  },
  not_eligible_modal: {
    downgrade_title: 'No es posible el cambio a un plan inferior',
    downgrade_description:
      'Asegúrese de cumplir con los siguientes criterios antes de cambiar al plan <name/>.',
    downgrade_help_tip: '¿Necesitas ayuda para cambiar de plan? <a>Contáctenos</a>.',
    upgrade_title: 'Recordatorio amistoso para nuestros apreciados early adopters',
    upgrade_description:
      'Actualmente estás usando más de lo permitido por <name />. Logto es ahora oficial e incluye características adaptadas a cada plan. Antes de considerar la actualización al <name />, asegúrate de cumplir con los siguientes criterios antes de hacer el upgrade.',
    upgrade_pro_tip: ' O considera actualizar al Plan Pro.',
    upgrade_help_tip: '¿Necesitas ayuda para cambiar de plan? <a>Contáctenos</a>.',
    a_maximum_of: 'Un máximo de <item/>',
  },
  upgrade_success: 'Actualizado con éxito a <name/>',
  downgrade_success: 'Degradado con éxito a <name/>',
  subscription_check_timeout:
    'La comprobación de suscripción expiró. Por favor, actualiza más tarde.',
  no_subscription: 'Sin suscripción',
};

export default Object.freeze(subscription);
