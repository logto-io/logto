const organization_details = {
  page_title: 'Szczegóły organizacji',
  delete_confirmation:
    'Po usunięciu wszyscy członkowie stracą swoje członkostwo i role w tej organizacji. Tego działania nie można cofnąć.',
  organization_id: 'ID organizacji',
  settings_description:
    'Organizacje reprezentują zespoły, klientów biznesowych i partnerów, którzy mogą mieć dostęp do Twoich aplikacji.',
  name_placeholder: 'Nazwa organizacji, nie musi być unikalna.',
  description_placeholder: 'Opis organizacji.',
  member: 'Członek',
  member_other: 'Członkowie',
  add_members_to_organization: 'Dodaj członków do organizacji {{name}}',
  add_members_to_organization_description:
    'Znajdź odpowiednich użytkowników, wyszukując nazwę, adres e-mail, numer telefonu lub identyfikator użytkownika. Istniejący członkowie nie są wyświetlani w wynikach wyszukiwania.',
  add_with_organization_role: 'Dodaj z rolą(ami) organizacji',
  user: 'Użytkownik',
  application: 'Aplikacja',
  application_other: 'Aplikacje',
  add_applications_to_organization: 'Dodaj aplikacje do organizacji {{name}}',
  add_applications_to_organization_description:
    'Znajdź odpowiednie aplikacje, wyszukując ID aplikacji, nazwę lub opis. Istniejące aplikacje nie są wyświetlane w wynikach wyszukiwania.',
  at_least_one_application: 'Wymagana jest co najmniej jedna aplikacja.',
  remove_application_from_organization: 'Usuń aplikację z organizacji',
  remove_application_from_organization_description:
    'Po usunięciu aplikacja utraci swoje powiązanie i role w tej organizacji. Tego działania nie można cofnąć.',
  search_application_placeholder: 'Wyszukaj według ID aplikacji, nazwy lub opisu',
  roles: 'Role organizacji',
  authorize_to_roles: 'Autoryzuj {{name}} dostęp do następujących ról:',
  edit_organization_roles: 'Edytuj role organizacji',
  edit_organization_roles_title: 'Edytuj role organizacji {{name}}',
  remove_user_from_organization: 'Usuń użytkownika z organizacji',
  remove_user_from_organization_description:
    'Po usunięciu użytkownik straci swoje członkostwo i role w tej organizacji. Tego działania nie można cofnąć.',
  search_user_placeholder:
    'Wyszukaj według nazwy, adresu e-mail, numeru telefonu lub identyfikatora użytkownika',
  at_least_one_user: 'Wymagany jest co najmniej jeden użytkownik.',
  organization_roles_tooltip: 'Role przypisane do {{type}} w tej organizacji.',
  custom_data: 'Dane niestandardowe',
  custom_data_tip:
    'Dane niestandardowe to obiekt JSON, który może być wykorzystany do przechowywania dodatkowych danych związanych z organizacją.',
  invalid_json_object: 'Nieprawidłowy obiekt JSON.',
  branding: {
    logo: 'Logotypy organizacji',
    logo_tooltip:
      'Możesz podać ID organizacji, aby wyświetlić ten logo w doświadczeniu logowania; ciemna wersja logo jest potrzebna, jeśli tryb ciemny jest włączony w ustawieniach doświadczenia logowania omni. <a>Dowiedz się więcej</a>',
  },
  jit: {
    title: 'Udostępnianie w odpowiednim momencie',
    description:
      'Użytkownicy mogą automatycznie dołączyć do organizacji i otrzymać role przy pierwszym logowaniu przez niektóre metody uwierzytelniania. Możesz ustawić wymagania do spełnienia dla natychmiastowego udostępniania.',
    email_domain: 'Udostępnianie domeny email',
    email_domain_description:
      'Nowi użytkownicy rejestrujący się za pomocą zweryfikowanych adresów email lub logujący się przez social sign-in ze zweryfikowanymi adresami email automatycznie dołączą do organizacji. <a>Dowiedz się więcej</a>',
    email_domain_placeholder: 'Wprowadź domeny email do automatycznego udostępniania',
    invalid_domain: 'Nieprawidłowa domena',
    domain_already_added: 'Domena już dodana',
    sso_enabled_domain_warning:
      'Wprowadziłeś jeden lub więcej domen email powiązanych z korporacyjnym SSO. Użytkownicy z tymi adresami email będą podążać standardowym przepływem SSO i nie będą automatycznie przydzielani do tej organizacji, chyba że jest skonfigurowane korporacyjne udostępnianie SSO.',
    enterprise_sso: 'Korporacyjne udostępnianie SSO',
    no_enterprise_connector_set:
      'Nie skonfigurowałeś jeszcze żadnego łącznika SSO korporacyjnego. Najpierw dodaj łączniki, aby włączyć korporacyjne udostępnianie SSO. <a>Skonfiguruj</a>',
    add_enterprise_connector: 'Dodaj łącznik korporacyjny',
    enterprise_sso_description:
      'Nowi użytkownicy lub istniejący użytkownicy logujący się po raz pierwszy przez korporacyjne SSO automatycznie dołączą do organizacji. <a>Dowiedz się więcej</a>',
    organization_roles: 'Domyślne role organizacji',
    organization_roles_description:
      'Przypisz role użytkownikom przy dołączaniu do organizacji za pośrednictwem automatycznego udostępniania.',
  },
  mfa: {
    title: 'Uwierzytelnianie wieloskładnikowe (MFA)',
    tip: 'Kiedy MFA jest wymagane, użytkownicy bez skonfigurowanego MFA będą odrzuceni podczas próby wymiany tokenu organizacji. To ustawienie nie wpływa na uwierzytelnianie użytkownika.',
    description:
      'Wymagaj, aby użytkownicy skonfigurowali uwierzytelnianie wieloskładnikowe w celu uzyskania dostępu do tej organizacji.',
    no_mfa_warning:
      'Nie są włączone żadne metody uwierzytelniania wieloskładnikowego dla Twojego najemcy. Użytkownicy nie będą mogli uzyskać dostępu do tej organizacji, dopóki przynajmniej jedna <a>metoda uwierzytelniania wieloskładnikowego</a> nie zostanie włączona.',
  },
};

export default Object.freeze(organization_details);
