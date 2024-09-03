import content from './content.js';
import password_policy from './password-policy.js';
import sign_up_and_sign_in from './sign-up-and-sign-in.js';

const sign_in_exp = {
  page_title: 'Expérience de connexion',
  title: 'Expérience de connexion',
  description:
    "Personnalisez l'interface utilisateur pour qu'elle corresponde à votre marque et consultez-la en temps réel.",
  tabs: {
    branding: 'Image de marque',
    sign_up_and_sign_in: 'Inscription et connexion',
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
  sign_up_and_sign_in,
  content,
  password_policy,
  setup_warning: {
    no_connector_sms:
      'Aucun connecteur SMS n\'a été configuré. Avant de terminer la configuration, les utilisateurs ne pourront pas se connecter avec cette méthode. <a>{{link}}</a> dans "Connecteurs"',
    no_connector_email:
      'Aucun connecteur d\'email n\'a été configuré. Avant de terminer la configuration, les utilisateurs ne pourront pas se connecter avec cette méthode. <a>{{link}}</a> dans "Connecteurs"',
    no_connector_social:
      'Vous n’avez pas encore configuré de connecteur social. Ajoutez d’abord des connecteurs pour appliquer des méthodes de connexion sociale. <a>{{link}}</a> dans "Connecteurs".',
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
};

export default Object.freeze(sign_in_exp);
