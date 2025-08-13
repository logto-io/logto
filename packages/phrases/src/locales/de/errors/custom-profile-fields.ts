const custom_profile_fields = {
  entity_not_exists_with_names:
    'Entitäten mit den angegebenen Namen können nicht gefunden werden: {{names}}',
  invalid_min_max_input: 'Ungültige Eingabe für Minimum und Maximum.',
  invalid_default_value: 'Ungültiger Standardwert.',
  invalid_options: 'Ungültige Feldoptionen.',
  invalid_regex_format: 'Ungültiges Regex-Format.',
  invalid_address_components: 'Ungültige Adresskomponenten.',
  invalid_fullname_components: 'Ungültige Komponenten des vollständigen Namens.',
  invalid_sub_component_type: 'Ungültiger Unterkomponententyp.',
  name_exists: 'Ein Feld mit diesem Namen existiert bereits.',
  conflicted_sie_order: 'Konflikt im Feldreihenfolgewert für die Sign-in Experience.',
  invalid_name:
    'Ungültiger Feldname, nur Buchstaben oder Zahlen sind erlaubt, Groß- und Kleinschreibung beachten.',
  name_conflict_sign_in_identifier:
    'Ungültiger Feldname. "{{name}}" ist ein reservierter Schlüssel für die Anmeldung.',
  name_conflict_built_in_prop:
    'Ungültiger Feldname. "{{name}}" ist eine reservierte eingebaute Benutzerprofil-Eigenschaft.',
  name_conflict_custom_data:
    'Ungültiger Feldname. "{{name}}" ist ein reservierter Schlüssel für benutzerdefinierte Daten.',
  name_required: 'Feldname ist erforderlich.',
};

export default Object.freeze(custom_profile_fields);
