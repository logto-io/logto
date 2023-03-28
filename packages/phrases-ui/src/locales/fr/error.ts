const error = {
  general_required: 'Le {{types, list(type: disjunction;)}} est requis',
  general_invalid: "Le {{types, list(type: disjunction;)}} n'est pas valide",
  username_required: "Le nom d'utilisateur est requis",
  password_required: 'Le mot de passe est requis',
  username_exists: "Ce Nom d'utilisateur existe déjà",
  username_should_not_start_with_number:
    "Le nom d'utilisateur ne doit pas commencer par un chiffre",
  username_invalid_charset:
    "Le nom d'utilisateur ne doit contenir que des lettres, des chiffres ou des caractères de soulignement.",
  invalid_email: "L'email n'est pas valide",
  invalid_phone: "Le numéro de téléphone n'est pas valide",
  password_min_length: 'Le mot de passe doit comporter un minimum de {{min}} caractères.',
  passwords_do_not_match: 'Les mots de passe ne correspondent pas',
  invalid_password:
    'Le mot de passe doit contenir au minimum {{min}} caractères et doit inclure une combinaison de lettres, de chiffres et de symboles.',
  invalid_passcode: 'Le code est invalide',
  invalid_connector_auth: "L'autorisation n'est pas valide",
  invalid_connector_request: 'Les données du connecteur ne sont pas valides',
  unknown: 'Erreur inconnue. Veuillez réessayer plus tard.',
  invalid_session: 'Session non trouvée. Veuillez revenir en arrière et vous connecter à nouveau.',
  timeout: 'Request timeout. Please try again later.',
};

export default error;
