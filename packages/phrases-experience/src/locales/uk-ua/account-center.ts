const account_center = {
  home: {
    title: 'Сторінку не знайдено',
    description: 'Ця сторінка недоступна.',
    personal_info_section: 'Personal information',
    security_section: 'Security',
    not_set: 'Not set',
    action_edit: 'Edit',
    action_add: 'Add',
    action_view: 'View',
    manage: 'Manage',
    field_name: 'Display name',
    field_avatar: 'Avatar',
    field_username: 'Username',
    field_email: 'Email address',
    field_phone: 'Phone number',
    field_given_name: 'Given name',
    field_family_name: 'Family name',
    field_password: 'Password',
    field_2fa: 'Two-factor authentication',
    field_authenticator_app: 'Authenticator app',
    field_passkeys: 'Passkeys',
    field_backup_codes: 'Backup codes',
    password_set: 'Set',
    password_not_set: 'Not set',
    totp_active: 'Active',
    passkeys_count: '{{count}} passkey registered',
    passkeys_count_plural: '{{count}} passkeys registered',
    return_to_account: 'Back to account',
    no_fields_available:
      'No user attributes are available for editing, please contact your administrator.',
  },
  verification: {
    title: 'Перевірка безпеки',
    description:
      'Підтвердьте, що це ви, щоб захистити безпеку облікового запису. Будь ласка, оберіть спосіб підтвердження особи.',
    error_send_failed: 'Не вдалося надіслати код підтвердження. Спробуйте ще раз пізніше.',
    error_invalid_code: 'Код підтвердження недійсний або строк його дії минув.',
    error_verify_failed: 'Не вдалося підтвердити. Будь ласка, введіть код ще раз.',
    verification_required: 'Термін перевірки минув. Підтвердіть свою особу ще раз.',
    try_another_method: 'Спробуйте інший спосіб підтвердження',
  },
  password_verification: {
    title: 'Підтвердьте пароль',
    description: 'Щоб захистити обліковий запис, введіть пароль для підтвердження своєї особи.',
    error_failed: 'Невірний пароль. Перевірте введені дані.',
  },
  verification_method: {
    password: {
      name: 'Пароль',
      description: 'Підтвердьте свій пароль',
    },
    email: {
      name: 'Код підтвердження електронної пошти',
      description: 'Надіслати код підтвердження на вашу пошту',
    },
    phone: {
      name: 'Код підтвердження телефону',
      description: 'Надіслати код підтвердження на ваш номер телефону',
    },
  },
  email: {
    title: "Прив'язати email",
    description:
      "Прив'яжіть свій email, щоб входити або допомогти з відновленням облікового запису.",
    verification_title: 'Введіть код підтвердження email',
    verification_description: 'Код підтвердження надіслано на ваш email {{email_address}}.',
    success: "Основний email успішно прив'язано.",
    verification_required: 'Термін перевірки минув. Підтвердіть свою особу ще раз.',
  },
  phone: {
    title: "Прив'язати телефон",
    description:
      "Прив'яжіть номер телефону, щоб увійти або допомогти з відновленням облікового запису.",
    verification_title: 'Введіть код підтвердження SMS',
    verification_description: 'Код підтвердження надіслано на ваш телефон {{phone_number}}.',
    success: "Основний телефон успішно прив'язано.",
    verification_required: 'Термін перевірки минув. Підтвердіть свою особу ще раз.',
  },
  username: {
    title: "Встановити ім'я користувача",
    description: "Ім'я користувача може містити лише літери, цифри та символи підкреслення.",
    success: "Ім'я користувача успішно оновлено.",
  },
  password: {
    title: 'Встановити пароль',
    description: 'Створіть новий пароль, щоб захистити свій обліковий запис.',
    success: 'Пароль успішно оновлено.',
  },
  code_verification: {
    send: 'Надіслати код підтвердження',
    resend: 'Ще не отримали? <a>Надіслати код підтвердження ще раз</a>',
    resend_countdown: 'Ще не отримали? Повторна відправка через {{seconds}} с.',
  },
  email_verification: {
    title: 'Підтвердьте свою електронну пошту',
    prepare_description:
      'Підтвердіть, що це ви, щоб захистити безпеку облікового запису. Надішліть код підтвердження на свою електронну пошту.',
    email_label: 'Адреса електронної пошти',
    send: 'Надіслати код підтвердження',
    description: 'Код підтвердження надіслано на адресу {{email}}. Введіть код, щоб продовжити.',
    resend: 'Ще не отримали? <a>Надіслати код підтвердження ще раз</a>',
    not_received: 'Ще не отримали?',
    resend_action: 'Надіслати код підтвердження ще раз',
    resend_countdown: 'Ще не отримали? Повторна відправка через {{seconds}} с.',
    error_send_failed: 'Не вдалося надіслати код підтвердження. Спробуйте ще раз пізніше.',
    error_verify_failed: 'Не вдалося підтвердити. Будь ласка, введіть код ще раз.',
    error_invalid_code: 'Код підтвердження недійсний або строк його дії минув.',
  },
  phone_verification: {
    title: 'Підтвердьте свій телефон',
    prepare_description:
      'Підтвердьте, що це ви, щоб захистити безпеку облікового запису. Надішліть код підтвердження на свій телефон.',
    phone_label: 'Номер телефону',
    send: 'Надіслати код підтвердження',
    description:
      'Код підтвердження надіслано на ваш телефон {{phone}}. Введіть код, щоб продовжити.',
    resend: 'Ще не отримали? <a>Надіслати код підтвердження ще раз</a>',
    resend_countdown: 'Ще не отримали? Повторна відправка через {{seconds}} с.',
    error_send_failed: 'Не вдалося надіслати код підтвердження. Спробуйте ще раз пізніше.',
    error_verify_failed: 'Не вдалося підтвердити. Будь ласка, введіть код ще раз.',
    error_invalid_code: 'Код підтвердження недійсний або строк його дії минув.',
  },
  mfa: {
    totp_already_added:
      'Ви вже додали додаток для автентифікації. Будь ласка, спочатку видаліть існуючий.',
    totp_not_enabled:
      'Додаток для автентифікації OTP не увімкнено. Зверніться до адміністратора за допомогою.',
    backup_code_already_added:
      'У вас вже є активні резервні коди. Будь ласка, використайте або видаліть їх перед створенням нових.',
    backup_code_not_enabled:
      'Резервний код не увімкнено. Зверніться до адміністратора за допомогою.',
    backup_code_requires_other_mfa:
      'Резервні коди вимагають попереднього налаштування іншого методу MFA.',
    passkey_not_enabled: 'Passkey не увімкнено. Зверніться до адміністратора за допомогою.',
    totp_manage_title: 'Manage authenticator app',
    totp_manage_description:
      'Your authenticator app is currently active. Remove it to disable OTP two-factor authentication.',
    totp_remove: 'Remove authenticator app',
    totp_removed: 'Authenticator app removed.',
    totp_remove_confirm_description:
      'Are you sure you want to remove your authenticator app? You will no longer be able to use it for two-factor authentication.',
    passkey_already_registered:
      'Цей passkey вже зареєстровано у вашому обліковому записі. Будь ласка, використовуйте інший автентифікатор.',
  },
  update_success: {
    default: {
      title: 'Оновлено!',
      description: 'Вашу інформацію було оновлено.',
    },
    email: {
      title: 'Електронну пошту оновлено!',
      description: 'Вашу електронну адресу успішно оновлено.',
    },
    phone: {
      title: 'Номер телефону оновлено!',
      description: 'Ваш номер телефону успішно оновлено.',
    },
    username: {
      title: "Ім'я користувача змінено!",
      description: "Ваше ім'я користувача успішно оновлено.",
    },
    password: {
      title: 'Пароль змінено!',
      description: 'Ваш пароль успішно оновлено.',
    },
    totp: {
      title: 'Додаток для автентифікації додано!',
      description: "Ваш додаток для автентифікації успішно під'єднано до вашого акаунту.",
    },
    backup_code: {
      title: 'Резервні коди створено!',
      description: 'Ваші резервні коди збережено. Зберігайте їх у безпечному місці.',
    },
    passkey: {
      title: 'Passkey додано!',
      description: "Ваш passkey успішно під'єднано до вашого облікового запису.",
    },
    social: {
      title: "Соціальний акаунт під'єднано!",
      description: "Ваш соціальний акаунт успішно під'єднано.",
    },
  },
  backup_code: {
    title: 'Резервні коди',
    description:
      'Ви можете використати один з цих резервних кодів для доступу до свого облікового запису, якщо у вас виникнуть проблеми під час двоетапної перевірки іншими способами. Кожен код можна використати лише один раз.',
    copy_hint: "Обов'язково скопіюйте їх і збережіть у надійному місці.",
    generate_new_title: 'Згенерувати нові резервні коди',
    generate_new: 'Згенерувати нові резервні коди',
  },
  passkey: {
    title: 'Passkeys',
    added: 'Додано: {{date}}',
    last_used: 'Останнє використання: {{date}}',
    never_used: 'Ніколи',
    unnamed: 'Passkey без назви',
    renamed: 'Passkey успішно перейменовано.',
    deleted: 'Passkey успішно видалено.',
    add_another_title: 'Додати інший passkey',
    add_another_description:
      'Зареєструйте свій passkey за допомогою біометрії пристрою, ключів безпеки (наприклад, YubiKey) або інших доступних методів.',
    add_passkey: 'Додати passkey',
    delete_confirmation_title: 'Видалити ваш passkey',
    delete_confirmation_description:
      'Якщо ви видалите цей passkey, ви не зможете використовувати його для підтвердження.',
    rename_passkey: 'Перейменувати passkey',
    rename_description: 'Введіть нову назву для цього passkey.',
    name_this_passkey: 'Назвіть цей passkey пристрою',
    name_passkey_description:
      'Ви успішно підтвердили цей пристрій для двоетапної автентифікації. Налаштуйте назву для розпізнавання, якщо у вас кілька ключів.',
    name_input_label: "Ім'я",
  },
  profile: {
    title: 'Edit profile',
    description: 'Update your display name and avatar.',
    name_label: 'Display name',
    avatar_label: 'Avatar URL',
    given_name_label: 'Given name',
    family_name_label: 'Family name',
    saved: 'Profile updated successfully.',
  },
};

export default Object.freeze(account_center);
