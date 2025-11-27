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
  },
  password_verification: {
    title: 'Verify password',
    description: "Verify it's you to protect your account security. Enter your password.",
    error_failed: 'Verification failed. Please check your password.',
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
    success: 'Primary email linked successfully.',
    verification_required: 'Verification expired. Please verify your identity again.',
  },
  email_verification: {
    title: 'Подтвердите свою почту',
    prepare_description:
      "Verify it's you to protect your account security. Send the verification code to your email.",
    email_label: 'Email address',
    send: 'Send verification code',
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
    send: 'Send verification code',
    description:
      'Код подтверждения отправлен на ваш телефон {{phone}}. Введите код, чтобы продолжить.',
    resend: 'Отправить код ещё раз',
    resend_countdown: 'Не получили? Повторная отправка через {{seconds}} с.',
    error_send_failed: 'Не удалось отправить код подтверждения. Попробуйте позже.',
    error_verify_failed: 'Не удалось подтвердить. Введите код ещё раз.',
    error_invalid_code: 'Код подтверждения недействителен или истёк.',
  },
};

export default Object.freeze(account_center);
