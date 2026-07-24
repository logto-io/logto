const actions = {
  page_title: 'Actions',
  title: 'Actions',
  subtitle:
    'Exécutez du code personnalisé à des étapes précises du flux d’authentification pour étendre le comportement de Logto.',
  status: {
    not_configured: 'Non configuré',
    configured: 'Configuré',
    enabled: 'Activé',
    disabled: 'Désactivé',
  },
  types: {
    post_first_factor_verification: {
      name: 'Après la vérification du premier facteur',
      description:
        'Exécutez une logique personnalisée après l’échec de la vérification du mot de passe local pendant la connexion.',
    },
    post_sign_in: {
      name: 'Après la connexion',
      description:
        'Exécutez une logique personnalisée après la connexion réussie d’un utilisateur.',
    },
  },
  data_source_tab: 'Source de données',
  test_tab: 'Contexte de test',
  settings_tab: 'Paramètres',
  event_data: {
    title: 'Charge utile de l’événement',
    subtitle:
      'Utilisez le paramètre d’entrée `event` pour les données de l’événement d’authentification.',
  },
  result_data: {
    title: 'Résultat de l’action',
    subtitle: 'Renvoyez un objet de résultat que Logto comprend pour ce type d’action.',
  },
  environment_variables: {
    title: 'Définir les variables d’environnement',
    subtitle: 'Utilisez des variables d’environnement pour stocker des informations sensibles.',
    input_field_title: 'Ajouter des variables d’environnement',
    sample_code: 'Accès aux variables d’environnement dans le gestionnaire d’action. Exemple :',
  },
  fetch_external_data: {
    title: 'Récupérer des données externes',
    subtitle: 'Appelez des API externes depuis votre script d’action.',
    description:
      'Utilisez la fonction `fetch` pour appeler vos API externes et inclure les données dans le résultat de l’action. Exemple :',
  },
  settings: {
    title: 'Paramètres',
    subtitle:
      'Contrôlez si l’action est active et la façon dont les erreurs d’exécution sont gérées.',
    enabled: {
      title: 'Activer l’action',
      description: 'Exécutez ce script lorsque l’événement d’authentification est déclenché.',
    },
    on_execution_error: {
      title: 'En cas d’erreur du script',
      description: 'Choisissez le comportement de Logto lorsque le script échoue à l’exécution.',
      block: 'Bloquer le flux d’authentification',
      allow: 'Autoriser la poursuite du flux d’authentification',
      post_first_factor_description:
        'Lorsque ce script échoue, Logto rejette toujours les identifiants invalides afin que la vérification du mot de passe ne puisse pas être contournée.',
    },
  },
  test_context: {
    subtitle: 'Ajustez la charge utile d’événement simulée utilisée lors des tests.',
    input_field_title: 'JSON d’exemple d’événement',
  },
  script: {
    title: 'Script',
    restore: 'Restaurer les valeurs par défaut',
    restored: 'Restauré',
  },
  tester: {
    run_button: 'Exécuter le test',
    result_title: 'Résultat du test',
  },
  form_error: {
    invalid_json: 'Format JSON non valide',
  },
  security_warning: {
    title: 'Avertissement de sécurité',
    description:
      'Cette action s’exécute uniquement après l’échec de la vérification du mot de passe local. Ne renvoyez `passwordVerified: true` qu’après avoir vérifié indépendamment le mot de passe soumis. Les utilisateurs provisionnés par cette action contournent les protections réservées à l’inscription, y compris la liste de blocage des e-mails, le domaine SSO uniquement, le mode inscription désactivée et les contrôles de profil obligatoire à l’inscription. Les écritures de profil et de mot de passe des utilisateurs existants se produisent aussi avant la fin de la MFA.',
  },
  delete_modal_title: 'Supprimer l’action',
  delete_modal_content:
    'Voulez-vous vraiment supprimer cette action ? Le flux d’authentification n’exécutera plus ce script.',
  deleted: 'Action supprimée',
  created: 'Action créée',
  saved: 'Action enregistrée',
};

export default Object.freeze(actions);
