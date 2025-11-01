const content = {
  terms_of_use: {
    title: 'TERMS',
    description:
      'Ajoutez des conditions et une politique de confidentialité pour répondre aux exigences de conformité.',
    terms_of_use: "URL des conditions d'utilisation",
    terms_of_use_placeholder: 'https://your.terms.of.use/',
    privacy_policy: 'URL de la politique de confidentialité',
    privacy_policy_placeholder: 'https://your.privacy.policy/',
    agree_to_terms: 'Accepter les conditions',
    agree_policies: {
      automatic: 'Continuer à accepter automatiquement les conditions',
      manual_registration_only:
        'Requérir l’accord par case à cocher uniquement lors de l’inscription',
      manual:
        'Requérir l’accord par case à cocher à la fois lors de l’inscription et de la connexion',
    },
  },
  languages: {
    title: 'LANGUES',
    enable_auto_detect: 'Activer la détection automatique',
    description:
      "Votre logiciel détecte la langue de l'utilisateur et passe à la langue locale. Vous pouvez ajouter de nouvelles langues en traduisant l’interface de l’anglais vers une autre langue.",
    manage_language: 'Gérer la langue',
    default_language: 'Langue par défaut',
    default_language_description_auto:
      "La langue par défaut sera utilisée lorsque la langue détectée de l'utilisateur n’est pas disponible dans la bibliothèque actuelle.",
    default_language_description_fixed:
      'Lorsque la détection automatique est désactivée, la langue par défaut est la seule langue affichée. Activez la détection automatique pour proposer davantage de langues.',
  },
  support: {
    title: 'SUPPORT',
    subtitle:
      "Affichez vos canaux de support sur les pages d'erreur pour une assistance rapide des utilisateurs.",
    support_email: 'Email de support',
    support_email_placeholder: 'support@email.com',
    support_website: 'Site de support',
    support_website_placeholder: 'https://your.website/support',
  },
  manage_language: {
    title: 'Gérer la langue',
    subtitle:
      'Localisez l’expérience produit en ajoutant des langues et des traductions. Votre contribution peut être définie comme langue par défaut.',
    add_language: 'Ajouter une langue',
    logto_provided: 'Fourni par Logto',
    key: 'Clé',
    logto_source_values: 'Valeurs sources Logto',
    custom_values: 'Valeurs personnalisées',
    clear_all_tip: 'Effacer toutes les valeurs',
    unsaved_description:
      'Les modifications ne seront pas enregistrées si vous quittez cette page sans sauvegarder.',
    deletion_tip: 'Supprimer la langue',
    deletion_title: 'Voulez-vous supprimer la langue ajoutée ?',
    deletion_description:
      'Après suppression, vos utilisateurs ne pourront plus naviguer dans cette langue.',
    default_language_deletion_title: 'La langue par défaut ne peut pas être supprimée.',
    default_language_deletion_description:
      '{{language}} est défini comme votre langue par défaut et ne peut pas être supprimé.',
  },
};

export default Object.freeze(content);
