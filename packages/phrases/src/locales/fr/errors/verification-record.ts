const verification_record = {
  not_found: 'Enregistrement de vérification introuvable.',
  permission_denied: 'Permission refusée, veuillez vous réauthentifier.',
  not_supported_for_google_one_tap: 'Cette API ne prend pas en charge Google One Tap.',
  social_verification: {
    invalid_target:
      'Enregistrement de vérification invalide. Attendu {{expected}} mais obtenu {{actual}}.',
    token_response_not_found:
      'Réponse du jeton introuvable. Veuillez vérifier que le stockage du jeton est pris en charge et activé pour le connecteur social.',
  },
};

export default Object.freeze(verification_record);
