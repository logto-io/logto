const role_details = {
  back_to_roles: 'Volver a roles',
  identifier: 'Identificador',
  delete_description:
    'Al hacerlo, se eliminarán los permisos asociados con este rol de los usuarios afectados y se eliminará la asignación entre roles, usuarios y permisos.',
  role_deleted: '{{name}} fue eliminado correctamente.',
  general_tab: 'General',
  users_tab: 'Usuarios',
  m2m_apps_tab: 'Aplicaciones de máquina a máquina',
  permissions_tab: 'Permisos',
  settings: 'Configuración',
  settings_description:
    'Los roles son un agrupamiento de permisos que se pueden asignar a los usuarios. También proporcionan una manera de agregar permisos definidos para diferentes APIs, lo que hace más eficiente agregar, eliminar o ajustar permisos en comparación con asignarlos individualmente a los usuarios.',
  field_name: 'Nombre',
  field_description: 'Descripción',
  field_is_default: 'Rol por defecto',
  field_is_default_description:
    'Establecer este rol como un rol por defecto para los nuevos usuarios. Se pueden establecer varios roles por defecto. Esto también afectará a los roles por defecto para los usuarios creados a través de la API de gestión.',
  type_m2m_role_tag: 'Rol de máquina a máquina',
  type_user_role_tag: 'Rol de usuario',
  m2m_role_notification:
    'Asigne este rol de máquina a máquina a una aplicación de máquina a máquina para otorgar acceso a los recursos de API relativos. <a>Cree primero una aplicación de máquina a máquina</a> si aún no lo ha hecho.',
  permission: {
    assign_button: 'Asignar permisos',
    assign_title: 'Asignar permisos',
    assign_subtitle:
      'Asigne permisos a este rol. El rol adquirirá los permisos agregados y los usuarios con este rol heredarán estos permisos.',
    assign_form_field: 'Asignar permisos',
    added_text: '{{count, number}} permiso agregado',
    added_text_other: '{{count, number}} permisos agregados',
    api_permission_count: '{{count, number}} permiso',
    api_permission_count_other: '{{count, number}} permisos',
    confirm_assign: 'Asignar permisos',
    permission_assigned: 'Los permisos seleccionados se asignaron correctamente a este rol',
    deletion_description:
      'Si se elimina este permiso, el usuario afectado con este rol perderá el acceso otorgado por este permiso.',
    permission_deleted: 'El permiso "{{name}}" fue eliminado correctamente de este rol',
    empty: 'No hay permisos disponibles',
  },
  users: {
    assign_button: 'Asignar usuarios',
    name_column: 'Usuario',
    app_column: 'Aplicación',
    latest_sign_in_column: 'Último inicio de sesión',
    delete_description:
      'Permanecerá en su conjunto de usuarios, pero perderá la autorización para este rol.',
    deleted: '{{name}} fue eliminado correctamente de este rol',
    assign_title: 'Asignar usuarios a {{name}}',
    assign_subtitle:
      'Encuentra usuarios apropiados buscando por nombre, correo electrónico, teléfono o ID de usuario.',
    assign_field: 'Asignar usuarios',
    confirm_assign: 'Asignar usuarios',
    assigned_toast_text: 'Los usuarios seleccionados se asignaron correctamente a este rol',
    empty: 'No hay usuarios disponibles',
  },
  applications: {
    assign_button: 'Asignar aplicaciones de máquina a máquina',
    name_column: 'Aplicación',
    app_column: 'Aplicación de máquina a máquina',
    description_column: 'Descripción',
    delete_description:
      'Permanecerá en su conjunto de aplicaciones, pero perderá la autorización para este rol.',
    deleted: '{{name}} se eliminó correctamente de este rol',
    assign_title: 'Asignar aplicaciones de máquina a máquina a {{name}}',
    assign_subtitle:
      'Encuentra aplicaciones de máquina a máquina apropiadas buscando por nombre, descripción o ID de aplicación.',
    assign_field: 'Asignar aplicaciones de máquina a máquina',
    confirm_assign: 'Asignar aplicaciones de máquina a máquina',
    assigned_toast_text: 'Las aplicaciones seleccionadas se asignaron correctamente a este rol',
    empty: 'No hay aplicaciones disponibles',
  },
};

export default Object.freeze(role_details);
