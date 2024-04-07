const organization_role_details = {
  page_title: 'Detalles del rol de la organización',
  back_to_org_roles: 'Volver a roles de la organización',
  org_role: 'Rol de la organización',
  delete_confirm:
    'Al hacerlo, se eliminarán los permisos asociados con este rol de los usuarios afectados y se borrarán las relaciones entre roles de organización, miembros en la organización y permisos de organización.',
  deleted: 'El rol de la organización {{name}} se eliminó correctamente.',
  permissions: {
    tab: 'Permisos',
    name_column: 'Permiso',
    description_column: 'Descripción',
    type_column: 'Tipo de permiso',
    type: {
      api: 'Permiso de API',
      org: 'Permiso de organización',
    },
    assign_permissions: 'Asignar permisos',
    remove_permission: 'Eliminar permiso',
    remove_confirmation:
      'Si este permiso se elimina, el usuario con este rol de organización perderá el acceso otorgado por este permiso.',
    removed: 'El permiso {{name}} se eliminó correctamente de este rol de organización',
  },
  general: {
    tab: 'General',
    settings: 'Configuración',
    description:
      'El rol de la organización es un grupo de permisos que se pueden asignar a los usuarios. Los permisos deben provenir de los permisos de organización predefinidos.',
    name_field: 'Nombre',
    description_field: 'Descripción',
    description_field_placeholder: 'Usuarios con permisos de solo lectura',
  },
};

export default Object.freeze(organization_role_details);
