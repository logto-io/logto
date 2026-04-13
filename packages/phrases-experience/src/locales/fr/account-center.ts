const account_center = {
  home: {
    title: 'Page introuvable',
    description: "Cette page n'est pas disponible.",
  },
  page: {
    title: 'Compte',
    security_title: 'Sécurité',
    security_description:
      "Modifiez ici les paramètres de votre compte afin d'en garantir la sécurité.",
    support: 'Assistance',
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
    error_failed: 'Mot de passe incorrect. Veuillez vérifier votre saisie.',
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
  security: {
    add: 'Ajouter',
    change: 'Modifier',
    remove: 'Supprimer',
    not_set: 'Non défini',
    social_sign_in: 'Connexion sociale',
    social_not_linked: 'Non lié',
    email_phone: 'E-mail / Téléphone',
    email: 'E-mail',
    phone: 'Téléphone',
    password: 'Mot de passe',
    configured: 'Configuré',
    not_configured: 'Non configuré',
    two_step_verification: 'Vérification en deux étapes',
    authenticator_app: "Application d'authentification",
    passkeys: 'Passkeys',
    backup_codes: 'Codes de secours',
    email_verification_code: 'Code de vérification par e-mail',
    phone_verification_code: 'Code de vérification par téléphone',
    passkeys_count_one: '{{count}} passkey',
    passkeys_count_other: '{{count}} passkeys',
    backup_codes_count_one: '{{count}} code restant',
    backup_codes_count_other: '{{count}} codes restants',
    view: 'Voir',
    manage: 'Gérer',
    turn_on_2_step_verification: 'Activer la vérification en deux étapes',
    turn_on_2_step_verification_description:
      'Ajoutez une couche de sécurité supplémentaire. Vous serez invité à effectuer une deuxième étape de vérification lors de la connexion.',
    turn_off_2_step_verification: 'Désactiver la vérification en deux étapes',
    turn_off_2_step_verification_description:
      'La désactivation de la vérification en deux étapes supprimera la couche de protection supplémentaire de votre compte lors de la connexion. Êtes-vous sûr de vouloir continuer ?',
    disable_2_step_verification: 'Désactiver',
    no_verification_method_warning:
      "Vous n'avez pas ajouté de deuxième méthode de vérification. Ajoutez-en au moins une pour activer la vérification en deux étapes lors de la connexion.",
    account_removal: 'Suppression du compte',
    delete_your_account: 'Supprimez votre compte',
    delete_account: 'Supprimer le compte',
    remove_email_confirmation_title: "Supprimer l'adresse e-mail",
    remove_email_confirmation_description:
      'Une fois supprimée, vous ne pourrez plus vous connecter avec cette adresse e-mail. Êtes-vous sûr de vouloir continuer ?',
    remove_phone_confirmation_title: 'Supprimer le numéro de téléphone',
    remove_phone_confirmation_description:
      'Une fois supprimé, vous ne pourrez plus vous connecter avec ce numéro de téléphone. Êtes-vous sûr de vouloir continuer ?',
    email_removed: "L'adresse e-mail a été supprimée avec succès.",
    phone_removed: 'Le numéro de téléphone a été supprimé avec succès.',
  },
  social: {
    linked: '{{connector}} a été lié avec succès.',
    not_enabled:
      "Cette méthode de connexion sociale n'est pas activée. Veuillez contacter votre administrateur pour obtenir de l'aide.",
    removed: '{{connector}} a été supprimé avec succès.',
    remove_confirmation_title: 'Supprimer le compte social',
    remove_confirmation_description:
      "Si vous supprimez {{connector}}, vous ne pourrez peut-être plus vous connecter avec ce compte avant de l'ajouter à nouveau.",
  },
  password: {
    title: 'Définir le mot de passe',
    description: 'Créez un nouveau mot de passe pour sécuriser votre compte.',
    success: 'Mot de passe mis à jour avec succès.',
  },
  code_verification: {
    send: 'Envoyer le code de vérification',
    resend: 'Pas encore reçu ? <a>Renvoyer le code de vérification</a>',
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
    resend: 'Pas encore reçu ? <a>Renvoyer le code de vérification</a>',
    not_received: 'Pas encore reçu ?',
    resend_action: 'Renvoyer le code de vérification',
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
    resend: 'Pas encore reçu ? <a>Renvoyer le code de vérification</a>',
    resend_countdown: 'Pas encore reçu ? Renvoyez après {{seconds}} s.',
    error_send_failed: "Échec de l'envoi du code de vérification. Veuillez réessayer plus tard.",
    error_verify_failed: 'Échec de la vérification. Veuillez saisir le code à nouveau.',
    error_invalid_code: 'Le code de vérification est invalide ou a expiré.',
  },
  mfa: {
    totp_already_added:
      "Vous avez déjà ajouté une application d'authentification. Veuillez d'abord supprimer celle qui existe.",
    totp_not_enabled:
      "L'application d'authentification OTP n'est pas activée. Veuillez contacter votre administrateur pour obtenir de l'aide.",
    backup_code_already_added:
      "Vous avez déjà des codes de secours actifs. Veuillez les utiliser ou les supprimer avant d'en générer de nouveaux.",
    backup_code_not_enabled:
      "Le code de secours n'est pas activé. Veuillez contacter votre administrateur pour obtenir de l'aide.",
    backup_code_requires_other_mfa:
      "Les codes de secours nécessitent qu'une autre méthode MFA soit d'abord configurée.",
    passkey_not_enabled:
      "Passkey n'est pas activé. Veuillez contacter votre administrateur pour obtenir de l'aide.",
    passkey_already_registered:
      'Ce passkey est déjà enregistré sur votre compte. Veuillez utiliser un autre authentificateur.',
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
    totp: {
      title: "Application d'authentification ajoutée !",
      description: "Votre application d'authentification a été liée avec succès à votre compte.",
    },
    totp_replaced: {
      title: "Application d'authentification remplacée !",
      description: "Votre application d'authentification a été remplacée avec succès.",
    },
    backup_code: {
      title: 'Codes de secours générés !',
      description: 'Vos codes de secours ont été enregistrés. Conservez-les en lieu sûr.',
    },
    passkey: {
      title: 'Passkey ajouté !',
      description: 'Votre passkey a été lié avec succès à votre compte.',
    },
    social: {
      title: 'Compte social lié !',
      description: 'Votre compte social a été lié avec succès.',
    },
  },
  backup_code: {
    title: 'Codes de secours',
    description:
      "Vous pouvez utiliser l'un de ces codes de secours pour accéder à votre compte si vous rencontrez des problèmes lors de la vérification en deux étapes. Chaque code ne peut être utilisé qu'une seule fois.",
    copy_hint: 'Assurez-vous de les copier et de les conserver dans un endroit sûr.',
    generate_new_title: 'Générer de nouveaux codes de secours',
    generate_new: 'Générer de nouveaux codes de secours',
  },
  passkey: {
    title: 'Passkeys',
    added: 'Ajouté : {{date}}',
    last_used: 'Dernière utilisation : {{date}}',
    never_used: 'Jamais',
    unnamed: 'Passkey sans nom',
    renamed: 'Passkey renommé avec succès.',
    deleted: 'Passkey supprimé avec succès.',
    add_another_title: 'Ajouter un autre passkey',
    add_another_description:
      "Enregistrez votre passkey à l'aide de la biométrie de l'appareil, des clés de sécurité (ex. YubiKey) ou d'autres méthodes disponibles.",
    add_passkey: 'Ajouter un passkey',
    delete_confirmation_title: 'Supprimer votre passkey',
    delete_confirmation_description:
      "Si vous supprimez ce passkey, vous ne pourrez plus l'utiliser pour vous vérifier.",
    rename_passkey: 'Renommer le passkey',
    rename_description: 'Entrez un nouveau nom pour ce passkey.',
    name_this_passkey: "Nommer ce passkey de l'appareil",
    name_passkey_description:
      "Vous avez vérifié cet appareil avec succès pour l'authentification en deux étapes. Personnalisez le nom pour le reconnaître si vous avez plusieurs clés.",
    name_input_label: 'Nom',
  },
};

export default Object.freeze(account_center);
