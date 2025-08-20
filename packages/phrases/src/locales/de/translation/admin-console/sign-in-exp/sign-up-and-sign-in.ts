const sign_up_and_sign_in = {
  identifiers_email: 'E-Mail Adresse',
  identifiers_phone: 'Telefonnummer',
  identifiers_username: 'Benutzername',
  identifiers_email_or_sms: 'E-Mail Adresse oder Telefonnummer',
  identifiers_none: 'Nicht zutreffend',
  and: 'und',
  or: 'oder',
  sign_up: {
    title: 'ANMELDEN',
    sign_up_identifier: 'Anmeldeidentifier',
    identifier_description:
      'Alle ausgewählten Anmeldekennungen sind erforderlich, wenn ein neues Konto erstellt wird.',
    sign_up_authentication: 'Authentifizierungseinstellung für die Anmeldung',
    verification_tip:
      'Benutzer müssen die von dir konfigurierte E-Mail-Adresse oder Telefonnummer durch Eingabe eines Bestätigungscodes bei der Anmeldung überprüfen.',
    authentication_description:
      'Alle ausgewählten Aktionen sind für Benutzer verpflichtend, um den Vorgang abzuschließen.',
    set_a_password_option: 'Erstellen Sie Ihr Passwort',
    verify_at_sign_up_option: 'Bei Anmeldung überprüfen',
    social_only_creation_description: '(Dies gilt nur für die Erstellung von Social-Accounts)',
  },
  sign_in: {
    title: 'ANMELDEN',
    sign_in_identifier_and_auth: 'Anmeldeidentifier und Authentifizierungseinstellungen',
    description: 'Benutzer können sich über jede der verfügbaren Optionen anmelden.',
    add_sign_in_method: 'Anmeldemethode hinzufügen',
    add_sign_up_method: 'Anmeldemethode hinzufügen',
    password_auth: 'Passwort',
    verification_code_auth: 'Verifizierungscode',
    auth_swap_tip:
      'Tauschen Sie die untenstehenden Optionen aus, um zu bestimmen, welche zuerst im Vorgang angezeigt wird.',
    require_auth_factor: 'Sie müssen mindestens einen Authentifizierungsfaktor auswählen.',
    forgot_password_verification_method: 'Passwort-vergessen Verifizierungsmethode',
    forgot_password_description:
      'Benutzer können ihr Passwort mit jeder verfügbaren Verifizierungsmethode zurücksetzen.',
    add_verification_method: 'Verifizierungsmethode hinzufügen',
    email_verification_code: 'E-Mail-Verifizierungscode',
    phone_verification_code: 'Telefonverifizierungscode',
  },
  social_sign_in: {
    title: 'ANMELDEN MIT SOCIAL MEDIA',
    social_sign_in: 'Anmelden mit Social Media',
    description:
      'Abhängig von der obligatorischen Identifizierung, die Sie eingerichtet haben, wird Ihr Benutzer möglicherweise aufgefordert, bei der Anmeldung über den Social Connector eine Identifizierung bereitzustellen.',
    add_social_connector: 'Sozialen Connector hinzufügen',
    set_up_hint: {
      not_in_list: 'Nicht in der Liste?',
      set_up_more: 'Einrichten',
      go_to: 'andere Social Connectors jetzt.',
    },
    automatic_account_linking: 'Automatische Kontoverknüpfung',
    automatic_account_linking_label:
      'Wenn diese Option aktiviert ist und sich ein Benutzer mit einer dem System neuen sozialen Identität anmeldet und genau ein vorhandenes Konto mit demselben Identifier (z. B. E-Mail) vorhanden ist, wird Logto das Konto automatisch mit der sozialen Identität verknüpfen, anstatt den Benutzer zur Kontoverknüpfung aufzufordern.',
  },
  tip: {
    set_a_password: 'Ein einmaliges Passwort für Ihren Benutzernamen ist ein Muss.',
    verify_at_sign_up:
      'Wir unterstützen derzeit nur überprüfte E-Mails. Ihre Benutzerbasis kann eine große Anzahl von E-Mail-Adressen von schlechter Qualität enthalten, wenn keine Validierung vorliegt.',
    password_auth:
      'Dies ist unerlässlich, da Sie die Option zum Setzen eines Passworts während des Anmeldeprozesses aktiviert haben.',
    verification_code_auth:
      'Dies ist unerlässlich, da Sie nur die Möglichkeit aktiviert haben, einen Verifizierungscode bei der Anmeldung bereitzustellen. Sie können das Kontrollkästchen deaktivieren, wenn die Passworteinrichtung im Anmeldeprozess erlaubt ist.',
    email_mfa_enabled:
      'E-Mail-Verifizierungscode ist bereits für MFA aktiviert, daher kann er nicht als primäre Anmeldemethode wiederverwendet werden, um die Sicherheit zu gewährleisten.',
    phone_mfa_enabled:
      'Telefonverifizierungscode ist bereits für MFA aktiviert, daher kann er nicht als primäre Anmeldemethode wiederverwendet werden, um die Sicherheit zu gewährleisten.',
    delete_sign_in_method:
      'Dies ist unerlässlich, da Sie {{identifier}} als obligatorischen Identifier ausgewählt haben.',
    password_disabled_notification:
      'Die Option "Erstellen Sie Ihr Passwort" ist für die Anmeldung mit Benutzername deaktiviert, was Benutzer daran hindern könnte, sich anzumelden. Bestätigen Sie, um mit dem Speichern fortzufahren.',
  },
  advanced_options: {
    title: 'ERWEITERTE OPTIONEN',
    enable_single_sign_on: 'Enterprise-Single Sign-On (SSO) aktivieren',
    enable_single_sign_on_description:
      'Aktivieren Sie Benutzer, sich bei der Anwendung mit Single Sign-On mit ihren Unternehmens-Identitäten anzumelden.',
    single_sign_on_hint: {
      prefix: 'Gehe zu ',
      link: 'Abschnitt "Enterprise SSO"',
      suffix: ', um weitere Unternehmens-Connectors einzurichten.',
    },
    enable_user_registration: 'Benutzerregistrierung aktivieren',
    enable_user_registration_description:
      'Aktivieren oder deaktivieren Sie die Benutzerregistrierung. Sobald deaktiviert, können Benutzer immer noch über die Admin-Konsole hinzugefügt werden, aber Benutzer können keine Konten mehr über die Anmelde-Benutzeroberfläche einrichten.',
    unknown_session_redirect_url: 'Unbekannte Sitzungsumleitungs-URL',
    unknown_session_redirect_url_tip:
      'Manchmal kann Logto eine Benutzersitzung auf der Anmeldeseite nicht erkennen, z. B. wenn eine Sitzung abläuft oder der Benutzer den Anmeldelink zu den Lesezeichen hinzufügt oder teilt. Standardmäßig erscheint ein 404-Fehler "Unbekannte Sitzung". Um die Benutzererfahrung zu verbessern, legen Sie eine Fallback-URL fest, um Benutzer zurück zu Ihrer App zu leiten und die Authentifizierung neu zu starten.',
  },
};

export default Object.freeze(sign_up_and_sign_in);
