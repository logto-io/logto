import content from './content.js';
import password_policy from './password-policy.js';
import sign_up_and_sign_in from './sign-up-and-sign-in.js';

const sign_in_exp = {
  page_title: 'Esperienza di accesso',
  title: 'Esperienza di accesso',
  description:
    "Personalizza l'interfaccia di accesso per abbinarla al tuo marchio e visualizzala in tempo reale",
  tabs: {
    branding: 'Marchio',
    sign_up_and_sign_in: 'Registrazione e accesso',
    content: 'Contenuto',
    password_policy: 'Politica sulla password',
  },
  welcome: {
    title: "Personalizza l'esperienza di accesso",
    description:
      'Inizia subito con la configurazione del tuo primo accesso. Questa guida ti guiderà attraverso tutte le impostazioni necessarie.',
    get_started: 'Inizia',
    apply_remind:
      "Si prega di notare che l'esperienza di accesso verrà applicata a tutte le applicazioni in questo account.",
  },
  color: {
    title: 'COLORE',
    primary_color: 'Colore del marchio',
    dark_primary_color: 'Colore del marchio (scuro)',
    dark_mode: 'Abilita modalità scura',
    dark_mode_description:
      "La tua app avrà un tema modalità scura generato automaticamente in base al tuo colore del marchio e all'algoritmo Logto. Sei libero di personalizzare.",
    dark_mode_reset_tip: 'Ricalcola il colore della modalità scura in base al colore del marchio.',
    reset: 'Ricalcola',
  },
  branding: {
    title: 'AREA DI BRANDIZZO',
    ui_style: 'Stile',
    favicon: 'Favicon',
    logo_image_url: "URL dell'immagine del logo dell'app",
    logo_image_url_placeholder: 'https://your.cdn.domain/logo.png',
    dark_logo_image_url: "URL dell'immagine del logo dell'app (scuro)",
    dark_logo_image_url_placeholder: 'https://your.cdn.domain/logo-dark.png',
    logo_image: "Logo dell'app",
    dark_logo_image: "Logo dell'app (scuro)",
    logo_image_error: "Logo dell'app: {{error}}",
    favicon_error: 'Favicon: {{error}}',
  },
  custom_css: {
    title: 'CSS personalizzato',
    css_code_editor_title: 'Personalizza la tua interfaccia utente con CSS personalizzato',
    css_code_editor_description1: "Guarda l'esempio di CSS personalizzato.",
    css_code_editor_description2: '<a>{{link}}</a>',
    css_code_editor_description_link_content: 'Ulteriori informazioni',
    css_code_editor_content_placeholder:
      'Inserisci il tuo CSS personalizzato per adattare lo stile di qualsiasi cosa alle tue specifiche. Esprimi la tua creatività e fai risaltare la tua interfaccia utente.',
  },
  sign_up_and_sign_in,
  content,
  password_policy,
  setup_warning: {
    no_connector_sms:
      'Nessun connettore SMS ancora configurato. Prima di completare la configurazione, gli utenti non saranno in grado di accedere con questo metodo. <a>{{link}}</a> in "Connettori"',
    no_connector_email:
      'Nessun connettore email ancora configurato. Prima di completare la configurazione, gli utenti non saranno in grado di accedere con questo metodo. <a>{{link}}</a> in "Connettori"',
    no_connector_social:
      'Non hai ancora configurato nessun connettore sociale. Aggiungi prima i connettori per applicare i metodi di accesso sociale. <a>{{link}}</a> in "Connettori".',
    setup_link: 'Configura',
  },
  save_alert: {
    description:
      'Stai implementando nuove procedure di accesso e registrazione. Tutti i tuoi utenti potrebbero essere influenzati dalla nuova configurazione. Sei sicuro di voler procedere con il cambiamento?',
    before: 'Prima',
    after: 'Dopo',
    sign_up: 'Registrazione',
    sign_in: 'Accesso',
    social: 'Sociale',
  },
  preview: {
    title: 'Anteprima di accesso',
    live_preview: 'Anteprima in diretta',
    live_preview_tip: 'Salva per visualizzare le modifiche',
    native: 'Nat',
    desktop_web: 'Web desktop',
    mobile_web: 'Web mobile',
    desktop: 'Desktop',
    mobile: 'Mobile',
  },
};

export default Object.freeze(sign_in_exp);
