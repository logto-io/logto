const domain = {
  not_configured: 'O provedor de nome de host de domínio não está configurado.',
  cloudflare_data_missing: 'cloudflare_data está faltando, por favor verifique.',
  cloudflare_unknown_error: 'Obteve um erro desconhecido ao solicitar a API Cloudflare',
  cloudflare_response_error: 'Obteve uma resposta inesperada da Cloudflare.',
  limit_to_one_domain: 'Você só pode ter um domínio personalizado.',
  hostname_already_exists: 'Este domínio já existe em nosso servidor.',
  cloudflare_not_found: 'Não é possível encontrar o nome de host no Cloudflare',
  domain_is_not_allowed: 'Este domínio não é permitido.',
};

export default Object.freeze(domain);
