const api_resources = {
  page_title: 'Ressources API',
  title: 'Ressources API',
  subtitle: 'Définir les API que vous pouvez consommer à partir de vos applications autorisées',
  create: 'Créer une ressource API',
  api_name: "Nom de l'API",
  api_name_placeholder: "Entrez votre nom d'API",
  api_identifier: 'Identifiant API',
  api_identifier_tip:
    "L'identifiant unique de la ressource API. Il doit s'agir d'un URI absolu et ne doit pas comporter de fragment (#). Équivaut au <a>paramètre de ressource</> dans OAuth 2.0.",
  default_api: 'Default API', // UNTRANSLATED
  default_api_label:
    'If the current API Resource is set as the default API for the tenant, while each tenant can have either 0 or 1 default API. When a default API is designated, the resource parameter can be omitted in the auth request. Subsequent token exchanges will use that API as the audience by default, resulting in the issuance of JWTs.', // UNTRANSLATED
  api_resource_created: 'La ressource API {{name}} a été créée avec succès.',
  api_identifier_placeholder: 'https://votre-identifiant-api/',
};

export default api_resources;
