import type { LocalePhrase } from '../types.js';

const translation = {
  input: {
    username: "Nom d'utilisateur",
    password: 'Mot de passe',
    email: 'Email',
    phone_number: 'Numéro de téléphone',
    confirm_password: 'Confirmer le mot de passe',
  },
  secondary: {
    social_bind_with:
      'Vous avez déjà un compte ? Connectez-vous pour lier {{methods, list(type: disjunction;)}} avec votre identité sociale.',
  },
  action: {
    sign_in: 'Connexion',
    continue: 'Continuer',
    create_account: 'Créer un compte',
    create: 'Créer',
    enter_passcode: 'Entrer le code',
    confirm: 'Confirmer',
    cancel: 'Annuler',
    save_password: 'Save', // UNTRANSLATED
    bind: 'Lier avec {{address}}',
    bind_and_continue: 'Link and continue', // UNTRANSLATED
    back: 'Aller en arrière',
    nav_back: 'Retour',
    agree: 'Accepter',
    got_it: 'Compris',
    sign_in_with: 'Continuer avec {{name}}',
    forgot_password: 'Mot de passe oublié ?',
    switch_to: 'Passer au {{method}}',
    sign_in_via_passcode: 'Sign in with verification code', // UNTRANSLATED
    sign_in_via_password: 'Sign in with password', // UNTRANSLATED
    change: 'Change {{method}}', // UNTRANSLATED
    link_another_email: 'Link another email', // UNTRANSLATED
    link_another_phone: 'Link another phone', // UNTRANSLATED
    link_another_email_or_phone: 'Link another email or phone', // UNTRANSLATED
    show_password: 'Show password', // UNTRANSLATED
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
    create_account: 'Créer un compte',
    or: 'ou',
    enter_passcode: 'Le code a été envoyé à {{address}} {{target}}',
    passcode_sent: 'Le code a été renvoyé',
    resend_after_seconds: 'Renvoyer après <span>{{seconds}}</span> secondes',
    resend_passcode: 'Renvoyer le code',
    create_account_id_exists:
      'Le compte avec {{type}} {{value}} existe déjà, voulez-vous vous connecter ?',
    link_account_id_exists:
      'The account with {{type}} {{value}} already exists, would you like to link?', // UNTRANSLATED
    sign_in_id_does_not_exist:
      "Le compte avec {{type}} {{value}} n'existe pas, voulez-vous créer un nouveau compte ?",
    sign_in_id_does_not_exist_alert: 'The account with {{type}} {{value}} does not exist.', // UNTRANSLATED
    create_account_id_exists_alert: 'The account with {{type}} {{value}} already exists', // UNTRANSLATED
    social_identity_exist:
      'The {{type}} {{value}} is linked to another account. Please try another {{type}}', // UNTRANSLATED
    bind_account_title: 'Link or create account', // UNTRANSLATED
    social_create_account: 'Pas de compte ? Vous pouvez créer un nouveau compte et un lien.',
    social_link_email: 'You can link another email', // UNTRANSLATED
    social_link_phone: 'You can link another phone', // UNTRANSLATED
    social_link_email_or_phone: 'You can link another email or phone', // UNTRANSLATED
    social_bind_with_existing:
      'Nous trouvons un compte connexe, vous pouvez le relier directement.',
    reset_password: 'Réinitialiser le mot de passe',
    reset_password_description:
      'Entrez le {{types, list(type: disjunction;)}} associé à votre compte et nous vous enverrons le code de vérification pour réinitialiser votre mot de passe.',
    new_password: 'Nouveau mot de passe',
    set_password: 'Set password', // UNTRANSLATED
    password_changed: 'Password Changed', // UNTRANSLATED
    no_account: 'No account yet? ', // UNTRANSLATED
    have_account: 'Already had an account?', // UNTRANSLATED
    enter_password: 'Enter Password', // UNTRANSLATED
    enter_password_for: 'Sign in with the password to {{method}} {{value}}', // UNTRANSLATED
    enter_username: 'Set username', // UNTRANSLATED
    enter_username_description:
      'Username is an alternative for sign-in. Username must contain only letters, numbers, and underscores.', // UNTRANSLATED
    link_email: 'Link email', // UNTRANSLATED
    link_phone: 'Link phone', // UNTRANSLATED
    link_email_or_phone: 'Link email or phone', // UNTRANSLATED
    link_email_description: 'For added security, please link your email with the account.', // UNTRANSLATED
    link_phone_description: 'For added security, please link your phone with the account.', // UNTRANSLATED
    link_email_or_phone_description:
      'For added security, please link your email or phone with the account.', // UNTRANSLATED
    continue_with_more_information: 'For added security, please complete below account details.', // UNTRANSLATED
    create_your_account: 'Create your account', // UNTRANSLATED
    welcome_to_sign_in: 'Welcome to sign in', // UNTRANSLATED
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
    invalid_passcode: 'Le code est invalide',
    invalid_connector_auth: "L'autorisation n'est pas valide",
    invalid_connector_request: 'Les données du connecteur ne sont pas valides',
    unknown: 'Erreur inconnue. Veuillez réessayer plus tard.',
    invalid_session:
      'Session non trouvée. Veuillez revenir en arrière et vous connecter à nouveau.',
  },
  demo_app: {
    notification: 'Tip: Create a user in the user pool in order to test the sign-in experience.', // UNTRANSLATED
  },
};

const fr: LocalePhrase = Object.freeze({
  translation,
});

export default fr;
