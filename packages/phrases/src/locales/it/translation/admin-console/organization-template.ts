const organization_template = {
  title: 'Modello di organizzazione',
  subtitle:
    'Nelle applicazioni SaaS multi-tenant, è comune che più organizzazioni condividano politiche di controllo dell’accesso identiche, incluse autorizzazioni e ruoli. In Logto, questo concetto è denominato "modello di organizzazione". Utilizzarlo semplifica il processo di costruzione e progettazione del tuo modello di autorizzazione.',
  roles: {
    tab_name: 'Ruoli org',
    search_placeholder: 'Cerca per nome del ruolo',
    create_title: 'Crea ruolo org',
    role_column: 'Ruolo org',
    permissions_column: 'Permessi',
    placeholder_title: 'Ruolo di organizzazione',
    placeholder_description:
      'Il ruolo di organizzazione è un raggruppamento di permessi che possono essere assegnati agli utenti. I permessi devono provenire dai permessi di organizzazione predefiniti.',
    create_modal: {
      title: "Crea ruolo dell'organizzazione",
      create: 'Crea ruolo',
      name_field: 'Nome del ruolo',
      description_field: 'Descrizione',
      created: "Il ruolo dell'organizzazione {{name}} è stato creato con successo.",
    },
  },
  permissions: {
    tab_name: 'Permessi org',
    search_placeholder: 'Cerca per nome del permesso',
    create_org_permission: 'Crea permesso org',
    permission_column: 'Permesso',
    description_column: 'Descrizione',
    placeholder_title: 'Permesso di organizzazione',
    placeholder_description:
      'Il permesso di organizzazione si riferisce all’autorizzazione ad accedere a una risorsa nel contesto dell’organizzazione.',
    delete_confirm:
      'Se questo permesso viene eliminato, tutti i ruoli di organizzazione che includono questo permesso perderanno tale permesso, e gli utenti che avevano questo permesso perderanno l’accesso concesso da esso.',
    create_title: 'Crea permesso di organizzazione',
    edit_title: 'Modifica permesso di organizzazione',
    permission_field_name: 'Nome del permesso',
    description_field_name: 'Descrizione',
    description_field_placeholder: 'Leggi la cronologia degli appuntamenti',
    create_permission: 'Crea permesso',
    created: 'Permesso creato con successo',
  },
};

export default Object.freeze(organization_template);
