const organizations = {
  organization: 'Organizzazione',
  page_title: 'Organizzazioni',
  title: 'Organizzazioni',
  subtitle:
    "Le organizzazioni sono solitamente utilizzate in app SaaS o simili multi-tenant e rappresentano i tuoi clienti che sono team, organizzazioni o intere aziende. Le organizzazioni funzionano come elemento fondamentale per l'autenticazione e l'autorizzazione B2B.",
  organization_template: 'Modello organizzazione',
  organization_id: 'ID organizzazione',
  members: 'Membri',
  create_organization: 'Crea organizzazione',
  setup_organization: 'Configura la tua organizzazione',
  organization_list_placeholder_title: 'Organizzazione',
  organization_list_placeholder_text:
    'Le organizzazioni sono spesso utilizzate in app SaaS o simili multi-tenant come pratica consigliata. Ti consentono di sviluppare app che permettono ai clienti di creare e gestire organizzazioni, invitare membri e assegnare ruoli.',
  organization_name_placeholder: 'La mia organizzazione',
  organization_description_placeholder: "Una breve descrizione dell'organizzazione",
  organization_permission: 'Permessi organizzazione',
  organization_permission_other: 'Permessi organizzazione',
  create_permission_placeholder: 'Leggi la cronologia degli appuntamenti',
  organization_role: 'Ruolo organizzazione',
  organization_role_other: 'Ruoli organizzazione',
  organization_role_description:
    'Il ruolo organizzativo è un raggruppamento di permessi che possono essere assegnati agli utenti. I permessi devono provenire dai permessi organizzativi predefiniti.',
  role: 'Ruolo',
  search_placeholder: "Cerca per nome o ID dell'organizzazione",
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
        role_description_deprecated:
          'Il ruolo organizzativo è un raggruppamento di permessi organizzativi che possono essere assegnati ai membri.',
        role_description:
          "Il ruolo dell'organizzazione è un raggruppamento di permessi dell'organizzazione o permessi API che possono essere assegnati ai membri.",
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
    organization_permissions: 'Permessi organizzazione',
    organization_roles: 'Ruoli organizzazione',
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
