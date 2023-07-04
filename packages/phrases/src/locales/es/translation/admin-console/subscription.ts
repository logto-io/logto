const subscription = {
  free_plan: 'Plan Gratuito',
  free_plan_description:
    'Para proyectos secundarios y pruebas iniciales de Logto. Sin tarjeta de crédito.',
  hobby_plan: 'Plan de Pasatiempo',
  hobby_plan_description: 'Para desarrolladores individuales o entornos de desarrollo.',
  pro_plan: 'Plan Pro',
  pro_plan_description: 'Para empresas que se benefician sin preocupaciones con Logto.',
  enterprise: 'Empresa',
  current_plan: 'Plan Actual',
  current_plan_description:
    'Este es tu plan actual. Puedes ver el uso del plan, tu próxima factura y actualizar a un plan de nivel superior si lo deseas.',
  plan_usage: 'Uso del plan',
  plan_cycle: 'Ciclo del plan: {{period}}. La utilización se renueva el {{renewDate}}.',
  next_bill: 'Tu próxima factura',
  next_bill_hint: 'Para obtener más información sobre el cálculo, consulta este <a>artículo</a>.',
  next_bill_tip:
    'Tu próxima factura incluye el precio base de tu plan para el próximo mes, así como el costo de tu uso multiplicado por el precio unitario de MAU en diferentes niveles.',
  manage_payment: 'Gestionar el pago',
  overfill_quota_warning:
    'Has alcanzado tu límite de cuota. Para evitar problemas, actualiza el plan.',
  upgrade_pro: 'Actualizar a Pro',
  payment_error:
    // eslint-disable-next-line no-template-curly-in-string
    'Se detectó un problema de pago. No se puede procesar ${{price, number}} para el ciclo anterior. Actualiza el pago para evitar la suspensión del servicio de Logto.',
  downgrade: 'Degradar',
  current: 'Actual',
  buy_now: 'Comprar ahora',
  contact_us: 'Contáctanos',
  quota_table: {
    quota: {
      title: 'Cuota',
      tenant_limit: 'Límite de inquilinos',
      base_price: 'Precio base',
      mau_unit_price: '* Precio unitario de MAU',
      mau_limit: 'Límite de MAU',
    },
    application: {
      title: 'Aplicaciones',
      total: 'Total',
      m2m: 'De máquina a máquina',
    },
    resource: {
      title: 'Recursos de API',
      resource_count: 'Recuento de recursos',
      scopes_per_resource: 'Permiso por recurso',
    },
    branding: {
      title: 'Marca',
      custom_domain: 'Dominio personalizado',
    },
    user_authn: {
      title: 'Autenticación de usuario',
      omni_sign_in: 'Inicio de sesión omnipresente',
      built_in_email_connector: 'Conector de correo electrónico incorporado',
      social_connectors: 'Conectores sociales',
      standard_connectors: 'Conectores estándar',
    },
    roles: {
      title: 'Roles',
      roles: 'Roles',
      scopes_per_role: 'Permiso por rol',
    },
    audit_logs: {
      title: 'Registros de auditoría',
      retention: 'Retención',
    },
    hooks: {
      title: 'Hooks',
      amount: 'Cantidad',
    },
    support: {
      title: 'Soporte',
      community: 'Comunidad',
      customer_ticket: 'Ticket de cliente',
      premium: 'Premium',
    },
    mau_unit_price_footnote:
      '* Nuestros precios unitarios pueden variar según los recursos consumidos, y Logto se reserva el derecho de explicar cualquier cambio en los precios unitarios.',
    unlimited: 'Ilimitado',
    contact: 'Contacto',
    monthly_price: '{{$ {value, number}}/mo',
    mau_price: '{{$ {value, number}}/MAU',
    days_one: '{{count, number}} día',
    days_other: '{{count, number}} días',
    add_on: 'Agregar',
  },
  downgrade_form: {
    allowed_title: '¿Seguro que quieres degradar?',
    allowed_description:
      'Al degradar al {{plan}}, ya no tendrás acceso a los siguientes beneficios.',
    not_allowed_title: 'No eres elegible para degradar',
    not_allowed_description:
      'Asegúrate de cumplir con las siguientes condiciones antes de degradar al {{plan}}. Una vez que hayas reconciliado y cumplido los requisitos, serás elegible para la degradación.',
    confirm_downgrade: 'Degradar de todos modos',
  },
};

export default subscription;
