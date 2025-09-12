const session = {
  not_found: 'الجلسة غير موجودة. يرجى العودة وتسجيل الدخول مرة أخرى.',
  invalid_credentials: 'اسم المستخدم أو كلمة المرور غير صحيحة. يرجى التحقق من المدخلات الخاصة بك.',
  invalid_sign_in_method: 'طريقة تسجيل الدخول الحالية غير متاحة.',
  invalid_connector_id: 'تعذر العثور على موصل متاح بالمعرف {{connectorId}}.',
  insufficient_info: 'معلومات تسجيل الدخول غير كافية.',
  connector_id_mismatch: 'معرف الموصل غير متطابق مع سجل الجلسة.',
  connector_session_not_found: 'جلسة الموصل غير موجودة. يرجى العودة وتسجيل الدخول مرة أخرى.',
  verification_session_not_found: 'لم يتم التحقق بنجاح. أعد بدء عملية التحقق وحاول مرة أخرى.',
  verification_expired: 'انتهت مدة الاتصال. قم بالتحقق مرة أخرى لضمان سلامة حسابك.',
  verification_blocked_too_many_attempts:
    'الكثير من المحاولات في وقت قصير. يرجى المحاولة مرة أخرى {{relativeTime}}.',
  unauthorized: 'يرجى تسجيل الدخول أولاً.',
  unsupported_prompt_name: 'اسم الإشعار غير مدعوم.',
  forgot_password_not_enabled: 'نسيت كلمة المرور غير ممكّنة.',
  verification_failed: 'لم يتم التحقق بنجاح. أعد بدء عملية التحقق وحاول مرة أخرى.',
  connector_validation_session_not_found: 'جلسة الموصل للتحقق من الرمز غير موجودة.',
  csrf_token_mismatch: 'عدم تطابق رمز CSRF.',
  identifier_not_found: 'معرف المستخدم غير موجود. يرجى العودة وتسجيل الدخول مرة أخرى.',
  interaction_not_found: 'جلسة التفاعل غير موجودة. يرجى العودة وبدء الجلسة مرة أخرى.',
  invalid_interaction_type: 'هذا الإجراء غير مدعوم للتفاعل الحالي. يرجى بدء جلسة جديدة.',
  not_supported_for_forgot_password: 'هذا الإجراء غير مدعوم لنسيان كلمة المرور.',
  identity_conflict: 'تم اكتشاف تضارب في الهوية. يرجى بدء جلسة جديدة للمتابعة بهوية مختلفة.',
  identifier_not_verified:
    'لم يتم التحقق من المعرف المقدم {{identifier}}. يرجى إنشاء سجل التحقق لهذا المعرف واستكمال عملية التحقق.',
  mfa: {
    require_mfa_verification: 'مطلوب التحقق من MFA لتسجيل الدخول.',
    mfa_sign_in_only: 'MFA متاحة فقط لجلسة تسجيل الدخول.',
    pending_info_not_found: 'لم يتم العثور على معلومات MFA المعلقة ، يرجى بدء MFA أولاً.',
    invalid_totp_code: 'رمز TOTP غير صالح.',
    webauthn_verification_failed: 'فشل التحقق من WebAuthn.',
    webauthn_verification_not_found: 'لم يتم العثور على التحقق من WebAuthn.',
    bind_mfa_existed: 'MFA موجود بالفعل.',
    backup_code_can_not_be_alone: 'لا يمكن أن يكون رمز النسخ الاحتياطي هو الـ MFA الوحيد.',
    backup_code_required: 'مطلوب رمز النسخ الاحتياطي.',
    invalid_backup_code: 'رمز النسخ الاحتياطي غير صالح.',
    mfa_policy_not_user_controlled: 'سياسة MFA ليست تحت سيطرة المستخدم.',
    mfa_factor_not_enabled: 'عامل MFA غير ممكّن.',
    suggest_additional_mfa:
      'للمزيد من الحماية، يُنصح بإضافة طريقة MFA أخرى. يمكنك تخطي هذه الخطوة والمتابعة.',
  },
  sso_enabled:
    'تم تمكين تسجيل الدخول الموحد لهذا البريد الإلكتروني المحدد. يرجى تسجيل الدخول باستخدام SSO.',
  captcha_required: 'مطلوب التحقق من Captcha.',
  captcha_failed: 'فشل التحقق من Captcha.',
  email_blocklist: {
    disposable_email_validation_failed: 'فشل التحقق من عنوان البريد الإلكتروني.',
    invalid_email: 'عنوان البريد الإلكتروني غير صالح.',
    email_subaddressing_not_allowed: 'لا يُسمح بتوجيه البريد الإلكتروني الإضافي.',
    email_not_allowed: 'عنوان البريد الإلكتروني "{{email}}" مقيد. يرجى اختيار عنوان آخر.',
  },
  google_one_tap: {
    cookie_mismatch: 'عدم تطابق ملف تعريف الارتباط لخدمة Google One Tap.',
    invalid_id_token: 'رمز معرف Google غير صالح.',
    unverified_email: 'البريد الإلكتروني غير مُحقق.',
  },
};

export default Object.freeze(session);
