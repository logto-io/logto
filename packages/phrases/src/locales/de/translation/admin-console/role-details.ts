const role_details = {
  back_to_roles: 'Zurück zu Rollen',
  identifier: 'Identifikator',
  delete_description:
    'Dadurch werden die mit dieser Rolle verbundenen Berechtigungen von den betroffenen Benutzern entfernt und die Zuordnung zwischen Rollen, Benutzern und Berechtigungen gelöscht.',
  role_deleted: '{{name}} wurde erfolgreich gelöscht.',
  general_tab: 'Allgemein',
  users_tab: 'Benutzer',
  m2m_apps_tab: 'Maschinen-zu-Maschinen-Apps',
  permissions_tab: 'Berechtigungen',
  settings: 'Einstellungen',
  settings_description:
    'Rollen sind eine Gruppierung von Berechtigungen, die Benutzern zugewiesen werden können. Sie ermöglichen auch eine Zusammenfassung von Berechtigungen, die für verschiedene APIs definiert wurden, was es effizienter macht, Berechtigungen im Vergleich zur individuellen Zuweisung an Benutzer hinzuzufügen, zu entfernen oder zu ändern.',
  field_name: 'Name',
  field_description: 'Beschreibung',
  type_m2m_role_tag: 'Maschinen-zu-Maschinen-App-Rolle',
  type_user_role_tag: 'Benutzerrolle',
  permission: {
    assign_button: 'Berechtigungen zuweisen',
    assign_title: 'Berechtigungen zuweisen',
    assign_subtitle:
      'Weisen Sie dieser Rolle Berechtigungen zu. Die Rolle erhält die hinzugefügten Berechtigungen, und Benutzer mit dieser Rolle erben diese Berechtigungen.',
    assign_form_field: 'Berechtigungen zuweisen',
    added_text_one: '{{count, number}} Berechtigung hinzugefügt',
    added_text_other: '{{count, number}} Berechtigungen hinzugefügt',
    api_permission_count_one: '{{count, number}} Berechtigung',
    api_permission_count_other: '{{count, number}} Berechtigungen',
    confirm_assign: 'Berechtigungen zuweisen',
    permission_assigned:
      'Die ausgewählten Berechtigungen wurden dieser Rolle erfolgreich zugewiesen',
    deletion_description:
      'Wenn diese Berechtigung entfernt wird, verliert der betroffene Benutzer mit dieser Rolle den Zugriff, der durch diese Berechtigung gewährt wurde.',
    permission_deleted: 'Die Berechtigung "{{name}}" wurde erfolgreich von dieser Rolle entfernt',
    empty: 'Keine Berechtigung verfügbar',
  },
  users: {
    assign_button: 'Benutzer zuweisen',
    name_column: 'Benutzer',
    app_column: 'App',
    latest_sign_in_column: 'Letzte Anmeldung',
    delete_description:
      'Es bleibt in Ihrer Benutzergruppe, aber verliert die Autorisierung für diese Rolle.',
    deleted: '{{name}} wurde erfolgreich von dieser Rolle entfernt',
    assign_title: 'Benutzer zuweisen',
    assign_subtitle:
      'Weisen Sie Benutzer dieser Rolle zu. Finden Sie geeignete Benutzer, indem Sie nach Name, E-Mail, Telefon oder Benutzer-ID suchen.',
    assign_field: 'Benutzer zuweisen',
    confirm_assign: 'Benutzer zuweisen',
    assigned_toast_text: 'Die ausgewählten Benutzer wurden erfolgreich dieser Rolle zugewiesen',
    empty: 'Kein Benutzer verfügbar',
  },
  applications: {
    assign_button: 'Apps zuweisen',
    name_column: 'Anwendung',
    app_column: 'Apps',
    description_column: 'Beschreibung',
    delete_description:
      'Es bleibt in Ihrem Anwendungspool, verliert jedoch die Autorisierung für diese Rolle.',
    deleted: '{{name}} wurde erfolgreich aus dieser Rolle entfernt',
    assign_title: 'Apps zuweisen',
    assign_subtitle:
      'Weisen Sie dieser Rolle Anwendungen zu. Finden Sie geeignete Anwendungen, indem Sie nach Name, Beschreibung oder App-ID suchen.',
    assign_field: 'Apps zuweisen',
    confirm_assign: 'Apps zuweisen',
    assigned_toast_text: 'Die ausgewählten Anwendungen wurden erfolgreich dieser Rolle zugewiesen',
    empty: 'Keine Anwendung verfügbar',
  },
};

export default Object.freeze(role_details);
