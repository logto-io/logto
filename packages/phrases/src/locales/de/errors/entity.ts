const entity = {
  invalid_input: 'Ungültige Eingabe. Wertliste darf nicht leer sein.',
  value_too_long: 'Die Wertlänge ist zu lang und überschreitet das Limit.',
  create_failed: 'Fehler beim Erstellen von {{name}}.',
  db_constraint_violated: 'Datenbankbeschränkung verletzt.',
  not_exists: '{{name}} existiert nicht.',
  not_exists_with_id: '{{name}} mit ID `{{id}}` existiert nicht.',
  not_found: 'Die Ressource wurde nicht gefunden.',
  relation_foreign_key_not_found:
    'Ein oder mehrere Fremdschlüssel konnten nicht gefunden werden. Bitte überprüfen Sie die Eingabe und stellen Sie sicher, dass alle referenzierten Einträge vorhanden sind.',
  unique_integrity_violation:
    'Die Entität besteht bereits. Bitte überprüfen Sie die Eingabe und versuchen Sie es erneut.',
};

export default Object.freeze(entity);
