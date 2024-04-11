const organization_role_details = {
  page_title: "Détails du rôle de l'organisation",
  back_to_org_roles: "Retour aux rôles de l'organisation",
  org_role: "Rôle de l'organisation",
  delete_confirm:
    "Cela supprimera les autorisations associées à ce rôle des utilisateurs concernés et supprimera les relations entre les rôles de l'organisation, les membres de l'organisation et les autorisations de l'organisation.",
  deleted: "Le rôle d'organisation {{name}} a été supprimé avec succès.",
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
  },
  general: {
    tab: 'Général',
    settings: 'Réglages',
    description:
      "Le rôle d'organisation est un regroupement de permissions qui peuvent être attribuées aux utilisateurs. Les permissions doivent provenir des permissions d'organisation prédéfinies.",
    name_field: 'Nom',
    description_field: 'Description',
    description_field_placeholder: 'Utenti con permessi di sola visualizzazione',
  },
};

export default Object.freeze(organization_role_details);
