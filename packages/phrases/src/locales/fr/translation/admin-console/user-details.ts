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
    reset_password: 'Réinitialiser le mot de passe',
    title: 'Êtes-vous sûr de vouloir réinitialiser le mot de passe ?',
    content:
      "Cette action ne peut être annulée. Cette action réinitialisera les informations de connexion de l'utilisateur.",
    congratulations: 'Cet utilisateur a été réinitialisé',
    new_password: 'Nouveau mot de passe :',
  },
  tab_settings: 'Paramètres',
  tab_roles: 'Rôles',
  tab_logs: "Journaux de l'utilisateur",
  settings: 'Paramètres',
  settings_description:
    "Chaque utilisateur possède un profil contenant toutes les informations le concernant. Il se compose de données de base, d'identités sociales et de données personnalisées.",
  field_email: 'Email principale',
  field_phone: 'Téléphone principal',
  field_username: "Nom d'utilisateur",
  field_name: 'Nom',
  field_avatar: "URL de l'image avatar",
  field_avatar_placeholder: 'https://votre.domaine.cdn/avatar.png',
  field_custom_data: 'Données personnalisées',
  field_custom_data_tip:
    "Informations supplémentaires sur l'utilisateur qui ne figurent pas dans les propriétés prédéfinies de l'utilisateur, telles que la couleur et la langue préférées de l'utilisateur.",
  field_connectors: 'Connecteurs sociaux',
  custom_data_invalid: 'Les données personnalisées doivent être un objet JSON valide.',
  connectors: {
    connectors: 'Connecteurs',
    user_id: 'ID utilisateur',
    remove: 'Supprimer',
    not_connected: "L'utilisateur n'est connecté à aucun connecteur social",
    deletion_confirmation:
      "Vous supprimez l'identité existante <nom/>. Etes-vous sûr de vouloir faire ça ?",
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
    name_column: 'Rôle',
    description_column: 'Description',
    assign_button: 'Attribuer des rôles',
    delete_description:
      'Cette action supprimera ce rôle de cet utilisateur. Le rôle lui-même existera toujours, mais il ne sera plus associé à cet utilisateur.',
    deleted: '{{name}} a été retiré de cet utilisateur.',
    assign_title: 'Attribuer des rôles à {{name}}',
    assign_subtitle: 'Autoriser {{name}} un ou plusieurs rôles',
    assign_role_field: 'Attribuer des rôles',
    role_search_placeholder: 'Recherche par nom de rôle',
    added_text: '{{value, number}} ajouté',
    assigned_user_count: '{{value, number}} utilisateurs',
    confirm_assign: 'Attribuer des rôles',
    role_assigned: 'Rôle(s) attribué(s) avec succès',
    search: 'Recherche par nom de rôle, description ou ID',
    empty: 'Aucun rôle disponible',
  },
};

export default user_details;
