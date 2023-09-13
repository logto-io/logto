import content from './content.js';
import password_policy from './password-policy.js';
import sign_up_and_sign_in from './sign-up-and-sign-in.js';

const sign_in_exp = {
  page_title: 'Опыт входа в систему',
  title: 'Опыт входа в систему',
  description:
    'Настройте пользовательский интерфейс входа в систему в соответствии с вашим брендом и просматривайте в режиме реального времени',
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
    favicon: 'Фавикон',
    logo_image_url: 'URL изображения логотипа приложения',
    logo_image_url_placeholder: 'https://your.cdn.domain/logo.png',
    dark_logo_image_url: 'URL изображения логотипа приложения (темный)',
    dark_logo_image_url_placeholder: 'https://your.cdn.domain/logo-dark.png',
    logo_image: 'Логотип приложения',
    dark_logo_image: 'Логотип приложения (темный)',
    logo_image_error: 'Ошибка логотипа приложения: {{error}}',
    favicon_error: 'Ошибка фавикона: {{error}}',
  },
  custom_css: {
    title: 'Пользовательский CSS',
    css_code_editor_title:
      'Настройте ваш пользовательский интерфейс с помощью пользовательского CSS',
    css_code_editor_description1: 'Смотрите пример пользовательского CSS.',
    css_code_editor_description2: '<a>{{link}}</a>',
    css_code_editor_description_link_content: 'Подробнее',
    css_code_editor_content_placeholder:
      'Введите ваш пользовательский CSS, чтобы настроить стили для чего-угодно в соответствии с вашими требованиями. Выражайте свою креативность и выделяйте свой пользовательский интерфейс.',
  },
  sign_up_and_sign_in,
  content,
  password_policy,
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
