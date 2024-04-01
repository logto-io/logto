const organization_template = {
  title: 'Modello di organizzazione',
  subtitle:
    'Nelle applicazioni SaaS multi-tenant, è comune che più organizzazioni condividano politiche di controllo dell’accesso identiche, incluse autorizzazioni e ruoli. In Logto, questo concetto è denominato "modello di organizzazione". Utilizzarlo semplifica il processo di costruzione e progettazione del tuo modello di autorizzazione.',
  org_roles: {
    tab_name: 'Ruoli org',
    search_placeholder: 'Cerca per nome del ruolo',
    create_org_roles: 'Crea ruolo org',
    org_role_column: 'Ruolo org',
    permissions_column: 'Permessi',
    placeholder_title: 'Ruolo di organizzazione',
    placeholder_description:
      'Il ruolo di organizzazione è un raggruppamento di permessi che possono essere assegnati agli utenti. I permessi devono provenire dai permessi di organizzazione predefiniti.',
  },
  org_permissions: {
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
  },
};

export default Object.freeze(organization_template);
