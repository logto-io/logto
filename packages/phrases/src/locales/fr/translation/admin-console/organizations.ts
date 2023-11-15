const organizations = {
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
    "Cela supprimera les autorisations associées à ce rôle des utilisateurs concernés et supprimera les relations entre les rôles d'organisation, les membres de l'organisation et les autorisations d'organisation.",
  role: 'Rôle',
  create_role_placeholder: 'Utilisateurs avec des autorisations en lecture seule',
  search_placeholder: "Rechercher par nom ou ID de l'organisation",
  search_permission_placeholder: 'Tapez pour rechercher et sélectionner des autorisations',
  search_role_placeholder: 'Tapez pour rechercher et sélectionner des rôles',
  empty_placeholder: "🤔 Vous n'avez pas encore configuré {{entity}}.",
  guide: {
    title: 'Commencez avec les guides',
    subtitle: "Démarrez votre processus de développement d'application avec nos guides",
    introduction: {
      section_1: {
        title: "Tout d'abord, comprenez comment fonctionnent les organisations dans Logto",
        description:
          "Dans les applications SaaS multi-locataires, nous créons souvent plusieurs organisations avec le même ensemble d'autorisations et de rôles, mais dans le contexte d'une organisation cela peut jouer un rôle important dans le contrôle de différents niveaux d'accès. Pensez à chaque locataire comme une organisation Logto et elles partagent naturellement le même \"modèle\" de contrôle d'accès. Nous appelons cela le \"modèle d'organisation.\"",
      },
      section_2: {
        title: "Le modèle d'organisation se compose de deux parties",
        organization_permission_description:
          "L'autorisation d'organisation se réfère à l'autorisation d'accéder à une ressource dans le contexte de l'organisation. Une autorisation d'organisation doit être représentée par une chaîne significative, servant également de nom et d'identifiant unique.",
        organization_role_description:
          "Le rôle d'organisation est un regroupement d'autorisations pouvant être attribuées aux utilisateurs. Les autorisations doivent provenir des autorisations d'organisation prédéfinies.",
      },
      section_3: {
        title: "Interagissez avec l'illustration pour voir comment tout est connecté",
        description:
          'Prenons un exemple. John, Sarah et Tony sont dans des organisations différentes avec des rôles différents dans le contexte de différentes organisations. Survolez les différents modules et voyez ce qui se passe.',
      },
    },
    step_1: "Étape 1 : Définir les autorisations d'organisation",
    step_2: "Étape 2 : Définir les rôles d'organisation",
    step_2_description:
      "\"Les rôles d'organisation\" représentent un ensemble de rôles attribués à chaque organisation au début. Ces rôles sont déterminés par les autorisations globales que vous avez définies à l'écran précédent. De la même manière qu'avec l'autorisation d'organisation, une fois que vous avez terminé ce paramétrage pour la première fois, vous n'aurez pas besoin de le refaire à chaque création d'une nouvelle organisation.",
    step_3: 'Étape 3 : Créer votre première organisation',
    step_3_description:
      "Créons votre première organisation. Elle est livrée avec un ID unique et sert de conteneur pour gérer diverses identités davantage orientées vers les entreprises, telles que des partenaires, des clients et leur contrôle d'accès.",
    more_next_steps: 'Autres étapes suivantes',
    add_members: 'Ajouter des membres à votre organisation',
    add_members_action: 'Ajouter en masse des membres et attribuer des rôles',
    add_enterprise_connector: "Ajouter une SSO d'entreprise",
    add_enterprise_connector_action: "Configurer la SSO d'entreprise",
    organization_permissions: "Autorisations de l'organisation",
    permission_name: "Nom de l'autorisation",
    permissions: 'Autorisations',
    organization_roles: "Rôles de l'organisation",
    role_name: 'Nom du rôle',
    organization_name: "Nom de l'organisation",
    admin: 'Administrateur',
    admin_description:
      'Le rôle "Administrateur" partage le même modèle d\'organisation dans différentes organisations.',
    member: 'Membre',
    member_description:
      'Le rôle "Membre" partage le même modèle d\'organisation dans différentes organisations.',
    guest: 'Invité',
    guest_description:
      'Le rôle "Invité" partage le même modèle d\'organisation dans différentes organisations.',
    create_more_roles:
      "Vous pouvez créer d'autres rôles dans les paramètres du modèle d'organisation. Ces rôles d'organisation s'appliqueront à différentes organisations.",
    read_resource: 'lire:ressource',
    edit_resource: 'éditer:ressource',
    delete_resource: 'supprimer:ressource',
    ellipsis: '……',
    johnny:
      "Johnny appartient à deux organisations avec l'adresse électronique \"{{email}}\" comme identifiant unique. Il est l'administrateur de l'organisation A ainsi que l'invité de l'organisation B.",
    sarah:
      "Sarah appartient à une organisation avec l'adresse électronique \"{{email}}\" comme identifiant unique. Elle est l'administratrice de l'organisation B.",
    tony: 'Tony appartient à une organisation avec l\'adresse électronique "{{email}}" comme identifiant unique. Il est membre de l\'organisation C.',
  },
};

export default Object.freeze(organizations);
