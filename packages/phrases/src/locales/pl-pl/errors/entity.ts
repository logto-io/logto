const entity = {
  invalid_input: 'Nieprawidłowe dane. Lista wartości nie może być pusta.',
  create_failed: 'Nie udało się utworzyć {{name}}.',
  db_constraint_violated: 'Constraint naruszenie bazy danych.',
  not_exists: '{{name}} nie istnieje.',
  not_exists_with_id: '{{name}} o identyfikatorze `{{id}}` nie istnieje.',
  not_found: 'Zasób nie istnieje.',
  /** UNTRANSLATED */
  duplicate_value_of_unique_field: 'The value of the unique field `{{field}}` is duplicated.',
};

export default Object.freeze(entity);
