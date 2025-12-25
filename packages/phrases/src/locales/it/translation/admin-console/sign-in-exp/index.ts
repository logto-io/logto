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
    hide_logto_branding: 'Nascondi il branding Logto',
    hide_logto_branding_description:
      'Rimuovi "Powered by Logto". Metti in risalto solo il tuo brand con un\'esperienza di accesso pulita e professionale.',
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
    title: 'CENTRO ACCOUNT',
    description: 'Personalizza i flussi del centro account con le API Logto.',
    enable_account_api: 'Abilita l’Account API',
    enable_account_api_description:
      'Abilita l’Account API per creare un centro account personalizzato e offrire agli utenti finali l’accesso diretto all’API senza utilizzare la Logto Management API.',
    field_options: {
      off: 'Disattivato',
      edit: 'Modifica',
      read_only: 'Sola lettura',
      enabled: 'Abilitato',
      disabled: 'Disabilitato',
    },
    sections: {
      account_security: {
        title: "SICUREZZA DELL'ACCOUNT",
        description:
          'Gestisci l’accesso all’Account API consentendo agli utenti, dopo l’accesso all’applicazione, di visualizzare o modificare le loro informazioni di identità e i fattori di autenticazione. Prima di effettuare queste modifiche legate alla sicurezza, gli utenti devono verificare la propria identità e ottenere un ID di registrazione della verifica valido per 10 minuti.',
        groups: {
          identifiers: {
            title: 'Identificatori',
          },
          authentication_factors: {
            title: 'Fattori di autenticazione',
          },
        },
      },
      user_profile: {
        title: 'PROFILO UTENTE',
        description:
          'Gestisci l’accesso all’Account API in modo che gli utenti possano visualizzare o modificare i dati di profilo di base o personalizzati dopo l’accesso all’applicazione.',
        groups: {
          profile_data: {
            title: 'Dati del profilo',
          },
        },
      },
      secret_vault: {
        title: 'CASSAFORTE SEGRETA',
        description:
          'Per i connettori social e aziendali, archivia in modo sicuro i token di accesso di terze parti per chiamare le loro API (ad esempio aggiungere eventi a Google Calendar).',
        third_party_token_storage: {
          title: 'Token di terze parti',
          third_party_access_token_retrieval: 'Recupero del token di accesso di terze parti',
          third_party_token_tooltip:
            'Per memorizzare i token, puoi abilitare questa opzione nelle impostazioni del connettore social o aziendale corrispondente.',
          third_party_token_description:
            'Quando l’Account API è abilitata, il recupero dei token di terze parti viene attivato automaticamente.',
        },
      },
    },
    fields: {
      email: 'Indirizzo email',
      phone: 'Numero di telefono',
      social: 'Identità social',
      password: 'Password',
      mfa: 'Autenticazione multifattore',
      mfa_description: 'Consenti agli utenti di gestire i loro metodi MFA dal centro account.',
      username: 'Nome utente',
      name: 'Nome',
      avatar: 'Avatar',
      profile: 'Profilo',
      profile_description: 'Controlla l’accesso agli attributi strutturati del profilo.',
      custom_data: 'Dati personalizzati',
      custom_data_description:
        'Controlla l’accesso ai dati JSON personalizzati archiviati sull’utente.',
    },
    webauthn_related_origins: 'Origini correlate a WebAuthn',
    webauthn_related_origins_description:
      'Aggiungi i domini delle applicazioni front-end autorizzate a registrare passkey tramite l’Account API.',
    webauthn_related_origins_error: "L'origine deve iniziare con https:// o http://",
    prebuilt_ui: {
      /** UNTRANSLATED */
      title: 'INTEGRATE PREBUILT UI',
      /** UNTRANSLATED */
      description:
        'Quickly integrate out-of-the-box verification and security setting flows with prebuilt UI.',
      /** UNTRANSLATED */
      flows_title: 'Integrate out-of-the-box security setting flows',
      /** UNTRANSLATED */
      flows_description:
        'Combine your domain with the route to form your account setting URL (e.g., https://auth.foo.com/account/email). Optionally add a `redirect=` URL parameter to return users to your app after successfully updating.',
      tooltips: {
        /** UNTRANSLATED */
        email: 'Update your primary email address',
        /** UNTRANSLATED */
        phone: 'Update your primary phone number',
        /** UNTRANSLATED */
        username: 'Update your username',
        /** UNTRANSLATED */
        password: 'Set a new password',
        /** UNTRANSLATED */
        authenticator_app: 'Set up a new authenticator app for multi-factor authentication',
        /** UNTRANSLATED */
        passkey_add: 'Register a new passkey',
        /** UNTRANSLATED */
        passkey_manage: 'Manage your existing passkeys or add new ones',
        /** UNTRANSLATED */
        backup_codes_generate: 'Generate a new set of 10 backup codes',
        /** UNTRANSLATED */
        backup_codes_manage: 'View your available backup codes or generate new ones',
      },
      /** UNTRANSLATED */
      customize_note: "Don't want the out-of-the-box experience? You can fully",
      /** UNTRANSLATED */
      customize_link: 'customize your flows with the Account API instead.',
    },
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
    no_mfa_factor: 'Nessun fattore MFA ancora configurato. Configuralo in <a>{{link}}</a>.',
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
