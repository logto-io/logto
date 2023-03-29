import others from './others.js';
import sign_up_and_sign_in from './sign-up-and-sign-in.js';

const sign_in_exp = {
  page_title: 'Expérience de connexion',
  title: 'Expérience de connexion',
  description:
    "Personnalisez l'interface utilisateur pour qu'elle corresponde à votre marque et consultez-la en temps réel.",
  tabs: {
    branding: 'Image de marque',
    sign_up_and_sign_in: 'Sign up and Sign in',
    others: 'Autres',
  },
  welcome: {
    title: 'Customize sign-in experience',
    description:
      'Get started fast with your first sign-in setup. This guide walks you through all the necessary settings.',
    get_started: 'Commencez',
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
    logo_image: 'App logo',
    dark_logo_image: 'App logo (Dark)',
    logo_image_error: 'App logo: {{error}}',
    favicon_error: 'Favicon: {{error}}',
  },
  custom_css: {
    title: 'Custom CSS',
    css_code_editor_title: 'Personalize your UI with Custom CSS',
    css_code_editor_description1: 'See the example of Custom CSS.',
    css_code_editor_description2: '<a>{{link}}</a>',
    css_code_editor_description_link_content: 'Learn more',
    css_code_editor_content_placeholder:
      'Enter your custom CSS to tailor the styles of anything to your exact specifications. Express your creativity and make your UI stand out.',
  },
  setup_warning: {
    no_connector_sms:
      'No SMS connector set-up yet. Before completing the configuration, users will not be able to sign in with this method. <a>{{link}}</a> in "Connectors"',
    no_connector_email:
      'No email connector set-up yet. Before completing the configuration, users will not be able to sign in with this method. <a>{{link}}</a> in "Connectors"',
    no_connector_social:
      'No social connector set-up yet. Before completing the configuration, users will not be able to sign in with this method. <a>{{link}}</a> in "Connectors"',
    no_added_social_connector:
      "Vous avez maintenant configuré quelques connecteurs sociaux. Assurez-vous d'en ajouter quelques-uns à votre expérience de connexion.",
    setup_link: 'Set up',
  },
  save_alert: {
    description:
      'You are implementing new sign-in and sign-up procedures. All of your users may be affected by the new set-up. Are you sure to commit to the change?',
    before: 'Avant',
    after: 'Après',
    sign_up: 'Sign-up',
    sign_in: 'Sign-in',
    social: 'Social',
  },
  preview: {
    title: "Aperçu de l'expérience de connexion",
    live_preview: 'Live preview',
    live_preview_tip: 'Save to preview changes',
    native: 'Natif',
    desktop_web: 'Web ordinateur',
    mobile_web: 'Web mobile',
  },
  others,
  sign_up_and_sign_in,
};

export default sign_in_exp;
