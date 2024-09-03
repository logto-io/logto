const applications = {
  page_title: 'Заявки',
  title: 'Заявки',
  subtitle:
    'Настроить аутентификацию Logto для вашего нативного, одностраничного, машина-машина или традиционного приложения.',
  subtitle_with_app_type: 'Настроить аутентификацию Logto для вашего приложения {{name}}',
  create: 'Создать заявку',
  create_subtitle_third_party:
    'Используйте Logto в качестве поставщика идентификации (IdP) для простой интеграции с приложениями сторонних разработчиков',
  application_name: 'Название приложения',
  application_name_placeholder: 'Мое приложение',
  application_description: 'Описание приложения',
  application_description_placeholder: 'Введите описание вашего приложения',
  select_application_type: 'Выбрать тип приложения',
  no_application_type_selected: 'Вы еще не выбрали тип приложения',
  application_created: 'Приложение успешно создано.',
  tab: {
    my_applications: 'Мои приложения',
    third_party_applications: 'Приложения сторонних разработчиков',
  },
  app_id: 'Идентификатор приложения',
  type: {
    native: {
      title: 'Нативное приложение',
      subtitle: 'Приложение, работающее в нативной среде',
      description: 'Например, приложение для iOS, приложение для Android',
    },
    spa: {
      title: 'Одностраничное приложение',
      subtitle: 'Приложение, работающее в веб-браузере и динамически обновляющее данные на месте',
      description: 'Например, приложение React DOM, приложение Vue',
    },
    traditional: {
      title: 'Традиционное веб-приложение',
      subtitle: 'Приложение, которое отображает и обновляет страницы только через веб-сервер',
      description: 'Например, Next.js, PHP',
    },
    machine_to_machine: {
      title: 'Машина-машина',
      subtitle: 'Приложение (обычно сервис), которое напрямую общается с ресурсами',
      description: 'Например, бэкэнд-сервис',
    },
    protected: {
      title: 'Защищенное приложение',
      subtitle: 'Приложение, защищенное Logto',
      description: 'N/А',
    },
    third_party: {
      title: 'Приложение сторонних разработчиков',
      subtitle:
        'Приложение, используемое в качестве коннектора стороннего поставщика идентификации',
      description: 'Например, OIDC, SAML',
    },
  },
  placeholder_title: 'Выберите тип приложения, чтобы продолжить',
  placeholder_description:
    'Logto использует сущность приложения для OIDC для выполнения задач, таких как идентификация ваших приложений, управление входом в систему и создание журналов аудита.',
};

export default Object.freeze(applications);
