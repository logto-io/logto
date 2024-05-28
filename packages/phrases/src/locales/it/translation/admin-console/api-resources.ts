const api_resources = {
  page_title: 'Risorse API',
  title: 'Risorse API',
  subtitle: 'Definisci API che le tue applicazioni autorizzate possono utilizzare',
  create: 'Crea risorsa API',
  api_name: 'Nome API',
  api_name_placeholder: "Inserisci il nome dell'API",
  api_identifier: 'Identificatore API',
  api_identifier_placeholder: 'https://il-tuo-identificatore-api/',
  api_identifier_tip:
    "L'identificatore univoco della risorsa API. Deve essere un URI assoluto e non ha componenti di frammento (#). Corrisponde al parametro <a>risorsa</a> in OAuth 2.0.",
  default_api: 'API predefinita',
  default_api_label:
    'Solo zero o una API predefinita possono essere impostate per tenant. Quando viene designata una API predefinita, il parametro di risorsa può essere omesso nella richiesta di autorizzazione. Gli scambi di token successivi utilizzeranno quell API come destinatario per impostazione predefinita, con conseguente rilascio di JWT. <a>Scopri di più</a>',
  api_resource_created: 'La risorsa API {{name}} è stata creata con successo',
  invalid_resource_indicator_format: "L'indicatore dell'API deve essere un URI assoluto valido.",
};

export default Object.freeze(api_resources);
