const session = {
  not_found: 'Session non trouvée. Veuillez revenir en arrière et vous connecter à nouveau.',
  invalid_credentials: "Informations d'identification non valides. Veuillez vérifier votre saisie.",
  invalid_sign_in_method: "La méthode de connexion actuelle n'est pas disponible.",
  invalid_connector_id: "Impossible de trouver un connecteur disponible avec l'id {{connectorId}}.",
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
};
export default session;
