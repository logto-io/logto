const applications = {
  page_title: 'Applications',
  title: 'Applications',
  subtitle:
    "Configurez une application mobile, une page unique, machine to machine ou une application traditionnelle pour utiliser Logto pour l'authentification.",
  subtitle_with_app_type: "Configurez l'authentification Logto pour votre application {{name}}",
  create: 'Créer une application',
  application_name: "Nom de l'application",
  application_name_placeholder: 'Mon app',
  application_description: "Description de l'application",
  application_description_placeholder: 'Entrer la description de votre application',
  select_application_type: "Sélectionner un type d'application",
  no_application_type_selected: "Vous n'avez pas encore sélectionné de type d'application",
  application_created: "L'application a été créée avec succès.",
  tab: {
    /** UNTRANSLATED */
    my_applications: 'My apps',
    /** UNTRANSLATED */
    third_party_applications: 'Third-party apps',
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
      /** UNTRANSLATED */
      title: 'Protected App',
      /** UNTRANSLATED */
      subtitle: 'An app that is protected by Logto',
      /** UNTRANSLATED */
      description: 'N/A',
    },
    third_party: {
      /** UNTRANSLATED */
      title: 'Third-party App',
      /** UNTRANSLATED */
      subtitle: 'An app that is used as a third-party IdP connector',
      /** UNTRANSLATED */
      description: 'E.g., OIDC, SAML',
    },
  },
  placeholder_title: "Sélectionnez un type d'application pour continuer",
  placeholder_description:
    "Logto utilise une entité d'application pour OIDC pour aider aux tâches telles que l'identification de vos applications, la gestion de la connexion et la création de journaux d'audit.",
};

export default Object.freeze(applications);
