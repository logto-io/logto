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
};
export default sign_in_experiences;
