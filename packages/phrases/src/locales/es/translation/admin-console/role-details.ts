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
  type_m2m_role_tag: 'Rol de aplicación de máquina a máquina',
  type_user_role_tag: 'Rol de usuario',
  permission: {
    assign_button: 'Asignar permisos',
    assign_title: 'Asignar permisos',
    assign_subtitle:
      'Asigne permisos a este rol. El rol adquirirá los permisos agregados y los usuarios con este rol heredarán estos permisos.',
    assign_form_field: 'Asignar permisos',
    added_text_one: '{{count, number}} permiso agregado',
    added_text_other: '{{count, number}} permisos agregados',
    api_permission_count_one: '{{count, number}} permiso',
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
    assign_title: 'Asignar usuarios',
    assign_subtitle:
      'Asignar usuarios a este rol. Encuentre usuarios apropiados buscando nombre, correo electrónico, teléfono o ID de usuario.',
    assign_field: 'Asignar usuarios',
    confirm_assign: 'Asignar usuarios',
    assigned_toast_text: 'Los usuarios seleccionados se asignaron correctamente a este rol',
    empty: 'No hay usuarios disponibles',
  },
  applications: {
    assign_button: 'Asignar aplicaciones',
    name_column: 'Aplicación',
    app_column: 'Aplicaciones',
    description_column: 'Descripción',
    delete_description:
      'Permanecerá en su conjunto de aplicaciones, pero perderá la autorización para este rol.',
    deleted: '{{name}} se eliminó correctamente de este rol',
    assign_title: 'Asignar aplicaciones',
    assign_subtitle:
      'Asignar aplicaciones a este rol. Encuentre las aplicaciones adecuadas buscando el nombre, la descripción o el ID de la aplicación.',
    assign_field: 'Asignar aplicaciones',
    confirm_assign: 'Asignar aplicaciones',
    assigned_toast_text: 'Las aplicaciones seleccionadas se asignaron correctamente a este rol',
    empty: 'No hay aplicaciones disponibles',
  },
};

export default Object.freeze(role_details);
