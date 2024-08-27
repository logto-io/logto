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
    reset_password: 'Restablecer contraseña',
    title: '¿Está seguro de que desea restablecer la contraseña?',
    content:
      'Esta acción no se puede deshacer. Esto restablecerá la información de inicio de sesión del usuario.',
    congratulations: 'Se ha restablecido la información de inicio de sesión del usuario',
    new_password: 'Nueva contraseña:',
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
  field_name: 'Nombre',
  field_avatar: 'URL de imagen de avatar',
  field_avatar_placeholder: 'https://tu.dominio.cdn/avatar.png',
  field_custom_data: 'Datos personalizados',
  field_custom_data_tip:
    'Información adicional del usuario no incluida en las propiedades de usuario predefinidas, como el color y el idioma preferidos del usuario.',
  field_profile: 'Perfil',
  field_profile_tip:
    "Additional OpenID Connect standard claims that are not included in user's properties. Note that all unknown properties will be stripped. Please refer to <a>profile property reference</a> for more information.",
  field_connectors: 'Conexiones sociales',
  field_sso_connectors: 'Conexiones empresariales',
  custom_data_invalid: 'Los datos personalizados deben ser un objeto JSON válido',
  profile_invalid: 'Profile must be a valid JSON object',
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
    role_assigned: 'Rol(es) asignado(s) con éxito',
    search: 'Buscar por nombre de rol, descripción o ID',
    empty: 'No hay roles disponibles',
  },
  warning_no_sign_in_identifier:
    'El usuario necesita tener al menos uno de los identificadores de inicio de sesión (nombre de usuario, correo electrónico, número de teléfono o red social) para iniciar sesión. ¿Estás seguro/a de que quieres continuar?',
};

export default Object.freeze(user_details);
