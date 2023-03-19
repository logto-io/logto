const user_details = {
  back_to_users: 'Retour à la gestion des utilisateurs',
  created_title: 'Cet utilisateur a été créé avec succès',
  created_guide: "Vous pouvez envoyer à l'utilisateur les informations de connexion suivantes",
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
  tab_settings: 'Settings', // UNTRANSLATED
  tab_roles: 'Roles', // UNTRANSLATED
  tab_logs: "Journaux de l'utilisateur",
  settings: 'Settings', // UNTRANSLATED
  settings_description:
    'Each user has a profile containing all user information. It consists of basic data, social identities, and custom data.', // UNTRANSLATED
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
  suspended: 'Suspended', // UNTRANSLATED
  roles: {
    name_column: 'Role', // UNTRANSLATED
    description_column: 'Description', // UNTRANSLATED
    assign_button: 'Assign Roles', // UNTRANSLATED
    delete_description:
      'This action will remove this role from this user. The role itself will still exist, but it will no longer be associated with this user.', // UNTRANSLATED
    deleted: '{{name}} was successfully removed from this user.', // UNTRANSLATED
    assign_title: 'Assign roles to {{name}}', // UNTRANSLATED
    assign_subtitle: 'Authorize {{name}} one or more roles', // UNTRANSLATED
    assign_role_field: 'Assign roles', // UNTRANSLATED
    role_search_placeholder: 'Search by role name', // UNTRANSLATED
    added_text: '{{value, number}} added', // UNTRANSLATED
    assigned_user_count: '{{value, number}} users', // UNTRANSLATED
    confirm_assign: 'Assign roles', // UNTRANSLATED
    role_assigned: 'Successfully assigned role(s)', // UNTRANSLATED
    search: 'Search by role name, description or ID', // UNTRANSLATED
    empty: 'No role available', // UNTRANSLATED
  },
};

export default user_details;
