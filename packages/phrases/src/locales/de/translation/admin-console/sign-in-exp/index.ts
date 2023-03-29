import others from './others.js';
import sign_up_and_sign_in from './sign-up-and-sign-in.js';

const sign_in_exp = {
  title: 'Anmeldeoberfläche',
  description:
    'Passe die Benutzeroberfläche für die Anmeldung an deine Marke an und zeige eine Vorschau in Echtzeit an',
  tabs: {
    branding: 'Branding',
    methods: 'Anmeldemethoden',
    sign_up_and_sign_in: 'Sign up and Sign in',
    others: 'Andere',
  },
  welcome: {
    title: 'Customize sign-in experience',
    description:
      'Get started fast with your first sign-in setup. This guide walks you through all the necessary settings.',
    get_started: 'Erste Schritte',
    apply_remind:
      'Bitte beachte, dass die Anmeldeoberfläche für alle Anwendungen unter diesem Konto gilt.',
  },
  color: {
    title: 'FARBE',
    primary_color: 'Markenfarbe',
    dark_primary_color: 'Markenfarbe (Dunkler Modus)',
    dark_mode: 'Aktiviere Dunklen Modus',
    dark_mode_description:
      'Deine App erhält einen automatisch generierten Dunklen Modus, der auf deiner Markenfarbe und dem Logto-Algorithmus basiert. Du kannst diesen nach Belieben anpassen.',
    dark_mode_reset_tip: 'Neuberechnung der Farbe des dunklen Modus basierend auf der Markenfarbe.',
    reset: 'Neuberechnen',
  },
  branding: {
    title: 'BRANDING',
    ui_style: 'Stil',
    favicon: 'Favicon',
    logo_image_url: 'App logo URL',
    logo_image_url_placeholder: 'https://dein.cdn.domain/logo.png',
    dark_logo_image_url: 'App logo URL (Dunkler Modus)',
    dark_logo_image_url_placeholder: 'https://dein.cdn.domain/logo-dark.png',
    logo_image: 'App logo',
    dark_logo_image: 'App logo (Dunkler Modus)',
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
      'Du hast jetzt ein paar Social Connectoren eingerichtet. Füge jetzt einige zu deinem Anmeldeerlebnis hinzu.',
    setup_link: 'Set up',
  },
  save_alert: {
    description:
      'You are implementing new sign-in and sign-up procedures. All of your users may be affected by the new set-up. Are you sure to commit to the change?',
    before: 'Vorher',
    after: 'Nachher',
    sign_up: 'Sign-up',
    sign_in: 'Sign-in',
    social: 'Social',
  },
  preview: {
    title: 'Vorschau',
    live_preview: 'Live preview',
    live_preview_tip: 'Save to preview changes',
    native: 'Nativ',
    desktop_web: 'Desktop Web',
    mobile_web: 'Mobil Web',
  },
  others,
  sign_up_and_sign_in,
};

export default sign_in_exp;
