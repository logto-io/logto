const domain = {
  not_configured: 'Der Domain-Hostname-Anbieter ist nicht konfiguriert.',
  cloudflare_data_missing: 'cloudflare_data fehlt, bitte überprüfen Sie es.',
  cloudflare_unknown_error:
    'Beim Anfordern der Cloudflare-API ist ein unbekannter Fehler aufgetreten',
  cloudflare_response_error: 'Vom Cloudflare wurde eine unerwartete Antwort erhalten.',
  limit_to_one_domain: 'Sie können nur eine benutzerdefinierte Domain haben.',
  hostname_already_exists: 'Diese Domain existiert bereits auf unserem Server.',
  cloudflare_not_found: 'Hostname in Cloudflare nicht gefunden',
  domain_is_not_allowed: 'Diese Domain ist nicht zulässig.',
  domain_in_use: 'Die Domain {{domain}} wird bereits verwendet.',
  exceed_domain_limit: 'Sie können höchstens {{limit}} benutzerdefinierte Domains haben.',
};

export default Object.freeze(domain);
