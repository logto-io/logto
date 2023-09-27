const user_details = {
  page_title: 'Benutzerdetails',
  back_to_users: 'Zurück zur Benutzerverwaltung',
  created_title: 'Der Benutzer wurde erfolgreich erstellt',
  created_guide: 'Hier sind die Informationen, um dem Benutzer bei der Anmeldung zu helfen.',
  created_email: 'E-Mail-Adresse:',
  created_phone: 'Telefonnummer:',
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
  field_email: 'E-Mail-Adresse',
  field_phone: 'Telefonnummer',
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
      'Du entfernst die bestehende <name/> Identität. Bist du sicher, dass du das tun möchtest?',
  },
  mfa: {
    field_name: 'Zwei-Faktor-Authentifizierung',
    field_description: 'Dieser Benutzer hat 2-Stufen-Authentifizierungsfaktoren aktiviert.',
    name_column: 'Zwei-Faktor',
    field_description_empty:
      'Dieser Benutzer hat keine zweistufigen Authentifizierungsfaktoren aktiviert.',
    deletion_confirmation:
      'Sie entfernen den bestehenden <name/> für den zweistufigen Authentifikator. Sind Sie sicher, dass Sie das tun möchten?',
  },
  suspended: 'Gesperrt',
  suspend_user: 'Benutzer sperren',
  suspend_user_reminder:
    'Sind Sie sicher, dass Sie diesen Benutzer sperren möchten? Der Benutzer kann sich nicht bei Ihrer App anmelden und kann nach Ablauf des aktuellen Tokens kein neues Zugriffstoken mehr erhalten. Außerdem schlagen alle API-Anforderungen von diesem Benutzer fehl.',
  suspend_action: 'Sperren',
  user_suspended: 'Benutzer wurde gesperrt.',
  reactivate_user: 'Benutzer entsperren',
  reactivate_user_reminder:
    'Sind Sie sicher, dass Sie diesen Benutzer wieder aktivieren möchten? Dadurch werden alle Anmeldeversuche für diesen Benutzer ermöglicht.',
  reactivate_action: 'Aktivieren',
  user_reactivated: 'Benutzer wurde aktiviert.',
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
  warning_no_sign_in_identifier:
    'Der Benutzer muss mindestens einen der Anmelde-Identifikatoren (Benutzername, E-Mail, Telefonnummer oder soziales Konto) haben, um sich anzumelden. Sind Sie sicher, dass Sie fortfahren möchten?',
};

export default Object.freeze(user_details);
