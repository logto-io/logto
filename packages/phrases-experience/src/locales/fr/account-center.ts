const account_center = {
  header: {
    title: 'Centre de compte',
  },
  home: {
    title: 'Page introuvable',
    description: "Cette page n'est pas disponible.",
  },
  verification: {
    title: 'Vérification de sécurité',
    description:
      "Confirmez que c'est bien vous pour protéger la sécurité de votre compte. Veuillez sélectionner la méthode pour vérifier votre identité.",
  },
  password_verification: {
    title: 'Verify password',
    description: "Verify it's you to protect your account security. Enter your password.",
    error_failed: 'Verification failed. Please check your password.',
  },
  verification_method: {
    password: {
      name: 'Mot de passe',
      description: 'Vérifiez votre mot de passe',
    },
    email: {
      name: 'Code de vérification par e-mail',
      description: 'Envoyer le code de vérification sur votre e-mail',
    },
    phone: {
      name: 'Code de vérification par téléphone',
      description: 'Envoyer le code de vérification sur votre numéro de téléphone',
    },
  },
  email_verification: {
    title: 'Vérifiez votre e-mail',
    prepare_description:
      "Verify it's you to protect your account security. Send the verification code to your email.",
    email_label: 'Email address',
    send: 'Send verification code',
    description:
      'Le code de vérification a été envoyé à votre e-mail {{email}}. Saisissez le code pour continuer.',
    resend: 'Renvoyer le code',
    resend_countdown: 'Pas encore reçu ? Renvoyez après {{seconds}} s.',
    error_send_failed: "Échec de l'envoi du code de vérification. Veuillez réessayer plus tard.",
    error_verify_failed: 'Échec de la vérification. Veuillez saisir le code à nouveau.',
    error_invalid_code: 'Le code de vérification est invalide ou a expiré.',
  },
  phone_verification: {
    title: 'Vérifiez votre téléphone',
    prepare_description:
      "Verify it's you to protect your account security. Send the verification code to your phone.",
    phone_label: 'Numéro de téléphone',
    send: 'Send verification code',
    description:
      'Le code de vérification a été envoyé à votre téléphone {{phone}}. Saisissez le code pour continuer.',
    resend: 'Renvoyer le code',
    resend_countdown: 'Pas encore reçu ? Renvoyez après {{seconds}} s.',
    error_send_failed: "Échec de l'envoi du code de vérification. Veuillez réessayer plus tard.",
    error_verify_failed: 'Échec de la vérification. Veuillez saisir le code à nouveau.',
    error_invalid_code: 'Le code de vérification est invalide ou a expiré.',
  },
};

export default Object.freeze(account_center);
