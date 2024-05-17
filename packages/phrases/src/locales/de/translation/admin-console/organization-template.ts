const organization_template = {
  title: 'Organisationsvorlage',
  subtitle:
    'In Multi-Tenant-SaaS-Anwendungen definiert eine Organisationsvorlage gemeinsame Zugriffskontrollrichtlinien (Berechtigungen und Rollen) für mehrere Organisationen.',
  roles: {
    tab_name: 'Org Rollen',
    search_placeholder: 'Nach Rollennamen suchen',
    create_title: 'Org Rolle erstellen',
    role_column: 'Org Rolle',
    permissions_column: 'Berechtigungen',
    placeholder_title: 'Organisationsrolle',
    placeholder_description:
      'Eine Organisationsrolle ist eine Gruppierung von Berechtigungen, die Benutzern zugewiesen werden können. Die Berechtigungen müssen aus den vordefinierten Organisationsberechtigungen stammen.',
    create_modal: {
      title: 'Rolle der Organisation erstellen',
      create: 'Rolle erstellen',
      name_field: 'Rollenname',
      description_field: 'Beschreibung',
      created: 'Die Organisationsrolle {{name}} wurde erfolgreich erstellt.',
    },
  },
  permissions: {
    tab_name: 'Org Berechtigungen',
    search_placeholder: 'Nach Berechtigungsnamen suchen',
    create_org_permission: 'Org Berechtigung erstellen',
    permission_column: 'Organisationsberechtigung',
    description_column: 'Beschreibung',
    placeholder_title: 'Organisationsberechtigung',
    placeholder_description:
      'Organisationsberechtigung bezieht sich auf die Autorisierung, auf eine Ressource im Kontext der Organisation zuzugreifen.',
    delete_confirm:
      'Wenn diese Berechtigung gelöscht wird, verlieren alle Organisationsrollen, die diese Berechtigung beinhalten, diese Berechtigung und Benutzer, die diese Berechtigung hatten, verlieren den Zugang, der durch sie gewährt wurde.',
    create_title: 'Erstellen von Organisationsberechtigungen',
    edit_title: 'Bearbeiten von Organisationsberechtigungen',
    permission_field_name: 'Berechtigungsname',
    description_field_name: 'Beschreibung',
    description_field_placeholder: 'Terminhistorie lesen',
    create_permission: 'Berechtigung erstellen',
    created: 'Die Organisationsberechtigung {{name}} wurde erfolgreich erstellt.',
  },
};

export default Object.freeze(organization_template);
