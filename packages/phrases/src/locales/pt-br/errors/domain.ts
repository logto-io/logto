const domain = {
  not_configured: 'O provedor de nome de domínio do host não está configurado.',
  cloudflare_data_missing: 'cloudflare_data está faltando, por favor verifique.',
  cloudflare_unknown_error: 'Recebido erro desconhecido ao solicitar API do Cloudflare',
  cloudflare_response_error: 'Recebido resposta inesperada do Cloudflare.',
  limit_to_one_domain: 'Você só pode ter um domínio personalizado.',
  hostname_already_exists: 'Este domínio já existe em nosso servidor.',
  cloudflare_not_found: 'Não é possível encontrar o nome do host no Cloudflare',
  domain_is_not_allowed: 'Este domínio não é permitido.',
  domain_in_use: 'O domínio {{domain}} já está em uso.',
  exceed_domain_limit: 'Você pode ter no máximo {{limit}} domínios personalizados.',
};

export default Object.freeze(domain);
