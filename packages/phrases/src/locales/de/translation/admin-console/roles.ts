const roles = {
  page_title: 'Rollen',
  title: 'Rollen',
  subtitle:
    'Rollen beinhalten Berechtigungen, die bestimmen, was ein Benutzer tun kann. RBAC verwendet Rollen, um Benutzern Zugriff auf Ressourcen für bestimmte Aktionen zu geben.',
  create: 'Rolle erstellen',
  role_name: 'Rollenname',
  role_type: 'Rollenart',
  show_role_type_button_text: 'Weitere Optionen anzeigen',
  hide_role_type_button_text: 'Weitere Optionen ausblenden',
  type_user: 'Benutzerrolle',
  type_machine_to_machine: 'Maschinen-zu-Maschinen-App-Rolle',
  role_description: 'Beschreibung',
  role_name_placeholder: 'Geben Sie Ihren Rollennamen ein',
  role_description_placeholder: 'Geben Sie Ihre Rollenbeschreibung ein',
  col_roles: 'Rollen',
  col_type: 'Art',
  col_description: 'Beschreibung',
  col_assigned_entities: 'Zugewiesen',
  user_counts: '{{count}} Benutzer',
  application_counts: '{{count}} Apps',
  user_count: '{{count}} Benutzer',
  application_count: '{{count}} App',
  assign_permissions: 'Berechtigungen zuweisen',
  create_role_title: 'Rolle erstellen',
  create_role_description:
    'Erstellen und verwalten Sie Rollen für Ihre Anwendungen. Rollen enthalten Sammlungen von Berechtigungen und können Benutzern zugewiesen werden.',
  create_role_button: 'Rolle erstellen',
  role_created: 'Die Rolle {{name}} wurde erfolgreich erstellt.',
  search: 'Nach Rollennamen, Beschreibung oder ID suchen',
  placeholder_title: 'Rollen',
  placeholder_description:
    'Rollen sind eine Gruppierung von Berechtigungen, die Benutzern zugewiesen werden können. Stellen Sie sicher, dass Sie zuerst Berechtigungen hinzufügen, bevor Sie Rollen erstellen.',
  assign_user_roles: 'Benutzerrollen zuweisen',
  assign_m2m_roles: 'Maschinenrollen zuweisen',
  management_api_access_notification:
    'Für den Zugriff auf die Logto-Verwaltungs-API wählen Sie Rollen mit Verwaltungs-API-Berechtigungen <flag/> aus.',
  with_management_api_access_tip:
    'Diese Maschinenrollen umfassen Berechtigungen für die Logto-Verwaltungs-API',
};

export default Object.freeze(roles);
