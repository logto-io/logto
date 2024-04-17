const organization_role_details = {
  page_title: "Détails du rôle de l'organisation",
  back_to_org_roles: "Retour aux rôles de l'organisation",
  org_role: "Rôle de l'organisation",
  delete_confirm:
    "Cela supprimera les autorisations associées à ce rôle des utilisateurs concernés et supprimera les relations entre les rôles de l'organisation, les membres de l'organisation et les autorisations de l'organisation.",
  deleted: "Le rôle de l'organisation {{name}} a été supprimé avec succès.",
  permissions: {
    tab: 'Autorisations',
    name_column: 'Autorisation',
    description_column: 'Description',
    type_column: "Type d'autorisation",
    type: {
      api: 'Autorisation API',
      org: "Autorisation d'organisation",
    },
    assign_permissions: 'Attribuer des autorisations',
    remove_permission: 'Supprimer la permission',
    remove_confirmation:
      "Si cette permission est supprimée, l'utilisateur avec ce rôle d'organisation perdra l'accès accordé par cette permission.",
    removed: "La permission {{name}} a été supprimée avec succès de ce rôle d'organisation",
    assign_description:
      "Attribuez des autorisations aux rôles au sein de cette organisation. Celles-ci peuvent inclure à la fois des autorisations d'organisation et des autorisations d'API.",
    organization_permissions: "Autorisations de l'organisation",
    api_permissions: "Autorisations de l'API",
    assign_organization_permissions: 'Attribuer des permissions d’organisation',
    assign_api_permissions: 'Attribuer des permissions d’API',
  },
  general: {
    tab: 'Général',
    settings: 'Réglages',
    description:
      'Le rôle d’organisation est un regroupement de permissions qui peuvent être attribuées aux utilisateurs. Les permissions peuvent provenir des permissions d’organisation prédéfinies et des permissions API.',
    name_field: 'Nom',
    description_field: 'Description',
    description_field_placeholder: 'Utenti con permessi di sola visualizzazione',
  },
};

export default Object.freeze(organization_role_details);
