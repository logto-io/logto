const custom_profile_fields = {
  table: {
    add_button: 'Добавить поле профиля',
    title: {
      field_label: 'Название поля',
      type: 'Тип',
      user_data_key: 'Ключ в профиле пользователя',
    },
    placeholder: {
      title: 'Сбор данных профиля',
      description:
        'Настройте поля для сбора дополнительной информации о пользователе при регистрации.',
    },
  },
  type: {
    Text: 'Текст',
    Number: 'Число',
    Date: 'Дата',
    Checkbox: 'Флажок (Логическое значение)',
    Select: 'Выпадающий список (Одиночный выбор)',
    Url: 'URL',
    Regex: 'Регулярное выражение',
    Address: 'Адрес (Составной)',
    Fullname: 'Полное имя (Составное)',
  },
  modal: {
    title: 'Добавить поле профиля',
    subtitle: 'Настройте поля для сбора дополнительной информации о пользователе при регистрации.',
    built_in_properties: 'Встроенные свойства профиля пользователя',
    custom_properties: 'Пользовательские свойства',
    custom_data_field_name: 'Имя пользовательского поля данных',
    custom_data_field_input_placeholder:
      'Введите имя пользовательского поля данных, например, `myFavoriteFieldName`',
    custom_field: {
      title: 'Пользовательское поле данных',
      description:
        'Любые дополнительные свойства пользователя, которые вы можете определить для удовлетворения уникальных требований вашего приложения.',
    },
    type_required: 'Пожалуйста, выберите тип свойства',
    create_button: 'Создать поле профиля',
  },
  details: {
    page_title: 'Детали поля профиля',
    back_to_sie: 'Вернуться к процессу входа',
    enter_field_name: 'Введите название поля профиля',
    delete_description:
      'Это действие нельзя отменить. Вы уверены, что хотите удалить это поле профиля?',
    field_deleted: 'Поле профиля {{name}} успешно удалено.',
    key: 'Ключ данных пользователя',
    field_name: 'Название поля',
    field_type: 'Тип поля',
    settings: 'Настройки',
    settings_description:
      'Настройте поля для сбора дополнительной информации о пользователе при регистрации.',
    address_format: 'Формат адреса',
    single_line_address: 'Адрес в одну строку',
    multi_line_address: 'Адрес в несколько строк (например, Улица, Город, Область, Индекс, Страна)',
    components: 'Компоненты',
    components_tip: 'Выберите компоненты для составления сложного поля.',
    label: 'Отображаемая метка',
    label_placeholder: 'Метка',
    label_tip: 'Нужна локализация? Добавьте языки в <a>Процесс входа > Контент</a>',
    placeholder: 'Отображаемый заполнитель',
    placeholder_placeholder: 'Заполнитель',
    description: 'Отображаемое описание',
    description_placeholder: 'Описание',
    options: 'Опции',
    options_tip:
      'Введите каждую опцию с новой строки. Используйте точку с запятой для разделения ключа и значения, например, `key:value`',
    options_placeholder: 'value1:label1\nvalue2:label2\nvalue3:label3',
    regex: 'Регулярное выражение',
    regex_tip: 'Определите регулярное выражение для проверки ввода.',
    regex_placeholder: '^[a-zA-Z0-9]+$',
    date_format: 'Формат даты',
    date_format_us: 'MM/dd/yyyy (например, США)',
    date_format_uk: 'dd/MM/yyyy (например, Великобритания и Европа)',
    date_format_iso: 'yyyy-MM-dd (Международный стандарт)',
    custom_date_format: 'Пользовательский формат даты',
    custom_date_format_placeholder: 'Введите пользовательский формат даты. Например, "MM-dd-yyyy"',
    custom_date_format_tip:
      'См. документацию <a>date-fns</a> для допустимых токенов форматирования.',
    input_length: 'Длина ввода',
    value_range: 'Диапазон значений',
    min: 'Минимум',
    max: 'Максимум',
    required: 'Обязательно',
    required_description:
      'Если включено, это поле должно быть заполнено пользователем. Если отключено, это поле необязательно.',
  },
};

export default Object.freeze(custom_profile_fields);
