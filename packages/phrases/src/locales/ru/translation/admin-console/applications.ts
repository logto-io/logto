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
  guide: {
    header_title: 'Выбрать фреймворк или учебник',
    modal_header_title: 'Начать с SDK и руководств',
    header_subtitle:
      'Ускорьте процесс разработки приложений с нашими заранее подготовленными SDK и учебниками.',
    start_building: 'Начать разработку',
    categories: {
      featured: 'Популярные и для вас',
      Traditional: 'Традиционное веб-приложение',
      SPA: 'Одностраничное приложение',
      Native: 'Нативное',
      MachineToMachine: 'Machine-to-machine',
    },
    filter: {
      title: 'Фильтр фреймворков',
      placeholder: 'Поиск фреймворка',
    },
    select_a_framework: 'Выбрать фреймворк',
    checkout_tutorial: 'Посмотреть учебник {{name}}',
    get_sample_file: 'Получить образец',
    title: 'Приложение успешно создано',
    subtitle:
      'Теперь следуйте инструкциям ниже, чтобы завершить настройку приложения. Выберите тип SDK, чтобы продолжить.',
    description_by_sdk:
      'Это быстрое руководство демонстрирует, как интегрировать Logto в приложение {{sdk}}',
    do_not_need_tutorial:
      'Если вам не нужен учебник, вы можете продолжить без руководства по фреймворку',
    create_without_framework: 'Создать приложение без фреймворка',
    finish_and_done: 'Завершить и готово',
    cannot_find_guide: 'Не можете найти нужное вам руководство?',
    describe_guide_looking_for: 'Опишите руководство, которое вы ищете',
    describe_guide_looking_for_placeholder:
      'Например, я хочу интегрировать Logto в мое приложение Angular',
    request_guide_successfully: 'Ваш запрос был успешно отправлен. Спасибо!',
  },
  placeholder_title: 'Выберите тип приложения, чтобы продолжить',
  placeholder_description:
    'Logto использует сущность приложения для OIDC для выполнения задач, таких как идентификация ваших приложений, управление входом в систему и создание журналов аудита.',
};

export default Object.freeze(applications);
