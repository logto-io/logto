const role_details = {
  back_to_roles: 'Zurück zu Rollen',
  identifier: 'Identifikator',
  delete_description:
    'Dadurch werden die mit dieser Rolle verbundenen Berechtigungen von den betroffenen Benutzern entfernt und die Zuordnung zwischen Rollen, Benutzern und Berechtigungen gelöscht.',
  role_deleted: '{{name}} wurde erfolgreich gelöscht!',
  settings_tab: 'Einstellungen',
  users_tab: 'Benutzer',
  permissions_tab: 'Berechtigungen',
  settings: 'Einstellungen',
  settings_description:
    'Rollen sind eine Gruppierung von Berechtigungen, die Benutzern zugewiesen werden können. Sie ermöglichen auch eine Zusammenfassung von Berechtigungen, die für verschiedene APIs definiert wurden, was es effizienter macht, Berechtigungen im Vergleich zur individuellen Zuweisung an Benutzer hinzuzufügen, zu entfernen oder zu ändern.',
  field_name: 'Name',
  field_description: 'Beschreibung',
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
    assign_users_field: 'Benutzer zuweisen',
    confirm_assign: 'Benutzer zuweisen',
    users_assigned: 'Die ausgewählten Benutzer wurden dieser Rolle erfolgreich zugewiesen',
    empty: 'Kein Benutzer verfügbar',
  },
};

export default role_details;
