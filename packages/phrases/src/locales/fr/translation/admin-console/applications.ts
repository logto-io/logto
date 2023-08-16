const applications = {
  page_title: 'Applications',
  title: 'Applications',
  subtitle:
    "Configurez une application mobile, une page unique, machine to machine ou une application traditionnelle pour utiliser Logto pour l'authentification.",
  create: 'Créer une application',
  application_name: "Nom de l'application",
  application_name_placeholder: 'Mon app',
  application_description: "Description de l'application",
  application_description_placeholder: 'Entrer la description de votre application',
  select_application_type: "Sélectionner un type d'application",
  no_application_type_selected: "Vous n'avez pas encore sélectionné de type d'application",
  application_created:
    "L'application {{name}} a été créée avec succès.\nMaintenant, terminez les paramètres de votre application",
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
  },
  guide: {
    header_title: 'Select a framework or tutorial', // UNTRANSLATED
    modal_header_title: 'Start with SDK and guides', // UNTRANSLATED
    header_subtitle: 'Jumpstart your app development process with our pre-built SDK and tutorials.', // UNTRANSLATED
    start_building: 'Start Building', // UNTRANSLATED
    categories: {
      featured: 'Popular and for you', // UNTRANSLATED
      Traditional: 'Traditional web app', // UNTRANSLATED
      SPA: 'Single page app', // UNTRANSLATED
      Native: 'Native', // UNTRANSLATED
      MachineToMachine: 'Machine-to-machine', // UNTRANSLATED
    },
    filter: {
      title: 'Filter framework', // UNTRANSLATED
      placeholder: 'Search for framework', // UNTRANSLATED
    },
    get_sample_file: 'Obtenir un exemple',
    title: "L'application a été créée avec succès",
    subtitle:
      'Suivez maintenant les étapes ci-dessous pour terminer la configuration de votre application. Veuillez sélectionner le type de SDK pour continuer.',
    description_by_sdk:
      "Ce guide de démarrage rapide montre comment intégrer Logto dans l'application {{sdk}}.",
    do_not_need_tutorial:
      'If you don’t need a tutorial, you can continue without a framework guide', // UNTRANSLATED
    create_without_framework: 'Create app without framework', // UNTRANSLATED
    finish_and_done: 'Terminer et terminé',
    cannot_find_guide: "Can't find your guide?", // UNTRANSLATED
    describe_guide_looking_for: 'Describe the guide you are looking for', // UNTRANSLATED
    describe_guide_looking_for_placeholder: 'E.g., I want to integrate Logto into my Angular app.', // UNTRANSLATED
    request_guide_successfully: 'Your request has been successfully submitted. Thank you!', // UNTRANSLATED
  },
  placeholder_title: "Sélectionnez un type d'application pour continuer",
  placeholder_description:
    "Logto utilise une entité d'application pour OIDC pour aider aux tâches telles que l'identification de vos applications, la gestion de la connexion et la création de journaux d'audit.",
};

export default Object.freeze(applications);
