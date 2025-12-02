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
    error_send_failed: "Échec de l'envoi du code de vérification. Veuillez réessayer plus tard.",
    error_invalid_code: 'Le code de vérification est invalide ou a expiré.',
    error_verify_failed: 'Échec de la vérification. Veuillez saisir le code à nouveau.',
    verification_required: 'La vérification a expiré. Veuillez confirmer à nouveau votre identité.',
  },
  password_verification: {
    title: 'Vérifier le mot de passe',
    description:
      'Pour protéger votre compte, saisissez votre mot de passe afin de confirmer votre identité.',
    error_failed: 'La vérification a échoué. Vérifiez votre mot de passe.',
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
  email: {
    title: "Lier l'e-mail",
    description: 'Liez votre e-mail pour vous connecter ou faciliter la récupération du compte.',
    verification_title: 'Saisissez le code de vérification par e-mail',
    verification_description:
      'Le code de vérification a été envoyé à votre e-mail {{email_address}}.',
    success: 'E-mail principal lié avec succès.',
    verification_required: 'La vérification a expiré. Veuillez confirmer à nouveau votre identité.',
  },
  phone: {
    title: 'Lier le téléphone',
    description:
      'Liez votre numéro de téléphone pour vous connecter ou faciliter la récupération du compte.',
    verification_title: 'Saisissez le code de vérification du téléphone',
    verification_description:
      'Le code de vérification a été envoyé sur votre téléphone {{phone_number}}.',
    success: 'Téléphone principal lié avec succès.',
    verification_required: 'La vérification a expiré. Veuillez confirmer à nouveau votre identité.',
  },
  username: {
    title: "Définir le nom d'utilisateur",
    description:
      "Le nom d'utilisateur doit contenir uniquement des lettres, des chiffres et des tirets bas.",
    success: "Nom d'utilisateur mis à jour avec succès.",
  },
  password: {
    title: 'Définir le mot de passe',
    description: 'Créez un nouveau mot de passe pour sécuriser votre compte.',
    success: 'Mot de passe mis à jour avec succès.',
  },

  code_verification: {
    send: 'Envoyer le code de vérification',
    resend: 'Renvoyer le code',
    resend_countdown: 'Pas encore reçu ? Renvoyez après {{seconds}} s.',
  },

  email_verification: {
    title: 'Vérifiez votre e-mail',
    prepare_description:
      'Confirmez votre identité pour protéger la sécurité de votre compte. Envoyez le code de vérification à votre e-mail.',
    email_label: 'Adresse e-mail',
    send: 'Envoyer le code de vérification',
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
      'Confirmez votre identité pour protéger la sécurité de votre compte. Envoyez le code de vérification sur votre téléphone.',
    phone_label: 'Numéro de téléphone',
    send: 'Envoyer le code de vérification',
    description:
      'Le code de vérification a été envoyé à votre téléphone {{phone}}. Saisissez le code pour continuer.',
    resend: 'Renvoyer le code',
    resend_countdown: 'Pas encore reçu ? Renvoyez après {{seconds}} s.',
    error_send_failed: "Échec de l'envoi du code de vérification. Veuillez réessayer plus tard.",
    error_verify_failed: 'Échec de la vérification. Veuillez saisir le code à nouveau.',
    error_invalid_code: 'Le code de vérification est invalide ou a expiré.',
  },
  update_success: {
    default: {
      title: 'Mise à jour réussie',
      description: 'Vos modifications ont été enregistrées avec succès.',
    },
    email: {
      title: 'Adresse e-mail mise à jour !',
      description: "L'adresse e-mail de votre compte a bien été modifiée.",
    },
    phone: {
      title: 'Numéro de téléphone mis à jour !',
      description: 'Le numéro de téléphone de votre compte a bien été modifié.',
    },
    username: {
      title: "Nom d'utilisateur mis à jour !",
      description: "Le nom d'utilisateur de votre compte a bien été modifié.",
    },

    password: {
      title: 'Mot de passe mis à jour !',
      description: 'Le mot de passe de votre compte a bien été modifié.',
    },
  },
};

export default Object.freeze(account_center);
