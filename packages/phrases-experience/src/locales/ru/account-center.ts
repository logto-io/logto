const account_center = {
  header: {
    title: 'Центр аккаунта',
  },
  home: {
    title: 'Страница не найдена',
    description: 'Эта страница недоступна.',
  },
  verification: {
    title: 'Проверка безопасности',
    description:
      'Подтвердите, что это вы, чтобы защитить безопасность аккаунта. Пожалуйста, выберите способ подтверждения личности.',
    error_send_failed: 'Не удалось отправить код подтверждения. Попробуйте позже.',
    error_invalid_code: 'Код подтверждения недействителен или истёк.',
    error_verify_failed: 'Не удалось подтвердить. Введите код ещё раз.',
    verification_required: 'Срок действия проверки истёк. Подтвердите личность ещё раз.',
  },
  password_verification: {
    title: 'Подтвердите пароль',
    description: 'Чтобы защитить аккаунт, введите пароль для подтверждения своей личности.',
    error_failed: 'Проверка не удалась. Проверьте пароль.',
  },
  verification_method: {
    password: {
      name: 'Пароль',
      description: 'Подтвердите свой пароль',
    },
    email: {
      name: 'Код подтверждения по электронной почте',
      description: 'Отправить код подтверждения на вашу почту',
    },
    phone: {
      name: 'Код подтверждения по телефону',
      description: 'Отправить код подтверждения на ваш номер телефона',
    },
  },
  email: {
    title: 'Привязать email',
    description: 'Привяжите свой email, чтобы входить или помочь с восстановлением аккаунта.',
    verification_title: 'Введите код подтверждения email',
    verification_description: 'Код подтверждения отправлен на ваш email {{email_address}}.',
    success: 'Основной email успешно привязан.',
    verification_required: 'Срок действия проверки истёк. Подтвердите личность ещё раз.',
  },
  phone: {
    title: 'Привязать телефон',
    description: 'Привяжите номер телефона для входа или восстановления аккаунта.',
    verification_title: 'Введите код подтверждения телефона',
    verification_description: 'Код подтверждения отправлен на ваш телефон {{phone_number}}.',
    success: 'Основной телефон успешно привязан.',
    verification_required: 'Срок действия проверки истёк. Подтвердите личность ещё раз.',
  },
  username: {
    title: 'Set username',
    description: 'Username must contain only letters, numbers, and underscores.',
    success: 'Username updated successfully.',
  },

  code_verification: {
    send: 'Отправить код подтверждения',
    resend: 'Отправить код ещё раз',
    resend_countdown: 'Не получили? Повторная отправка через {{seconds}} с.',
  },

  email_verification: {
    title: 'Подтвердите свою почту',
    prepare_description:
      "Verify it's you to protect your account security. Send the verification code to your email.",
    email_label: 'Адрес электронной почты',
    send: 'Отправить код подтверждения',
    description: 'Код подтверждения отправлен на {{email}}. Введите код, чтобы продолжить.',
    resend: 'Отправить код ещё раз',
    resend_countdown: 'Не получили? Повторная отправка через {{seconds}} с.',
    error_send_failed: 'Не удалось отправить код подтверждения. Попробуйте позже.',
    error_verify_failed: 'Не удалось подтвердить. Введите код ещё раз.',
    error_invalid_code: 'Код подтверждения недействителен или истёк.',
  },
  phone_verification: {
    title: 'Подтвердите свой телефон',
    prepare_description:
      'Подтвердите, что это вы, чтобы защитить безопасность аккаунта. Отправьте код подтверждения на свой телефон.',
    phone_label: 'Номер телефона',
    send: 'Отправить код подтверждения',
    description:
      'Код подтверждения отправлен на ваш телефон {{phone}}. Введите код, чтобы продолжить.',
    resend: 'Отправить код ещё раз',
    resend_countdown: 'Не получили? Повторная отправка через {{seconds}} с.',
    error_send_failed: 'Не удалось отправить код подтверждения. Попробуйте позже.',
    error_verify_failed: 'Не удалось подтвердить. Введите код ещё раз.',
    error_invalid_code: 'Код подтверждения недействителен или истёк.',
  },
  update_success: {
    default: {
      title: 'Обновление выполнено успешно',
      description: 'Ваши изменения успешно сохранены.',
    },
    email: {
      title: 'Адрес электронной почты обновлён!',
      description: 'Адрес электронной почты вашего аккаунта успешно изменён.',
    },
    phone: {
      title: 'Номер телефона обновлён!',
      description: 'Номер телефона вашего аккаунта успешно изменён.',
    },
    username: {
      title: 'Username updated!',
      description: "Your account's username has been successfully changed.",
    },
  },
};

export default Object.freeze(account_center);
