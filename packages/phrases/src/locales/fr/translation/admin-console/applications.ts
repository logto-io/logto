const applications = {
  title: 'Applications',
  subtitle:
    "Configurez une application mobile, une page unique ou une application traditionnelle pour utiliser Logto pour l'authentification.",
  create: 'Créer une application',
  application_name: "Nom de l'application",
  application_name_placeholder: 'Mon app',
  application_description: "Description de l'application",
  application_description_placeholder: "Entrer la description de votre application",
  select_application_type: "Sélectionner un type d'application",
  no_application_type_selected: "Vous n'avez pas encore sélectionné de type d'application",
  application_created:
    "L'application {{name}} a été créée avec succès ! \nMaintenant, terminez les paramètres de votre application",
  app_id: 'App ID',
  type: {
    native: {
      title: 'Application native',
      subtitle: 'Une application qui fonctionne dans un environnement natif',
      description: 'Exemple: iOS app, Android app',
    },
    spa: {
      title: 'Single Page App',
      subtitle: "Une application qui s'exécute dans un navigateur web et met dynamiquement à jour les données sur place.",
      description: 'Exemple: React app, Vue app',
    },
    traditional: {
      title: 'Web Traditionnel',
      subtitle: 'Une application qui met à jour les pages par le seul serveur web.',
      description: 'Exemple: Next.js, PHP',
    },
  },
  guide: {
    get_sample_file: 'Obtenir un exemple',
    header_description:
      'Suivez un guide étape par étape pour intégrer votre application ou cliquez sur le bouton de droite pour obtenir notre exemple de projet.',
    title: "L'application a été créée avec succès",
    subtitle:
      'Suivez maintenant les étapes ci-dessous pour terminer la configuration de votre application. Veuillez sélectionner le type de SDK pour continuer.',
    description_by_sdk:
      "Ce guide de démarrage rapide montre comment intégrer Logto dans l'application {{sdk}}.",
  },
};

export default applications;
