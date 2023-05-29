const api_resources = {
  page_title: 'Risorse API',
  title: 'Risorse API',
  subtitle: 'Definisci API che le tue applicazioni autorizzate possono utilizzare',
  create: 'Crea risorsa API',
  api_name: 'Nome API',
  api_name_placeholder: "Inserisci il nome dell'API",
  api_identifier: 'Identificatore API',
  api_identifier_tip:
    "L'identificatore univoco della risorsa API. Deve essere un URI assoluto e non ha componenti di frammento (#). Corrisponde al parametro <a>risorsa</a> in OAuth 2.0.",
  default_api: 'Default API', // UNTRANSLATED
  default_api_label:
    'If the current API Resource is set as the default API for the tenant, while each tenant can have either 0 or 1 default API. When a default API is designated, the resource parameter can be omitted in the auth request. Subsequent token exchanges will use that API as the audience by default, resulting in the issuance of JWTs.', // UNTRANSLATED
  api_resource_created: 'La risorsa API {{name}} è stata creata con successo',
  api_identifier_placeholder: 'https://tuo-identificatore-api/',
};

export default api_resources;
