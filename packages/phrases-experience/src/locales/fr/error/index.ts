import password_rejected from './password-rejected.js';

const error = {
  general_required: 'Le {{types, list(type: disjunction;)}} est requis',
  general_invalid: "Le {{types, list(type: disjunction;)}} n'est pas valide",
  invalid_min_max_input: 'La valeur saisie doit être comprise entre {{minValue}} et {{maxValue}}',
  invalid_min_max_length:
    'La longueur de la valeur saisie doit être comprise entre {{minLength}} et {{maxLength}}',
  username_required: "Le nom d'utilisateur est requis",
  password_required: 'Le mot de passe est requis',
  username_exists: "Ce Nom d'utilisateur existe déjà",
  username_should_not_start_with_number:
    "Le nom d'utilisateur ne doit pas commencer par un chiffre",
  username_invalid_charset:
    "Le nom d'utilisateur ne doit contenir que des lettres, des chiffres ou des caractères de soulignement.",
  invalid_email: "L'email n'est pas valide",
  invalid_phone: "Le numéro de téléphone n'est pas valide",
  passwords_do_not_match: 'Les mots de passe ne correspondent pas',
  invalid_passcode: 'Le code est invalide.',
  invalid_connector_auth: "L'autorisation n'est pas valide",
  invalid_connector_request: 'Les données du connecteur ne sont pas valides',
  unknown: 'Erreur inconnue. Veuillez réessayer plus tard.',
  invalid_session: 'Session non trouvée. Veuillez revenir en arrière et vous connecter à nouveau.',
  timeout: "Délai d'attente de la requête dépassé. Veuillez réessayer plus tard.",
  password_rejected,
  sso_not_enabled: "La authentification unique n'est pas activée pour ce compte de messagerie.",
  invalid_link: 'Lien invalide',
  invalid_link_description: "Votre jeton à usage unique a peut-être expiré ou n'est plus valide.",
  captcha_verification_failed: 'Erreur lors de la vérification du captcha.',
  terms_acceptance_required: 'Acceptation des conditions requise',
  terms_acceptance_required_description:
    'Vous devez accepter les conditions pour continuer. Veuillez réessayer.',
  something_went_wrong: 'Quelque chose a mal tourné.',
  feature_not_enabled: "Cette fonctionnalité n'est pas activée.",
};

export default Object.freeze(error);
