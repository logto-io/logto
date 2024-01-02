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
    description:
      'Ustaw nazwę najemcy i wyświetl informacje o regionie hostowania danych oraz typie najemcy.',
    tenant_id: 'ID Najemcy',
    tenant_name: 'Nazwa Najemcy',
    tenant_region: 'Region hostowania danych',
    tenant_region_tip:
      'Twoje zasoby najemcy są hostowane w {{region}}. <a>Uzyskaj więcej informacji</a>',
    environment_tag_development: 'Dev',
    environment_tag_production: 'Prod',
    tenant_type: 'Typ najemcy',
    development_description:
      'Wyłącznie do testów i nie powinien być używany w produkcji. Nie jest wymagana subskrypcja. Posiada wszystkie funkcje Pro, ale ma ograniczenia, takie jak baner logowania. <a>Uzyskaj więcej informacji</a>',
    production_description:
      'Przeznaczony dla aplikacji używanych przez użytkowników końcowych i może wymagać płatnej subskrypcji. <a>Uzyskaj więcej informacji</a>',
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
    development_description:
      'Wyłącznie do testów i nie powinien być używany w produkcji. Nie jest wymagana subskrypcja.',
    development_hint:
      'Posiada wszystkie funkcje Pro, ale ma ograniczenia, takie jak baner logowania.',
    production_description:
      'Przeznaczony dla użytkowników końcowych i może wymagać płatnej subskrypcji.',
    available_plan: 'Dostępny plan:',
    create_button: 'Utwórz najemcę',
    tenant_name_placeholder: 'Mój najemca',
  },
  dev_tenant_migration: {
    title:
      'Teraz możesz przetestować nasze funkcje Pro, tworząc nowego "Najemcę w trybie deweloperskim"!',
    affect_title: 'Jak to wpłynie na Ciebie?',
    hint_1:
      'Zastępujemy stare <strong>tagi środowiska</strong> dwoma nowymi typami najemców: <strong>„Development”</strong> i <strong>„Production”</strong>.',
    hint_2:
      'Aby zapewnić płynne przejście i nieprzerwaną funkcjonalność, wszystkie wcześniej utworzone najemcy zostaną podniesione do typu najemcy <strong>Production</strong> wraz z Twoją poprzednią subskrypcją.',
    hint_3: 'Nie martw się, wszystkie inne ustawienia pozostaną takie same.',
    about_tenant_type: 'O typie najemcy',
  },
  dev_tenant_notification: {
    title: 'Teraz możesz uzyskać <a>wszystkie funkcje Logto Pro</a> w swoim najemcy deweloperskim!',
    description: 'Jest to całkowicie darmowe, bez okresu próbnego – na zawsze!',
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
