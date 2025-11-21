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
};

export default Object.freeze(account_center);
