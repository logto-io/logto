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
    error_send_failed: 'Не вдалося надіслати код підтвердження. Спробуйте ще раз пізніше.',
    error_invalid_code: 'Код підтвердження недійсний або строк його дії минув.',
    error_verify_failed: 'Не вдалося підтвердити. Будь ласка, введіть код ще раз.',
    verification_required: 'Verification expired. Please verify your identity again.',
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
  email: {
    title: 'Прив’язати email',
    description:
      'Прив’яжіть свій email, щоб входити або допомогти з відновленням облікового запису.',
    verification_title: 'Введіть код підтвердження email',
    verification_description: 'Код підтвердження надіслано на ваш email {{email_address}}.',
    success: 'Primary email linked successfully.',
    verification_required: 'Verification expired. Please verify your identity again.',
  },
  phone: {
    title: 'Link phone',
    description: 'Link your phone number to sign in or help with account recovery.',
    verification_title: 'Enter phone verification code',
    verification_description: 'The verification code has been sent to your phone {{phone_number}}.',
    success: 'Primary phone linked successfully.',
    verification_required: 'Verification expired. Please verify your identity again.',
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
