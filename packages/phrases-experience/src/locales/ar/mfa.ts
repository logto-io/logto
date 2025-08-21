const mfa = {
  totp: 'رمز OTP لتطبيق المصادقة',
  webauthn: 'مفتاح المرور',
  backup_code: 'رمز النسخ الاحتياطي',
  email_verification_code: 'رمز التحقق عبر البريد الإلكتروني',
  phone_verification_code: 'رمز التحقق عبر الرسائل القصيرة',
  link_totp_description: 'مثال: Google Authenticator، إلخ.',
  link_webauthn_description: 'ربط جهازك أو جهاز USB الخاص بك',
  link_backup_code_description: 'إنشاء رمز نسخ احتياطي',
  link_email_verification_code_description: 'ربط عنوان بريدك الإلكتروني',
  link_email_2fa_description: 'ربط عنوان بريدك الإلكتروني للتحقق بخطوتين',
  link_phone_verification_code_description: 'ربط رقم هاتفك',
  link_phone_2fa_description: 'ربط رقم هاتفك للتحقق بخطوتين',
  verify_totp_description: 'أدخل الرمز المرة الواحدة في التطبيق',
  verify_webauthn_description: 'تحقق من جهازك أو جهاز USB الخاص بك',
  verify_backup_code_description: 'الصق رمز النسخ الاحتياطي الذي حفظته',
  verify_email_verification_code_description: 'أدخل الرمز المرسل إلى بريدك الإلكتروني',
  verify_phone_verification_code_description: 'أدخل الرمز المرسل إلى هاتفك',
  add_mfa_factors: 'إضافة التحقق من خطوتين',
  add_mfa_description: 'تم تمكين التحقق من خطوتين. حدد طريقة التحقق الثانية لتسجيل الدخول الآمن.',
  verify_mfa_factors: 'التحقق من خطوتين',
  verify_mfa_description:
    'تم تمكين التحقق من خطوتين لهذا الحساب. يرجى تحديد الطريقة الثانية للتحقق من هويتك.',
  add_authenticator_app: 'إضافة تطبيق المصادقة',
  step: 'الخطوة {{step, number}}: {{content}}',
  scan_qr_code: 'مسح رمز الاستجابة السريعة هذا',
  scan_qr_code_description:
    'مسح رمز الاستجابة السريعة التالي باستخدام تطبيق المصادقة الخاص بك ، مثل Google Authenticator و Duo Mobile و Authy ، إلخ.',
  qr_code_not_available: 'لا يمكن مسح رمز الاستجابة السريعة؟',
  copy_and_paste_key: 'انسخ والصق المفتاح',
  copy_and_paste_key_description:
    'انسخ والصق المفتاح التالي في تطبيق المصادقة الخاص بك ، مثل Google Authenticator و Duo Mobile و Authy ، إلخ.',
  want_to_scan_qr_code: 'هل ترغب في مسح رمز الاستجابة السريعة؟',
  enter_one_time_code: 'أدخل الرمز لمرة واحدة',
  enter_one_time_code_link_description:
    'أدخل رمز التحقق المكون من 6 أرقام الذي تم إنشاؤه بواسطة تطبيق المصادقة.',
  enter_one_time_code_description:
    'تم تمكين التحقق من خطوتين لهذا الحساب. يرجى إدخال الرمز لمرة واحدة المعروض على تطبيق المصادقة المرتبط بك.',
  enter_email_verification_code: 'أدخل رمز التحقق عبر البريد الإلكتروني',
  enter_email_verification_code_description:
    'تم تمكين المصادقة بخطوتين لهذا الحساب. يرجى إدخال رمز التحقق المرسل إلى {{identifier}}.',
  enter_phone_verification_code: 'أدخل رمز التحقق عبر الرسائل القصيرة',
  enter_phone_verification_code_description:
    'تم تمكين المصادقة بخطوتين لهذا الحساب. يرجى إدخال رمز التحقق عبر الرسائل القصيرة المرسل إلى {{identifier}}.',
  link_another_mfa_factor: 'التبديل إلى طريقة أخرى',
  save_backup_code: 'احفظ رمز النسخ الاحتياطي الخاص بك',
  save_backup_code_description:
    'يمكنك استخدام أحد هذه الرموز الاحتياطية للوصول إلى حسابك إذا واجهتك مشكلة أثناء التحقق من خطوتين بطرق أخرى. يمكن استخدام كل رمز مرة واحدة فقط.',
  backup_code_hint: 'تأكد من نسخها وحفظها في مكان آمن.',
  enter_a_backup_code: 'أدخل رمز النسخ الاحتياطي',
  enter_backup_code_description:
    'أدخل رمز النسخ الاحتياطي الذي حفظته عند تمكين التحقق من خطوتين في البداية.',
  create_a_passkey: 'إنشاء مفتاح المرور',
  create_passkey_description:
    'سجل مفتاح المرور الخاص بك باستخدام بيومتريات الجهاز أو مفاتيح الأمان (مثل YubiKey) أو الأساليب المتاحة الأخرى.',
  try_another_verification_method: 'جرب طريقة أخرى للتحقق',
  verify_via_passkey: 'التحقق عبر مفتاح المرور',
  verify_via_passkey_description:
    'استخدم مفتاح المرور للتحقق من خلال كلمة المرور الخاصة بجهازك أو البيومتريات ، أو مسح رمز الاستجابة السريعة ، أو استخدام مفتاح الأمان USB مثل YubiKey.',
  secret_key_copied: 'تم نسخ المفتاح السري.',
  backup_code_copied: 'تم نسخ رمز النسخ الاحتياطي.',
  webauthn_not_ready: 'WebAuthn غير جاهز حاليًا. يرجى المحاولة مرة أخرى لاحقًا.',
  webauthn_not_supported: 'WebAuthn غير مدعوم في هذا المتصفح.',
  webauthn_failed_to_create: 'فشل في الإنشاء. يرجى المحاولة مرة أخرى.',
  webauthn_failed_to_verify: 'فشل التحقق. يرجى المحاولة مرة أخرى.',
};

export default Object.freeze(mfa);
