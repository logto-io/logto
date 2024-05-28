const domain = {
  not_configured: "Le fournisseur de nom de domaine de l'hôte n'est pas configuré.",
  cloudflare_data_missing: 'les données de cloudflare sont manquantes, veuillez vérifier.',
  cloudflare_unknown_error: "Erreur inconnue lors de la requête de l'API Cloudflare",
  cloudflare_response_error: 'Réponse inattendue de Cloudflare',
  limit_to_one_domain: "Vous ne pouvez avoir qu'un seul domaine personnalisé",
  hostname_already_exists: 'Ce domaine existe déjà sur notre serveur.',
  cloudflare_not_found: "Impossible de trouver le nom d'hôte dans Cloudflare",
  domain_is_not_allowed: "Ce domaine n'est pas autorisé.",
};

export default Object.freeze(domain);
