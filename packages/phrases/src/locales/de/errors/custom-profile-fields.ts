const custom_profile_fields = {
  entity_not_exists_with_names:
    'Entitäten mit den angegebenen Namen können nicht gefunden werden: {{names}}',
  invalid_min_max_input: 'Ungültige Eingabe für Minimum und Maximum.',
  invalid_options: 'Ungültige Feldoptionen.',
  invalid_regex_format: 'Ungültiges Regex-Format.',
  invalid_address_parts: 'Ungültige Adressbestandteile.',
  invalid_fullname_parts: 'Ungültige Vor- und Nachnamenangaben.',
  name_exists: 'Ein Feld mit diesem Namen existiert bereits.',
  conflicted_sie_order: 'Konflikt im Feldreihenfolgewert für die Sign-in Experience.',
  invalid_name:
    'Ungültiger Feldname, nur Buchstaben oder Zahlen sind erlaubt, Groß- und Kleinschreibung beachten.',
  name_conflict_sign_in_identifier:
    'Ungültiger Feldname. "{{name}}" ist ein reservierter Schlüssel für die Anmeldung.',
  name_conflict_custom_data:
    'Ungültiger Feldname. "{{name}}" ist ein reservierter Schlüssel für benutzerdefinierte Daten.',
  name_required: 'Feldname ist erforderlich.',
};

export default Object.freeze(custom_profile_fields);
