const custom_profile_fields = {
  entity_not_exists_with_names:
    'Impossible de trouver des entités avec les noms donnés : {{names}}',
  invalid_min_max_input: 'Entrée min et max invalide.',
  invalid_options: 'Options de champ invalides.',
  invalid_regex_format: 'Format de regex invalide.',
  invalid_address_parts: "Parties d'adresse invalides.",
  invalid_fullname_parts: 'Parties de nom complet invalides.',
  name_exists: 'Un champ existe déjà avec ce nom.',
  conflicted_sie_order: "Valeur d'ordre de champ en conflit pour l'expérience de connexion.",
  invalid_name:
    'Nom de champ invalide, seules les lettres ou les chiffres sont autorisés, sensible à la casse.',
  name_conflict_sign_in_identifier:
    'Nom de champ invalide. {{name}} est un identifiant de connexion réservé.',
};

export default Object.freeze(custom_profile_fields);
