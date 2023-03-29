const role_details = {
  back_to_roles: 'Retour aux rôles',
  identifier: 'Identificateur',
  delete_description:
    'Cela supprimera les autorisations associées à ce rôle des utilisateurs concernés et supprimera la correspondance entre les rôles, les utilisateurs et les autorisations.',
  role_deleted: '{{name}} a été supprimé avec succès!',
  settings_tab: 'Paramètres',
  users_tab: 'Utilisateurs',
  permissions_tab: 'Autorisations',
  settings: 'Paramètres',
  settings_description:
    "Les rôles sont un regroupement d'autorisations qui peuvent être attribuées aux utilisateurs. Ils fournissent également un moyen d'agréger les autorisations définies pour différentes API, ce qui rend plus efficace l'ajout, la suppression ou l'ajustement des autorisations par rapport à leur attribution individuelle aux utilisateurs.",
  field_name: 'Nom',
  field_description: 'Description',
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
      "Il restera dans votre pool d'utilisateurs mais perdra l'autorisation pour ce rôle.",
    deleted: '{{name}} a été supprimé avec succès de ce rôle',
    assign_title: 'Attribuer des utilisateurs',
    assign_subtitle:
      'Attribuez des utilisateurs à ce rôle. Trouvez les utilisateurs appropriés en recherchant leur nom, leur e-mail, leur numéro de téléphone ou leur ID utilisateur.',
    assign_users_field: 'Attribuer des utilisateurs',
    confirm_assign: 'Attribuer des utilisateurs',
    users_assigned: 'Les utilisateurs sélectionnés ont été attribués avec succès à ce rôle',
    empty: 'Aucun utilisateur disponible',
  },
};

export default role_details;
