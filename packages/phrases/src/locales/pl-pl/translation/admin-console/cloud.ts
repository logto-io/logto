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
    company_name_field: 'Nazwa firmy',
    company_name_placeholder: 'Acme.co',
    stage_field: 'W jakim etapie jest Twój produkt aktualnie?',
    stage_options: {
      new_product: 'Rozpocznij nowy projekt i szukasz szybkiego, gotowego rozwiązania',
      existing_product:
        'Migracja z bieżącej autoryzacji (np. własna autoryzacja, Auth0, Cognito, Microsoft)',
      target_enterprise_ready:
        'Właśnie pozyskałem większych klientów i teraz przygotowuję mój produkt do sprzedaży dla przedsiębiorstw',
    },
    additional_features_field: 'Czy masz coś jeszcze, o czym chcesz, żebyśmy wiedzieli?',
    additional_features_options: {
      customize_ui_and_flow:
        'Zbuduj i zarządzaj własnym interfejsem użytkownika, nie tylko korzystaj z gotowego i dostosowywalnego rozwiązania Logto',
      compliance: 'SOC2 i GDPR są konieczne',
      export_user_data: 'Potrzebuję możliwości eksportu danych użytkownika z Logto',
      budget_control: 'Mam bardzo ściśłą kontrolę budżetu',
      bring_own_auth:
        'Mam swoje własne usługi autoryzacji i potrzebuję tylko niektórych funkcji Logto',
      others: 'Nic z powyższych',
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
        'Po ukończeniu procesu wprowadzenia do użytku i wejściu do produktu będziesz mieć dostęp do jeszcze większej liczby metod logowania społecznościowego',
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
