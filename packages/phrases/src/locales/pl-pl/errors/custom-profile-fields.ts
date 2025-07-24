const custom_profile_fields = {
  entity_not_exists_with_names: 'Nie można znaleźć jednostek o podanych nazwach: {{names}}',
  invalid_min_max_input: 'Nieprawidłowe wartości minimalne lub maksymalne.',
  invalid_options: 'Nieprawidłowe opcje pól.',
  invalid_regex_format: 'Nieprawidłowy format wyrażenia regularnego.',
  invalid_address_parts: 'Nieprawidłowe części adresu.',
  invalid_fullname_parts: 'Nieprawidłowe części pełnego imienia i nazwiska.',
  name_exists: 'Pole o podanej nazwie już istnieje.',
  conflicted_sie_order: 'Konfliktowa wartość kolejności pola dla Sign-in Experience.',
  invalid_name:
    'Nieprawidłowa nazwa pola, dozwolone są tylko litery lub cyfry, rozróżniana wielkość liter.',
  name_conflict_sign_in_identifier:
    'Nieprawidłowa nazwa pola. "{{name}}" jest zarezerwowanym kluczem identyfikatora logowania.',
  name_conflict_custom_data:
    'Nieprawidłowa nazwa pola. "{{name}}" jest zarezerwowanym kluczem danych niestandardowych.',
  name_required: 'Nazwa pola jest wymagana.',
};

export default Object.freeze(custom_profile_fields);
