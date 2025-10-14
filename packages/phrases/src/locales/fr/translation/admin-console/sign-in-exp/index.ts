import content from './content.js';
import custom_profile_fields from './custom-profile-fields.js';
import sign_up_and_sign_in from './sign-up-and-sign-in.js';

const sign_in_exp = {
  page_title: 'Expérience de connexion',
  page_title_with_account: 'Connexion et compte',
  title: 'Connexion et compte',
  description:
    "Personnalisez les flux d'authentification et l'interface utilisateur, et prévisualisez l'expérience prête à l'emploi en temps réel.",
  tabs: {
    branding: 'Image de marque',
    sign_up_and_sign_in: 'Inscription et connexion',
    collect_user_profile: 'Collecter le profil utilisateur',
    account_center: 'Centre de compte',
    content: 'Contenu',
    password_policy: 'Politique de mot de passe',
  },
  welcome: {
    title: "Personnaliser l'expérience de connexion",
    description:
      'Démarrez rapidement avec la première configuration de connexion. Ce guide vous guide à travers tous les paramètres nécessaires',
    get_started: 'Commencer',
    apply_remind:
      "Veuillez noter que l'expérience de connexion s'appliquera à toutes les applications sous ce compte.",
  },
  color: {
    title: 'COULEUR',
    primary_color: 'Couleur de la marque',
    dark_primary_color: 'Couleur de la marque (Sombre)',
    dark_mode: 'Activer le mode sombre',
    dark_mode_description:
      "Votre application aura un thème en mode sombre généré automatiquement en fonction de la couleur de votre marque et de l'algorithme de Logto. Vous êtes libre de le personnaliser.",
    dark_mode_reset_tip:
      'Recalculer la couleur du mode sombre en fonction de la couleur de la marque.',
    reset: 'Recalculer',
  },
  branding: {
    title: 'ZONE DE MARQUE',
    ui_style: 'Style',
    with_light: '{{value}}',
    with_dark: '{{value}} (dark)',
    app_logo_and_favicon: "Logo de l'app et favicon",
    company_logo_and_favicon: 'Logo de la société et favicon',
    organization_logo_and_favicon: "Logo de l'organisation et favicon",
  },
  branding_uploads: {
    app_logo: {
      title: "Logo de l'app",
      url: "URL du logo de l'app",
      url_placeholder: 'https://your.cdn.domain/logo.png',
      error: "Logo de l'app: {{error}}",
    },
    company_logo: {
      title: 'Logo de la société',
      url: 'URL du logo de la société',
      url_placeholder: 'https://your.cdn.domain/logo.png',
      error: 'Logo de la société: {{error}}',
    },
    organization_logo: {
      title: "Télécharger l'image",
      url: "URL du logo de l'organisation",
      url_placeholder: 'https://your.cdn.domain/logo.png',
      error: "Logo de l'organisation: {{error}}",
    },
    connector_logo: {
      title: "Télécharger l'image",
      url: 'URL du logo du connecteur',
      url_placeholder: 'https://your.cdn.domain/logo.png',
      error: 'Logo du connecteur: {{error}}',
    },
    favicon: {
      title: 'Favicon',
      url: 'URL du favicon',
      url_placeholder: 'https://your.cdn.domain/favicon.ico',
      error: 'Favicon : {{error}}',
    },
  },
  custom_ui: {
    title: 'UI personnalisée',
    css_code_editor_title: 'CSS personnalisé',
    css_code_editor_description1: "Voir l'exemple de CSS personnalisé.",
    css_code_editor_description2: '<a>{{link}}</a>',
    css_code_editor_description_link_content: 'En savoir plus',
    css_code_editor_content_placeholder:
      'Entrez votre CSS personnalisé pour adapter les styles de tout à vos spécifications exactes. Exprimez votre créativité et faites ressortir votre interface utilisateur.',
    bring_your_ui_title: 'Apportez votre UI',
    bring_your_ui_description:
      "Téléchargez un package compressé (.zip) pour remplacer l'UI préconstruite de Logto par votre propre code. <a>En savoir plus</a>",
    preview_with_bring_your_ui_description:
      'Vos ressources UI personnalisées ont été téléchargées avec succès et sont maintenant servies. En conséquence, la fenêtre de prévisualisation intégrée a été désactivée.\nPour tester votre UI de connexion personnalisée, cliquez sur le bouton "Aperçu en direct" pour l\'ouvrir dans un nouvel onglet du navigateur.',
  },
  account_center: {
    title: 'Centre de compte',
    description: 'Personnalisez les parcours de votre centre de compte avec les API Logto.',
    enable_account_api: "Activer l'Account API",
    enable_account_api_description:
      "Activez l'Account API pour créer un centre de compte personnalisé et offrir aux utilisateurs finaux un accès direct sans utiliser la Logto Management API.",
    field_options: {
      off: 'Off',
      edit: 'Edit',
      read_only: 'Read only',
      enabled: 'Activé',
      disabled: 'Désactivé',
    },
    sections: {
      account_security: {
        title: 'ACCOUNT SECURITY',
        description:
          'Manage access to the Account API, enabling users to view or edit their identity information and authentication factors after signing into the application. Users must verify their identity to get a valid 10-minute verification record ID before making these security-related changes.',
        groups: {
          identifiers: {
            title: 'Identifiers',
          },
          authentication_factors: {
            title: 'Authentication factors',
          },
        },
      },
      user_profile: {
        title: 'USER PROFILE',
        description:
          'Manage access to the Account API, enabling users to view or edit basic or custom profile data after signing into the application.',
        groups: {
          profile_data: {
            title: 'Profile data',
          },
        },
      },
      secret_vault: {
        title: 'COFFRE-FORT SECRET',
        description:
          "Pour les connecteurs sociaux et d'entreprise, stockage sécurisé des jetons d'accès tiers pour appeler leurs API (par exemple, ajouter des événements au calendrier Google).",
        third_party_token_storage: {
          title: 'Jeton tiers',
          third_party_access_token_retrieval: 'Jeton tiers',
          third_party_token_tooltip:
            "Pour stocker les jetons, vous pouvez activer ceci dans les paramètres du connecteur social ou d'entreprise correspondant.",
          third_party_token_description:
            "Une fois l'Account API activée, la récupération de jetons tiers est automatiquement activée.",
        },
      },
    },
    fields: {
      email: 'Email address',
      phone: 'Phone number',
      social: 'Social identities',
      password: 'Password',
      mfa: 'Multi-factor authentication',
      mfa_description: 'Let users manage their MFA methods from the account center.',
      username: 'Username',
      name: 'Name',
      avatar: 'Avatar',
      profile: 'Profile',
      profile_description: 'Control access to structured profile attributes.',
      custom_data: 'Custom data',
      custom_data_description: 'Control access to custom JSON data stored on the user.',
    },
    webauthn_related_origins: 'Origines liées WebAuthn',
    webauthn_related_origins_description:
      "Ajoutez les domaines de vos applications front-end autorisés à enregistrer des clés d'accès via l'API de compte.",
    webauthn_related_origins_error: "L'origine doit commencer par https:// ou http://",
  },
  sign_up_and_sign_in,
  content,
  setup_warning: {
    no_connector_sms:
      'Aucun connecteur SMS n\'a été configuré. Avant de terminer la configuration, les utilisateurs ne pourront pas se connecter avec cette méthode. <a>{{link}}</a> dans "Connecteurs"',
    no_connector_email:
      'Aucun connecteur d\'email n\'a été configuré. Avant de terminer la configuration, les utilisateurs ne pourront pas se connecter avec cette méthode. <a>{{link}}</a> dans "Connecteurs"',
    no_connector_social:
      'Vous n\'avez pas encore configuré de connecteur social. Ajoutez d\'abord des connecteurs pour appliquer des méthodes de connexion sociale. <a>{{link}}</a> dans "Connecteurs".',
    no_connector_email_account_center:
      'Aucun connecteur e-mail configuré. Configurez-le dans <a>"Connecteurs e-mail et SMS"</a>.',
    no_connector_sms_account_center:
      'Aucun connecteur SMS configuré. Configurez-le dans <a>"Connecteurs e-mail et SMS"</a>.',
    no_connector_social_account_center:
      'Aucun connecteur social configuré. Configurez-le dans <a>"Connecteurs sociaux"</a>.',
    no_mfa_factor:
      'Aucun facteur MFA n\'a été configuré. <a>{{link}}</a> dans "Authentification multi-facteurs".',
    setup_link: 'Configurer',
  },
  save_alert: {
    description:
      "Vous implémentez de nouvelles procédures d'inscription et de connexion. Tous vos utilisateurs peuvent être affectés par la nouvelle configuration. Voulez-vous vous engager dans le changement?",
    before: 'Avant',
    after: 'Après',
    sign_up: 'Inscription',
    sign_in: 'Connexion',
    social: 'Social',
    forgot_password_migration_notice:
      'Nous avons mis à niveau la vérification du mot de passe oublié pour prendre en charge des méthodes personnalisées. Auparavant, cela était automatiquement déterminé par vos connecteurs Email et SMS. Cliquez sur <strong>Confirmer</strong> pour terminer la mise à niveau.',
  },
  preview: {
    title: "Aperçu de l'expérience de connexion",
    live_preview: 'Aperçu en direct',
    live_preview_tip: 'Enregistrez pour prévisualiser les modifications',
    native: 'Natif',
    desktop_web: 'Site web pour ordinateur de bureau',
    mobile_web: 'Site web mobile',
    desktop: 'Bureau',
    mobile: 'Mobile',
  },
  custom_profile_fields,
};

export default Object.freeze(sign_in_exp);
