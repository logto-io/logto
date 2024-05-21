const api_resource_details = {
  page_title: 'Детали ресурса API',
  back_to_api_resources: 'Вернуться к Ресурсам API',
  general_tab: 'Общее',
  permissions_tab: 'Разрешения',
  settings: 'Настройки',
  settings_description:
    'Ресурсы API, также известные как индикаторы ресурсов, указывают целевые службы или ресурсы, запрашиваемые обычно в виде переменной формата URI, представляющей идентификатор ресурса.',
  management_api_settings_description:
    'Logto Management API - это комплексный набор API, который дает администраторам возможность управлять широким спектром задач, связанных с идентификацией, обеспечивать политику безопасности и соблюдать требования и стандарты.',
  management_api_notice:
    'Этот API представляет сущность Logto и не может быть изменен или удален. Вы можете использовать управляющий API для широкого спектра задач, связанных с идентификацией. <a>Узнать больше</a>',
  token_expiration_time_in_seconds: 'Время истечения токена (в секундах)',
  token_expiration_time_in_seconds_placeholder: 'Введите время истечения вашего токена',
  delete_description:
    'Это действие нельзя отменить. Оно навсегда удалит ресурс API. Пожалуйста, введите имя ресурса API <span> {{имя}} </span>, чтобы подтвердить.',
  enter_your_api_resource_name: 'Введите название своего ресурса API',
  api_resource_deleted: 'Ресурс API {{name}} был успешно удален',
  permission: {
    create_button: 'Создать разрешение',
    create_title: 'Создать разрешение',
    create_subtitle: 'Определите необходимые разрешения (области) для этого API.',
    confirm_create: 'Создать разрешение',
    edit_title: 'Изменить разрешение API',
    edit_subtitle: 'Определите необходимые разрешения (области) для API {{resourceName}}.',
    name: 'Название разрешения',
    name_placeholder: 'read:resource',
    forbidden_space_in_name: 'Название разрешения не должно содержать пробелов.',
    description: 'Описание',
    description_placeholder: 'Можно читать ресурсы',
    permission_created: 'Разрешение {{название}} создано успешно',
    delete_description:
      'Если это разрешение будет удалено, пользователь, у которого оно было, потеряет доступ, предоставленный им.',
    deleted: 'Разрешение "{{название}}" успешно удалено.',
  },
};

export default Object.freeze(api_resource_details);
