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
      'Establezca el nombre del inquilino y vea su región de alojamiento y etiqueta de entorno.',
    tenant_id: 'ID del inquilino',
    tenant_name: 'Nombre del inquilino',
    tenant_region: 'Región de alojamiento de datos',
    tenant_region_tip:
      'Sus recursos de inquilino se alojan en {{region}}. <a>Obtener más información</a>',
    environment_tag: 'Etiqueta del entorno',
    environment_tag_description:
      'Las etiquetas no alteran el servicio. Simplemente te guían para diferenciar diversos entornos.',
    environment_tag_development: 'Desarrollo',
    environment_tag_staging: 'Pruebas',
    environment_tag_production: 'Producción',
    development_description:
      'El entorno de desarrollo se utiliza principalmente para pruebas e incluye todas las funciones profesionales, pero tiene marcas de agua en la experiencia de inicio de sesión. <a>Obtén más información</a>',
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
    subtitle_deprecated: 'Cree un nuevo inquilino para separar recursos y usuarios.',
    subtitle:
      'Cree un nuevo inquilino que tenga recursos y usuarios aislados. La región de datos alojados y los tipos de inquilinos no se pueden modificar después de la creación.',
    tenant_usage_purpose: '¿Para qué desea usar este inquilino?',
    development_description:
      'El entorno de desarrollo se utiliza principalmente para pruebas y no debe utilizarse en el entorno de producción.',
    development_hint:
      'El entorno de desarrollo se utiliza principalmente para pruebas y no debe utilizarse en el entorno de producción.',
    production_description:
      'Producción es donde se utiliza software en vivo por los usuarios finales y puede requerir una suscripción de pago.',
    available_plan: 'Plan disponible:',
    create_button: 'Crear inquilino',
    tenant_name_placeholder: 'Mi inquilino',
  },
  notification: {
    allow_pro_features_title:
      '¡Ahora puedes acceder a <span>todas las funciones de Logto Pro</span> en tu inquilino de desarrollo!',
    allow_pro_features_description:
      '¡Es completamente gratis, sin período de prueba, para siempre!',
    explore_all_features: 'Explorar todas las funciones',
    impact_title: '¿Esto tiene algún impacto en mí?',
    staging_env_hint:
      'La etiqueta de su inquilino se ha actualizado de "<strong>Pruebas</strong>" a "<strong>Producción</strong>", pero este cambio no afectará su configuración actual.',
    paid_tenant_hint_1:
      'Al suscribirse al plan Logto Hobby, su etiqueta de inquilino anterior "<strong>Desarrollo</strong>" se cambiará a "<strong>Producción</strong>", y esto no afectará su configuración existente.',
    paid_tenant_hint_2:
      'Si todavía está en la etapa de desarrollo, puede crear un nuevo inquilino de desarrollo para acceder a más funciones profesionales.',
    paid_tenant_hint_3:
      'Si está en la etapa de producción o en un entorno de producción, aún necesita suscribirse a un plan específico, por lo que no hay nada que deba hacer en este momento.',
    paid_tenant_hint_4: '¡No dudes en contactarnos si necesitas ayuda! ¡Gracias por elegir Logto!',
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
    title: 'Todavía no has creado un tenant',
    description:
      'Para empezar a configurar tu proyecto con Logto, por favor crea un nuevo tenant. Si necesitas cerrar la sesión o eliminar tu cuenta, simplemente haz clic en el botón de avatar en la esquina superior derecha.',
    create_tenant_button: 'Crear tenant',
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
