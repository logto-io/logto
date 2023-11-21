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
    /** UNTRANSLATED */
    description: 'Set the tenant name and view your data hosted region and tenant type.',
    tenant_id: 'ID Najemcy',
    tenant_name: 'Nazwa Najemcy',
    tenant_region: 'Data hosted region',
    tenant_region_tip: 'Your tenant resources are hosted in {{region}}. <a>Learn more</a>',
    environment_tag_development: 'Dev',
    environment_tag_staging: 'Staging',
    environment_tag_production: 'Prod',
    /** UNTRANSLATED */
    tenant_type: 'Tenant type',
    /** UNTRANSLATED */
    development_description:
      "For testing only and shouldn't be used in production. No subscription is required. It has all the pro features but has limitations like a sign-in banner. <a>Learn more</a>",
    /** UNTRANSLATED */
    production_description:
      'Intended for apps that are being used by end-users and may require a paid subscription. <a>Learn more</a>',
    tenant_info_saved: 'Informacje o najemcy zostały pomyślnie zapisane.',
  },
  full_env_tag: {
    development: 'Development',
    production: 'Production',
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
    subtitle:
      'Utwórz nowego najemcę, który ma izolowane zasoby i użytkowników. Dane hostowanej regionu i typy najemców nie mogą być modyfikowane po utworzeniu.',
    tenant_usage_purpose: 'Co chcesz zrobić z tym najemcą?',
    /** UNTRANSLATED */
    development_description:
      "For testing only and shouldn't be used in production. No subscription is required.",
    /** UNTRANSLATED */
    development_hint: 'It has all the pro features but has limitations like a sign-in banner.',
    /** UNTRANSLATED */
    production_description: 'For use by end-users and may require a paid subscription.',
    available_plan: 'Dostępny plan:',
    create_button: 'Utwórz najemcę',
    tenant_name_placeholder: 'Mój najemca',
  },
  dev_tenant_migration: {
    /** UNTRANSLATED */
    title:
      'You can now try our Hobby and Pro features for free by creating a new "Development tenant"!',
    /** UNTRANSLATED */
    affect_title: 'How does this affect you?',
    /** UNTRANSLATED */
    hint_1:
      'We are replacing the old <strong>environment tags</strong> with two new tenant types: <strong>“Development”</strong> and <strong>“Production”</strong>.',
    /** UNTRANSLATED */
    hint_2:
      'To ensure a seamless transition and uninterrupted functionality, all early-created tenants will be elevated to the <strong>Production</strong> tenant type along with your previous subscription.',
    /** UNTRANSLATED */
    hint_3: "Don't worry, all your other settings will remain the same.",
    /** UNTRANSLATED */
    about_tenant_type: 'About tenant type',
  },
  dev_tenant_notification: {
    /** UNTRANSLATED */
    title:
      'You can now access <a>all features of Logto Hobby and Pro</a> in your development tenant!',
    /** UNTRANSLATED */
    description: "It's completely free, with no trial period – forever!",
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
    title: 'ZARZĄDZANIE KLUCZAMI PODPISUJĄCYMI',
    description: 'Bezpieczne zarządzanie kluczami podpisującymi w Twoim najemcy.',
    type: {
      private_key: 'Klucze prywatne OIDC',
      cookie_key: 'Klucze ciasteczek OIDC',
    },
    private_keys_in_use: 'Używane klucze prywatne',
    cookie_keys_in_use: 'Używane klucze ciasteczek',
    rotate_private_keys: 'Obróć klucze prywatne',
    rotate_cookie_keys: 'Obróć klucze ciasteczek',
    rotate_private_keys_description:
      'Ta akcja spowoduje utworzenie nowego klucza prywatnego do podpisywania, obrócenie bieżącego klucza i usunięcie poprzedniego klucza. Twoje tokeny JWT podpisane aktualnym kluczem pozostaną ważne do czasu usunięcia lub kolejnego obrotu.',
    rotate_cookie_keys_description:
      'Ta akcja spowoduje utworzenie nowego klucza ciasteczka, obrócenie bieżącego klucza i usunięcie poprzedniego klucza. Twoje ciasteczka z aktualnym kluczem pozostaną ważne do czasu usunięcia lub kolejnego obrotu.',
    select_private_key_algorithm:
      'Wybierz algorytm podpisywania klucza dla nowego klucza prywatnego',
    rotate_button: 'Obróć',
    table_column: {
      id: 'ID',
      status: 'Status',
      algorithm: 'Algorytm podpisywania klucza',
    },
    status: {
      current: 'Bieżący',
      previous: 'Poprzedni',
    },
    reminder: {
      rotate_private_key:
        'Czy na pewno chcesz obrócić <strong>Klucze prywatne OIDC</strong>? Nowo wydane tokeny JWT będą podpisywane nowym kluczem. Istniejące tokeny JWT pozostają ważne do czasu ponownego obrotu.',
      rotate_cookie_key:
        'Czy na pewno chcesz obrócić <strong>Klucze ciasteczek OIDC</strong>? Nowo generowane ciasteczka w sesjach logowania będą podpisywane nowym kluczem ciasteczka. Istniejące ciasteczka pozostają ważne do czasu ponownego obrotu.',
      delete_private_key:
        'Czy na pewno chcesz usunąć <strong>Klucz prywatny OIDC</strong>? Istniejące tokeny JWT podpisane tym kluczem prywatnym przestaną być ważne.',
      delete_cookie_key:
        'Czy na pewno chcesz usunąć <strong>Klucz ciasteczka OIDC</strong>? Starsze sesje logowania z ciasteczkami podpisanymi tym kluczem ciasteczka przestaną być ważne. Wymagane będzie ponowne uwierzytelnienie tych użytkowników.',
    },
    messages: {
      rotate_key_success: 'Klucze podpisu obrócone pomyślnie.',
      delete_key_success: 'Klucz usunięty pomyślnie.',
    },
  },
};

export default Object.freeze(tenants);
