const organization_template = {
  title: 'Plantilla de organización',
  subtitle:
    'En aplicaciones SaaS multiinquilino, una plantilla de organización define políticas de control de acceso compartido (permisos y roles) para múltiples organizaciones.',
  roles: {
    tab_name: 'Roles de org',
    search_placeholder: 'Buscar por nombre de rol',
    create_title: 'Crear rol de org',
    role_column: 'Rol de org',
    permissions_column: 'Permisos',
    placeholder_title: 'Rol de organización',
    placeholder_description:
      'El rol de organización es un agrupamiento de permisos que se pueden asignar a los usuarios. Los permisos deben provenir de los permisos de organización predefinidos.',
    create_modal: {
      title: 'Crear rol de organización',
      create: 'Crear rol',
      name_field: 'Nombre del rol',
      description_field: 'Descripción',
      created: 'El rol de organización {{name}} se ha creado correctamente.',
    },
  },
  permissions: {
    tab_name: 'Permisos de org',
    search_placeholder: 'Buscar por nombre de permiso',
    create_org_permission: 'Crear permiso de org',
    permission_column: 'Permiso de organización',
    description_column: 'Descripción',
    placeholder_title: 'Permiso de organización',
    placeholder_description:
      'El permiso de organización se refiere a la autorización para acceder a un recurso en el contexto de la organización.',
    delete_confirm:
      'Si se elimina este permiso, todos los roles de organización que incluyan este permiso perderán dicho permiso, y los usuarios que tenían este permiso perderán el acceso concedido por él.',
    create_title: 'Crear permiso de organización',
    edit_title: 'Editar permiso de organización',
    permission_field_name: 'Nombre del permiso',
    description_field_name: 'Descripción',
    description_field_placeholder: 'Leer historial de citas',
    create_permission: 'Crear permiso',
    created: 'Se ha creado correctamente el permiso de organización {{name}}.',
  },
};

export default Object.freeze(organization_template);
