import content from './content.js';
import custom_profile_fields from './custom-profile-fields.js';
import sign_up_and_sign_in from './sign-up-and-sign-in.js';

const sign_in_exp = {
  page_title: 'Опыт входа в систему',
  page_title_with_account: 'Вход и аккаунт',
  title: 'Вход и аккаунт',
  description:
    'Настройте потоки аутентификации и пользовательский интерфейс, и просматривайте готовый опыт в реальном времени.',
  tabs: {
    branding: 'Брендирование',
    sign_up_and_sign_in: 'Регистрация и вход в систему',
    collect_user_profile: 'Сбор профиля пользователя',
    account_center: 'Центр аккаунта',
    content: 'Содержание',
    password_policy: 'Политика пароля',
  },
  welcome: {
    title: 'Настройка входа в систему',
    description:
      'Начните быстро с настройки первого входа в систему. Это руководство поможет вам пройти все необходимые настройки.',
    get_started: 'Начать',
    apply_remind:
      'Обратите внимание, что опыт входа в систему будет применяться для всех приложений в этой учетной записи.',
  },
  color: {
    title: 'ЦВЕТ',
    primary_color: 'Цвет бренда',
    dark_primary_color: 'Цвет бренда (темный)',
    dark_mode: 'Включить темный режим',
    dark_mode_description:
      'Ваше приложение будет иметь автоматически созданную темную тему на основе цвета вашего бренда и алгоритма Logto. Вы можете настроить ее по своему вкусу.',
    dark_mode_reset_tip: 'Пересчитать цвет темного режима на основе цвета бренда.',
    reset: 'Пересчитать',
  },
  branding: {
    title: 'ЗОНА БРЕНДИНГА',
    ui_style: 'Стиль',
    with_light: '{{value}}',
    with_dark: '{{value}} (dark)',
    app_logo_and_favicon: 'Логотип приложения и иконка',
    company_logo_and_favicon: 'Логотип компании и иконка',
    organization_logo_and_favicon: 'Логотип организации и иконка',
  },
  branding_uploads: {
    app_logo: {
      title: 'Логотип приложения',
      url: 'URL логотипа приложения',
      url_placeholder: 'https://your.cdn.domain/logo.png',
      error: 'Логотип приложения: {{error}}',
    },
    company_logo: {
      title: 'Логотип компании',
      url: 'URL логотипа компании',
      url_placeholder: 'https://your.cdn.domain/logo.png',
      error: 'Логотип компании: {{error}}',
    },
    organization_logo: {
      title: 'Загрузить изображение',
      url: 'URL логотипа организации',
      url_placeholder: 'https://your.cdn.domain/logo.png',
      error: 'Логотип организации: {{error}}',
    },
    connector_logo: {
      title: 'Загрузить изображение',
      url: 'URL логотипа соединителя',
      url_placeholder: 'https://your.cdn.domain/logo.png',
      error: 'Логотип соединителя: {{error}}',
    },
    favicon: {
      title: 'Иконка',
      url: 'URL иконки',
      url_placeholder: 'https://your.cdn.domain/favicon.ico',
      error: 'Иконка: {{error}}',
    },
  },
  custom_ui: {
    title: 'Пользовательский интерфейс',
    css_code_editor_title: 'Пользовательский CSS',
    css_code_editor_description1: 'См. пример пользовательского CSS.',
    css_code_editor_description2: '<a>{{link}}</a>',
    css_code_editor_description_link_content: 'Узнать больше',
    css_code_editor_content_placeholder:
      'Введите пользовательский CSS, чтобы настроить стиль любого элемента в соответствии с вашими точными требованиями. Проявите свою креативность и выделите ваш интерфейс.',
    bring_your_ui_title: 'Создайте свой интерфейс',
    bring_your_ui_description:
      'Загрузите сжатый пакет (.zip), чтобы заменить предустановленный интерфейс Logto вашим собственным кодом. <a>Узнать больше</a>',
    preview_with_bring_your_ui_description:
      'Ваши пользовательские ресурсы интерфейса успешно загружены и теперь доступны. Встроенное окно предварительного просмотра отключено.\nДля тестирования персонализированного интерфейса входа нажмите кнопку "Прямая трансляция" для открытия в новой вкладке браузера.',
  },
  account_center: {
    title: 'Центр аккаунта',
    description: 'Настраивайте процессы центра аккаунта с помощью API Logto.',
    enable_account_api: 'Включить Account API',
    enable_account_api_description:
      'Включите Account API, чтобы создать собственный центр аккаунта и дать пользователям прямой доступ к API без использования Logto Management API.',
    field_options: {
      off: 'Off',
      edit: 'Edit',
      read_only: 'Read only',
      enabled: 'Включено',
      disabled: 'Отключено',
    },
    sections: {
      account_security: {
        title: 'ACCOUNT SECURITY',
        description:
          'Manage access to the Account API, enabling users to view or edit their identity information and authentication factors after signing into the application. Users must verify their identity to get a valid 10-minute verification record ID before making these security-related changes.',
        groups: {
          identifiers: {
            title: 'Identifiers',
          },
          authentication_factors: {
            title: 'Authentication factors',
          },
        },
      },
      user_profile: {
        title: 'USER PROFILE',
        description:
          'Manage access to the Account API, enabling users to view or edit basic or custom profile data after signing into the application.',
        groups: {
          profile_data: {
            title: 'Profile data',
          },
        },
      },
      secret_vault: {
        title: 'СЕКРЕТНОЕ ХРАНИЛИЩЕ',
        description:
          'Для социальных и корпоративных коннекторов, безопасное хранение токенов доступа третьих сторон для вызова их API (например, добавление событий в Google Календарь).',
        third_party_token_storage: {
          title: 'Токен третьей стороны',
          third_party_access_token_retrieval: 'Токен третьей стороны',
          third_party_token_tooltip:
            'Чтобы хранить токены, вы можете включить это в настройках соответствующего социального или корпоративного коннектора.',
          third_party_token_description:
            'После включения Account API автоматически активируется получение токенов третьих сторон.',
        },
      },
    },
    fields: {
      email: 'Email address',
      phone: 'Phone number',
      social: 'Social identities',
      password: 'Password',
      mfa: 'Multi-factor authentication',
      mfa_description: 'Let users manage their MFA methods from the account center.',
      username: 'Username',
      name: 'Name',
      avatar: 'Avatar',
      profile: 'Profile',
      profile_description: 'Control access to structured profile attributes.',
      custom_data: 'Custom data',
      custom_data_description: 'Control access to custom JSON data stored on the user.',
    },
    webauthn_related_origins: 'Связанные источники WebAuthn',
    webauthn_related_origins_description:
      'Добавьте домены ваших фронтенд-приложений, которым разрешено регистрировать ключи доступа через API учетной записи.',
    webauthn_related_origins_error: 'Источник должен начинаться с https:// или http://',
  },
  sign_up_and_sign_in,
  content,
  setup_warning: {
    no_connector_sms:
      'Еще не настроен коннектор SMS. Пока не завершено настройка, пользователи не смогут войти с помощью этого метода. <a>{{link}}</a> в «Коннекторах»',
    no_connector_email:
      'Еще не настроен коннектор по электронной почте. Пока не завершено настройка, пользователи не смогут войти с помощью этого метода. <a>{{link}}</a> в «Коннекторах»',
    no_connector_social:
      'Вы еще не настроили социальный коннектор. Сначала добавьте коннекторы, чтобы применить методы социальной авторизации. <a>{{link}}</a> в разделе "Коннекторы".',
    no_connector_email_account_center:
      'Коннектор электронной почты еще не настроен. Настройте в <a>«Коннекторы электронной почты и SMS»</a>.',
    no_connector_sms_account_center:
      'Коннектор SMS еще не настроен. Настройте в <a>«Коннекторы электронной почты и SMS»</a>.',
    no_connector_social_account_center:
      'Социальный коннектор еще не настроен. Настройте в <a>«Социальные коннекторы»</a>.',
    no_mfa_factor: 'Еще не настроен фактор MFA. <a>{{link}}</a> в «Многофакторная аутентификация».',
    setup_link: 'Настройка',
  },
  save_alert: {
    description:
      'Вы внедряете новые процедуры входа и регистрации. Все ваши пользователи могут быть затронуты новой настройкой. Вы точно хотите внести изменения?',
    before: 'До',
    after: 'После',
    sign_up: 'Регистрация',
    sign_in: 'Вход',
    social: 'Социальный',
    forgot_password_migration_notice:
      'Мы обновили проверку забытого пароля для поддержки пользовательских методов. Ранее это автоматически определялось вашими коннекторами электронной почты и SMS. Нажмите <strong>Подтвердить</strong>, чтобы завершить обновление.',
  },
  preview: {
    title: 'Предварительный просмотр входа в систему',
    live_preview: 'Прямой эфир',
    live_preview_tip: 'Сохранить для просмотра изменений',
    native: 'Нативный',
    desktop_web: 'Веб на рабочем столе',
    mobile_web: 'Мобильный веб',
    desktop: 'Рабочий стол',
    mobile: 'Мобильный',
  },
  custom_profile_fields,
};

export default Object.freeze(sign_in_exp);
