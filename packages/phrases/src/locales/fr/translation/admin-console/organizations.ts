const organizations = {
  organization: 'Organisation',
  page_title: 'Organisations',
  title: 'Organisations',
  subtitle:
    "Les organisations sont généralement utilisées dans les applications SaaS ou similaires multi-locataires et représentent vos clients qui sont des équipes, des organisations, ou des entreprises entières. Les organisations servent d'élément fondateur pour l'authentification et l'autorisation B2B.",
  organization_template: "Modèle d'organisation",
  organization_id: "ID de l'organisation",
  members: 'Membres',
  create_organization: 'Créer une organisation',
  setup_organization: 'Configurer votre organisation',
  organization_list_placeholder_title: 'Organisation',
  organization_list_placeholder_text:
    "Les organisations sont souvent utilisées dans les applications SaaS ou similaires multi-locataires comme bonne pratique. Elles vous permettent de développer des applications qui permettent aux clients de créer et de gérer des organisations, d'inviter des membres, et d'assigner des rôles.",
  organization_name_placeholder: 'Mon organisation',
  organization_description_placeholder: "Une brève description de l'organisation",
  organization_permission: "Autorisation de l'organisation",
  organization_permission_other: "Autorisations de l'organisation",
  create_permission_placeholder: "Lire l'historique des rendez-vous",
  organization_role: "Rôle de l'organisation",
  organization_role_other: "Rôles de l'organisation",
  organization_role_description:
    "Le rôle d'organisation est un regroupement d'autorisations pouvant être attribuées aux utilisateurs. Les autorisations doivent provenir des autorisations d'organisation prédéfinies.",
  role: 'Rôle',
  search_placeholder: "Rechercher par nom ou ID de l'organisation",
  search_role_placeholder: 'Tapez pour rechercher et sélectionner des rôles',
  empty_placeholder: "🤔 Vous n'avez pas encore configuré {{entity}}.",
  organization_and_member: 'Organisation et membre',
  organization_and_member_description:
    "L'organisation est un regroupement d'utilisateurs et peut représenter les équipes, les clients professionnels et les entreprises partenaires, chaque utilisateur étant un \"Membre\". Il s'agit d'entités fondamentales pour répondre à vos besoins multi-locataires.",
  guide: {
    title: 'Commencez avec les guides',
    subtitle: 'Démarrez vos paramètres organisationnels avec nos guides',
    introduction: {
      title: "Comprendre le fonctionnement de l'organisation dans Logto",
      section_1: {
        title: "Une organisation est un groupe d'utilisateurs (identités)",
      },
      section_2: {
        title:
          "Le modèle d'organisation est conçu pour le contrôle d'accès des applications multi-locataires",
        description:
          "Dans les applications multi-locataires SaaS, plusieurs organisations partagent souvent le même modèle de contrôle d'accès, comprenant des autorisations et des rôles. Chez Logto, nous l'appelons \"modèle d'organisation\".",
        permission_description:
          "L'autorisation d'organisation se réfère à l'autorisation d'accéder à une ressource dans le contexte de l'organisation.",
        role_description_deprecated:
          "Le rôle d'organisation est un regroupement de permissions d'organisation pouvant être attribuées aux membres.",
        role_description:
          "Le rôle de l'organisation est un regroupement de permissions d'organisation ou de permissions API qui peuvent être attribuées aux membres.",
      },
      section_3: {
        title: "Puis-je attribuer des permissions API aux rôles de l'organisation?",
        description:
          "Oui, vous pouvez attribuer des permissions API aux rôles de l'organisation. Logto offre la flexibilité de gérer efficacement les rôles de votre organisation, vous permettant d'inclure à la fois les permissions d'organisation et les permissions API au sein de ces rôles.",
      },
      section_4: {
        title: "Interagissez avec l'illustration pour voir comment tout est connecté",
        description:
          'Prenons un exemple : John, Sarah appartiennent à différentes organisations avec des rôles différents dans le contexte de différentes organisations. Passez la souris sur les différents modules et voyez ce qui se passe.',
      },
    },
    organization_permissions: "Autorisations de l'organisation",
    organization_roles: "Rôles de l'organisation",
    admin: 'Admin',
    member: 'Membre',
    guest: 'Invité',
    role_description:
      'Le rôle "{{role}}" partage le même modèle d\'organisation dans différentes organisations.',
    john: 'John',
    john_tip:
      "John appartient à deux organisations avec l'e-mail \"john@email.com\" en tant qu'identifiant unique. Il est l'administrateur de l'organisation A ainsi que l'invité de l'organisation B.",
    sarah: 'Sarah',
    sarah_tip:
      "Sarah appartient à une organisation avec l'e-mail \"sarah@email.com\" en tant qu'identifiant unique. Elle est l'administratrice de l'organisation B.",
  },
};

export default Object.freeze(organizations);
