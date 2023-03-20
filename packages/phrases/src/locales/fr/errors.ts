const errors = {
  request: {
    invalid_input: "L'entrée est invalide. {{details}}",
    general: "Une erreur de requête s'est produite.",
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
    require_re_authentication:
      'La ré-authentification est requise pour effectuer une action protégée.',
  },
  guard: {
    invalid_input: "La requête {{type}} n'est pas valide.",
    invalid_pagination: "La valeur de la pagination de la requête n'est pas valide.",
    can_not_get_tenant_id:
      "Impossible de récupérer l'identifiant du locataire à partir de la demande.",
    file_size_exceeded: 'Taille du fichier dépassée.',
    mime_type_not_allowed: "Le type MIME n'est pas autorisé.",
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
    username_already_in_use: "Ce nom d'utilisateur est déjà utilisé.",
    email_already_in_use: 'Cet e-mail est associé à un compte existant.',
    phone_already_in_use: 'Ce numéro de téléphone est associé à un compte existant.',
    invalid_email: 'Addresse email incorrecte.',
    invalid_phone: 'Numéro de téléphone incorrect.',
    email_not_exist: "L'adresse e-mail n'a pas encore été enregistrée.",
    phone_not_exist: "Le numéro de téléphone n'a pas encore été enregistré.",
    identity_not_exist: "Le compte social n'a pas encore été enregistré.",
    identity_already_in_use: 'Le compte social a été enregistré.',
    social_account_exists_in_profile: 'Vous avez déjà associé ce compte social.',
    cannot_delete_self: 'Vous ne pouvez pas vous supprimer vous-même.',
    sign_up_method_not_enabled: "Cette méthode d'inscription n'est pas activée.",
    sign_in_method_not_enabled: "Cette méthode de connexion n'est pas activée.",
    same_password: "Le nouveau mot de passe ne peut pas être identique à l'ancien.",
    password_required_in_profile: 'Vous devez définir un mot de passe avant de vous connecter.',
    new_password_required_in_profile: 'Vous devez définir un nouveau mot de passe.',
    password_exists_in_profile: 'Le mot de passe existe déjà dans votre profil.',
    username_required_in_profile:
      "Vous devez définir un nom d'utilisateur avant de vous connecter.",
    username_exists_in_profile: "Le nom d'utilisateur existe déjà dans votre profil.",
    email_required_in_profile: 'Vous devez ajouter une adresse e-mail avant de vous connecter.',
    email_exists_in_profile: 'Votre profil est déjà associé à une adresse e-mail.',
    phone_required_in_profile: 'Vous devez ajouter un numéro de téléphone avant de vous connecter.',
    phone_exists_in_profile: 'Votre profil est déjà associé à un numéro de téléphone.',
    email_or_phone_required_in_profile:
      'Vous devez ajouter une adresse e-mail ou un numéro de téléphone avant de vous connecter.',
    suspended: 'Ce compte est suspendu.',
    user_not_exist: "L'utilisateur avec {{ identifier }} n'existe pas.",
    missing_profile: 'Vous devez fournir des informations supplémentaires avant de vous connecter.',
    role_exists: "L'ID de rôle {{roleId}} a déjà été ajouté à cet utilisateur",
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
      "La vérification n'a pas abouti. Redémarrez le processus de vérification et réessayez.",
    verification_expired:
      'La connexion a expiré. Vérifiez à nouveau pour assurer la sécurité de votre compte.',
    unauthorized: "Veuillez vous enregistrer d'abord.",
    unsupported_prompt_name: "Nom d'invite non supporté.",
    forgot_password_not_enabled:
      "La fonctionnalité de réinitialisation de mot de passe n'est pas activée.",
    verification_failed:
      "La vérification n'a pas réussi. Veuillez recommencer le processus de vérification.",
    connector_validation_session_not_found:
      'La session de validation de jeton de connecteur est introuvable.',
    identifier_not_found:
      'Identifiant utilisateur introuvable. Veuillez retourner en arrière et vous connecter à nouveau.',
    interaction_not_found:
      "Session d'interaction introuvable. Veuillez retourner en arrière et recommencer la session.",
  },
  connector: {
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
  },
  verification_code: {
    phone_email_empty: "Les deux le téléphone et l'email sont vides.",
    not_found:
      "Le code de vérification n'a pas été trouvé. Veuillez d'abord envoyer le code de vérification.",
    phone_mismatch:
      'Téléphone ne correspond pas. Veuillez demander un nouveau code de vérification.',
    email_mismatch: 'Email ne correspond pas. Veuillez demander un nouveau code de vérification.',
    code_mismatch: 'Code de vérification invalide.',
    expired: 'Le code de vérification a expiré. Veuillez demander un nouveau code de vérification.',
    exceed_max_try:
      'La limite de tentatives de code de vérification a été dépassée. Veuillez demander un nouveau code de vérification.',
  },
  sign_in_experiences: {
    empty_content_url_of_terms_of_use:
      'URL de contenu "Conditions d\'utilisation" vide. Veuillez ajouter l\'URL du contenu si les "Conditions d\'utilisation" sont activées.',
    empty_social_connectors:
      'Connecteurs sociaux vides. Veuillez ajouter des connecteurs sociaux activés lorsque la méthode de connexion sociale est activée.',
    enabled_connector_not_found: 'Le connecteur {{type}} activé est introuvable.',
    not_one_and_only_one_primary_sign_in_method:
      'Il doit y avoir une et une seule méthode de connexion primaire. Veuillez vérifier votre saisie.',
    username_requires_password:
      "Vous devez activer la définition d'un mot de passe pour l'identifiant d'inscription de nom d'utilisateur.",
    passwordless_requires_verify:
      "Vous devez activer la vérification pour l'identifiant d'inscription par e-mail/numéro de téléphone.",
    miss_sign_up_identifier_in_sign_in:
      "Les méthodes de connexion doivent contenir l'identifiant d'inscription.",
    password_sign_in_must_be_enabled:
      "La connexion par mot de passe doit être activée lorsque la définition d'un mot de passe est requise lors de l'inscription.",
    code_sign_in_must_be_enabled:
      "La connexion par code de vérification doit être activée lorsque la définition d'un mot de passe n'est pas requise lors de l'inscription.",
    unsupported_default_language:
      "Cette langue - {{language}} n'est pas prise en charge pour le moment.",
    at_least_one_authentication_factor:
      "Vous devez sélectionner au moins un facteur d'authentification.",
  },
  localization: {
    cannot_delete_default_language:
      '{{languageTag}} est défini comme votre langue par défaut et ne peut pas être supprimé.',
    invalid_translation_structure:
      'Schémas de données invalides. Veuillez vérifier votre entrée et réessayer.',
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
    invalid_type: 'Type de journalisation invalide.',
  },
  role: {
    name_in_use: 'Ce nom de rôle {{name}} est déjà utilisé',
    scope_exists: "L'identifiant de portée {{scopeId}} a déjà été ajouté à ce rôle",
    user_exists: "L'identifiant d'utilisateur {{userId}} a déjà été ajouté à ce rôle",
    default_role_missing:
      "Certains noms de rôles par défaut n'existent pas dans la base de données, veuillez vous assurer de créer d'abord des rôles",
    internal_role_violation:
      'Vous essayez peut-être de mettre à jour ou de supprimer un rôle interne, ce qui est interdit par Logto. Si vous créez un nouveau rôle, essayez un autre nom qui ne commence pas par "#internal:".',
  },
  scope: {
    name_exists: 'Le nom de portée {{name}} est déjà utilisé',
    name_with_space: "Le nom de la portée ne peut pas contenir d'espace.",
  },
  storage: {
    not_configured: "Le fournisseur de stockage n'est pas configuré.",
    missing_parameter: 'Paramètre manquant {{parameter}} pour le fournisseur de stockage.',
    upload_error: "Échec de l'envoi du fichier au fournisseur de stockage.",
  },
};

export default errors;
