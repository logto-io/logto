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
  tenant_created: "Арендатор '{{name}}' успешно создан.",
};

export default tenants;
