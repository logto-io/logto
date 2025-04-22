import content from './content.js';
import sign_up_and_sign_in from './sign-up-and-sign-in.js';

const sign_in_exp = {
  page_title: 'Опыт входа в систему',
  title: 'Опыт входа в систему',
  description:
    'Настройте потоки аутентификации и пользовательский интерфейс, и просматривайте готовый опыт в реальном времени.',
  tabs: {
    branding: 'Брендирование',
    sign_up_and_sign_in: 'Регистрация и вход в систему',
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
  sign_up_and_sign_in,
  content,
  setup_warning: {
    no_connector_sms:
      'Еще не настроен коннектор SMS. Пока не завершено настройка, пользователи не смогут войти с помощью этого метода. <a>{{link}}</a> в «Коннекторах»',
    no_connector_email:
      'Еще не настроен коннектор по электронной почте. Пока не завершено настройка, пользователи не смогут войти с помощью этого метода. <a>{{link}}</a> в «Коннекторах»',
    no_connector_social:
      'Вы еще не настроили социальный коннектор. Сначала добавьте коннекторы, чтобы применить методы социальной авторизации. <a>{{link}}</a> в разделе "Коннекторы".',
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
};

export default Object.freeze(sign_in_exp);
