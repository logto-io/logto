const organizations = {
  /** UNTRANSLATED */
  organization: 'Organization',
  page_title: 'Organisations',
  title: 'Organisations',
  subtitle:
    "Représentent les équipes, les clients professionnels et les entreprises partenaires qui accèdent à vos applications en tant qu'organisations.",
  organization_id: "ID de l'organisation",
  members: 'Membres',
  create_organization: 'Créer une organisation',
  setup_organization: 'Configurer votre organisation',
  organization_list_placeholder_title: 'Organisation',
  organization_list_placeholder_text:
    "L'organisation est généralement utilisée dans les applications multi-locataires SaaS ou de type SaaS. La fonctionnalité Organisations permet à vos clients B2B de mieux gérer leurs partenaires et clients, et de personnaliser les façons dont les utilisateurs finaux accèdent à leurs applications.",
  organization_name_placeholder: 'Mon organisation',
  organization_description_placeholder: "Une brève description de l'organisation",
  organization_permission: "Autorisation de l'organisation",
  organization_permission_other: "Autorisations de l'organisation",
  organization_permission_description:
    "L'autorisation d'organisation se réfère à l'autorisation d'accéder à une ressource dans le contexte de l'organisation. Une autorisation d'organisation doit être représentée par une chaîne significative, servant également de nom et d'identifiant unique.",
  organization_permission_delete_confirm:
    "Si cette autorisation est supprimée, tous les rôles d'organisation incluant cette autorisation perdront cette autorisation, et les utilisateurs ayant cette autorisation perdront l'accès qui en découle.",
  create_permission_placeholder: "Lire l'historique des rendez-vous",
  permission: 'Autorisation',
  permission_other: 'Autorisations',
  organization_role: "Rôle de l'organisation",
  organization_role_other: "Rôles de l'organisation",
  organization_role_description:
    "Le rôle d'organisation est un regroupement d'autorisations pouvant être attribuées aux utilisateurs. Les autorisations doivent provenir des autorisations d'organisation prédéfinies.",
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
    title: 'Commencez avec les guides',
    subtitle: "Démarrez votre processus de développement d'application avec nos guides",
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
        title: "Interagissez avec l'illustration pour voir comment tout est connecté",
        description:
          "Let's take an example. John, Sarah are in different organizations with different roles in the context of different organizations. Hover over the different modules and see what happens.",
      },
    },
    step_1: "Étape 1 : Définir les autorisations d'organisation",
    step_2: "Étape 2 : Définir les rôles d'organisation",
    step_2_description:
      "\"Les rôles d'organisation\" représentent un ensemble de rôles attribués à chaque organisation au début. Ces rôles sont déterminés par les autorisations globales que vous avez définies à l'écran précédent. De la même manière qu'avec l'autorisation d'organisation, une fois que vous avez terminé ce paramétrage pour la première fois, vous n'aurez pas besoin de le refaire à chaque création d'une nouvelle organisation.",
    step_3: 'Étape 3 : Créer votre première organisation',
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
