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
    connector_logo: 'Logo du connecteur',
    connector_logo_tip: 'Le logo sera affiché sur le bouton de connexion du connecteur.',
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
    enable_token_storage: {
      title: 'Stocker les jetons pour un accès API persistant',
      description:
        "Stockez les jetons d'accès et de rafraîchissement dans le Secret Vault. Permet des appels API automatisés sans consentement utilisateur répété. Exemple : laissez votre agent AI ajouter des événements à Google Calendar avec une autorisation persistante. <a>Découvrez comment appeler des API tierces</a>",
    },
    callback_uri: 'URI de redirection (URI de rappel)',
    callback_uri_description:
      "L'URI de redirection est l'endroit où les utilisateurs sont redirigés après l'autorisation sociale. Ajoutez cette URI à la configuration de votre IdP.",
    callback_uri_custom_domain_description:
      'Si vous utilisez plusieurs <a>domaines personnalisés</a> dans Logto, veillez à ajouter toutes les URI de rappel correspondantes à votre IdP afin que la connexion sociale fonctionne sur chaque domaine.\n\nLe domaine Logto par défaut (*.logto.app) est toujours valide ; incluez-le uniquement si vous souhaitez aussi prendre en charge les connexions sous ce domaine.',
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
  create_form: {
    third_party_connectors:
      "Intégrez des fournisseurs tiers pour une connexion sociale rapide, un lien de compte social, et l'accès API. <a>En savoir plus</a>",
    standard_connectors:
      'Ou vous pouvez personnaliser votre connecteur social par un protocole standard.',
  },
};

export default Object.freeze(connectors);
