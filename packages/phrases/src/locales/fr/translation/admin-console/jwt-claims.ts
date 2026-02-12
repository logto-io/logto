const jwt_claims = {
  title: 'JWT personnalisé',
  description:
    "Personnalisez le jeton d'accès ou le jeton d'identité, fournissant des informations supplémentaires à votre application.",
  access_token: {
    card_title: "Jeton d'accès",
    card_description:
      "Le jeton d'accès est l'identifiant utilisé par les API pour autoriser les demandes, contenant uniquement les revendications nécessaires aux décisions d'accès.",
  },
  user_jwt: {
    card_field: "Jeton d'accès utilisateur",
    card_description:
      "Ajouter des données spécifiques à l'utilisateur lors de l'émission du jeton d'accès.",
    for: "pour l'utilisateur",
  },
  machine_to_machine_jwt: {
    card_field: "Jeton d'accès machine-à-machine",
    card_description:
      "Ajouter des données supplémentaires lors de l'émission du jeton machine-à-machine.",
    for: 'pour M2M',
  },
  id_token: {
    card_title: "Jeton d'identité",
    card_description:
      "Le jeton d'identité est une assertion d'identité reçue après la connexion, contenant des revendications d'identité utilisateur pour que le client les utilise pour l'affichage ou la création de session.",
    card_field: "Jeton d'identité utilisateur",
    card_field_description:
      "Les revendications 'sub', 'email', 'phone', 'profile' et 'address' sont toujours disponibles. Les autres revendications doivent d'abord être activées ici. Dans tous les cas, votre application doit demander les scopes correspondants lors de l'intégration pour les recevoir.",
  },
  code_editor_title: 'Personnalisez les revendications {{token}}',
  custom_jwt_create_button: 'Ajouter des revendications personnalisées',
  custom_jwt_item: 'Revendications personnalisées {{for}}',
  delete_modal_title: 'Supprimer les revendications personnalisées',
  delete_modal_content: 'Êtes-vous sûr de vouloir supprimer les revendications personnalisées ?',
  clear: 'Effacer',
  cleared: 'Effacé',
  restore: 'Restaurer les paramètres par défaut',
  restored: 'Restauré',
  data_source_tab: 'Source de données',
  test_tab: 'Contexte de test',
  jwt_claims_description:
    'Les revendications par défaut sont automatiquement incluses dans le JWT et ne peuvent pas être remplacées.',
  user_data: {
    title: 'Données utilisateur',
    subtitle:
      "Utilisez le paramètre d'entrée `context.user` pour fournir des informations vitales sur l'utilisateur.",
  },
  grant_data: {
    title: 'Données de subvention',
    subtitle:
      'Utilisez le paramètre d’entrée `context.grant` pour fournir des informations cruciales sur les subventions, uniquement disponibles pour l’échange de jetons.',
  },
  interaction_data: {
    title: "Contexte d'interaction utilisateur",
    subtitle:
      "Utilisez le paramètre `context.interaction` pour accéder aux détails de l'interaction de l'utilisateur pour la session d'authentification en cours.",
  },
  application_data: {
    title: "Contexte de l'application",
    subtitle:
      "Utilisez le paramètre d'entrée `context.application` pour fournir les informations d'application associées au jeton.",
  },
  token_data: {
    title: 'Données du jeton',
    subtitle: "Utilisez le paramètre d'entrée `token` pour le payload du jeton d'accès actuel. ",
  },
  api_context: {
    title: "Contexte API : contrôle d'accès",
    subtitle: 'Utilisez la méthode `api.denyAccess` pour rejeter la demande de jeton.',
  },
  fetch_external_data: {
    title: 'Récupérer des données externes',
    subtitle:
      'Incorporer des données provenant directement de vos API externes dans les revendications.',
    description:
      'Utilisez la fonction `fetch` pour appeler vos API externes et inclure les données dans vos revendications personnalisées. Exemple : ',
  },
  environment_variables: {
    title: "Définir des variables d'environnement",
    subtitle: "Utilisez des variables d'environnement pour stocker des informations sensibles.",
    input_field_title: "Ajouter des variables d'environnement",
    sample_code:
      "Accès aux variables d'environnement dans votre gestionnaire de revendications JWT personnalisées. Exemple : ",
  },
  jwt_claims_hint:
    'Limitez les revendications personnalisées à moins de 50 Ko. Les revendications JWT par défaut sont automatiquement incluses dans le jeton et ne peuvent pas être remplacées.',
  tester: {
    subtitle: 'Ajustez le jeton et les données utilisateur simulés pour les tests.',
    run_button: 'Exécuter le test',
    result_title: 'Résultat du test',
  },
  form_error: {
    invalid_json: 'Format JSON invalide',
  },
};

export default Object.freeze(jwt_claims);
