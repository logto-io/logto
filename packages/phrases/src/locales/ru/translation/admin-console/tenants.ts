const tenants = {
  create_modal: {
    title: 'Создать арендатора',
    subtitle: 'Создайте нового арендатора для разделения ресурсов и пользователей.',
    create_button: 'Создать арендатора',
    tenant_name: 'Имя арендатора',
    tenant_name_placeholder: 'Мой арендатор',
    environment_tag: 'Тег окружения',
    environment_tag_description:
      'Используйте теги для отделения сред сред использования арендаторов. Сервисы в каждом теге идентичны, обеспечивая согласованность.',
    environment_tag_development: 'Разработка',
    environment_tag_staging: 'Стадия',
    environment_tag_production: 'Производство',
  },
  delete_modal: {
    title: 'Удалить арендатора',
    description_line1:
      'Вы уверены, что хотите удалить своего арендатора "<span>{{name}}</span>" с меткой суффикса окружения "<span>{{tag}}</span>"? Это действие нельзя отменить, и приведет к безвозвратному удалению всех ваших данных и информации об учетной записи.',
    description_line2:
      'Перед удалением учетной записи мы можем вам помочь. <span><a>Свяжитесь с нами по электронной почте</a></span>',
    description_line3:
      'Если вы хотите продолжить, введите название арендатора "<span>{{name}}</span>" для подтверждения.',
    delete_button: 'Навсегда удалить',
  },
  tenant_created: "Арендатор '{{name}}' успешно создан.",
};

export default tenants;
