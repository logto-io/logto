const single_sign_on = {
  forbidden_domains: 'Nie są dozwolone publiczne domeny e-mail.',
  duplicated_domains: 'Istnieją zduplikowane domeny.',
  invalid_domain_format: 'Nieprawidłowy format domeny.',
  duplicate_connector_name: 'Nazwa łącznika już istnieje. Proszę wybrać inną nazwę.',
  idp_initiated_authentication_not_supported:
    'Uwierzytelnianie IdP-initiated jest obsługiwane wyłącznie dla złączy SAML.',
  idp_initiated_authentication_invalid_application_type:
    'Nieprawidłowy typ aplikacji. Dozwolone są tylko aplikacje {{type}}.',
  idp_initiated_authentication_redirect_uri_not_registered:
    'redirect_uri nie jest zarejestrowany. Proszę sprawdzić ustawienia aplikacji.',
  idp_initiated_authentication_client_callback_uri_not_found:
    'Nie znaleziono URI zwrotnego uwierzytelniania IdP-initiated klienta. Proszę sprawdzić ustawienia łącznika.',
};

export default Object.freeze(single_sign_on);
