import en from './en';

const translation = {
  input: {
    username: "Nom d'utilisateur",
    password: 'Mot de passe',
    email: 'Email',
    phone_number: 'Numéro de téléphone',
    confirm_password: 'Confirmer le mot de passe',
  },
  secondary: {
    sign_in_with: 'Se connecter avec {{methods, list(type: disjunction;)}}',
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
    bind: 'Lier avec {{address}}',
    back: 'Aller en arrière',
    nav_back: 'Retour',
    agree: 'Accepter',
    got_it: 'Compris',
    sign_in_with: 'Connexion avec {{name}}',
    forgot_password: 'Mot de passe oublié ?',
  },
  description: {
    email: 'email',
    phone_number: 'numéro de téléphone',
    reminder: 'Rappel',
    not_found: '404 Non trouvé',
    agree_with_terms: "J'ai lu et accepté les ",
    agree_with_terms_modal: 'Pour continuer, veuillez accepter le <link></link>.',
    terms_of_use: "Conditions d'utilisation",
    create_account: 'Créer un compte',
    or: 'ou',
    enter_passcode: 'Le code a été envoyé à {{address}}',
    passcode_sent: 'Le code a été renvoyé',
    resend_after_seconds: 'Renvoyer après <span>{{seconds}}</span> secondes',
    resend_passcode: 'Renvoyer le code',
    continue_with: 'Continuer avec',
    create_account_id_exists:
      'Le compte avec {{type}} {{value}} existe déjà, voulez-vous vous connecter ?',
    sign_in_id_does_not_exists:
      "Le compte avec {{type}} {{value}} n'existe pas, voulez-vous créer un nouveau compte ?",
    bind_account_title: 'Lier le compte',
    social_create_account: 'Pas de compte ? Vous pouvez créer un nouveau compte et un lien.',
    social_bind_account:
      'Vous avez déjà un compte ? Connectez-vous pour le relier à votre identité sociale.',
    social_bind_with_existing:
      'Nous trouvons un compte connexe, vous pouvez le relier directement.',
    reset_password: 'Réinitialiser le mot de passe',
    reset_password_description_email:
      "Entrez l'adresse e-mail associée à votre compte et nous vous enverrons par e-mail le code de vérification pour réinitialiser votre mot de passe.",
    reset_password_description_sms:
      'Entrez le numéro de téléphone associé à votre compte et nous vous enverrons le code de vérification par SMS pour réinitialiser votre mot de passe.',
    new_password: 'Nouveau mot de passe',
  },
  error: {
    username_password_mismatch: "Le nom d'utilisateur et le mot de passe ne correspondent pas",
    username_required: "Le nom d'utilisateur est requis",
    password_required: 'Le mot de passe est requis',
    username_exists: "Ce Nom d'utilisateur existe déjà",
    username_should_not_start_with_number:
      "Le nom d'utilisateur ne doit pas commencer par un chiffre",
    username_valid_charset:
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
};

const fr: typeof en = Object.freeze({
  translation,
});

export default fr;
