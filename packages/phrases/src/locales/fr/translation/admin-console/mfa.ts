const mfa = {
  title: 'Authentification à plusieurs facteurs',
  description:
    'Ajoutez une authentification à plusieurs facteurs pour renforcer la sécurité de votre expérience de connexion.',
  factors: 'Facteurs',
  multi_factors: 'Multi-facteurs',
  multi_factors_description:
    "Les utilisateurs doivent vérifier l'un des facteurs activés pour la vérification en deux étapes.",
  totp: "OTP de l'application authentificatrice",
  otp_description:
    'Liez Google Authenticator, etc., pour vérifier les mots de passe à usage unique.',
  webauthn: 'WebAuthn (Passkey)',
  webauthn_description:
    'Vérifiez via une méthode prise en charge par le navigateur : biométrie, scan de téléphone ou clé de sécurité, etc.',
  webauthn_native_tip: "WebAuthn n'est pas pris en charge pour les applications natives.",
  webauthn_domain_tip:
    "WebAuthn lie les clés publiques au domaine spécifique. Modifier votre domaine de service bloquera les utilisateurs pour l'authentification via les passkeys existantes.",
  backup_code: 'Code de secours',
  backup_code_description:
    'Générez 10 codes de secours à usage unique après que les utilisateurs aient configuré une méthode de MFA.',
  backup_code_setup_hint:
    "Quand les utilisateurs ne peuvent pas vérifier les facteurs MFA ci-dessus, utilisez l'option de secours.",
  backup_code_error_hint:
    "Pour utiliser un code de secours, vous avez besoin d'au moins une autre méthode de MFA pour une authentification réussie de l'utilisateur.",
  policy: 'Politique',
  policy_description: "Définissez la politique de MFA pour les flux de connexion et d'inscription.",
  two_step_sign_in_policy: 'Politique de vérification en deux étapes à la connexion',
  user_controlled: 'Les utilisateurs peuvent activer ou désactiver MFA eux-mêmes',
  user_controlled_tip:
    "Les utilisateurs peuvent ignorer la configuration MFA la première fois à la connexion ou à l'inscription, ou l'activer/désactiver dans les paramètres du compte.",
  mandatory: 'Les utilisateurs doivent toujours utiliser MFA à la connexion',
  mandatory_tip:
    "Les utilisateurs doivent configurer MFA la première fois à la connexion ou à l'inscription, et l'utiliser pour toutes les connexions futures.",
};

export default Object.freeze(mfa);
