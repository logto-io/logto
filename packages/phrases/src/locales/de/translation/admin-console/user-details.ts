const user_details = {
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
  tab_settings: 'Settings', // UNTRANSLATED
  tab_roles: 'Roles', // UNTRANSLATED
  tab_logs: 'Benutzer-Logs',
  settings: 'Settings', // UNTRANSLATED
  settings_description:
    'Each user has a profile containing all user information. It consists of basic data, social identities, and custom data.', // UNTRANSLATED
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
  suspended: 'Suspended', // UNTRANSLATED
  roles: {
    name_column: 'Role', // UNTRANSLATED
    description_column: 'Description', // UNTRANSLATED
    assign_button: 'Assign Roles', // UNTRANSLATED
    delete_description: 'TBD', // UNTRANSLATED
    deleted: 'The role {{name}} has been successfully deleted from the user.', // UNTRANSLATED
  },
};

export default user_details;
