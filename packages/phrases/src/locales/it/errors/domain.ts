const domain = {
  not_configured: "Il fornitore del nome di dominio dell'host non è configurato.",
  cloudflare_data_missing: 'Dati cloudflare mancanti, per favore verificare.',
  cloudflare_unknown_error: 'Errore sconosciuto durante la richiesta di API Cloudflare',
  cloudflare_response_error: 'Ricevuta una risposta non prevista da Cloudflare.',
  limit_to_one_domain: 'Puoi avere solo un dominio personalizzato.',
  hostname_already_exists: 'Questo dominio esiste già nel nostro server.',
  cloudflare_not_found: 'Impossibile trovare il nome host in Cloudflare.',
  domain_is_not_allowed: 'Questo dominio non è permesso.',
};

export default Object.freeze(domain);
