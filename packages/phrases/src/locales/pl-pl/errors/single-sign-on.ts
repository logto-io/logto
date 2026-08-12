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
  sso_signing_unavailable:
    'Nie udało się dokończyć logowania za pomocą dostawcy tożsamości. Skontaktuj się z administratorem.',
  can_not_delete_active_signing_key:
    'Nie można usunąć aktywnego klucza podpisującego. Najpierw aktywuj inny klucz lub dezaktywuj ten klucz.',
  can_not_deactivate_signing_key_in_use:
    'Nie można dezaktywować klucza podpisującego, gdy podpisane żądania uwierzytelnienia są włączone. Najpierw wyłącz podpisane żądania uwierzytelnienia.',
  active_signing_key_required:
    'Nie znaleziono aktywnego klucza podpisującego. Wygeneruj i aktywuj klucz podpisujący przed włączeniem podpisanych żądań uwierzytelnienia.',
};

export default Object.freeze(single_sign_on);
