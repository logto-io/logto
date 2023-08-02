const domain = {
  not_configured: 'Domain hostname provider is not configured.',
  cloudflare_data_missing: 'cloudflare_data is missing, please check.',
  cloudflare_unknown_error: 'Got unknown error when requesting Cloudflare API',
  cloudflare_response_error: 'Got unexpected response from Cloudflare.',
  limit_to_one_domain: 'You can only have one custom domain.',
  hostname_already_exists: 'This domain already exists in our server.',
};

export default Object.freeze(domain);
