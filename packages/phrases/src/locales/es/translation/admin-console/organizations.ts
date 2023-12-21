const organizations = {
  organization: 'Organización',
  page_title: 'Organizaciones',
  title: 'Organizaciones',
  subtitle:
    'Una organización es un conjunto de usuarios que incluye equipos, clientes comerciales y empresas asociadas que utilizan sus aplicaciones.',
  organization_template: 'Plantilla de organización',
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
  organization_and_member: 'Organización y miembro',
  organization_and_member_description:
    'La organización es un grupo de usuarios y puede representar a los equipos, clientes comerciales y empresas asociadas, siendo cada usuario un "Miembro". Estos pueden ser entidades fundamentales para manejar sus requisitos multinivel.',
  guide: {
    title: 'Comience con guías',
    subtitle: 'Inicie la configuración de su organización con nuestras guías',
    introduction: {
      title: 'Comprenda cómo funciona la organización en Logto',
      section_1: {
        title: 'Una organización es un grupo de usuarios (identidades)',
      },
      section_2: {
        title:
          'La plantilla de organización está diseñada para el control de acceso de aplicaciones multiinquilino',
        description:
          'En aplicaciones SaaS multiinquilino, varias organizaciones a menudo comparten la misma plantilla de control de acceso, que incluye permisos y roles. En Logto, lo llamamos "plantilla de organización".',
        permission_description:
          'El permiso de la organización se refiere a la autorización para acceder a un recurso en el contexto de la organización.',
        role_description:
          'El rol de la organización es un agrupamiento de permisos de organización que se pueden asignar a los miembros.',
      },
      section_3: {
        title: 'Interactúe con la ilustración para ver cómo se conecta todo',
        description:
          'Tomemos un ejemplo. John y Sarah están en diferentes organizaciones con diferentes roles en el contexto de diferentes organizaciones. Desplácese sobre los diferentes módulos y vea qué sucede.',
      },
    },
    step_1: 'Paso 1: Definir permisos de organización',
    step_2: 'Paso 2: Definir roles de organización',
    step_3: 'Paso 3: Cree su primera organización',
    step_3_description:
      'Creemos su primera organización. Viene con un ID único y sirve como contenedor para manejar varias identidades dirigidas hacia empresas.',
    more_next_steps: 'Más pasos siguientes',
    add_members: 'Agregar miembros a su organización',
    add_members_action: 'Agregar miembros en masa y asignar roles',
    organization_permissions: 'Permisos de la organización',
    permission_name: 'Nombre del permiso',
    permissions: 'Permisos',
    organization_roles: 'Roles de la organización',
    role_name: 'Nombre del rol',
    organization_name: 'Nombre de la organización',
    admin: 'Admin',
    member: 'Miembro',
    guest: 'Invitado',
    role_description:
      'El rol "{{role}}" comparte la misma plantilla de organización en diferentes organizaciones.',
    john: 'John',
    john_tip:
      'John pertenece a dos organizaciones con el correo electrónico "john@email.com" como único identificador. Es el administrador de la organización A y también el invitado de la organización B.',
    sarah: 'Sarah',
    sarah_tip:
      'Sarah pertenece a una organización con el correo electrónico "sarah@email.com" como único identificador. Es la administradora de la organización B.',
  },
};

export default Object.freeze(organizations);
