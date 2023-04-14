const errors = {
  something_went_wrong: 'Ups, da ist etwas schief gelaufen.',
  page_not_found: 'Seite nicht gefunden',
  unknown_server_error: 'Unbekannter Serverfehler',
  empty: 'Keine Daten verfügbar',
  missing_total_number: 'Total-Number wurde nicht in Response Headern gefunden',
  invalid_uri_format: 'Ungültiges URI-Format',
  invalid_origin_format: 'Ungültiges URI Origin-Format',
  invalid_json_format: 'Ungültiges JSON-Format',
  invalid_error_message_format: 'Ungültiges Fehlermeldung-Format.',
  required_field_missing: 'Bitte fülle {{field}} aus',
  required_field_missing_plural: 'Mindestens ein {{field}} muss ausgefüllt sein',
  more_details: 'Mehr Details',
  username_pattern_error:
    'Der Benutzername sollte nur Buchstaben, Zahlen oder Unterstriche enthalten und nicht mit einer Zahl beginnen.',
  password_pattern_error:
    'Das Passwort benötigt mindestens {{min}} Zeichen und enthält eine Mischung aus Buchstaben, Zahlen und Symbolen.',
  email_pattern_error: 'Die E-Mail-Adresse ist ungültig.',
  phone_pattern_error: 'Die Telefonnummer ist ungültig.',
  insecure_contexts: 'Unsichere Kontexte (nicht-HTTPS) werden nicht unterstützt.',
  unexpected_error: 'Ein unerwarteter Fehler ist aufgetreten',
  not_found: '404 not found',
  create_internal_role_violation:
    'Sie erstellen eine neue interne Rolle, die von Logto verboten ist. Versuchen Sie einen anderen Namen, der nicht mit "#internal:" beginnt.',
};

export default errors;
