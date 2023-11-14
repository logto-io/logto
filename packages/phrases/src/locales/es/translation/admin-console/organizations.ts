const organizations = {
  /** UNTRANSLATED */
  organization: 'Organization',
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
    'Doing so will remove the permissions associated with this role from the affected users and delete the relations among organization roles, members in the organization, and organization permissions.',
  /** UNTRANSLATED */
  role: 'Role',
  /** UNTRANSLATED */
  create_role_placeholder: 'Users with view-only permissions',
  /** UNTRANSLATED */
  search_placeholder: 'Search by organization name or ID',
  /** UNTRANSLATED */
  search_permission_placeholder: 'Type to search and select permissions',
  /** UNTRANSLATED */
  search_role_placeholder: 'Type to search and select roles',
  /** UNTRANSLATED */
  organization_and_member: 'Organization and member',
  /** UNTRANSLATED */
  organization_and_member_description:
    'Organization is a group of users and can represent the teams, business customers, and partner companies, with each user being a "Member". Those can be fundamental entities to handle your multi-tenant requirements.',
  guide: {
    title: 'Comience con guías',
    subtitle: 'Inicie su proceso de desarrollo de aplicaciones con nuestras guías',
    introduction: {
      /** UNTRANSLATED */
      title: "Let's understand how organization works in Logto",
      section_1: {
        /** UNTRANSLATED */
        title: 'An organization is a group of users (identities)',
      },
      section_2: {
        /** UNTRANSLATED */
        title: 'Organization template is designed for multi-tenant apps access control',
        /** UNTRANSLATED */
        description:
          'In multi-tenant SaaS applications, multiple organizations often share the same access control template, which includes permissions and roles. In Logto, we call it "organization template."',
        /** UNTRANSLATED */
        permission_description:
          'Organization permission refers to the authorization to access a resource in the context of organization.',
        /** UNTRANSLATED */
        role_description:
          'Organization role is a grouping of organization permissions that can be assigned to members.',
      },
      section_3: {
        title: 'Interactúa con la ilustración para ver cómo se conecta todo',
        description:
          "Let's take an example. John, Sarah are in different organizations with different roles in the context of different organizations. Hover over the different modules and see what happens.",
      },
    },
    step_1: 'Paso 1: Definir permisos de organización',
    step_2: 'Paso 2: Definir roles de organización',
    step_2_description:
      '"Roles de organización" representan un conjunto de roles dados a cada organización al principio. Estos roles están determinados por los permisos globales que ha establecido en la pantalla anterior. Similar al permiso de organización, una vez que termine esta configuración por primera vez, no necesitará hacer esto cada vez que cree una nueva organización.',
    step_3: 'Paso 3: Cree su primera organización',
    step_3_description:
      "Let's create your first organization. It comes with a unique ID and serves as a container for handling various more business-toward identities, such as partners, customers, and their access control.",
    /** UNTRANSLATED */
    more_next_steps: 'More next steps',
    /** UNTRANSLATED */
    add_members: 'Add members to your organization',
    /** UNTRANSLATED */
    add_members_action: 'Bulk add members and assign roles',
    /** UNTRANSLATED */
    add_enterprise_connector: 'Add enterprise SSO',
    /** UNTRANSLATED */
    add_enterprise_connector_action: 'Set up enterprise SSO',
    /** UNTRANSLATED */
    organization_permissions: 'Organization permissions',
    /** UNTRANSLATED */
    permission_name: 'Permission name',
    /** UNTRANSLATED */
    permissions: 'Permissions',
    /** UNTRANSLATED */
    organization_roles: 'Organization roles',
    /** UNTRANSLATED */
    role_name: 'Role name',
    /** UNTRANSLATED */
    organization_name: 'Organization name',
    /** UNTRANSLATED */
    admin: 'Admin',
    /** UNTRANSLATED */
    member: 'Member',
    /** UNTRANSLATED */
    guest: 'Guest',
    /** UNTRANSLATED */
    role_description:
      'Role "{{role}}" shares the same organization template across different organizations.',
    /** UNTRANSLATED */
    john: 'John',
    /** UNTRANSLATED */
    john_tip:
      'John belongs to two organizations with the email "john@email.com" as the single identifier. He is the admin of organization A as well as the guest of organization B.',
    /** UNTRANSLATED */
    sarah: 'Sarah',
    /** UNTRANSLATED */
    sarah_tip:
      'Sarah belongs to one organization with the email "sarah@email.com" as the single identifier. She is the admin of organization B.',
  },
};

export default Object.freeze(organizations);
