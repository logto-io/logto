const mfa = {
  totp: 'Одноразовый пароль приложения для аутентификации',
  webauthn: 'Пароль',
  backup_code: 'Резервный код',
  email_verification_code: 'Код подтверждения по электронной почте',
  phone_verification_code: 'Код подтверждения по SMS',
  link_totp_description: 'Например, Google Authenticator и др.',
  link_webauthn_description: 'Привяжите ваше устройство или USB-ключ',
  link_backup_code_description: 'Создайте резервный код',
  link_email_verification_code_description: 'Привяжите ваш адрес электронной почты',
  link_email_2fa_description: 'Привяжите ваш адрес электронной почты для 2-этапной проверки',
  link_phone_verification_code_description: 'Привяжите ваш номер телефона',
  link_phone_2fa_description: 'Привяжите ваш номер телефона для 2-этапной проверки',
  verify_totp_description: 'Введите одноразовый код в приложении',
  verify_webauthn_description: 'Подтвердите ваше устройство или USB-ключ',
  verify_backup_code_description: 'Вставьте резервный код, который вы сохранили',
  verify_email_verification_code_description: 'Введите код, отправленный на вашу электронную почту',
  verify_phone_verification_code_description: 'Введите код, отправленный на ваш телефон',
  add_mfa_factors: 'Добавить двухфакторную аутентификацию',
  add_mfa_description:
    'Включена двухфакторная аутентификация. Выберите второй метод для безопасного входа.',
  verify_mfa_factors: 'Двухфакторная аутентификация',
  verify_mfa_description:
    'Двухфакторная аутентификация включена для этого аккаунта. Выберите второй способ подтверждения вашей личности.',
  add_authenticator_app: 'Добавить приложение для аутентификации',
  step: 'Шаг {{step, number}}: {{content}}',
  scan_qr_code: 'Отсканируйте этот QR-код',
  scan_qr_code_description:
    'Отсканируйте следующий QR-код с помощью вашего приложения для аутентификации, такого как Google Authenticator, Duo Mobile, Authy и др.',
  qr_code_not_available: 'Нельзя отсканировать QR-код?',
  copy_and_paste_key: 'Скопируйте и вставьте ключ',
  copy_and_paste_key_description:
    'Скопируйте и вставьте следующий ключ в ваше приложение для аутентификации, такое как Google Authenticator, Duo Mobile, Authy и др.',
  want_to_scan_qr_code: 'Хотите отсканировать QR-код?',
  enter_one_time_code: 'Введите одноразовый код',
  enter_one_time_code_link_description:
    'Введите 6-значный код, сгенерированный приложением для аутентификации.',
  enter_one_time_code_description:
    'Для этого аккаунта включена двухэтапная аутентификация. Введите одноразовый код, отображаемый в вашем связанном приложении для аутентификации.',
  link_another_mfa_factor: 'Переключиться на другой метод',
  save_backup_code: 'Сохраните ваш резервный код',
  save_backup_code_description:
    'Вы можете использовать один из этих резервных кодов для доступа к своему аккаунту, если у вас возникнут проблемы с двухфакторной аутентификацией другим способом. Каждый код может быть использован только один раз.',
  backup_code_hint: 'Убедитесь, что вы скопировали и сохранили их в надежном месте.',
  enter_a_backup_code: 'Введите резервный код',
  enter_backup_code_description:
    'Введите резервный код, который вы сохранили при включении двухфакторной аутентификации.',
  create_a_passkey: 'Создать код доступа',
  create_passkey_description:
    'Зарегистрируйте свой код доступа с использованием биометрических данных устройства, ключей безопасности (например, YubiKey) или других доступных методов.',
  try_another_verification_method: 'Попробуйте другой метод подтверждения',
  verify_via_passkey: 'Подтвердите через код доступа',
  verify_via_passkey_description:
    'Используйте код доступа для подтверждения с помощью пароля устройства или биометрии, сканирования QR-кода или использования USB-ключа безопасности, такого как YubiKey.',
  secret_key_copied: 'Ключ скопирован.',
  backup_code_copied: 'Резервный код скопирован.',
  webauthn_not_ready: 'WebAuthn еще не готов. Пожалуйста, попробуйте позже.',
  webauthn_not_supported: 'WebAuthn не поддерживается в этом браузере.',
  webauthn_failed_to_create: 'Не удалось создать. Пожалуйста, попробуйте еще раз.',
  webauthn_failed_to_verify: 'Не удалось проверить. Пожалуйста, попробуйте еще раз.',
};

export default Object.freeze(mfa);
