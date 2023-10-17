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
    tenant_id: 'ID del inquilino',
    tenant_name: 'Nombre del inquilino',
    environment_tag: 'Etiqueta del entorno',
    environment_tag_description:
      'Las etiquetas no alteran el servicio. Simplemente te guían para diferenciar diversos entornos.',
    environment_tag_development: 'Des',
    environment_tag_staging: 'Pruebas',
    environment_tag_production: 'Prod',
    tenant_info_saved: 'Información del inquilino guardada correctamente.',
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
    subtitle: 'Cree un nuevo inquilino para separar recursos y usuarios.',
    create_button: 'Crear inquilino',
    tenant_name_placeholder: 'Mi inquilino',
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
    /** UNTRANSLATED */
    title: 'SIGNING KEYS',
    /** UNTRANSLATED */
    description: 'Securely manage signing keys in your tenant.',
    type: {
      /** UNTRANSLATED */
      private_key: 'OIDC private keys',
      /** UNTRANSLATED */
      cookie_key: 'OIDC cookie keys',
    },
    /** UNTRANSLATED */
    private_keys_in_use: 'Private keys in use',
    /** UNTRANSLATED */
    cookie_keys_in_use: 'Cookie keys in use',
    /** UNTRANSLATED */
    rotate_private_keys: 'Rotate private keys',
    /** UNTRANSLATED */
    rotate_cookie_keys: 'Rotate cookie keys',
    /** UNTRANSLATED */
    rotate_private_keys_description:
      'This action will create a new private signing key, rotate the current key, and remove your previous key. Your JWT tokens signed with the current key will remain valid until deletion or another round of rotation.',
    /** UNTRANSLATED */
    rotate_cookie_keys_description:
      'This action will create a new cookie key, rotate the current key, and remove your previous key. Your cookies with the current key will remain valid until deletion or another round of rotation.',
    /** UNTRANSLATED */
    select_private_key_algorithm: 'Select signing key algorithm for the new private key',
    /** UNTRANSLATED */
    rotate_button: 'Rotate',
    table_column: {
      /** UNTRANSLATED */
      id: 'ID',
      /** UNTRANSLATED */
      status: 'Status',
      /** UNTRANSLATED */
      algorithm: 'Signing key algorithm',
    },
    status: {
      /** UNTRANSLATED */
      current: 'Current',
      /** UNTRANSLATED */
      previous: 'Previous',
    },
    reminder: {
      /** UNTRANSLATED */
      rotate_private_key:
        'Are you sure you want to rotate the <strong>OIDC private keys</strong>? New issued JWT tokens will be signed by the new key. Existing JWT tokens stay valid until you rotate again.',
      /** UNTRANSLATED */
      rotate_cookie_key:
        'Are you sure you want to rotate the <strong>OIDC cookie keys</strong>? New cookies generated in sign-in sessions will be signed by the new cookie key. Existing cookies stay valid until you rotate again.',
      /** UNTRANSLATED */
      delete_private_key:
        'Are you sure you want to delete the <strong>OIDC private key</strong>? Existing JWT tokens signed with this private signing key will no longer be valid.',
      /** UNTRANSLATED */
      delete_cookie_key:
        'Are you sure you want to delete the <strong>OIDC cookie key</strong>? Older sign-in sessions with cookies signed with this cookie key will no longer be valid. A re-authentication is required for these users.',
    },
    messages: {
      /** UNTRANSLATED */
      rotate_key_success: 'Signing keys rotated successfully.',
      /** UNTRANSLATED */
      delete_key_success: 'Key deleted successfully.',
    },
  },
};

export default Object.freeze(tenants);
