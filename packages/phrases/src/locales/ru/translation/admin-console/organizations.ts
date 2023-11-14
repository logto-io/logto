const organizations = {
  /** UNTRANSLATED */
  organization: 'Organization',
  page_title: 'Организации',
  title: 'Организации',
  subtitle:
    'Представляют команды, бизнес-клиентов и партнерские компании, которые получают доступ к вашим приложениям в качестве организаций.',
  organization_id: 'Идентификатор организации',
  members: 'Участники',
  create_organization: 'Создать организацию',
  setup_organization: 'Настройка вашей организации',
  organization_list_placeholder_title: 'Организация',
  organization_list_placeholder_text:
    'Организация обычно используется в приложениях с мультиарендой или похожих на мультиаренду SaaS. Функция "Организации" позволяет вашим B2B-клиентам лучше управлять своими партнерами и клиентами, а также настраивать способы доступа конечных пользователей к их приложениям.',
  organization_name_placeholder: 'Моя организация',
  organization_description_placeholder: 'Краткое описание организации',
  organization_permission: 'Разрешение организации',
  organization_permission_other: 'Разрешения организации',
  organization_permission_description:
    'Разрешение организации относится к разрешению доступа к ресурсу в контексте организации. Разрешение организации должно быть представлено в виде осмысленной строки и также служить именем и уникальным идентификатором.',
  organization_permission_delete_confirm:
    'Если это разрешение будет удалено, все роли организации, включая это разрешение, потеряют это разрешение, и пользователи, у которых было это разрешение, потеряют предоставленный им доступ к нему.',
  create_permission_placeholder: 'Чтение истории назначений',
  permission: 'Разрешение',
  permission_other: 'Разрешения',
  organization_role: 'Роль организации',
  organization_role_other: 'Роли организации',
  organization_role_description:
    'Роль организации - это группировка разрешений, которые могут быть назначены пользователям. Разрешения должны быть взяты из предопределенных разрешений организации.',
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
    title: 'Начать с руководств',
    subtitle: 'Запустите процесс разработки вашего приложения с нашими руководствами',
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
        title: 'Взаимодействие с иллюстрацией для просмотра связей',
        description:
          "Let's take an example. John, Sarah are in different organizations with different roles in the context of different organizations. Hover over the different modules and see what happens.",
      },
    },
    step_1: 'Шаг 1: Определите разрешения организаций',
    step_2: 'Шаг 2: Определите роли организаций',
    step_2_description:
      '"Роли организаций" представляют собой набор ролей, предоставленных каждой организации с самого начала. Эти роли определяются глобальными разрешениями, установленными на предыдущем экране. Как и с разрешением организации, когда вы закончите эту настройку в первый раз, вам не потребуется делать это каждый раз, когда вы создаете новую организацию.',
    step_3: 'Шаг 3: Создайте свою первую организацию',
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
