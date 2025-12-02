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
    error_send_failed: 'فشل إرسال رمز التحقق. يرجى المحاولة لاحقًا.',
    error_invalid_code: 'رمز التحقق غير صالح أو منتهي الصلاحية.',
    error_verify_failed: 'فشل التحقق. يرجى إدخال الرمز مرة أخرى.',
    verification_required: 'انتهت صلاحية التحقق. يرجى التحقق من هويتك مرة أخرى.',
  },
  password_verification: {
    title: 'التحقق من كلمة المرور',
    description: 'لحماية أمان حسابك، أدخل كلمة المرور للتحقق من هويتك.',
    error_failed: 'فشل التحقق. يرجى التحقق من كلمة المرور.',
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
  email: {
    title: 'ربط البريد الإلكتروني',
    description: 'اربط بريدك الإلكتروني لتسجيل الدخول أو للمساعدة في استعادة الحساب.',
    verification_title: 'أدخل رمز التحقق من البريد الإلكتروني',
    verification_description: 'تم إرسال رمز التحقق إلى بريدك الإلكتروني {{email_address}}.',
    success: 'تم ربط البريد الإلكتروني الأساسي بنجاح.',
    verification_required: 'انتهت صلاحية التحقق. يرجى التحقق من هويتك مرة أخرى.',
  },
  phone: {
    title: 'ربط الهاتف',
    description: 'اربط رقم هاتفك لتسجيل الدخول أو للمساعدة في استعادة الحساب.',
    verification_title: 'أدخل رمز التحقق عبر الهاتف',
    verification_description: 'تم إرسال رمز التحقق إلى هاتفك {{phone_number}}.',
    success: 'تم ربط الهاتف الأساسي بنجاح.',
    verification_required: 'انتهت صلاحية التحقق. يرجى التحقق من هويتك مرة أخرى.',
  },

  code_verification: {
    send: 'إرسال رمز التحقق',
    resend: 'إعادة إرسال الرمز',
    resend_countdown: 'لم تستلمه بعد؟ أعد الإرسال بعد {{seconds}} ث.',
  },

  email_verification: {
    title: 'تحقق من بريدك الإلكتروني',
    prepare_description:
      "Verify it's you to protect your account security. Send the verification code to your email.",
    email_label: 'عنوان البريد الإلكتروني',
    send: 'إرسال رمز التحقق',
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
    send: 'إرسال رمز التحقق',
    description: 'تم إرسال رمز التحقق إلى هاتفك {{phone}}. أدخل الرمز للمتابعة.',
    resend: 'إعادة إرسال الرمز',
    resend_countdown: 'لم تستلمه بعد؟ أعد الإرسال بعد {{seconds}} ث.',
    error_send_failed: 'فشل إرسال رمز التحقق. يرجى المحاولة لاحقًا.',
    error_verify_failed: 'فشل التحقق. يرجى إدخال الرمز مرة أخرى.',
    error_invalid_code: 'رمز التحقق غير صالح أو منتهي الصلاحية.',
  },
  update_success: {
    default: {
      title: 'تم التحديث بنجاح',
      description: 'تم حفظ تغييراتك بنجاح.',
    },
    email: {
      title: 'تم تحديث البريد الإلكتروني!',
      description: 'تم تغيير عنوان البريد الإلكتروني لحسابك بنجاح.',
    },
    phone: {
      title: 'تم تحديث رقم الهاتف!',
      description: 'تم تغيير رقم هاتف حسابك بنجاح.',
    },
  },
};

export default Object.freeze(account_center);
