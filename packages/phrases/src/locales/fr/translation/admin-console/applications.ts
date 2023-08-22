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
    header_title: 'Sélectionnez un framework ou un tutoriel',
    modal_header_title: 'Commencez avec SDK et des guides',
    header_subtitle:
      "Démarrez votre processus de développement d'application avec nos SDK pré-construits et tutoriels.",
    start_building: 'Commencer la construction',
    categories: {
      featured: 'Populaire et pour vous',
      Traditional: 'Application web traditionnelle',
      SPA: 'Application à page unique',
      Native: 'Native',
      MachineToMachine: 'Machine-to-machine',
    },
    filter: {
      title: 'Filtrer les frameworks',
      placeholder: 'Rechercher un framework',
    },
    select_a_framework: 'Sélectionnez un framework',
    checkout_tutorial: 'Voir le tutoriel {{name}}',
    get_sample_file: 'Obtenir un fichier exemple',
    title: "L'application a été créée avec succès",
    subtitle:
      'Suivez maintenant les étapes ci-dessous pour terminer la configuration de votre application. Veuillez sélectionner le type de SDK pour continuer.',
    description_by_sdk:
      "Ce guide de démarrage rapide montre comment intégrer Logto dans l'application {{sdk}}.",
    do_not_need_tutorial:
      "Si vous n'avez pas besoin d'un tutoriel, vous pouvez continuer sans guide de framework",
    create_without_framework: 'Créer une application sans framework',
    finish_and_done: 'Terminer et terminé',
    cannot_find_guide: 'Vous ne trouvez pas votre guide?',
    describe_guide_looking_for: 'Décrivez le guide que vous recherchez',
    describe_guide_looking_for_placeholder:
      'Par exemple, je veux intégrer Logto dans mon application Angular.',
    request_guide_successfully: 'Votre demande a été soumise avec succès. Merci!',
  },
  placeholder_title: "Sélectionnez un type d'application pour continuer",
  placeholder_description:
    "Logto utilise une entité d'application pour OIDC pour aider aux tâches telles que l'identification de vos applications, la gestion de la connexion et la création de journaux d'audit.",
};

export default Object.freeze(applications);
