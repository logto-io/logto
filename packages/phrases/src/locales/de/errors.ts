const errors = {
  request: {
    invalid_input: 'Eingabe ist ungültig. {{details}}',
    general: 'Es ist ein Fehler bei der Anfrage aufgetreten.',
  },
  auth: {
    authorization_header_missing: 'Autorisierungs-Header fehlt.',
    authorization_token_type_not_supported: 'Autorisierungs-Typ wird nicht unterstützt.',
    unauthorized: 'Unautorisiert. Bitte überprüfe deine Zugangsdaten.',
    forbidden: 'Verboten. Bitte überprüfe deine Rollen und Berechtigungen.',
    expected_role_not_found:
      'Erwartete Rolle nicht gefunden. Bitte überprüfe deine Rollen und Berechtigungen.',
    jwt_sub_missing: '`sub` fehlt in JWT.',
    require_re_authentication:
      'Zur Durchführung einer geschützten Aktion ist eine erneute Authentifizierung erforderlich.',
  },
  guard: {
    invalid_input: 'Die Anfrage {{type}} ist ungültig.',
    invalid_pagination: 'Die Paginierung der Anfrage ist ungültig.',
    can_not_get_tenant_id: 'Die tenant_id konnte nicht aus der Anfrage abgerufen werden.',
    file_size_exceeded: 'Dateigröße überschritten.',
    mime_type_not_allowed: 'Der MIME-Typ ist nicht erlaubt.',
  },
  oidc: {
    aborted: 'Der Endnutzer hat die Interaktion abgebrochen.',
    invalid_scope: 'Scope {{scope}} wird nicht unterstützt.',
    invalid_scope_plural: 'Scopes {{scopes}} werden nicht unterstützt.',
    invalid_token: 'Ungültiger Token übermittelt.',
    invalid_client_metadata: 'Ungültige Client Metadaten übermittelt.',
    insufficient_scope: 'Access token fehlen angefragte scope {{scopes}}.',
    invalid_request: 'Anfrage ist ungültig.',
    invalid_grant: 'Grant request ist ungültig.',
    invalid_redirect_uri:
      '`redirect_uri` stimmt nicht mit den registrierten `redirect_uris` des Clients überein.',
    access_denied: 'Zugang verweigert.',
    invalid_target: 'Ungültiger resource indicator.',
    unsupported_grant_type: 'Nicht unterstützter `grant_type` angefragt.',
    unsupported_response_mode: 'Nicht unterstützter `response_mode` angefragt.',
    unsupported_response_type: 'Nicht unterstützter `response_type` angefragt.',
    provider_error: 'OIDC interner Fehler: {{message}}.',
  },
  user: {
    username_already_in_use: 'Dieser Benutzername wird bereits verwendet.',
    email_already_in_use: 'Diese E-Mail-Adresse ist mit einem vorhandenen Konto verknüpft.',
    phone_already_in_use: 'Diese Telefonnummer ist mit einem vorhandenen Konto verknüpft.',
    invalid_email: 'Ungültige E-Mail.',
    invalid_phone: 'Ungültige Telefonnummer.',
    email_not_exist: 'Die E-Mail wurde noch nicht registriert.',
    phone_not_exist: 'Die Telefonnummer wurde noch nicht registriert.',
    identity_not_exist: 'Die Identität wurde noch nicht registriert.',
    identity_already_in_use: 'Die Identität wurde registriert.',
    social_account_exists_in_profile: 'Sie haben diesen Social-Media-Account bereits verknüpft.',
    cannot_delete_self: 'Du kannst dich nicht selbst löschen.',
    sign_up_method_not_enabled: 'Diese Anmeldeart ist nicht aktiviert.',
    sign_in_method_not_enabled: 'Diese Anmeldemethode ist nicht aktiviert.',
    same_password: 'Das neue Passwort muss sich vom alten unterscheiden.',
    password_required_in_profile:
      'Sie müssen ein Passwort festlegen, bevor Sie sich anmelden können.',
    new_password_required_in_profile: 'Sie müssen ein neues Passwort festlegen.',
    password_exists_in_profile: 'Das Passwort ist bereits in Ihrem Profil vorhanden.',
    username_required_in_profile:
      'Sie müssen einen Benutzernamen festlegen, bevor Sie sich anmelden können.',
    username_exists_in_profile: 'Der Benutzername ist bereits in Ihrem Profil vorhanden.',
    email_required_in_profile:
      'Sie müssen eine E-Mail-Adresse hinzufügen, bevor Sie sich anmelden können.',
    email_exists_in_profile: 'Ihr Profil ist bereits mit einer E-Mail-Adresse verknüpft.',
    phone_required_in_profile:
      'Sie müssen eine Telefonnummer hinzufügen, bevor Sie sich anmelden können.',
    phone_exists_in_profile: 'Ihr Profil ist bereits mit einer Telefonnummer verknüpft.',
    email_or_phone_required_in_profile:
      'Sie müssen eine E-Mail-Adresse oder eine Telefonnummer hinzufügen, bevor Sie sich anmelden können.',
    suspended: 'Dieses Konto wurde gesperrt.',
    user_not_exist: 'Der Benutzer mit {{ identifier }} existiert nicht.',
    missing_profile:
      'Sie müssen zusätzliche Informationen angeben, bevor Sie sich anmelden können.',
    role_exists: 'Die Rollen-ID {{roleId}} wurde diesem Benutzer bereits hinzugefügt.',
  },
  password: {
    unsupported_encryption_method: 'Die Verschlüsselungsmethode {{name}} wird nicht unterstützt.',
    pepper_not_found: 'Password pepper not found. Please check your core envs.',
  },
  session: {
    not_found: 'Sitzung nicht gefunden. Bitte melde dich erneut an.',
    invalid_credentials: 'Ungültige Zugangsdaten. Überprüfe deine Eingaben.',
    invalid_sign_in_method: 'Aktuelle Anmeldemethode ist ungültig.',
    invalid_connector_id: 'Connector mit ID {{connectorId}} wurde nicht gefunden.',
    insufficient_info: 'Unzureichende Informationen für die Anmeldung.',
    connector_id_mismatch: 'Connector ID stimmt nicht mit Sitzung überein.',
    connector_session_not_found: 'Connector Sitzung nicht gefunden. Bitte melde dich erneut an.',
    verification_session_not_found:
      'Die Verifizierung war nicht erfolgreich. Starte die Verifizierung neu und versuche es erneut.',
    verification_expired:
      'Die Verbindung wurde unterbrochen. Verifiziere erneut, um die Sicherheit deines Kontos zu gewährleisten.',
    unauthorized: 'Bitte melde dich erst an.',
    unsupported_prompt_name: 'Nicht unterstützter prompt Name.',
    forgot_password_not_enabled: 'Forgot password is not enabled.',
    verification_failed:
      'Die Verifizierung war nicht erfolgreich. Starte die Verifizierung neu und versuche es erneut.',
    connector_validation_session_not_found:
      'Die Connector-Sitzung zur Token-Validierung wurde nicht gefunden.',
    identifier_not_found:
      'Benutzerkennung nicht gefunden. Bitte gehen Sie zurück und melden Sie sich erneut an.',
    interaction_not_found:
      'Interaktionssitzung nicht gefunden. Bitte gehen Sie zurück und starten Sie die Sitzung erneut.',
  },
  connector: {
    // UNTRANSLATED
    general: 'Fehler aufgetreten im Connector: {{errorDescription}}',
    not_found: 'Kein verfügbarer Connector für Typ {{type}} gefunden.',
    not_enabled: 'Der Connector ist nicht aktiviert.',
    invalid_metadata: 'Die Metadaten des Connectors sind ungültig.',
    invalid_config_guard: 'Die Konfiguration des Connectors ist ungültig.',
    unexpected_type: 'Der Typ des Connectors ist unerwartet.',
    invalid_request_parameters: 'Die Anfrage enthält falsche Eingabeparameter.',
    insufficient_request_parameters:
      'Die Anfrage enthält möglicherweise nicht alle erforderlichen Eingabeparameter.',
    invalid_config: 'Die Konfiguration des Connectors ist ungültig.',
    invalid_response: 'Die Antwort des Connectors ist ungültig.',
    template_not_found:
      'Die richtige Vorlage in der Connector-Konfiguration konnte nicht gefunden werden.',
    not_implemented: '{{method}}: wurde noch nicht implementiert.',
    social_invalid_access_token: 'Der Access Token des Connectors ist ungültig.',
    invalid_auth_code: 'Der Authentifizierungscode des Connectors ist ungültig.',
    social_invalid_id_token: 'Der ID-Token des Connectors ist ungültig.',
    authorization_failed: 'Der Autorisierungsprozess des Benutzers war erfolglos.',
    social_auth_code_invalid:
      'Es konnte kein Access Token abgerufen werden. Bitte prüfen Sie den Autorisierungscode.',
    more_than_one_sms: 'Die Anzahl der SMS-Connectors ist größer als 1.',
    more_than_one_email: 'Die Anzahl der E-Mail-Connectors ist größer als 1.',
    more_than_one_connector_factory:
      'Mehrere Connector-Fabriken gefunden (mit ID {{connectorIds}}). Sie können unnötige Fabriken deinstallieren.',
    db_connector_type_mismatch:
      'Es gibt einen Connector in der Datenbank, der nicht dem Typ entspricht.',
    not_found_with_connector_id:
      'Connector mit der angegebenen Standard-Connector-ID konnte nicht gefunden werden.',
    multiple_instances_not_supported:
      'Es können keine mehreren Instanzen mit dem ausgewählten Standard-Connector erstellt werden.',
    invalid_type_for_syncing_profile:
      'Sie können nur Benutzerprofile mit sozialen Connectors synchronisieren.',
    can_not_modify_target: "Der 'target'-Connector kann nicht geändert werden.",
    should_specify_target: "Sie sollten den 'target' angeben.",
    multiple_target_with_same_platform:
      'Sie können keine mehreren sozialen Connectors haben, die das gleiche Ziel und die gleiche Plattform haben.',
    cannot_overwrite_metadata_for_non_standard_connector:
      "Die 'Metadaten' dieses Connectors können nicht überschrieben werden.",
  },
  verification_code: {
    phone_email_empty: 'Sowohl Telefon als auch E-Mail sind leer.',
    not_found: 'Bestätigungscode nicht gefunden. Bitte senden Sie zuerst den Bestätigungscode.',
    phone_mismatch:
      'Telefonnummer stimmt nicht überein. Bitte fordern Sie einen neuen Bestätigungscode an.',
    email_mismatch:
      'E-Mail stimmt nicht überein. Bitte fordern Sie einen neuen Bestätigungscode an.',
    code_mismatch: 'Ungültiger Bestätigungscode.',
    expired: 'Bestätigungscode ist abgelaufen. Bitte fordern Sie einen neuen Bestätigungscode an.',
    exceed_max_try:
      'Die Begrenzung für die Anzahl der Bestätigungscode-Wiederholungen wurde überschritten. Bitte fordern Sie einen neuen Bestätigungscode an.',
  },
  sign_in_experiences: {
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
  },
  localization: {
    cannot_delete_default_language:
      '{{languageTag}} ist die Standard-Sprache und kann nicht gelöscht werden.',
    invalid_translation_structure: 'Ungültige Übersetzungsstruktur. Bitte überprüfe deine Eingabe.',
  },
  swagger: {
    invalid_zod_type: 'Ungültiger Zod Typ. Überprüfe deine route guard Konfiguration.',
    not_supported_zod_type_for_params:
      'Nicht unterstützter Zod Typ für diese Parameter. Überprüfe deine route guard Konfiguration.',
  },
  entity: {
    create_failed: 'Fehler beim erstellen von {{name}}.',
    not_exists: '{{name}} existiert nicht.',
    not_exists_with_id: '{{name}} mit ID `{{id}}` existiert nicht.',
    not_found: 'Die Ressource wurde nicht gefunden.',
  },
  log: {
    invalid_type: 'Der Log Typ ist ungültig.',
  },
  role: {
    name_in_use: 'Dieser Rollenname {{name}} wird bereits verwendet.',
    scope_exists: 'Die Scope-ID {{scopeId}} wurde bereits zu dieser Rolle hinzugefügt.',
    user_exists: 'Die Benutzer-ID {{userId}} wurde bereits zu dieser Rolle hinzugefügt.',
    default_role_missing:
      'Einige der Standardrollennamen sind in der Datenbank nicht vorhanden. Bitte stellen Sie sicher, dass Sie zuerst Rollen erstellen.',
    internal_role_violation:
      'Sie versuchen möglicherweise, eine interne Rolle zu aktualisieren oder zu löschen, was von Logto verboten ist. Wenn Sie eine neue Rolle erstellen, versuchen Sie es mit einem anderen Namen, der nicht mit "#internal:" beginnt.',
  },
  scope: {
    name_exists: 'Der Scope-Name {{name}} ist bereits in Verwendung',
    name_with_space: 'Der Name des Scopes darf keine Leerzeichen enthalten.',
  },
  storage: {
    not_configured: 'Der Storage-Anbieter ist nicht konfiguriert.',
    missing_parameter: 'Fehlender Parameter {{parameter}} für den Storage-Anbieter.',
    upload_error: 'Das Hochladen der Datei zum Storage-Anbieter ist fehlgeschlagen.',
  },
};

export default errors;
