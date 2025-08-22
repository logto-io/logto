const sign_in_experiences = {
  empty_content_url_of_terms_of_use:
    'Leere "Nutzungsbedingungen" URL. Bitte füge die URL hinzu, wenn "Nutzungsbedingungen" aktiviert ist.',
  empty_social_connectors:
    'Leere Social Connectors. Bitte füge aktivierte Social Connectoren hinzu, wenn Social Anmeldung aktiviert ist.',
  enabled_connector_not_found: 'Aktivierter {{type}} Connector nicht gefunden.',
  not_one_and_only_one_primary_sign_in_method:
    'Es darf nur eine primäre Anmeldemethode geben. Bitte überprüfe deine Eingabe.',
  username_requires_password:
    'Muss ein Passwort für den Benutzernamen zur Registrierung aktivieren.',
  passwordless_requires_verify:
    'Muss die Verifizierung für die Registrierung per E-Mail/Telefon aktivieren.',
  miss_sign_up_identifier_in_sign_in:
    'Anmeldeverfahren müssen den Registrierungs-Identifier enthalten.',
  password_sign_in_must_be_enabled:
    'Die Passwort-Anmeldung muss aktiviert sein, wenn bei der Registrierung ein Passwort festgelegt wird.',
  code_sign_in_must_be_enabled:
    'Die Anmeldung mit Bestätigungscode muss aktiviert sein, wenn bei der Registrierung kein Passwort festgelegt wird.',
  unsupported_default_language: 'Die Sprache - {{language}} wird momentan nicht unterstützt.',
  at_least_one_authentication_factor:
    'Sie müssen mindestens einen Authentifizierungsfaktor auswählen.',
  backup_code_cannot_be_enabled_alone: 'Backup-Code kann nicht alleine aktiviert werden.',
  duplicated_mfa_factors: 'Duplizierte MFA-Faktoren.',
  email_verification_code_cannot_be_used_for_mfa:
    'E-Mail-Bestätigungscode kann nicht für MFA verwendet werden, wenn die E-Mail-Bestätigung für die Anmeldung aktiviert ist.',
  phone_verification_code_cannot_be_used_for_mfa:
    'SMS-Bestätigungscode kann nicht für MFA verwendet werden, wenn die SMS-Bestätigung für die Anmeldung aktiviert ist.',
  email_verification_code_cannot_be_used_for_sign_in:
    'E-Mail-Verifizierungscode kann nicht für die Anmeldung verwendet werden, wenn er für MFA aktiviert ist.',
  phone_verification_code_cannot_be_used_for_sign_in:
    'SMS-Verifizierungscode kann nicht für die Anmeldung verwendet werden, wenn er für MFA aktiviert ist.',
  duplicated_sign_up_identifiers: 'Doppelte Anmeldekennungen erkannt.',
  missing_sign_up_identifiers: 'Primäre Anmeldekennung darf nicht leer sein.',
  invalid_custom_email_blocklist_format:
    'Ungültige benutzerdefinierte E-Mail-Sperrlistenpunkte: {{items, list(type:conjunction)}}. Jedes Element muss eine gültige E-Mail-Adresse oder Domain sein, z. B. foo@example.com oder @example.com.',
  forgot_password_method_requires_connector:
    'Die Methode zum Zurücksetzen des Passworts erfordert einen entsprechenden {{method}} Connector.',
};

export default Object.freeze(sign_in_experiences);
