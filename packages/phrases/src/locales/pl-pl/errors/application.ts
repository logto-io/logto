const application = {
  invalid_type: 'Tylko aplikacje maszyna-do-maszyny mogą mieć przypisane role.',
  role_exists: 'Rola o identyfikatorze {{roleId}} została już dodana do tej aplikacji.',
  invalid_role_type: 'Nie można przypisać roli typu użytkownika do aplikacji maszyna-do-maszyny.',
  invalid_third_party_application_type:
    'Tylko tradycyjne aplikacje internetowe mogą być oznaczone jako aplikacja zewnętrzna.',
  third_party_application_only: 'Ta funkcja jest dostępna tylko dla aplikacji zewnętrznych.',
  user_consent_scopes_not_found: 'Nieprawidłowe zakresy zgody użytkownika.',
  protected_app_metadata_is_required: 'Wymagane jest zabezpieczone metadane aplikacji.',
  /** UNTRANSLATED */
  protected_app_not_configured: 'Protected app provider is not configured.',
  /** UNTRANSLATED */
  cloudflare_unknown_error: 'Got unknown error when requesting Cloudflare API',
  /** UNTRANSLATED */
  protected_application_only: 'The feature is only available for protected applications.',
  /** UNTRANSLATED */
  protected_application_misconfigured: 'Protected application is misconfigured.',
};

export default Object.freeze(application);
