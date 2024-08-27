const tenants = {
  title: 'Ustawienia',
  description: 'Skuteczne zarządzanie ustawieniami najemcy i dostosowywanie domeny.',
  tabs: {
    settings: 'Ustawienia',
    members: 'Członkowie',
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
    tenant_region_description:
      'Fizyczna lokalizacja, w której hostowane są zasoby twojego najemcy (użytkownicy, aplikacje itp.). Tego nie można zmienić po utworzeniu.',
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
  leave_tenant_card: {
    title: 'OPUŚĆ',
    leave_tenant: 'Opuść najemcę',
    leave_tenant_description:
      'Wszelkie zasoby w najemcy pozostaną, ale nie będziesz mieć dostępu do tego najemcy.',
    last_admin_note:
      'Aby opuścić tego najemcę, upewnij się, że co najmniej jeszcze jeden członek ma rolę Administrator.',
  },
  create_modal: {
    title: 'Utwórz nowego najemcę',
    subtitle: 'Utwórz nowego najemcę z izolowanymi zasobami i użytkownikami.',
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
    tenant_created: 'Najemca utworzony pomyślnie.',
    invitation_failed:
      'Niektóre zaproszenia nie udało się wysłać. Spróbuj ponownie później w Ustawienia -> Członkowie.',
    tenant_type_description: 'Tego nie można zmienić po utworzeniu.',
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
  delete_modal: {
    title: 'Usuń najemcę',
    description_line1:
      'Czy na pewno chcesz usunąć swojego najemcę "<span>{{name}}</span>" z sufiksem tagu środowiska "<span>{{tag}}</span>"? Tego działania nie można cofnąć i spowoduje ono trwałe usunięcie wszystkich Twoich danych i informacji o najemcy.',
    description_line2:
      'Przed usunięciem najemcy, może możemy Ci pomóc. <span><a>Skontaktuj się z nami przez e-mail</a></span>',
    description_line3:
      'Jeśli chcesz kontynuować, wprowadź nazwę najemcy "<span>{{name}}</span>" w celu potwierdzenia.',
    delete_button: 'Usuń na stałe',
    cannot_delete_title: 'Nie można usunąć tego najemcy',
    cannot_delete_description:
      'Przepraszam, nie możesz teraz usunąć tego najemcy. Upewnij się, że korzystasz z planu darmowego i uregulowałeś wszystkie zaległe płatności.',
  },
  leave_tenant_modal: {
    description: 'Czy na pewno chcesz opuścić tego najemcę?',
    leave_button: 'Opuść',
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
  production_tenant_notification: {
    text: 'Jesteś w trybie najemcy deweloperskiego do darmowego testowania. Utwórz najemcę produkcyjnego, aby przejść do działania.',
    action: 'Utwórz najemcę',
  },
};

export default Object.freeze(tenants);
