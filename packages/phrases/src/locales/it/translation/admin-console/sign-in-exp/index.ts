import content from './content.js';
import custom_profile_fields from './custom-profile-fields.js';
import sign_up_and_sign_in from './sign-up-and-sign-in.js';

const sign_in_exp = {
  page_title: 'Esperienza di accesso',
  page_title_with_account: 'Accesso e account',
  title: 'Accesso e account',
  description:
    "Personalizza i flussi di autenticazione e l'interfaccia utente, e visualizza in anteprima l'esperienza predefinita in tempo reale.",
  tabs: {
    branding: 'Marchio',
    sign_up_and_sign_in: 'Registrazione e accesso',
    collect_user_profile: 'Raccogli profilo utente',
    account_center: 'Centro account',
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
    organization_logo_and_favicon: "Logo dell'organizzazione e favicon",
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
  account_center: {
    title: 'Centro account',
    description: 'Personalizza i flussi del tuo centro account con le API Logto.',
    enable_account_api: 'Abilita Account API',
    enable_account_api_description:
      "Abilita l'Account API per creare un centro account personalizzato e offrire agli utenti finali l'accesso diretto senza utilizzare la Logto Management API.",
    field_options: {
      off: 'Off',
      edit: 'Edit',
      read_only: 'Read only',
      enabled: 'Abilitato',
      disabled: 'Disabilitato',
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
        title: 'CASSAFORTE SEGRETA',
        description:
          'Per i connettori social e aziendali, archiviazione sicura dei token di accesso di terze parti per chiamare le loro API (ad esempio, aggiungere eventi a Google Calendar).',
        third_party_token_storage: {
          title: 'Token di terze parti',
          third_party_access_token_retrieval: 'Token di terze parti',
          third_party_token_tooltip:
            'Per memorizzare i token, è possibile abilitare questa opzione nelle impostazioni del connettore social o aziendale corrispondente.',
          third_party_token_description:
            "Una volta abilitata l'Account API, il recupero dei token di terze parti viene attivato automaticamente.",
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
    webauthn_related_origins: 'Origini correlate a WebAuthn',
    webauthn_related_origins_description:
      "Aggiungi i domini delle tue applicazioni front-end autorizzati a registrare chiavi di accesso tramite l'API dell'account.",
    webauthn_related_origins_error: "L'origine deve iniziare con https:// o http://",
  },
  sign_up_and_sign_in,
  content,
  setup_warning: {
    no_connector_sms:
      'Nessun connettore SMS ancora configurato. Prima di completare la configurazione, gli utenti non saranno in grado di accedere con questo metodo. <a>{{link}}</a> in "Connettori"',
    no_connector_email:
      'Nessun connettore email ancora configurato. Prima di completare la configurazione, gli utenti non saranno in grado di accedere con questo metodo. <a>{{link}}</a> in "Connettori"',
    no_connector_social:
      'Non hai ancora configurato nessun connettore sociale. Aggiungi prima i connettori per applicare i metodi di accesso sociale. <a>{{link}}</a> in "Connettori".',
    no_connector_email_account_center:
      'Nessun connettore email ancora configurato. Configurare in <a>"Connettori email e SMS"</a>.',
    no_connector_sms_account_center:
      'Nessun connettore SMS ancora configurato. Configurare in <a>"Connettori email e SMS"</a>.',
    no_connector_social_account_center:
      'Nessun connettore sociale ancora configurato. Configurare in <a>"Connettori sociali"</a>.',
    no_mfa_factor:
      'Nessun fattore MFA ancora configurato. <a>{{link}}</a> in "Autenticazione a più fattori".',
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
    forgot_password_migration_notice:
      "Abbiamo aggiornato la verifica della password dimenticata per supportare metodi personalizzati. In precedenza, questo era determinato automaticamente dai tuoi connettori Email e SMS. Clicca su <strong>Conferma</strong> per completare l'aggiornamento.",
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
  custom_profile_fields,
};

export default Object.freeze(sign_in_exp);
