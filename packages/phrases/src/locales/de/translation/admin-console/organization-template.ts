const organization_template = {
  title: 'Organisationsvorlage',
  subtitle:
    'In Multi-Tenant-SaaS-Anwendungen ist es üblich, dass mehrere Organisationen identische Zugriffskontrollrichtlinien teilen, einschließlich Berechtigungen und Rollen. In Logto wird dieses Konzept als "Organisationsvorlage" bezeichnet. Ihre Verwendung vereinfacht den Prozess des Aufbaus und Entwurfs Ihres Autorisierungsmodells.',
  org_roles: {
    tab_name: 'Org Rollen',
    search_placeholder: 'Nach Rollennamen suchen',
    create_org_roles: 'Org Rolle erstellen',
    org_role_column: 'Org Rolle',
    permissions_column: 'Berechtigungen',
    placeholder_title: 'Organisationsrolle',
    placeholder_description:
      'Eine Organisationsrolle ist eine Gruppierung von Berechtigungen, die Benutzern zugewiesen werden können. Die Berechtigungen müssen aus den vordefinierten Organisationsberechtigungen stammen.',
  },
  org_permissions: {
    tab_name: 'Org Berechtigungen',
    search_placeholder: 'Nach Berechtigungsnamen suchen',
    create_org_permission: 'Org Berechtigung erstellen',
    permission_column: 'Berechtigung',
    description_column: 'Beschreibung',
    placeholder_title: 'Organisationsberechtigung',
    placeholder_description:
      'Organisationsberechtigung bezieht sich auf die Autorisierung, auf eine Ressource im Kontext der Organisation zuzugreifen.',
    delete_confirm:
      'Wenn diese Berechtigung gelöscht wird, verlieren alle Organisationsrollen, die diese Berechtigung beinhalten, diese Berechtigung und Benutzer, die diese Berechtigung hatten, verlieren den Zugang, der durch sie gewährt wurde.',
  },
};

export default Object.freeze(organization_template);
