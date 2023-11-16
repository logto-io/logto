const organizations = {
  page_title: 'Organizaciones',
  title: 'Organizaciones',
  subtitle:
    'Representan los equipos, clientes comerciales y empresas asociadas que acceden a tus aplicaciones como organizaciones.',
  organization_id: 'ID de la organización',
  members: 'Miembros',
  create_organization: 'Crear organización',
  setup_organization: 'Configurar su organización',
  organization_list_placeholder_title: 'Organización',
  organization_list_placeholder_text:
    'La organización se utiliza generalmente en aplicaciones multiinquilino de SaaS o similares al SaaS. La función de Organizaciones permite a sus clientes B2B gestionar mejor a sus socios y clientes, y personalizar las formas en que los usuarios finales acceden a sus aplicaciones.',
  organization_name_placeholder: 'Mi organización',
  organization_description_placeholder: 'Una breve descripción de la organización',
  organization_permission: 'Permiso de la organización',
  organization_permission_other: 'Permisos de la organización',
  organization_permission_description:
    'El permiso de la organización se refiere a la autorización para acceder a un recurso en el contexto de la organización. Un permiso de organización debe representarse como una cadena significativa, que también sirve como el nombre y el identificador único.',
  organization_permission_delete_confirm:
    'Si se elimina este permiso, todos los roles de la organización, incluido este permiso, perderán este permiso, y los usuarios que tenían este permiso perderán el acceso otorgado por él.',
  create_permission_placeholder: 'Leer historial de citas',
  permission: 'Permiso',
  permission_other: 'Permisos',
  organization_role: 'Rol de la organización',
  organization_role_other: 'Roles de la organización',
  organization_role_description:
    'El rol de la organización es un agrupamiento de permisos que se pueden asignar a los usuarios. Los permisos deben provenir de los permisos de organización predefinidos.',
  organization_role_delete_confirm:
    'Hacer esto eliminará los permisos asociados con este rol de los usuarios afectados y eliminará las relaciones entre roles de organización, miembros de la organización y permisos de organización.',
  role: 'Rol',
  create_role_placeholder: 'Usuarios con permisos de solo lectura',
  search_placeholder: 'Buscar por nombre de organización o ID',
  search_permission_placeholder: 'Escribe para buscar y seleccionar permisos',
  search_role_placeholder: 'Escribe para buscar y seleccionar roles',
  empty_placeholder: '🤔 No has configurado ningún {{entity}} todavía.',
  guide: {
    title: 'Comience con guías',
    subtitle: 'Inicie su proceso de desarrollo de aplicaciones con nuestras guías',
    introduction: {
      section_1: {
        title: 'Primero, entienda cómo funcionan las organizaciones en Logto',
        description:
          'En aplicaciones SaaS multiinquilino, a menudo creamos varias organizaciones con el mismo conjunto de permisos y roles, pero dentro del contexto de una organización, puede desempeñar un papel importante en el control de diferentes niveles de acceso. Piense en cada inquilino como una organización de Logto, y naturalmente comparten la misma "plantilla" de control de acceso. Llamamos a esto la "plantilla de la organización".',
      },
      section_2: {
        title: 'La plantilla de la organización consta de dos partes',
        organization_permission_description:
          'El permiso de la organización se refiere a la autorización para acceder a un recurso en el contexto de la organización. Un permiso de organización debe representarse como una cadena significativa, que también sirve como el nombre y el identificador único.',
        organization_role_description:
          'El rol de la organización es un agrupamiento de permisos que se pueden asignar a los usuarios. Los permisos deben provenir de los permisos de organización predefinidos.',
      },
      section_3: {
        title: 'Interactúa con la ilustración para ver cómo se conecta todo',
        description:
          'Tomemos un ejemplo. John, Sarah y Tony están en diferentes organizaciones con diferentes roles en el contexto de diferentes organizaciones. Pase el cursor sobre los diferentes módulos y vea qué sucede.',
      },
    },
    step_1: 'Paso 1: Definir permisos de organización',
    step_2: 'Paso 2: Definir roles de organización',
    step_2_description:
      '"Roles de organización" representan un conjunto de roles dados a cada organización al principio. Estos roles están determinados por los permisos globales que ha establecido en la pantalla anterior. Similar al permiso de organización, una vez que termine esta configuración por primera vez, no necesitará hacer esto cada vez que cree una nueva organización.',
    step_3: 'Paso 3: Cree su primera organización',
    step_3_description:
      'Creemos su primera organización. Esta viene con un ID único y sirve como contenedor para manejar diversas identidades más orientadas a los negocios, como socios, clientes y su control de acceso.',
    more_next_steps: 'Más pasos siguientes',
    add_members: 'Agregar miembros a su organización',
    add_members_action: 'Agregar miembros en masa y asignar roles',
    add_enterprise_connector: 'Agregar SSO empresarial',
    add_enterprise_connector_action: 'Configurar SSO empresarial',
    organization_permissions: 'Permisos de la organización',
    permission_name: 'Nombre del permiso',
    permissions: 'Permisos',
    organization_roles: 'Roles de la organización',
    role_name: 'Nombre del rol',
    organization_name: 'Nombre de la organización',
    admin: 'Administrador',
    admin_description:
      'El rol "Admin" comparte la misma plantilla de organización en diferentes organizaciones.',
    member: 'Miembro',
    member_description:
      'El rol "Miembro" comparte la misma plantilla de organización en diferentes organizaciones.',
    guest: 'Invitado',
    guest_description:
      'El rol "Invitado" comparte la misma plantilla de organización en diferentes organizaciones.',
    create_more_roles:
      'Puede crear más roles en la configuración de la plantilla de la organización. Esos roles de organización se aplicarán a diferentes organizaciones.',
    read_resource: 'leer:recurso',
    edit_resource: 'editar:recurso',
    delete_resource: 'eliminar:recurso',
    ellipsis: '……',
    johnny:
      'Johny pertenece a dos organizaciones con el correo electrónico "john@email.com" como único identificador. Es administrador de la organización A y también invitado de la organización B.',
    sarah:
      'Sarah pertenece a una organización con el correo electrónico "sarah@email.com" como único identificador. Es administradora de la organización B.',
    tony: 'Tony pertenece a una organización con el correo electrónico "tony@email.com" como único identificador. Es miembro de la organización C.',
  },
};

export default Object.freeze(organizations);
