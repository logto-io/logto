const jwt_claims = {
  title: 'JWT personnalisé',
  description:
    "Configurer des revendications JWT personnalisées à inclure dans le jeton d'accès. Ces revendications peuvent être utilisées pour transmettre des informations supplémentaires à votre application.",
  user_jwt: {
    card_title: "Pour l'utilisateur",
    card_field: "Jeton d'accès utilisateur",
    card_description:
      "Ajouter des données spécifiques à l'utilisateur lors de l'émission du jeton d'accès.",
    for: "pour l'utilisateur",
  },
  machine_to_machine_jwt: {
    card_title: 'Pour M2M',
    card_field: 'Jeton machine-à-machine',
    card_description:
      "Ajouter des données supplémentaires lors de l'émission du jeton machine-à-machine.",
    for: 'pour M2M',
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
  token_data: {
    title: 'Données du jeton',
    subtitle: "Utilisez le paramètre d'entrée `token` pour le payload du jeton d'accès actuel. ",
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
