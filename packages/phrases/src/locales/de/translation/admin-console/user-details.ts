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
    reset_title: 'Willst du das Passwort wirklich zurücksetzen?',
    generate_title: 'Möchten Sie wirklich ein Passwort generieren?',
    content:
      'Diese Aktion kann nicht rückgängig gemacht werden. Das Anmeldeinformationen werden zurückgesetzt.',
    reset_complete: 'Der Benutzer wurde erfolgreich zurückgesetzt',
    generate_complete: 'Das Passwort wurde generiert',
    new_password: 'Neues Passwort:',
    password: 'Passwort:',
  },
  tab_settings: 'Einstellungen',
  tab_roles: 'Benutzerrollen',
  tab_logs: 'Benutzer-Logs',
  tab_organizations: 'Organisationen',
  authentication: 'Authentifizierung',
  authentication_description:
    'Jeder Benutzer hat ein Profil mit allen Benutzerinformationen. Es besteht aus Basisdaten, sozialen Identitäten und benutzerdefinierten Daten.',
  user_profile: 'Benutzerprofil',
  field_email: 'E-Mail-Adresse',
  field_phone: 'Telefonnummer',
  field_username: 'Benutzername',
  field_password: 'Passwort',
  field_name: 'Name',
  field_avatar: 'Profilbild URL',
  field_avatar_placeholder: 'https://dein.cdn.domain/profilbild.png',
  field_custom_data: 'Benutzerdefinierte Daten',
  field_custom_data_tip:
    'Zusätzliche Benutzerinformationen, die nicht in den vordefinierten Benutzereigenschaften aufgeführt sind, wie z. B. die vom Benutzer bevorzugte Farbe und Sprache.',
  field_profile: 'Profil',
  field_profile_tip:
    'Zusätzliche OpenID Connect-Ansprüche, die nicht in den Benutzereigenschaften enthalten sind. Beachten Sie, dass alle unbekannten Eigenschaften entfernt werden. Weitere Informationen finden Sie in der <a>Profil-Eigenschaftsreferenz</a>.',
  field_connectors: 'Soziale Verbindungen',
  field_sso_connectors: 'Unternehmensverbindungen',
  custom_data_invalid: 'Benutzerdefinierte Daten müssen ein gültiges JSON-Objekt sein.',
  profile_invalid: 'Profil muss ein gültiges JSON-Objekt sein',
  password_already_set: 'Passwort bereits gesetzt',
  no_password_set: 'Kein Passwort gesetzt',
  connectors: {
    connectors: 'Verbindungen',
    user_id: 'Benutzer ID',
    remove: 'Löschen',
    connected: 'Dieser Benutzer ist mit mehreren sozialen Verbindern verbunden.',
    not_connected: 'Der Benutzer ist nicht mit einem sozialen Verbindungsgerät verbunden',
    deletion_confirmation:
      'Sie entfernen die bestehende Identität <name/>. Möchten Sie den Vorgang wirklich fortsetzen?',
  },
  sso_connectors: {
    connectors: 'Verbindungen',
    enterprise_id: 'Unternehmens-ID',
    connected:
      'Dieser Benutzer ist mit mehreren Enterprise-Identitätsanbietern für Single Sign-On verbunden.',
    not_connected:
      'Der Benutzer ist nicht mit einem Unternehmensidentitätsanbieter für Single Sign-On verbunden.',
  },
  mfa: {
    field_name: 'Zwei-Faktor-Authentifizierung',
    field_description: 'Dieser Benutzer hat 2-Stufen-Authentifizierungsfaktoren aktiviert.',
    name_column: 'Zwei-Faktor',
    field_description_empty:
      'Dieser Benutzer hat keine zweistufigen Authentifizierungsfaktoren aktiviert.',
    deletion_confirmation:
      'Sie entfernen die bestehende <name/> für die Zwei-Faktor-Authentifizierung. Sind Sie sicher, dass Sie fortfahren möchten?',
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
    name_column: 'Benutzerrolle',
    description_column: 'Beschreibung',
    assign_button: 'Rollen zuweisen',
    delete_description:
      'Diese Aktion entfernt diese Rolle von diesem Benutzer. Die Rolle selbst bleibt erhalten, aber sie wird nicht mehr mit diesem Benutzer verknüpft sein.',
    deleted: '{{name}} wurde erfolgreich von diesem Benutzer entfernt.',
    assign_title: 'Rollen zuweisen zu {{name}}',
    assign_subtitle:
      'Finden Sie die passenden Benutzerrollen, indem Sie nach Name, Beschreibung oder Rollen-ID suchen.',
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
  personal_access_tokens: {
    title: 'Persönliches Zugriffstoken',
    title_other: 'Persönliche Zugriffstokens',
    title_short: 'Token',
    empty: 'Der Benutzer hat keine persönlichen Zugriffstokens.',
    create: 'Neues Token erstellen',
    tip: 'Persönliche Zugriffstokens (PATs) bieten eine sichere Möglichkeit, Nutzern Zugriffstokens zu gewähren, ohne ihre Anmeldedaten und interaktive Anmeldung zu nutzen. Dies ist nützlich für CI/CD, Skripte oder Anwendungen, die programmatisch auf Ressourcen zugreifen müssen.',
    value: 'Wert',
    created_at: 'Erstellt am',
    expires_at: 'Läuft ab am',
    never: 'Niemals',
    create_new_token: 'Neues Token erstellen',
    delete_confirmation:
      'Diese Aktion kann nicht rückgängig gemacht werden. Sind Sie sicher, dass Sie dieses Token löschen möchten?',
    expired: 'Abgelaufen',
    expired_tooltip: 'Dieses Token ist am {{date}} abgelaufen.',
    create_modal: {
      title: 'Persönliches Zugriffstoken erstellen',
      expiration: 'Ablauf',
      expiration_description: 'Das Token läuft am {{date}} ab.',
      expiration_description_never:
        'Das Token läuft nie ab. Wir empfehlen, ein Ablaufdatum für verbesserte Sicherheit festzulegen.',
      days: '{{count}} Tag',
      days_other: '{{count}} Tage',
      created: 'Das Token {{name}} wurde erfolgreich erstellt.',
    },
    edit_modal: {
      title: 'Persönliches Zugriffstoken bearbeiten',
      edited: 'Das Token {{name}} wurde erfolgreich bearbeitet.',
    },
  },
  connections: {
    title: 'Verbindung',
    description:
      'Der Benutzer verknüpft Drittanbieterkonten für die Anmeldung über soziale Netzwerke, Enterprise SSO oder den Zugriff auf Ressourcen.',
    token_status_column: 'Token-Status',
    token_status: {
      active: 'Aktiv',
      expired: 'Abgelaufen',
      inactive: 'Inaktiv',
      not_applicable: 'Nicht zutreffend',
      available: 'Verfügbar',
      not_available: 'Nicht verfügbar',
    },
  },
};

export default Object.freeze(user_details);
