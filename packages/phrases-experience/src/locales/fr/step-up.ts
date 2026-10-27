const step_up = {
  verify_your_identity: 'Vérifiez votre identité',
  choose_method_description:
    "Pour continuer, confirmez qu'il s'agit bien de vous avec l'une des méthodes suivantes.",
  password: 'Mot de passe',
  password_description: 'Saisissez le mot de passe de votre compte',
  enter_password_description: 'Saisissez le mot de passe de votre compte pour continuer.',
  enter_verification_code_description: 'Saisissez le code de vérification envoyé à {{identifier}}.',
  subject_proof_description:
    "Pour continuer, confirmez qu'il s'agit bien de vous via un compte lié au vôtre. Vous pourrez ensuite configurer une méthode de vérification.",
  subject_mismatch: 'Le compte ne correspond pas',
  subject_mismatch_description:
    "Le compte que vous avez utilisé n'est pas celui avec lequel vous êtes connecté. Utilisez le compte avec lequel vous vous êtes connecté pour continuer.",
  no_method_available: 'Aucune méthode de vérification disponible',
  no_method_available_description:
    'Votre compte ne dispose d’aucune méthode permettant de compléter cette vérification. Veuillez contacter votre administrateur pour obtenir de l’aide.',
};

export default Object.freeze(step_up);
