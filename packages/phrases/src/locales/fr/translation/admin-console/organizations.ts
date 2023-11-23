const organizations = {
  organization: 'Organisation',
  page_title: 'Organisations',
  title: 'Organisations',
  subtitle:
    "Une organisation est une collection d'utilisateurs qui comprend des équipes, des clients professionnels et des sociétés partenaires qui utilisent vos applications.",
  organization_template: "Modèle d'organisation",
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
    "Si cette autorisation est supprimée, tous les rôles d'organisation incluant cette autorisation perdront cette autorisation, et les utilisateurs ayant cette autorisation perdront l'accès qui en découle.",
  role: 'Rôle',
  create_role_placeholder: 'Utilisateurs avec des autorisations en lecture seule',
  search_placeholder: "Rechercher par nom ou ID de l'organisation",
  search_permission_placeholder: 'Tapez pour rechercher et sélectionner des autorisations',
  search_role_placeholder: 'Tapez pour rechercher et sélectionner des rôles',
  empty_placeholder: "🤔 Vous n'avez pas encore configuré {{entity}}.",
  organization_and_member: 'Organisation et membre',
  organization_and_member_description:
    'Une organisation est un groupe d\'utilisateurs et peut représenter les équipes, les clients professionnels et les sociétés partenaires, chaque utilisateur étant un "Membre". Ceux-ci peuvent être des entités fondamentales pour répondre à vos exigences multi-locataires.',
  guide: {
    title: 'Commencez avec les guides',
    subtitle: "Boostez vos paramètres d'organisation avec nos guides",
    introduction: {
      title: "Commençons par comprendre comment l'organisation fonctionne dans Logto",
      section_1: {
        title: 'Une organisation est un groupe d’utilisateurs (identités)',
      },
      section_2: {
        title:
          'Le modèle d’organisation est conçu pour le contrôle d’accès des applications multi-locataires',
        description:
          'Dans les applications SaaS multi-locataires, plusieurs organisations partagent souvent le même modèle de contrôle d’accès, qui comprend des autorisations et des rôles. Chez Logto, nous l\'appelons "modèle d\'organisation".',
        permission_description:
          "L'autorisation d'organisation se réfère à l'autorisation d'accéder à une ressource dans le contexte de l'organisation.",
        role_description:
          'Le rôle d’organisation est un regroupement d’autorisations d’organisation qui peut être attribué aux membres.',
      },
      section_3: {
        title: "Interagissez avec l'illustration pour voir comment tout est connecté",
        description:
          "Prenons un exemple. John, Sarah appartiennent à différentes organisations avec des rôles différents dans le contexte d'organisations différentes. Survolez les différents modules et voyez ce qui se passe.",
      },
    },
    step_1: "Étape 1 : Définir les autorisations d'organisation",
    step_2: "Étape 2 : Définir les rôles d'organisation",
    step_3: 'Étape 3 : Créer votre première organisation',
    step_3_description:
      'Créez votre première organisation. Celle-ci est associée à un identifiant unique et sert de contenant pour gérer plusieurs autres identités professionnelles.',
    more_next_steps: 'Autres étapes à suivre',
    add_members: 'Ajouter des membres à votre organisation',
    add_members_action: 'Ajouter des membres en masse et attribuer des rôles',
    organization_permissions: "Autorisations de l'organisation",
    permission_name: "Nom de l'autorisation",
    permissions: 'Autorisations',
    organization_roles: "Rôles de l'organisation",
    role_name: 'Nom du rôle',
    organization_name: "Nom de l'organisation",
    admin: 'Admin',
    member: 'Membre',
    guest: 'Invité',
    role_description:
      'Le rôle "{{role}}" partage le même modèle d’organisation entre différentes organisations.',
    john: 'John',
    john_tip:
      'John appartient à deux organisations avec l’e-mail "john@email.com" comme seul identifiant. Il est l’administrateur de l’organisation A ainsi que l’invité de l’organisation B.',
    sarah: 'Sarah',
    sarah_tip:
      'Sarah appartient à une organisation avec l’e-mail "sarah@email.com" comme seul identifiant. Elle est l’administratrice de l’organisation B.',
  },
};

export default Object.freeze(organizations);
