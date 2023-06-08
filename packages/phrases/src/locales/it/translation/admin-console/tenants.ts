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
  tenant_created: "Tenant '{{name}}' creato con successo.",
};

export default tenants;
