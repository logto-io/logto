const cloud = {
  general: {
    onboarding: 'Вводный курс',
  },
  welcome: {
    page_title: 'Добро пожаловать',
    title: 'Добро пожаловать в облако Logto! Мы хотели бы узнать вас получше.',
    description:
      'Сделайте свой опыт работы с Logto уникальным для вас, узнав вас получше. Ваша информация надежно защищена.',
    project_field: 'Я использую Logto для',
    project_options: {
      personal: 'Личного проекта',
      company: 'Компании',
    },
    company_name_field: 'Название компании',
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
    page_title: 'Настройка опыта входа',
    title: 'Давайте сначала легко настроим ваш опыт входа',
    inspire: {
      title: 'Создайте убедительные примеры',
      description:
        'Чувствуете неуверенность в опыте входа? Просто нажмите «Вдохновить меня» и позвольте волшебству совершиться!',
      inspire_me: 'Вдохнови меня',
    },
    logo_field: 'Логотип приложения',
    color_field: 'Цвет бренда',
    identifier_field: 'Идентификатор',
    identifier_options: {
      email: 'Электронная почта',
      phone: 'Номер телефона',
      user_name: 'Имя пользователя',
    },
    authn_field: 'Аутентификация',
    authn_options: {
      password: 'Пароль',
      verification_code: 'Код подтверждения',
    },
    social_field: 'Вход через социальную сеть',
    finish_and_done: 'Готово',
    preview: {
      mobile_tab: 'Мобильный',
      web_tab: 'Веб',
    },
    connectors: {
      unlocked_later: 'Разблокируется позже',
      unlocked_later_tip:
        'После того, как вы завершите процесс ввода в эксплуатацию и войдете в продукт, вы получите доступ к еще большему количеству методов входа через социальные сети.',
      notice:
        'Пожалуйста, не используйте демонстрационный коннектор для производственных целей. После тестирования удалите демонстрационный коннектор и настройте свой собственный коннектор с вашими учетными данными.',
    },
  },
  socialCallback: {
    title: 'Вход выполнен успешно',
    description:
      'Вы успешно вошли, используя свою учетную запись в социальной сети. Чтобы обеспечить безпроблемную интеграцию и доступ ко всем функциям Logto, рекомендуем настроить свой собственный социальный коннектор.',
  },
  tenant: {
    create_tenant: 'Создать арендатора',
  },
};

export default Object.freeze(cloud);
