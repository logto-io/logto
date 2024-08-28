const tenants = {
  title: 'Configuraciones',
  description: 'Administre eficientemente la configuración del inquilino y personalice su dominio.',
  tabs: {
    settings: 'Configuraciones',
    members: 'Miembros',
    domains: 'Dominios',
    subscription: 'Plan y facturación',
    billing_history: 'Historial de facturación',
  },
  settings: {
    title: 'CONFIGURACIONES',
    description:
      'Establezca el nombre del inquilino y vea la región de alojamiento de sus datos y el tipo de inquilino.',
    tenant_id: 'ID del inquilino',
    tenant_name: 'Nombre del inquilino',
    tenant_region: 'Región de alojamiento de datos',
    tenant_region_tip:
      'Sus recursos de inquilino se alojan en {{region}}. <a>Obtener más información</a>',
    environment_tag_development: 'Desarrollo',
    environment_tag_production: 'Producción',
    tenant_type: 'Tipo de inquilino',
    development_description:
      'Solo para pruebas y no debe usarse en producción. No se requiere suscripción. Tiene todas las características profesionales pero tiene limitaciones como un banner de inicio de sesión. <a>Más información</a>',
    production_description:
      'Destinado para aplicaciones que son utilizadas por usuarios finales y pueden requerir una suscripción paga. <a>Más información</a>',
    tenant_info_saved: 'Información del inquilino guardada correctamente.',
  },
  full_env_tag: {
    development: 'Desarrollo',
    production: 'Producción',
  },
  deletion_card: {
    title: 'ELIMINAR',
    tenant_deletion: 'Eliminar inquilino',
    tenant_deletion_description:
      'Eliminar el inquilino resultará en la eliminación permanente de todos los datos de usuario y configuraciones asociadas. Por favor, proceda con precaución.',
    tenant_deletion_button: 'Eliminar inquilino',
  },
  leave_tenant_card: {
    title: 'ABANDONAR',
    leave_tenant: 'Abandonar inquilino',
    leave_tenant_description:
      'Cualquier recurso en el inquilino se mantendrá pero ya no tendrá acceso a este inquilino.',
    last_admin_note:
      'Para abandonar este inquilino, asegúrese de que al menos otro miembro tenga el rol de Administrador.',
  },
  create_modal: {
    title: 'Crear inquilino',
    tenant_usage_purpose: '¿Para qué desea usar este inquilino?',
    development_description:
      'Solo para pruebas y no debe usarse en producción. No se requiere suscripción.',
    development_hint:
      'Tiene todas las características profesionales pero tiene limitaciones como un banner de inicio de sesión.',
    production_description: 'Para uso de usuarios finales y puede requerir una suscripción paga.',
    available_plan: 'Plan disponible:',
    create_button: 'Crear inquilino',
    tenant_name_placeholder: 'Mi inquilino',
  },
  dev_tenant_migration: {
    title:
      '¡Ahora puedes probar nuestras características Pro de forma gratuita creando un nuevo "inquilino de Desarrollo"!',
    affect_title: '¿Cómo te afecta esto?',
    hint_1:
      'Estamos reemplazando las antiguas <strong>etiquetas de entorno</strong> con dos nuevos tipos de inquilinos: <strong>"Desarrollo"</strong> y <strong>"Producción"</strong>.',
    hint_2:
      'Para garantizar una transición sin problemas y funcionalidad ininterrumpida, los inquilinos creados anteriormente se elevarán al tipo de inquilino <strong>Producción</strong> junto con su suscripción anterior.',
    hint_3: 'No te preocupes, todas tus otras configuraciones permanecerán iguales.',
    about_tenant_type: 'Sobre el tipo de inquilino',
  },
  delete_modal: {
    title: 'Eliminar inquilino',
    description_line1:
      '¿Está seguro de que desea eliminar su inquilino "<span>{{name}}</span>" con la etiqueta de sufijo de entorno "<span>{{tag}}</span>"? Esta acción no se puede deshacer y resultará en la eliminación permanente de todos sus datos e información del inquilino.',
    description_line2:
      'Antes de eliminar el inquilino, tal vez podamos ayudarlo. <span><a>Contacte con nosotros por correo electrónico</a></span>',
    description_line3:
      'Si desea continuar, ingrese el nombre del inquilino "<span>{{name}}</span>" para confirmar.',
    delete_button: 'Eliminar permanentemente',
    cannot_delete_title: 'No se puede eliminar este inquilino',
    cannot_delete_description:
      'Lo siento, no puedes eliminar este inquilino en este momento. Asegúrate de estar en el Plan Gratuito y haber pagado todas las facturas pendientes.',
  },
  leave_tenant_modal: {
    description: '¿Está seguro de que desea abandonar este inquilino?',
    leave_button: 'Abandonar',
  },
  tenant_landing_page: {
    title: 'Todavía no has creado un inquilino',
    description:
      'Para empezar a configurar tu proyecto con Logto, por favor crea un nuevo inquilino. Si necesitas cerrar la sesión o eliminar tu cuenta, simplemente haz clic en el botón de avatar en la esquina superior derecha.',
    create_tenant_button: 'Crear inquilino',
  },
  status: {
    mau_exceeded: 'Límite MAU excedido',
    suspended: 'Suspendido',
    overdue: 'Vencido',
  },
  tenant_suspended_page: {
    title: 'Inquilino suspendido. Contáctenos para restaurar el acceso.',
    description_1:
      'Lamentamos informarle que su cuenta de inquilino ha sido suspendida temporalmente debido a un uso indebido, que incluye exceder los límites de MAU, pagos atrasados ​​u otras acciones no autorizadas.',
    description_2:
      'Si necesita aclaraciones adicionales, tiene alguna inquietud o desea restaurar la funcionalidad completa y desbloquear sus inquilinos, no dude en contactarnos de inmediato.',
  },
};

export default Object.freeze(tenants);
