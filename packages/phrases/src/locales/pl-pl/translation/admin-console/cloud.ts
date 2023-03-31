const cloud = {
  welcome: {
    page_title: 'Witaj',
    title: 'Witaj i stwórz własny podgląd chmury Logto',
    description:
      'Nie ważne czy jesteś użytkownikiem open-source czy chmury, przejdź przez prezentacje i doświadcz pełnej wartości Logto. Podgląd chmury serwuje również jako wstępna wersja chmury Logto.',
    project_field: 'Używam Logto do',
    project_options: {
      personal: 'Projektu osobistego',
      company: 'Projektu firmowego',
    },
    deployment_type_field: 'Wolisz open-source czy chmurę?',
    deployment_type_options: {
      open_source: 'Open-Source',
      cloud: 'Chmura',
    },
  },
  about: {
    page_title: 'Trochę o Tobie',
    title: 'Trochę o Tobie',
    description:
      'Stwórz indywidualne wrażenia z Logto dzięki naszej wiedzy na temat Ciebie. Twoje informacje są bezpieczne u nas.',
    title_field: 'Twój tytuł',
    title_options: {
      developer: 'Developer',
      team_lead: 'Team Lead',
      ceo: 'CEO',
      cto: 'CTO',
      product: 'Product',
      others: 'Inne',
    },
    company_name_field: 'Nazwa firmy',
    company_name_placeholder: 'Acme.co',
    company_size_field: 'Jak wielka jest Twoja firma?',
    company_options: {
      size_1: '1',
      size_2_49: '2-49',
      size_50_199: '50-199',
      size_200_999: '200-999',
      size_1000_plus: '1000+',
    },
    reason_field: 'Rejestruję się, ponieważ',
    reason_options: {
      passwordless: 'Szukam uwierzytelnienia bez hasła i zestawu interfejsów użytkownika',
      efficiency: 'Szukam infrastruktury tożsamości out-of-the-box',
      access_control: 'Kontroluj dostęp użytkowników na podstawie ról i odpowiedzialności',
      multi_tenancy: 'Szukam strategii dla produktu multi-mandantowego',
      enterprise: 'Szukam rozwiązań SSO dla gotowości przedsiębiorstwa',
      others: 'Inne',
    },
  },
  congrats: {
    page_title: 'Zarób wczesne kredyty',
    title: 'Wspaniała wiadomość! Kwalifikujesz się do zyskania wczesnego kredytu na chmurę Logto!',
    description:
      'Nie przegap szansy na bezpłatną <strong>60-dniową</strong> subskrypcję na chmurę Logto po jej oficjalnym uruchomieniu! Skontaktuj się z zespołem Logto, aby dowiedzieć się więcej.',
    check_out_button: 'Zobacz podgląd na żywo',
    email_us_title:
      'Napisz do nas maila w celu uzyskania oferty specjalnej i szczegółów dotyczących ceny',
    email_us_description: 'Uzyskaj wyłączną ofertę cenową na oszczędność pieniędzy',
    email_us_button: 'Wyślij e-mail',
    join_description:
      'Dołącz do naszej publicznej <a>{{link}}</a>, aby połączyć się i rozmawiać z innymi deweloperami.',
    discord_link: 'kanał discord',
    enter_admin_console: 'Wejdź do podglądu chmury Logto',
  },
  gift: {
    title: 'Używaj Logto Cloud za darmo przez 60 dni. Dołącz do pionierów już teraz!',
    description: 'Zarezerwuj spotkanie z naszym zespołem i zdobądź wczesny kredyt.',
    reserve_title: 'Zarezerwuj swój czas z zespołem Logto',
    reserve_description: 'Kredyt przysługuje tylko raz po ocenie.',
    book_button: 'Rezerwuj',
    email_us_title: 'Napisz do nas',
    email_us_description: 'Skontaktuj się z nami, aby otrzymać ofertę specjalną i szczegóły cen.',
    email_us_button: 'Wyślij',
  },
  sie: {
    page_title: 'Dostosuj doświadczenie logowania',
    title: 'Najpierw dostosuj swoje doświadczenie logowania',
    inspire: {
      title: 'Stwórz przykłady',
      description:
        'Nie jesteś pewien swojego doświadczenia logowania? Kliknij "Zainspiruj mnie" i pozwól, żeby magia się stała!',
      inspire_me: 'Zainspiruj mnie',
    },
    logo_field: 'Logo aplikacji',
    color_field: 'Kolor marki',
    identifier_field: 'Identyfikator',
    identifier_options: {
      email: 'E-mail',
      phone: 'Telefon',
      user_name: 'Nazwa użytkownika',
    },
    authn_field: 'Uwierzytelnianie',
    authn_options: {
      password: 'Hasło',
      verification_code: 'Kod weryfikacyjny',
    },
    social_field: 'Logowanie społecznościowe',
    finish_and_done: 'Skończone i gotowe',
    preview: {
      mobile_tab: 'Mobilny',
      web_tab: 'Sieć',
    },
    connectors: {
      unlocked_later: 'Zostanie odblokowane później',
      unlocked_later_tip:
        'Po ukończeniu procesu wprowadzenia do użytku i wejściu do produktu będziesz mieć dostęp do jeszcze większej liczby metod logowania społecznościowego.',
      notice:
        'Prosimy, unikaj korzystania z demo konektora do celów produkcyjnych. Po zakończeniu testów, uprzejmie usuń demokonwerter i skonfiguruj swój własny konektor z własnymi poświadczeniami.',
    },
  },
  broadcast: '📣 Jesteś w Logto Cloud (Podgląd)',
  socialCallback: {
    title: 'Zalogowałeś się pomyślnie',
    description:
      'Zalogowałeś się pomyślnie używając swojego konta społecznościowego. Aby zapewnić bezproblemową integrację i dostęp do wszystkich funkcji Logto, zalecamy przejście do konfiguracji własnego konektora społecznościowego.',
  },
};

export default cloud;
