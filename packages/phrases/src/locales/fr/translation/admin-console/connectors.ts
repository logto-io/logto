const connectors = {
  page_title: 'Connecteurs',
  title: 'Connecteurs',
  subtitle:
    'Configurez des connecteurs pour permettre une expérience de connexion sans mot de passe et sociale.',
  create: 'Ajouter un connecteur social',
  config_sie_notice:
    'Vous avez configuré des connecteurs. Assurez-vous de le configurer dans <a>{{link}}</a>.',
  config_sie_link_text: 'expérience de connexion',
  tab_email_sms: 'Connecteurs Email et SMS',
  tab_social: 'Connecteurs sociaux',
  connector_name: 'Nom du connecteur',
  demo_tip:
    "Le nombre maximum de messages autorisés pour ce connecteur de démonstration est limité à 100 et n'est pas recommandé pour le déploiement dans un environnement de production.",
  social_demo_tip:
    "Le connecteur de démonstration est conçu exclusivement à des fins de démonstration et n'est pas recommandé pour le déploiement dans un environnement de production.",
  connector_type: 'Type',
  connector_status: 'Expérience de connexion',
  connector_status_in_use: "En cours d'utilisation",
  connector_status_not_in_use: 'Non utilisé',
  not_in_use_tip: {
    content:
      "L'option Non utilisé signifie que votre expérience de connexion n'a pas utilisé cette méthode de connexion. <a>{{link}}</a> pour ajouter cette méthode de connexion.",
    go_to_sie: "Aller à l'expérience de connexion",
  },
  placeholder_title: 'Connecteur social',
  placeholder_description:
    "Logto propose de nombreux connecteurs de connexion sociale couramment utilisés, mais vous pouvez également créer le vôtre à l'aide des protocoles standard.",
  save_and_done: 'Sauvegarder et Finis',
  type: {
    email: 'Connecteur Email',
    sms: 'Connecteur SMS',
    social: 'Connecteur Social',
  },
  setup_title: {
    email: 'Configurer le connecteur Email',
    sms: 'Configurer le connecteur SMS',
    social: 'Ajouter un connecteur Social',
  },
  guide: {
    subtitle: 'Un guide étape par étape pour configurer votre connecteur',
    general_setting: 'Paramètres généraux',
    parameter_configuration: 'Configuration des paramètres',
    test_connection: 'Test de connexion',
    name: 'Nom du bouton de connexion sociale',
    name_placeholder: 'Entrez un nom pour le bouton de connexion sociale',
    name_tip:
      'Le nom du bouton de connexion s\'affichera comme "Continuer avec {{name}}". Tenez compte de la longueur du nom si celui-ci devient trop long.',
    logo: 'URL du logo pour le bouton de connexion sociale',
    logo_placeholder: 'https://votre.domaine.cdn/logo.png',
    logo_tip:
      "L'image du logo s'affichera sur le connecteur. Obtenez un lien d'image accessible au public et insérez le lien ici.",
    logo_dark: 'URL du logo pour le bouton de connexion sociale (mode sombre)',
    logo_dark_placeholder: 'https://votre.domaine.cdn/logo.png',
    logo_dark_tip:
      "Définissez le logo de votre connecteur pour le mode sombre après l'avoir activé dans l'expérience de connexion de la console d'administration.",
    logo_dark_collapse: 'Réduire',
    logo_dark_show: "Afficher l'option du logo pour le mode sombre",
    target: "Nom du fournisseur d'identité",
    target_placeholder: "Entrez le nom du fournisseur d'identité du connecteur",
    target_tip:
      'La valeur de "nom de l\'IdP" peut être une chaîne d\'identificateur unique pour distinguer vos identifiants sociaux.',
    target_tip_standard:
      'La valeur de "nom de l\'IdP" peut être une chaîne d\'identificateur unique pour distinguer vos identifiants sociaux. Ce paramètre ne peut pas être modifié une fois que le connecteur est créé.',
    target_tooltip:
      "«Cible» dans les connecteurs sociaux de Logto fait référence à la «source» de vos identités sociales. Dans la conception de Logto, nous n'acceptons pas la même «cible» d'une plateforme spécifique pour éviter les conflits. Vous devriez être très attentif avant d'ajouter un connecteur car vous NE POUVEZ PAS changer sa valeur une fois que vous l'avez créé. <a>En savoir plus</a>",
    target_conflict:
      "Le nom de l'IdP saisi correspond au nom existant <span>nom</span>. Utiliser le même nom d'IdP peut entraîner un comportement de connexion inattendu où les utilisateurs peuvent accéder au même compte via deux connecteurs différents.",
    target_conflict_line2:
      'Si vous souhaitez remplacer le connecteur actuel par le même fournisseur d\'identité et permettre aux utilisateurs précédents de se connecter sans s\'inscrire à nouveau, veuillez supprimer le connecteur <span>nom</span> et créer un nouveau connecteur avec le même nom "IdP".',
    target_conflict_line3:
      'Si vous souhaitez vous connecter à un fournisseur d\'identité différent, modifiez le "nom de l\'IdP" et poursuivez.',
    config: 'Entrez votre JSON de configuration',
    sync_profile: 'Synchroniser les informations de profil',
    sync_profile_only_at_sign_up: "Synchroniser uniquement à l'inscription",
    sync_profile_each_sign_in: 'Toujours effectuer une synchronisation à chaque connexion',
    sync_profile_tip:
      'Synchronisez le profil de base du fournisseur social, tel que les noms des utilisateurs et leurs avatars.',
    callback_uri: 'URI de rappel',
    callback_uri_description:
      "Également appelée URI de redirection, c'est l'URI dans Logto où les utilisateurs seront renvoyés après l'autorisation sociale, copiez et collez sur la page de configuration du fournisseur social.",
    acs_url: "URL de service de consommation d'assertions",
  },
  platform: {
    universal: 'Universel',
    web: 'Web',
    native: 'Natifs',
  },
  add_multi_platform:
    ' prend en charge plusieurs plateformes, sélectionnez une plateforme pour continuer',
  drawer_title: 'Guide des connecteurs',
  drawer_subtitle: 'Suivez les instructions pour intégrer votre connecteur',
  unknown: 'Connecteur inconnu',
  standard_connectors: 'Connecteurs standard',
};

export default Object.freeze(connectors);
