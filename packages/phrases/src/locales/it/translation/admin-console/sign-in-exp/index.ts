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
    with_light: '{{value}}',
    with_dark: '{{value}} (scuro)',
    app_logo_and_favicon: "Logo dell'app e favicon",
    company_logo_and_favicon: 'Logo aziendale e favicon',
  },
  branding_uploads: {
    app_logo: {
      title: "Logo dell'app",
      url: "URL del logo dell'app",
      url_placeholder: 'https://your.cdn.domain/logo.png',
      error: "Logo dell'app: {{error}}",
    },
    company_logo: {
      title: 'Logo aziendale',
      url: 'URL del logo aziendale',
      url_placeholder: 'https://your.cdn.domain/logo.png',
      error: 'Logo aziendale: {{error}}',
    },
    organization_logo: {
      title: 'Carica immagine',
      url: "URL del logo dell'organizzazione",
      url_placeholder: 'https://your.cdn.domain/logo.png',
      error: "Logo dell'organizzazione: {{error}}",
    },
    connector_logo: {
      title: 'Carica immagine',
      url: 'URL del logo del connettore',
      url_placeholder: 'https://your.cdn.domain/logo.png',
      error: 'Logo del connettore: {{error}}',
    },
    favicon: {
      title: 'Favicon',
      url: 'URL della favicon',
      url_placeholder: 'https://your.cdn.domain/favicon.ico',
      error: 'Favicon: {{error}}',
    },
  },
  custom_ui: {
    title: 'UI personalizzata',
    css_code_editor_title: 'CSS personalizzato',
    css_code_editor_description1: "Vedi l'esempio di CSS personalizzato.",
    css_code_editor_description2: '<a>{{link}}</a>',
    css_code_editor_description_link_content: 'Scopri di più',
    css_code_editor_content_placeholder:
      'Inserisci il tuo CSS personalizzato per adattare gli stili di qualsiasi cosa alle tue specifiche esatte. Esprimi la tua creatività e fai risaltare la tua UI.',
    bring_your_ui_title: 'Porta la tua UI',
    bring_your_ui_description:
      'Carica un pacchetto compresso (.zip) per sostituire la UI precaricata di Logto con il tuo codice. <a>Scopri di più</a>',
    preview_with_bring_your_ui_description:
      'I tuoi asset della UI personalizzata sono stati caricati con successo e ora vengono serviti. Di conseguenza, la finestra di anteprima integrata è stata disabilitata.\nPer testare la tua UI di accesso personalizzata, fai clic sul pulsante "Live Preview" per aprirla in una nuova scheda del browser.',
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
