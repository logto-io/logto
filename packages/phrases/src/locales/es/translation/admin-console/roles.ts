const roles = {
  page_title: 'Roles',
  title: 'Roles',
  subtitle:
    'Los roles incluyen permisos que determinan lo que un usuario puede hacer. RBAC utiliza roles para dar acceso a recursos a los usuarios para acciones específicas.',
  create: 'Crear Rol',
  role_name: 'Nombre de rol',
  role_type: 'Tipo de rol',
  show_role_type_button_text: 'Mostrar más opciones',
  hide_role_type_button_text: 'Ocultar más opciones',
  type_user: 'Rol de usuario',
  type_machine_to_machine: 'Rol de aplicación de máquina a máquina',
  role_description: 'Descripción',
  role_name_placeholder: 'Ingrese el nombre de su rol',
  role_description_placeholder: 'Ingrese la descripción de su rol',
  col_roles: 'Roles',
  col_type: 'Tipo',
  col_description: 'Descripción',
  col_assigned_entities: 'Asignados',
  user_counts: '{{count}} usuarios',
  application_counts: '{{count}} aplicaciones',
  user_count: '{{count}} usuario',
  application_count: '{{count}} aplicación',
  assign_permissions: 'Asignar permisos',
  create_role_title: 'Crear Rol',
  create_role_description:
    'Cree y administre roles para sus aplicaciones. Los roles contienen colecciones de permisos y pueden asignarse a los usuarios.',
  create_role_button: 'Crear Rol',
  role_created: 'El rol {{name}} se ha creado satisfactoriamente.',
  search: 'Buscar por nombre de rol, descripción o ID',
  placeholder_title: 'Roles',
  placeholder_description:
    'Los roles son un grupo de permisos que se pueden asignar a los usuarios. Asegúrese de agregar permisos antes de crear roles.',
  assign_user_roles: 'Asignar roles de usuario',
  assign_m2m_roles: 'Asignar roles de máquina a máquina',
  management_api_access_notification:
    'Para acceder a la API de gestión de Logto, seleccione roles con permisos de API de gestión <flag/>.',
  with_management_api_access_tip:
    'Este rol de máquina a máquina incluye permisos para la API de gestión de Logto',
};

export default Object.freeze(roles);
