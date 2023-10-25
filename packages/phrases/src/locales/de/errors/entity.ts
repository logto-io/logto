const entity = {
  invalid_input: 'Ungültige Eingabe. Wertliste darf nicht leer sein.',
  create_failed: 'Fehler beim Erstellen von {{name}}.',
  db_constraint_violated: 'Datenbankbeschränkung verletzt.',
  not_exists: '{{name}} existiert nicht.',
  not_exists_with_id: '{{name}} mit ID `{{id}}` existiert nicht.',
  not_found: 'Die Ressource wurde nicht gefunden.',
  /** UNTRANSLATED */
  relation_foreign_key_not_found:
    'Cannot find one or more foreign keys. Please check the input and ensure that all referenced entities exist.',
  /** UNTRANSLATED */
  unique_integrity_violation: 'The entity already exists. Please check the input and try again.',
};

export default Object.freeze(entity);
