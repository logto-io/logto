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
  switch_account: 'Changer de compte',
  or: 'ou',
  and: 'et',
  enter_passcode: 'Le code a été envoyé à {{address}} {{target}}',
  passcode_sent: 'Le code a été renvoyé',
  resend_after_seconds: 'Pas encore reçu ? Renvoyer après <span>{{seconds}}</span> secondes',
  resend_passcode: 'Pas encore reçu ? <a>Renvoyer le code de vérification</a>',
  create_account_id_exists: 'Un compte avec {{value}} existe déjà. Continuer à se connecter.',
  link_account_id_exists: 'Le compte avec {{type}} {{value}} existe déjà, voulez-vous le lier?',
  sign_in_id_does_not_exist: 'Aucun compte trouvé pour {{value}}. Créer un nouveau?',
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
    'Nous avons trouvé un compte associé qui a été enregistré, et vous pouvez le lier directement.',
  skip_social_linking: 'Ignorer le lien avec le compte existant ?',
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
  sign_in_to_your_account: 'Connectez-vous à votre compte',
  no_region_code_found: 'Aucun code de région trouvé',
  verify_email: 'Vérifiez votre e-mail',
  verify_phone: 'Vérifiez votre numéro de téléphone',
  password_requirements: 'Mot de passe {{items, list}}.',
  password_requirement: {
    length_one: 'doit contenir au minimum {{count}} caractère',
    length_two: 'doit contenir au minimum {{count}} caractères',
    length_few: 'doit contenir au minimum {{count}} caractères',
    length_many: 'doit contenir au minimum {{count}} caractères',
    length_other: 'doit contenir au minimum {{count}} caractères',
    character_types_one:
      'doit contenir au moins {{count}} type de lettres majuscules, lettres minuscules, chiffres et symboles',
    character_types_two:
      'doit contenir au moins {{count}} types de lettres majuscules, lettres minuscules, chiffres et symboles',
    character_types_few:
      'doit contenir au moins {{count}} types de lettres majuscules, lettres minuscules, chiffres et symboles',
    character_types_many:
      'doit contenir au moins {{count}} types de lettres majuscules, lettres minuscules, chiffres et symboles',
    character_types_other:
      'doit contenir au moins {{count}} types de lettres majuscules, lettres minuscules, chiffres et symboles',
  },
  use: 'Utiliser',
  single_sign_on_email_form: "Entrez votre adresse e-mail d'entreprise",
  single_sign_on_connectors_list:
    'Votre entreprise a activé la connexion unique (Single Sign-On) pour le compte email {{email}}. Vous pouvez continuer à vous connecter avec les fournisseurs SSO suivants.',
  single_sign_on_enabled: 'La connexion unique (Single Sign-On) est activée pour ce compte',
  authorize_title: 'Autoriser {{name}}',
  request_permission: "{{name}} demande l'accès à :",
  grant_organization_access: "Accorder l'accès à l'organisation :",
  authorize_personal_data_usage: "Autoriser l'utilisation de vos données personnelles :",
  authorize_organization_access: "Autoriser l'accès à l'organisation spécifique :",
  user_scopes: 'Données utilisateur personnelles',
  organization_scopes: "Accès à l'organisation",
  authorize_agreement: `En autorisant l'accès, vous acceptez les termes de {{name}} <link></link>.`,
  authorize_agreement_with_redirect: `En autorisant l'accès, vous acceptez les termes de {{name}} <link></link>, et vous serez redirigé vers {{uri}}.`,
  not_you: 'Pas vous ?',
  user_id: 'ID utilisateur : {{id}}',
  redirect_to: 'Vous serez redirigé vers {{name}}.',
  auto_agreement: 'En continuant, vous acceptez les <link></link>.',
  identifier_sign_in_description:
    'Entrez votre {{types, list(type: disjunction;)}} pour vous connecter.',
  all_sign_in_options: 'Toutes les options de connexion',
  identifier_register_description:
    'Entrez votre {{types, list(type: disjunction;)}} pour créer un nouveau compte.',
  all_account_creation_options: 'Toutes les options de création de compte',
  back_to_sign_in: 'Retour à la connexion',
  support_email: 'Email de support: <link></link>',
  support_website: 'Site web de support: <link></link>',
  switch_account_title: 'Vous êtes actuellement connecté en tant que {{account}}',
  switch_account_description:
    'Pour continuer, vous serez déconnecté du compte actuel, et le passage au nouveau compte se fera automatiquement.',
  about_yourself: 'Parlez-nous de vous',
};

export default Object.freeze(description);
