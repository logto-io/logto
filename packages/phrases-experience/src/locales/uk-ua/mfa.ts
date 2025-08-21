const mfa = {
  totp: 'OTP автентифікатор',
  webauthn: 'Ключ доступу',
  backup_code: 'Резервний код',
  email_verification_code: 'Код підтвердження електронної пошти',
  phone_verification_code: 'Код підтвердження SMS',
  link_totp_description: 'Наприклад, Google Authenticator тощо.',
  link_webauthn_description: 'Підключіть свій пристрій або USB-ключ',
  link_backup_code_description: 'Згенеруйте резервний код',
  link_email_verification_code_description: "Під'єднайте вашу адресу електронної пошти",
  link_email_2fa_description: "Під'єднайте вашу адресу електронної пошти для 2-етапної перевірки",
  link_phone_verification_code_description: "Під'єднайте ваш номер телефону",
  link_phone_2fa_description: "Під'єднайте ваш номер телефону для 2-етапної перевірки",
  verify_totp_description: 'Введіть одноразовий код з програми',
  verify_webauthn_description: 'Підтвердьте свій пристрій або USB-ключ',
  verify_backup_code_description: 'Вставте збережений резервний код',
  verify_email_verification_code_description: 'Введіть код, надісланий на вашу електронну пошту',
  verify_phone_verification_code_description: 'Введіть код, надісланий на ваш телефон',
  add_mfa_factors: 'Додати двоетапну перевірку',
  add_mfa_description:
    'Двоетапна перевірка ввімкнена. Виберіть другий метод перевірки для безпечного входу.',
  verify_mfa_factors: 'Двоетапна перевірка',
  verify_mfa_description:
    'Для цього облікового запису ввімкнено двоетапну перевірку. Виберіть другий спосіб перевірки вашої особи.',
  add_authenticator_app: 'Додати програму автентифікації',
  step: 'Крок {{step, number}}: {{content}}',
  scan_qr_code: 'Скануйте цей QR-код',
  scan_qr_code_description:
    'Скануйте QR-код за допомогою програми автентифікації, наприклад Google Authenticator, Duo Mobile, Authy тощо.',
  qr_code_not_available: 'Не можете сканувати QR-код?',
  copy_and_paste_key: 'Скопіюйте та вставте ключ',
  copy_and_paste_key_description:
    'Скопіюйте та вставте цей ключ у вашу програму автентифікації, наприклад Google Authenticator, Duo Mobile, Authy тощо.',
  want_to_scan_qr_code: 'Хочете сканувати QR-код?',
  enter_one_time_code: 'Введіть одноразовий код',
  enter_one_time_code_link_description:
    'Введіть 6-значний код підтвердження, згенерований програмою автентифікації.',
  enter_one_time_code_description:
    'Для цього облікового запису ввімкнено двоетапну перевірку. Будь ласка, введіть одноразовий код із вашої програми автентифікації.',
  enter_email_verification_code: 'Введіть код підтвердження електронної пошти',
  enter_email_verification_code_description:
    'Для цього облікового запису увімкнено двоетапну автентифікацію. Будь ласка, введіть код підтвердження, надісланий на вашу адресу електронної пошти. {{identifier}}',
  enter_phone_verification_code: 'Введіть SMS‑код підтвердження',
  enter_phone_verification_code_description:
    'Для цього облікового запису увімкнено двоетапну автентифікацію. Будь ласка, введіть SMS‑код підтвердження, надісланий на ваш номер телефону. {{identifier}}',
  link_another_mfa_factor: 'Переключитися на інший метод',
  save_backup_code: 'Збережіть свій резервний код',
  save_backup_code_description:
    'Ви можете використовувати один із цих резервних кодів для доступу до вашого облікового запису, якщо у вас виникнуть проблеми з двоетапною перевіркою іншим способом. Кожен код можна використати лише один раз.',
  backup_code_hint: 'Обов’язково скопіюйте їх і збережіть у безпечному місці.',
  enter_a_backup_code: 'Введіть резервний код',
  enter_backup_code_description:
    'Введіть резервний код, який ви зберегли під час початкового ввімкнення двоетапної перевірки.',
  create_a_passkey: 'Створити ключ доступу',
  create_passkey_description:
    'Зареєструйте свій ключ доступу, використовуючи біометричні дані пристрою, апаратні ключі безпеки (наприклад, YubiKey) або інші доступні методи.',
  try_another_verification_method: 'Спробуйте інший метод перевірки',
  verify_via_passkey: 'Перевірити через ключ доступу',
  verify_via_passkey_description:
    'Використовуйте ключ доступу для перевірки за допомогою пароля пристрою, біометричних даних, сканування QR-коду або USB-ключа безпеки, як-от YubiKey.',
  secret_key_copied: 'Секретний ключ скопійовано.',
  backup_code_copied: 'Резервний код скопійовано.',
  webauthn_not_ready: 'WebAuthn ще не готовий. Будь ласка, спробуйте ще раз пізніше.',
  webauthn_not_supported: 'WebAuthn не підтримується у цьому браузері.',
  webauthn_failed_to_create: 'Не вдалося створити. Будь ласка, спробуйте ще раз.',
  webauthn_failed_to_verify: 'Не вдалося підтвердити. Будь ласка, спробуйте ще раз.',
};

export default Object.freeze(mfa);
