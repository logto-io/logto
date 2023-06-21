const tenant_settings = {
  title: 'Настройки',
  description: 'Эффективное управление настройками арендатора и настройка вашего домена.',
  tabs: {
    settings: 'Настройки',
    domains: 'Домены',
  },
  settings: {
    title: 'НАСТРОЙКИ',
    tenant_id: 'ID арендатора',
    tenant_name: 'Имя арендатора',
    environment_tag: 'Тег окружения',
    environment_tag_description:
      'Теги не изменяют сервис. Они просто помогают отличать различные среды.',
    environment_tag_development: 'Разр',
    environment_tag_staging: 'Предпр',
    environment_tag_production: 'Прод',
    tenant_info_saved: 'Информация о квартиросъемщике успешно сохранена.',
  },
  deletion_card: {
    title: 'УДАЛИТЬ',
    tenant_deletion: 'Удаление арендатора',
    tenant_deletion_description:
      'Удаление арендатора приведет к окончательному удалению всех связанных пользовательских данных и настроек. Пожалуйста, действуйте осторожно.',
    tenant_deletion_button: 'Удалить арендатора',
  },
};

export default tenant_settings;
