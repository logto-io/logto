const entity = {
  invalid_input: 'Nieprawidłowe dane. Lista wartości nie może być pusta.',
  value_too_long: 'Długość wartości jest zbyt długa i przekracza limit.',
  create_failed: 'Nie udało się utworzyć {{name}}.',
  db_constraint_violated: 'Constraint naruszenie bazy danych.',
  not_exists: '{{name}} nie istnieje.',
  not_exists_with_id: '{{name}} o identyfikatorze `{{id}}` nie istnieje.',
  not_found: 'Zasób nie istnieje.',
  relation_foreign_key_not_found:
    'Nie można odnaleźć jednego lub więcej kluczy obcych. Proszę sprawdzić dane wejściowe i upewnić się, że wszystkie odwołane encje istnieją.',
  unique_integrity_violation:
    'Encja już istnieje. Proszę sprawdzić dane wejściowe i spróbować ponownie.',
};

export default Object.freeze(entity);
