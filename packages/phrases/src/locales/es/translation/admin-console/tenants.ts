const tenants = {
  title: 'Configuraciones',
  description: 'Administre eficientemente la configuración del inquilino y personalice su dominio.',
  tabs: {
    settings: 'Configuraciones',
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
  create_modal: {
    title: 'Crear inquilino',
    subtitle:
      'Cree un nuevo inquilino que tenga recursos y usuarios aislados. La región de datos alojados y los tipos de inquilinos no se pueden modificar después de la creación.',
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
      '¿Está seguro de que desea eliminar su inquilino "<span>{{name}}</span>" con etiqueta de sufijo de entorno"<span>{{tag}}</span>"? Esta acción no se puede deshacer y resultará en la eliminación permanente de todos sus datos e información de cuenta.',
    description_line2:
      'Antes de eliminar la cuenta, quizás podamos ayudarlo. <span><a>Contáctenos por correo electrónico</a></span>',
    description_line3:
      'Si desea continuar, ingrese el nombre del inquilino "<span>{{name}}</span>" para confirmar.',
    delete_button: 'Eliminar permanentemente',
    cannot_delete_title: 'No se puede eliminar este inquilino',
    cannot_delete_description:
      'Lo siento, no puedes eliminar este inquilino en este momento. Asegúrate de estar en el Plan Gratuito y haber pagado todas las facturas pendientes.',
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
  signing_keys: {
    title: 'CLAVES DE FIRMA',
    description: 'Administre de forma segura las claves de firma en su inquilino.',
    type: {
      private_key: 'Claves privadas OIDC',
      cookie_key: 'Claves de cookies OIDC',
    },
    private_keys_in_use: 'Claves privadas en uso',
    cookie_keys_in_use: 'Claves de cookies en uso',
    rotate_private_keys: 'Rotar claves privadas',
    rotate_cookie_keys: 'Rotar claves de cookies',
    rotate_private_keys_description:
      'Esta acción creará una nueva clave de firma privada, rotará la clave actual y eliminará su clave anterior. Sus tokens JWT firmados con la clave actual seguirán siendo válidos hasta su eliminación o otra rotación.',
    rotate_cookie_keys_description:
      'Esta acción creará una nueva clave de cookie, rotará la clave actual y eliminará su clave anterior. Sus cookies con la clave actual seguirán siendo válidos hasta su eliminación o otra rotación.',
    select_private_key_algorithm: 'Seleccione el algoritmo de firma de la nueva clave privada',
    rotate_button: 'Rotar',
    table_column: {
      id: 'ID',
      status: 'Estado',
      algorithm: 'Algoritmo de clave de firma',
    },
    status: {
      current: 'Actual',
      previous: 'Anterior',
    },
    reminder: {
      rotate_private_key:
        '¿Estás seguro de que deseas rotar las <strong>claves privadas OIDC</strong>? Los nuevos tokens JWT emitidos serán firmados por la nueva clave. Los tokens JWT existentes seguirán siendo válidos hasta que los vuelvas a rotar.',
      rotate_cookie_key:
        '¿Estás seguro de que deseas rotar las <strong>claves de cookies OIDC</strong>? Las nuevas cookies generadas en sesiones de inicio de sesión serán firmadas por la nueva clave de cookie. Las cookies existentes seguirán siendo válidas hasta que las vuelvas a rotar.',
      delete_private_key:
        '¿Estás seguro de que deseas eliminar la <strong>clave privada OIDC</strong>? Los tokens JWT existentes firmados con esta clave de firma privada ya no serán válidos.',
      delete_cookie_key:
        '¿Estás seguro de que deseas eliminar la <strong>clave de cookies OIDC</strong>? Las sesiones de inicio de sesión antiguas con cookies firmadas con esta clave de cookie ya no serán válidas. Se requiere una reautenticación para estos usuarios.',
    },
    messages: {
      rotate_key_success: 'Claves de firma rotadas con éxito.',
      delete_key_success: 'Clave eliminada con éxito.',
    },
  },
};

export default Object.freeze(tenants);
