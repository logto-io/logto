const tenants = {
  create_modal: {
    title: 'Crea nuovo tenant',
    subtitle: 'Crea un nuovo tenant per separare risorse e utenti.',
    create_button: 'Crea tenant',
    tenant_name: 'Nome tenant',
    tenant_name_placeholder: 'Il mio tenant',
    environment_tag: 'Tag ambiente',
    environment_tag_description:
      "Usa i tag per differenziare gli ambienti di utilizzo del tenant. I servizi all'interno di ogni tag sono identici, garantendo la coerenza.",
    environment_tag_development: 'Sviluppo',
    environment_tag_staging: 'Sperimentale',
    environment_tag_production: 'Produzione',
  },
  delete_modal: {
    title: 'Elimina tenant',
    description_line1:
      'Sei sicuro di voler eliminare il tuo tenant "<span>{{name}}</span>" con il tag di suffisso dell\'ambiente "<span>{{tag}}</span>"? Questa azione non può essere annullata e comporterà l\'eliminazione permanente di tutti i tuoi dati e le informazioni dell\'account.',
    description_line2:
      "Prima di eliminare l'account, forse possiamo aiutarti. <span><a>Contattaci via e-mail</a></span>",
    description_line3:
      'Se vuoi procedere, inserisci il nome del tenant "<span>{{name}}</span>" per confermare.',
    delete_button: 'Elimina definitivamente',
  },
  tenant_created: "Tenant '{{name}}' creato con successo.",
};

export default tenants;
