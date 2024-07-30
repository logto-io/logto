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
  field_is_default: 'Standardrolle',
  field_is_default_description:
    'Setze diese Rolle als Standardrolle für neue Benutzer. Es können mehrere Standardrollen festgelegt werden. Dies betrifft auch die Standardrollen für Benutzer, die über die Management-API erstellt wurden.',
  type_m2m_role_tag: 'Maschine-zu-Maschine-Rolle',
  type_user_role_tag: 'Benutzerrolle',
  m2m_role_notification:
    'Weisen Sie dieser Maschinen-zu-Maschinen-Rolle eine Maschinen-zu-Maschinen-App zu, um Zugriff auf die entsprechenden API-Ressourcen zu gewähren. <a>Erstellen Sie zuerst eine Maschinen-zu-Maschinen-App</a>, wenn Sie noch keine erstellt haben.',
  permission: {
    assign_button: 'Berechtigungen zuweisen',
    assign_title: 'Berechtigungen zuweisen',
    assign_subtitle:
      'Weisen Sie dieser Rolle Berechtigungen zu. Die Rolle erhält die hinzugefügten Berechtigungen, und Benutzer mit dieser Rolle erben diese Berechtigungen.',
    assign_form_field: 'Berechtigungen zuweisen',
    added_text_one: 'Ein Berechtigung hinzugefügt',
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
    assign_title: 'Benutzer zu {{name}} zuweisen',
    assign_subtitle:
      'Finden Sie geeignete Benutzer, indem Sie nach Name, E-Mail, Telefon oder Benutzer-ID suchen.',
    assign_field: 'Benutzer zuweisen',
    confirm_assign: 'Benutzer zuweisen',
    assigned_toast_text: 'Die ausgewählten Benutzer wurden erfolgreich dieser Rolle zugewiesen',
    empty: 'Kein Benutzer verfügbar',
  },
  applications: {
    assign_button: 'Maschine-zu-Maschine-Anwendungen zuweisen',
    name_column: 'Anwendung',
    app_column: 'Maschine-zu-Maschine-Anwendung',
    description_column: 'Beschreibung',
    delete_description:
      'Es bleibt in Ihrem Anwendungspool, verliert jedoch die Autorisierung für diese Rolle.',
    deleted: '{{name}} wurde erfolgreich aus dieser Rolle entfernt',
    assign_title: 'Maschinen-zu-Maschinen-Apps zu {{name}} zuweisen',
    assign_subtitle:
      'Finden Sie geeignete Maschinen-zu-Maschinen-Apps, indem Sie nach Name, Beschreibung oder App-ID suchen.',
    assign_field: 'Maschine-zu-Maschine-Anwendungen zuweisen',
    confirm_assign: 'Maschine-zu-Maschine-Anwendungen zuweisen',
    assigned_toast_text: 'Die ausgewählten Anwendungen wurden erfolgreich dieser Rolle zugewiesen',
    empty: 'Keine Anwendung verfügbar',
  },
};

export default Object.freeze(role_details);
