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
};

export default sign_in_experiences;
