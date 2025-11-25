const account_center = {
  header: {
    title: 'مركز الحساب',
  },
  home: {
    title: 'الصفحة غير موجودة',
    description: 'هذه الصفحة غير متاحة.',
  },
  verification: {
    title: 'التحقق الأمني',
    description:
      'تحقق من أنك الشخص المقصود لحماية أمان حسابك. يرجى اختيار الطريقة للتحقق من هويتك.',
  },
  password_verification: {
    title: 'Verify password',
    description: "Verify it's you to protect your account security. Enter your password.",
    error_failed: 'Verification failed. Please check your password.',
  },
  verification_method: {
    password: {
      name: 'كلمة المرور',
      description: 'تحقق من كلمة المرور الخاصة بك',
    },
    email: {
      name: 'رمز التحقق عبر البريد الإلكتروني',
      description: 'أرسل رمز التحقق إلى بريدك الإلكتروني',
    },
    phone: {
      name: 'رمز التحقق عبر الهاتف',
      description: 'أرسل رمز التحقق إلى رقم هاتفك',
    },
  },
  email_verification: {
    title: 'تحقق من بريدك الإلكتروني',
    prepare_description:
      "Verify it's you to protect your account security. Send the verification code to your email.",
    email_label: 'Email address',
    send: 'Send verification code',
    description: 'تم إرسال رمز التحقق إلى بريدك الإلكتروني {{email}}. أدخل الرمز للمتابعة.',
    resend: 'إعادة إرسال الرمز',
    resend_countdown: 'لم تستلمه بعد؟ أعد الإرسال بعد {{seconds}} ث.',
    error_send_failed: 'فشل إرسال رمز التحقق. يرجى المحاولة لاحقًا.',
    error_verify_failed: 'فشل التحقق. يرجى إدخال الرمز مرة أخرى.',
    error_invalid_code: 'رمز التحقق غير صالح أو منتهي الصلاحية.',
  },
  phone_verification: {
    title: 'تحقق من هاتفك',
    prepare_description:
      "Verify it's you to protect your account security. Send the verification code to your phone.",
    phone_label: 'رقم الهاتف',
    send: 'Send verification code',
    description: 'تم إرسال رمز التحقق إلى هاتفك {{phone}}. أدخل الرمز للمتابعة.',
    resend: 'إعادة إرسال الرمز',
    resend_countdown: 'لم تستلمه بعد؟ أعد الإرسال بعد {{seconds}} ث.',
    error_send_failed: 'فشل إرسال رمز التحقق. يرجى المحاولة لاحقًا.',
    error_verify_failed: 'فشل التحقق. يرجى إدخال الرمز مرة أخرى.',
    error_invalid_code: 'رمز التحقق غير صالح أو منتهي الصلاحية.',
  },
};

export default Object.freeze(account_center);
