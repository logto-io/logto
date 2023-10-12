const entity = {
  invalid_input: 'Ungültige Eingabe. Wertliste darf nicht leer sein.',
  create_failed: 'Fehler beim Erstellen von {{name}}.',
  db_constraint_violated: 'Datenbankbeschränkung verletzt.',
  not_exists: '{{name}} existiert nicht.',
  not_exists_with_id: '{{name}} mit ID `{{id}}` existiert nicht.',
  not_found: 'Die Ressource wurde nicht gefunden.',
  /** UNTRANSLATED */
  duplicate_value_of_unique_field: 'The value of the unique field `{{field}}` is duplicated.',
};

export default Object.freeze(entity);
