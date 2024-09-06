const user_details = {
  page_title: "Détails de l'utilisateur",
  back_to_users: 'Retour à la gestion des utilisateurs',
  created_title: 'Cet utilisateur a été créé avec succès',
  created_guide: "Voici les informations pour aider l'utilisateur à se connecter.",
  created_email: 'Adresse email :',
  created_phone: 'Numéro de téléphone :',
  created_username: "Nom d'utilisateur :",
  created_password: 'Mot de passe :',
  menu_delete: 'Supprimer',
  delete_description:
    "Cette action ne peut être annulée. Elle supprimera définitivement l'utilisateur.",
  deleted: "L'utilisateur a été supprimé avec succès",
  reset_password: {
    reset_title: 'Êtes-vous sûr de vouloir réinitialiser le mot de passe ?',
    content:
      "Cette action ne peut être annulée. Cette action réinitialisera les informations de connexion de l'utilisateur.",
    reset_complete: 'Cet utilisateur a été réinitialisé',
    new_password: 'Nouveau mot de passe :',
  },
  tab_settings: 'Paramètres',
  tab_roles: 'Rôles utilisateur',
  tab_logs: "Journaux de l'utilisateur",
  tab_organizations: 'Organisations',
  authentication: 'Authentification',
  authentication_description:
    "Chaque utilisateur possède un profil contenant toutes les informations le concernant. Il se compose de données de base, d'identités sociales et de données personnalisées.",
  user_profile: 'Profil utilisateur',
  field_email: 'Adresse e-mail',
  field_phone: 'Numéro de téléphone',
  field_username: "Nom d'utilisateur",
  field_name: 'Nom',
  field_avatar: "URL de l'image avatar",
  field_avatar_placeholder: 'https://votre.domaine.cdn/avatar.png',
  field_custom_data: 'Données personnalisées',
  field_custom_data_tip:
    "Informations supplémentaires sur l'utilisateur qui ne figurent pas dans les propriétés prédéfinies de l'utilisateur, telles que la couleur et la langue préférées de l'utilisateur.",
  field_profile: 'Profil',
  field_profile_tip:
    "Informations supplémentaires selon les normes OpenID Connect qui ne sont pas incluses dans les propriétés de l'utilisateur. Notez que toutes les propriétés inconnues seront supprimées. Veuillez vous référer à la <a>référence des propriétés du profil</a> pour plus d'informations.",
  field_connectors: 'Connecteurs sociaux',
  field_sso_connectors: "Connexions d'entreprise",
  custom_data_invalid: 'Les données personnalisées doivent être un objet JSON valide.',
  profile_invalid: 'Le profil doit être un objet JSON valide.',
  connectors: {
    connectors: 'Connecteurs',
    user_id: 'ID utilisateur',
    remove: 'Supprimer',
    connected: 'Cet utilisateur est connecté à plusieurs connecteurs sociaux.',
    not_connected: "L'utilisateur n'est connecté à aucun connecteur social.",
    deletion_confirmation:
      "Vous supprimez l'identité existante <name/>. Êtes-vous sûr de vouloir continuer ?",
  },
  sso_connectors: {
    connectors: 'Connecteurs',
    enterprise_id: "ID de l'entreprise",
    connected:
      "Cet utilisateur est connecté à plusieurs fournisseurs d'identité d'entreprise pour l'authentification unique.",
    not_connected:
      "L'utilisateur n'est connecté à aucun fournisseur d'identité d'entreprise pour l'authentification unique.",
  },
  mfa: {
    field_name: 'Authentification à deux facteurs',
    field_description: "Cet utilisateur a activé des facteurs d'authentification à 2 étapes.",
    name_column: 'Authentification à deux facteurs',
    field_description_empty:
      "Cet utilisateur n'a pas activé les facteurs d'authentification à deux étapes.",
    deletion_confirmation:
      "Vous supprimez l'existence actuelle de <name/> pour la vérification en deux étapes. Êtes-vous sûr(e) de vouloir continuer?",
  },
  suspended: 'Suspendu',
  suspend_user: "Suspendre l'utilisateur",
  suspend_user_reminder:
    "Êtes-vous sûr de vouloir suspendre cet utilisateur ? L'utilisateur ne pourra pas se connecter à votre application et ne pourra pas obtenir de nouveau jeton d'accès après l'expiration de celui en cours. En outre, toutes les demandes d'API effectuées par cet utilisateur échoueront.",
  suspend_action: 'Suspendre',
  user_suspended: "L'utilisateur a été suspendu.",
  reactivate_user: "Réactiver l'utilisateur",
  reactivate_user_reminder:
    'Êtes-vous sûr de vouloir réactiver cet utilisateur ? Cela permettra toute tentative de connexion pour cet utilisateur.',
  reactivate_action: 'Réactiver',
  user_reactivated: "L'utilisateur a été réactivé.",
  roles: {
    name_column: 'Rôle utilisateur',
    description_column: 'Description',
    assign_button: 'Attribuer des rôles',
    delete_description:
      'Cette action supprimera ce rôle de cet utilisateur. Le rôle lui-même existera toujours, mais il ne sera plus associé à cet utilisateur.',
    deleted: '{{name}} a été retiré de cet utilisateur.',
    assign_title: 'Attribuer des rôles à {{name}}',
    assign_subtitle:
      'Trouvez les rôles utilisateur appropriés en recherchant par nom, description ou ID de rôle.',
    assign_role_field: 'Attribuer des rôles',
    role_search_placeholder: 'Recherche par nom de rôle',
    added_text: '{{value, number}} ajouté',
    assigned_user_count: '{{value, number}} utilisateurs',
    confirm_assign: 'Attribuer des rôles',
    role_assigned: 'Rôle(s) attribué(s) avec succès',
    search: 'Recherche par nom de rôle, description ou ID',
    empty: 'Aucun rôle disponible',
  },
  warning_no_sign_in_identifier:
    "L'utilisateur doit avoir au moins l'un des identifiants de connexion (nom d'utilisateur, e-mail, numéro de téléphone ou compte social) pour se connecter. Êtes-vous sûr(e) de vouloir continuer?",
};

export default Object.freeze(user_details);
