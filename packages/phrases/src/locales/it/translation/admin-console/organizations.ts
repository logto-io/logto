const organizations = {
  organization: 'Organizzazione',
  page_title: 'Organizzazioni',
  title: 'Organizzazioni',
  /** UNTRANSLATED */
  subtitle:
    'Organizations are usually used in SaaS or similar multi-tenant apps and represent your clients which are teams, organizations, or entire companies. Organizations work as a foundational element for B2B authentication and authorization.',
  organization_template: 'Modello organizzazione',
  organization_id: 'ID organizzazione',
  members: 'Membri',
  create_organization: 'Crea organizzazione',
  setup_organization: 'Configura la tua organizzazione',
  organization_list_placeholder_title: 'Organizzazione',
  /** UNTRANSLATED */
  organization_list_placeholder_text:
    'Organizations are often used in SaaS or similar multi-tenant apps as a best practice. They enable you to develop apps that allow clients to create and manage organizations, invite members, and assign roles.',
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
  organization_and_member: 'Organizzazione e membri',
  organization_and_member_description:
    'L\'organizzazione è un gruppo di utenti e può rappresentare i team, i clienti business e le aziende partner, con ciascun utente che è un "Membro". Queste possono essere entità fondamentali per gestire i tuoi requisiti multi-tenant.',
  guide: {
    title: 'Inizia con le guide',
    subtitle: "Inizia con le impostazioni dell'organizzazione con le nostre guide",
    introduction: {
      title: "Capire come funziona l'organizzazione in Logto",
      section_1: {
        title: "Un'organizzazione è un gruppo di utenti (identità)",
      },
      section_2: {
        title:
          'Il modello organizzativo è progettato per il controllo degli accessi alle app multi-tenant',
        description:
          'Nelle applicazioni SaaS multi-inquilino, spesso più organizzazioni condividono lo stesso modello di controllo degli accessi, che include permessi e ruoli. In Logto, lo chiamiamo "modello organizzativo".',
        permission_description:
          "Il permesso organizzativo si riferisce all'autorizzazione per accedere a una risorsa nel contesto dell'organizzazione.",
        role_description:
          'Il ruolo organizzativo è un raggruppamento di permessi organizzativi che possono essere assegnati ai membri.',
      },
      section_3: {
        title: "Posso assegnare permessi API ai ruoli dell'organizzazione?",
        description:
          "Sì, puoi assegnare permessi API ai ruoli dell'organizzazione. Logto offre la flessibilità di gestire efficacemente i ruoli della tua organizzazione, permettendoti di includere sia permessi organizzativi che permessi API in tali ruoli.",
      },
      section_4: {
        title: "Interagisci con l'illustrazione per vedere come tutto si collega",
        description:
          'Prendiamo un esempio. John, Sarah sono in diverse organizzazioni con ruoli diversi nel contesto di organizzazioni diverse. Passa il mouse sui diversi moduli e guarda cosa succede.',
      },
    },
    step_1: "Passo 1: Definire i permessi dell'organizzazione",
    step_2: "Passo 2: Definire i ruoli dell'organizzazione",
    step_3: 'Passo 3: Crea la tua prima organizzazione',
    step_3_description:
      'Creiamo la tua prima organizzazione. Ha un ID univoco e serve come contenitore per gestire varie entità più orientate al business.',
    more_next_steps: 'Altri passaggi successivi',
    add_members: 'Aggiungi membri alla tua organizzazione',
    /** UNTRANSLATED */
    config_organization: 'Configure organization',
    organization_permissions: 'Permessi organizzazione',
    permission_name: 'Nome del permesso',
    permissions: 'Permessi',
    organization_roles: 'Ruoli organizzazione',
    role_name: 'Nome del ruolo',
    organization_name: "Nome dell'organizzazione",
    admin: 'Amministratore',
    member: 'Membro',
    guest: 'Ospite',
    role_description:
      'Il ruolo "{{role}}" condivide lo stesso modello organizzativo tra diverse organizzazioni.',
    john: 'John',
    john_tip:
      "John appartiene a due organizzazioni con l'email \"john@email.com\" come unico identificatore. È l'amministratore dell'organizzazione A e ospite dell'organizzazione B.",
    sarah: 'Sarah',
    sarah_tip:
      "Sarah appartiene a un'organizzazione con l'email \"sarah@email.com\" come unico identificatore. È l'amministratore dell'organizzazione B.",
  },
};

export default Object.freeze(organizations);
