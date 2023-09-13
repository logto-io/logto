const mfa = {
  title: 'Authentification multi-facteurs',
  description:
    'Ajoutez une authentification multi-facteurs pour renforcer la sécurité de votre expérience de connexion.',
  factors: 'Facteurs',
  multi_factors: 'Multi-facteurs',
  multi_factors_description:
    "Les utilisateurs doivent vérifier l'un des facteurs activés pour l'authentification à deux étapes.",
  totp: "OTP de l'application Authenticator",
  otp_description:
    'Liez Google Authenticator, etc., pour vérifier les mots de passe à usage unique.',
  webauthn: 'WebAuthn',
  webauthn_description:
    "WebAuthn utilise la clé de passe pour vérifier le périphérique de l'utilisateur, y compris YubiKey.",
  backup_code: 'Code de secours',
  backup_code_description:
    'Générez 10 codes uniques, chacun utilisable pour une seule authentification.',
  backup_code_setup_hint:
    "Le facteur d'authentification de secours qui ne peut pas être activé seul :",
  backup_code_error_hint:
    "Pour utiliser le code de secours pour l'authentification multi-facteurs, d'autres facteurs doivent être activés pour garantir la réussite de la connexion de vos utilisateurs.",
  policy: 'Politique',
  two_step_sign_in_policy: "Politique d'authentification à deux étapes à la connexion",
  two_step_sign_in_policy_description:
    "Définissez une exigence d'authentification à deux étapes dans toute l'application lors de la connexion.",
  user_controlled: "Contrôlé par l'utilisateur",
  user_controlled_description:
    "Désactivé par défaut et non obligatoire, mais les utilisateurs peuvent l'activer individuellement.",
  mandatory: 'Obligatoire',
  mandatory_description:
    "Exigez l'authentification multi-facteurs pour tous vos utilisateurs à chaque connexion.",
  unlock_reminder:
    "Débloquez l'authentification multi-facteurs pour renforcer la sécurité en passant à un abonnement payant. N'hésitez pas à <a>nous contacter</a> si vous avez besoin d'aide.",
  view_plans: 'Voir les plans',
};

export default Object.freeze(mfa);
