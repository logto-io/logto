const description = {
  email: 'email',
  phone_number: 'numéro de téléphone',
  username: "nom d'utilisateur",
  reminder: 'Rappel',
  not_found: '404 Non trouvé',
  agree_with_terms: "J'ai lu et accepté les ",
  agree_with_terms_modal: 'Pour continuer, veuillez accepter le <link></link>.',
  terms_of_use: "Conditions d'utilisation",
  sign_in: 'Connexion',
  privacy_policy: 'Politique de confidentialité',
  create_account: 'Créer un compte',
  or: 'ou',
  and: 'et',
  enter_passcode: 'Le code a été envoyé à {{address}} {{target}}',
  passcode_sent: 'Le code a été renvoyé',
  resend_after_seconds: 'Renvoyer après <span>{{seconds}}</span> secondes',
  resend_passcode: 'Renvoyer le code',
  create_account_id_exists:
    'Le compte avec {{type}} {{value}} existe déjà, voulez-vous vous connecter?',
  link_account_id_exists: 'Le compte avec {{type}} {{value}} existe déjà, voulez-vous le lier?',
  sign_in_id_does_not_exist:
    "Le compte avec {{type}} {{value}} n'existe pas, voulez-vous créer un nouveau compte?",
  sign_in_id_does_not_exist_alert: 'Nous ne trouvons aucun compte associé à {{type}} {{value}}.',
  create_account_id_exists_alert:
    'Le compte avec {{type}} {{value}} est lié à un autre compte. Veuillez essayer un autre {{type}}.',
  social_identity_exist:
    'Le {{type}} {{value}} est lié à un autre compte. Veuillez essayer un autre {{type}}.',
  bind_account_title: 'Lier ou créer un compte',
  social_create_account: 'Vous pouvez créer un nouveau compte',
  social_link_email: 'Vous pouvez lier une autre adresse e-mail',
  social_link_phone: 'Vous pouvez lier un autre numéro de téléphone',
  social_link_email_or_phone:
    'Vous pouvez lier une autre adresse e-mail ou un autre numéro de téléphone',
  social_bind_with_existing:
    'Nous avons trouvé une {{method}} connexe qui a été enregistrée, et vous pouvez la lier directement.',
  reset_password: 'Mot de passe oublié',
  reset_password_description:
    'Entrez le {{types, list(type: disjunction;)}} associé à votre compte et nous vous enverrons le code de vérification pour réinitialiser votre mot de passe.',
  new_password: 'Nouveau mot de passe',
  set_password: 'Définir un mot de passe',
  password_changed: 'Mot de passe modifié',
  no_account: 'Pas encore de compte? ',
  have_account: 'Déjà un compte?',
  enter_password: 'Entrer le mot de passe',
  enter_password_for: 'Connectez-vous avec le mot de passe pour {{method}} {{value}}',
  enter_username: "Définir un nom d'utilisateur",
  enter_username_description:
    "Le nom d'utilisateur est une alternative pour la connexion. Le nom d'utilisateur doit contenir uniquement des lettres, des chiffres et des underscores.",
  link_email: "Lier l'adresse e-mail",
  link_phone: 'Lier le numéro de téléphone',
  link_email_or_phone: "Lier l'adresse e-mail ou le numéro de téléphone",
  link_email_description: 'Pour une sécurité accrue, veuillez lier votre adresse e-mail au compte.',
  link_phone_description:
    'Pour une sécurité accrue, veuillez lier votre numéro de téléphone au compte.',
  link_email_or_phone_description:
    'Pour une sécurité accrue, veuillez lier votre adresse e-mail ou votre numéro de téléphone au compte.',
  continue_with_more_information:
    'Pour une sécurité accrue, veuillez compléter les détails du compte ci-dessous.',
  create_your_account: 'Créer votre compte',
  sign_in_to_your_account: 'Connecte-toi à ton compte',
  no_region_code_found: 'Aucun code de région trouvé',
  verify_email: 'Vérifiez votre e-mail',
  verify_phone: 'Vérifiez votre numéro de téléphone',
  password_requirements: 'Mot de passe {{items, list}}.',
  password_requirement: {
    length_one: 'doit contenir au minimum {{count}} caractère',
    length_other: 'doit contenir au minimum {{count}} caractères',
    character_types_one:
      'doit contenir au moins {{count}} type de lettres majuscules, lettres minuscules, chiffres et symboles',
    character_types_other:
      'doit contenir au moins {{count}} types de lettres majuscules, lettres minuscules, chiffres et symboles',
  },
  use: 'Utiliser',
  single_sign_on_email_form: "Entrez votre adresse e-mail d'entreprise",
  single_sign_on_connectors_list:
    'Votre entreprise a activé la connexion unique (Single Sign-On) pour le compte email {{email}}. Vous pouvez continuer à vous connecter avec les fournisseurs SSO suivants.',
  single_sign_on_enabled: 'La connexion unique (Single Sign-On) est activée pour ce compte',
  /** UNTRANSLATED */
  authorize_title: 'Authorize {{name}}',
  /** UNTRANSLATED */
  request_permission: '{{name}} is requesting access to:',
  /** UNTRANSLATED */
  grant_organization_access: 'Grant the organization access:',
  /** UNTRANSLATED */
  authorize_personal_data_usage: 'Authorize the use of your personal data:',
  /** UNTRANSLATED */
  authorize_organization_access: 'Authorize access to the specific organization:',
  /** UNTRANSLATED */
  user_scopes: 'Personal user data',
  /** UNTRANSLATED */
  organization_scopes: 'Organization access',
  /** UNTRANSLATED */
  authorize_agreement: `By authorizing the access, you agree to the {{name}}'s <link></link>.`,
  /** UNTRANSLATED */
  authorize_agreement_with_redirect: `By authorizing the access, you agree to the {{name}}'s <link></link>, and will be redirected to {{uri}}.`,
  /** UNTRANSLATED */
  not_you: 'Not you?',
  /** UNTRANSLATED */
  user_id: 'User ID: {{id}}',
  /** UNTRANSLATED */
  redirect_to: 'You will be redirected to {{name}}.',
};

export default Object.freeze(description);
