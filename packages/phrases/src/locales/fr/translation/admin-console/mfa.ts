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
  /** UNTRANSLATED */
  webauthn: 'WebAuthn(Passkey)',
  /** UNTRANSLATED */
  webauthn_description:
    'Verify via browser-supported method: biometrics, phone scanning, or security key, etc.',
  /** UNTRANSLATED */
  webauthn_native_tip: 'WebAuthn is not supported for Native applications.',
  /** UNTRANSLATED */
  webauthn_domain_tip:
    'WebAuthn binds public keys to the specific domain. Modifying your service domain will block users from authenticating via existing passkeys.',
  backup_code: 'Code de secours',
  backup_code_description:
    'Générez 10 codes uniques, chacun utilisable pour une seule authentification.',
  backup_code_setup_hint:
    "Le facteur d'authentification de secours qui ne peut pas être activé seul :",
  backup_code_error_hint:
    "Pour utiliser le code de secours pour l'authentification multi-facteurs, d'autres facteurs doivent être activés pour garantir la réussite de la connexion de vos utilisateurs.",
  policy: 'Politique',
  two_step_sign_in_policy: "Politique d'authentification à deux étapes à la connexion",
  user_controlled: "Les utilisateurs ont le choix d'activer eux-mêmes la MFA.",
  mandatory: 'MFA obligatoire pour tous vos utilisateurs à chaque connexion.',
  unlock_reminder:
    "Débloquez l'authentification multi-facteurs pour renforcer la sécurité en passant à un abonnement payant. N'hésitez pas à <a>nous contacter</a> si vous avez besoin d'aide.",
  view_plans: 'Voir les plans',
};

export default Object.freeze(mfa);
