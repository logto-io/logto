const errors = {
  auth: {
    authorization_header_missing: "L'en-tête d'autorisation est manquant.",
    authorization_token_type_not_supported: "Le type d'autorisation n'est pas pris en charge.",
    unauthorized:
      "Non autorisé. Veuillez vérifier les informations d'identification et son champ d'application.",
    forbidden: "Interdit. Veuillez vérifier vos rôles et autorisations d'utilisateur.",
    expected_role_not_found:
      'Expected role not found. Please check your user roles and permissions.',
    jwt_sub_missing: '`sub` manquant dans JWT.',
    require_re_authentication: 'Re-authentication is required to perform a protected action.', // UNTRANSLATED
  },
  guard: {
    invalid_input: "La requête {{type}} n'est pas valide.",
    invalid_pagination: "La valeur de la pagination de la requête n'est pas valide.",
  },
  oidc: {
    aborted: "L'utilisateur a abandonné l'interaction.",
    invalid_scope: "Le scope {{scope}} n'est pas pris en charge.",
    invalid_scope_plural: 'Les scopes {{scopes}} ne sont pas supportés.',
    invalid_token: 'Jeton fournis invalide.',
    invalid_client_metadata: 'Les métadonnées du client fournies sont invalides.',
    insufficient_scope: "Jeton d'accès manquant pour les scopes {{scopes}}.",
    invalid_request: 'La requête est invalide.',
    invalid_grant: 'Grant request is invalid.',
    invalid_redirect_uri:
      '`redirect_uri` ne correspondait à aucun des `redirect_uris` enregistrés par le client.',
    access_denied: 'Accès refusé.',
    invalid_target: 'Indicateur de ressource invalide.',
    unsupported_grant_type: "Le `grant_type` demandé n'est pas supporté.",
    unsupported_response_mode: "Le `response_mode` demandé n'est pas supporté.",
    unsupported_response_type: "Le `response_type` demandé n'est pas supporté.",
    provider_error: "Erreur interne de l'OIDC : {{message}}.",
  },
  user: {
    username_exists_register: "Le nom d'utilisateur a été enregistré.",
    email_exists_register: "L'adresse email a été enregistrée.",
    phone_exists_register: 'Le numéro de téléphone a été enregistré',
    invalid_email: 'Addresse email incorrecte.',
    invalid_phone: 'Numéro de téléphone incorrect.',
    email_not_exists: "L'adresse e-mail n'a pas encore été enregistrée.",
    phone_not_exists: "Le numéro de téléphone n'a pas encore été enregistré.",
    identity_not_exists: "Le compte social n'a pas encore été enregistré.",
    identity_exists: 'Le compte social a été enregistré.',
    invalid_role_names: 'les noms de rôles ({{roleNames}}) ne sont pas valides',
    cannot_delete_self: 'You cannot delete yourself.',
  },
  password: {
    unsupported_encryption_method: "La méthode de cryptage {{name}} n'est pas prise en charge.",
    pepper_not_found:
      'Mot de passe pepper non trouvé. Veuillez vérifier votre environnement de base.',
  },
  session: {
    not_found: 'Session non trouvée. Veuillez revenir en arrière et vous connecter à nouveau.',
    invalid_credentials:
      "Informations d'identification non valides. Veuillez vérifier votre saisie.",
    invalid_sign_in_method: "La méthode de connexion actuelle n'est pas disponible.",
    invalid_connector_id:
      "Impossible de trouver un connecteur disponible avec l'id {{connectorId}}.",
    insufficient_info: "Informations d'identification insuffisantes",
    connector_id_mismatch: "Le connectorId ne correspond pas à l'enregistrement de la session.",
    connector_session_not_found:
      "La session du connecteur n'a pas été trouvée. Veuillez revenir en arrière et vous connecter à nouveau.",
    unauthorized: "Veuillez vous enregistrer d'abord.",
    unsupported_prompt_name: "Nom d'invite non supporté.",
  },
  connector: {
    general: "Une erreur inattendue s'est produite dans le connecteur. {{errorDescription}}",
    not_found: 'Impossible de trouver un connecteur disponible pour le type : {{type}}.',
    not_enabled: "Le connecteur n'est pas activé.",
    invalid_metadata: "The connector's metadata is invalid.", // UNTRANSLATED
    invalid_config_guard: "The connector's config guard is invalid.", // UNTRANSLATED
    unexpected_type: "The connector's type is unexpected.", // UNTRANSLATED
    invalid_request_parameters: 'The request is with wrong input parameter(s).', // UNTRANSLATED
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
    db_connector_type_mismatch:
      'Il y a un connecteur dans la base de donnée qui ne correspond pas au type.',
  },
  passcode: {
    phone_email_empty: "Le téléphone et l'email sont vides.",
    not_found: "Le code d'accès n'a pas été trouvé. Veuillez envoyer le code d'accès en premier.",
    phone_mismatch: "Le téléphone ne correspond pas. Veuillez demander un nouveau code d'accès.",
    email_mismatch: "Erreur d'email. Veuillez demander un nouveau code d'accès.",
    code_mismatch: "Code d'accès invalide.",
    expired: "Le code d'accès a expiré. Veuillez demander un nouveau code d'accès.",
    exceed_max_try:
      "La limite de vérification du code d'accès est dépassée. Veuillez demander un nouveau code d'accès.",
  },
  sign_in_experiences: {
    empty_content_url_of_terms_of_use:
      'URL de contenu "Conditions d\'utilisation" vide. Veuillez ajouter l\'URL du contenu si les "Conditions d\'utilisation" sont activées.',
    empty_logo: "Veuillez entrer l'URL de votre logo",
    empty_slogan:
      "Un slogan vide. Veuillez ajouter un slogan si un style d'interface utilisateur contenant le slogan est sélectionné.",
    empty_social_connectors:
      'Connecteurs sociaux vides. Veuillez ajouter des connecteurs sociaux activés lorsque la méthode de connexion sociale est activée.',
    enabled_connector_not_found: 'Le connecteur {{type}} activé est introuvable.',
    not_one_and_only_one_primary_sign_in_method:
      'Il doit y avoir une et une seule méthode de connexion primaire. Veuillez vérifier votre saisie.',
  },
  swagger: {
    invalid_zod_type: 'Type Zod non valide. Veuillez vérifier la configuration du garde-route.',
    not_supported_zod_type_for_params:
      'Type Zod non supporté pour les paramètres. Veuillez vérifier la configuration du garde-route.',
  },
  entity: {
    create_failed: 'Échec de la création de {{name}}.',
    not_exists: "Le {{name}} n'existe pas.",
    not_exists_with_id: "Le {{name}} avec l'ID `{{id}}` n'existe pas.",
    not_found: "La ressource n'existe pas.",
  },
};

export default errors;
