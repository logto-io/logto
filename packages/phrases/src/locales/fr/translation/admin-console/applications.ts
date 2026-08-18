const applications = {
  page_title: 'Applications',
  title: 'Applications',
  subtitle:
    "Configurez une application mobile, une page unique, machine to machine ou une application traditionnelle pour utiliser Logto pour l'authentification.",
  subtitle_with_app_type: "Configurez l'authentification Logto pour votre application {{name}}",
  create_device_flow_description:
    "Créez une application native utilisant l'octroi d'autorisation de dispositif OAuth 2.0 pour les appareils à saisie limitée ou les applications headless.",
  create: 'Créer une application',
  create_third_party: 'Créer une application tierce',
  create_thrid_party_modal_title: 'Créer une app tierce ({{type}})',
  application_name: "Nom de l'application",
  application_name_placeholder: 'Mon app',
  application_description: "Description de l'application",
  application_description_placeholder: 'Entrer la description de votre application',
  select_application_type: "Sélectionner un type d'application",
  no_application_type_selected: "Vous n'avez pas encore sélectionné de type d'application",
  application_created: "L'application a été créée avec succès.",
  tab: {
    my_applications: 'Mes applications',
    third_party_applications: 'Applications tierces',
  },
  app_id: 'App ID',
  type: {
    native: {
      title: 'Application native',
      subtitle: 'Une application qui fonctionne dans un environnement natif',
      description: 'Exemple : application iOS, application Android, application de bureau, TV, CLI',
    },
    spa: {
      title: 'Application à page unique',
      subtitle:
        "Une application qui s'exécute dans un navigateur web et met dynamiquement à jour les données sur place.",
      description: 'Exemple: application React, application Vue',
    },
    traditional: {
      title: 'Web traditionnel',
      subtitle: 'Une application qui met à jour les pages par le seul serveur web.',
      description: 'Exemple: Next.js, PHP',
    },
    machine_to_machine: {
      title: 'Machine-to-Machine',
      subtitle:
        'Une application (généralement un service) qui communique directement avec les ressources',
      description: 'Par exemple, un service backend',
    },
    protected: {
      title: 'Application protégée',
      subtitle: 'Une application protégée par Logto',
      description: 'N/A',
    },
    saml: {
      title: 'Application SAML',
      subtitle: 'Une application utilisée comme un connecteur IdP SAML',
      description: 'Par exemple, SAML',
    },
    third_party: {
      title: 'Application tierce',
      subtitle: 'Une application utilisée comme connecteur IdP tiers',
      description: 'Par exemple, OIDC, SAML',
    },
  },
  authorization_flow: {
    title: "Flux d'autorisation",
    tooltip:
      "Sélectionnez le flux d'autorisation pour votre application. Une fois défini, il ne pourra pas être modifié.",
    authorization_code: {
      title: 'Authorization code',
      description:
        "Le type d'autorisation par défaut et le plus courant. Les utilisateurs sont redirigés vers une page de connexion pour autoriser l'accès directement.",
    },
    device_flow: {
      title: 'Device flow',
      description:
        "Pour les appareils à saisie limitée ou les applications sans interface (par ex., téléviseurs, CLI). Les utilisateurs complètent la connexion sur un appareil séparé en saisissant un code d'appareil ou en scannant un QR code.",
    },
  },
  placeholder_title: "Sélectionnez un type d'application pour continuer",
  placeholder_description:
    "Logto utilise une entité d'application pour OIDC pour aider aux tâches telles que l'identification de vos applications, la gestion de la connexion et la création de journaux d'audit",
  third_party_application_placeholder_description:
    "Utilisez Logto comme fournisseur d'identité pour offrir une autorisation OAuth aux services tiers. \n Inclut un écran de consentement utilisateur intégré pour l'accès aux ressources. <a>En savoir plus</a>",
  dynamic_app: {
    title: 'Application dynamique',
    subtitle: 'CIMD',
    description:
      "L'application dynamique permet aux clients OAuth de se connecter sans enregistrement préalable.",
    settings_description:
      "L'application dynamique permet aux clients OAuth de se connecter sans enregistrement préalable. Utilise la spécification OAuth Client ID Metadata Document (CIMD).",
    beta_notice:
      "Application dynamique est actuellement en version bêta. Bienvenue pour l'explorer et <ContactLink>partager vos commentaires</ContactLink>.",
    app_id_placeholder: 'Fourni dynamiquement par chaque client',
    enable_confirm_modal: {
      title: "Activer l'accès dynamique des clients ?",
      content:
        "Tout client OAuth disposant d'une URL d'ID client HTTPS publique et valide peut lancer l'autorisation pour ce locataire sans enregistrement préalable. L'accès reste limité par vos permissions maximales et le consentement de l'utilisateur.",
      beta_pricing_notice:
        "L'application dynamique est gratuite pendant la bêta. Une tarification en option pourra s'appliquer après la bêta. Nous vous préviendrons à l'avance et vous pourrez la désactiver à tout moment.",
    },
    enabled: 'Application dynamique activée avec succès.',
    disable_confirm_modal: {
      title: "Désactiver l'application dynamique ?",
      content:
        "Les clients CIMD ne pourront plus initier de nouvelles demandes d'autorisation. Les autorisations existantes sont conservées et les jetons d'accès déjà émis peuvent rester valides jusqu'à leur expiration.",
    },
    disabled: 'Application dynamique désactivée avec succès.',
    permissions: {
      user_title: 'Utilisateur',
      user_description:
        'Sélectionnez les permissions demandées par les clients OAuth pour accéder à des données utilisateur spécifiques.',
      grant_user_level_permissions: 'Accorder les permissions utilisateur',
      organization_title: 'Organisation',
      organization_description:
        "Sélectionnez les permissions demandées par les clients OAuth pour accéder à des données d'organisation spécifiques.",
      grant_organization_level_permissions: "Accorder les permissions d'organisation",
      permission_delete_confirm:
        "Cette action retirera la permission de l'application dynamique, empêchant les clients OAuth de demander l'autorisation de l'utilisateur pour celle-ci. Êtes-vous sûr de vouloir continuer ?",
    },
  },
  guide: {
    third_party: {
      title: 'Intégrer une application tierce',
      description:
        "Utilisez Logto comme fournisseur d'identité pour offrir une autorisation OAuth aux services tiers. Inclut un écran de consentement utilisateur préconstruit pour un accès sécurisé aux ressources. <a>En savoir plus</a>",
    },
  },
};

export default Object.freeze(applications);
