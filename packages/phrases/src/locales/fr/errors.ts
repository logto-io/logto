const errors = {
  request: {
    invalid_input: 'Input is invalid. {{details}}', // UNTRANSLATED
    general: 'Request error occurred.', // UNTRANSLATED
  },
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
    username_already_in_use: 'This username is already in use.', // UNTRANSLATED
    email_already_in_use: 'This email is associated with an existing account.', // UNTRANSLATED
    phone_already_in_use: 'This phone number is associated with an existing account.', // UNTRANSLATED
    invalid_email: 'Addresse email incorrecte.',
    invalid_phone: 'Numéro de téléphone incorrect.',
    email_not_exist: "L'adresse e-mail n'a pas encore été enregistrée.",
    phone_not_exist: "Le numéro de téléphone n'a pas encore été enregistré.",
    identity_not_exist: "Le compte social n'a pas encore été enregistré.",
    identity_already_in_use: 'Le compte social a été enregistré.',
    invalid_role_names: 'Les noms de rôles ({{roleNames}}) ne sont pas valides',
    cannot_delete_self: 'You cannot delete yourself.', // UNTRANSLATED
    sign_up_method_not_enabled: 'This sign-up method is not enabled.', // UNTRANSLATED
    sign_in_method_not_enabled: 'This sign-in method is not enabled.', // UNTRANSLATED
    same_password: 'New password cannot be the same as your old password.', // UNTRANSLATED
    password_required_in_profile: 'You need to set a password before signing-in.', // UNTRANSLATED
    new_password_required_in_profile: 'You need to set a new password.', // UNTRANSLATED
    password_exists_in_profile: 'Password already exists in your profile.', // UNTRANSLATED
    username_required_in_profile: 'You need to set a username before signing-in.', // UNTRANSLATED
    username_exists_in_profile: 'Username already exists in your profile.', // UNTRANSLATED
    email_required_in_profile: 'You need to add an email address before signing-in.', // UNTRANSLATED
    email_exists_in_profile: 'Your profile has already associated with an email address.', // UNTRANSLATED
    phone_required_in_profile: 'You need to add a phone number before signing-in.', // UNTRANSLATED
    phone_exists_in_profile: 'Your profile has already associated with a phone number.', // UNTRANSLATED
    email_or_phone_required_in_profile:
      'You need to add an email address or phone number before signing-in.', // UNTRANSLATED
    suspended: 'This account is suspended.', // UNTRANSLATED
    user_not_exist: 'User with {{ identifier }} does not exist.', // UNTRANSLATED,
    missing_profile: 'You need to provide additional info before signing-in.', // UNTRANSLATED
    role_exists: 'The role id {{roleId}} is already been added to this user', // UNTRANSLATED
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
    verification_session_not_found:
      'The verification was not successful. Restart the verification flow and try again.', // UNTRANSLATED
    verification_expired:
      'The connection has timed out. Verify again to ensure your account safety.', // UNTRANSLATED
    unauthorized: "Veuillez vous enregistrer d'abord.",
    unsupported_prompt_name: "Nom d'invite non supporté.",
    forgot_password_not_enabled: 'Forgot password is not enabled.', // UNTRANSLATED
    verification_failed:
      'The verification was not successful. Restart the verification flow and try again.', // UNTRANSLATED
    connector_validation_session_not_found:
      'The connector session for token validation is not found.', // UNTRANSLATED
    identifier_not_found: 'User identifier not found. Please go back and sign in again.', // UNTRANSLATED
    interaction_not_found:
      'Interaction session not found. Please go back and start the session again.', // UNTRANSLATED
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
    not_found_with_connector_id: 'Can not find connector with given standard connector id.', // UNTRANSLATED
    multiple_instances_not_supported:
      'Can not create multiple instance with picked standard connector.', // UNTRANSLATED
    invalid_type_for_syncing_profile: 'You can only sync user profile with social connectors.', // UNTRANSLATED
    can_not_modify_target: "The connector 'target' can not be modified.", // UNTRANSLATED
    should_specify_target: "You should specify 'target'.", // UNTRANSLATED
    multiple_target_with_same_platform:
      'You can not have multiple social connectors that have same target and platform.', // UNTRANSLATED
    cannot_overwrite_metadata_for_non_standard_connector:
      "This connector's 'metadata' cannot be overwritten.", // UNTRANSLATED
  },
  verification_code: {
    phone_email_empty: 'Both phone and email are empty.', // UNTRANSLATED
    not_found: 'Verification code not found. Please send verification code first.', // UNTRANSLATED
    phone_mismatch: 'Phone mismatch. Please request a new verification code.', // UNTRANSLATED
    email_mismatch: 'Email mismatch. Please request a new verification code.', // UNTRANSLATED
    code_mismatch: 'Invalid verification code.', // UNTRANSLATED
    expired: 'Verification code has expired. Please request a new verification code.', // UNTRANSLATED
    exceed_max_try:
      'Verification code retries limitation exceeded. Please request a new verification code.', // UNTRANSLATED
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
    username_requires_password: 'Must enable set a password for username sign up identifier.', // UNTRANSLATED
    passwordless_requires_verify: 'Must enable verify for email/phone sign up identifier.', // UNTRANSLATED
    miss_sign_up_identifier_in_sign_in: 'Sign in methods must contain the sign up identifier.', // UNTRANSLATED
    password_sign_in_must_be_enabled:
      'Password sign in must be enabled when set a password is required in sign up.', // UNTRANSLATED
    code_sign_in_must_be_enabled:
      'Verification code sign in must be enabled when set a password is not required in sign up.', // UNTRANSLATED
    unsupported_default_language: 'This language - {{language}} is not supported at the moment.', // UNTRANSLATED
    at_least_one_authentication_factor: 'You have to select at least one authentication factor.', // UNTRANSLATED
  },
  localization: {
    cannot_delete_default_language:
      '{{languageTag}} is set as your default language and can’t be deleted.', // UNTRANSLATED
    invalid_translation_structure: 'Invalid data schemas. Please check your input and try again.', // UNTRANSLATED
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
  log: {
    invalid_type: 'The log type is invalid.', // UNTRANSLATED
  },
  role: {
    name_in_use: 'This role name {{name}} is already in use', // UNTRANSLATED
    scope_exists: 'The scope id {{scopeId}} has already been added to this role', // UNTRANSLATED
    user_exists: 'The user id {{userId}} is already been added to this role', // UNTRANSLATED
  },
};

export default errors;
