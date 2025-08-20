const sign_in_experiences = {
  empty_content_url_of_terms_of_use:
    'عنوان URL لمحتوى "شروط الاستخدام" فارغ. يرجى إضافة عنوان URL للمحتوى إذا تم تمكين "شروط الاستخدام".',
  empty_social_connectors:
    'الموصلات الاجتماعية فارغة. يرجى إضافة الموصلات الاجتماعية الممكّنة عند تمكين طريقة تسجيل الدخول الاجتماعية.',
  enabled_connector_not_found: 'لم يتم العثور على موصل {{type}} الممكّن.',
  not_one_and_only_one_primary_sign_in_method:
    'يجب أن يكون هناك طريقة واحدة وفقط لتسجيل الدخول الأساسية. يرجى التحقق من المدخلات الخاصة بك.',
  username_requires_password: 'يجب تمكين تعيين كلمة مرور لمعرف تسجيل الدخول باسم المستخدم.',
  passwordless_requires_verify: 'يجب تمكين التحقق لمعرف تسجيل الدخول بالبريد الإلكتروني / الهاتف.',
  miss_sign_up_identifier_in_sign_in: 'يجب أن تحتوي طرق تسجيل الدخول على معرف التسجيل.',
  password_sign_in_must_be_enabled:
    'يجب تمكين تسجيل الدخول بكلمة المرور عندما يكون تعيين كلمة المرور مطلوبًا في التسجيل.',
  code_sign_in_must_be_enabled:
    'يجب تمكين تسجيل الدخول برمز التحقق عندما لا يكون تعيين كلمة المرور مطلوبًا في التسجيل.',
  unsupported_default_language: 'هذه اللغة - {{language}} غير مدعومة في الوقت الحالي.',
  at_least_one_authentication_factor: 'يجب عليك تحديد عامل مصادقة واحد على الأقل.',
  backup_code_cannot_be_enabled_alone: 'لا يمكن تمكين رمز النسخ الاحتياطي بمفرده.',
  duplicated_mfa_factors: 'عوامل MFA مكررة.',
  email_verification_code_cannot_be_used_for_mfa:
    'لا يمكن استخدام رمز التحقق من البريد الإلكتروني للمصادقة متعددة العوامل عندما يتم تمكين التحقق من البريد الإلكتروني لتسجيل الدخول.',
  phone_verification_code_cannot_be_used_for_mfa:
    'لا يمكن استخدام رمز التحقق عبر الرسائل القصيرة للمصادقة متعددة العوامل عندما يتم تمكين التحقق عبر الرسائل القصيرة لتسجيل الدخول.',
  email_verification_code_cannot_be_used_for_sign_in:
    'لا يمكن استخدام رمز التحقق من البريد الإلكتروني لتسجيل الدخول عندما يتم تمكينه للمصادقة متعددة العوامل.',
  phone_verification_code_cannot_be_used_for_sign_in:
    'لا يمكن استخدام رمز التحقق عبر الرسائل القصيرة لتسجيل الدخول عندما يتم تمكينه للمصادقة متعددة العوامل.',
  duplicated_sign_up_identifiers: 'تم اكتشاف معرفات تسجيل مكررة.',
  missing_sign_up_identifiers: 'لا يمكن أن يكون معرف التسجيل الأساسي فارغًا.',
  invalid_custom_email_blocklist_format:
    'عناصر قائمة البريد الإلكتروني المحظورة المخصصة غير صالحة: {{items, list(type:conjunction)}}. يجب أن يكون كل عنصر عنوان بريد إلكتروني أو نطاق بريد إلكتروني صالحًا، مثلاً، foo@example.com أو @example.com.',
  forgot_password_method_requires_connector:
    'طريقة استرداد كلمة المرور تتطلب تكوين موصل {{method}} ملائم.',
};

export default Object.freeze(sign_in_experiences);
