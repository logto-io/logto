const user_details = {
  back_to_users: 'Retour à la gestion des utilisateurs',
  created_title: 'Cet utilisateur a été créé avec succès',
  created_guide: "Vous pouvez envoyer à l'utilisateur les informations de connexion suivantes",
  created_username: "Nom d'utilisateur :",
  created_password: 'Mot de passe :',
  menu_delete: 'Supprimer',
  delete_description: "Cette action ne peut être annulée. Elle supprimera définitivement l'utilisateur.",
  deleted: "L'utilisateur a été supprimé avec succès",
  reset_password: {
    reset_password: 'Réinitialiser le mot de passe',
    title: 'Êtes-vous sûr de vouloir réinitialiser le mot de passe ?',
    content: "Cette action ne peut être annulée. Cette action réinitialisera les informations de connexion de l'utilisateur.",
    congratulations: 'Cet utilisateur a été réinitialisé',
    new_password: 'Nouveau mot de passe :',
  },
  tab_logs: "Journaux de l'utilisateur",
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
};

export default user_details;
