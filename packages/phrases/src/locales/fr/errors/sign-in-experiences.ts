const sign_in_experiences = {
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
  backup_code_cannot_be_enabled_alone: 'Le code de sauvegarde ne peut être activé seul.',
  duplicated_mfa_factors: 'Facteurs de MFA en double.',
  email_verification_code_cannot_be_used_for_mfa:
    "Le code de vérification par e-mail ne peut pas être utilisé pour l'authentification multifactorielle lorsque la vérification de l'e-mail est activée pour la connexion.",
  phone_verification_code_cannot_be_used_for_mfa:
    "Le code de vérification SMS ne peut pas être utilisé pour l'authentification multifactorielle lorsque la vérification SMS est activée pour la connexion.",
  email_verification_code_cannot_be_used_for_sign_in:
    "Le code de vérification par e-mail ne peut pas être utilisé pour la connexion lorsqu'il est activé pour la MFA.",
  phone_verification_code_cannot_be_used_for_sign_in:
    "Le code de vérification SMS ne peut pas être utilisé pour la connexion lorsqu'il est activé pour la MFA.",
  duplicated_sign_up_identifiers: "Des identifiants d'inscription en double ont été détectés.",
  missing_sign_up_identifiers: "L'identifiant principal d'inscription ne peut pas être vide.",
  invalid_custom_email_blocklist_format:
    "Articles non valides de la liste de blocage d'e-mails personnalisés : {{items, list(type:conjunction)}}. Chaque élément doit être une adresse e-mail ou un domaine de messagerie valide, par exemple, foo@example.com ou @example.com.",
  forgot_password_method_requires_connector:
    "La méthode de mot de passe oublié nécessite qu'un connecteur {{method}} correspondant soit configuré.",
};

export default Object.freeze(sign_in_experiences);
