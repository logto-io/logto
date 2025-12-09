const entity = {
  invalid_input: 'Input non valido. La lista dei valori non deve essere vuota.',
  value_too_long: 'La lunghezza del valore è troppo lunga e supera il limite.',
  create_failed: 'Impossibile creare {{name}}.',
  db_constraint_violated: 'Vincolo del database violato.',
  not_exists: '{{name}} non esiste.',
  not_exists_with_id: '{{name}} con ID `{{id}}` non esiste.',
  not_found: 'La risorsa non esiste.',
  relation_foreign_key_not_found:
    "Impossibile trovare una o più chiavi esterne. Si prega di controllare l'input e assicurarsi che tutte le entità referenziate esistano.",
  unique_integrity_violation: "L'entità esiste già. Si prega di controllare l'input e riprovare.",
};

export default Object.freeze(entity);
