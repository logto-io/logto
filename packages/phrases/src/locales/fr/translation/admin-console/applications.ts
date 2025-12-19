const applications = {
  page_title: 'Applications',
  title: 'Applications',
  subtitle:
    "Configurez une application mobile, une page unique, machine to machine ou une application traditionnelle pour utiliser Logto pour l'authentification.",
  subtitle_with_app_type: "Configurez l'authentification Logto pour votre application {{name}}",
  create: 'Créer une application',
  create_third_party: 'Créer une application tierce',
  create_thrid_party_modal_title: 'Créer une app tierce ({{type}})',
  application_name: "Nom de l'application",
  application_name_placeholder: 'Mon app',
  application_description: "Description de l'application",
  application_description_placeholder: 'Entrer la description de votre application',
  select_application_type: "Sélectionner un type d'application",
  no_application_type_selected: "Vous n'avez pas encore sélectionné de type d'application",
  application_created: "L'application a été créée avec succès.",
  tab: {
    my_applications: 'Mes applications',
    third_party_applications: 'Applications tierces',
  },
  app_id: 'App ID',
  type: {
    native: {
      title: 'Application native',
      subtitle: 'Une application qui fonctionne dans un environnement natif',
      description: 'Exemple: application iOS, application Android',
    },
    spa: {
      title: 'Application à page unique',
      subtitle:
        "Une application qui s'exécute dans un navigateur web et met dynamiquement à jour les données sur place.",
      description: 'Exemple: application React, application Vue',
    },
    traditional: {
      title: 'Web traditionnel',
      subtitle: 'Une application qui met à jour les pages par le seul serveur web.',
      description: 'Exemple: Next.js, PHP',
    },
    machine_to_machine: {
      title: 'Machine-to-Machine',
      subtitle:
        'Une application (généralement un service) qui communique directement avec les ressources',
      description: 'Par exemple, un service backend',
    },
    protected: {
      title: 'Application protégée',
      subtitle: 'Une application protégée par Logto',
      description: 'N/A',
    },
    saml: {
      title: 'Application SAML',
      subtitle: 'Une application utilisée comme un connecteur IdP SAML',
      description: 'Par exemple, SAML',
    },
    third_party: {
      title: 'Application tierce',
      subtitle: 'Une application utilisée comme connecteur IdP tiers',
      description: 'Par exemple, OIDC, SAML',
    },
  },
  placeholder_title: "Sélectionnez un type d'application pour continuer",
  placeholder_description:
    "Logto utilise une entité d'application pour OIDC pour aider aux tâches telles que l'identification de vos applications, la gestion de la connexion et la création de journaux d'audit",
  third_party_application_placeholder_description:
    "Utilisez Logto comme fournisseur d'identité pour offrir une autorisation OAuth aux services tiers. \n Inclut un écran de consentement utilisateur intégré pour l'accès aux ressources. <a>En savoir plus</a>",
  guide: {
    third_party: {
      title: 'Intégrer une application tierce',
      description:
        "Utilisez Logto comme fournisseur d'identité pour offrir une autorisation OAuth aux services tiers. Inclut un écran de consentement utilisateur préconstruit pour un accès sécurisé aux ressources. <a>En savoir plus</a>",
    },
  },
};

export default Object.freeze(applications);
