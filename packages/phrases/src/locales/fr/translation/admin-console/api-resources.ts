const api_resources = {
  page_title: 'Ressources API',
  title: 'Ressources API',
  subtitle: 'Définir les API que vous pouvez consommer à partir de vos applications autorisées',
  create: 'Créer une ressource API',
  api_name: "Nom de l'API",
  api_name_placeholder: "Entrez votre nom d'API",
  api_identifier: "Identifiant de l'API",
  api_identifier_placeholder: 'https://votre-identifiant-api/',
  api_identifier_tip:
    "L'identifiant unique de la ressource API. Il doit s'agir d'un URI absolu et ne doit pas comporter de fragment (#). Équivaut au <a>paramètre de ressource</> dans OAuth 2.0.",
  default_api: 'API par défaut',
  default_api_label:
    'Seulement zéro ou une API par défaut peut être définie par tenant. Lorsqu\'une API par défaut est désignée, le paramètre "resource" peut être omis dans la demande d\'authentification. Les échanges de jetons ultérieurs utiliseront cette API comme public cible par défaut, ce qui entraînera la délivrance de JWT. <a>En savoir plus</a>',
  api_resource_created: 'La ressource API {{name}} a été créée avec succès.',
  invalid_resource_indicator_format: "L'indicateur de l'API doit être un URI absolu valide.",
};

export default Object.freeze(api_resources);
