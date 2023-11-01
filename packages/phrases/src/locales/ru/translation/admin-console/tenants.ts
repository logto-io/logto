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
    description: 'Установите имя арендатора и просмотрите регион размещения данных и метку среды.',
    tenant_id: 'ID арендатора',
    tenant_name: 'Имя арендатора',
    /** UNTRANSLATED */
    tenant_region: 'Data hosted region',
    /** UNTRANSLATED */
    tenant_region_tip: 'Your tenant resources are hosted in {{region}}. <a>Learn more</a>',
    environment_tag: 'Тег окружения',
    environment_tag_description:
      'Теги не изменяют сервис. Они просто помогают отличать различные среды.',
    environment_tag_development: 'Разр',
    environment_tag_staging: 'Предпр',
    environment_tag_production: 'Прод',
    /** UNTRANSLATED */
    development_description:
      'Development environment is mainly used for testing and include all pro features but have watermarks in the sign in experience. <a>Learn more</a>',
    tenant_info_saved: 'Информация о квартиросъемщике успешно сохранена.',
  },
  full_env_tag: {
    /** UNTRANSLATED */
    development: 'Development',
    /** UNTRANSLATED */
    production: 'Production',
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
    /** UNTRANSLATED */
    subtitle_with_region:
      'Create a new tenant to separate resources and users. Region and environment tags can’t be modified after creation.',
    /** UNTRANSLATED */
    tenant_usage_purpose: 'What do you want to use this tenant for?',
    /** UNTRANSLATED */
    development_description:
      'Development environment is mainly used for testing and should not use in production environment.',
    /** UNTRANSLATED */
    development_hint:
      'Development environment is mainly used for testing and should not use in production environment.',
    /** UNTRANSLATED */
    production_description:
      'Production is where live software is used by end-users and may require a paid subscription.',
    /** UNTRANSLATED */
    available_plan: 'Available plan:',
    create_button: 'Создать арендатора',
    tenant_name_placeholder: 'Мой арендатор',
  },
  notification: {
    /** UNTRANSLATED */
    allow_pro_features_title:
      'You can now access <span>all features of Logto Pro</span> in your development tenant!',
    /** UNTRANSLATED */
    allow_pro_features_description: "It's completely free, with no trial period – forever!",
    /** UNTRANSLATED */
    explore_all_features: 'Explore all features',
    /** UNTRANSLATED */
    impact_title: 'Does this have any impact on me?',
    /** UNTRANSLATED */
    staging_env_hint:
      'Your tenant label has been updated from "Staging" to "Production," but this change will not impact your current setup.',
    /** UNTRANSLATED */
    paid_tenant_hint_1:
      'As you subscribe to the Logto Hobby plan, your previous "dev" tenant tag will switch to "prod", and this won\'t affect your existing setup.',
    /** UNTRANSLATED */
    paid_tenant_hint_2:
      "If you're still in the development stage, you can create a new development tenant to access more pro features.",
    /** UNTRANSLATED */
    paid_tenant_hint_3:
      "If you're in the production stage, or a production environment, you still need to subscribe to a specific plan so there's nothing you need to do at this moment.",
    /** UNTRANSLATED */
    paid_tenant_hint_4:
      "Don't hesitate to reach out if you require help! Thank you for choosing Logto!",
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
    cannot_delete_title: 'Нельзя удалить этого арендатора',
    cannot_delete_description:
      'Извините, вы не можете удалить этого арендатора прямо сейчас. Пожалуйста, убедитесь, что вы используете бесплатный план и оплатили все невыполненные счета.',
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
    cookie_keys_in_use: 'Cookie keys in use',
    /** UNTRANSLATED */
    rotate_private_keys: 'Rotate private keys',
    /** UNTRANSLATED */
    rotate_cookie_keys: 'Rotate cookie keys',
    /** UNTRANSLATED */
    rotate_private_keys_description:
      'This action will create a new private signing key, rotate the current key, and remove your previous key. Your JWT tokens signed with the current key will remain valid until deletion or another round of rotation.',
    /** UNTRANSLATED */
    rotate_cookie_keys_description:
      'This action will create a new cookie key, rotate the current key, and remove your previous key. Your cookies with the current key will remain valid until deletion or another round of rotation.',
    /** UNTRANSLATED */
    select_private_key_algorithm: 'Select signing key algorithm for the new private key',
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
      rotate_private_key:
        'Are you sure you want to rotate the <strong>OIDC private keys</strong>? New issued JWT tokens will be signed by the new key. Existing JWT tokens stay valid until you rotate again.',
      /** UNTRANSLATED */
      rotate_cookie_key:
        'Are you sure you want to rotate the <strong>OIDC cookie keys</strong>? New cookies generated in sign-in sessions will be signed by the new cookie key. Existing cookies stay valid until you rotate again.',
      /** UNTRANSLATED */
      delete_private_key:
        'Are you sure you want to delete the <strong>OIDC private key</strong>? Existing JWT tokens signed with this private signing key will no longer be valid.',
      /** UNTRANSLATED */
      delete_cookie_key:
        'Are you sure you want to delete the <strong>OIDC cookie key</strong>? Older sign-in sessions with cookies signed with this cookie key will no longer be valid. A re-authentication is required for these users.',
    },
    messages: {
      /** UNTRANSLATED */
      rotate_key_success: 'Signing keys rotated successfully.',
      /** UNTRANSLATED */
      delete_key_success: 'Key deleted successfully.',
    },
  },
};

export default Object.freeze(tenants);
