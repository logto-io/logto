const user_details = {
  page_title: 'Benutzerdetails',
  back_to_users: 'Zurück zur Benutzerverwaltung',
  created_title: 'Der Benutzer wurde erfolgreich erstellt',
  created_guide: 'Sende dem Benutzer folgende Anmeldeinformationen',
  created_username: 'Benutzername:',
  created_password: 'Passwort:',
  menu_delete: 'Löschen',
  delete_description:
    'Diese Aktion kann nicht rückgängig gemacht werden. Der Benutzer wird permanent gelöscht.',
  deleted: 'Der Benutzer wurde erfolgreich gelöscht',
  reset_password: {
    reset_password: 'Passwort zurücksetzen',
    title: 'Willst du das Passwort wirklich zurücksetzen?',
    content:
      'Diese Aktion kann nicht rückgängig gemacht werden. Das Anmeldeinformationen werden zurückgesetzt.',
    congratulations: 'Der Benutzer wurde erfolgreich zurückgesetzt',
    new_password: 'Neues Passwort:',
  },
  tab_settings: 'Einstellungen',
  tab_roles: 'Rollen',
  tab_logs: 'Benutzer-Logs',
  settings: 'Einstellungen',
  settings_description:
    'Jeder Benutzer hat ein Profil mit allen Benutzerinformationen. Es besteht aus Basisdaten, sozialen Identitäten und benutzerdefinierten Daten.',
  field_email: 'Primäre E-Mail',
  field_phone: 'Primäre Telefonnummer',
  field_username: 'Benutzername',
  field_name: 'Name',
  field_avatar: 'Profilbild URL',
  field_avatar_placeholder: 'https://dein.cdn.domain/profilbild.png',
  field_custom_data: 'Benutzerdefinierte Daten',
  field_custom_data_tip:
    'Zusätzliche Benutzerinformationen, die nicht in den vordefinierten Benutzereigenschaften aufgeführt sind, wie z. B. die vom Benutzer bevorzugte Farbe und Sprache.',
  field_connectors: 'Social Connections',
  custom_data_invalid: 'Benutzerdefinierte Daten müssen ein gültiges JSON-Objekt sein.',
  connectors: {
    connectors: 'Connectoren',
    user_id: 'Benutzer ID',
    remove: 'Löschen',
    not_connected: 'Der Nutzer ist nicht mit einem Social Connector verbunden',
    deletion_confirmation:
      'Du entfernst die bestehende <name/> Identität. Bist du sicher, dass du das tun willst?',
  },
  suspended: 'Gesperrt',
  roles: {
    name_column: 'Rolle',
    description_column: 'Beschreibung',
    assign_button: 'Rollen zuweisen',
    delete_description:
      'Diese Aktion entfernt diese Rolle von diesem Benutzer. Die Rolle selbst bleibt erhalten, aber sie wird nicht mehr mit diesem Benutzer verknüpft sein.',
    deleted: '{{name}} wurde erfolgreich von diesem Benutzer entfernt.',
    assign_title: 'Rollen an {{name}} zuweisen',
    assign_subtitle: '{{name}} eine oder mehrere Rollen zuweisen',
    assign_role_field: 'Rollen zuweisen',
    role_search_placeholder: 'Nach Rollennamen suchen',
    added_text: '{{value, number}} hinzugefügt',
    assigned_user_count: '{{value, number}} Benutzer',
    confirm_assign: 'Rollen zuweisen',
    role_assigned: 'Rolle(n) erfolgreich zugewiesen',
    search: 'Nach Rollennamen, Beschreibung oder ID suchen',
    empty: 'Keine Rolle verfügbar',
  },
};

export default user_details;
