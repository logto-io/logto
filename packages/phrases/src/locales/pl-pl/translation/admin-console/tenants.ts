const tenants = {
  title: 'Ustawienia',
  description: 'Skuteczne zarządzanie ustawieniami najemcy i dostosowywanie domeny.',
  tabs: {
    settings: 'Ustawienia',
    domains: 'Domeny',
    subscription: 'Plan i rozliczenia',
    billing_history: 'Historia rozliczeń',
  },
  settings: {
    title: 'USTAWIENIA',
    tenant_id: 'ID Najemcy',
    tenant_name: 'Nazwa Najemcy',
    environment_tag: 'Tag Środowiska',
    environment_tag_description:
      'Tagi nie zmieniają usługi. Po prostu pomagają odróżnić różne środowiska.',
    environment_tag_development: 'Dev',
    environment_tag_staging: 'Staging',
    environment_tag_production: 'Prod',
    tenant_info_saved: 'Informacje o najemcy zostały pomyślnie zapisane.',
  },
  deletion_card: {
    title: 'USUWANIE',
    tenant_deletion: 'Usuń najemcę',
    tenant_deletion_description:
      'Usunięcie najemcy spowoduje trwałe usunięcie wszystkich powiązanych danych użytkowników i konfiguracji. Proszę postępować ostrożnie.',
    tenant_deletion_button: 'Usuń najemcę',
  },
  create_modal: {
    title: 'Utwórz nowego najemcę',
    subtitle: 'Utwórz nowego najemcę aby oddzielić zasoby i użytkowników.',
    create_button: 'Utwórz najemcę',
    tenant_name_placeholder: 'Mój najemca',
  },
  delete_modal: {
    title: 'Usuń najemcę',
    description_line1:
      'Czy na pewno chcesz usunąć najemcę "<span>{{name}}</span>" z tagiem sufiksu środowiska "<span>{{tag}}</span>"? Ta operacja jest nieodwracalna i spowoduje trwałe usunięcie wszystkich twoich danych i informacji konta.',
    description_line2:
      'Przed usunięciem konta, może chcemy Ci pomóc. <span><a>Skontaktuj się z nami przez e-mail</a></span>',
    description_line3:
      'Jeśli chcesz kontynuować, wprowadź nazwę najemcy "<span>{{name}}</span>" w celu potwierdzenia.',
    delete_button: 'Usuń na stałe',
    cannot_delete_title: 'Nie można usunąć tego najemcy',
    cannot_delete_description:
      'Przepraszam, nie możesz teraz usunąć tego najemcy. Upewnij się, że korzystasz z planu darmowego i uregulowałeś wszystkie zaległe płatności.',
  },
  tenant_landing_page: {
    title: 'Nie utworzyłeś jeszcze najemcy',
    description:
      'Aby rozpocząć konfigurowanie projektu z Logto, utwórz nowego najemcę. Jeśli musisz się wylogować lub usunąć swoje konto, wystarczy kliknąć przycisk awatara w prawym górnym rogu.',
    create_tenant_button: 'Utwórz najemcę',
  },
  status: {
    mau_exceeded: 'Przekroczono limit MAU',
    suspended: 'Zawieszony',
    overdue: 'Opóźnienie w płatnościach',
  },
  tenant_suspended_page: {
    title: 'Konto najemcy zawieszone. Skontaktuj się z nami, aby przywrócić dostęp.',
    description_1:
      'Z głębokim żalem informujemy, że twoje konto najemcy zostało tymczasowo zawieszone z powodu nieprawidłowego korzystania, w tym przekroczenia limitów MAU, opóźnionych płatności lub innych nieautoryzowanych działań.',
    description_2:
      'Jeśli potrzebujesz dalszych wyjaśnień, masz jakiekolwiek obawy lub chcesz przywrócić pełną funkcjonalność i odblokować swoje najemce, nie wahaj się skontaktować z nami natychmiast.',
  },
  signing_keys: {
    /** UNTRANSLATED */
    title: 'SIGNING KEYS',
    /** UNTRANSLATED */
    description: 'Securely manage signing keys in your tenant.',
    type: {
      /** UNTRANSLATED */
      private_key: 'OIDC private keys',
      /** UNTRANSLATED */
      cookie_key: 'OIDC cookie keys',
    },
    /** UNTRANSLATED */
    private_keys_in_use: 'Private keys in use',
    /** UNTRANSLATED */
    rotate_private_keys: 'Rotate private keys',
    /** UNTRANSLATED */
    rotate_private_keys_description:
      'This will rotate the currently used private keys. Your {{entities}} with previous private keys will stay valid until you delete it.',
    /** UNTRANSLATED */
    select_private_key_algorithm: 'Select signing key algorithm for private keys',
    /** UNTRANSLATED */
    rotate_button: 'Rotate',
    table_column: {
      /** UNTRANSLATED */
      id: 'ID',
      /** UNTRANSLATED */
      status: 'Status',
      /** UNTRANSLATED */
      algorithm: 'Signing key algorithm',
    },
    status: {
      /** UNTRANSLATED */
      current: 'Current',
      /** UNTRANSLATED */
      previous: 'Previous',
    },
    reminder: {
      /** UNTRANSLATED */
      rotate:
        'Are you sure you want to rotate the <strong>{{key}}</strong>? This will require all your apps and APIs to use the new signing key. Existing {{entities}} stay valid until you rotate again.',
      /** UNTRANSLATED */
      delete:
        'Are you sure you want to delete the <strong>{{key}}</strong>? Existing {{entities}} signed with this signing key will no longer be valid.',
    },
    signed_entity: {
      /** UNTRANSLATED */
      tokens: 'JWT tokens',
      /** UNTRANSLATED */
      cookies: 'cookies',
    },
  },
};

export default Object.freeze(tenants);
