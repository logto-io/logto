const auth = {
  authorization_header_missing: "L'en-tête d'autorisation est manquant.",
  authorization_token_type_not_supported: "Le type d'autorisation n'est pas pris en charge.",
  unauthorized:
    "Non autorisé. Veuillez vérifier les informations d'identification et son champ d'application.",
  forbidden: "Interdit. Veuillez vérifier vos rôles et autorisations d'utilisateur.",
  expected_role_not_found: 'Expected role not found. Please check your user roles and permissions.',
  jwt_sub_missing: '`sub` manquant dans JWT.',
  require_re_authentication:
    'La ré-authentification est requise pour effectuer une action protégée.',
};
export default auth;
