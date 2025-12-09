const entity = {
  invalid_input: 'Saisie invalide. La liste des valeurs ne doit pas être vide.',
  value_too_long: 'La longueur de la valeur est trop longue et dépasse la limite.',
  create_failed: 'Échec de la création de {{name}}.',
  db_constraint_violated: 'Violations de contraintes de base de données.',
  not_exists: "Le {{name}} n'existe pas.",
  not_exists_with_id: "Le {{name}} avec l'ID `{{id}}` n'existe pas.",
  not_found: "La ressource n'existe pas.",
  relation_foreign_key_not_found:
    'Impossible de trouver une ou plusieurs clés étrangères. Veuillez vérifier la saisie et vous assurer que toutes les entités référencées existent.',
  unique_integrity_violation: "L'entité existe déjà. Veuillez vérifier la saisie et réessayer.",
};

export default Object.freeze(entity);
