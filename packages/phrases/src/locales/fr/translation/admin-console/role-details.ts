const role_details = {
  back_to_roles: 'Retour aux rôles',
  identifier: 'Identificateur',
  delete_description:
    'Cela supprimera les autorisations associées à ce rôle des utilisateurs concernés et supprimera la correspondance entre les rôles, les utilisateurs et les autorisations.',
  role_deleted: '{{name}} a été supprimé avec succès.',
  general_tab: 'Général',
  users_tab: 'Utilisateurs',
  m2m_apps_tab: 'Applications machine-à-machine',
  permissions_tab: 'Autorisations',
  settings: 'Paramètres',
  settings_description:
    "Les rôles sont un regroupement d'autorisations qui peuvent être attribuées aux utilisateurs. Ils fournissent également un moyen d'agréger les autorisations définies pour différentes API, ce qui rend plus efficace l'ajout, la suppression ou l'ajustement des autorisations par rapport à leur attribution individuelle aux utilisateurs.",
  field_name: 'Nom',
  field_description: 'Description',
  field_is_default: 'Rôle par défaut',
  field_is_default_description:
    "Définissez ce rôle comme rôle par défaut pour les nouveaux utilisateurs. Plusieurs rôles par défaut peuvent être définis. Cela affectera également les rôles par défaut des utilisateurs créés via l'API de gestion.",
  type_m2m_role_tag: 'Rôle machine à machine',
  type_user_role_tag: "Rôle d'utilisateur",
  m2m_role_notification:
    "Attribuez ce rôle machine à machine à une application machine à machine pour accorder l'accès aux ressources d'API relatives. <a>Créez d'abord une application machine à machine</a> si ce n'est pas déjà fait.",
  permission: {
    assign_button: 'Attribuer des autorisations',
    assign_title: 'Attribuer des autorisations',
    assign_subtitle:
      'Attribuez des autorisations à ce rôle. Le rôle acquerra les autorisations ajoutées, et les utilisateurs avec ce rôle hériteront de ces autorisations.',
    assign_form_field: 'Attribuer des autorisations',
    added_text_one: '{{count, number}} autorisation ajoutée',
    added_text_other: '{{count, number}} autorisations ajoutées',
    api_permission_count_one: '{{count, number}} autorisation',
    api_permission_count_other: '{{count, number}} autorisations',
    confirm_assign: 'Attribuer des autorisations',
    permission_assigned: 'Les autorisations sélectionnées ont été attribuées avec succès à ce rôle',
    deletion_description:
      "Si cette autorisation est supprimée, l'utilisateur concerné ayant ce rôle perdra l'accès accordé par cette autorisation.",
    permission_deleted: 'L\'autorisation "{{name}}" a été supprimée avec succès de ce rôle',
    empty: 'Aucune autorisation disponible',
  },
  users: {
    assign_button: 'Attribuer des utilisateurs',
    name_column: 'Utilisateur',
    app_column: 'Application',
    latest_sign_in_column: 'Dernière connexion',
    delete_description:
      "Il restera dans votre répertoire d'utilisateurs mais perdra l'autorisation pour ce rôle.",
    deleted: '{{name}} a été supprimé avec succès de ce rôle',
    assign_title: 'Attribuer des utilisateurs à {{name}}',
    assign_subtitle:
      'Trouvez des utilisateurs appropriés en recherchant par nom, email, téléphone ou ID utilisateur.',
    assign_field: 'Assigner des utilisateurs',
    confirm_assign: 'Attribuer des utilisateurs',
    assigned_toast_text: 'Les utilisateurs sélectionnés ont été attribués avec succès à ce rôle',
    empty: 'Aucun utilisateur disponible',
  },
  applications: {
    assign_button: 'Attribuer des applications machine à machine',
    name_column: 'Application',
    app_column: 'Application machine à machine',
    description_column: 'Description',
    delete_description:
      "Elle restera dans votre pool d'applications mais perdra l'autorisation pour ce rôle.",
    deleted: '{{name}} a été supprimé avec succès de ce rôle',
    assign_title: 'Attribuer des applications machine à machine à {{name}}',
    assign_subtitle:
      "Trouvez des applications machine à machine appropriées en recherchant par nom, description ou ID d'application.",
    assign_field: 'Attribuer des applications machine à machine',
    confirm_assign: 'Attribuer des applications machine à machine',
    assigned_toast_text: 'Les applications sélectionnées ont été attribuées avec succès à ce rôle',
    empty: 'Aucune application disponible',
  },
};

export default Object.freeze(role_details);
