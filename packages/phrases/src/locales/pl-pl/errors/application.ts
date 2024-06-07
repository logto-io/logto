const application = {
  invalid_type: 'Tylko aplikacje maszyna-do-maszyny mogą mieć przypisane role.',
  role_exists: 'Rola o identyfikatorze {{roleId}} została już dodana do tej aplikacji.',
  invalid_role_type: 'Nie można przypisać roli typu użytkownika do aplikacji maszyna-do-maszyny.',
  invalid_third_party_application_type:
    'Tylko tradycyjne aplikacje internetowe mogą być oznaczone jako aplikacja zewnętrzna.',
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
};

export default Object.freeze(application);
