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
  verification_blocked_too_many_attempts:
    'Trop de tentatives en peu de temps. Veuillez réessayer {{relativeTime}}.',
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
  not_supported_for_forgot_password:
    "Cette opération n'est pas prise en charge pour la réinitialisation du mot de passe.",
  mfa: {
    require_mfa_verification: 'La vérification MFA est requise pour vous connecter.',
    mfa_sign_in_only: "MFA est uniquement disponible pour l'interaction de connexion.",
    pending_info_not_found:
      "Informations MFA en attente introuvables, veuillez initier d'abord la MFA.",
    invalid_totp_code: 'Code TOTP non valide.',
    webauthn_verification_failed: 'Échec de la vérification WebAuthn.',
    webauthn_verification_not_found: 'Vérification WebAuthn introuvable.',
    bind_mfa_existed: 'MFA existe déjà.',
    backup_code_can_not_be_alone: 'Le code de sauvegarde ne peut pas être le seul MFA.',
    backup_code_required: 'Le code de sauvegarde est requis.',
    invalid_backup_code: 'Code de sauvegarde non valide.',
    mfa_policy_not_user_controlled: "La politique MFA n'est pas contrôlée par l'utilisateur.",
  },
  sso_enabled:
    'La connexion unique est activée pour cet e-mail donné. Veuillez vous connecter avec SSO.',
};

export default Object.freeze(session);
