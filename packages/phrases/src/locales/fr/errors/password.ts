const password = {
  unsupported_encryption_method: "La méthode de cryptage {{name}} n'est pas prise en charge.",
  pepper_not_found:
    'Mot de passe pepper non trouvé. Veuillez vérifier votre environnement de base.',
  rejected: 'Mot de passe rejeté. Veuillez vérifier si votre mot de passe répond aux exigences.',
  invalid_legacy_password_format: 'Format de mot de passe hérité invalide.',
  unsupported_legacy_hash_algorithm:
    'Algorithme de hachage hérité non pris en charge : {{algorithm}}.',
};

export default Object.freeze(password);
