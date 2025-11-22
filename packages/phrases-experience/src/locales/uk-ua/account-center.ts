const account_center = {
  header: {
    title: 'Центр облікового запису',
  },
  home: {
    title: 'Сторінку не знайдено',
    description: 'Ця сторінка недоступна.',
  },
  verification: {
    title: 'Перевірка безпеки',
    description:
      'Підтвердьте, що це ви, щоб захистити безпеку облікового запису. Будь ласка, оберіть спосіб підтвердження особи.',
  },
  password_verification: {
    title: 'Verify password',
    description: "Verify it's you to protect your account security. Enter your password.",
    error_failed: 'Verification failed. Please check your password.',
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
  email_verification: {
    title: 'Підтвердьте свою електронну пошту',
    prepare_description:
      "Verify it's you to protect your account security. Send the verification code to your email.",
    email_label: 'Email address',
    send: 'Send verification code',
    description: 'Код підтвердження надіслано на адресу {{email}}. Введіть код, щоб продовжити.',
    resend: 'Надіслати код ще раз',
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
    send: 'Send verification code',
    description:
      'Код підтвердження надіслано на ваш телефон {{phone}}. Введіть код, щоб продовжити.',
    resend: 'Надіслати код ще раз',
    resend_countdown: 'Ще не отримали? Повторна відправка через {{seconds}} с.',
    error_send_failed: 'Не вдалося надіслати код підтвердження. Спробуйте ще раз пізніше.',
    error_verify_failed: 'Не вдалося підтвердити. Будь ласка, введіть код ще раз.',
    error_invalid_code: 'Код підтвердження недійсний або строк його дії минув.',
  },
};

export default Object.freeze(account_center);
