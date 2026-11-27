const mfa = {
  title: 'Authentification à plusieurs facteurs',
  description:
    'Ajoutez une authentification à plusieurs facteurs pour renforcer la sécurité de votre expérience de connexion.',
  factors: 'Facteurs',
  multi_factors: 'Multi-facteurs',
  multi_factors_description:
    "Les utilisateurs doivent vérifier l'un des facteurs activés pour la vérification en deux étapes.",
  totp: 'Application authentificatrice',
  otp_description:
    'Liez Google Authenticator, etc., pour vérifier les mots de passe à usage unique.',
  webauthn: 'Passkeys',
  webauthn_description:
    'Vérifiez via une méthode prise en charge par le navigateur : biométrie, scan de téléphone ou clé de sécurité, etc.',
  webauthn_domain_tip:
    "WebAuthn lie les clés publiques au domaine spécifique. Modifier votre domaine de service bloquera les utilisateurs pour l'authentification via les passkeys existantes.",
  backup_code: 'Codes de secours',
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
  verification_code_enrollment: 'Vérification en 2 étapes par e-mail/SMS',
  verification_code_enrollment_implicit:
    'Tous les utilisateurs avec un e-mail ou un numéro de téléphone vérifié',
  verification_code_enrollment_explicit: "Uniquement les utilisateurs qui l'ont configurée",
  verification_code_enrollment_explicit_confirmation:
    "Les codes de vérification par e-mail et SMS ne compteront comme vérification en 2 étapes que pour les utilisateurs qui les ont configurés. Les utilisateurs qui ne les ont pas configurés les perdent comme facteur de vérification en 2 étapes, et les utilisateurs sans autre facteur seront considérés comme n'ayant pas de MFA. Les utilisateurs qui ont activé la vérification en 2 étapes avec seulement une adresse e-mail ou un numéro de téléphone verront l'avis « Configuration incomplète » dans le Centre de compte jusqu'à ce qu'ils ajoutent une méthode de vérification. Êtes-vous sûr de vouloir continuer ?",
  verification_code_enrollment_implicit_confirmation:
    "Tous les utilisateurs avec une adresse e-mail ou un numéro de téléphone vérifié l'utiliseront pour la vérification en 2 étapes, y compris ceux qui ne l'ont pas configurée. Êtes-vous sûr de vouloir continuer ?",
  policy: 'Politique',
  policy_description: "Définissez la politique de MFA pour les flux de connexion et d'inscription.",
  require_mfa: 'Exiger MFA',
  require_mfa_optional:
    "MFA facultative : laissez les utilisateurs choisir d'activer MFA pour la sécurité de leur propre compte",
  require_mfa_adaptive:
    "MFA adaptative : ne demandez MFA que lorsqu'une connexion semble risquée (par ex. nouveau pays / longue période d'inactivité)",
  require_mfa_mandatory:
    'MFA obligatoire : exige que tous les utilisateurs effectuent MFA à chaque connexion',
  set_up_prompt: 'Invite de configuration MFA',
  no_prompt: 'Ne pas demander aux utilisateurs de configurer MFA',
  prompt_at_sign_in_and_sign_up:
    "Demander aux utilisateurs de configurer MFA lors de l'inscription (optionnel, invitation unique)",
  prompt_only_at_sign_in:
    "Demander aux utilisateurs de configurer MFA lors de leur prochaine tentative de connexion après l'inscription (optionnel, invitation unique)",
  prompt_at_sign_in_and_sign_up_mandatory:
    "Demander aux utilisateurs de configurer MFA lors de l'inscription. (non ignoré)",
  prompt_only_at_sign_in_mandatory:
    "Demander aux utilisateurs de configurer MFA lors de leur prochaine tentative de connexion après l'inscription. (non ignoré)",
  set_up_organization_required_mfa_prompt:
    "Invite de configuration MFA pour les utilisateurs après que l'organisation a activé MFA",
  prompt_at_sign_in_non_skippable:
    'Demander aux utilisateurs de configurer MFA lors de la prochaine connexion (impossible à ignorer)',
  additional_factor_suggestion: "Suggérer l'ajout d'un autre facteur MFA",
  additional_factor_suggestion_description:
    "Lorsque le seul facteur MFA d'un utilisateur est l'e-mail, le numéro de téléphone ou la passkey avec lequel il se connecte, suggérer d'ajouter un autre facteur lors de l'inscription ou de la connexion. Les utilisateurs peuvent l'ignorer.",
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
  trusted_device: {
    title: 'Appareils de confiance',
    description:
      'Permettez aux navigateurs de confiance d’effectuer automatiquement la vérification MFA lorsque le parcours MFA en cours l’exige.',
    enable_title: 'Activer les appareils de confiance',
    enable_description:
      'Autorisez les utilisateurs à faire confiance à ce navigateur après un facteur MFA éligible.',
    duration_title: 'Durée de confiance (jours)',
    duration_error: 'Saisissez un nombre entier compris entre {{min}} et {{max}}.',
    duration_note: 'Les changements de durée ne concernent que les appareils approuvés ensuite.',
    organization_allow_title: 'Autoriser les appareils de confiance',
    organization_allow_tip:
      "Une organisation peut seulement restreindre la politique du locataire ; elle ne peut pas l'activer si la politique globale est désactivée.",
    organization_allow_description:
      'Autorisez la vérification par appareil de confiance pour les membres de cette organisation.',
    organization_global_disabled:
      "Activez d'abord les appareils de confiance dans les paramètres MFA du locataire.",
    management_description:
      "Gérez les navigateurs auxquels cet utilisateur a fait confiance après avoir effectué l'authentification multifacteur. Après suppression, ce navigateur exigera de nouveau l'authentification multifacteur à la prochaine connexion.",
    management_hint: 'Le dernier emplacement est fourni à titre informatif uniquement.',
    management_empty: "Cet utilisateur n'a aucun appareil de confiance actif.",
    management_deletion_confirmation:
      "Supprimer {{name}} ? Ce navigateur exigera de nouveau l'authentification multifacteur à la prochaine connexion.",
    management_removed: 'Appareil de confiance supprimé.',
  },
};

export default Object.freeze(mfa);
