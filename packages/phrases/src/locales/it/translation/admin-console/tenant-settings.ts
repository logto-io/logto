const tenant_settings = {
  title: 'Impostazioni',
  description:
    'Cambia le impostazioni del tuo account e gestisci le tue informazioni personali qui per garantire la sicurezza del tuo account.',
  tabs: {
    settings: 'Impostazioni',
    domains: 'Domini',
  },
  profile: {
    title: 'IMPOSTAZIONI DEL PROFILO',
    tenant_id: 'ID Tenant',
    tenant_name: 'Nome Tenant',
    environment_tag: 'Tag Ambiente',
    environment_tag_description:
      'I servizi con tag diversi sono identici. Funziona come suffisso per aiutare il tuo team a differenziare gli ambienti.',
    environment_tag_development: 'Dev',
    environment_tag_staging: 'Staging',
    environment_tag_production: 'Prod',
    tenant_info_saved: "Le informazioni dell'inquilino sono state salvate correttamente.",
  },
  deletion_card: {
    title: 'ELIMINA',
    tenant_deletion: 'Elimina tenant',
    tenant_deletion_description:
      "L'eliminazione del tuo account rimuoverà tutte le tue informazioni personali, i dati dell'utente e la configurazione. Questa azione non può essere annullata.",
    tenant_deletion_button: 'Elimina tenant',
  },
};

export default tenant_settings;
