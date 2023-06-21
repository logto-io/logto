const tenants = {
  create_modal: {
    title: 'Crea nuovo tenant',
    subtitle: 'Crea un nuovo tenant per separare risorse e utenti.',
    create_button: 'Crea tenant',
    tenant_name_placeholder: 'Il mio tenant',
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
  tenant_landing_page: {
    title: 'Non hai ancora creato un tenant',
    description:
      'Per iniziare a configurare il tuo progetto con Logto, crea un nuovo tenant. Se hai bisogno di uscire o eliminare il tuo account, clicca sul pulsante avatar in alto a destra.',
    create_tenant_button: 'Crea tenant',
  },
  tenant_created: "Tenant '{{name}}' creato con successo.",
};

export default tenants;
