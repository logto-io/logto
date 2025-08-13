const profile = {
  page_title: 'Paramètres du compte',
  title: 'Paramètres du compte',
  description:
    'Modifiez les paramètres de votre compte et gérez vos informations personnelles ici pour garantir la sécurité de votre compte.',
  settings: {
    title: 'Paramètres du profil',
    profile_information: 'Informations du profil',
    avatar: 'Avatar',
    name: 'Nom',
    username: "Nom d'utilisateur",
  },
  link_account: {
    title: 'Lien de compte',
    email_sign_in: 'Connexion par e-mail',
    email: 'Email',
    social_sign_in: 'Connexion sociale',
    link_email: 'Lier le courriel',
    link_email_subtitle:
      'Liez votre e-mail pour vous connecter ou pour vous aider à récupérer votre compte.',
    email_required: "L'email est obligatoire",
    invalid_email: 'Adresse e-mail invalide',
    identical_email_address: "L'adresse e-mail saisie est identique à celle en cours",
    anonymous: 'Anonyme',
  },
  password: {
    title: 'Mot de passe et sécurité',
    password: 'Mot de passe',
    password_setting: 'Paramètres de mot de passe',
    new_password: 'Nouveau mot de passe',
    confirm_password: 'Confirmer le mot de passe',
    enter_password: 'Entrez le mot de passe actuel',
    enter_password_subtitle:
      "Vérifiez que c'est vous pour protéger la sécurité de votre compte. Veuillez saisir votre mot de passe actuel avant de le changer.",
    set_password: 'Définir le mot de passe',
    verify_via_password: 'Vérifier via mot de passe',
    show_password: 'Afficher le mot de passe',
    required: 'Le mot de passe est obligatoire',
    do_not_match: 'Les mots de passe ne correspondent pas. Veuillez réessayer.',
  },
  code: {
    enter_verification_code: 'Entrez le code de vérification',
    enter_verification_code_subtitle:
      'Le code de vérification a été envoyé à <strong>{{target}}</strong>',
    verify_via_code: 'Vérifier via code de vérification',
    resend: 'Renvoyer le code de vérification',
    resend_countdown: 'Renvojer dans {{countdown}} secondes',
  },
  delete_account: {
    title: 'Supprimer le compte',
    label: 'Supprimer le compte',
    description:
      "La suppression de votre compte supprimera toutes vos informations personnelles, vos données d'utilisateur et votre configuration. Cette action ne peut pas être annulée.",
    button: 'Supprimer le compte',
    p: {
      has_issue:
        "Nous sommes désolés d'apprendre que vous souhaitez supprimer votre compte. Avant de pouvoir supprimer votre compte, vous devez résoudre les problèmes suivants.",
      after_resolved:
        "Une fois que vous avez résolu les problèmes, vous pouvez supprimer votre compte. N'hésitez pas à nous contacter si vous avez besoin d'aide.",
      check_information:
        "Nous sommes désolés d'apprendre que vous souhaitez supprimer votre compte. Veuillez vérifier les informations ci-dessous avant de continuer.",
      remove_all_data:
        'La suppression de votre compte supprimera définitivement toutes les données vous concernant dans Logto Cloud. Assurez-vous donc de sauvegarder toutes les données importantes avant de continuer.',
      confirm_information:
        'Veuillez confirmer que les informations ci-dessus correspondent à vos attentes. Une fois que vous aurez supprimé votre compte, nous ne pourrons pas le récupérer.',
      has_admin_role:
        'Étant donné que vous avez un rôle d’administrateur dans le locataire suivant, il sera supprimé en même temps que votre compte :',
      has_admin_role_other:
        'Étant donné que vous avez un rôle d’administrateur dans les locataires suivants, ils seront supprimés en même temps que votre compte :',
      quit_tenant: 'Vous êtes sur le point de quitter le locataire suivant :',
      quit_tenant_other: 'Vous êtes sur le point de quitter les locataires suivants :',
    },
    issues: {
      paid_plan: 'Le locataire suivant a un plan payant, veuillez d’abord annuler l’abonnement :',
      paid_plan_other:
        'Les locataires suivants ont des plans payants, veuillez d’abord annuler l’abonnement :',
      subscription_status: 'Le locataire suivant a un problème de statut d’abonnement :',
      subscription_status_other:
        'Les locataires suivants ont des problèmes de statut d’abonnement :',
      open_invoice: 'Le locataire suivant a une facture ouverte :',
      open_invoice_other: 'Les locataires suivants ont des factures ouvertes :',
    },
    error_occurred: 'Une erreur est survenue',
    error_occurred_description:
      "Désolé, quelque chose s'est mal passé lors de la suppression de votre compte :",
    request_id: 'ID de la demande : {{requestId}}',
    try_again_later:
      "Veuillez réessayer plus tard. Si le problème persiste, veuillez contacter l'équipe Logto avec l'ID de la demande.",
    final_confirmation: 'Confirmation finale',
    about_to_start_deletion:
      'Vous êtes sur le point de commencer le processus de suppression et cette action ne peut pas être annulée.',
    permanently_delete: 'Supprimer définitivement',
  },
  set: 'Définir',
  change: 'Modifier',
  link: 'Lier',
  unlink: 'Détacher',
  not_set: 'Pas défini',
  change_avatar: "Modifier l'avatar",
  change_name: 'Modifier le nom',
  change_username: "Modifier le nom d'utilisateur",
  set_name: 'Définir le nom',
  email_changed: 'Email modifié.',
  password_changed: 'Mot de passe modifié.',
  updated: '{{target}} mis à jour.',
  linked: '{{target}} lié.',
  unlinked: '{{target}} détaché.',
  email_exists_reminder:
    'Cet e-mail {{email}} est associé à un compte existant. Liez un autre e-mail ici.',
  unlink_confirm_text: 'Oui, détacher',
  unlink_reminder:
    'Les utilisateurs ne pourront plus se connecter avec le compte <span></span> si vous le détachez. Êtes-vous sûr de vouloir continuer ?',
  fields: {
    name: 'Nom',
    name_description:
      'Le nom complet de l\'utilisateur sous forme affichable, incluant tous les composants du nom (par exemple, "Jane Doe").',
    avatar: 'Avatar',
    avatar_description: "URL de l'image d'avatar de l'utilisateur.",
    familyName: 'Nom de famille',
    familyName_description: 'Le(s) nom(s) de famille de l\'utilisateur (par exemple, "Doe").',
    givenName: 'Prénom',
    givenName_description: 'Le(s) prénom(s) de l\'utilisateur (par exemple, "Jane").',
    middleName: 'Deuxième prénom',
    middleName_description: 'Le(s) deuxième(s) prénom(s) de l\'utilisateur (par exemple, "Marie").',
    nickname: 'Surnom',
    nickname_description:
      "Nom familier ou surnom de l'utilisateur, qui peut différer de son nom légal.",
    preferredUsername: "Nom d'utilisateur préféré",
    preferredUsername_description:
      "Identifiant abrégé par lequel l'utilisateur souhaite être référencé.",
    profile: 'Profil',
    profile_description:
      "URL de la page de profil lisible par l'utilisateur (par exemple, profil de réseau social).",
    website: 'Site web',
    website_description: "URL du site web personnel ou du blog de l'utilisateur.",
    gender: 'Genre',
    gender_description:
      'Le genre auto-identifié de l\'utilisateur (par exemple, "Femme", "Homme", "Non-binaire").',
    birthdate: 'Date de naissance',
    birthdate_description:
      'La date de naissance de l\'utilisateur dans un format spécifié (par exemple, "MM-jj-aaaa").',
    zoneinfo: 'Fuseau horaire',
    zoneinfo_description:
      'Le fuseau horaire de l\'utilisateur au format IANA (par exemple, "America/New_York" ou "Europe/Paris").',
    locale: 'Langue',
    locale_description:
      'La langue de l\'utilisateur au format IETF BCP 47 (par exemple, "fr-FR" ou "zh-CN").',
    address: {
      formatted: 'Adresse',
      streetAddress: 'Adresse postale',
      locality: 'Ville',
      region: 'Région',
      postalCode: 'Code postal',
      country: 'Pays',
    },
    address_description:
      "L'adresse complète de l'utilisateur sous forme affichable, incluant tous les composants de l'adresse (par exemple, \"123 Rue Principale, Ville, France 12345\").",
    fullname: 'Nom complet',
    fullname_description:
      'Combine de manière flexible familyName, givenName et middleName en fonction de la configuration.',
  },
};

export default Object.freeze(profile);
