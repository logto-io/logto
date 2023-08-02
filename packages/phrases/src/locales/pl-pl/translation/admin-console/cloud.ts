const cloud = {
  general: {
    onboarding: 'Wdrażanie',
  },
  welcome: {
    page_title: 'Witamy',
    title: 'Witaj w chmurze Logto! Chcielibyśmy dowiedzieć się trochę o Tobie.',
    description:
      'Stwórz indywidualne wrażenia z Logto dzięki naszej wiedzy na temat Ciebie. Twoje informacje są bezpieczne u nas.',
    project_field: 'Używam Logto do',
    project_options: {
      personal: 'Projektu osobistego',
      company: 'Projektu firmowego',
    },
    title_field: 'Wybierz odpowiednie tytuły',
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
  socialCallback: {
    title: 'Zalogowałeś się pomyślnie',
    description:
      'Zalogowałeś się pomyślnie używając swojego konta społecznościowego. Aby zapewnić bezproblemową integrację i dostęp do wszystkich funkcji Logto, zalecamy przejście do konfiguracji własnego konektora społecznościowego.',
  },
  tenant: {
    create_tenant: 'Stwórz najemcę',
  },
};

export default Object.freeze(cloud);
