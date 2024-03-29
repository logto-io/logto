const organization_template = {
  title: 'Modèle d’organisation',
  subtitle:
    'Dans les applications SaaS multi-locataires, il est courant que plusieurs organisations partagent des politiques de contrôle d’accès identiques, incluant les permissions et les rôles. Chez Logto, ce concept est désigné par "modèle d’organisation". Son utilisation simplifie le processus de construction et de conception de votre modèle d’autorisation.',
  org_roles: {
    tab_name: 'Rôles org',
    search_placeholder: 'Rechercher par nom de rôle',
    create_org_roles: 'Créer un rôle org',
    org_role_column: 'Rôle org',
    permissions_column: 'Permissions',
    placeholder_title: 'Rôle d’organisation',
    placeholder_description:
      'Un rôle d’organisation est un groupement de permissions qui peuvent être attribuées aux utilisateurs. Les permissions doivent provenir des permissions d’organisation prédéfinies.',
  },
  org_permissions: {
    tab_name: 'Permissions org',
    search_placeholder: 'Rechercher par nom de permission',
    create_org_permission: 'Créer une permission org',
    permission_column: 'Permission',
    description_column: 'Description',
    placeholder_title: 'Permission d’organisation',
    placeholder_description:
      'La permission d’organisation se réfère à l’autorisation d’accéder à une ressource dans le contexte de l’organisation.',
    delete_confirm:
      'Si cette permission est supprimée, tous les rôles d’organisation incluant cette permission perdront cette permission, et les utilisateurs qui avaient cette permission perdront l’accès accordé par celle-ci.',
  },
};

export default Object.freeze(organization_template);
