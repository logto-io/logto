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
    try_another_method: 'Essayez une autre méthode de vérification',
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
    title: 'Lier le numéro de téléphone',
    description:
      'Liez votre numéro de téléphone pour vous connecter ou faciliter la récupération du compte.',
    verification_title: 'Saisissez le code de vérification SMS',
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
    resend: 'Pas encore reçu ? <a>Renvoyer le code de vérification</a>',
    resend_countdown: 'Pas encore reçu ?<span> Renvoyez après {{seconds}} s.</span>',
  },

  email_verification: {
    title: 'Vérifiez votre e-mail',
    prepare_description:
      'Confirmez votre identité pour protéger la sécurité de votre compte. Envoyez le code de vérification à votre e-mail.',
    email_label: 'Adresse e-mail',
    send: 'Envoyer le code de vérification',
    description:
      'Le code de vérification a été envoyé à votre e-mail {{email}}. Saisissez le code pour continuer.',
    resend: 'Pas encore reçu ? <a>Renvoyer le code de vérification</a>',
    resend_countdown: 'Pas encore reçu ?<span> Renvoyez après {{seconds}} s.</span>',
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
    resend: 'Pas encore reçu ? <a>Renvoyer le code de vérification</a>',
    resend_countdown: 'Pas encore reçu ?<span> Renvoyez après {{seconds}} s.</span>',
    error_send_failed: "Échec de l'envoi du code de vérification. Veuillez réessayer plus tard.",
    error_verify_failed: 'Échec de la vérification. Veuillez saisir le code à nouveau.',
    error_invalid_code: 'Le code de vérification est invalide ou a expiré.',
  },
  mfa: {
    totp_already_added:
      "Vous avez déjà ajouté une application d'authentification. Veuillez d'abord supprimer celle qui existe.",
    totp_not_enabled:
      "L'application d'authentification n'est pas activée. Veuillez contacter votre administrateur pour l'activer.",
    backup_code_already_added:
      "Vous avez déjà des codes de secours actifs. Veuillez les utiliser ou les supprimer avant d'en générer de nouveaux.",
    backup_code_not_enabled:
      "Le code de secours n'est pas activé. Veuillez contacter votre administrateur pour l'activer.",
    backup_code_requires_other_mfa:
      "Les codes de secours nécessitent qu'une autre méthode MFA soit d'abord configurée.",
    passkey_not_enabled:
      "Passkey n'est pas activé. Veuillez contacter votre administrateur pour l'activer.",
  },
  update_success: {
    default: {
      title: 'Mis à jour !',
      description: 'Vos informations ont été mises à jour.',
    },
    email: {
      title: 'E-mail mis à jour !',
      description: 'Votre adresse e-mail a été mise à jour avec succès.',
    },
    phone: {
      title: 'Numéro de téléphone mis à jour !',
      description: 'Votre numéro de téléphone a été mis à jour avec succès.',
    },
    username: {
      title: "Nom d'utilisateur modifié !",
      description: "Votre nom d'utilisateur a été mis à jour avec succès.",
    },
    password: {
      title: 'Mot de passe modifié !',
      description: 'Votre mot de passe a été mis à jour avec succès.',
    },
    social: {
      title: 'Compte social lié !',
      description: 'Votre compte social a été lié avec succès.',
    },
    totp: {
      title: "Application d'authentification ajoutée !",
      description: "Votre application d'authentification a été liée avec succès à votre compte.",
    },
    backup_code: {
      title: 'Codes de secours générés !',
      description: 'Vos codes de secours ont été enregistrés. Conservez-les en lieu sûr.',
    },
    backup_code_deleted: {
      title: 'Codes de secours supprimés !',
      description: 'Vos codes de secours ont été supprimés de votre compte.',
    },
    passkey: {
      title: 'Passkey ajouté !',
      description: 'Votre passkey a été lié avec succès à votre compte.',
    },
    passkey_deleted: {
      title: 'Passkey supprimé !',
      description: 'Votre passkey a été supprimé de votre compte.',
    },
  },
  backup_code: {
    title: 'Codes de secours',
    description:
      "Vous pouvez utiliser l'un de ces codes de secours pour accéder à votre compte si vous rencontrez des problèmes lors de la vérification en deux étapes. Chaque code ne peut être utilisé qu'une seule fois.",
    copy_hint: 'Assurez-vous de les copier et de les conserver dans un endroit sûr.',
    generate_new_title: 'Générer de nouveaux codes de secours',
    generate_new: 'Générer de nouveaux codes de secours',
    delete_confirmation_title: 'Supprimer vos codes de secours',
    delete_confirmation_description:
      'Si vous supprimez ces codes de secours, vous ne pourrez plus les utiliser pour la vérification.',
  },
  passkey: {
    title: 'Passkeys',
    added: 'Ajouté : {{date}}',
    last_used: 'Dernière utilisation : {{date}}',
    never_used: 'Jamais',
    unnamed: 'Passkey sans nom',
    renamed: 'Passkey renommé avec succès.',
    add_another_title: 'Ajouter un autre passkey',
    add_another_description:
      "Enregistrez votre passkey à l'aide de la biométrie de l'appareil, des clés de sécurité (ex. YubiKey) ou d'autres méthodes disponibles.",
    add_passkey: 'Ajouter un passkey',
    delete_confirmation_title: 'Supprimer le passkey',
    delete_confirmation_description:
      'Êtes-vous sûr de vouloir supprimer « {{name}} » ? Vous ne pourrez plus utiliser ce passkey pour vous connecter.',
    rename_passkey: 'Renommer le passkey',
    rename_description: 'Entrez un nouveau nom pour ce passkey.',
  },
};

export default Object.freeze(account_center);
