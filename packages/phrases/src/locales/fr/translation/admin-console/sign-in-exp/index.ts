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
    favicon: 'Favicon',
    logo_image_url: "URL de l'image du logo de l'application",
    logo_image_url_placeholder: 'https://votre.domaine.cdn/logo.png',
    dark_logo_image_url: "URL de l'image du logo de l'application (Sombre)",
    dark_logo_image_url_placeholder: 'https://votre.domaine.cdn/logo-dark.png',
    logo_image: "Logo de l'application",
    dark_logo_image: "Logo de l'application (sombre)",
    logo_image_error: "Logo de l'application : {{error}}",
    favicon_error: 'Favicon : {{error}}',
  },
  custom_css: {
    title: 'CSS personnalisé',
    css_code_editor_title: 'Personnalisez votre interface utilisateur avec CSS personnalisé',
    css_code_editor_description1: 'Voici un exemple de CSS personnalisé.',
    css_code_editor_description2: '<a>{{link}}</a>',
    css_code_editor_description_link_content: 'En savoir plus',
    css_code_editor_content_placeholder:
      'Entrez votre propre CSS pour adapter les styles de tout élément à vos spécifications exactes. Exprimez votre créativité et faites sortir votre interface utilisateur.',
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
