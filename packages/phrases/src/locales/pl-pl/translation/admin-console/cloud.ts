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
    /** UNTRANSLATED */
    stage_field: 'What stage is your product currently in?',
    stage_options: {
      /** UNTRANSLATED */
      new_product: 'Start a new project and looking for a quick, out-of-the-box solution',
      /** UNTRANSLATED */
      existing_product:
        'Migrate from current authentication (e.g., self-built, Auth0, Cognito, Microsoft)',
      /** UNTRANSLATED */
      target_enterprise_ready:
        'I just landed bigger clients and now make my product ready to sell to enterprises',
    },
    /** UNTRANSLATED */
    additional_features_field: 'Do you have anything else you want us to know?',
    additional_features_options: {
      /** UNTRANSLATED */
      customize_ui_and_flow:
        'Need the ability to bring my own UI, or customize my own flows via Logto API',
      /** UNTRANSLATED */
      compliance: 'SOC2 and GDPR are must-haves',
      /** UNTRANSLATED */
      export_user_data: 'Need the ability to export user data from Logto',
      /** UNTRANSLATED */
      budget_control: 'I have very tight budget control',
      /** UNTRANSLATED */
      bring_own_auth: 'Have my own auth services and just need some Logto features',
      /** UNTRANSLATED */
      others: 'None of these above',
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
