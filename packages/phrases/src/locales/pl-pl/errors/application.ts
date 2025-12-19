const application = {
  invalid_type: 'Tylko aplikacje maszyna-do-maszyny mogą mieć przypisane role.',
  role_exists: 'Rola o identyfikatorze {{roleId}} została już dodana do tej aplikacji.',
  invalid_role_type: 'Nie można przypisać roli typu użytkownika do aplikacji maszyna-do-maszyny.',
  invalid_third_party_application_type:
    'Tylko tradycyjne aplikacje internetowe, jednostronicowe i natywne mogą być oznaczone jako aplikacje zewnętrzne.',
  third_party_application_only: 'Ta funkcja jest dostępna tylko dla aplikacji zewnętrznych.',
  user_consent_scopes_not_found: 'Nieprawidłowe zakresy zgody użytkownika.',
  consent_management_api_scopes_not_allowed: 'Nie są dozwolone zakresy API zarządzania.',
  protected_app_metadata_is_required: 'Wymagane jest zabezpieczone metadane aplikacji.',
  protected_app_not_configured:
    'Dostawca aplikacji zabezpieczonej nie jest skonfigurowany. Ta funkcja nie jest dostępna dla wersji open source.',
  cloudflare_unknown_error: 'Wystąpił nieznany błąd podczas żądania interfejsu API Cloudflare',
  protected_application_only: 'Ta funkcja jest dostępna tylko dla aplikacji chronionych.',
  protected_application_misconfigured: 'Aplikacja chroniona jest źle skonfigurowana.',
  protected_application_subdomain_exists: 'Subdomena aplikacji chronionej jest już w użyciu.',
  invalid_subdomain: 'Nieprawidłowa subdomena.',
  custom_domain_not_found: 'Nie znaleziono niestandardowej domeny.',
  should_delete_custom_domains_first: 'Należy najpierw usunąć niestandardowe domeny.',
  no_legacy_secret_found: 'Aplikacja nie ma starszego sekretu.',
  secret_name_exists: 'Nazwa sekretu już istnieje.',
  saml: {
    use_saml_app_api:
      'Użyj interfejsu API `[METHOD] /saml-applications(/.*)?` aby obsługiwać aplikację SAML.',
    saml_application_only: 'Interfejs API jest dostępny tylko dla aplikacji SAML.',
    reach_oss_limit:
      'NIE możesz utworzyć więcej aplikacji SAML, ponieważ osiągnięto limit {{limit}}.',
    acs_url_binding_not_supported:
      'Obsługiwane jest tylko wiązanie HTTP-POST do odbierania asercji SAML.',
    can_not_delete_active_secret: 'Nie można usunąć aktywnego sekretu.',
    no_active_secret: 'Nie znaleziono aktywnego sekretu.',
    entity_id_required: 'Do wygenerowania metadanych wymagany jest identyfikator podmiotu.',
    name_id_format_required: 'Wymagany jest format identyfikatora nazwy.',
    unsupported_name_id_format: 'Nieobsługiwany format identyfikatora nazwy.',
    missing_email_address: 'Użytkownik nie ma adresu e-mail.',
    email_address_unverified: 'Adres e-mail użytkownika nie został zweryfikowany.',
    invalid_certificate_pem_format: 'Nieprawidłowy format certyfikatu PEM',
    acs_url_required: 'Wymagany jest URL usługi konsumenta asercji.',
    private_key_required: 'Wymagany jest klucz prywatny.',
    certificate_required: 'Wymagany jest certyfikat.',
    invalid_saml_request: 'Nieprawidłowe żądanie uwierzytelnienia SAML.',
    auth_request_issuer_not_match:
      'Podmiot wydający żądanie uwierzytelnienia SAML nie pasuje do identyfikatora podmiotu dostawcy usług.',
    sp_initiated_saml_sso_session_not_found_in_cookies:
      'Identyfikator sesji SAML SSO zainicjowanej przez dostawcę usług nie został znaleziony w plikach cookie.',
    sp_initiated_saml_sso_session_not_found:
      'Sesja SAML SSO zainicjowana przez dostawcę usług nie została znaleziona.',
    state_mismatch: 'Niezgodność `state`.',
  },
};

export default Object.freeze(application);
