const connector = {
  general: "Une erreur s'est produite dans le connecteur: {{errorDescription}}",
  not_found: 'Impossible de trouver un connecteur disponible pour le type : {{type}}.',
  not_enabled: "Le connecteur n'est pas activé.",
  invalid_metadata: 'Les métadonnées du connecteur sont invalides.',
  invalid_config_guard: 'La configuration du connecteur est invalide.',
  unexpected_type: 'Le type de connecteur est inattendu.',
  invalid_request_parameters: "La requête contient des paramètres d'entrée incorrects.",
  insufficient_request_parameters: 'Certains paramètres peuvent manquer dans la requête.',
  invalid_config: "La configuration du connecteur n'est pas valide.",
  invalid_response: "La réponse du connecteur n'est pas valide.",
  template_not_found: 'Impossible de trouver le bon modèle dans la configuration du connecteur.',
  not_implemented: "{{method}} : n'a pas encore été mis en œuvre.",
  social_invalid_access_token: "Le jeton d'accès du connecteur n'est pas valide.",
  invalid_auth_code: "Le code d'authentification du connecteur n'est pas valide.",
  social_invalid_id_token: "Le jeton d'identification du connecteur n'est pas valide.",
  authorization_failed: "Le processus d'autorisation de l'utilisateur n'a pas abouti.",
  social_auth_code_invalid:
    "Impossible d'obtenir le jeton d'accès, veuillez vérifier le code d'autorisation.",
  more_than_one_sms: 'Le nombre de connecteurs SMS est supérieur à 1.',
  more_than_one_email: 'Le nombre de connecteurs Email est supérieur à 1.',
  more_than_one_connector_factory:
    'Plusieurs fabriques de connecteurs ont été trouvées (avec les identifiants {{connectorIds}}), vous pouvez désinstaller ceux qui ne sont pas nécessaires.',
  db_connector_type_mismatch:
    'Il y a un connecteur dans la base de donnée qui ne correspond pas au type.',
  not_found_with_connector_id:
    "Impossible de trouver le connecteur avec l'identifiant de connecteur standard fourni.",
  multiple_instances_not_supported:
    'Impossible de créer plusieurs instances avec le connecteur standard sélectionné.',
  invalid_type_for_syncing_profile:
    "Vous ne pouvez synchroniser le profil utilisateur qu'avec les connecteurs sociaux.",
  can_not_modify_target: 'Le "target" du connecteur ne peut pas être modifié.',
  should_specify_target: 'Vous devez spécifier le "target".',
  multiple_target_with_same_platform:
    'Vous ne pouvez pas avoir plusieurs connecteurs sociaux ayant la même "target" et la même plateforme.',
  cannot_overwrite_metadata_for_non_standard_connector:
    'Les "metadata" de ce connecteur ne peuvent pas être modifiés.',
};
export default connector;
