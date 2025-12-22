const domain = {
  not_configured: 'Domain hostname provider is not configured.',
  cloudflare_data_missing: 'cloudflare_data is missing, please check.',
  cloudflare_unknown_error: 'Got unknown error when requesting Cloudflare API',
  cloudflare_response_error: 'Got unexpected response from Cloudflare.',
  limit_to_one_domain: 'You can only have one custom domain.',
  hostname_already_exists: 'This domain already exists in our server.',
  cloudflare_not_found: 'Can not find hostname in Cloudflare',
  domain_is_not_allowed: 'This domain is not allowed.',
  domain_in_use: 'The domain {{domain}} is already in use',
  exceed_domain_limit: 'You can have at most {{limit}} custom domains.',
};

export default Object.freeze(domain);
