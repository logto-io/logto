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
  email_verification_code: 'Code de vérification par e-mail',
  email_verification_code_description:
    "Liez l'adresse e-mail pour recevoir et vérifier les codes de vérification.",
  phone_verification_code: 'Code de vérification par SMS',
  phone_verification_code_description:
    'Liez le numéro de téléphone pour recevoir et vérifier les codes de vérification par SMS.',
  policy: 'Politique',
  policy_description: "Définissez la politique de MFA pour les flux de connexion et d'inscription.",
  two_step_sign_in_policy: 'Politique de vérification en deux étapes à la connexion',
  user_controlled: 'Les utilisateurs peuvent activer ou désactiver MFA eux-mêmes',
  user_controlled_tip:
    "Les utilisateurs peuvent ignorer la configuration MFA la première fois à la connexion ou à l'inscription, ou l'activer/désactiver dans les paramètres du compte.",
  mandatory: 'Les utilisateurs doivent toujours utiliser MFA à la connexion',
  mandatory_tip:
    "Les utilisateurs doivent configurer MFA la première fois à la connexion ou à l'inscription, et l'utiliser pour toutes les connexions futures.",
  require_mfa: 'Exiger MFA',
  require_mfa_label:
    "Activez cette option pour rendre la vérification en deux étapes obligatoire pour accéder à vos applications. Si désactivé, les utilisateurs peuvent décider eux-mêmes d'activer MFA.",
  set_up_prompt: 'Invite de configuration MFA',
  no_prompt: 'Ne pas demander aux utilisateurs de configurer MFA',
  prompt_at_sign_in_and_sign_up:
    "Demander aux utilisateurs de configurer MFA lors de l'inscription (optionnel, invitation unique)",
  prompt_only_at_sign_in:
    "Demander aux utilisateurs de configurer MFA lors de leur prochaine tentative de connexion après l'inscription (optionnel, invitation unique)",
  set_up_organization_required_mfa_prompt:
    "Invite de configuration MFA pour les utilisateurs après que l'organisation a activé MFA",
  prompt_at_sign_in_no_skip:
    'Demander aux utilisateurs de configurer MFA lors de la prochaine connexion (pas de possibilité de passer)',
  email_primary_method_tip:
    'Le code de vérification par e-mail est déjà votre méthode de connexion principale. Pour maintenir la sécurité, il ne peut pas être réutilisé pour MFA.',
  phone_primary_method_tip:
    'Le code de vérification par SMS est déjà votre méthode de connexion principale. Pour maintenir la sécurité, il ne peut pas être réutilisé pour MFA.',
  no_email_connector_warning:
    'Aucun connecteur d\'e-mail n\'a encore été configuré. Avant de terminer la configuration, les utilisateurs ne pourront pas utiliser les codes de vérification par e-mail pour MFA. <a>{{link}}</a> dans "Connecteurs".',
  no_sms_connector_warning:
    'Aucun connecteur SMS n\'a encore été configuré. Avant de terminer la configuration, les utilisateurs ne pourront pas utiliser les codes de vérification SMS pour MFA. <a>{{link}}</a> dans "Connecteurs".',
  no_email_connector_error:
    "Impossible d'activer MFA avec code de vérification par e-mail sans connecteur e-mail. Veuillez d'abord configurer un connecteur e-mail.",
  no_sms_connector_error:
    "Impossible d'activer MFA avec code de vérification SMS sans connecteur SMS. Veuillez d'abord configurer un connecteur SMS.",
  setup_link: 'Configurer',
};

export default Object.freeze(mfa);
