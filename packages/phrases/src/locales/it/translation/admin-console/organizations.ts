const organizations = {
  page_title: 'Organizzazioni',
  title: 'Organizzazioni',
  subtitle:
    'Rappresentano i team, i clienti business e le aziende partner che accedono alle tue applicazioni come organizzazioni.',
  organization_id: 'ID organizzazione',
  members: 'Membri',
  create_organization: 'Crea organizzazione',
  setup_organization: 'Configura la tua organizzazione',
  organization_list_placeholder_title: 'Organizzazione',
  organization_list_placeholder_text:
    "L'organizzazione è di solito utilizzata in app multi-inquilino SaaS o simili a SaaS. La funzione Organizzazioni consente ai tuoi clienti B2B di gestire meglio i loro partner e clienti, e di personalizzare i modi in cui gli utenti finali accedono alle loro applicazioni.",
  organization_name_placeholder: 'La mia organizzazione',
  organization_description_placeholder: "Una breve descrizione dell'organizzazione",
  organization_permission: 'Permessi organizzazione',
  organization_permission_other: 'Permessi organizzazione',
  organization_permission_description:
    "Il permesso organizzativo si riferisce all'autorizzazione per accedere a una risorsa nel contesto dell'organizzazione. Un permesso organizzativo dovrebbe essere rappresentato come una stringa significativa, servendo anche come nome e identificatore univoco.",
  organization_permission_delete_confirm:
    "Se questo permesso viene eliminato, tutti i ruoli dell'organizzazione che includono questo permesso perderanno tale permesso, e gli utenti che avevano questo permesso perderanno l'accesso garantito da esso.",
  create_permission_placeholder: 'Leggi la cronologia degli appuntamenti',
  permission: 'Permesso',
  permission_other: 'Permessi',
  organization_role: 'Ruolo organizzazione',
  organization_role_other: 'Ruoli organizzazione',
  organization_role_description:
    'Il ruolo organizzativo è un raggruppamento di permessi che possono essere assegnati agli utenti. I permessi devono provenire dai permessi organizzativi predefiniti.',
  organization_role_delete_confirm:
    "Fare ciò rimuoverà i permessi associati a questo ruolo dagli utenti interessati ed eliminerà le relazioni tra i ruoli dell'organizzazione, i membri dell'organizzazione e i permessi dell'organizzazione.",
  role: 'Ruolo',
  create_role_placeholder: 'Utenti con solo permessi di visualizzazione',
  search_placeholder: "Cerca per nome o ID dell'organizzazione",
  search_permission_placeholder: 'Digita per cercare e selezionare i permessi',
  search_role_placeholder: 'Digita per cercare e selezionare i ruoli',
  empty_placeholder: '🤔 Non hai ancora impostato nessun {{entity}}.',
  guide: {
    title: 'Inizia con le guide',
    subtitle: "Avvia il processo di sviluppo dell'app con le nostre guide",
    introduction: {
      section_1: {
        title: 'Innanzitutto, capiamo come funzionano le organizzazioni in Logto',
        description:
          'Nei SaaS multi-inquilino, spesso creiamo diverse organizzazioni con lo stesso set di permessi e ruoli, ma nel contesto di un\'organizzazione possono svolgere un ruolo importante nel controllo dei diversi livelli di accesso. Pensate che ogni inquilino sia come un\'organizzazione di Logto, e condividono naturalmente lo stesso "modello" di controllo degli accessi. Chiamiamo questo il "modello organizzativo".',
      },
      section_2: {
        title: 'Il modello organizzativo è composto da due parti',
        organization_permission_description:
          "Il permesso organizzativo si riferisce all'autorizzazione per accedere a una risorsa nel contesto dell'organizzazione. Un permesso organizzativo dovrebbe essere rappresentato come una stringa significativa, servendo anche come nome e identificatore univoco.",
        organization_role_description:
          'Il ruolo organizzativo è un raggruppamento di permessi che possono essere assegnati agli utenti. I permessi devono provenire dai permessi organizzativi predefiniti.',
      },
      section_3: {
        title: "Interagisci con l'illustrazione per vedere come tutto si collega",
        description:
          'Prendiamo un esempio. John, Sarah e Tony sono in diverse organizzazioni con ruoli diversi nel contesto di diverse organizzazioni. Passa il mouse sui diversi moduli e vedi cosa succede.',
      },
    },
    step_1: "Passo 1: Definire i permessi dell'organizzazione",
    step_2: "Passo 2: Definire i ruoli dell'organizzazione",
    step_2_description:
      '"Ruoli organizzativi" rappresentano un insieme di ruoli assegnati a ciascuna organizzazione all\'inizio. Questi ruoli sono determinati dai permessi globali che hai impostato nella schermata precedente. Similmente al permesso dell\'organizzazione, una volta completata questa impostazione per la prima volta, non sarà più necessario farlo ogni volta che crei una nuova organizzazione.',
    step_3: 'Passo 3: Crea la tua prima organizzazione',
    step_3_description:
      'Creiamo la tua prima organizzazione. Viene fornita con un ID univoco e funge da contenitore per gestire vari identità più orientate al business, come partner, clienti e il loro controllo degli accessi.',
    more_next_steps: 'Altri passi successivi',
    add_members: 'Aggiungi membri alla tua organizzazione',
    add_members_action: 'Aggiungi membri massivamente e assegna ruoli',
    add_enterprise_connector: 'Aggiungi connettore enterprise SSO',
    add_enterprise_connector_action: "Configura l'SSO enterprise",
    organization_permissions: 'Permessi organizzazione',
    permission_name: 'Nome permesso',
    permissions: 'Permessi',
    organization_roles: 'Ruoli organizzazione',
    role_name: 'Nome ruolo',
    organization_name: 'Nome organizzazione',
    admin: 'Amministratore',
    admin_description:
      'Il ruolo "Admin" condivide lo stesso modello organizzativo in diverse organizzazioni.',
    member: 'Membro',
    member_description:
      'Il ruolo "Membro" condivide lo stesso modello organizzativo in diverse organizzazioni.',
    guest: 'Ospite',
    guest_description:
      'Il ruolo "Ospite" condivide lo stesso modello organizzativo in diverse organizzazioni.',
    create_more_roles:
      "È possibile creare altri ruoli nelle impostazioni del modello organizzativo. Questi ruoli dell'organizzazione si applicheranno a diverse organizzazioni.",
    read_resource: 'leggi:risorsa',
    edit_resource: 'modifica:risorsa',
    delete_resource: 'elimina:risorsa',
    ellipsis: '……',
    johnny:
      "Johny appartiene a due organizzazioni con l'indirizzo email \"john@email.com\" come singolo identificatore. Egli è l'amministratore dell'organizzazione A e ospite dell'organizzazione B.",
    sarah:
      "Sarah appartiene a un'organizzazione con l'indirizzo email \"sarah@email.com\" come singolo identificatore. Lei è l'amministratore dell'organizzazione B.",
    tony: "Tony appartiene a un'organizzazione con l'indirizzo email \"tony@email.com\" come singolo identificatore. Egli è membro dell'organizzazione C.",
  },
};

export default Object.freeze(organizations);
