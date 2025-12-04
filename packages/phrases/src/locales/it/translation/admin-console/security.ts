const security = {
  page_title: 'Sicurezza',
  title: 'Sicurezza',
  subtitle: 'Configura una protezione avanzata contro attacchi sofisticati.',
  tabs: {
    captcha: 'CAPTCHA',
    password_policy: 'Politica password',
    blocklist: 'Lista di blocco',
    general: 'Generale',
  },
  bot_protection: {
    title: 'Protezione dei bot',
    description:
      'Abilita CAPTCHA per registrazioni, accessi e recuperi password per bloccare le minacce automatizzate.',
    captcha: {
      title: 'CAPTCHA',
      placeholder: "Seleziona un fornitore di CAPTCHA e configura l'integrazione.",
      add: 'Aggiungi CAPTCHA',
    },
    settings: 'Impostazioni',
    enable_captcha: 'Abilita CAPTCHA',
    enable_captcha_description:
      'Abilita la verifica CAPTCHA per i flussi di registrazione, accesso e recupero password.',
  },
  create_captcha: {
    setup_captcha: 'Configura CAPTCHA',
  },
  captcha_providers: {
    recaptcha_enterprise: {
      name: 'reCAPTCHA Enterprise',
      description:
        'Soluzione CAPTCHA di livello aziendale di Google che fornisce un rilevamento avanzato delle minacce e analisi di sicurezza dettagliate per proteggere il tuo sito web da attività fraudolente.',
    },
    turnstile: {
      name: 'Cloudflare Turnstile',
      description:
        "Alternativa intelligente di CAPTCHA di Cloudflare che offre protezione dai bot non invasiva assicurando un'esperienza utente senza puzzle visivi.",
    },
  },
  captcha_details: {
    back_to_security: 'Torna alla sicurezza',
    page_title: 'Dettagli CAPTCHA',
    check_readme: 'Controlla README',
    options_change_captcha: 'Cambia fornitore di CAPTCHA',
    connection: 'Connessione',
    description: 'Configura le connessioni captcha.',
    site_key: 'Chiave del sito',
    secret_key: 'Chiave segreta',
    project_id: 'ID del progetto',
    domain: 'Dominio (opzionale)',
    domain_placeholder: 'www.google.com (predefinito) o recaptcha.net',
    recaptcha_key_id: 'ID chiave reCAPTCHA',
    recaptcha_api_key: 'Chiave API del progetto',
    deletion_description: 'Sei sicuro di voler eliminare questo fornitore di CAPTCHA?',
    captcha_deleted: 'Fornitore di CAPTCHA eliminato con successo',
    setup_captcha: 'Configura CAPTCHA',
    mode: 'Modalità di verifica',
    mode_invisible: 'Invisibile',
    mode_checkbox: 'Casella di controllo',
    mode_notice:
      'La modalità di verifica è definita nelle impostazioni della chiave reCAPTCHA in Google Cloud Console. Per cambiare la modalità qui è necessario un tipo di chiave corrispondente.',
  },
  password_policy: {
    password_requirements: 'Requisiti per la password',
    password_requirements_description:
      'Migliora i requisiti della password per difendersi dagli attacchi di credential stuffing e password deboli.',
    minimum_length: 'Lunghezza minima',
    minimum_length_description:
      'NIST consiglia di utilizzare almeno 8 caratteri per i prodotti web.',
    minimum_length_error:
      'La lunghezza minima deve essere compresa tra {{min}} e {{max}} (inclusi).',
    minimum_required_char_types: 'Tipi di caratteri minimi richiesti',
    minimum_required_char_types_description:
      'Tipi di caratteri: maiuscole (A-Z), minuscole (a-z), numeri (0-9) e simboli speciali ({{symbols}}).',
    password_rejection: 'Rifiuto password',
    compromised_passwords: 'Rifiuta password compromesse',
    breached_passwords: 'Password violate',
    breached_passwords_description:
      'Rifiuta password trovate in precedenza nei database delle violazioni.',
    restricted_phrases: 'Limita frasi poco sicure',
    restricted_phrases_tooltip:
      'La tua password dovrebbe evitare queste frasi a meno che non le combiniate con 3 o più caratteri extra.',
    repetitive_or_sequential_characters: 'Caratteri ripetitivi o sequenziali',
    repetitive_or_sequential_characters_description: 'Ad esempio, "AAAA", "1234" e "abcd".',
    user_information: 'Informazioni utente',
    user_information_description:
      'Ad esempio, indirizzo email, numero di telefono, nome utente, ecc.',
    custom_words: 'Parole personalizzate',
    custom_words_description:
      'Personalizza parole specifiche del contesto, non case-sensitive, una per riga.',
    custom_words_placeholder: "Nome del tuo servizio, nome dell'azienda, ecc.",
  },
  sentinel_policy: {
    card_title: 'Blocco identificatore',
    card_description:
      'Il blocco è disponibile per tutti gli utenti con impostazioni predefinite, ma puoi personalizzarlo per avere un maggiore controllo.\n\nBlocca temporaneamente un identificatore dopo diversi tentativi di autenticazione falliti (ad esempio, password o codice di verifica consecutivi errati) per prevenire accessi forzati.',
    enable_sentinel_policy: {
      title: "Personalizza l'esperienza di blocco",
      description:
        'Consenti personalizzazione del massimo tentativi di accesso falliti prima del blocco, durata del blocco e sblocco manuale immediato.',
    },
    max_attempts: {
      title: 'Massimo tentativi falliti',
      description:
        "Blocca temporaneamente un identificatore dopo aver raggiunto il numero massimo di tentativi di accesso falliti in un'ora.",
      error_message: 'Il massimo dei tentativi falliti deve essere maggiore di 0.',
    },
    lockout_duration: {
      title: 'Durata del blocco (minuti)',
      description:
        'Blocca gli accessi per un periodo dopo aver superato il limite massimo di tentativi falliti.',
      error_message: 'La durata del blocco deve essere almeno 1 minuto.',
    },
    manual_unlock: {
      title: 'Sblocco manuale',
      description:
        'Sblocca gli utenti immediatamente confermando la loro identità e inserendo il loro identificatore.',
      unblock_by_identifiers: 'Sblocca tramite identificatore',
      modal_description_1:
        "Un identificatore è stato temporaneamente bloccato a causa di più tentativi di accesso/registrazione falliti. Per proteggere la sicurezza, l'accesso verrà automaticamente ripristinato dopo la durata del blocco.",
      modal_description_2:
        "Sblocca manualmente solo se hai confermato l'identità dell'utente e assicurato che non vi siano tentativi di accesso non autorizzati.",
      placeholder: 'Inserisci identificatori (indirizzo email / numero di telefono / nome utente)',
      confirm_button_text: 'Sblocca adesso',
      success_toast: 'Sbloccato con successo',
      duplicate_identifier_error: 'Identificatore già aggiunto',
      empty_identifier_error: 'Inserisci almeno un identificatore',
    },
  },
  blocklist: {
    card_title: 'Lista di blocco email',
    card_description:
      'Prendi il controllo della tua base utenti bloccando indirizzi email ad alto rischio o indesiderati.',
    disposable_email: {
      title: 'Blocca indirizzi email usa e getta',
      description:
        'Abilita per rifiutare qualsiasi tentativo di registrazione utilizzando un indirizzo email usa e getta, il che può prevenire lo spam e migliorare la qualità degli utenti.',
    },
    email_subaddressing: {
      title: 'Blocca sub-addressing email',
      description:
        'Abilita per rifiutare qualsiasi tentativo di registrazione tramite subindirizzi email con un segno di aggiunta (+) e caratteri aggiuntivi (ad es., user+alias@foo.com).',
    },
    custom_email_address: {
      title: 'Blocca indirizzi email personalizzati',
      description:
        "Aggiungi domini email specifici o indirizzi email che non possono registrarsi o collegarsi tramite l'UI.",
      placeholder:
        "Inserisci l'indirizzo email o il dominio bloccato (ad es., bar@example.com, @example.com)",
      duplicate_error: 'Indirizzo email o dominio già aggiunto',
      invalid_format_error:
        'Deve essere un indirizzo email valido (bar@example.com) o un dominio (@example.com)',
    },
  },
};

export default Object.freeze(security);
