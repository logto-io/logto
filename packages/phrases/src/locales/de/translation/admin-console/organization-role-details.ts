const organization_role_details = {
  page_title: 'Organisationsrollendetails',
  back_to_org_roles: 'Zurück zu den Organisationsrollen',
  delete_confirm:
    'Dadurch werden die mit dieser Rolle verbundenen Berechtigungen von den betroffenen Benutzern entfernt und die Beziehungen zwischen Organisationsrollen, Mitgliedern in der Organisation und Organisationsberechtigungen gelöscht.',
  deleted: 'Die Organisationsrolle {{name}} wurde erfolgreich gelöscht.',
  permissions: {
    tab: 'Berechtigungen',
    name_column: 'Berechtigung',
    description_column: 'Beschreibung',
    type_column: 'Berechtigungstyp',
    type: {
      api: 'API-Berechtigung',
      org: 'Organisationsberechtigung',
    },
    assign_permissions: 'Berechtigungen zuweisen',
    remove_permission: 'Berechtigung entfernen',
    remove_confirmation:
      'Wenn diese Berechtigung entfernt wird, verliert der Benutzer mit dieser Organisationsrolle den Zugriff, der durch diese Berechtigung gewährt wurde.',
    removed: 'Die Berechtigung {{name}} wurde erfolgreich aus dieser Organisationsrolle entfernt',
    assign_description:
      'Weisen Sie Berechtigungen den Rollen innerhalb dieser Organisation zu. Diese können sowohl Organisationsberechtigungen als auch API-Berechtigungen umfassen.',
    organization_permissions: 'Organisationsberechtigungen',
    api_permissions: 'API-Berechtigungen',
    assign_organization_permissions: 'Organisationsberechtigungen zuweisen',
    assign_api_permissions: 'API-Berechtigungen zuweisen',
  },
  general: {
    tab: 'Allgemein',
    settings: 'Einstellungen',
    description:
      'Die Organisationsrolle ist eine Gruppierung von Berechtigungen, die Benutzern zugewiesen werden können. Die Berechtigungen können aus den vordefinierten Organisationsberechtigungen und API-Berechtigungen stammen.',
    name_field: 'Name',
    description_field: 'Beschreibung',
    description_field_placeholder: 'Benutzer mit nur Leseberechtigungen',
  },
};

export default Object.freeze(organization_role_details);
