const content = {
  terms_of_use: {
    title: 'TERMS',
    description: 'Добавьте условия и политику конфиденциальности для соблюдения требований.',
    terms_of_use: 'URL условий использования',
    terms_of_use_placeholder: 'https://your.terms.of.use/',
    privacy_policy: 'URL политики конфиденциальности',
    privacy_policy_placeholder: 'https://your.privacy.policy/',
    agree_to_terms: 'Согласиться с условиями',
    agree_policies: {
      automatic: 'Продолжить автоматически соглашаться с условиями',
      manual_registration_only: 'Требовать согласия через галочку только при регистрации',
      manual: 'Требовать согласия через галочку при регистрации и входе в систему',
    },
  },
  languages: {
    title: 'ЯЗЫКИ',
    enable_auto_detect: 'Включить автоопределение',
    description:
      'Ваша платформа определяет языковые настройки пользователя и переключается на локальный язык. Вы можете добавить новые языки, переведя интерфейс с английского на другой язык.',
    manage_language: 'Управление языком',
    default_language: 'Язык по умолчанию',
    default_language_description_auto:
      'Язык по умолчанию используется, если обнаруженный язык пользователя отсутствует в текущей библиотеке.',
    default_language_description_fixed:
      'При отключенном автоопределении ваш продукт показывает только язык по умолчанию. Включите автоопределение, чтобы расширить набор языков.',
  },
  support: {
    title: 'ПОДДЕРЖКА',
    subtitle:
      'Отображайте ваши каналы поддержки на страницах ошибок для быстрой помощи пользователям.',
    support_email: 'Электронная почта поддержки',
    support_email_placeholder: 'support@email.com',
    support_website: 'Сайт поддержки',
    support_website_placeholder: 'https://your.website/support',
  },
  manage_language: {
    title: 'Управление языком',
    subtitle:
      'Локализуйте продукт, добавляя языки и переводы. Ваш вклад можно назначить языком по умолчанию.',
    add_language: 'Добавить язык',
    logto_provided: 'Предоставлено Logto',
    key: 'Ключ',
    logto_source_values: 'Исходные значения Logto',
    custom_values: 'Пользовательские значения',
    clear_all_tip: 'Очистить все значения',
    unsaved_description: 'Изменения не сохранятся, если вы покинете страницу без сохранения.',
    deletion_tip: 'Удалить язык',
    deletion_title: 'Удалить добавленный язык?',
    deletion_description: 'После удаления пользователи больше не смогут использовать этот язык.',
    default_language_deletion_title: 'Язык по умолчанию нельзя удалить.',
    default_language_deletion_description:
      '{{language}} установлен как язык по умолчанию и не может быть удален.',
  },
};

export default Object.freeze(content);
