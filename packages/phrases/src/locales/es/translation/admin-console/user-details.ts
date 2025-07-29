const user_details = {
  page_title: 'Detalles de usuario',
  back_to_users: 'Volver a la gestión de usuarios',
  created_title: 'Usuario creado con éxito',
  created_guide:
    'Aquí está la información para ayudar al usuario con su proceso de inicio de sesión.',
  created_email: 'Dirección de correo electrónico:',
  created_phone: 'Número de teléfono:',
  created_username: 'Nombre de usuario:',
  created_password: 'Contraseña:',
  menu_delete: 'Eliminar',
  delete_description: 'Esta acción no se puede deshacer. Eliminará permanentemente al usuario.',
  deleted: 'Usuario eliminado con éxito',
  reset_password: {
    reset_title: '¿Está seguro de que desea restablecer la contraseña?',
    generate_title: '¿Estás seguro de que deseas generar una contraseña?',
    content:
      'Esta acción no se puede deshacer. Esto restablecerá la información de inicio de sesión del usuario.',
    reset_complete: 'Se ha restablecido la información de inicio de sesión del usuario',
    generate_complete: 'La contraseña ha sido generada',
    new_password: 'Nueva contraseña:',
    password: 'Contraseña:',
  },
  tab_settings: 'Configuración',
  tab_roles: 'Roles de usuario',
  tab_logs: 'Registros de usuario',
  tab_organizations: 'Organizaciones',
  authentication: 'Autenticación',
  authentication_description:
    'Cada usuario tiene un perfil que contiene toda la información del usuario. Consta de datos básicos, identidades sociales y datos personalizados.',
  user_profile: 'Perfil de usuario',
  field_email: 'Dirección de correo electrónico',
  field_phone: 'Número de teléfono',
  field_username: 'Nombre de usuario',
  field_password: 'Contraseña',
  field_name: 'Nombre',
  field_avatar: 'URL de imagen de avatar',
  field_avatar_placeholder: 'https://tu.dominio.cdn/avatar.png',
  field_custom_data: 'Datos personalizados',
  field_custom_data_tip:
    'Información adicional del usuario no incluida en las propiedades de usuario predefinidas, como el color y el idioma preferidos del usuario.',
  field_profile: 'Perfil',
  field_profile_tip:
    'Reclamaciones estándar adicionales de OpenID Connect que no están incluidas en las propiedades del usuario. Tenga en cuenta que todas las propiedades desconocidas serán eliminadas. Consulte la <a>referencia de propiedades del perfil</a> para obtener más información.',
  field_connectors: 'Conexiones sociales',
  field_sso_connectors: 'Conexiones empresariales',
  custom_data_invalid: 'Los datos personalizados deben ser un objeto JSON válido',
  profile_invalid: 'El perfil debe ser un objeto JSON válido',
  password_already_set: 'Contraseña ya configurada',
  no_password_set: 'No se ha configurado la contraseña',
  connectors: {
    connectors: 'Conectores',
    user_id: 'ID de usuario',
    remove: 'Eliminar',
    connected: 'Este usuario está conectado con varios conectores sociales.',
    not_connected: 'El usuario no está conectado a ningún conector social',
    deletion_confirmation:
      'Estás eliminando la identidad existente <name/>. ¿Seguro que quieres continuar?',
  },
  sso_connectors: {
    connectors: 'Conectores',
    enterprise_id: 'ID de empresa',
    connected:
      'Este usuario está conectado a varios proveedores de identidad empresarial para inicio de sesión único.',
    not_connected:
      'El usuario no está conectado a ninguno de los proveedores de identidad empresarial para inicio de sesión único.',
  },
  mfa: {
    field_name: 'Autenticación de dos factores',
    field_description: 'Este usuario ha habilitado factores de autenticación de 2 pasos.',
    name_column: 'Autenticación de dos factores',
    field_description_empty: 'Este usuario no ha habilitado factores de autenticación de 2 pasos.',
    deletion_confirmation:
      'Estás eliminando la existente <name/> para la verificación en dos pasos. ¿Estás seguro/a de que deseas continuar?',
  },
  suspended: 'Suspendido',
  suspend_user: 'Suspender usuario',
  suspend_user_reminder:
    '¿Está seguro de que desea suspender a este usuario? El usuario no podrá iniciar sesión en su aplicación y no podrá obtener un nuevo token de acceso después de que expire el actual. Además, todas las solicitudes de API realizadas por este usuario fallarán.',
  suspend_action: 'Suspender',
  user_suspended: 'El usuario ha sido suspendido.',
  reactivate_user: 'Reactivar usuario',
  reactivate_user_reminder:
    '¿Está seguro de que desea reactivar a este usuario? Al hacerlo, permitirá cualquier intento de inicio de sesión para este usuario.',
  reactivate_action: 'Reactivar',
  user_reactivated: 'El usuario ha sido reactivado.',
  roles: {
    name_column: 'Rol de usuario',
    description_column: 'Descripción',
    assign_button: 'Asignar roles',
    delete_description:
      'Esta acción eliminará este rol de este usuario. El rol en sí seguirá existiendo, pero ya no estará asociado con este usuario.',
    deleted: 'Se eliminó "{{name}}" correctamente de este usuario.',
    assign_title: 'Asignar roles a {{name}}',
    assign_subtitle:
      'Encuentra roles de usuario apropiados buscando por nombre, descripción o ID de rol.',
    assign_role_field: 'Asignar roles',
    role_search_placeholder: 'Buscar por nombre de rol',
    added_text: '{{value, number}} agregados',
    assigned_user_count: '{{value, number}} usuarios',
    confirm_assign: 'Asignar roles',
    role_assigned: 'Rol(es) asignado(s) con éxito',
    search: 'Buscar por nombre de rol, descripción o ID',
    empty: 'No hay roles disponibles',
  },
  warning_no_sign_in_identifier:
    'El usuario necesita tener al menos uno de los identificadores de inicio de sesión (nombre de usuario, correo electrónico, número de teléfono o red social) para iniciar sesión. ¿Estás seguro/a de que quieres continuar?',
  personal_access_tokens: {
    title: 'Token de acceso personal',
    title_other: 'Tokens de acceso personal',
    title_short: 'token',
    empty: 'El usuario no tiene ningún token de acceso personal.',
    create: 'Crear nuevo token',
    tip: 'Los tokens de acceso personal (PATs) proporcionan una forma segura para que los usuarios otorguen tokens de acceso sin usar sus credenciales y el inicio de sesión interactivo. Esto es útil para CI/CD, scripts o aplicaciones que necesitan acceder a recursos de forma programática.',
    value: 'Valor',
    created_at: 'Creado el',
    expires_at: 'Expira el',
    never: 'Nunca',
    create_new_token: 'Crear nuevo token',
    delete_confirmation:
      'Esta acción no se puede deshacer. ¿Está seguro de que desea eliminar este token?',
    expired: 'Expirado',
    expired_tooltip: 'Este token expiró el {{date}}.',
    create_modal: {
      title: 'Crear token de acceso personal',
      expiration: 'Expiración',
      expiration_description: 'El token expirará el {{date}}.',
      expiration_description_never:
        'El token nunca expirará. Recomendamos establecer una fecha de expiración para una mayor seguridad.',
      days: '{{count}} día',
      days_other: '{{count}} días',
      created: 'El token {{name}} ha sido creado con éxito.',
    },
    edit_modal: {
      title: 'Editar token de acceso personal',
      edited: 'El token {{name}} ha sido editado con éxito.',
    },
  },
  connections: {
    title: 'Conexión',
    description:
      'El usuario enlaza cuentas de terceros para inicio de sesión social, SSO empresarial o acceso a recursos.',
    token_status_column: 'Estado del token',
    token_status: {
      active: 'Activo',
      expired: 'Expirado',
      inactive: 'Inactivo',
      not_applicable: 'No aplicable',
      available: 'Disponible',
      not_available: 'No disponible',
    },
  },
};

export default Object.freeze(user_details);
