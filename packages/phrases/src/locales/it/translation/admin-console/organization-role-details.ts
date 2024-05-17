const organization_role_details = {
  page_title: "Dettagli del ruolo dell'organizzazione",
  back_to_org_roles: "Torna ai ruoli dell'organizzazione",
  org_role: "Ruolo dell'organizzazione",
  delete_confirm:
    "Facendo ciò, verranno rimossi i permessi associati a questo ruolo dagli utenti interessati e verranno eliminati i rapporti tra ruoli organizzativi, membri nell'organizzazione e permessi dell'organizzazione.",
  deleted: "Il ruolo dell'organizzazione {{name}} è stato cancellato con successo.",
  permissions: {
    tab: 'Autorizzazioni',
    name_column: 'Autorizzazione',
    description_column: 'Descrizione',
    type_column: 'Tipo di autorizzazione',
    type: {
      api: 'Autorizzazione API',
      org: 'Autorizzazione organizzazione',
    },
    assign_permissions: 'Assegna autorizzazioni',
    remove_permission: 'Rimuovi permesso',
    remove_confirmation:
      "Se questo permesso viene rimosso, l'utente con questo ruolo organizzativo perderà l'accesso concessogli da questo permesso.",
    removed: 'Il permesso {{name}} è stato rimosso con successo da questo ruolo organizzativo',
    assign_description:
      "Assegna le autorizzazioni ai ruoli all'interno di questa organizzazione. Queste possono includere sia autorizzazioni dell'organizzazione che autorizzazioni API.",
    organization_permissions: "Autorizzazioni dell'organizzazione",
    api_permissions: 'Autorizzazioni API',
    assign_organization_permissions: 'Assegna permessi di organizzazione',
    assign_api_permissions: 'Assegna permessi API',
  },
  general: {
    tab: 'Generale',
    settings: 'Impostazioni',
    description:
      'Il ruolo dell’organizzazione è un raggruppamento di permessi che possono essere assegnati agli utenti. I permessi possono derivare dai permessi dell’organizzazione predefiniti e dai permessi API.',
    name_field: 'Nome',
    description_field: 'Descrizione',
    description_field_placeholder: 'Utenti con permessi di sola visualizzazione',
  },
};

export default Object.freeze(organization_role_details);
