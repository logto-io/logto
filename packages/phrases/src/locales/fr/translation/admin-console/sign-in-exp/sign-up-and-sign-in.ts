const sign_up_and_sign_in = {
  identifiers_email: 'Adresse e-mail',
  identifiers_phone: 'Numéro de téléphone',
  identifiers_username: 'Nom d’utilisateur',
  identifiers_email_or_sms: 'Adresse e-mail ou numéro de téléphone',
  identifiers_none: 'Non applicable',
  and: 'et',
  or: 'ou',
  sign_up: {
    title: 'INSCRIPTION',
    sign_up_identifier: "Identificateur d'inscription",
    identifier_description:
      "L'identificateur d'inscription est nécessaire pour la création de compte et doit être inclus dans vote écran de connexion.",
    sign_up_authentication: "Paramètres d'authentification pour l'inscription",
    authentication_description:
      "Toutes les actions sélectionnées seront obligatoires pour que les utilisateurs terminent le processus d'inscription.",
    set_a_password_option: 'Créer votre mot de passe',
    verify_at_sign_up_option: "Vérifier lors de l'inscription",
    social_only_creation_description:
      "(Ceci s'applique à la création de compte uniquement via un réseau social)",
  },
  sign_in: {
    title: 'CONNEXION',
    sign_in_identifier_and_auth:
      "Identificateurs et paramètres d'authentification pour la connexion",
    description:
      "Les utilisateurs peuvent se connecter en utilisant n'importe quelle option disponible. Ajustez la mise en page en faisant glisser et en déposant les options ci-dessous.",
    add_sign_in_method: 'Ajouter une méthode de connexion',
    password_auth: 'Mot de passe',
    verification_code_auth: 'Code de vérification',
    auth_swap_tip:
      'Echangez les options ci-dessous pour déterminer celle qui apparait en premier dans le processus.',
    require_auth_factor: "Vous devez sélectionner au moins un élément d'authentification.",
  },
  social_sign_in: {
    title: 'CONNEXION VIA RÉSEAU SOCIAL',
    social_sign_in: 'Connexion via réseau social',
    description:
      "Selon l'identificateur obligatoire que vous avez mis en place, votre utilisateur peut être invité à fournir un identificateur lors de l'inscription via un réseau social.",
    add_social_connector: 'Ajouter un connecteur social',
    set_up_hint: {
      not_in_list: 'Pas dans la liste?',
      set_up_more: 'Configurer',
      go_to: "d'autres connecteurs sociaux maintenant.",
    },
  },
  tip: {
    set_a_password:
      "Un ensemble unique de mot de passe pour votre nom d'utilisateur est essentiel.",
    verify_at_sign_up:
      "Nous ne prenons actuellement en charge que les adresses e-mail vérifiée. Votre base utilisateur peut contenir un grand nombre d'adresses e-mail de mauvaise qualité s'il n'y a pas de validation.",
    password_auth:
      "Ceci est essentiel car vous avez activé l'option de configuration d'un mot de passe au cours du processus d'inscription.",
    verification_code_auth:
      "Ceci est essentiel car vous avez uniquement activé l'option de fourniture d'un code de vérification lors de l'inscription. Vous pouvez décocher la case lorsque la configuration d'un mot de passe est autorisée lors du processus d'inscription.",
    delete_sign_in_method:
      'Ceci est essentiel car vous avez sélectionné {{identifier}} comme identificateur requis.',
  },
  advanced_options: {
    title: 'OPTIONS AVANCÉES',
    enable_single_sign_on: "Activer l'authentification unique en entreprise (SSO)",
    enable_single_sign_on_description:
      "Permettre aux utilisateurs de se connecter à l'application en utilisant une authentification unique avec leurs identités d'entreprise.",
    single_sign_on_hint: {
      prefix: 'Aller à ',
      link: '"Entreprise SSO"',
      suffix: "section pour configurer d'autres connecteurs d'entreprise.",
    },
    enable_user_registration: "Activer l'inscription des utilisateurs",
    enable_user_registration_description:
      "Activer ou interdire l'inscription des utilisateurs. Une fois désactivée, les utilisateurs peuvent toujours être ajoutés à la console d'administration mais ne peuvent plus créer de compte via l'interface de connexion.",
  },
};

export default Object.freeze(sign_up_and_sign_in);
