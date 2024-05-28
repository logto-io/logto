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
      'Any resources in the tenant will remain but you no longer have access to this tenant.',
    last_admin_note:
      'Aby opuścić tego najemcę, upewnij się, że co najmniej jeszcze jeden członek ma rolę Administrator.',
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
  delete_modal: {
    title: 'Usuń najemcę',
    description_line1:
      'Are you sure you want to delete your tenant "<span>{{name}}</span>" with environment suffix tag "<span>{{tag}}</span>"? This action cannot be undone, and will result in the permanent deletion of all your data and tenant information.',
    description_line2:
      'Before deleting tenant, maybe we can help you. <span><a>Contact us via Email</a></span>',
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
};

export default Object.freeze(tenants);
