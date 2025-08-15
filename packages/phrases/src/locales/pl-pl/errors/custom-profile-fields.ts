const custom_profile_fields = {
  entity_not_exists_with_names: 'Nie można znaleźć jednostek o podanych nazwach: {{names}}',
  invalid_min_max_input: 'Nieprawidłowe wartości minimalne lub maksymalne.',
  invalid_default_value: 'Nieprawidłowa wartość domyślna.',
  invalid_options: 'Nieprawidłowe opcje pól.',
  invalid_regex_format: 'Nieprawidłowy format wyrażenia regularnego.',
  invalid_address_components: 'Nieprawidłowe komponenty adresu.',
  invalid_fullname_components: 'Nieprawidłowe komponenty pełnego imienia i nazwiska.',
  invalid_sub_component_type: 'Nieprawidłowy typ podkomponentu.',
  name_exists: 'Pole o podanej nazwie już istnieje.',
  conflicted_sie_order: 'Konfliktowa wartość kolejności pola dla Sign-in Experience.',
  invalid_name:
    'Nieprawidłowa nazwa pola, dozwolone są tylko litery lub cyfry, rozróżniana wielkość liter.',
  name_conflict_sign_in_identifier:
    'Nieprawidłowa nazwa pola. Zarezerwowane klucze identyfikatora logowania: {{name}}.',
  name_conflict_built_in_prop:
    'Nieprawidłowa nazwa pola. Zarezerwowane nazwy wbudowanych właściwości profilu użytkownika: {{name}}.',
  name_conflict_custom_data:
    'Nieprawidłowa nazwa pola. Zarezerwowane klucze danych niestandardowych: {{name}}.',
  name_required: 'Nazwa pola jest wymagana.',
};

export default Object.freeze(custom_profile_fields);
