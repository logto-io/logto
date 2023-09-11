const applications = {
  page_title: 'Заявки',
  title: 'Заявки',
  subtitle:
    'Настроить аутентификацию Logto для вашего нативного, одностраничного, машина-машина или традиционного приложения.',
  subtitle_with_app_type: 'Настроить аутентификацию Logto для вашего приложения {{name}}',
  create: 'Создать заявку',
  application_name: 'Название приложения',
  application_name_placeholder: 'Мое приложение',
  application_description: 'Описание приложения',
  application_description_placeholder: 'Введите описание вашего приложения',
  select_application_type: 'Выбрать тип приложения',
  no_application_type_selected: 'Вы еще не выбрали тип приложения',
  application_created: 'Приложение успешно создано.',
  app_id: 'App ID',
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
      title: 'Традиционный веб',
      subtitle: 'Приложение, которое отображает и обновляет страницы только веб-сервером',
      description: 'Например, Next.js, PHP',
    },
    machine_to_machine: {
      title: 'Machine-to-Machine',
      subtitle: 'Приложение (обычно сервис), которое напрямую общается с ресурсами',
      description: 'Например, backend-сервис',
    },
  },
  placeholder_title: 'Выберите тип приложения, чтобы продолжить',
  placeholder_description:
    'Logto использует сущность приложения для OIDC для выполнения задач, таких как идентификация ваших приложений, управление входом в систему и создание журналов аудита.',
};

export default Object.freeze(applications);
