const tenants = {
  title: 'Настройки',
  description: 'Эффективное управление настройками арендатора и настройка вашего домена.',
  tabs: {
    settings: 'Настройки',
    domains: 'Домены',
    subscription: 'План и выставление счетов',
    billing_history: 'История выставления счетов',
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
  create_modal: {
    title: 'Создать арендатора',
    subtitle: 'Создайте нового арендатора для разделения ресурсов и пользователей.',
    create_button: 'Создать арендатора',
    tenant_name_placeholder: 'Мой арендатор',
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
  tenant_landing_page: {
    title: 'Вы еще не создали арендатора',
    description:
      'Чтобы начать настройку вашего проекта с помощью Logto, создайте нового арендатора. Если вам нужно выйти из системы или удалить свою учетную запись, просто нажмите на кнопку аватара в правом верхнем углу.',
    create_tenant_button: 'Создать арендатора',
  },
  status: {
    mau_exceeded: 'Превышение MAU',
    suspended: 'Приостановлен',
    overdue: 'Прошлый срок',
  },
  tenant_suspended_page: {
    title: 'Приостановленный арендатор. Свяжитесь с нами, чтобы восстановить доступ.',
    description_1:
      'Очень сожалеем, но ваша учетная запись арендатора временно заблокирована из-за неправильного использования, включая превышение MAU-лимитов, просроченные платежи или другие неавторизованные действия.',
    description_2:
      'Если вам нужна дополнительная информация или у вас возникли какие-либо вопросы или вы хотите восстановить полную функциональность и разблокировать своих арендаторов, не стесняйтесь немедленно связаться с нами.',
  },
  signing_keys: {
    /** UNTRANSLATED */
    title: 'SIGNING KEYS',
    /** UNTRANSLATED */
    description: 'Securely manage signing keys in your tenant.',
    type: {
      /** UNTRANSLATED */
      private_key: 'OIDC private keys',
      /** UNTRANSLATED */
      cookie_key: 'OIDC cookie keys',
    },
    /** UNTRANSLATED */
    private_keys_in_use: 'Private keys in use',
    /** UNTRANSLATED */
    rotate_private_keys: 'Rotate private keys',
    /** UNTRANSLATED */
    rotate_private_keys_description:
      'This will rotate the currently used private keys. Your {{entities}} with previous private keys will stay valid until you delete it.',
    /** UNTRANSLATED */
    select_private_key_algorithm: 'Select signing key algorithm for private keys',
    /** UNTRANSLATED */
    rotate_button: 'Rotate',
    table_column: {
      /** UNTRANSLATED */
      id: 'ID',
      /** UNTRANSLATED */
      status: 'Status',
      /** UNTRANSLATED */
      algorithm: 'Signing key algorithm',
    },
    status: {
      /** UNTRANSLATED */
      current: 'Current',
      /** UNTRANSLATED */
      previous: 'Previous',
    },
    reminder: {
      /** UNTRANSLATED */
      rotate:
        'Are you sure you want to rotate the <strong>{{key}}</strong>? This will require all your apps and APIs to use the new signing key. Existing {{entities}} stay valid until you rotate again.',
      /** UNTRANSLATED */
      delete:
        'Are you sure you want to delete the <strong>{{key}}</strong>? Existing {{entities}} signed with this signing key will no longer be valid.',
    },
    signed_entity: {
      /** UNTRANSLATED */
      tokens: 'JWT tokens',
      /** UNTRANSLATED */
      cookies: 'cookies',
    },
  },
};

export default Object.freeze(tenants);
