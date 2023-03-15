import type { LocalePhrase } from '../types.js';

const translation = {
  input: {
    username: "Nom d'utilisateur",
    password: 'Mot de passe',
    email: 'Email',
    phone_number: 'Numéro de téléphone',
    confirm_password: 'Confirmer le mot de passe',
    search_region_code: 'Rechercher le code de région',
  },
  secondary: {
    social_bind_with:
      'Vous avez déjà un compte? Connectez-vous pour lier {{methods, list(type: disjunction;)}} avec votre identité sociale.',
  },
  action: {
    sign_in: 'Connexion',
    continue: 'Continuer',
    create_account: 'Créer un compte',
    create_account_without_linking: 'Créer un compte sans lier',
    create: 'Créer',
    enter_passcode: 'Entrer le code',
    confirm: 'Confirmer',
    cancel: 'Annuler',
    save_password: 'Enregistrer le mot de passe',
    bind: 'Lier avec {{address}}',
    bind_and_continue: 'Lier et continuer',
    back: 'Aller en arrière',
    nav_back: 'Retour',
    agree: 'Accepter',
    got_it: 'Compris',
    sign_in_with: 'Continuer avec {{name}}',
    forgot_password: 'Mot de passe oublié?',
    switch_to: 'Passer au {{method}}',
    sign_in_via_passcode: 'Se connecter avec le code de vérification',
    sign_in_via_password: 'Se connecter avec le mot de passe',
    change: 'Changer {{method}}',
    link_another_email: 'Lier une autre adresse e-mail',
    link_another_phone: 'Lier un autre numéro de téléphone',
    link_another_email_or_phone: 'Lier une autre adresse e-mail ou un autre numéro de téléphone',
    show_password: 'Afficher le mot de passe',
  },
  description: {
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
      "Le nom d'utilisateur est une alternative pour la connexion. Le nom d'utilisateur doit contenir uniquement des lettres, des chiffres et des underscores.", // UNTRANSLATED
    link_email: "Lier l'adresse e-mail",
    link_phone: 'Lier le numéro de téléphone',
    link_email_or_phone: "Lier l'adresse e-mail ou le numéro de téléphone",
    link_email_description:
      'Pour une sécurité accrue, veuillez lier votre adresse e-mail au compte.',
    link_phone_description:
      'Pour une sécurité accrue, veuillez lier votre numéro de téléphone au compte.',
    link_email_or_phone_description:
      'Pour une sécurité accrue, veuillez lier votre adresse e-mail ou votre numéro de téléphone au compte.',
    continue_with_more_information:
      'Pour une sécurité accrue, veuillez compléter les détails du compte ci-dessous.',
    create_your_account: 'Créer votre compte',
    welcome_to_sign_in: 'Bienvenue pour vous connecter',
  },
  error: {
    general_required: `Le {{types, list(type: disjunction;)}} est requis`,
    general_invalid: `Le {{types, list(type: disjunction;)}} n'est pas valide`,
    username_required: "Le nom d'utilisateur est requis",
    password_required: 'Le mot de passe est requis',
    username_exists: "Ce Nom d'utilisateur existe déjà",
    username_should_not_start_with_number:
      "Le nom d'utilisateur ne doit pas commencer par un chiffre",
    username_invalid_charset:
      "Le nom d'utilisateur ne doit contenir que des lettres, des chiffres ou des caractères de soulignement.",
    invalid_email: "L'email n'est pas valide",
    invalid_phone: "Le numéro de téléphone n'est pas valide",
    password_min_length: 'Le mot de passe doit comporter un minimum de {{min}} caractères.',
    passwords_do_not_match: 'Les mots de passe ne correspondent pas',
    invalid_password:
      'Le mot de passe doit contenir au minimum {{min}} caractères et doit inclure une combinaison de lettres, de chiffres et de symboles.',
    invalid_passcode: 'Le code est invalide',
    invalid_connector_auth: "L'autorisation n'est pas valide",
    invalid_connector_request: 'Les données du connecteur ne sont pas valides',
    unknown: 'Erreur inconnue. Veuillez réessayer plus tard.',
    invalid_session:
      'Session non trouvée. Veuillez revenir en arrière et vous connecter à nouveau.',
  },
  demo_app: {
    notification: "Astuce : Créez d'abord un compte pour tester l'expérience de connexion.",
  },
};

const fr: LocalePhrase = Object.freeze({
  translation,
});

export default fr;
