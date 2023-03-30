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
    enter_password: 'Entrez votre mot de passe',
    enter_password_subtitle: "Vérifiez que c'est bien vous pour protéger votre compte.",
    set_password: 'Définir le mot de passe',
    verify_via_password: 'Vérifier via mot de passe',
    show_password: 'Afficher le mot de passe',
    required: 'Le mot de passe est obligatoire',
    min_length: 'Le mot de passe doit comporter au minimum {{min}} caractères',
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
    dialog_paragraph_1:
      "Nous sommes désolés d'entendre que vous souhaitez supprimer votre compte. La suppression de votre compte supprimera définitivement toutes les données, y compris les informations d'utilisateur, les journaux et les paramètres, et cette action ne peut pas être annulée. Veuillez donc vous assurer de sauvegarder toutes les données importantes avant de continuer.",
    dialog_paragraph_2:
      "Pour poursuivre le processus de suppression de compte, veuillez envoyer un e-mail à notre équipe de support à l'adresse <a>mail</a> avec l'objet « Demande de suppression de compte ». Nous vous aiderons et nous assurerons que toutes vos données sont correctement supprimées de notre système.",
    dialog_paragraph_3:
      "Merci d'avoir choisi Logto Cloud. Si vous avez des questions ou des préoccupations supplémentaires, n'hésitez pas à nous contacter.",
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
  email_changed: 'Email modifié !',
  password_changed: 'Mot de passe modifié !',
  updated: '{{target}} mis à jour !',
  linked: '{{target}} lié !',
  unlinked: '{{target}} détaché !',
  email_exists_reminder:
    'Cet e-mail {{email}} est associé à un compte existant. Liez un autre e-mail ici.',
  unlink_confirm_text: 'Oui, détacher',
  unlink_reminder:
    'Les utilisateurs ne pourront plus se connecter avec le compte <span></span> si vous le détachez. Êtes-vous sûr de vouloir continuer ?',
};

export default profile;
