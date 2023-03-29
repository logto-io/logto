const others = {
  terms_of_use: {
    title: "CONDITIONS D'UTILISATION",
    terms_of_use: "URL des conditions d'utilisation",
    terms_of_use_placeholder: 'https://vos.conditions.utilisation/',
    privacy_policy: 'URL de la politique de confidentialité',
    privacy_policy_placeholder: 'https://votre.politique.confidentialite/',
  },
  languages: {
    title: 'LANGUES',
    enable_auto_detect: 'Activer la détection automatique',
    description:
      'Votre logiciel détecte les paramètres régionaux de l’utilisateur et passe à la langue locale. Vous pouvez ajouter de nouvelles langues en traduisant l’IU de l’anglais à une autre langue.',
    manage_language: 'Gérer la langue',
    default_language: 'Langue par défaut',
    default_language_description_auto:
      'La langue par défaut sera utilisée lorsque la langue détectée de l’utilisateur ne figure pas dans la bibliothèque de langues actuelle.',
    default_language_description_fixed:
      "Lorsque la détection automatique est désactivée, la langue par défaut est la seule langue que votre logiciel affichera. Activez la détection automatique pour l'extension de la langue.",
  },
  manage_language: {
    title: 'Gérer la langue',
    subtitle:
      'Localisez l’expérience produit en ajoutant des langues et des traductions. Votre contribution peut être définie comme langue par défaut.',
    add_language: 'Ajouter une langue',
    logto_provided: 'Logto fourni',
    key: 'Clé',
    logto_source_values: 'Logto des valeurs source',
    custom_values: 'Valeurs personnalisées',
    clear_all_tip: 'Supprimer toutes les valeurs',
    unsaved_description:
      'Les modifications ne seront pas enregistrées si vous quittez cette page sans enregistrer.',
    deletion_tip: 'Supprimer la langue',
    deletion_title: 'Voulez-vous supprimer la langue ajoutée ?',
    deletion_description:
      'Après suppression, vos utilisateurs ne pourront plus naviguer dans cette langue.',
    default_language_deletion_title: 'La langue par défaut ne peut pas être supprimée.',
    default_language_deletion_description:
      '{{language}} est défini comme votre langue par défaut et ne peut pas être supprimé.',
  },
  advanced_options: {
    title: 'OPTIONS AVANCÉES',
    enable_user_registration: 'Activer l’enregistrement des utilisateurs',
    enable_user_registration_description:
      'Autoriser ou interdire l’enregistrement des utilisateurs. Une fois désactivé, les utilisateurs peuvent toujours être ajoutés dans la console d’administration mais les utilisateurs ne peuvent plus établir de comptes via l’IU de connexion.',
  },
};

export default others;
