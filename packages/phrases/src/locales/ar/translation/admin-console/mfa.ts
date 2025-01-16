const mfa = {
  title: 'المصادقة متعددة العوامل',
  description: 'أضف المصادقة متعددة العوامل لتعزيز أمان تجربة تسجيل الدخول الخاصة بك.',
  factors: 'العوامل',
  multi_factors: 'العوامل المتعددة',
  multi_factors_description: 'يحتاج المستخدمون إلى التحقق من إحدى العوامل الممكّنة للتحقق الثنائي.',
  totp: 'OTP لتطبيق المصادقة',
  otp_description: 'ربط تطبيق Google Authenticator وما إلى ذلك للتحقق من كلمات المرور لمرة واحدة.',
  webauthn: 'WebAuthn (مفتاح المرور)',
  webauthn_description:
    'التحقق عبر طريقة مدعومة من المتصفح: البيومتريات أو مسح الهاتف أو مفتاح الأمان وما إلى ذلك.',
  webauthn_native_tip: 'WebAuthn غير مدعوم للتطبيقات الأصلية.',
  webauthn_domain_tip:
    'يربط WebAuthn المفاتيح العامة بالنطاق المحدد. ستمنع تعديل نطاق الخدمة المستخدمين من المصادقة باستخدام مفاتيح المرور الحالية.',
  backup_code: 'رمز النسخ الاحتياطي',
  backup_code_description: 'إنشاء 10 رموز احتياطية لمرة واحدة بعد تعيين المستخدمين لأي طريقة MFA.',
  backup_code_setup_hint:
    'عندما لا يمكن للمستخدمين التحقق من العوامل MFA أعلاه ، استخدم الخيار الاحتياطي.',
  backup_code_error_hint:
    'لاستخدام رمز النسخ الاحتياطي ، تحتاج إلى طريقة MFA واحدة على الأقل للمصادقة الناجحة للمستخدم.',
  policy: 'السياسة',
  policy_description: 'تعيين سياسة MFA لعمليات تسجيل الدخول والتسجيل.',
  two_step_sign_in_policy: 'سياسة التحقق الثنائي في تسجيل الدخول',
  user_controlled: 'يمكن للمستخدمين تمكين أو تعطيل MFA بأنفسهم',
  user_controlled_tip:
    'يمكن للمستخدمين تخطي إعداد MFA في المرة الأولى عند تسجيل الدخول أو التسجيل ، أو تمكينه / تعطيله في إعدادات الحساب.',
  mandatory: 'يتطلب دائمًا من المستخدمين استخدام MFA عند تسجيل الدخول',
  mandatory_tip:
    'يجب على المستخدمين إعداد MFA في المرة الأولى عند تسجيل الدخول أو التسجيل ، واستخدامه في جميع تسجيلات الدخول المستقبلية.',
  /** UNTRANSLATED */
  require_mfa: 'Require MFA',
  /** UNTRANSLATED */
  require_mfa_label:
    'Enable this to make 2-step verification mandatory for accessing your applications. If disabled, users can decide whether to enable MFA for themselves.',
  /** UNTRANSLATED */
  set_up_prompt: 'MFA set-up prompt',
  /** UNTRANSLATED */
  no_prompt: 'Do not ask users to set up MFA',
  /** UNTRANSLATED */
  prompt_at_sign_in_and_sign_up:
    'Ask users to set up MFA during registration (skippable, one-time prompt)',
  /** UNTRANSLATED */
  prompt_only_at_sign_in:
    'Ask users to set up MFA on their next sign-in attempt after registration (skippable, one-time prompt)',
};

export default Object.freeze(mfa);
