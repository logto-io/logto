const custom_profile_fields = {
  entity_not_exists_with_names:
    'Impossible de trouver des entités avec les noms donnés : {{names}}',
  invalid_min_max_input: 'Entrée min et max invalide.',
  invalid_default_value: 'Valeur par défaut invalide.',
  invalid_options: 'Options de champ invalides.',
  invalid_regex_format: 'Format de regex invalide.',
  invalid_address_components: "Composants d'adresse invalides.",
  invalid_fullname_components: 'Composants de nom complet invalides.',
  invalid_sub_component_type: 'Type de sous-composant invalide.',
  name_exists: 'Un champ existe déjà avec ce nom.',
  conflicted_sie_order: "Valeur d'ordre de champ en conflit pour l'expérience de connexion.",
  invalid_name:
    'Nom de champ invalide, seules les lettres ou les chiffres sont autorisés, sensible à la casse.',
  name_conflict_sign_in_identifier:
    'Nom de champ invalide. Clés d’identifiant de connexion réservées : {{name}}.',
  name_conflict_built_in_prop:
    'Nom de champ invalide. Noms de propriétés intégrées du profil utilisateur réservés : {{name}}.',
  name_conflict_custom_data:
    'Nom de champ invalide. Clés de données personnalisées réservées : {{name}}.',
  name_required: 'Le nom du champ est requis.',
};

export default Object.freeze(custom_profile_fields);
