const enterprise_sso = {
  page_title: 'SSO aziendale',
  title: 'SSO aziendale',
  subtitle:
    "Collega il provider di identità aziendale e abilita l'accesso unico inizializzato dal fornitore di servizi.",
  create: 'Aggiungi connettore aziendale',
  col_connector_name: 'Nome connettore',
  col_type: 'Tipo',
  col_email_domain: 'Dominio email',
  col_status: 'Stato',
  col_status_in_use: 'In uso',
  col_status_invalid: 'Non valido',
  placeholder_title: 'Connettore aziendale',
  placeholder_description:
    'Logto ha fornito numerosi provider di identità aziendale integrati, nel frattempo puoi creare il tuo con protocolli standard.',
  create_modal: {
    title: 'Aggiungi connettore aziendale',
    text_divider: 'Oppure puoi personalizzare il tuo connettore con un protocollo standard.',
    connector_name_field_title: 'Nome connettore',
    connector_name_field_placeholder: 'Nome del provider di identità aziendale',
    create_button_text: 'Crea connettore',
  },
};

export default Object.freeze(enterprise_sso);
