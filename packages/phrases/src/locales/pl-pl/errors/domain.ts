const domain = {
  not_configured: 'Dostawca nazw domen dla hosta nie jest skonfigurowany.',
  cloudflare_data_missing: 'brak danych cloudflare, proszę sprawdzić.',
  cloudflare_unknown_error: 'Otrzymano nieznany błąd podczas żądania API Cloudflare',
  cloudflare_response_error: 'Otrzymano nieoczekiwaną odpowiedź od Cloudflare.',
  limit_to_one_domain: 'Możesz mieć tylko jedną niestandardową domenę.',
  hostname_already_exists: 'Ta domena już istnieje na naszym serwerze.',
  cloudflare_not_found: 'Nie można znaleźć nazwy hosta w Cloudflare',
  domain_is_not_allowed: 'Ta domena nie jest dozwolona.',
};

export default Object.freeze(domain);
